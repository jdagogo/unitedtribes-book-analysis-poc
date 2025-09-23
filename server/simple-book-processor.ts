import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";

export interface SimpleBookResult {
  id: string;
  title: string;
  author: string;
  fullText: string;
  chapters: SimpleChapter[];
  wordCount: number;
  processedAt: string;
  audioDuration: number;
}

export interface SimpleChapter {
  id: string;
  number: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  startTime: number;
  endTime: number;
}

export async function processMerleHaggardBookSimple(): Promise<SimpleBookResult> {
  console.log(`📚 Processing Merle Haggard book with simple approach...`);
  
  // Step 1: Find and load the text file
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
  const bookText = await fs.readFile(textPath, 'utf-8');
  
  console.log(`✅ Loaded: ${textFile} (${bookText.length} characters)`);

  // Step 2: Get YouTube duration
  let audioDuration = 16587; // Default: 276 minutes * 60 = 16,587 seconds
  
  try {
    const ytInfoProcess = spawn('yt-dlp', [
      '--print', '%(duration)s',
      '--no-download',
      'https://youtu.be/PSN8N2v4oq0'
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

  // Step 3: Clean the text and break into logical chapters
  const cleanedText = bookText
    .replace(/^# Swell AI Transcript:.*$/gm, '')
    .replace(/^SPEAKER_\d+:\s*/gm, '')
    .replace(/Harper Audio presents.*?read by Merle Haggard\.\s*/g, '')
    .trim();

  // Step 4: Create chapters based on natural story breaks
  const chapters = createChaptersFromText(cleanedText, audioDuration);
  
  console.log(`✅ Created ${chapters.length} chapters`);

  return {
    id: `book_merle_${Date.now()}`,
    title: "My House of Memories: For the Record",
    author: "Merle Haggard with Tom Carter",
    fullText: cleanedText,
    chapters,
    wordCount: cleanedText.split(/\s+/).length,
    processedAt: new Date().toISOString(),
    audioDuration
  };
}

function createChaptersFromText(text: string, totalDuration: number): SimpleChapter[] {
  // Split text into paragraphs and group into chapters
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  
  // Define approximate chapter breaks based on content analysis
  const chapterData = [
    { title: "Early Childhood in Oildale", keywords: ["born", "boxcar", "childhood", "Bakersfield"], start: 0 },
    { title: "Father's Death and Family Crisis", keywords: ["Dad", "prayer meeting", "stroke", "funeral"], start: 0.12 },
    { title: "Troubled Youth and Rebellion", keywords: ["runaway", "reform school", "trouble", "police"], start: 0.25 },
    { title: "San Quentin and Prison Years", keywords: ["San Quentin", "prison", "Johnny Cash", "convict"], start: 0.4 },
    { title: "Musical Awakening", keywords: ["music", "guitar", "songs", "writing"], start: 0.55 },
    { title: "Early Career and Bakersfield Sound", keywords: ["recording", "Nashville", "Bakersfield", "success"], start: 0.7 },
    { title: "Fame and Personal Struggles", keywords: ["hit records", "tours", "marriage", "alcohol"], start: 0.85 }
  ];

  const chapters: SimpleChapter[] = [];
  
  chapterData.forEach((chapterInfo, index) => {
    const startTime = Math.floor(totalDuration * chapterInfo.start);
    const endTime = index < chapterData.length - 1 ? 
      Math.floor(totalDuration * chapterData[index + 1].start) : 
      totalDuration;
    
    // Find relevant paragraphs for this chapter
    const relevantParagraphs = paragraphs.filter(p => 
      chapterInfo.keywords.some(keyword => 
        p.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    // If no specific matches, take a portion of the text
    const chapterContent = relevantParagraphs.length > 0 ? 
      relevantParagraphs.slice(0, 3).join('\n\n') :
      paragraphs.slice(
        Math.floor(index * paragraphs.length / chapterData.length),
        Math.floor((index + 1) * paragraphs.length / chapterData.length)
      ).join('\n\n');
    
    chapters.push({
      id: `ch${index + 1}`,
      number: index + 1,
      title: chapterInfo.title,
      content: chapterContent.substring(0, 2000) + '...', // Limit content length
      summary: generateSimpleSummary(chapterInfo.title, chapterContent),
      wordCount: chapterContent.split(/\s+/).length,
      startTime,
      endTime
    });
  });

  return chapters;
}

function generateSimpleSummary(title: string, content: string): string {
  const firstSentences = content.split('.').slice(0, 2).join('.') + '.';
  return `${title}: ${firstSentences}`.substring(0, 200) + '...';
}