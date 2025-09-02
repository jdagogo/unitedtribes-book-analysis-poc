import { Router, Request, Response } from 'express';

const router = Router();

// Enhanced logging for debugging
const log = (message: string, data?: any) => {
  console.log(`[HYBRID] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
};

// Real Claude API integration with comprehensive cultural analysis
async function getClaudeAnalysis(selectedText: string, userContext: string): Promise<any> {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY;
  
  log('Claude API Key present:', !!claudeApiKey);
  
  if (!claudeApiKey) {
    log('No Claude API key, using enhanced fallback');
    return getFallbackAnalysis(selectedText, userContext);
  }

  try {
    const prompt = `You are analyzing a passage from Patti Smith's memoir "Just Kids" about the 1960s-70s New York art scene.

Selected passage: "${selectedText}"

${userContext ? `User's specific question: ${userContext}` : 'Provide cultural and historical context for this passage.'}

Please provide a detailed analysis including:
1. Cultural significance of any people, places, or events mentioned
2. Historical context (what was happening in NYC/art world at this time)
3. Connections to other artists, movements, or cultural moments
4. Why this matters in the broader story of American art/music
5. Any specific dates, venues, or movements referenced

Format your response as JSON with these fields:
{
  "summary": "Main cultural significance (2-3 sentences)",
  "historical_context": "What was happening at this time",
  "connections": ["Person/Place/Event 1", "Person/Place/Event 2"],
  "significance": "Why this matters",
  "related_topics": ["Topic 1", "Topic 2"]
}`;

    log('Calling Claude API with prompt length:', prompt.length);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      log('Claude API error:', response.status);
      return getFallbackAnalysis(selectedText, userContext);
    }

    const data = await response.json();
    log('Claude API response received');
    
    try {
      const parsed = JSON.parse(data.content[0].text);
      return parsed;
    } catch {
      return {
        summary: data.content[0].text,
        historical_context: '',
        connections: [],
        significance: '',
        related_topics: []
      };
    }
  } catch (error) {
    log('Error calling Claude API:', error);
    return getFallbackAnalysis(selectedText, userContext);
  }
}

// Enhanced fallback analysis for specific cultural references
function getFallbackAnalysis(selectedText: string, userContext: string): any {
  const lowerText = selectedText.toLowerCase();
  
  // John Coltrane specific
  if (lowerText.includes('coltrane') || lowerText.includes('love supreme')) {
    return {
      summary: "John Coltrane's death on July 17, 1967, marked the end of an era in jazz. His album 'A Love Supreme' (1965) was a spiritual masterpiece that bridged jazz, spirituality, and the civil rights movement.",
      historical_context: "1967 was a pivotal year - the Summer of Love in San Francisco, escalation in Vietnam, and the loss of several jazz giants. Coltrane's death at 40 shocked the music world.",
      connections: ["Miles Davis", "Free Jazz Movement", "Civil Rights Era", "Spiritual Jazz", "The Five Spot Café"],
      significance: "Coltrane's death represented the passing of jazz's revolutionary guard just as rock was ascending. For artists like Patti Smith, it symbolized the end of one artistic era and the beginning of another.",
      related_topics: ["1960s Jazz", "Spiritual Music", "Black Arts Movement", "Greenwich Village Jazz Scene"]
    };
  }
  
  // Robert Mapplethorpe
  if (lowerText.includes('robert') || lowerText.includes('mapplethorpe')) {
    return {
      summary: "Robert Mapplethorpe revolutionized photography in the 1970s-80s, bringing homoerotic and BDSM imagery into fine art galleries while maintaining classical composition.",
      historical_context: "The 1970s New York art scene was exploding with punk, new wave, and confrontational art. The Chelsea Hotel and Max's Kansas City were epicenters.",
      connections: ["Patti Smith", "Andy Warhol", "Sam Wagstaff", "The Factory", "Chelsea Hotel"],
      significance: "Mapplethorpe's work challenged American puritanism and helped establish photography as high art. His relationship with Patti Smith exemplified the era's boundary-crossing collaborations.",
      related_topics: ["1970s Photography", "New York Art Scene", "LGBTQ Art History", "Culture Wars"]
    };
  }
  
  // Chelsea Hotel
  if (lowerText.includes('chelsea hotel')) {
    return {
      summary: "The Chelsea Hotel at 222 West 23rd Street was the bohemian heart of New York, housing everyone from Mark Twain to Sid Vicious.",
      historical_context: "From the 1960s-70s, the Chelsea was a refuge for artists who couldn't afford traditional housing. It operated as an informal artist colony.",
      connections: ["Leonard Cohen", "Janis Joplin", "Dylan Thomas", "Arthur Miller", "Andy Warhol"],
      significance: "The Chelsea represented a unique American experiment in communal artistic living. Its tolerance for poverty and eccentricity nurtured countless masterworks.",
      related_topics: ["Bohemian New York", "Artist Communities", "1960s Counterculture", "Music History"]
    };
  }
  
  // Generic but relevant
  return {
    summary: "This passage from 'Just Kids' captures the transformation of American culture in the late 1960s-early 1970s, when art, music, and literature collided in unprecedented ways.",
    historical_context: "New York in this era was experiencing economic decline but artistic renaissance. Cheap rents allowed artists to experiment freely.",
    connections: ["Greenwich Village", "CBGB", "Max's Kansas City", "The Factory"],
    significance: "This period established the template for urban artistic communities and DIY culture that continues to influence artists today.",
    related_topics: ["1960s Counterculture", "New York Art Scene", "Punk Origins", "American Bohemia"]
  };
}

// Main hybrid endpoint with full debugging
router.post('/api/discovery/working', async (req: Request, res: Response) => {
  try {
    const { selectedText, userContext } = req.body;
    
    log('=== NEW DISCOVERY REQUEST ===');
    log('Selected Text:', selectedText?.substring(0, 100));
    log('User Context:', userContext);
    
    if (!selectedText) {
      return res.status(400).json({ error: 'Selected text is required' });
    }

    // Get AI analysis (Claude or fallback)
    log('Getting AI analysis...');
    const aiAnalysis = await getClaudeAnalysis(selectedText, userContext || '');
    log('AI Analysis received:', aiAnalysis);

    // Try video search
    let videoMatches = [];
    let videoSearchWorked = false;
    
    try {
      log('Attempting video search at localhost:3001...');
      const videoResponse = await fetch('http://localhost:3001/search/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: selectedText,
          limit: 5,
          threshold: 0.3
        })
      });
      
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        videoMatches = videoData.results || [];
        videoSearchWorked = true;
        log(`Video search successful: ${videoMatches.length} matches found`);
      } else {
        log('Video search failed:', videoResponse.status);
      }
    } catch (error: any) {
      log('Video search error:', error.message);
    }

    // Build comprehensive response
    const response = {
      success: true,
      discovery: {
        title: extractMainEntity(selectedText) || 'Cultural Discovery',
        summary: aiAnalysis.summary || 'Analyzing this passage from Just Kids...',
        culturalContext: aiAnalysis.historical_context || '',
        aiAnalysis: aiAnalysis.summary,
        relatedMedia: [
          ...videoMatches.slice(0, 3).map((v: any) => ({
            type: 'video' as const,
            title: v.title || 'Video',
            creator: v.channel || 'YouTube',
            relevance: v.relevance_score || 0,
            link: v.video_url
          })),
          // Add related topics as media suggestions
          ...(aiAnalysis.related_topics || []).slice(0, 2).map((topic: string) => ({
            type: 'book' as const,
            title: `Research: ${topic}`,
            creator: 'Suggested Topic',
            relevance: 0.5
          }))
        ],
        connections: (aiAnalysis.connections || []).map((name: string) => ({
          name,
          relationship: 'Cultural Connection',
          significance: `Part of the ${extractEra(selectedText)} cultural landscape`
        })),
        quotes: aiAnalysis.significance ? [{
          text: aiAnalysis.significance,
          source: 'Cultural Analysis'
        }] : [],
        videoMatches
      },
      selectedText,
      userContext,
      sources: {
        videos: videoSearchWorked && videoMatches.length > 0,
        ai: true,
        database: false
      },
      debug: {
        aiResponseType: process.env.ANTHROPIC_API_KEY ? 'claude' : 'fallback',
        videoCount: videoMatches.length,
        connectionsFound: aiAnalysis.connections?.length || 0
      }
    };
    
    log('=== SENDING RESPONSE ===');
    log('Connections:', response.discovery.connections.length);
    log('Related Media:', response.discovery.relatedMedia.length);
    log('Video Matches:', videoMatches.length);
    
    res.json(response);
    
  } catch (error: any) {
    log('ERROR in discovery endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process discovery request',
      message: error.message,
      stack: error.stack
    });
  }
});

// Helper to extract main entity from text
function extractMainEntity(text: string): string {
  const lowerText = text.toLowerCase();
  
  const entities = [
    { match: 'john coltrane', name: 'John Coltrane' },
    { match: 'robert mapplethorpe', name: 'Robert Mapplethorpe' },
    { match: 'patti smith', name: 'Patti Smith' },
    { match: 'chelsea hotel', name: 'The Chelsea Hotel' },
    { match: 'andy warhol', name: 'Andy Warhol' },
    { match: 'bob dylan', name: 'Bob Dylan' },
    { match: 'allen ginsberg', name: 'Allen Ginsberg' },
    { match: 'william burroughs', name: 'William Burroughs' },
    { match: "max's kansas city", name: "Max's Kansas City" },
    { match: 'cbgb', name: 'CBGB' }
  ];
  
  for (const entity of entities) {
    if (lowerText.includes(entity.match)) {
      return entity.name;
    }
  }
  
  return '';
}

// Helper to extract era from text
function extractEra(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('196') || lowerText.includes('sixties')) {
    return '1960s';
  }
  if (lowerText.includes('197') || lowerText.includes('seventies')) {
    return '1970s';
  }
  
  return '1960s-70s';
}

export default router;