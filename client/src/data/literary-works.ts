// Complete list of 44 books mentioned in "Just Kids" from Goodreads
// This provides reliable entity recognition for literary works

export interface LiteraryWork {
  title: string;
  author: string;
  variations?: string[];
  type: 'book' | 'poetry' | 'play' | 'essay';
}

export const LITERARY_WORKS: LiteraryWork[] = [
  {
    title: "Foxe's Book of Martyrs",
    author: "John Foxe",
    variations: ["Book of Martyrs", "Foxe's Book of Martyrs"],
    type: "book"
  },
  {
    title: "The Shoes of the Fisherman",
    author: "Morris L. West",
    variations: ["Shoes of the Fisherman"],
    type: "book"
  },
  {
    title: "The Red Shoes",
    author: "Barbara Bazilian",
    variations: ["Red Shoes"],
    type: "book"
  },
  {
    title: "A Child's Garden of Verses",
    author: "Robert Louis Stevenson",
    variations: ["Child's Garden of Verses"],
    type: "poetry"
  },
  {
    title: "Little Women",
    author: "Louisa May Alcott",
    variations: [],
    type: "book"
  },
  {
    title: "The Fabulous Life of Diego Rivera",
    author: "Bertram D. Wolfe",
    variations: ["Fabulous Life of Diego Rivera"],
    type: "book"
  },
  {
    title: "Illuminations",
    author: "Arthur Rimbaud",
    variations: [],
    type: "poetry"
  },
  {
    title: "Love on the Left Bank",
    author: "Ed van der Elsken",
    variations: [],
    type: "book"
  },
  {
    title: "Collages",
    author: "Anaïs Nin",
    variations: [],
    type: "book"
  },
  {
    title: "Songs of Innocence and of Experience",
    author: "William Blake",
    variations: ["Songs of Innocence", "Songs of Experience", "Songs of Innocence and Experience"],
    type: "poetry"
  },
  {
    title: "America: A Prophecy",
    author: "William Blake",
    variations: ["America A Prophecy"],
    type: "poetry"
  },
  {
    title: "Milton: A Poem",
    author: "William Blake",
    variations: ["Milton"],
    type: "poetry"
  },
  {
    title: "The Glass Menagerie",
    author: "Tennessee Williams",
    variations: ["Glass Menagerie"],
    type: "play"
  },
  {
    title: "Psychedelic Prayers: And Other Meditations",
    author: "Timothy Leary",
    variations: ["Psychedelic Prayers"],
    type: "book"
  },
  {
    title: "The Electric Kool-Aid Acid Test",
    author: "Tom Wolfe",
    variations: ["Electric Kool-Aid Acid Test"],
    type: "book"
  },
  {
    title: "Miracle of the Rose",
    author: "Jean Genet",
    variations: [],
    type: "book"
  },
  {
    title: "The Diary of a Young Girl",
    author: "Anne Frank",
    variations: ["Anne Frank's Diary", "Diary of Anne Frank"],
    type: "book"
  },
  {
    title: "Ariel",
    author: "Sylvia Plath",
    variations: [],
    type: "poetry"
  },
  {
    title: "Love and Mr. Lewisham",
    author: "H.G. Wells",
    variations: ["Love and Mr Lewisham"],
    type: "book"
  },
  {
    title: "Andy Warhol's Index",
    author: "Andy Warhol",
    variations: ["Warhol's Index"],
    type: "book"
  },
  {
    title: "East of Eden",
    author: "John Steinbeck",
    variations: [],
    type: "book"
  },
  {
    title: "Junky",
    author: "William S. Burroughs",
    variations: ["Junkie"],
    type: "book"
  },
  {
    title: "Doctor Martino & Other Stories",
    author: "William Faulkner",
    variations: ["Doctor Martino and Other Stories", "Doctor Martino"],
    type: "book"
  },
  {
    title: "Crazy Horse: The Strange Man of the Oglalas",
    author: "Mari Sandoz",
    variations: ["Crazy Horse"],
    type: "book"
  },
  {
    title: "Brighton Rock",
    author: "Graham Greene",
    variations: [],
    type: "book"
  },
  {
    title: "The Rise and Fall of the City of Mahagonny",
    author: "Bertolt Brecht",
    variations: ["Rise and Fall of the City of Mahagonny", "Mahagonny"],
    type: "play"
  },
  {
    title: "The Golden Bough",
    author: "James George Frazer",
    variations: ["Golden Bough"],
    type: "book"
  },
  {
    title: "Diary of a Drug Fiend",
    author: "Aleister Crowley",
    variations: [],
    type: "book"
  },
  {
    title: "Locus Solus",
    author: "Raymond Roussel",
    variations: [],
    type: "book"
  },
  {
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    variations: ["Alice in Wonderland", "Through the Looking-Glass", "Through the Looking Glass"],
    type: "book"
  },
  {
    title: "The Happy Birthday of Death",
    author: "Gregory Corso",
    variations: ["Happy Birthday of Death"],
    type: "poetry"
  },
  {
    title: "Cain's Book",
    author: "Alexander Trocchi",
    variations: ["Cain's Book"],
    type: "book"
  },
  {
    title: "The Adventures of Huckleberry Finn",
    author: "Mark Twain",
    variations: ["Huckleberry Finn", "Huck Finn"],
    type: "book"
  },
  {
    title: "Zelda",
    author: "Nancy Milford",
    variations: [],
    type: "book"
  },
  {
    title: "The Holy Barbarians",
    author: "Lawrence Lipton",
    variations: ["Holy Barbarians"],
    type: "book"
  },
  {
    title: "Protest: The Beat Generation and the Angry Young Men",
    author: "Gene Feldman",
    variations: ["Protest"],
    type: "book"
  },
  {
    title: "The Age of Rock 2: Sights and Sounds of the American Cultural Revolution",
    author: "Jonathan Eisen",
    variations: ["The Age of Rock 2", "The Age of Rock II", "Age of Rock II", "Age of Rock 2", "The Age of Rock Two"],
    type: "book"
  },
  {
    title: "Seventh Heaven",
    author: "Patti Smith",
    variations: [],
    type: "poetry"
  },
  {
    title: "Les Enfants terribles",
    author: "Jean Cocteau",
    variations: ["Les Enfants Terribles", "The Terrible Children", "The Holy Terrors"],
    type: "book"
  },
  {
    title: "Love Affair: A Memoir of Jackson Pollock",
    author: "Ruth Kligman",
    variations: ["Love Affair"],
    type: "book"
  },
  {
    title: "Witt",
    author: "Patti Smith",
    variations: [],
    type: "poetry"
  },
  {
    title: "A Season in Hell",
    author: "Arthur Rimbaud",
    variations: ["Season in Hell"],
    type: "poetry"
  },
  {
    title: "The Women Of Cairo Volume One",
    author: "Gérard de Nerval",
    variations: ["The Women of Cairo", "Women of Cairo"],
    type: "book"
  },
  {
    title: "Death in Venice",
    author: "Thomas Mann",
    variations: ["Death in Venice and Other Tales"],
    type: "book"
  }
];

