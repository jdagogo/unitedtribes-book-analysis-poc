/**
 * Media Discovery Entity Extractor
 * Focused on extracting discoverable cultural content from "Just Kids" by Patti Smith
 * Prioritizes artists, musicians, venues, books, and cultural references users can explore
 */

interface MediaEntity {
  name: string;
  type: 'musician' | 'artist' | 'author' | 'venue' | 'work' | 'label' | 'movement';
  category: string;
  discoveryType: string; // What kind of discovery this enables
  count: number;
  confidence: number;
}

// Known entities from "Just Kids" - curated list of discoverable content
const JUST_KIDS_ENTITIES = {
  musicians: [
    // Major musicians and bands mentioned
    'Bob Dylan', 'Jimi Hendrix', 'Janis Joplin', 'Jim Morrison', 'The Doors',
    'The Rolling Stones', 'The Velvet Underground', 'Lou Reed', 'John Coltrane',
    'Tim Buckley', 'Tim Hardin', 'Neil Young', 'Joni Mitchell', 'Leonard Cohen',
    'Iggy Pop', 'The Stooges', 'MC5', 'Blue Öyster Cult', 'Television',
    'The Ramones', 'Blondie', 'Talking Heads', 'Richard Hell', 'Tom Verlaine',
    'Johnny Thunders', 'The New York Dolls', 'Wayne County', 'The Heartbreakers',
    'Lenny Kaye', 'Jay Dee Daugherty', 'Ivan Kral', 'Richard Sohl',
    'Brian Jones', 'Keith Richards', 'Mick Jagger', 'Marianne Faithfull',
    'Edie Sedgwick', 'Nico', 'John Lennon', 'Yoko Ono', 'Harry Smith',
    'Captain Beefheart', 'Frank Zappa', 'Little Richard', 'Chuck Berry',
    'Buddy Holly', 'Eddie Cochran', 'Gene Vincent', 'The Everly Brothers',
    'Roy Orbison', 'The Ronettes', 'The Crystals', 'The Shangri-Las',
    'Smokey Robinson', 'The Temptations', 'Marvin Gaye', 'Stevie Wonder',
    'Aretha Franklin', 'James Brown', 'Otis Redding', 'Wilson Pickett',
    'Sam Cooke', 'Curtis Mayfield', 'Sly Stone', 'Jimi Hendrix Experience',
    'Cream', 'The Who', 'The Kinks', 'The Animals', 'The Yardbirds',
    'Jefferson Airplane', 'The Grateful Dead', 'The Byrds', 'Buffalo Springfield',
    'Crosby, Stills, Nash & Young', 'The Band', 'Van Morrison'
  ],
  
  artists: [
    // Visual artists and photographers
    'Robert Mapplethorpe', 'Andy Warhol', 'William Blake', 'Jackson Pollock',
    'Willem de Kooning', 'Mark Rothko', 'Francis Bacon', 'Jean-Michel Basquiat',
    'Keith Haring', 'Salvador Dalí', 'Pablo Picasso', 'Henri Matisse',
    'Paul Cézanne', 'Vincent van Gogh', 'Claude Monet', 'Edgar Degas',
    'Auguste Rodin', 'Constantin Brâncuși', 'Marcel Duchamp', 'Man Ray',
    'Diego Rivera', 'Frida Kahlo', 'Georgia O\'Keeffe', 'Edward Hopper',
    'Norman Rockwell', 'Diane Arbus', 'Richard Avedon', 'Irving Penn',
    'Robert Frank', 'Walker Evans', 'Dorothea Lange', 'Ansel Adams',
    'Minor White', 'Edward Weston', 'Alfred Stieglitz', 'Paul Strand',
    'Henri Cartier-Bresson', 'Brassaï', 'Bill Brandt', 'Cecil Beaton',
    'David Bailey', 'Helmut Newton', 'Guy Bourdin', 'Deborah Turbeville',
    'Sandy Skoglund', 'Cindy Sherman', 'Nan Goldin', 'Larry Clark',
    'Bruce Weber', 'Herb Ritts', 'Annie Leibovitz', 'Mary Ellen Mark'
  ],
  
  authors: [
    // Writers, poets, and playwrights
    'Arthur Rimbaud', 'Jean Genet', 'William Burroughs', 'Allen Ginsberg',
    'Jack Kerouac', 'Gregory Corso', 'Lawrence Ferlinghetti', 'Gary Snyder',
    'Michael McClure', 'Philip Whalen', 'Diane di Prima', 'Anne Waldman',
    'William Blake', 'Walt Whitman', 'Emily Dickinson', 'Sylvia Plath',
    'Anne Sexton', 'Robert Lowell', 'John Berryman', 'Theodore Roethke',
    'W.H. Auden', 'T.S. Eliot', 'Ezra Pound', 'William Carlos Williams',
    'Wallace Stevens', 'Hart Crane', 'e.e. cummings', 'Langston Hughes',
    'James Baldwin', 'Richard Wright', 'Ralph Ellison', 'Toni Morrison',
    'Maya Angelou', 'Amiri Baraka', 'Ishmael Reed', 'Charles Bukowski',
    'Henry Miller', 'Anaïs Nin', 'Jean Cocteau', 'André Gide',
    'Albert Camus', 'Jean-Paul Sartre', 'Simone de Beauvoir', 'Samuel Beckett',
    'Tennessee Williams', 'Edward Albee', 'Sam Shepard', 'David Mamet',
    'John Guare', 'Lanford Wilson', 'Charles Ludlam', 'Robert Wilson',
    'Richard Foreman', 'The Living Theatre', 'Judith Malina', 'Julian Beck',
    'Federico García Lorca', 'Pablo Neruda', 'Octavio Paz', 'Jorge Luis Borges',
    'Gabriel García Márquez', 'Julio Cortázar', 'Roberto Bolaño'
  ],
  
  venues: [
    // Cultural venues and locations
    'Chelsea Hotel', 'Max\'s Kansas City', 'CBGB', 'The Bottom Line',
    'The Bitter End', 'Cafe Wha?', 'The Gaslight Cafe', 'Gerde\'s Folk City',
    'The Village Gate', 'The Village Vanguard', 'The Blue Note', 'Birdland',
    'The Apollo Theater', 'The Fillmore East', 'The Electric Circus',
    'The Dom', 'The Factory', 'Studio 54', 'The Mudd Club', 'The Limelight',
    'Area', 'Danceteria', 'The Ritz', 'The Palladium', 'The Saint',
    'Paradise Garage', 'The Gallery', 'The Loft', 'The Continental Baths',
    'Mickey\'s', 'The Mercer Arts Center', 'The Kitchen', 'The Poetry Project',
    'St. Mark\'s Church', 'The Nuyorican Poets Cafe', 'The Bowery Poetry Club',
    'The Living Theatre', 'La MaMa', 'The Public Theater', 'Lincoln Center',
    'Carnegie Hall', 'Madison Square Garden', 'Shea Stadium', 'Yankee Stadium',
    'The Metropolitan Museum', 'MoMA', 'The Guggenheim', 'The Whitney',
    'The Brooklyn Museum', 'The New Museum', 'The Dia Art Foundation',
    'The Drawing Center', 'Artists Space', 'The Alternative Museum',
    'P.S.1', 'The Clocktower', 'Franklin Furnace', 'The Performing Garage',
    'The Wooster Group', 'The Kitchen', 'The Anthology Film Archives',
    'The Millennium Film Workshop', 'The Film-Makers\' Cinematheque'
  ],
  
  works: [
    // Albums, books, films that are mentioned
    'Horses', 'Radio Ethiopia', 'Easter', 'Wave', 'Dream of Life',
    'Gone Again', 'Peace and Noise', 'Gung Ho', 'Trampin\'', 'Twelve',
    'Banga', 'Outside Society', 'The Coral Sea', 'Babel', 'Auguries of Innocence',
    'Woolgathering', 'Early Work', 'The Coral Sea', 'Strange Messenger',
    'Patti Smith Complete', 'Land', 'Just Kids', 'M Train', 'Devotion',
    'Year of the Monkey', 'A Book of Days', 'The Freewheelin\' Bob Dylan',
    'Highway 61 Revisited', 'Blonde on Blonde', 'Blood on the Tracks',
    'The Velvet Underground & Nico', 'White Light/White Heat', 'The Velvet Underground',
    'Loaded', 'Transformer', 'Berlin', 'Rock \'n\' Roll Animal', 'Sally Can\'t Dance',
    'Metal Machine Music', 'Coney Island Baby', 'The Doors', 'Strange Days',
    'Waiting for the Sun', 'The Soft Parade', 'Morrison Hotel', 'L.A. Woman',
    'An American Prayer', 'Are You Experienced', 'Axis: Bold as Love',
    'Electric Ladyland', 'Band of Gypsys', 'The Cry of Love', 'Rainbow Bridge',
    'Let It Bleed', 'Sticky Fingers', 'Exile on Main St.', 'Some Girls',
    'Tattoo You', 'Steel Wheels', 'Voodoo Lounge', 'Bridges to Babylon'
  ],
  
  labels: [
    // Record labels and publishers
    'Arista Records', 'Columbia Records', 'RCA Records', 'Elektra Records',
    'Atlantic Records', 'Warner Bros. Records', 'Capitol Records', 'Decca Records',
    'Verve Records', 'Blue Note Records', 'Impulse! Records', 'Prestige Records',
    'Riverside Records', 'ECM Records', 'CTI Records', 'A&M Records',
    'Island Records', 'Chrysalis Records', 'Virgin Records', 'Rough Trade Records',
    'Factory Records', 'Mute Records', '4AD', 'Beggars Banquet', 'Stiff Records',
    'Sire Records', 'Seymour Stein', 'CBGB Records', 'Max\'s Kansas City Records',
    'Mer Records', 'Ork Records', 'Shake Records', 'Spy Records', 'Twin/Tone Records'
  ],
  
  movements: [
    // Cultural and artistic movements
    'Beat Generation', 'The New York School', 'Abstract Expressionism',
    'Pop Art', 'Minimalism', 'Conceptual Art', 'Performance Art',
    'Punk Rock', 'New Wave', 'No Wave', 'Post-Punk', 'Proto-Punk',
    'Glam Rock', 'Art Rock', 'Garage Rock', 'Psychedelic Rock',
    'Folk Revival', 'The British Invasion', 'Motown', 'Stax',
    'The Warhol Factory', 'The Chelsea Hotel Scene', 'CBGB Scene',
    'Max\'s Kansas City Scene', 'The Lower East Side', 'The East Village',
    'SoHo', 'Tribeca', 'The Bowery', 'Greenwich Village', 'The West Village'
  ]
};

