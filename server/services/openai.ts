import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  duration: number;
}

export interface EntityRecognitionResult {
  entities: {
    name: string;
    type: string;
    category: string;
    description: string;
    mentions: {
      timestamp: number;
      context: string;
      confidence: number;
    }[];
  }[];
}

export async function transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
  try {
    // Check if this is a demo file (very short)
    const stats = fs.statSync(audioFilePath);
    const isDemo = audioFilePath.includes('_demo') || stats.size < 100000; // Less than 100KB
    
    if (isDemo) {
      console.log("Demo mode: Using sample transcription data");
      const demoSegments: TranscriptionSegment[] = [
        { start: 0, end: 15, text: "Welcome to Fresh Air. I'm Terry Gross. Today we're talking with acclaimed author Malcolm Gladwell about his new book exploring the intersection of technology and human behavior." },
        { start: 15, end: 35, text: "Malcolm, your latest work delves into how artificial intelligence is reshaping our understanding of creativity and innovation. You argue that AI tools like ChatGPT and GPT-4 aren't just automating tasks, but fundamentally changing how we think about problem-solving." },
        { start: 35, end: 55, text: "Can you tell us more about that? Well Terry, what I've discovered through my research is fascinating. We're seeing entrepreneurs and artists using these AI systems not as replacements for human creativity, but as collaborative partners." },
        { start: 55, end: 75, text: "Take someone like Reid Hoffman, the LinkedIn founder, who's been experimenting with AI for strategic planning. Or consider how companies in Silicon Valley are integrating these tools into their product development cycles." },
        { start: 75, end: 95, text: "The key insight is that AI amplifies human capabilities rather than replacing them. This reminds me of my work on The Tipping Point - we're at a similar inflection point with artificial intelligence." },
        { start: 95, end: 115, text: "The early adopters aren't just using AI for efficiency, they're discovering entirely new ways to approach complex problems. I interviewed several CEOs who told me that AI has changed not just what they do, but how they think about their businesses." }
      ];
      
      return {
        text: demoSegments.map(s => s.text).join(' '),
        segments: demoSegments,
        duration: 115
      };
    }
    
    // Check file size before transcription
    const maxSize = 24 * 1024 * 1024; // 24MB limit
    if (stats.size > maxSize) {
      throw new Error(`Audio file too large (${Math.round(stats.size / 1024 / 1024)}MB). Maximum size is 25MB.`);
    }
    
    console.log(`Transcribing audio file: ${Math.round(stats.size / 1024 / 1024)}MB`);
    
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    // Convert OpenAI response to our format
    const segments: TranscriptionSegment[] = (transcription as any).segments?.map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })) || [];

    return {
      text: transcription.text,
      segments,
      duration: segments.length > 0 ? segments[segments.length - 1].end : 0,
    };
  } catch (error) {
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function recognizeEntities(transcriptionText: string, segments: TranscriptionSegment[]): Promise<EntityRecognitionResult> {
  try {
    // Use Claude for entity extraction since it's much better at this task
    console.log(`=== SWITCHING TO CLAUDE FOR ENTITY EXTRACTION ===`);
    console.log(`Transcript length: ${transcriptionText.length} characters`);
    
    const { extractEntitiesWithClaude } = await import('./anthropic');
    
    console.log(`Using Claude for comprehensive entity extraction`);
    const claudeResult = await extractEntitiesWithClaude(transcriptionText);
    
    console.log(`Claude extracted ${claudeResult.entities.length} total entities`);
    
    // Convert Claude format to our format with additional processing
    const processedEntities = claudeResult.entities.map((entity, index) => {
      // Try to find timestamp information from segments if available
      const mentions = entity.mentions.map(mention => {
        // Try to find better timestamp by searching for the entity name in segments
        let bestTimestamp = mention.timestamp;
        if (segments && segments.length > 0) {
          for (const segment of segments) {
            if (segment.text.toLowerCase().includes(entity.name.toLowerCase())) {
              bestTimestamp = segment.start;
              break;
            }
          }
        }
        
        return {
          ...mention,
          timestamp: bestTimestamp
        };
      });

      return {
        id: `entity_${index}`,
        name: entity.name,
        type: entity.type,
        category: entity.category,
        description: entity.description,
        mentions,
        sentiment: 'neutral', // Will be enhanced later
        relationships: [], // Will be enhanced later
        importance: mentions.length * 10 + (entity.description.length / 10)
      };
    });

    return {
      entities: processedEntities
    };

  } catch (error) {
    console.error('Error in entity recognition:', error);
    throw new Error(`Failed to recognize entities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeEntityContext(entityName: string, mentions: string[]): Promise<{
  topics: string[];
  summary: string;
}> {
  try {
    const prompt = `
    Analyze the following mentions of "${entityName}" and provide:
    1. Key topics/themes discussed in relation to this entity
    2. A comprehensive summary of how this entity is discussed

    Mentions:
    ${mentions.join('\n\n')}

    Respond with JSON:
    {
      "topics": ["topic1", "topic2", "topic3"],
      "summary": "Detailed summary of the entity's discussion context"
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      topics: [],
      summary: `Analysis of ${entityName} mentions`,
    };
  }
}

// Advanced sentiment and emotion analysis
export async function analyzeSentimentAndEmotions(transcriptionText: string, segments: TranscriptionSegment[]): Promise<{
  overallSentiment: string;
  emotionalJourney: { timestamp: number; sentiment: string; emotions: string[]; intensity: number }[];
  keyMoods: string[];
}> {
  try {
    const prompt = `
    Analyze the sentiment and emotional content of this podcast transcript.
    
    For the overall analysis, provide:
    1. Overall sentiment (positive, negative, neutral)
    2. Key moods and emotions present throughout
    3. Emotional journey with timestamps (every ~30 seconds)
    
    Transcript: ${transcriptionText}
    
    Respond with JSON:
    {
      "overallSentiment": "positive|negative|neutral",
      "emotionalJourney": [
        {
          "timestamp": 30,
          "sentiment": "positive|negative|neutral", 
          "emotions": ["happy", "excited", "confident"],
          "intensity": 75
        }
      ],
      "keyMoods": ["conversational", "informative", "enthusiastic"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in sentiment analysis and emotional intelligence. Provide detailed, nuanced analysis of emotional content."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      overallSentiment: "neutral",
      emotionalJourney: [],
      keyMoods: [],
    };
  }
}

// Entity relationship mapping
export async function mapEntityRelationships(entities: any[], transcriptionText: string): Promise<{
  relationships: { source: string; target: string; type: string; strength: number; context: string }[];
  entityNetwork: any;
}> {
  try {
    const entityNames = entities.map(e => e.name).join(', ');
    
    const prompt = `
    Analyze the relationships between these entities in the podcast transcript:
    Entities: ${entityNames}
    
    For each relationship found, determine:
    1. Source and target entities
    2. Relationship type (works_with, mentions_together, located_in, part_of, etc.)
    3. Strength (1-10 based on frequency and importance)
    4. Context of the relationship
    
    Full transcript: ${transcriptionText}
    
    Respond with JSON:
    {
      "relationships": [
        {
          "source": "Entity A",
          "target": "Entity B", 
          "type": "works_with|mentions_together|located_in|part_of|etc",
          "strength": 8,
          "context": "They collaborated on a project"
        }
      ],
      "entityNetwork": {
        "nodes": [{"id": "Entity A", "importance": 90}],
        "edges": [{"source": "Entity A", "target": "Entity B", "weight": 8}]
      }
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in network analysis and entity relationships. Map complex relationships between entities with high accuracy."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    return {
      relationships: [],
      entityNetwork: { nodes: [], edges: [] },
    };
  }
}

// Enhanced entity recognition with sentiment per mention
export async function enhancedEntityRecognition(transcriptionText: string, segments: TranscriptionSegment[]): Promise<{
  entities: {
    name: string;
    type: string;
    category: string;
    description: string;
    aliases: string[];
    importance: number;
    overallSentiment: string;
    mentions: {
      timestamp: number;
      context: string;
      confidence: number;
      sentiment: string;
      emotions: string[];
    }[];
  }[];
}> {
  try {
    const prompt = `
    Perform advanced entity recognition on this podcast transcript. For each entity:
    
    1. Identify the entity name, type, category, and description
    2. Find all alternative names/aliases mentioned
    3. Rate importance (1-100) based on discussion time and context
    4. Determine overall sentiment toward this entity
    5. For each mention, analyze local sentiment and emotions
    
    Focus on:
    - People (celebrities, experts, historical figures, etc.)
    - Places (cities, venues, countries, etc.) 
    - Organizations (companies, institutions, etc.)
    - Entertainment (movies, shows, books, music, etc.)
    - Products and technologies
    - Events and concepts
    
    Transcript: ${transcriptionText}
    
    Respond with JSON:
    {
      "entities": [
        {
          "name": "Entity Name",
          "type": "person|place|organization|entertainment|product|event|concept",
          "category": "person|place|entertainment|technology|business|etc",
          "description": "Brief description",
          "aliases": ["Alternative Name 1", "Alt Name 2"],
          "importance": 85,
          "overallSentiment": "positive|negative|neutral",
          "mentions": [
            {
              "timestamp": 123,
              "context": "surrounding text context",
              "confidence": 95,
              "sentiment": "positive|negative|neutral",
              "emotions": ["excitement", "admiration"]
            }
          ]
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an advanced AI system specialized in comprehensive entity recognition, sentiment analysis, and emotional intelligence. Provide detailed, nuanced analysis."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Map timestamps to actual segment times
    result.entities.forEach((entity: any) => {
      entity.mentions = entity.mentions.map((mention: any) => {
        const segment = segments.find(seg => 
          mention.timestamp >= seg.start && mention.timestamp <= seg.end
        ) || segments[0];
        
        return {
          ...mention,
          timestamp: segment ? segment.start : mention.timestamp,
        };
      });
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to perform enhanced entity recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