// Create a map for quick author lookup
export const AUTHORS_TO_WORKS = new Map<string, LiteraryWork[]>();
LITERARY_WORKS.forEach(work => {
  const authorName = work.author.toLowerCase();
  if (!AUTHORS_TO_WORKS.has(authorName)) {
    AUTHORS_TO_WORKS.set(authorName, []);
  }
  AUTHORS_TO_WORKS.get(authorName)?.push(work);
  
  // Also add last name only
  const lastName = work.author.split(' ').pop()?.toLowerCase();
  if (lastName && lastName !== authorName) {
    if (!AUTHORS_TO_WORKS.has(lastName)) {
      AUTHORS_TO_WORKS.set(lastName, []);
    }
    AUTHORS_TO_WORKS.get(lastName)?.push(work);
  }
});

// Create a function to check if text contains a book reference
export function findLiteraryReferences(text: string): Array<{work: LiteraryWork, matchText: string}> {
  const matches: Array<{work: LiteraryWork, matchText: string}> = [];
  const lowerText = text.toLowerCase();
  
  LITERARY_WORKS.forEach(work => {
    // Check for title
    if (lowerText.includes(work.title.toLowerCase())) {
      matches.push({work, matchText: work.title});
    }
    
    // Check for variations
    work.variations?.forEach(variation => {
      if (lowerText.includes(variation.toLowerCase())) {
        matches.push({work, matchText: variation});
      }
    });
  });
  
  return matches;
}

// Export key literary figures who appear frequently
export const KEY_LITERARY_FIGURES = [
  "Arthur Rimbaud",
  "William Blake",
  "Jean Genet",
  "William S. Burroughs",
  "Allen Ginsberg",
  "Jack Kerouac",
  "Gregory Corso",
  "Tennessee Williams",
  "Jean Cocteau",
  "Sylvia Plath"
];