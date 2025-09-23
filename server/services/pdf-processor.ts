import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { extractEntitiesFromText } from './entity-extractor';
import { extractMediaDiscoveryEntities, groupEntitiesByDiscovery, getTopDiscoverableEntities } from './media-discovery-extractor';
import { analyzeTranscriptContent } from './transcript-analyzer';
import { progressTracker, ProgressEventType } from './progress-tracker';

interface ProcessedPDF {
  id: string;
  title: string;
  source: string;
  fileSize: number;
  fileSizeFormatted: string;
  uploadDate: string;
  processingTime: number;
  wordCount: number;
  estimatedPages: number;
  processingStatus: 'completed' | 'failed' | 'processing';
  entityCount: number;
  creativeEntityCount: number;
  entityBreakdown?: {
    creativeWorks: number;
    creativePeople: number;
    creativeOrganizations: number;
    places: number;
    events: number;
    other: number;
  };
  analysisComplete: boolean;
  cleanText: string;
  metadata: any;
  analysis?: any;
  entities?: any[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 100);
}

function cleanPDFText(text: string): string {
  // Remove common PDF artifacts
  let cleanText = text
    // Remove page numbers (common patterns)
    .replace(/^\d+$/gm, '')
    .replace(/^Page \d+.*$/gmi, '')
    .replace(/\d+\s*of\s*\d+/gi, '')
    // Remove headers/footers (if repeated)
    .replace(/^(.{0,100})\n\1{2,}/gm, '$1')
    // Fix spacing issues
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    // Remove excess newlines but preserve paragraphs
    .replace(/\n{3,}/g, '\n\n')
    // Clean up hyphenated words at line breaks
    .replace(/(\w+)-\n(\w+)/g, '$1$2')
    // Trim lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove empty lines at start and end
    .trim();

  return cleanText;
}

