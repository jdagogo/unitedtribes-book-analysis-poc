/**
 * Author recognition with fuzzy matching
 * For the 44 verified books from Just Kids
 */

export interface Author {
  id: string;
  fullName: string;
  variations: string[];
}

export const AUTHORS: Author[] = [
  {
    id: 'john-foxe',
    fullName: 'John Foxe',
    variations: ['John Foxe', 'Foxe']
  },
  {
    id: 'morris-west',
    fullName: 'Morris L. West',
    variations: ['Morris L. West', 'Morris West', 'West']
  },
  {
    id: 'barbara-bazilian',
    fullName: 'Barbara Bazilian',
    variations: ['Barbara Bazilian', 'Bazilian']
  },
  {
    id: 'robert-louis-stevenson',
    fullName: 'Robert Louis Stevenson',
    variations: ['Robert Louis Stevenson', 'Stevenson']
  },
  {
    id: 'louisa-may-alcott',
    fullName: 'Louisa May Alcott',
    variations: ['Louisa May Alcott', 'Alcott']
  },
  {
    id: 'bertram-wolfe',
    fullName: 'Bertram D. Wolfe',
    variations: ['Bertram D. Wolfe', 'Bertram Wolfe', 'Wolfe']
  },
  {
    id: 'arthur-rimbaud',
    fullName: 'Arthur Rimbaud',
    variations: ['Arthur Rimbaud', 'Rimbaud']
  },
  {
    id: 'ed-van-der-elsken',
    fullName: 'Ed van der Elsken',
    variations: ['Ed van der Elsken', 'van der Elsken', 'Elsken']
  },
  {
    id: 'anais-nin',
    fullName: 'Anaïs Nin',
    variations: ['Anaïs Nin', 'Anais Nin', 'Nin']
  },
  {
    id: 'william-blake',
    fullName: 'William Blake',
    variations: ['William Blake', 'Blake']
  },
  {
    id: 'tennessee-williams',
    fullName: 'Tennessee Williams',
    variations: ['Tennessee Williams', 'Williams']
  },
  {
    id: 'timothy-leary',
    fullName: 'Timothy Leary',
    variations: ['Timothy Leary', 'Leary']
  },
  {
    id: 'tom-wolfe',
    fullName: 'Tom Wolfe',
    variations: ['Tom Wolfe', 'Wolfe']
  },
  {
    id: 'jean-genet',
    fullName: 'Jean Genet',
    variations: ['Jean Genet', 'Genet']
  },
  {
    id: 'anne-frank',
    fullName: 'Anne Frank',
    variations: ['Anne Frank', 'Frank']
  },
  {
    id: 'sylvia-plath',
    fullName: 'Sylvia Plath',
    variations: ['Sylvia Plath', 'Plath']
  },
  {
    id: 'hg-wells',
    fullName: 'H.G. Wells',
    variations: ['H.G. Wells', 'H. G. Wells', 'Wells']
  },
  {
    id: 'andy-warhol',
    fullName: 'Andy Warhol',
    variations: ['Andy Warhol', 'Warhol']
  },
  {
    id: 'john-steinbeck',
    fullName: 'John Steinbeck',
    variations: ['John Steinbeck', 'Steinbeck']
  },
  {
    id: 'william-burroughs',
    fullName: 'William S. Burroughs',
    variations: ['William S. Burroughs', 'William Burroughs', 'Burroughs']
  },
  {
    id: 'william-faulkner',
    fullName: 'William Faulkner',
    variations: ['William Faulkner', 'Faulkner']
  },
  {
    id: 'mari-sandoz',
    fullName: 'Mari Sandoz',
    variations: ['Mari Sandoz', 'Sandoz']
  },
  {
    id: 'graham-greene',
    fullName: 'Graham Greene',
    variations: ['Graham Greene', 'Greene']
  },
  {
    id: 'bertolt-brecht',
    fullName: 'Bertolt Brecht',
    variations: ['Bertolt Brecht', 'Brecht']
  },
  {
    id: 'james-frazer',
    fullName: 'James George Frazer',
    variations: ['James George Frazer', 'James Frazer', 'Frazer']
  },
  {
    id: 'aleister-crowley',
    fullName: 'Aleister Crowley',
    variations: ['Aleister Crowley', 'Crowley']
  },
  {
    id: 'raymond-roussel',
    fullName: 'Raymond Roussel',
    variations: ['Raymond Roussel', 'Roussel']
  },
  {
    id: 'lewis-carroll',
    fullName: 'Lewis Carroll',
    variations: ['Lewis Carroll', 'Carroll']
  },
  {
    id: 'gregory-corso',
    fullName: 'Gregory Corso',
    variations: ['Gregory Corso', 'Corso']
  },
  {
    id: 'alexander-trocchi',
    fullName: 'Alexander Trocchi',
    variations: ['Alexander Trocchi', 'Trocchi']
  },
  {
    id: 'mark-twain',
    fullName: 'Mark Twain',
    variations: ['Mark Twain', 'Twain']
  },
  {
    id: 'nancy-milford',
    fullName: 'Nancy Milford',
    variations: ['Nancy Milford', 'Milford']
  },
  {
    id: 'lawrence-lipton',
    fullName: 'Lawrence Lipton',
    variations: ['Lawrence Lipton', 'Lipton']
  },
  {
    id: 'gene-feldman',
    fullName: 'Gene Feldman',
    variations: ['Gene Feldman', 'Feldman']
  },
  {
    id: 'jonathan-eisen',
    fullName: 'Jonathan Eisen',
    variations: ['Jonathan Eisen', 'Eisen']
  },
  {
    id: 'patti-smith',
    fullName: 'Patti Smith',
    variations: ['Patti Smith'] // Don't match just "Smith" - too common
  },
  {
    id: 'jean-cocteau',
    fullName: 'Jean Cocteau',
    variations: ['Jean Cocteau', 'Cocteau']
  },
  {
    id: 'ruth-kligman',
    fullName: 'Ruth Kligman',
    variations: ['Ruth Kligman', 'Kligman']
  },
  {
    id: 'gerard-de-nerval',
    fullName: 'Gérard de Nerval',
    variations: ['Gérard de Nerval', 'Gerard de Nerval', 'de Nerval', 'Nerval']
  },
  {
    id: 'thomas-mann',
    fullName: 'Thomas Mann',
    variations: ['Thomas Mann', 'Mann']
  }
];

/**
 * Find author matches in text
 */
export function findAuthors(text: string): Array<{
  authorId: string;
  fullName: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
}> {
  const matches: Array<{
    authorId: string;
    fullName: string;
    matchedText: string;
    startIndex: number;
    endIndex: number;
  }> = [];
  
  // Check each author's variations
  for (const author of AUTHORS) {
    for (const variation of author.variations) {
      // Create a regex for this variation
      const escapedVariation = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedVariation}\\b`, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          authorId: author.id,
          fullName: author.fullName,
          matchedText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }
  }
  
  // Sort by length (longest first) to prioritize full names
  matches.sort((a, b) => {
    const lengthA = a.endIndex - a.startIndex;
    const lengthB = b.endIndex - b.startIndex;
    return lengthB - lengthA;
  });
  
  // Remove overlapping matches (keep longest)
  const filteredMatches = [];
  for (const match of matches) {
    const overlaps = filteredMatches.some(selected => {
      return (match.startIndex < selected.endIndex && match.endIndex > selected.startIndex);
    });
    
    if (!overlaps) {
      filteredMatches.push(match);
    }
  }
  
  // Sort by position for consistent output
  filteredMatches.sort((a, b) => a.startIndex - b.startIndex);
  
  return filteredMatches;
}