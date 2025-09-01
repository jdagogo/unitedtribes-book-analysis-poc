import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

export interface ProcessedBook {
  id: string;
  title: string;
  author: string;
  fullText: string;
  chapters: ProcessedChapter[];
  wordCount: number;
  processedAt: string;
  audioDuration: number;
  youtubeUrl: string;
}

export interface ProcessedChapter {
  id: string;
  number: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  startTime: number;
  endTime: number;
  keyEntities: string[];
}

export async function processAuthenticMerleHaggardBook(): Promise<ProcessedBook> {
  console.log(`📚 Processing authentic Merle Haggard text with advanced chapter division...`);
  
  // Step 1: Load the text file
  const attachedDir = path.join(process.cwd(), 'attached_assets');
  const files = await fs.readdir(attachedDir);
  
  const textFiles = files.filter(file => 
    file.endsWith('.txt') && (
      file.toLowerCase().includes('merle') ||
      file.toLowerCase().includes('haggard') ||
      file.toLowerCase().includes('house') ||
      file.toLowerCase().includes('memories')
    )
  );

  if (textFiles.length === 0) {
    throw new Error("No Merle Haggard text files found");
  }

  const textFile = textFiles[0];
  const textPath = path.join(attachedDir, textFile);
  const rawText = await fs.readFile(textPath, 'utf-8');
  
  console.log(`✅ Loaded: ${textFile} (${rawText.length} characters)`);

  // Step 2: Clean the text
  const cleanedText = rawText
    .replace(/^# Swell AI Transcript:.*$/gm, '')
    .replace(/^SPEAKER_\d+:\s*/gm, '')
    .replace(/Harper Audio presents.*?read by Merle Haggard\.\s*/g, '')
    .trim();

  console.log(`🧹 Cleaned text: ${cleanedText.length} characters`);

  // Step 3: Get YouTube duration
  let audioDuration = 16587; // Default: 276 minutes
  const youtubeUrl = 'https://youtu.be/PSN8N2v4oq0';
  
  try {
    const ytInfoProcess = spawn('yt-dlp', [
      '--print', '%(duration)s',
      '--no-download',
      youtubeUrl
    ]);

    const ytInfo = await new Promise<string>((resolve, reject) => {
      let output = '';
      
      ytInfoProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      ytInfoProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`yt-dlp failed with code ${code}`));
        }
      });
    });

    audioDuration = parseInt(ytInfo) || 16587;
    console.log(`📊 YouTube duration: ${Math.floor(audioDuration / 60)}:${audioDuration % 60}`);
  } catch (error) {
    console.warn(`⚠️ Using default duration: ${Math.floor(audioDuration / 60)} minutes`);
  }

  // Step 4: Intelligent chapter division based on content analysis
  const chapters = await divideIntoChapters(cleanedText, audioDuration);
  
  console.log(`✅ Created ${chapters.length} chapters from authentic content`);

  return {
    id: `book_merle_authentic_${Date.now()}`,
    title: "My House of Memories: For the Record",
    author: "Merle Haggard with Tom Carter",
    fullText: cleanedText,
    chapters,
    wordCount: cleanedText.split(/\s+/).length,
    processedAt: new Date().toISOString(),
    audioDuration,
    youtubeUrl
  };
}

async function divideIntoChapters(text: string, totalDuration: number): Promise<ProcessedChapter[]> {
  // Split text into logical sections based on content analysis
  const sections = identifyNaturalBreaks(text);
  const chapters: ProcessedChapter[] = [];
  
  // Calculate timing for each chapter
  const timePerChapter = totalDuration / sections.length;
  
  sections.forEach((section, index) => {
    const startTime = Math.floor(index * timePerChapter);
    const endTime = Math.floor((index + 1) * timePerChapter);
    
    chapters.push({
      id: `ch${index + 1}`,
      number: index + 1,
      title: section.title,
      content: section.content,
      summary: generateSummary(section.content),
      wordCount: section.content.split(/\s+/).length,
      startTime,
      endTime,
      keyEntities: extractKeyEntities(section.content)
    });
  });

  return chapters;
}

