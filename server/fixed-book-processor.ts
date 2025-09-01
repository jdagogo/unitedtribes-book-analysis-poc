import fs from "fs/promises";
import path from "path";

export interface FixedBook {
  id: string;
  title: string;
  author: string;
  fullText: string;
  chapters: FixedChapter[];
  totalWords: number;
  processedAt: string;
  audioDuration: number;
  youtubeUrl: string;
  searchIndex: any;
}

export interface FixedChapter {
  id: string;
  number: number;
  title: string;
  content: string;
  summary: string;
  wordCount: number;
  startTime: number;
  endTime: number;
  keyEntities: string[];
  keyTopics: string[];
  characterOffset: number;
}

export async function processFixedMerleHaggardBook(): Promise<FixedBook> {
  console.log(`📚 Processing Merle Haggard book with proper chapter division...`);
  
  // Load the authentic text file
  const attachedDir = path.join(process.cwd(), 'attached_assets');
  const textFile = 'Merle Haggard My House of Memories_1754428972881.txt';
  const textPath = path.join(attachedDir, textFile);
  const rawText = await fs.readFile(textPath, 'utf-8');
  
  console.log(`✅ Loaded authentic text: ${rawText.length} characters`);

  // Clean the text
  const cleanedText = cleanTranscriptText(rawText);
  const totalWords = cleanedText.split(/\s+/).length;
  
  console.log(`🧹 Cleaned text: ${totalWords} words`);

  // YouTube audiobook details (with timestamp for proper start)
  const audioDuration = 16587; // 4 hours 36 minutes 27 seconds
  const youtubeUrl = 'https://www.youtube.com/watch?v=PSN8N2v4oq0&t=946s';

  // Create proper chapters with actual content
  const chapters = createProperChapters(cleanedText, audioDuration);
  
  console.log(`✅ Created ${chapters.length} chapters with authentic content`);

  return {
    id: `book_merle_fixed_${Date.now()}`,
    title: "My House of Memories: For the Record",
    author: "Merle Haggard with Tom Carter",
    fullText: cleanedText,
    chapters,
    totalWords,
    processedAt: new Date().toISOString(),
    audioDuration,
    youtubeUrl,
    searchIndex: {}
  };
}

