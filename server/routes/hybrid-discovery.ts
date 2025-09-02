import { Router, Request, Response } from 'express';

const router = Router();

interface VideoSearchResult {
  id: string;
  title: string;
  channel: string;
  relevance_score: number;
  matched_content: string;
  video_url?: string;
  analysis_summary?: string;
}

interface EnhancedSearchResponse {
  results: VideoSearchResult[];
  total_results: number;
  search_query: string;
}

interface DiscoveryResponse {
  title: string;
  summary: string;
  culturalContext?: string;
  videoMatches?: VideoSearchResult[];
  aiAnalysis?: string;
  relatedMedia?: any[];
  connections?: any[];
  quotes?: any[];
}

// Helper function to call the enhanced search API
async function searchVideoDataLake(query: string): Promise<VideoSearchResult[]> {
  try {
    console.log(`🔍 Searching video data lake for: "${query.substring(0, 50)}..."`);
    
    const response = await fetch('http://localhost:3001/search/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        limit: 5,
        threshold: 0.3
      })
    });

    if (!response.ok) {
      console.error('❌ Enhanced search API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json() as EnhancedSearchResponse;
    console.log(`✅ Found ${data.results?.length || 0} video results`);
    return data.results || [];
  } catch (error) {
    console.error('❌ Error calling enhanced search (is localhost:3001 running?):', error);
    // Return empty array but don't fail the whole request
    return [];
  }
}

// Helper function to generate AI analysis using Claude API
async function getClaudeAnalysis(selectedText: string, userContext: string): Promise<string> {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!claudeApiKey) {
    // Return a contextual response without API
    return generateContextualResponse(selectedText, userContext);
  }

  try {
    const prompt = `You are analyzing a passage from Patti Smith's memoir "Just Kids" about the 1960s-70s New York art scene.

Selected passage: "${selectedText}"

${userContext ? `User's specific question: ${userContext}` : 'Provide cultural and historical context for this passage.'}

Please provide:
1. Cultural significance of any people, places, or events mentioned
2. Historical context (what was happening in NYC/art world at this time)
3. Connections to other artists, movements, or cultural moments
4. Why this matters in the broader story of American art/music

Keep your response concise but insightful, focusing on cultural discovery.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.statusText);
      return generateContextualResponse(selectedText, userContext);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    return generateContextualResponse(selectedText, userContext);
  }
}

// Fallback function for contextual responses without API
function generateContextualResponse(selectedText: string, userContext: string): string {
  const lowerText = selectedText.toLowerCase();
  
  // Check for known entities and provide context
  if (lowerText.includes('robert') || lowerText.includes('mapplethorpe')) {
    return `Robert Mapplethorpe was a pivotal figure in 1970s New York art scene. His controversial photography pushed boundaries while documenting the era's underground culture. His relationship with Patti Smith, chronicled in "Just Kids," represents one of the most significant artistic partnerships of the 20th century.`;
  }
  
  if (lowerText.includes('chelsea hotel')) {
    return `The Chelsea Hotel was the epicenter of bohemian New York from the 1960s-70s. Home to artists like Dylan Thomas, Leonard Cohen, and Janis Joplin, it wasn't just a residence but a creative laboratory where music, literature, and visual arts collided. For Patti and Robert, it represented both sanctuary and artistic validation.`;
  }
  
  if (lowerText.includes('max\'s kansas city') || lowerText.includes('max\'s')) {
    return `Max's Kansas City was the nighttime headquarters of New York's art world. Andy Warhol held court in the back room, while the Velvet Underground played downstairs. It was where high art met rock and roll, where unknown artists could rub shoulders with superstars.`;
  }

  if (lowerText.includes('warhol') || lowerText.includes('factory')) {
    return `Andy Warhol's Factory was the creative nucleus of 1960s counterculture. More than just Warhol's studio, it was a radical experiment in breaking down barriers between high and low art, between artist and audience, between different creative disciplines.`;
  }
  
  // Generic but relevant response
  return `This passage from "Just Kids" captures a moment in the transformation of American culture. The late 1960s and early 1970s in New York saw an unprecedented collision of art, music, and literature. Young artists like Patti Smith and Robert Mapplethorpe weren't just creating work - they were inventing new ways of being artists in America.`;
}