function identifyNaturalBreaks(text: string): Array<{title: string, content: string}> {
  const sections = [];
  
  // Find major narrative breaks in the text
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 100);
  
  // Define story markers that indicate chapter breaks
  const chapterMarkers = [
    { 
      keywords: ['blessed life', 'Welcome to my world', 'Enter through the gate'],
      title: 'Introduction: Welcome to My World',
      priority: 1
    },
    {
      keywords: ['Lake Shasta', 'houseboat', 'Silverthorne Resort', 'party to end all parties'],
      title: 'The Houseboat Years: Lake Shasta Decadence',
      priority: 2
    },
    {
      keywords: ['born April 6, 1937', 'boxcar', 'Bakersfield', 'Oildale'],
      title: 'Early Life: Born in a Boxcar',
      priority: 3
    },
    {
      keywords: ['Dad', 'father died', '1946', 'prayer meeting', 'stroke'],
      title: 'Loss of Innocence: Father\'s Death',
      priority: 4
    },
    {
      keywords: ['reform school', 'juvenile', 'trouble', 'running away'],
      title: 'Troubled Youth: Running Wild',
      priority: 5
    },
    {
      keywords: ['San Quentin', 'prison', 'Johnny Cash', 'behind bars'],
      title: 'San Quentin: Finding Music Behind Bars',
      priority: 6
    },
    {
      keywords: ['music', 'Bakersfield Sound', 'recording', 'first records'],
      title: 'Musical Awakening: The Bakersfield Sound',
      priority: 7
    },
    {
      keywords: ['success', 'number one', 'Grammy', 'Entertainer of the Year'],
      title: 'Rise to Fame: Country Music Success',
      priority: 8
    }
  ];

  let remainingText = text;
  let usedContent = new Set<string>();

  // Extract chapters in order
  chapterMarkers.forEach(marker => {
    const relevantParagraphs = paragraphs.filter(p => {
      const lowerP = p.toLowerCase();
      return marker.keywords.some(keyword => lowerP.includes(keyword.toLowerCase())) &&
             !usedContent.has(p);
    });

    if (relevantParagraphs.length > 0) {
      const chapterContent = relevantParagraphs.slice(0, 3).join('\n\n');
      sections.push({
        title: marker.title,
        content: chapterContent
      });
      
      relevantParagraphs.forEach(p => usedContent.add(p));
    }
  });

  // Add any remaining significant content as final chapters
  const unusedParagraphs = paragraphs.filter(p => !usedContent.has(p));
  if (unusedParagraphs.length > 0) {
    const remainingChunks = chunkArray(unusedParagraphs, 3);
    remainingChunks.forEach((chunk, index) => {
      sections.push({
        title: `Later Years: Part ${index + 1}`,
        content: chunk.join('\n\n')
      });
    });
  }

  return sections;
}

function generateSummary(content: string): string {
  // Extract first few sentences as summary
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 2).join('. ') + '.';
}

function extractKeyEntities(content: string): string[] {
  const entities = new Set<string>();
  
  // Extract proper nouns and significant terms
  const words = content.split(/\s+/);
  words.forEach(word => {
    const cleaned = word.replace(/[^\w]/g, '');
    if (cleaned.length > 2 && /^[A-Z]/.test(cleaned)) {
      entities.add(cleaned);
    }
  });

  // Add specific known entities
  const knownEntities = [
    'Merle Haggard', 'Johnny Cash', 'San Quentin', 'Bakersfield', 'Oildale',
    'Lake Shasta', 'Freddy Powers', 'James Haggard', 'Teresa', 'Buck Owens'
  ];

  knownEntities.forEach(entity => {
    if (content.toLowerCase().includes(entity.toLowerCase())) {
      entities.add(entity);
    }
  });

  return Array.from(entities).slice(0, 10); // Limit to top 10 entities
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}