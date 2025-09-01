// Debug utility to examine transcript alignment
import { transcriptAligner } from "./transcript-entity-aligner";

// Debug function to examine what's happening
export function debugTranscriptAlignment() {
  const segments = transcriptAligner.getSegments();
  const mentions = transcriptAligner.getEntityMentions();
  
  console.log("🔍 TRANSCRIPT ALIGNMENT DEBUG:");
  console.log("Total segments:", segments.length);
  console.log("Total entity mentions found:", mentions.length);
  
  // Show first few segments
  console.log("\n📝 First 3 segments:");
  segments.slice(0, 3).forEach((segment, i) => {
    console.log(`Segment ${i}:`, {
      timeRange: `${segment.estimatedStartTime.toFixed(1)}s - ${segment.estimatedEndTime.toFixed(1)}s`,
      entities: segment.entities,
      textPreview: segment.text.substring(0, 100) + "..."
    });
  });
  
  // Show entity mentions in first 500 characters
  console.log("\n🎯 Entity mentions in first 500 chars:");
  mentions
    .filter(mention => mention.startChar < 500)
    .forEach(mention => {
      console.log(`Entity: ${mention.entityId} at char ${mention.startChar}-${mention.endChar}`, {
        text: mention.text,
        context: mention.context.substring(0, 80) + "..."
      });
    });
    
  return { segments, mentions };
}

// Test function to check entities at specific times
export function testEntitiesAtTime(audioTime: number) {
  const entities = transcriptAligner.getEntitiesAtTime(audioTime, 15);
  console.log(`🎵 Entities at ${audioTime}s:`, entities);
  return entities;
}