import fs from "fs/promises";
import path from "path";

export interface ComprehensiveBook {
  id: string;
  title: string;
  author: string;
  fullText: string;
  chapters: ComprehensiveChapter[];
  totalWords: number;
  processedAt: string;
  audioDuration: number;
  youtubeUrl: string;
  searchIndex: SearchIndex;
}

export interface ComprehensiveChapter {
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

export interface SearchIndex {
  wordToChapters: Map<string, number[]>;
  entityToChapters: Map<string, number[]>;
  topicToChapters: Map<string, number[]>;
}

export async function processCompleteMerleHaggardBook(): Promise<ComprehensiveBook> {
  console.log(`📚 Processing complete Merle Haggard autobiography with full text division...`);
  
  // Load the authentic text file
  const attachedDir = path.join(process.cwd(), 'attached_assets');
  const textFile = 'Merle Haggard My House of Memories_1754428972881.txt';
  const textPath = path.join(attachedDir, textFile);
  const rawText = await fs.readFile(textPath, 'utf-8');
  
  console.log(`✅ Loaded authentic text: ${rawText.length} characters`);

  // Clean and prepare text
  const cleanedText = cleanTranscriptText(rawText);
  const totalWords = cleanedText.split(/\s+/).length;
  
  console.log(`🧹 Cleaned text: ${totalWords} words`);

  // YouTube audiobook details
  const audioDuration = 16587; // 4 hours 36 minutes 27 seconds
  const youtubeUrl = 'https://youtu.be/PSN8N2v4oq0';

  // Systematically divide into comprehensive chapters
  const chapters = createComprehensiveChapters(cleanedText, audioDuration);
  
  // Build searchable index
  const searchIndex = buildSearchIndex(chapters);
  
  console.log(`✅ Created ${chapters.length} comprehensive chapters with full searchability`);

  return {
    id: `book_merle_complete_${Date.now()}`,
    title: "My House of Memories: For the Record",
    author: "Merle Haggard with Tom Carter",
    fullText: cleanedText,
    chapters,
    totalWords,
    processedAt: new Date().toISOString(),
    audioDuration,
    youtubeUrl,
    searchIndex
  };
}

function cleanTranscriptText(rawText: string): string {
  return rawText
    .replace(/^# Swell AI Transcript:.*$/gm, '')
    .replace(/^SPEAKER_\d+:\s*/gm, '')
    .replace(/Harper Audio presents.*?read by Merle Haggard\.\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createComprehensiveChapters(text: string, totalDuration: number): ComprehensiveChapter[] {
  const chapters: ComprehensiveChapter[] = [];
  
  // Define chapter boundaries based on narrative content analysis
  const chapterBreaks = findNarrativeBreaks(text);
  
  chapterBreaks.forEach((chapterData, index) => {
    const startTime = Math.floor((index / chapterBreaks.length) * totalDuration);
    const endTime = Math.floor(((index + 1) / chapterBreaks.length) * totalDuration);
    
    chapters.push({
      id: `chapter-${index + 1}`,
      number: index + 1,
      title: chapterData.title,
      content: chapterData.content,
      summary: generateChapterSummary(chapterData.content),
      wordCount: chapterData.content.split(/\s+/).length,
      startTime,
      endTime,
      keyEntities: extractEntities(chapterData.content),
      keyTopics: extractTopics(chapterData.content),
      characterOffset: chapterData.startOffset
    });
  });

  return chapters;
}

function findNarrativeBreaks(text: string): Array<{title: string, content: string, startOffset: number}> {
  const sections = [];
  
  // Find key narrative markers in the actual text
  const introMatch = text.match(/Harper Audio presents.*?Enter through the gate of my house of memories\./s);
  const birthMatch = text.match(/I was born April 6, 1937.*?That was the natural order of things[^\.]*\./s);
  const fatherDeathMatch = text.match(/In 1946, my world collapsed.*?I was never the same[^\.]*\./s);
  const youthMatch = text.match(/After Dad died.*?reform school/s);
  
  let currentOffset = 0;
  
  // Introduction section
  if (introMatch) {
    sections.push({
      title: "Introduction: Welcome to My World",
      content: introMatch[0],
      startOffset: currentOffset
    });
    currentOffset += introMatch[0].length;
  }
  
  // Lake Shasta years (early part after intro)
  const lakeShastaStart = text.indexOf("People milled nervously");
  const lakeShastaEnd = text.indexOf("I was born April 6, 1937");
  if (lakeShastaStart !== -1 && lakeShastaEnd !== -1) {
    const lakeShastaContent = text.substring(lakeShastaStart, lakeShastaEnd);
    sections.push({
      title: "Chapter 1: The Lake Shasta Years - Living Wild",
      content: lakeShastaContent,
      startOffset: lakeShastaStart
    });
  }
  
  // Early childhood
  if (birthMatch) {
    sections.push({
      title: "Chapter 2: Born in a Boxcar - Early Years",
      content: birthMatch[0],
      startOffset: text.indexOf(birthMatch[0])
    });
  }
  
  // For the rest, split systematically by major life events
  const remainingText = text.substring(birthMatch ? text.indexOf(birthMatch[0]) + birthMatch[0].length : 0);
  const paragraphs = remainingText.split(/\n\s*\n/).filter(p => p.trim().length > 100);
  
  // Group paragraphs into meaningful chapters (aim for 8-12 chapters total)
  const paragraphsPerChapter = Math.max(3, Math.floor(paragraphs.length / 8));
  
  for (let i = 0; i < paragraphs.length; i += paragraphsPerChapter) {
    const chapterParagraphs = paragraphs.slice(i, i + paragraphsPerChapter);
    const chapterContent = chapterParagraphs.join('\n\n');
    const chapterNumber = sections.length + 1;
    
    sections.push({
      title: generateChapterTitle(chapterContent, chapterNumber),
      content: chapterContent,
      startOffset: currentOffset
    });
    currentOffset += chapterContent.length;
  }
  
  return sections;
  
  for (let i = 0; i < paragraphs.length; i += chaptersPerSection) {
    const chapterParagraphs = paragraphs.slice(i, i + chaptersPerSection);
    const content = chapterParagraphs.join('\n\n');
    const title = generateChapterTitle(content, Math.floor(i / chaptersPerSection) + 1);
    
    sections.push({
      title,
      content,
      startOffset: currentOffset
    });
    
    currentOffset += content.length;
  }

  return sections;
}

function generateChapterTitle(content: string, chapterNumber: number): string {
  const lowerContent = content.toLowerCase();
  
  // Identify chapter themes based on content
  if (lowerContent.includes('blessed life') || lowerContent.includes('welcome to my world')) {
    return "Introduction: Welcome to My World";
  }
  if (lowerContent.includes('lake shasta') || lowerContent.includes('houseboat')) {
    return "Chapter 1: The Lake Shasta Years";
  }
  if (lowerContent.includes('born april') || lowerContent.includes('boxcar')) {
    return "Chapter 2: Born in a Boxcar";
  }
  if (lowerContent.includes('dad') && lowerContent.includes('died')) {
    return "Chapter 3: Loss of Innocence";
  }
  if (lowerContent.includes('reform school') || lowerContent.includes('trouble')) {
    return "Chapter 4: Troubled Youth";
  }
  if (lowerContent.includes('san quentin') || lowerContent.includes('prison')) {
    return "Chapter 5: San Quentin Prison";
  }
  if (lowerContent.includes('johnny cash')) {
    return "Chapter 6: Johnny Cash's Influence";
  }
  if (lowerContent.includes('music') || lowerContent.includes('bakersfield')) {
    return "Chapter 7: Musical Awakening";
  }
  if (lowerContent.includes('recording') || lowerContent.includes('success')) {
    return `Chapter 8: Rise to Fame`;
  }
  
  // Generate titles based on prominent themes
  if (lowerContent.includes('wife') || lowerContent.includes('marriage')) {
    return `Chapter ${chapterNumber}: Marriage and Relationships`;
  }
  if (lowerContent.includes('tour') || lowerContent.includes('concert')) {
    return `Chapter ${chapterNumber}: Life on the Road`;
  }
  if (lowerContent.includes('song') || lowerContent.includes('album')) {
    return `Chapter ${chapterNumber}: Musical Journey`;
  }
  
  return `Chapter ${chapterNumber}: Memories and Reflections`;
}

function generateChapterSummary(content: string): string {
  // Extract key sentences for summary
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keySentences = sentences
    .slice(0, 3)
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

  // Extract proper nouns
  const words = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  words.forEach(word => {
    if (word.length > 3 && !word.match(/^(The|And|But|For|With|From)$/)) {
      entities.add(word);
    }
  });

  return Array.from(entities).slice(0, 15);
}

function extractTopics(content: string): string[] {
  const topics = new Set<string>();
  const lowerContent = content.toLowerCase();
  
  // Define topic keywords
  const topicKeywords = {
    'Prison Life': ['prison', 'san quentin', 'jail', 'inmate', 'cell', 'guard'],
    'Music Career': ['music', 'song', 'album', 'recording', 'studio', 'guitar'],
    'Family': ['dad', 'father', 'mother', 'mama', 'wife', 'family', 'marriage'],
    'Childhood': ['childhood', 'boy', 'young', 'school', 'boxcar', 'oildale'],
    'Fame and Success': ['success', 'fame', 'number one', 'hit', 'award', 'grammy'],
    'Personal Struggles': ['trouble', 'drunk', 'drugs', 'cocaine', 'problems'],
    'Relationships': ['love', 'relationship', 'divorce', 'marriage', 'woman'],
    'California Life': ['california', 'bakersfield', 'oildale', 'lake shasta'],
    'Country Music': ['country', 'honky-tonk', 'bakersfield sound', 'opry'],
    'Life Philosophy': ['god', 'faith', 'peace', 'memories', 'reflection']
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      topics.add(topic);
    }
  });

  return Array.from(topics);
}

function buildSearchIndex(chapters: ComprehensiveChapter[]): SearchIndex {
  const wordToChapters = new Map<string, number[]>();
  const entityToChapters = new Map<string, number[]>();
  const topicToChapters = new Map<string, number[]>();

  chapters.forEach(chapter => {
    // Index words
    const words = chapter.content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    words.forEach(word => {
      if (!wordToChapters.has(word)) {
        wordToChapters.set(word, []);
      }
      if (!wordToChapters.get(word)!.includes(chapter.number)) {
        wordToChapters.get(word)!.push(chapter.number);
      }
    });

    // Index entities
    chapter.keyEntities.forEach(entity => {
      const entityKey = entity.toLowerCase();
      if (!entityToChapters.has(entityKey)) {
        entityToChapters.set(entityKey, []);
      }
      entityToChapters.get(entityKey)!.push(chapter.number);
    });

    // Index topics
    chapter.keyTopics.forEach(topic => {
      const topicKey = topic.toLowerCase();
      if (!topicToChapters.has(topicKey)) {
        topicToChapters.set(topicKey, []);
      }
      topicToChapters.get(topicKey)!.push(chapter.number);
    });
  });

  return {
    wordToChapters,
    entityToChapters,
    topicToChapters
  };
}