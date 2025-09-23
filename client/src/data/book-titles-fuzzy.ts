/**
 * Comprehensive book titles recognition with fuzzy matching
 * 44 verified books from Just Kids
 */

export interface BookTitle {
  id: string;
  fullTitle: string;
  author: string;
  variations: string[];
  patterns?: RegExp[];
}

// Helper function to generate common variations
function generateVariations(title: string): string[] {
  const variations: string[] = [title];
  
  // Remove leading articles
  const withoutArticle = title.replace(/^(The|A|An)\s+/i, '');
  if (withoutArticle !== title) {
    variations.push(withoutArticle);
  }
  
  // Handle subtitles (everything after colon)
  if (title.includes(':')) {
    const beforeColon = title.split(':')[0].trim();
    variations.push(beforeColon);
    // Also add version without article
    const beforeColonNoArticle = beforeColon.replace(/^(The|A|An)\s+/i, '');
    if (beforeColonNoArticle !== beforeColon) {
      variations.push(beforeColonNoArticle);
    }
  }
  
  // Handle Roman numerals
  if (title.match(/\b(II|2)\b/)) {
    variations.push(title.replace(/\bII\b/, '2'));
    variations.push(title.replace(/\b2\b/, 'II'));
  }
  
  return [...new Set(variations)]; // Remove duplicates
}

