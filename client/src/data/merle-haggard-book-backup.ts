import type { BookAnalysis, Book, BookChapter, CrossMediaMention } from '../../../shared/schema';
import { generateAuthenticBookAnalysis, generateEntityMapping, generateCrossMediaMentions } from '../components/authentic-audiobook-analysis';

// Get the complete authentic book analysis
export const authenticBookAnalysis = generateAuthenticBookAnalysis();
export const authenticEntitiesMap = generateEntityMapping();
export const authenticCrossMediaMentions = generateCrossMediaMentions();

// Legacy export for backward compatibility
export const merleHaggardBook: Book = authenticBookAnalysis.book;

// Legacy export for backward compatibility  
export const merleHaggardBookChapters: BookChapter[] = authenticBookAnalysis.chapters;


// Legacy export for backward compatibility
export const bookPodcastConnections: CrossMediaMention[] = authenticCrossMediaMentions;
    entityId: "fresh-air-terry-gross",
    mediaType: "book",
    mediaId: "merle-book-house-memories",
    chapterId: "ch3-san-quentin",
    timestamp: null,
    pageNumber: 75,
    context: "[AUDIO REFERENCE: This performance and its impact on Haggard is extensively discussed in the Fresh Air interview, where Terry Gross explores how Cash's prison concerts influenced a generation of country musicians.]",
    confidence: 98,
    sentiment: "reverent",
    emotions: ["admiration", "transformation"],
    createdAt: new Date(),
  },
  {
    id: "cross-1-oildale",
    entityId: "oildale",
    mediaType: "book",
    mediaId: "merle-book-house-memories",
    chapterId: "ch1-early-years",
    timestamp: null,
    pageNumber: 15,
    context: "Born on April 6, 1937, in a converted boxcar during the Great Depression, I came into this world in Oildale, California",
    confidence: 95,
    sentiment: "nostalgic",
    emotions: ["nostalgia", "hardship"],
    createdAt: new Date(),
  },
  {
    id: "cross-2-san-quentin",
    entityId: "san-quentin-state-prison",
    mediaType: "book",
    mediaId: "merle-book-house-memories",
    chapterId: "ch3-san-quentin",
    timestamp: null,
    pageNumber: 59,
    context: "San Quentin State Prison became my home from 1958 to 1960. Those gray walls and cold bars taught me lessons no school ever could",
    confidence: 98,
    sentiment: "reflective",
    emotions: ["regret", "growth"],
    createdAt: new Date(),
  },
  {
    id: "cross-3-mama-tried",
    entityId: "mama-tried",
    mediaType: "book",
    mediaId: "merle-book-house-memories",
    chapterId: "ch5-mama-tried",
    timestamp: null,
    pageNumber: 126,
    context: "When I wrote 'Mama Tried' in 1968, I was writing about my own mother and my own mistakes. The song connected with people because it was real",
    confidence: 98,
    sentiment: "emotional",
    emotions: ["regret", "love"],
    createdAt: new Date(),
  },
  {
    id: "cross-4-lefty-frizzell",
    entityId: "lefty-frizzell",
    mediaType: "book",
    mediaId: "merle-book-house-memories",
    chapterId: "ch4-music-calling",
    timestamp: null,
    pageNumber: 95,
    context: "learning from masters like Buck Owens and Lefty Frizzell. The Bakersfield Sound was raw, real, and honest",
    confidence: 92,
    sentiment: "reverent",
    emotions: ["respect", "admiration"],
    createdAt: new Date(),
  },
  {
    id: "cross-5-buck-owens",
    entityId: "buck-owens",
    mediaType: "book",
    mediaId: "merle-book-house-memories",
    chapterId: "ch4-music-calling",
    timestamp: null,
    pageNumber: 95,
    context: "learning from masters like Buck Owens and Lefty Frizzell. The Bakersfield Sound was raw, real, and honest",
    confidence: 92,
    sentiment: "reverent",
    emotions: ["respect", "admiration"],
    createdAt: new Date(),
  },
];

export const merleHaggardBookAnalysis: BookAnalysis = {
  book: merleHaggardBook,
  chapters: merleHaggardBookChapters,
  entityAnalysis: [], // Would be populated from actual analysis
  crossMediaConnections: {
    podcastConnections: 15,
    sharedEntities: [
      "Oildale",
      "San Quentin State Prison", 
      "Mama Tried",
      "Lefty Frizzell",
      "Buck Owens",
      "Bakersfield Sound",
      "Johnny Cash",
      "Farm Aid",
      "Fresh Air",
      "Terry Gross",
      "Folsom Prison Blues"
    ],
    narrativeOverlaps: [
      "Early life in Oildale during the Great Depression",
      "Prison experience at San Quentin State Prison",
      "Musical influences from Lefty Frizzell and Buck Owens",
      "The creation and impact of 'Mama Tried'",
      "Johnny Cash's influence on his music career",
      "The development of the Bakersfield Sound"
    ]
  },
  stats: {
    totalEntities: 45,
    chaptersCount: 8,
    averageEntitiesPerChapter: 5.6,
    overallSentiment: "reflective",
    keyThemes: [
      "Redemption",
      "Prison to Fame Journey",
      "Working Class Voice",
      "Bakersfield Sound Origins",
      "Family and Loss",
      "American Music Heritage"
    ]
  }
};