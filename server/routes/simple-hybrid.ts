import { Router, Request, Response } from 'express';

const router = Router();

// Simple test endpoint first
router.post('/api/discovery/test', async (req: Request, res: Response) => {
  console.log('🎯 Test endpoint hit with:', req.body);
  
  const { selectedText, userContext } = req.body;
  
  res.json({
    success: true,
    message: 'Test endpoint working',
    selectedText,
    userContext,
    timestamp: new Date().toISOString()
  });
});

// Simplified hybrid discovery endpoint with video search
router.post('/api/discovery/hybrid-simple', async (req: Request, res: Response) => {
  try {
    const { selectedText, userContext } = req.body;
    
    console.log(`🔍 Hybrid Discovery Request:`, {
      text: selectedText?.substring(0, 50),
      context: userContext
    });
    
    if (!selectedText) {
      return res.status(400).json({ error: 'Selected text is required' });
    }

    // Try to search videos from localhost:3001
    let videoMatches = [];
    let videoSearchWorked = false;
    
    try {
      console.log('📹 Attempting to search videos at localhost:3001...');
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
        console.log(`✅ Found ${videoMatches.length} video matches`);
      }
    } catch (error) {
      console.log('⚠️ Video search unavailable (localhost:3001 may not be running)');
    }

    // Build the response with both AI context and video matches
    const response = {
      success: true,
      discovery: {
        title: 'Cultural Discovery',
        summary: getContextualSummary(selectedText),
        culturalContext: userContext ? 
          `Based on your question: "${userContext}"` : 
          `Exploring: "${selectedText.substring(0, 100)}..."`,
        aiAnalysis: getContextualSummary(selectedText),
        relatedMedia: videoMatches.slice(0, 3).map((v: any) => ({
          type: 'video',
          title: v.title || 'Video',
          creator: v.channel || 'Unknown',
          relevance: v.relevance_score || 0
        })),
        connections: [],
        quotes: [],
        videoMatches: videoMatches.slice(0, 3)
      },
      selectedText,
      userContext,
      sources: {
        videos: videoSearchWorked && videoMatches.length > 0,
        ai: true,
        database: false
      }
    };
    
    console.log('✅ Sending response with', videoMatches.length, 'videos');
    res.json(response);
    
  } catch (error: any) {
    console.error('❌ Hybrid discovery error:', error);
    res.status(500).json({ 
      error: 'Failed to process discovery request',
      message: error.message 
    });
  }
});

// Helper function for contextual summaries
function getContextualSummary(selectedText: string): string {
  const lowerText = selectedText.toLowerCase();
  
  if (lowerText.includes('robert') || lowerText.includes('mapplethorpe')) {
    return `Robert Mapplethorpe was a pivotal figure in 1970s New York art scene. His controversial photography pushed boundaries while documenting the era's underground culture. His relationship with Patti Smith, chronicled in "Just Kids," represents one of the most significant artistic partnerships of the 20th century.`;
  }
  
  if (lowerText.includes('chelsea hotel')) {
    return `The Chelsea Hotel was the epicenter of bohemian New York from the 1960s-70s. Home to artists like Dylan Thomas, Leonard Cohen, and Janis Joplin, it wasn't just a residence but a creative laboratory where music, literature, and visual arts collided.`;
  }
  
  if (lowerText.includes('patti') || lowerText.includes('smith')) {
    return `Patti Smith emerged as the "punk poet laureate" of the 1970s, fusing rock and poetry in groundbreaking ways. Her journey from St. Mark's poetry readings to international stardom redefined what it meant to be a female artist in rock.`;
  }
  
  return `This passage from "Just Kids" captures a moment in the transformation of American culture. The late 1960s and early 1970s in New York saw an unprecedented collision of art, music, and literature.`;
}

export default router;