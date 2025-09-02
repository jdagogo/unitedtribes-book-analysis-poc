import express from 'express';

const router = express.Router();

// Mock entity database - replace with actual data source
const entityDatabase = {
  'robert mapplethorpe': {
    title: 'Robert Mapplethorpe',
    summary: 'American photographer known for his black-and-white photographs. His work featured an array of subjects, including celebrity portraits, male and female nudes, self-portraits, and still-life images.',
    culturalContext: 'A central figure in the New York art scene of the 1970s and 1980s, Mapplethorpe\'s work coincided with and documented the rise of the gay liberation movement and the devastating impact of the AIDS epidemic.',
    timeline: {
      year: '1970-1989',
      context: 'Active during the height of New York\'s underground art scene'
    },
    relatedMedia: [
      {
        type: 'music',
        title: 'Horses',
        creator: 'Patti Smith',
        year: '1975',
        link: 'https://open.spotify.com/album/5U4dnRZsfW8NmwBBkELFPh'
      },
      {
        type: 'film',
        title: 'Mapplethorpe: Look at the Pictures',
        creator: 'HBO Documentary',
        year: '2016'
      },
      {
        type: 'venue',
        title: 'Chelsea Hotel',
        creator: 'Historic Landmark',
        year: '1960s-1970s'
      }
    ],
    connections: [
      {
        name: 'Patti Smith',
        relationship: 'Partner, muse, and lifelong friend',
        significance: 'Their relationship defined much of the 1970s New York art scene'
      },
      {
        name: 'Andy Warhol',
        relationship: 'Contemporary and occasional subject',
        significance: 'Part of the same downtown art circle'
      },
      {
        name: 'Sam Wagstaff',
        relationship: 'Mentor and patron',
        significance: 'Provided crucial early support and guidance'
      }
    ],
    quotes: [
      {
        text: 'I don\'t believe in dogmas and ideologies. I see life as an adventure.',
        source: 'Robert Mapplethorpe, 1988 Interview'
      }
    ]
  },
  'patti smith': {
    title: 'Patti Smith',
    summary: 'American singer, songwriter, poet, painter, and author who became an influential component of the New York City punk rock movement with her 1975 debut album Horses.',
    culturalContext: 'Known as the "punk poet laureate," Smith fused rock and poetry in her work. Her most widely known song is "Because the Night," which was co-written with Bruce Springsteen.',
    timeline: {
      year: '1967-present',
      context: 'From poetry readings at St. Mark\'s to international rock icon'
    },
    relatedMedia: [
      {
        type: 'music',
        title: 'Horses',
        creator: 'Patti Smith',
        year: '1975',
        link: 'https://open.spotify.com/album/5U4dnRZsfW8NmwBBkELFPh'
      },
      {
        type: 'book',
        title: 'Just Kids',
        creator: 'Patti Smith',
        year: '2010'
      },
      {
        type: 'venue',
        title: 'CBGB',
        creator: 'Legendary Music Venue',
        year: '1970s'
      }
    ],
    connections: [
      {
        name: 'Robert Mapplethorpe',
        relationship: 'Partner, muse, and lifelong friend',
        significance: 'Their relationship is chronicled in her memoir "Just Kids"'
      },
      {
        name: 'Allen Ginsberg',
        relationship: 'Mentor and fellow poet',
        significance: 'Influenced her fusion of poetry and rock'
      },
      {
        name: 'Bob Dylan',
        relationship: 'Musical influence and occasional collaborator',
        significance: 'Major influence on her songwriting style'
      }
    ],
    quotes: [
      {
        text: 'I wanted to be like Paul Verlaine, and I became Patti Smith.',
        source: 'Just Kids, 2010'
      }
    ]
  },
  'chelsea hotel': {
    title: 'The Chelsea Hotel',
    summary: 'A historic New York City hotel known as a bohemian cultural hub and home to numerous artists, writers, and musicians from the 1950s through the 1970s.',
    culturalContext: 'The Chelsea Hotel was not just a residence but a creative laboratory where artists of all disciplines lived, worked, and collaborated. It became synonymous with bohemian New York.',
    timeline: {
      year: '1960s-1970s',
      context: 'Golden era of artistic residents'
    },
    relatedMedia: [
      {
        type: 'music',
        title: 'Chelsea Hotel #2',
        creator: 'Leonard Cohen',
        year: '1974'
      },
      {
        type: 'film',
        title: 'Chelsea Girls',
        creator: 'Andy Warhol',
        year: '1966'
      },
      {
        type: 'book',
        title: 'Just Kids',
        creator: 'Patti Smith',
        year: '2010'
      }
    ],
    connections: [
      {
        name: 'Patti Smith & Robert Mapplethorpe',
        relationship: 'Residents',
        significance: 'Lived there during their formative years as artists'
      },
      {
        name: 'Leonard Cohen',
        relationship: 'Resident and chronicler',
        significance: 'Wrote famous songs about the hotel and its inhabitants'
      },
      {
        name: 'Janis Joplin',
        relationship: 'Frequent resident',
        significance: 'Part of the hotel\'s rock and roll legacy'
      }
    ],
    quotes: [
      {
        text: 'The Chelsea was like a doll\'s house in the Twilight Zone, with a hundred rooms, each a small universe.',
        source: 'Patti Smith, Just Kids'
      }
    ]
  }
};

