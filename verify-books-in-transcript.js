#!/usr/bin/env node

// Node.js script to verify which books from the 44-book list appear in the transcript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPLETE_BOOK_LIST = [
  { title: "Foxe's Book of Martyrs", author: "John Foxe", variations: ["Book of Martyrs", "Foxe's Book of Martyrs"] },
  { title: "The Shoes of the Fisherman", author: "Morris L. West", variations: ["Shoes of the Fisherman"] },
  { title: "The Red Shoes", author: "Barbara Bazilian", variations: ["Red Shoes"] },
  { title: "A Child's Garden of Verses", author: "Robert Louis Stevenson", variations: ["Child's Garden of Verses"] },
  { title: "Little Women", author: "Louisa May Alcott", variations: [] },
  { title: "The Fabulous Life of Diego Rivera", author: "Bertram D. Wolfe", variations: ["Fabulous Life of Diego Rivera"] },
  { title: "Illuminations", author: "Arthur Rimbaud", variations: [] },
  { title: "Love on the Left Bank", author: "Ed van der Elsken", variations: [] },
  { title: "Collages", author: "Anaïs Nin", variations: [] },
  { title: "Songs of Innocence and of Experience", author: "William Blake", variations: ["Songs of Innocence", "Songs of Experience"] },
  { title: "America: A Prophecy", author: "William Blake", variations: ["America A Prophecy"] },
  { title: "Milton: A Poem", author: "William Blake", variations: ["Milton"] },
  { title: "The Glass Menagerie", author: "Tennessee Williams", variations: ["Glass Menagerie"] },
  { title: "Psychedelic Prayers: And Other Meditations", author: "Timothy Leary", variations: ["Psychedelic Prayers"] },
  { title: "The Electric Kool-Aid Acid Test", author: "Tom Wolfe", variations: ["Electric Kool-Aid Acid Test"] },
  { title: "Miracle of the Rose", author: "Jean Genet", variations: [] },
  { title: "The Diary of a Young Girl", author: "Anne Frank", variations: ["Anne Frank's Diary", "Diary of Anne Frank"] },
  { title: "Ariel", author: "Sylvia Plath", variations: [] },
  { title: "Love and Mr. Lewisham", author: "H.G. Wells", variations: ["Love and Mr Lewisham"] },
  { title: "Andy Warhol's Index", author: "Andy Warhol", variations: ["Warhol's Index"] },
  { title: "East of Eden", author: "John Steinbeck", variations: [] },
  { title: "Junky", author: "William S. Burroughs", variations: ["Junkie"] },
  { title: "Doctor Martino & Other Stories", author: "William Faulkner", variations: ["Doctor Martino and Other Stories", "Doctor Martino"] },
  { title: "Crazy Horse: The Strange Man of the Oglalas", author: "Mari Sandoz", variations: ["Crazy Horse"] },
  { title: "Brighton Rock", author: "Graham Greene", variations: [] },
  { title: "The Rise and Fall of the City of Mahagonny", author: "Bertolt Brecht", variations: ["Rise and Fall of the City of Mahagonny", "Mahagonny"] },
  { title: "The Golden Bough", author: "James George Frazer", variations: ["Golden Bough"] },
  { title: "Diary of a Drug Fiend", author: "Aleister Crowley", variations: [] },
  { title: "Locus Solus", author: "Raymond Roussel", variations: [] },
  { title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", variations: ["Alice in Wonderland", "Through the Looking-Glass", "Through the Looking Glass"] },
  { title: "The Happy Birthday of Death", author: "Gregory Corso", variations: ["Happy Birthday of Death"] },
  { title: "Cain's Book", author: "Alexander Trocchi", variations: ["Cain's Book"] },
  { title: "The Adventures of Huckleberry Finn", author: "Mark Twain", variations: ["Huckleberry Finn", "Huck Finn"] },
  { title: "Zelda", author: "Nancy Milford", variations: [] },
  { title: "The Holy Barbarians", author: "Lawrence Lipton", variations: ["Holy Barbarians"] },
  { title: "Protest: The Beat Generation and the Angry Young Men", author: "Gene Feldman", variations: ["Protest"] },
  { title: "The Age of Rock 2: Sights and Sounds of the American Cultural Revolution", author: "Jonathan Eisen", variations: ["The Age of Rock 2", "The Age of Rock II", "Age of Rock II", "Age of Rock 2"] },
  { title: "Seventh Heaven", author: "Patti Smith", variations: [] },
  { title: "Les Enfants terribles", author: "Jean Cocteau", variations: ["Les Enfants Terribles", "The Terrible Children", "The Holy Terrors"] },
  { title: "Love Affair: A Memoir of Jackson Pollock", author: "Ruth Kligman", variations: ["Love Affair"] },
  { title: "Witt", author: "Patti Smith", variations: [] },
  { title: "A Season in Hell", author: "Arthur Rimbaud", variations: ["Season in Hell"] },
  { title: "The Women Of Cairo Volume One", author: "Gérard de Nerval", variations: ["The Women of Cairo", "Women of Cairo"] },
  { title: "Death in Venice", author: "Thomas Mann", variations: ["Death in Venice and Other Tales"] }
];

