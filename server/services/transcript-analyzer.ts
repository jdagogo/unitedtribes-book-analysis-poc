import { extractEntitiesFromText, extractThemes } from './entity-extractor';
import { extractMediaDiscoveryEntities, groupEntitiesByDiscovery } from './media-discovery-extractor';

interface AnalysisOptions {
  title?: string;
  extractEntities?: boolean;
  generateSummary?: boolean;
  identifyThemes?: boolean;
  extractQuotes?: boolean;
  findCulturalReferences?: boolean;
}

interface TranscriptAnalysis {
  summary?: string;
  themes?: Array<{
    name: string;
    description?: string;
    examples?: string[];
    score?: number;
  }>;
  entities?: Array<{
    name: string;
    type: string;
    category: string;
    mentions: number;
    context: string;
    importance: number;
  }>;
  quotes?: Array<{
    text: string;
    speaker?: string;
    context?: string;
  }>;
  culturalReferences?: Array<{
    name: string;
    description?: string;
    context: string;
  }>;
  crossReferences?: Array<{
    description: string;
    entityName?: string;
    connectionType?: string;
  }>;
  statistics?: {
    totalWords: number;
    totalSentences: number;
    averageWordsPerSentence: number;
    uniqueWords: number;
    readingLevel: string;
  };
}

export async function analyzeTranscriptContent(
  text: string,
  options: AnalysisOptions = {}
): Promise<TranscriptAnalysis> {
  const analysis: TranscriptAnalysis = {};
  
  console.log(`📊 Starting analysis of ${text.length} characters...`);
  
  // For very large texts, truncate for faster processing
  const MAX_TEXT_LENGTH = 100000; // ~20,000 words
  let processText = text;
  if (text.length > MAX_TEXT_LENGTH) {
    console.log(`⚠️ Text too large (${text.length} chars), truncating to ${MAX_TEXT_LENGTH} for analysis...`);
    processText = text.substring(0, MAX_TEXT_LENGTH);
  }
  
  // Calculate basic statistics
  console.log(`📈 Calculating statistics...`);
  const stats = calculateTextStatistics(text); // Use full text for stats
  analysis.statistics = stats;
  
  // Generate summary
  if (options.generateSummary) {
    console.log(`📝 Generating summary...`);
    analysis.summary = generateSummary(processText, options.title);
  }
  
  // Extract entities (use media discovery extractor for cultural content)
  if (options.extractEntities) {
    console.log(`🏷️ Extracting media discovery entities from ${processText.length} characters...`);
    
    // Use media discovery extractor for "Just Kids" and similar cultural content
    const mediaEntities = extractMediaDiscoveryEntities(text); // Use full text for better accuracy
    
    // Convert to the expected format
    const entities = mediaEntities.map(entity => ({
      name: entity.name,
      type: entity.type,
      category: entity.category,
      mentions: entity.count,
      context: entity.discoveryType,
      importance: entity.confidence,
      creativeType: entity.type
    }));
    
    console.log(`✅ Found ${entities.length} discoverable entities`);
    
    // Log top entities for debugging
    const topEntities = entities.slice(0, 10);
    console.log('🎯 Top discoverable entities:');
    topEntities.forEach(e => {
      console.log(`  - ${e.name} (${e.type}): ${e.mentions} mentions`);
    });
    
    analysis.entities = entities;
  }
  
  // Identify themes
  if (options.identifyThemes) {
    const themeScores = extractThemes(text);
    analysis.themes = themeScores.map(theme => ({
      name: theme.name,
      score: theme.score,
      description: generateThemeDescription(theme.name, text),
      examples: findThemeExamples(theme.name, text)
    }));
  }
  
  // Extract quotes
  if (options.extractQuotes) {
    analysis.quotes = extractQuotes(text);
  }
  
  // Find cultural references
  if (options.findCulturalReferences) {
    analysis.culturalReferences = findCulturalReferences(text);
  }
  
  // Generate cross-reference opportunities
  analysis.crossReferences = generateCrossReferences(analysis);
  
  return analysis;
}