// Discovery endpoint
router.post('/discover', async (req, res) => {
  try {
    const { selectedText, userContext } = req.body;
    
    if (!selectedText) {
      return res.status(400).json({ error: 'Selected text is required' });
    }

    // Simple entity matching - in production, use NLP
    const lowerText = selectedText.toLowerCase();
    let matchedEntity = null;

    // Check for entity matches
    for (const [key, entity] of Object.entries(entityDatabase)) {
      if (lowerText.includes(key) || key.includes(lowerText)) {
        matchedEntity = entity;
        break;
      }
    }

    // If no exact match, search for partial matches
    if (!matchedEntity) {
      for (const [key, entity] of Object.entries(entityDatabase)) {
        const keywords = key.split(' ');
        if (keywords.some(keyword => lowerText.includes(keyword))) {
          matchedEntity = entity;
          break;
        }
      }
    }

    // If still no match, return a generic response
    if (!matchedEntity) {
      matchedEntity = {
        title: 'Cultural Discovery',
        summary: `Exploring: "${selectedText}"`,
        culturalContext: userContext ? 
          `You asked about: ${userContext}. This text appears in "Just Kids" by Patti Smith, a memoir about the New York art scene of the 1960s and 1970s.` :
          'This passage appears in "Just Kids," Patti Smith\'s memoir of her relationship with Robert Mapplethorpe and their emergence as artists in New York City.',
        timeline: {
          year: '1967-1975',
          context: 'The period covered in "Just Kids"'
        },
        relatedMedia: [
          {
            type: 'book',
            title: 'Just Kids',
            creator: 'Patti Smith',
            year: '2010'
          }
        ],
        connections: [],
        quotes: []
      };
    }

    // Add context-specific information if provided
    if (userContext && matchedEntity) {
      // In production, use AI to generate context-aware responses
      matchedEntity = {
        ...matchedEntity,
        contextualNote: `Based on your interest in "${userContext}", here's relevant information about ${matchedEntity.title}.`
      };
    }

    // Simulate processing delay
    setTimeout(() => {
      res.json({
        success: true,
        discovery: matchedEntity,
        selectedText,
        userContext
      });
    }, 500);

  } catch (error) {
    console.error('Discovery error:', error);
    res.status(500).json({ 
      error: 'Failed to process discovery request',
      message: error.message 
    });
  }
});

// Get all available entities
router.get('/entities', (req, res) => {
  const entities = Object.keys(entityDatabase).map(key => ({
    id: key,
    title: entityDatabase[key].title,
    type: 'cultural_reference'
  }));
  
  res.json({ entities });
});

// Get specific entity details
router.get('/entity/:id', (req, res) => {
  const { id } = req.params;
  const entity = entityDatabase[id.toLowerCase()];
  
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found' });
  }
  
  res.json({ entity });
});

export default router;