// Automatic transcript-to-audio alignment system
// This maps audio timing directly to transcript text and associated entities

import { authenticMerleAnalysis } from "./authentic-merle-analysis";

// Extract all entity mentions from the transcript with their positions
interface EntityMention {
  entityId: string;
  startChar: number;
  endChar: number;
  text: string;
  context: string;
}

interface TranscriptSegment {
  startChar: number;
  endChar: number;
  text: string;
  estimatedStartTime: number;
  estimatedEndTime: number;
  entities: string[];
}

class TranscriptEntityAligner {
  private transcript: string;
  private entityMentions: EntityMention[] = [];
  private segments: TranscriptSegment[] = [];
  private totalDuration: number;

  constructor() {
    this.transcript = authenticMerleAnalysis.transcription.fullText;
    this.totalDuration = authenticMerleAnalysis.podcast.duration;
    this.extractEntityMentions();
    this.createTranscriptSegments();
  }

  private extractEntityMentions() {
    const entityAnalysis = authenticMerleAnalysis.entityAnalysis;

    // Find all entity mentions in the transcript text based on entity analysis
    entityAnalysis.forEach((analysis: any) => {
      if (!analysis.entity || !analysis.entity.name) return;

      const entityId = analysis.entity.id || analysis.entity.name.toLowerCase().replace(/\s+/g, '-');
      const searchTerms = [analysis.entity.name, ...(analysis.entity.aliases || [])];
      
      searchTerms.forEach((term: string) => {
        let index = 0;
        while ((index = this.transcript.toLowerCase().indexOf(term.toLowerCase(), index)) !== -1) {
          this.entityMentions.push({
            entityId: entityId,
            startChar: index,
            endChar: index + term.length,
            text: term,
            context: this.transcript.substring(Math.max(0, index - 50), Math.min(this.transcript.length, index + term.length + 50))
          });
          index += term.length;
        }
      });
    });

    // Sort by character position
    this.entityMentions.sort((a, b) => a.startChar - b.startChar);
  }

  private createTranscriptSegments() {
    // Create key segments based on the actual interview structure
    // The transcript starts with David Bianculli's introduction, then Terry Gross's interview
    
    const segments: TranscriptSegment[] = [];
    
    // Introduction by David Bianculli (0-120 seconds audio = 0-450 chars approx)
    const introText = "DAVID BIANCULLI, HOST: This is FRESH AIR. I'm David Bianculli. This week marks the 40th anniversary of Farm Aid";
    const introEnd = this.transcript.indexOf("When Terry spoke with Merle Haggard in 1995");
    
    if (introEnd > 0) {
      segments.push({
        startChar: 0,
        endChar: introEnd,
        text: this.transcript.substring(0, introEnd),
        estimatedStartTime: 0,
        estimatedEndTime: 120, // About 2 minutes for intro
        entities: this.getEntitiesInRange(0, introEnd)
      });
    }
    
    // Main interview starts after intro
    const interviewStart = Math.max(introEnd, 0);
    const interviewLength = this.transcript.length - interviewStart;
    const remainingDuration = this.totalDuration - 120; // Remaining time after intro
    
    // Create segments for the interview part with better timing estimation
    const SEGMENT_SIZE = 300; // Larger segments for better accuracy
    for (let i = interviewStart; i < this.transcript.length; i += SEGMENT_SIZE) {
      const startChar = i;
      const endChar = Math.min(i + SEGMENT_SIZE, this.transcript.length);
      const text = this.transcript.substring(startChar, endChar);
      
      // Calculate timing based on position within interview section
      const interviewProgress = (startChar - interviewStart) / interviewLength;
      const estimatedStartTime = 120 + (interviewProgress * remainingDuration);
      const estimatedEndTime = 120 + (((endChar - interviewStart) / interviewLength) * remainingDuration);
      
      segments.push({
        startChar,
        endChar,
        text,
        estimatedStartTime,
        estimatedEndTime,
        entities: this.getEntitiesInRange(startChar, endChar)
      });
    }
    
    this.segments = segments;
  }
  
  private getEntitiesInRange(startChar: number, endChar: number): string[] {
    const segmentEntities = this.entityMentions
      .filter(mention => mention.startChar >= startChar && mention.endChar <= endChar)
      .map(mention => mention.entityId);
    
    return segmentEntities.filter((entity, index) => segmentEntities.indexOf(entity) === index);
  }

  // Get entities that should be active at a given audio time
  public getEntitiesAtTime(audioTime: number, prerollDuration: number = 15): string[] {
    // Adjust for preroll
    const transcriptTime = audioTime - prerollDuration;
    if (transcriptTime < 0) return ["merle-haggard"];

    // Find segments that contain this time (with some overlap for smoother transitions)
    const OVERLAP_WINDOW = 10; // seconds
    const activeSegments = this.segments.filter(segment => 
      transcriptTime >= (segment.estimatedStartTime - OVERLAP_WINDOW) && 
      transcriptTime <= (segment.estimatedEndTime + OVERLAP_WINDOW)
    );

    // If no segments found, find the closest one
    if (activeSegments.length === 0) {
      const closestSegment = this.segments.reduce((closest, segment) => {
        const currentDistance = Math.min(
          Math.abs(transcriptTime - segment.estimatedStartTime),
          Math.abs(transcriptTime - segment.estimatedEndTime)
        );
        const closestDistance = Math.min(
          Math.abs(transcriptTime - closest.estimatedStartTime),
          Math.abs(transcriptTime - closest.estimatedEndTime)
        );
        return currentDistance < closestDistance ? segment : closest;
      });
      activeSegments.push(closestSegment);
    }

    // Collect all entities from active segments
    const entityArray: string[] = [];
    activeSegments.forEach(segment => {
      segment.entities.forEach(entityId => {
        if (!entityArray.includes(entityId)) {
          entityArray.push(entityId);
        }
      });
    });

    // Always include Merle Haggard as he's the main subject
    if (!entityArray.includes("merle-haggard")) {
      entityArray.push("merle-haggard");
    }

    return entityArray;
  }

  // Get the transcript text that corresponds to the current audio time
  public getTranscriptAtTime(audioTime: number, prerollDuration: number = 15): string {
    const transcriptTime = audioTime - prerollDuration;
    if (transcriptTime < 0) return "";

    const activeSegment = this.segments.find(segment => 
      transcriptTime >= segment.estimatedStartTime && transcriptTime <= segment.estimatedEndTime
    );

    return activeSegment?.text || "";
  }

  // Debug method to see all segments
  public getSegments(): TranscriptSegment[] {
    return this.segments;
  }

  // Debug method to see all entity mentions
  public getEntityMentions(): EntityMention[] {
    return this.entityMentions;
  }
}

// Create singleton instance
export const transcriptAligner = new TranscriptEntityAligner();

// Export the main function for getting entities at a specific time
export function getEntitiesAtAudioTime(audioTime: number, prerollDuration: number = 15): string[] {
  return transcriptAligner.getEntitiesAtTime(audioTime, prerollDuration);
}

export function getTranscriptAtAudioTime(audioTime: number, prerollDuration: number = 15): string {
  return transcriptAligner.getTranscriptAtTime(audioTime, prerollDuration);
}