function calculateTextStatistics(text: string): TranscriptAnalysis['statistics'] {
  const words = text.split(/\s+/).filter(word => word.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  
  // Simple reading level calculation (Flesch-Kincaid approximation)
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = words.reduce((sum, word) => sum + countSyllables(word), 0) / words.length;
  const readingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  let readingLevel = 'College';
  if (readingEase >= 90) readingLevel = 'Elementary';
  else if (readingEase >= 80) readingLevel = 'Middle School';
  else if (readingEase >= 60) readingLevel = 'High School';
  else if (readingEase >= 30) readingLevel = 'College';
  else readingLevel = 'Graduate';
  
  return {
    totalWords: words.length,
    totalSentences: sentences.length,
    averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    uniqueWords: uniqueWords.size,
    readingLevel
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  let count = 0;
  const vowels = 'aeiouy';
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Adjust for silent e
  if (word.endsWith('e')) {
    count--;
  }
  
  // Ensure at least one syllable
  return Math.max(1, count);
}

function generateSummary(text: string, title?: string): string {
  // Extract first few paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  const firstParagraphs = paragraphs.slice(0, 3).join(' ');
  
  // Find key sentences (those with important keywords)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const importantKeywords = ['important', 'significant', 'key', 'main', 'primary', 'essential', 'critical', 'fundamental'];
  
  const keySentences = sentences
    .filter(s => importantKeywords.some(kw => s.toLowerCase().includes(kw)))
    .slice(0, 3);
  
  // Create summary
  let summary = '';
  
  if (title) {
    summary = `This transcript of "${title}" `;
  } else {
    summary = 'This transcript ';
  }
  
  // Analyze content type
  const themes = extractThemes(text);
  if (themes.length > 0) {
    const topThemes = themes.slice(0, 3).map(t => t.name).join(', ');
    summary += `explores themes of ${topThemes}. `;
  }
  
  // Add key points if found
  if (keySentences.length > 0) {
    summary += 'Key points discussed include: ' + keySentences[0].trim() + ' ';
  }
  
  // Add context from beginning
  if (firstParagraphs.length > 100) {
    const excerpt = firstParagraphs.substring(0, 200).trim();
    summary += `The content begins with: "${excerpt}..." `;
  }
  
  return summary.trim();
}

function generateThemeDescription(themeName: string, text: string): string {
  const descriptions: { [key: string]: string } = {
    'Music & Entertainment': 'Discussion of musical experiences, performances, and the entertainment industry',
    'Family & Relationships': 'Exploration of personal relationships, family dynamics, and interpersonal connections',
    'Career & Success': 'Professional journey, achievements, and career development experiences',
    'Personal Journey': 'Life experiences, personal growth, and transformative moments',
    'Culture & Society': 'Cultural observations, societal issues, and community dynamics',
    'Challenges & Struggles': 'Overcoming obstacles, facing adversity, and personal challenges',
    'Art & Creativity': 'Creative processes, artistic expression, and inspiration',
    'Politics & History': 'Political events, historical context, and societal changes'
  };
  
  return descriptions[themeName] || `Discussion related to ${themeName.toLowerCase()}`;
}

function findThemeExamples(themeName: string, text: string): string[] {
  const themeKeywords: { [key: string]: string[] } = {
    'Music & Entertainment': ['music', 'song', 'album', 'concert', 'perform'],
    'Family & Relationships': ['family', 'mother', 'father', 'love', 'marriage'],
    'Career & Success': ['career', 'success', 'work', 'achieve', 'award'],
    'Personal Journey': ['life', 'journey', 'experience', 'memory', 'childhood'],
    'Culture & Society': ['culture', 'society', 'community', 'tradition', 'people'],
    'Challenges & Struggles': ['struggle', 'challenge', 'difficult', 'overcome', 'tough'],
    'Art & Creativity': ['art', 'create', 'creative', 'write', 'inspire'],
    'Politics & History': ['politics', 'political', 'government', 'war', 'history']
  };
  
  const keywords = themeKeywords[themeName] || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  const examples: string[] = [];
  
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (keywords.some(kw => lowerSentence.includes(kw))) {
      examples.push(sentence.trim());
      if (examples.length >= 3) break;
    }
  }
  
  return examples;
}

function extractQuotes(text: string): Array<{ text: string; speaker?: string; context?: string }> {
  const quotes: Array<{ text: string; speaker?: string; context?: string }> = [];
  
  // Pattern for direct quotes
  const quotePattern = /"([^"]+)"/g;
  let match;
  
  while ((match = quotePattern.exec(text)) !== null) {
    const quoteText = match[1];
    
    // Skip very short or very long quotes
    if (quoteText.length < 20 || quoteText.length > 500) continue;
    
    // Look for speaker before the quote
    const beforeIndex = Math.max(0, match.index - 100);
    const beforeText = text.substring(beforeIndex, match.index);
    
    let speaker: string | undefined;
    const speakerPattern = /([A-Z][a-z]+ [A-Z][a-z]+)\s+(?:said|says|stated|explained|added|noted|remarked)/;
    const speakerMatch = beforeText.match(speakerPattern);
    if (speakerMatch) {
      speaker = speakerMatch[1];
    }
    
    // Get context
    const contextStart = Math.max(0, match.index - 50);
    const contextEnd = Math.min(text.length, match.index + quoteText.length + 50);
    const context = text.substring(contextStart, contextEnd).replace(/"[^"]+"/g, '[QUOTE]').trim();
    
    quotes.push({
      text: quoteText,
      speaker,
      context
    });
    
    if (quotes.length >= 20) break;
  }
  
  return quotes;
}