function verifyBooksInTranscript() {
  // Read the transcript file
  const transcriptPath = path.join(__dirname, 'client/public/transcripts/just-kids-patti-smith/transcript.txt');
  
  if (!fs.existsSync(transcriptPath)) {
    console.error('Transcript file not found at:', transcriptPath);
    return;
  }
  
  const transcript = fs.readFileSync(transcriptPath, 'utf8').toLowerCase();
  
  console.log('📚 TRANSCRIPT ANALYSIS FOR 44-BOOK LIST');
  console.log('=' .repeat(60));
  console.log(`Transcript length: ${transcript.length} characters\n`);
  
  const results = {
    found: [],
    notFound: [],
    stats: {
      totalBooks: COMPLETE_BOOK_LIST.length,
      booksFound: 0,
      authorsFound: 0,
      bothFound: 0
    }
  };
  
  COMPLETE_BOOK_LIST.forEach((book, index) => {
    const result = {
      number: index + 1,
      title: book.title,
      author: book.author,
      titleFound: false,
      titleCount: 0,
      authorFound: false,
      authorCount: 0,
      variations: []
    };
    
    // Check main title
    if (transcript.includes(book.title.toLowerCase())) {
      result.titleFound = true;
      const regex = new RegExp(book.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = transcript.match(regex);
      result.titleCount = matches ? matches.length : 0;
    }
    
    // Check variations
    book.variations.forEach(variation => {
      if (transcript.includes(variation.toLowerCase())) {
        result.titleFound = true;
        const regex = new RegExp(variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = transcript.match(regex);
        const count = matches ? matches.length : 0;
        result.variations.push({ text: variation, count });
        result.titleCount += count;
      }
    });
    
    // Check author (full name and last name)
    if (transcript.includes(book.author.toLowerCase())) {
      result.authorFound = true;
      const regex = new RegExp(book.author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = transcript.match(regex);
      result.authorCount = matches ? matches.length : 0;
    }
    
    // Also check last name only
    const lastName = book.author.split(' ').pop().toLowerCase();
    if (!result.authorFound && transcript.includes(lastName)) {
      const regex = new RegExp(`\\b${lastName}\\b`, 'gi');
      const matches = transcript.match(regex);
      if (matches) {
        result.authorFound = true;
        result.authorCount = matches.length;
      }
    }
    
    // Categorize result
    if (result.titleFound || result.authorFound) {
      results.found.push(result);
      if (result.titleFound) results.stats.booksFound++;
      if (result.authorFound) results.stats.authorsFound++;
      if (result.titleFound && result.authorFound) results.stats.bothFound++;
    } else {
      results.notFound.push(result);
    }
  });
  
  // Print detailed results
  console.log('✅ BOOKS/AUTHORS FOUND IN TRANSCRIPT:\n');
  results.found.forEach(r => {
    console.log(`#${r.number}. "${r.title}" by ${r.author}`);
    if (r.titleFound) {
      console.log(`   📖 Title: ${r.titleCount} occurrence(s)`);
      if (r.variations.length > 0) {
        r.variations.forEach(v => {
          console.log(`      - "${v.text}": ${v.count} time(s)`);
        });
      }
    }
    if (r.authorFound) {
      console.log(`   ✍️ Author: ${r.authorCount} occurrence(s)`);
    }
    console.log('');
  });
  
  console.log('\n❌ NOT FOUND IN TRANSCRIPT:\n');
  results.notFound.forEach(r => {
    console.log(`#${r.number}. "${r.title}" by ${r.author}`);
  });
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY:');
  console.log('=' .repeat(60));
  console.log(`\nTotal entries in list: ${results.stats.totalBooks}`);
  console.log(`Entries with book OR author found: ${results.found.length} (${Math.round(results.found.length/results.stats.totalBooks*100)}%)`);
  console.log(`Books found: ${results.stats.booksFound}`);
  console.log(`Authors found: ${results.stats.authorsFound}`);
  console.log(`Both book AND author found: ${results.stats.bothFound}`);
  console.log(`\nCompletely missing: ${results.notFound.length} entries`);
  
  // Identify high-frequency items
  console.log('\n🔥 MOST MENTIONED (5+ times):');
  results.found
    .filter(r => r.titleCount >= 5 || r.authorCount >= 5)
    .sort((a, b) => (b.titleCount + b.authorCount) - (a.titleCount + a.authorCount))
    .forEach(r => {
      const total = r.titleCount + r.authorCount;
      console.log(`   "${r.title}": ${total} total mentions`);
    });
  
  return results;
}

// Run the verification
verifyBooksInTranscript();