export const BOOK_TITLES: BookTitle[] = [
  {
    id: 'foxes-book-of-martyrs',
    fullTitle: "Foxe's Book of Martyrs",
    author: 'John Foxe',
    variations: [
      "Foxe's Book of Martyrs",
      "Book of Martyrs",
      "Foxes Book of Martyrs" // Without apostrophe
    ]
  },
  {
    id: 'shoes-of-fisherman',
    fullTitle: 'The Shoes of the Fisherman',
    author: 'Morris L. West',
    variations: [
      'The Shoes of the Fisherman',
      'Shoes of the Fisherman'
    ]
  },
  {
    id: 'red-shoes',
    fullTitle: 'The Red Shoes',
    author: 'Barbara Bazilian',
    variations: [
      'The Red Shoes',
      'Red Shoes'
    ]
  },
  {
    id: 'childs-garden',
    fullTitle: "A Child's Garden of Verses",
    author: 'Robert Louis Stevenson',
    variations: [
      "A Child's Garden of Verses",
      "Child's Garden of Verses",
      "A Child's Garden",
      "Child's Garden",
      "Garden of Verses"
    ]
  },
  {
    id: 'little-women',
    fullTitle: 'Little Women',
    author: 'Louisa May Alcott',
    variations: ['Little Women']
  },
  {
    id: 'diego-rivera',
    fullTitle: 'The Fabulous Life of Diego Rivera',
    author: 'Bertram D. Wolfe',
    variations: [
      'The Fabulous Life of Diego Rivera',
      'Fabulous Life of Diego Rivera',
      'Life of Diego Rivera'
    ]
  },
  {
    id: 'illuminations',
    fullTitle: 'Illuminations',
    author: 'Arthur Rimbaud',
    variations: ['Illuminations']
  },
  {
    id: 'love-left-bank',
    fullTitle: 'Love on the Left Bank',
    author: 'Ed van der Elsken',
    variations: [
      'Love on the Left Bank',
      'Love on the Left',
      'Left Bank'
    ]
  },
  {
    id: 'collages',
    fullTitle: 'Collages',
    author: 'Anaïs Nin',
    variations: ['Collages']
  },
  {
    id: 'songs-innocence',
    fullTitle: 'Songs of Innocence and of Experience',
    author: 'William Blake',
    variations: [
      'Songs of Innocence and of Experience',
      'Songs of Innocence and Experience',
      'Songs of Innocence',
      'Songs of Experience'
    ]
  },
  {
    id: 'america-prophecy',
    fullTitle: 'America: A Prophecy',
    author: 'William Blake',
    variations: [
      'America: A Prophecy',
      'America A Prophecy',
      'America'
    ]
  },
  {
    id: 'milton-poem',
    fullTitle: 'Milton: A Poem',
    author: 'William Blake',
    variations: [
      'Milton: A Poem',
      'Milton A Poem',
      'Milton'
    ]
  },
  {
    id: 'glass-menagerie',
    fullTitle: 'The Glass Menagerie',
    author: 'Tennessee Williams',
    variations: [
      'The Glass Menagerie',
      'Glass Menagerie'
    ]
  },
  {
    id: 'psychedelic-prayers',
    fullTitle: 'Psychedelic Prayers: And Other Meditations',
    author: 'Timothy Leary',
    variations: [
      'Psychedelic Prayers: And Other Meditations',
      'Psychedelic Prayers And Other Meditations',
      'Psychedelic Prayers',
      'Other Meditations'
    ]
  },
  {
    id: 'electric-koolaid',
    fullTitle: 'The Electric Kool-Aid Acid Test',
    author: 'Tom Wolfe',
    variations: [
      'The Electric Kool-Aid Acid Test',
      'Electric Kool-Aid Acid Test',
      'The Electric Kool Aid Acid Test', // Without hyphens
      'Electric Kool Aid Acid Test',
      'Kool-Aid Acid Test'
    ]
  },
  {
    id: 'miracle-rose',
    fullTitle: 'Miracle of the Rose',
    author: 'Jean Genet',
    variations: [
      'Miracle of the Rose',
      'The Miracle of the Rose'
    ]
  },
  {
    id: 'diary-young-girl',
    fullTitle: 'The Diary of a Young Girl',
    author: 'Anne Frank',
    variations: [
      'The Diary of a Young Girl',
      'Diary of a Young Girl',
      "Anne Frank's Diary",
      'The Diary of Anne Frank'
    ]
  },
  {
    id: 'ariel',
    fullTitle: 'Ariel',
    author: 'Sylvia Plath',
    variations: ['Ariel']
  },
  {
    id: 'love-lewisham',
    fullTitle: 'Love and Mr. Lewisham',
    author: 'H.G. Wells',
    variations: [
      'Love and Mr. Lewisham',
      'Love and Mr Lewisham', // Without period
      'Love and Mr.\nLewisham', // With line break
      'Love and Mr\nLewisham' // With line break, no period
    ]
  },
  {
    id: 'warhol-index',
    fullTitle: "Andy Warhol's Index",
    author: 'Andy Warhol',
    variations: [
      "Andy Warhol's Index",
      "Andy Warhols Index",
      "Warhol's Index",
      'Index'
    ]
  },
  {
    id: 'east-of-eden',
    fullTitle: 'East of Eden',
    author: 'John Steinbeck',
    variations: ['East of Eden']
  },
  {
    id: 'junky',
    fullTitle: 'Junky',
    author: 'William S. Burroughs',
    variations: ['Junky', 'Junkie']
  },
  {
    id: 'doctor-martino',
    fullTitle: 'Doctor Martino & Other Stories',
    author: 'William Faulkner',
    variations: [
      'Doctor Martino & Other Stories',
      'Doctor Martino and Other Stories',
      'Doctor Martino',
      'Dr. Martino'
    ]
  },
  {
    id: 'crazy-horse',
    fullTitle: 'Crazy Horse: The Strange Man of the Oglalas',
    author: 'Mari Sandoz',
    variations: [
      'Crazy Horse: The Strange Man of the Oglalas',
      'Crazy Horse The Strange Man of the Oglalas',
      'Crazy Horse'
    ]
  },
  {
    id: 'brighton-rock',
    fullTitle: 'Brighton Rock',
    author: 'Graham Greene',
    variations: ['Brighton Rock']
  },
  {
    id: 'mahagonny',
    fullTitle: 'The Rise and Fall of the City of Mahagonny',
    author: 'Bertolt Brecht',
    variations: [
      'The Rise and Fall of the City of Mahagonny',
      'Rise and Fall of the City of Mahagonny',
      'City of Mahagonny',
      'Mahagonny'
    ]
  },
  {
    id: 'golden-bough',
    fullTitle: 'The Golden Bough',
    author: 'James George Frazer',
    variations: [
      'The Golden Bough',
      'Golden Bough'
    ]
  },
  {
    id: 'diary-drug-fiend',
    fullTitle: 'Diary of a Drug Fiend',
    author: 'Aleister Crowley',
    variations: [
      'Diary of a Drug Fiend',
      'The Diary of a Drug Fiend'
    ]
  },
  {
    id: 'locus-solus',
    fullTitle: 'Locus Solus',
    author: 'Raymond Roussel',
    variations: ['Locus Solus']
  },
  {
    id: 'alice-wonderland',
    fullTitle: "Alice's Adventures in Wonderland",
    author: 'Lewis Carroll',
    variations: [
      "Alice's Adventures in Wonderland",
      "Alice Adventures in Wonderland",
      'Alice in Wonderland',
      "Alice's Adventures",
      'Alice'
    ]
  },
  {
    id: 'through-looking-glass',
    fullTitle: 'Through the Looking-Glass',
    author: 'Lewis Carroll',
    variations: [
      'Through the Looking-Glass',
      'Through the Looking Glass',
      'Looking-Glass',
      'Looking Glass'
    ]
  },
  {
    id: 'happy-birthday-death',
    fullTitle: 'The Happy Birthday of Death',
    author: 'Gregory Corso',
    variations: [
      'The Happy Birthday of Death',
      'Happy Birthday of Death'
    ]
  },
  {
    id: 'cains-book',
    fullTitle: "Cain's Book",
    author: 'Alexander Trocchi',
    variations: [
      "Cain's Book",
      "Cains Book"
    ]
  },
  {
    id: 'huckleberry-finn',
    fullTitle: 'The Adventures of Huckleberry Finn',
    author: 'Mark Twain',
    variations: [
      'The Adventures of Huckleberry Finn',
      'Adventures of Huckleberry Finn',
      'Huckleberry Finn',
      'Huck Finn'
    ]
  },
  {
    id: 'zelda',
    fullTitle: 'Zelda',
    author: 'Nancy Milford',
    variations: ['Zelda']
  },
  {
    id: 'holy-barbarians',
    fullTitle: 'The Holy Barbarians',
    author: 'Lawrence Lipton',
    variations: [
      'The Holy Barbarians',
      'Holy Barbarians'
    ]
  },
  {
    id: 'protest',
    fullTitle: 'Protest: The Beat Generation and the Angry Young Men',
    author: 'Gene Feldman',
    variations: [
      'Protest: The Beat Generation and the Angry Young Men',
      'Protest The Beat Generation and the Angry Young Men',
      'Protest',
      'The Beat Generation and the Angry Young Men',
      'Beat Generation and the Angry Young Men'
    ]
  },
  {
    id: 'age-of-rock',
    fullTitle: 'The Age of Rock 2: Sights and Sounds of the American Cultural Revolution',
    author: 'Jonathan Eisen',
    variations: [
      'The Age of Rock 2: Sights and Sounds of the American Cultural Revolution',
      'The Age of Rock 2',
      'Age of Rock 2',
      'The Age of Rock II',
      'Age of Rock II',
      'The Age of Rock',
      'Age of Rock'
    ]
  },
  {
    id: 'seventh-heaven',
    fullTitle: 'Seventh Heaven',
    author: 'Patti Smith',
    variations: ['Seventh Heaven']
  },
  {
    id: 'enfants-terribles',
    fullTitle: 'Les Enfants terribles',
    author: 'Jean Cocteau',
    variations: [
      'Les Enfants terribles',
      'Les Enfants Terribles',
      'The Enfants Terribles',
      'Enfants Terribles'
    ]
  },
  {
    id: 'love-affair',
    fullTitle: 'Love Affair: A Memoir of Jackson Pollock',
    author: 'Ruth Kligman',
    variations: [
      'Love Affair: A Memoir of Jackson Pollock',
      'Love Affair A Memoir of Jackson Pollock',
      'Love Affair',
      'Memoir of Jackson Pollock'
    ]
  },
  {
    id: 'witt',
    fullTitle: 'Witt',
    author: 'Patti Smith',
    variations: ['Witt']
  },
  {
    id: 'season-in-hell',
    fullTitle: 'A Season in Hell',
    author: 'Arthur Rimbaud',
    variations: [
      'A Season in Hell',
      'Season in Hell'
    ]
  },
  {
    id: 'women-cairo',
    fullTitle: 'The Women Of Cairo Volume One',
    author: 'Gérard de Nerval',
    variations: [
      'The Women Of Cairo Volume One',
      'Women Of Cairo Volume One',
      'The Women Of Cairo',
      'Women Of Cairo',
      'Women of Cairo'
    ]
  },
  {
    id: 'death-venice',
    fullTitle: 'Death in Venice and Other Tales',
    author: 'Thomas Mann',
    variations: [
      'Death in Venice and Other Tales',
      'Death in Venice',
      'Death In Venice'
    ]
  }
];

