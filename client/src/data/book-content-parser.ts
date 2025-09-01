import type { BookChapter } from '../../../shared/schema';

// Parser for the authentic Merle Haggard audiobook transcript
export class BookContentParser {
  private rawContent: string;
  private chapters: BookChapter[] = [];

  constructor(rawContent: string) {
    this.rawContent = rawContent;
  }

  // Parse the transcript into structured chapters
  parseIntoChapters(): BookChapter[] {
    // Clean the content first
    const cleanedContent = this.cleanTranscript(this.rawContent);
    
    // Split into logical sections based on content themes
    const sections = this.identifyChapterBreaks(cleanedContent);
    
    // Create properly formatted chapters
    this.chapters = sections.map((section, index) => this.createChapter(section, index + 1));
    
    return this.chapters;
  }

  private cleanTranscript(content: string): string {
    // Remove transcript headers and speaker labels
    return content
      .replace(/# Swell AI Transcript:.*?\n\n/g, '')
      .replace(/SPEAKER_00:\s*/g, '')
      .replace(/Harper Audio presents.*?read by Merle Haggard\.\s*/g, '')
      .trim();
  }

  private identifyChapterBreaks(content: string): string[] {
    // Key phrases that indicate chapter transitions
    const chapterMarkers = [
      "I was born April 6, 1937", // Early life
      "In 1946, my world collapsed", // Father's death
      "After getting out of San Quentin", // Post-prison
      "When I wrote 'Mama Tried'", // Musical breakthrough
      "Nobody expected 'Okie from Muskogee'", // Fame
      "Success brought its own set of problems", // Personal struggles
      "I've had a blessed life", // Reflections
    ];

    const sections: string[] = [];
    let currentSection = '';
    let lastIndex = 0;

    // Split based on natural narrative breaks
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    let currentChapter = '';
    for (const paragraph of paragraphs) {
      // Check if this paragraph starts a new thematic section
      const isNewChapter = chapterMarkers.some(marker => 
        paragraph.includes(marker.substring(0, 20))
      );

      if (isNewChapter && currentChapter.length > 500) {
        sections.push(currentChapter.trim());
        currentChapter = paragraph;
      } else {
        currentChapter += (currentChapter ? '\n\n' : '') + paragraph;
      }
    }

    // Add the final chapter
    if (currentChapter.trim()) {
      sections.push(currentChapter.trim());
    }

    return sections;
  }

  private createChapter(content: string, chapterNumber: number): BookChapter {
    // Extract title from content themes
    const title = this.extractChapterTitle(content, chapterNumber);
    
    // Format content with proper paragraphs
    const formattedContent = this.formatContent(content);
    
    // Calculate approximate page ranges (assuming ~250 words per page)
    const wordCount = content.split(/\s+/).length;
    const wordsPerPage = 250;
    const pageStart = Math.round((chapterNumber - 1) * (wordCount / wordsPerPage)) + 1;
    const pageEnd = Math.round(chapterNumber * (wordCount / wordsPerPage));

    return {
      id: `ch${chapterNumber}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      bookId: "merle-book-house-memories",
      chapterNumber,
      title,
      content: formattedContent,
      pageStart,
      pageEnd,
      audioTimestamp: null, // Will be populated with audio sync
      audioDuration: null,
      createdAt: new Date(),
    };
  }

  private extractChapterTitle(content: string, chapterNumber: number): string {
    // Extract meaningful titles based on content themes
    const titles = [
      "Welcome to My World",
      "The Boxcar Years", 
      "Loss and Rebellion",
      "Behind the Walls",
      "Finding My Voice",
      "Mama Tried",
      "The Okie Phenomenon", 
      "Success and Struggle",
      "Love and Loss",
      "House of Memories"
    ];

    return titles[chapterNumber - 1] || `Chapter ${chapterNumber}`;
  }

  private formatContent(content: string): string {
    // Ensure proper paragraph formatting
    return content
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n\n');
  }

  // Extract audio timestamps if available in transcript
  extractAudioTimestamps(): Map<number, { start: number; end: number }> {
    const timestamps = new Map<number, { start: number; end: number }>();
    
    // Parse any timestamp markers in the transcript
    const timestampRegex = /\[(\d{2}):(\d{2}):(\d{2})\]/g;
    let match;
    let chapterIndex = 0;
    
    while ((match = timestampRegex.exec(this.rawContent)) !== null) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      
      if (!timestamps.has(chapterIndex)) {
        timestamps.set(chapterIndex, { start: totalSeconds, end: totalSeconds });
      } else {
        timestamps.get(chapterIndex)!.end = totalSeconds;
      }
    }
    
    return timestamps;
  }
}