// Main hybrid discovery endpoint
router.post('/api/discovery/hybrid', async (req: Request, res: Response) => {
  try {
    const { selectedText, userContext } = req.body;
    
    if (!selectedText) {
      return res.status(400).json({ error: 'Selected text is required' });
    }

    console.log(`🔍 Hybrid Discovery: Processing "${selectedText.substring(0, 50)}..."`);

    // Run both searches in parallel for speed
    const [videoResults, aiAnalysis] = await Promise.all([
      searchVideoDataLake(selectedText),
      getClaudeAnalysis(selectedText, userContext || '')
    ]);

    console.log(`📹 Found ${videoResults.length} video matches`);
    console.log(`🤖 AI analysis generated: ${aiAnalysis.substring(0, 100)}...`);

    // Extract key entities from the selected text for better matching
    const entities = extractEntities(selectedText);
    
    // Build the discovery response
    const discoveryResponse: DiscoveryResponse = {
      title: entities.length > 0 ? entities[0] : 'Cultural Discovery',
      summary: aiAnalysis,
      culturalContext: userContext ? 
        `Based on your question about "${userContext}", here's what I found...` : 
        'Exploring the cultural significance of this passage from "Just Kids"',
      videoMatches: videoResults.slice(0, 3), // Top 3 video matches
      aiAnalysis: aiAnalysis,
      relatedMedia: videoResults.map(v => ({
        type: 'video' as const,
        title: v.title,
        creator: v.channel,
        link: v.video_url,
        relevance: v.relevance_score
      })),
      connections: extractConnections(selectedText, aiAnalysis),
      quotes: []
    };

    // Add a small delay to show we're processing
    setTimeout(() => {
      res.json({
        success: true,
        discovery: discoveryResponse,
        selectedText,
        userContext,
        videoCount: videoResults.length,
        sources: {
          videos: videoResults.length > 0,
          ai: true,
          database: false
        }
      });
    }, 300);

  } catch (error: any) {
    console.error('Hybrid discovery error:', error);
    res.status(500).json({ 
      error: 'Failed to process discovery request',
      message: error.message 
    });
  }
});

// Helper function to extract entities from text
function extractEntities(text: string): string[] {
  const entities: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Known entities from Just Kids
  const knownEntities = [
    'Robert Mapplethorpe', 'Patti Smith', 'Chelsea Hotel', 'Max\'s Kansas City',
    'Andy Warhol', 'The Factory', 'Sam Wagstaff', 'Allen Ginsberg',
    'William Burroughs', 'Bob Dylan', 'Janis Joplin', 'Jimi Hendrix',
    'CBGB', 'St. Mark\'s', 'Brooklyn', 'Coney Island'
  ];
  
  for (const entity of knownEntities) {
    if (lowerText.includes(entity.toLowerCase())) {
      entities.push(entity);
    }
  }
  
  return entities;
}

// Helper function to extract connections from AI analysis
function extractConnections(selectedText: string, aiAnalysis: string): any[] {
  const connections = [];
  
  // Parse AI analysis for mentioned people/places
  const peoplePattern = /(Patti Smith|Robert Mapplethorpe|Andy Warhol|Allen Ginsberg|Bob Dylan)/gi;
  const matches = aiAnalysis.match(peoplePattern);
  
  if (matches) {
    const unique = [...new Set(matches)];
    for (const person of unique) {
      connections.push({
        name: person,
        relationship: 'Mentioned in context',
        significance: 'Part of the 1960s-70s New York art scene'
      });
    }
  }
  
  return connections.slice(0, 5); // Limit to 5 connections
}

export default router;