/**
 * Find book title matches in text with fuzzy logic
 */
export function findBookTitles(text: string): Array<{
  bookId: string;
  title: string;
  author: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}> {
  const matches: Array<{
    bookId: string;
    title: string;
    author: string;
    matchedText: string;
    startIndex: number;
    endIndex: number;
  }> = [];
  
  // Debug: Check for Lewisham specifically
  if (text.toLowerCase().includes('lewisham')) {
    console.log('🔍 [FUZZY] Text contains "Lewisham"');
    // Find context around Lewisham
    const index = text.toLowerCase().indexOf('lewisham');
    const context = text.substring(Math.max(0, index - 50), Math.min(text.length, index + 50));
    console.log('🔍 [FUZZY] Context:', context);
  }
  
  // Check each book's variations
  for (const book of BOOK_TITLES) {
    for (const variation of book.variations) {
      const normalizedVariation = variation.toLowerCase();
      
      // Split the variation into words to handle more complex matching
      const words = normalizedVariation.split(/\s+/);
      
      // Build a regex that's flexible with whitespace and punctuation
      // Handle "Love and Mr. Lewisham" even with line breaks or periods
      let pattern = '';
      for (let i = 0; i < words.length; i++) {
        // Escape the word for regex, but handle Mr./Mr separately
        let wordPattern = words[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Special case for "Mr" - allow optional period
        if (words[i] === 'mr') {
          wordPattern = 'mr\\.?';
        }
        
        pattern += wordPattern;
        
        // Add flexible whitespace between words (but not after the last word)
        if (i < words.length - 1) {
          // Allow any whitespace including newlines, MORE space for line breaks
          pattern += '[\\s\\n\\r.]{0,10}';
        }
      }
      
      // Create regex with word boundaries
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      
      // Debug Lewisham matching
      if (book.id === 'love-lewisham') {
        console.log(`🔍 [FUZZY] Testing pattern for "${variation}"`);
        console.log(`🔍 [FUZZY] Regex pattern: ${pattern}`);
        console.log(`🔍 [FUZZY] Full regex: ${regex}`);
      }
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (book.id === 'love-lewisham') {
          console.log(`✅ [FUZZY] MATCHED: "${match[0]}" at position ${match.index}`);
        }
        matches.push({
          bookId: book.id,
          title: book.fullTitle,
          author: book.author,
          matchedText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
      
      // If no match for Lewisham, log why
      if (book.id === 'love-lewisham' && !regex.test(text)) {
        console.log(`❌ [FUZZY] No match for "${variation}" with pattern: ${pattern}`);
      }
    }
  }
  
  // First, sort by length (longest first) to prioritize complete titles
  matches.sort((a, b) => {
    const lengthA = a.endIndex - a.startIndex;
    const lengthB = b.endIndex - b.startIndex;
    return lengthB - lengthA;
  });
  
  // Remove overlapping matches (keeping the longest ones)
  const filteredMatches = [];
  
  for (const match of matches) {
    // Check if this match overlaps with any already selected match
    const overlaps = filteredMatches.some(selected => {
      return (match.startIndex < selected.endIndex && match.endIndex > selected.startIndex);
    });
    
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }
  
  // Finally, sort by position in text for consistent output
  filteredMatches.sort((a, b) => a.startIndex - b.startIndex);
  
  return filteredMatches;
}

/**
 * Check if a given text matches any book title (for validation)
 */
export function isBookTitle(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  
  for (const book of BOOK_TITLES) {
    for (const variation of book.variations) {
      if (normalizedText === variation.toLowerCase()) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get book information by matched text
 */
export function getBookByText(text: string): BookTitle | null {
  const normalizedText = text.toLowerCase().trim();
  
  for (const book of BOOK_TITLES) {
    for (const variation of book.variations) {
      if (normalizedText === variation.toLowerCase()) {
        return book;
      }
    }
  }
  
  return null;
}