export async function processPDFFile(
  filePath: string,
  originalFilename: string,
  options: {
    extractEntities?: boolean;
    generateAnalysis?: boolean;
    saveToFolder?: boolean;
    sessionId?: string;
    progressStore?: any;
  } = {}
): Promise<ProcessedPDF> {
  const startTime = Date.now();
  const { sessionId, progressStore: store } = options;
  console.log(`📂 Processing PDF file: ${filePath}`);
  
  try {
    // Emit text extraction start event
    if (sessionId) {
      progressTracker.emitProgress({
        type: ProgressEventType.TEXT_EXTRACTION_START,
        sessionId,
        timestamp: Date.now(),
        message: 'Starting text extraction',
        data: { totalPages: 0 }
      });
    }
    
    // Dynamically import pdf-parse to avoid initialization issues
    console.log(`📦 Loading PDF parser...`);
    const pdf = (await import('pdf-parse')).default;
    
    // Read PDF file
    console.log(`📖 Reading PDF file...`);
    const dataBuffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);
    console.log(`📊 File size: ${stats.size} bytes`);
    
    // Parse PDF
    console.log(`🔍 Parsing PDF content...`);
    const pdfData = await pdf(dataBuffer);
    console.log(`📄 PDF pages: ${pdfData.numpages || 'unknown'}`);
    console.log(`📝 Raw text length: ${pdfData.text.length} characters`);
    
    // Emit text extraction progress
    if (sessionId && pdfData.numpages) {
      progressTracker.emitProgress(progressTracker.createTextExtractionProgressEvent(
        sessionId,
        pdfData.numpages,
        pdfData.numpages,
        pdfData.text.length
      ));
    }
    
    // Clean extracted text
    console.log(`🧹 Cleaning PDF text...`);
    const cleanText = cleanPDFText(pdfData.text);
    console.log(`✨ Clean text length: ${cleanText.length} characters`);
    
    // Update progress store if available
    if (store && sessionId) {
      store.updateProgress(sessionId, {
        currentStep: 3,
        totalSteps: 5,
        stepName: 'analyzing',
        message: 'Analyzing content and extracting entities...',
        progress: 50,
        details: {
          wordCount: cleanText.split(/\s+/).filter(w => w.length > 0).length
        }
      });
    }
    
    // Emit text extraction complete
    if (sessionId) {
      progressTracker.emitProgress({
        type: ProgressEventType.TEXT_EXTRACTION_COMPLETE,
        sessionId,
        timestamp: Date.now(),
        message: 'Text extraction complete',
        data: {
          totalPages: pdfData.numpages || 0,
          totalText: cleanText.length,
          duration: Date.now() - startTime
        }
      });
    }
    
    // Calculate metrics
    console.log(`📐 Calculating metrics...`);
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedPages = Math.ceil(wordCount / 250); // Assuming 250 words per page
    console.log(`📊 Word count: ${wordCount}`);
    console.log(`📄 Estimated pages: ${estimatedPages}`);
    
    // Generate ID from filename for consistency
    const baseSlug = sanitizeFilename(originalFilename.replace(/\.pdf$/i, ''));
    // Add timestamp to make it unique if needed
    const slug = baseSlug;
    const id = slug; // Use slug as ID so folder path matches API responses
    
    // Create base metadata
    const processedPDF: ProcessedPDF = {
      id,
      title: originalFilename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
      source: originalFilename,
      fileSize: stats.size,
      fileSizeFormatted: formatFileSize(stats.size),
      uploadDate: new Date().toISOString(),
      processingTime: 0,
      wordCount,
      estimatedPages: pdfData.numpages || estimatedPages,
      processingStatus: 'processing',
      entityCount: 0,
      creativeEntityCount: 0,
      analysisComplete: false,
      cleanText,
      metadata: {
        pdfVersion: pdfData.version,
        info: pdfData.info,
        metadata: pdfData.metadata,
        numpages: pdfData.numpages
      }
    };
    
    // Save to structured folder if requested
    if (options.saveToFolder) {
      const folderPath = path.join(
        process.cwd(),
        'client',
        'public',
        'transcripts',
        slug
      );
      
      // Create folder
      await fs.mkdir(folderPath, { recursive: true });
      
      // Save metadata.json
      const metadataPath = path.join(folderPath, 'metadata.json');
      await fs.writeFile(
        metadataPath,
        JSON.stringify({
          id: processedPDF.id,
          title: processedPDF.title,
          source: processedPDF.source,
          fileSize: processedPDF.fileSize,
          fileSizeFormatted: processedPDF.fileSizeFormatted,
          uploadDate: processedPDF.uploadDate,
          processingTime: processedPDF.processingTime,
          wordCount: processedPDF.wordCount,
          estimatedPages: processedPDF.estimatedPages,
          processingStatus: processedPDF.processingStatus,
          entityCount: processedPDF.entityCount,
          analysisComplete: processedPDF.analysisComplete
        }, null, 2)
      );
      
      // Save transcript.txt
      const transcriptPath = path.join(folderPath, 'transcript.txt');
      await fs.writeFile(transcriptPath, cleanText, 'utf8');
      
      // Generate and save analysis if requested
      if (options.generateAnalysis) {
        try {
          console.log(`🔬 Starting transcript analysis...`);
          const analysisStartTime = Date.now();
          
          // Update progress for analysis
          if (store && sessionId) {
            store.updateProgress(sessionId, {
              currentStep: 3,
              totalSteps: 5,
              stepName: 'analyzing',
              message: 'Analyzing entities and themes...',
              progress: 60,
              details: {
                wordCount: processedPDF.wordCount
              }
            });
          }
          
          const analysis = await analyzeTranscriptContent(cleanText, {
            title: processedPDF.title,
            extractEntities: true,
            generateSummary: true,
            identifyThemes: true
          });
          
          const analysisTime = (Date.now() - analysisStartTime) / 1000;
          console.log(`⏱️ Analysis completed in ${analysisTime.toFixed(2)} seconds`);
          
          // Update progress for analysis complete
          if (store && sessionId) {
            store.updateProgress(sessionId, {
              currentStep: 4,
              totalSteps: 5,
              stepName: 'generating',
              message: 'Generating output files...',
              progress: 75,
              details: {
                entityCount: analysis.entities?.length || 0
              }
            });
          }
          
          processedPDF.analysis = analysis;
          processedPDF.entities = analysis.entities || [];
          processedPDF.entityCount = analysis.entities?.length || 0;
          
          // Count creative entities
          const creativeTypes = ['CreativeWork', 'CreativePerson', 'CreativeOrganization', 'CreativeEvent'];
          const creativeEntities = analysis.entities?.filter((e: any) => 
            creativeTypes.includes(e.type) || e.creativeType
          ) || [];
          processedPDF.creativeEntityCount = creativeEntities.length;
          
          // Create entity breakdown
          processedPDF.entityBreakdown = {
            creativeWorks: analysis.entities?.filter((e: any) => e.type === 'CreativeWork').length || 0,
            creativePeople: analysis.entities?.filter((e: any) => e.type === 'CreativePerson').length || 0,
            creativeOrganizations: analysis.entities?.filter((e: any) => e.type === 'CreativeOrganization').length || 0,
            places: analysis.entities?.filter((e: any) => e.type === 'Place').length || 0,
            events: analysis.entities?.filter((e: any) => e.type === 'CreativeEvent').length || 0,
            other: analysis.entities?.filter((e: any) => 
              !['CreativeWork', 'CreativePerson', 'CreativeOrganization', 'Place', 'CreativeEvent'].includes(e.type)
            ).length || 0
          };
          
          processedPDF.analysisComplete = true;
          
          // Save analysis.md
          const analysisPath = path.join(folderPath, 'analysis.md');
          const analysisMarkdown = generateAnalysisMarkdown(processedPDF, analysis);
          await fs.writeFile(analysisPath, analysisMarkdown, 'utf8');
          
          // Update progress for completion
          if (store && sessionId) {
            store.updateProgress(sessionId, {
              currentStep: 5,
              totalSteps: 5,
              stepName: 'complete',
              message: 'Processing complete!',
              progress: 100,
              details: {
                wordCount: processedPDF.wordCount,
                entityCount: processedPDF.entityCount,
                processingTime: (Date.now() - startTime) / 1000
              }
            });
          }
          
          // Update metadata with analysis results
          await fs.writeFile(
            metadataPath,
            JSON.stringify({
              ...processedPDF,
              cleanText: undefined, // Don't save full text in metadata
              analysis: undefined // Analysis is in separate file
            }, null, 2)
          );
        } catch (error) {
          console.error('Error generating analysis:', error);
          processedPDF.analysisComplete = false;
        }
      }
    }
    
    // Extract entities if requested (without full analysis)
    if (options.extractEntities && !options.generateAnalysis) {
      try {
        const entities = await extractEntitiesFromText(cleanText);
        processedPDF.entityCount = entities.length;
      } catch (error) {
        console.error('Error extracting entities:', error);
      }
    }
    
    // Calculate final processing time
    processedPDF.processingTime = (Date.now() - startTime) / 1000;
    processedPDF.processingStatus = 'completed';
    
    return processedPDF;
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

function generateAnalysisMarkdown(pdf: ProcessedPDF, analysis: any): string {
  const sections = [];
  
  // Header
  sections.push(`# ${pdf.title} - Analysis`);
  sections.push('');
  sections.push(`**Source:** ${pdf.source}`);
  sections.push(`**Word Count:** ${pdf.wordCount.toLocaleString()}`);
  sections.push(`**Pages:** ${pdf.estimatedPages}`);
  sections.push(`**Processed:** ${new Date(pdf.uploadDate).toLocaleDateString()}`);
  sections.push('');
  sections.push('---');
  sections.push('');
  
  // Summary
  if (analysis.summary) {
    sections.push('## Summary');
    sections.push('');
    sections.push(analysis.summary);
    sections.push('');
  }
  
  // Key Themes
  if (analysis.themes && analysis.themes.length > 0) {
    sections.push('## Key Themes');
    sections.push('');
    analysis.themes.forEach((theme: any) => {
      sections.push(`### ${theme.name}`);
      sections.push('');
      sections.push(theme.description || '');
      if (theme.examples && theme.examples.length > 0) {
        sections.push('');
        sections.push('**Examples:**');
        theme.examples.forEach((example: string) => {
          sections.push(`- "${example}"`);
        });
      }
      sections.push('');
    });
  }
  
  // Creative Entity Summary
  if (pdf.creativeEntityCount > 0) {
    sections.push('## Creative Entity Summary');
    sections.push('');
    sections.push(`**Total Creative Entities:** ${pdf.creativeEntityCount} out of ${pdf.entityCount} total entities`);
    sections.push('');
    
    if (pdf.entityBreakdown) {
      sections.push('### Breakdown by Type');
      sections.push('');
      sections.push(`- 🔵 **Creative Works:** ${pdf.entityBreakdown.creativeWorks} (songs, albums, books, films)`);
      sections.push(`- 🟢 **Creative People:** ${pdf.entityBreakdown.creativePeople} (artists, directors, authors)`);
      sections.push(`- 🟠 **Creative Organizations:** ${pdf.entityBreakdown.creativeOrganizations} (labels, studios, venues)`);
      sections.push(`- 🟡 **Places:** ${pdf.entityBreakdown.places} (cities, venues, cultural locations)`);
      sections.push(`- 🟣 **Creative Events:** ${pdf.entityBreakdown.events} (festivals, movements, awards)`);
      sections.push(`- ⚪ **Other:** ${pdf.entityBreakdown.other}`);
      sections.push('');
    }
  }
  
  // Entities
  if (analysis.entities && analysis.entities.length > 0) {
    sections.push('## Entities Extracted');
    sections.push('');
    sections.push(`**Total Entities:** ${analysis.entities.length}`);
    sections.push('');
    
    // Group entities by type with creative priority
    const typeOrder = ['CreativeWork', 'CreativePerson', 'CreativeOrganization', 'Place', 'CreativeEvent'];
    const entityGroups: { [key: string]: any[] } = {};
    
    analysis.entities.forEach((entity: any) => {
      const type = entity.type || 'Other';
      if (!entityGroups[type]) entityGroups[type] = [];
      entityGroups[type].push(entity);
    });
    
    // Display creative entities first
    typeOrder.forEach(type => {
      if (entityGroups[type]) {
        const emoji = {
          'CreativeWork': '🔵',
          'CreativePerson': '🟢',
          'CreativeOrganization': '🟠',
          'Place': '🟡',
          'CreativeEvent': '🟣'
        }[type] || '⚪';
        
        sections.push(`### ${emoji} ${type} (${entityGroups[type].length})`);
        sections.push('');
        
        entityGroups[type].slice(0, 20).forEach((entity: any) => {
          const mentions = entity.mentions || 1;
          let entityLine = `- **${entity.name}**`;
          
          // Add creative metadata if available
          if (entity.creativeType) {
            entityLine += ` [${entity.creativeType}]`;
          }
          if (entity.releaseYear) {
            entityLine += ` (${entity.releaseYear})`;
          }
          if (entity.role) {
            entityLine += ` - ${entity.role}`;
          }
          
          entityLine += ` (${mentions} mention${mentions > 1 ? 's' : ''})`;
          sections.push(entityLine);
          
          if (entity.context) {
            sections.push(`  - Context: "${entity.context.substring(0, 150)}..."`);
          }
        });
        
        if (entityGroups[type].length > 20) {
          sections.push(`- ... and ${entityGroups[type].length - 20} more`);
        }
        sections.push('');
        
        delete entityGroups[type];
      }
    });
    
    // Display remaining non-creative entities
    Object.entries(entityGroups).forEach(([type, entities]) => {
      sections.push(`### ⚪ ${type} (${entities.length})`);
      sections.push('');
      entities.slice(0, 10).forEach((entity: any) => {
        const mentions = entity.mentions || 1;
        sections.push(`- **${entity.name}** (${mentions} mention${mentions > 1 ? 's' : ''})`);
      });
      if (entities.length > 10) {
        sections.push(`- ... and ${entities.length - 10} more`);
      }
      sections.push('');
    });
  }
  
  // Key Quotes
  if (analysis.quotes && analysis.quotes.length > 0) {
    sections.push('## Key Quotes');
    sections.push('');
    analysis.quotes.slice(0, 10).forEach((quote: any) => {
      sections.push(`> "${quote.text}"`);
      if (quote.speaker) {
        sections.push(`> — ${quote.speaker}`);
      }
      sections.push('');
    });
  }
  
  // Cultural References
  if (analysis.culturalReferences && analysis.culturalReferences.length > 0) {
    sections.push('## Cultural References');
    sections.push('');
    analysis.culturalReferences.forEach((ref: any) => {
      sections.push(`- **${ref.name}**: ${ref.description || ref.context}`);
    });
    sections.push('');
  }
  
  // Cross-Reference Opportunities
  if (analysis.crossReferences && analysis.crossReferences.length > 0) {
    sections.push('## Cross-Reference Opportunities');
    sections.push('');
    sections.push('Potential connections with existing content:');
    sections.push('');
    analysis.crossReferences.forEach((ref: any) => {
      sections.push(`- ${ref.description}`);
    });
    sections.push('');
  }
  
  // Footer
  sections.push('---');
  sections.push('');
  sections.push(`*Generated by United Tribes Audio Interface*`);
  sections.push(`*Processing time: ${pdf.processingTime.toFixed(2)} seconds*`);
  
  return sections.join('\n');
}

export async function processUploadedPDF(
  fileBuffer: Buffer,
  originalFilename: string,
  options: {
    extractEntities?: boolean;
    generateAnalysis?: boolean;
    saveToFolder?: boolean;
    sessionId?: string;
    progressStore?: any;
  } = {}
): Promise<ProcessedPDF> {
  // Create temporary file
  const tempPath = path.join(process.cwd(), 'temp', `upload_${Date.now()}.pdf`);
  await fs.mkdir(path.dirname(tempPath), { recursive: true });
  await fs.writeFile(tempPath, fileBuffer);
  
  try {
    const result = await processPDFFile(tempPath, originalFilename, options);
    return result;
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }
  }
}