/**
 * Extract media discovery entities from text
 * Focuses on named entities that users can explore further
 */
export function extractMediaDiscoveryEntities(text: string): MediaEntity[] {
  const entities = new Map<string, MediaEntity>();
  
  // Normalize text for searching while preserving original for context
  const normalizedText = text.replace(/\s+/g, ' ');
  
  // Process each category of known entities
  Object.entries(JUST_KIDS_ENTITIES).forEach(([category, entityList]) => {
    entityList.forEach(entityName => {
      // Create variations for matching
      const variations = [
        entityName,
        entityName.toLowerCase(),
        entityName.replace(/'/g, ''), // Handle apostrophes
        entityName.replace(/[^\w\s]/g, '') // Remove special chars
      ];
      
      let count = 0;
      variations.forEach(variation => {
        // Count occurrences with word boundaries
        const regex = new RegExp(`\\b${escapeRegExp(variation)}\\b`, 'gi');
        const matches = normalizedText.match(regex);
        if (matches) {
          count += matches.length;
        }
      });
      
      if (count > 0) {
        // Determine the type and discovery category
        let type: MediaEntity['type'];
        let discoveryType: string;
        let categoryName: string;
        
        switch (category) {
          case 'musicians':
            type = 'musician';
            discoveryType = 'Music to explore';
            categoryName = 'Musicians & Bands';
            break;
          case 'artists':
            type = 'artist';
            discoveryType = 'Art to discover';
            categoryName = 'Visual Artists';
            break;
          case 'authors':
            type = 'author';
            discoveryType = 'Literature to read';
            categoryName = 'Writers & Poets';
            break;
          case 'venues':
            type = 'venue';
            discoveryType = 'Cultural locations';
            categoryName = 'Venues & Places';
            break;
          case 'works':
            type = 'work';
            discoveryType = 'Creative works';
            categoryName = 'Albums & Books';
            break;
          case 'labels':
            type = 'label';
            discoveryType = 'Music labels';
            categoryName = 'Record Labels';
            break;
          case 'movements':
            type = 'movement';
            discoveryType = 'Cultural movements';
            categoryName = 'Movements & Scenes';
            break;
          default:
            type = 'work';
            discoveryType = 'Content to explore';
            categoryName = 'Other';
        }
        
        entities.set(entityName, {
          name: entityName,
          type,
          category: categoryName,
          discoveryType,
          count,
          confidence: 1.0 // High confidence for known entities
        });
      }
    });
  });
  
  // Also look for quoted works that might not be in our list
  const quotedPattern = /"([A-Z][^"]{2,50})"/g;
  let match;
  while ((match = quotedPattern.exec(normalizedText)) !== null) {
    const quotedText = match[1];
    
    // Filter out common phrases that aren't works
    const excludedPhrases = [
      'but I', 'But I', 'and I', 'And I', 'I\'m', 'I am', 'I was', 'I had',
      'he said', 'she said', 'they said', 'I said', 'we said',
      'he was', 'she was', 'they were', 'we were', 'you were',
      'it was', 'It was', 'there was', 'There was',
      'I\'ve', 'I\'ll', 'I\'d', 'can\'t', 'won\'t', 'don\'t'
    ];
    
    // Check if it's not an excluded phrase and looks like a title
    if (!excludedPhrases.some(phrase => quotedText.toLowerCase().includes(phrase.toLowerCase())) &&
        quotedText.length > 2 && 
        quotedText.length < 40 &&
        /^[A-Z]/.test(quotedText)) {
      
      // Check if we haven't already found this entity
      if (!entities.has(quotedText)) {
        entities.set(quotedText, {
          name: quotedText,
          type: 'work',
          category: 'Potential Works',
          discoveryType: 'Possible creative work',
          count: 1,
          confidence: 0.5 // Lower confidence for pattern-matched entities
        });
      }
    }
  }
  
  // Convert to array and sort by count (most mentioned first)
  const sortedEntities = Array.from(entities.values())
    .sort((a, b) => b.count - a.count);
  
  return sortedEntities;
}

/**
 * Helper function to escape regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Group entities by discovery category for UI display
 */
export function groupEntitiesByDiscovery(entities: MediaEntity[]): Record<string, MediaEntity[]> {
  const grouped: Record<string, MediaEntity[]> = {};
  
  entities.forEach(entity => {
    if (!grouped[entity.category]) {
      grouped[entity.category] = [];
    }
    grouped[entity.category].push(entity);
  });
  
  // Sort each group by count
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => b.count - a.count);
  });
  
  return grouped;
}

/**
 * Get top entities for quick discovery
 */
export function getTopDiscoverableEntities(entities: MediaEntity[], limit: number = 20): MediaEntity[] {
  // Prioritize high-confidence, high-count entities
  return entities
    .filter(e => e.confidence >= 0.8) // Only high-confidence entities
    .sort((a, b) => {
      // Sort by count * confidence
      const scoreA = a.count * a.confidence;
      const scoreB = b.count * b.confidence;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}