function findCulturalReferences(text: string): Array<{ name: string; description?: string; context: string }> {
  const references: Array<{ name: string; description?: string; context: string }> = [];
  
  const culturalPatterns = [
    { pattern: /\b(Grammy|Oscar|Emmy|Tony|Pulitzer|Nobel)\s+(?:Award|Prize|Winner)?\b/gi, type: 'Award' },
    { pattern: /\b(Beatles|Elvis|Dylan|Sinatra|Cash|Williams|Haggard)\b/gi, type: 'Music Icon' },
    { pattern: /\b(Woodstock|Monterey Pop|Live Aid|Coachella|Lollapalooza)\b/gi, type: 'Music Festival' },
    { pattern: /\b(Grand Ole Opry|Carnegie Hall|Madison Square Garden|Hollywood Bowl)\b/gi, type: 'Venue' },
    { pattern: /\b(Rock and Roll|Country Music|Jazz|Blues|Hip Hop|Folk|Soul)\b/gi, type: 'Music Genre' },
    { pattern: /\b(Vietnam War|Civil Rights|Watergate|9\/11|Great Depression)\b/gi, type: 'Historical Event' }
  ];
  
  for (const { pattern, type } of culturalPatterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      const name = match[0];
      
      // Get context
      const contextStart = Math.max(0, match.index - 100);
      const contextEnd = Math.min(text.length, match.index + name.length + 100);
      const context = text.substring(contextStart, contextEnd).trim();
      
      references.push({
        name,
        description: type,
        context
      });
      
      if (references.length >= 30) break;
    }
    
    if (references.length >= 30) break;
  }
  
  return references;
}

function generateCrossReferences(analysis: TranscriptAnalysis): Array<{ description: string }> {
  const crossRefs: Array<{ description: string }> = [];
  
  // Based on entities
  if (analysis.entities && analysis.entities.length > 0) {
    const people = analysis.entities.filter(e => e.type === 'Person').slice(0, 3);
    const places = analysis.entities.filter(e => e.type === 'Place').slice(0, 3);
    
    if (people.length > 0) {
      crossRefs.push({
        description: `Connect with other content featuring ${people.map(p => p.name).join(', ')}`
      });
    }
    
    if (places.length > 0) {
      crossRefs.push({
        description: `Link to geographic content about ${places.map(p => p.name).join(', ')}`
      });
    }
  }
  
  // Based on themes
  if (analysis.themes && analysis.themes.length > 0) {
    const topTheme = analysis.themes[0];
    crossRefs.push({
      description: `Cross-reference with other ${topTheme.name} content in the database`
    });
  }
  
  // Based on cultural references
  if (analysis.culturalReferences && analysis.culturalReferences.length > 0) {
    const musicRefs = analysis.culturalReferences.filter(r => r.description?.includes('Music'));
    if (musicRefs.length > 0) {
      crossRefs.push({
        description: `Connect to music history content and artist profiles`
      });
    }
  }
  
  return crossRefs;
}