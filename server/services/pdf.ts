import fs from 'fs';
import { spawn } from 'child_process';
import path from 'path';

export interface PDFExtractionResult {
  text: string;
  pages: number;
  title?: string;
  author?: string;
  subject?: string;
  producer?: string;
  creator?: string;
  creationDate?: Date;
}

export async function extractTextFromPDF(filePath: string): Promise<PDFExtractionResult> {
  try {
    console.log(`Starting PDF text extraction from: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`PDF file not found: ${filePath}`);
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`PDF file size: ${fileStats.size} bytes`);
    
    // Use child process to avoid tsx module loading issues
    const workerPath = path.join(process.cwd(), 'server', 'pdf-worker.cjs');
    
    return new Promise((resolve, reject) => {
      const child = spawn('node', [workerPath, filePath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(stdout.trim());
            console.log(`PDF extraction completed. Pages: ${result.pages}, Text length: ${result.text.length}`);
            
            resolve({
              text: result.text,
              pages: result.pages,
              title: result.title,
              author: result.author,
              subject: result.subject,
              producer: result.producer,
              creator: result.creator,
              creationDate: undefined, // Keep it simple for now
            });
          } catch (parseError) {
            reject(new Error(`Failed to parse PDF extraction result: ${parseError.message}`));
          }
        } else {
          reject(new Error(`PDF extraction failed: ${stderr || 'Unknown error'}`));
        }
      });
      
      child.on('error', (error) => {
        reject(new Error(`Failed to spawn PDF worker: ${error.message}`));
      });
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function validatePDFText(text: string): { isValid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'PDF contains no extractable text' };
  }
  
  if (text.length < 100) {
    return { isValid: false, error: 'PDF text too short (less than 100 characters)' };
  }
  
  // Check if it's mostly readable text (not mostly symbols/gibberish)
  const readableChars = text.match(/[a-zA-Z0-9\s.,!?]/g)?.length || 0;
  const readabilityRatio = readableChars / text.length;
  
  if (readabilityRatio < 0.7) {
    return { isValid: false, error: 'PDF text appears to be corrupted or contains mostly non-readable characters' };
  }
  
  return { isValid: true };
}

export function extractMetadataFromPDFText(text: string): { title?: string; showName?: string; duration?: number } {
  const lines = text.split('\n').slice(0, 20); // Check first 20 lines for metadata
  let title: string | undefined;
  let showName: string | undefined;
  let duration: number | undefined;

  for (const line of lines) {
    const cleanLine = line.trim();
    
    // Look for episode title patterns
    if (!title && (cleanLine.includes('Episode:') || cleanLine.includes('Title:') || cleanLine.match(/^Episode \d+/))) {
      title = cleanLine.replace(/^(Episode:?|Title:?)\s*/i, '').trim();
    }
    
    // Look for show name patterns
    if (!showName && (cleanLine.includes('Show:') || cleanLine.includes('Podcast:') || cleanLine.includes('Series:'))) {
      showName = cleanLine.replace(/^(Show:?|Podcast:?|Series:?)\s*/i, '').trim();
    }
    
    // Look for duration patterns
    if (!duration && cleanLine.match(/duration|length|runtime/i)) {
      const durationMatch = cleanLine.match(/(\d+)\s*min/i);
      if (durationMatch) {
        duration = parseInt(durationMatch[1]);
      }
    }
    
    // Alternative patterns - look for structured headers
    if (!title && cleanLine.length > 5 && cleanLine.length < 100 && !cleanLine.includes('http') && 
        (cleanLine.includes('#') || cleanLine.match(/^[A-Z][^.]*$/))) {
      title = cleanLine.replace(/^#+\s*/, '').trim();
    }
  }

  // Fallback: extract potential title from first substantial line
  if (!title) {
    const firstSubstantialLine = lines.find(line => 
      line.trim().length > 10 && 
      line.trim().length < 150 && 
      !line.includes('http') &&
      !line.match(/^\d+$/) &&
      !line.includes('©')
    );
    if (firstSubstantialLine) {
      title = firstSubstantialLine.trim();
    }
  }

  return { title, showName, duration };
}

export function cleanPDFText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove page breaks and form feeds
    .replace(/[\f\r]/g, ' ')
    // Remove excessive line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim();
}