function cleanTranscriptText(rawText: string): string {
  return rawText
    .replace(/SPEAKER_\d+:/g, '') // Remove speaker labels
    .replace(/# Swell AI Transcript:.*?\n/g, '') // Remove header
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function createProperChapters(fullText: string, audioDuration: number): FixedChapter[] {
  console.log(`🔍 Creating proper chapters from ${fullText.length} characters...`);
  
  // Split text into meaningful paragraphs
  const paragraphs = fullText.split(/\.\s+/).filter(p => p.trim().length > 50);
  console.log(`📝 Found ${paragraphs.length} paragraphs`);
  
  // Create 8-10 chapters with substantial content
  const targetChapters = 8;
  const paragraphsPerChapter = Math.floor(paragraphs.length / targetChapters);
  const timePerCharacter = audioDuration / fullText.length;
  
  const chapters: FixedChapter[] = [];
  let currentOffset = 0;
  
  for (let i = 0; i < targetChapters; i++) {
    const startIdx = i * paragraphsPerChapter;
    const endIdx = i === targetChapters - 1 ? paragraphs.length : (i + 1) * paragraphsPerChapter;
    
    const chapterParagraphs = paragraphs.slice(startIdx, endIdx);
    const chapterContent = chapterParagraphs.join('. ').trim() + '.';
    
    if (chapterContent.length < 100) continue; // Skip very short chapters
    
    const chapterNumber = i + 1;
    const startTime = Math.floor(currentOffset * timePerCharacter);
    const endTime = Math.floor((currentOffset + chapterContent.length) * timePerCharacter);
    
    chapters.push({
      id: `chapter-${chapterNumber}`,
      number: chapterNumber,
      title: generateChapterTitle(chapterContent, chapterNumber),
      content: chapterContent,
      summary: generateChapterSummary(chapterContent),
      wordCount: chapterContent.split(/\s+/).length,
      startTime,
      endTime,
      keyEntities: extractEntities(chapterContent),
      keyTopics: extractTopics(chapterContent),
      characterOffset: currentOffset
    });
    
    currentOffset += chapterContent.length;
    console.log(`✅ Chapter ${chapterNumber}: ${chapterContent.length} chars, ${chapterContent.split(/\s+/).length} words`);
  }
  
  return chapters;
}

function generateChapterTitle(content: string, chapterNumber: number): string {
  const lowerContent = content.toLowerCase();
  
  // Generate titles based on content analysis
  if (lowerContent.includes('blessed life') || lowerContent.includes('welcome to my world')) {
    return `Chapter ${chapterNumber}: Welcome to My World`;
  }
  if (lowerContent.includes('lake shasta') || lowerContent.includes('boat')) {
    return `Chapter ${chapterNumber}: The Lake Shasta Years`;
  }
  if (lowerContent.includes('born') || lowerContent.includes('boxcar')) {
    return `Chapter ${chapterNumber}: Born in a Boxcar`;
  }
  if (lowerContent.includes('dad') && lowerContent.includes('died')) {
    return `Chapter ${chapterNumber}: Losing My Father`;
  }
  if (lowerContent.includes('prison') || lowerContent.includes('san quentin')) {
    return `Chapter ${chapterNumber}: Prison Years`;
  }
  if (lowerContent.includes('music') || lowerContent.includes('recording')) {
    return `Chapter ${chapterNumber}: Musical Journey`;
  }
  if (lowerContent.includes('wife') || lowerContent.includes('marriage')) {
    return `Chapter ${chapterNumber}: Love and Marriage`;
  }
  if (lowerContent.includes('success') || lowerContent.includes('number one')) {
    return `Chapter ${chapterNumber}: Rise to Fame`;
  }
  
  return `Chapter ${chapterNumber}: Life's Journey`;
}

function generateChapterSummary(content: string): string {
  // Extract first few meaningful sentences
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keySentences = sentences
    .slice(0, 2)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return keySentences.join('. ') + '.';
}

function extractEntities(content: string): string[] {
  const entities = new Set<string>();
  
  // Known entities from Merle Haggard's life
  const knownEntities = [
    'Merle Haggard', 'Johnny Cash', 'San Quentin', 'Bakersfield', 'Oildale',
    'Lake Shasta', 'Freddy Powers', 'James Haggard', 'Teresa', 'Buck Owens',
    'Lefty Frizzell', 'Bonnie Owens', 'Leona Williams', 'Clint Eastwood',
    'Ronald Reagan', 'Kern County', 'Oklahoma', 'California', 'Silverthorne Resort',
    'Capitol Records', 'Grammy', 'Country Music Association', 'White House'
  ];

  knownEntities.forEach(entity => {
    if (content.toLowerCase().includes(entity.toLowerCase())) {
      entities.add(entity);
    }
  });

  return Array.from(entities).slice(0, 10);
}

function extractTopics(content: string): string[] {
  const topics = new Set<string>();
  const lowerContent = content.toLowerCase();
  
  const topicKeywords = {
    'Prison Life': ['prison', 'san quentin', 'jail', 'inmate'],
    'Music Career': ['music', 'song', 'album', 'recording'],
    'Family': ['dad', 'father', 'mother', 'family'],
    'Childhood': ['childhood', 'boy', 'young', 'boxcar'],
    'Success': ['success', 'fame', 'number one', 'hit'],
    'Personal Struggles': ['trouble', 'drunk', 'problems'],
    'Relationships': ['love', 'marriage', 'wife'],
    'California': ['california', 'bakersfield', 'oildale'],
    'Country Music': ['country', 'honky-tonk']
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      topics.add(topic);
    }
  });

  return Array.from(topics);
}