// Comprehensive verification script for all 44 books from Goodreads list
// This will check which books and authors are found, highlighted, and working

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
  { title: "Cain's Book", author: "Alexander Trocchi", variations: [] },
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

function verifyAllBooks() {
  console.clear();
  console.log('📚 COMPREHENSIVE 44-BOOK VERIFICATION');
  console.log('=' .repeat(60));
  console.log(`Testing ${COMPLETE_BOOK_LIST.length} books from Goodreads "Just Kids" list\n`);
  
  // Get page text
  const pageText = document.body.innerText.toLowerCase();
  
  // Get all highlighted elements
  const allHighlights = document.querySelectorAll('.entity-literary, .literary-highlight, .entity-poetry, .entity-author, .author-highlight');
  
  // Create map of highlighted text
  const highlightedTexts = new Set();
  allHighlights.forEach(el => {
    highlightedTexts.add(el.textContent.toLowerCase());
    const dataEntity = el.getAttribute('data-entity');
    if (dataEntity) highlightedTexts.add(dataEntity.toLowerCase());
  });
  
  const results = {
    success: [],
    partial: [],
    missing: [],
    stats: {
      booksFound: 0,
      booksHighlighted: 0,
      authorsFound: 0,
      authorsHighlighted: 0,
      totalSuccess: 0
    }
  };
  
  console.log('🔍 DETAILED RESULTS:\n');
  
  COMPLETE_BOOK_LIST.forEach((book, index) => {
    const result = {
      number: index + 1,
      title: book.title,
      author: book.author,
      titleFound: false,
      titleHighlighted: false,
      authorFound: false,
      authorHighlighted: false,
      status: 'MISSING'
    };
    
    // Check for book title (main and variations)
    const titlesToCheck = [book.title, ...book.variations];
    for (const title of titlesToCheck) {
      if (pageText.includes(title.toLowerCase())) {
        result.titleFound = true;
        if (highlightedTexts.has(title.toLowerCase())) {
          result.titleHighlighted = true;
        }
        break;
      }
    }
    
    // Check for author name
    if (pageText.includes(book.author.toLowerCase())) {
      result.authorFound = true;
      if (highlightedTexts.has(book.author.toLowerCase())) {
        result.authorHighlighted = true;
      }
    }
    
    // Also check just last name
    const lastName = book.author.split(' ').pop();
    if (!result.authorFound && pageText.includes(lastName.toLowerCase())) {
      result.authorFound = true;
      if (highlightedTexts.has(lastName.toLowerCase())) {
        result.authorHighlighted = true;
      }
    }
    
    // Determine status
    if (result.titleHighlighted || result.authorHighlighted) {
      result.status = 'SUCCESS';
      results.success.push(result);
      results.stats.totalSuccess++;
    } else if (result.titleFound || result.authorFound) {
      result.status = 'PARTIAL';
      results.partial.push(result);
    } else {
      result.status = 'MISSING';
      results.missing.push(result);
    }
    
    // Update stats
    if (result.titleFound) results.stats.booksFound++;
    if (result.titleHighlighted) results.stats.booksHighlighted++;
    if (result.authorFound) results.stats.authorsFound++;
    if (result.authorHighlighted) results.stats.authorsHighlighted++;
    
    // Print detailed result
    const statusIcon = result.status === 'SUCCESS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${statusIcon} #${result.number}. "${result.title}" by ${result.author}`);
    
    if (result.titleFound || result.authorFound) {
      console.log(`   Book: ${result.titleFound ? 'Found' : 'Not found'} ${result.titleHighlighted ? '(Highlighted ✓)' : result.titleFound ? '(NOT highlighted ✗)' : ''}`);
      console.log(`   Author: ${result.authorFound ? 'Found' : 'Not found'} ${result.authorHighlighted ? '(Highlighted ✓)' : result.authorFound ? '(NOT highlighted ✗)' : ''}`);
    } else {
      console.log(`   Neither book nor author found in text`);
    }
    console.log('');
  });
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY STATISTICS:');
  console.log('=' .repeat(60));
  
  console.log(`\n✅ SUCCESS (working correctly): ${results.success.length}/${COMPLETE_BOOK_LIST.length} (${Math.round(results.success.length/COMPLETE_BOOK_LIST.length*100)}%)`);
  if (results.success.length > 0) {
    console.log('   Working entries:');
    results.success.slice(0, 5).forEach(r => {
      console.log(`   - #${r.number}. ${r.title}`);
    });
    if (results.success.length > 5) {
      console.log(`   ... and ${results.success.length - 5} more`);
    }
  }
  
  console.log(`\n⚠️ PARTIAL (found but not highlighted): ${results.partial.length}/${COMPLETE_BOOK_LIST.length} (${Math.round(results.partial.length/COMPLETE_BOOK_LIST.length*100)}%)`);
  if (results.partial.length > 0) {
    console.log('   Broken highlighting:');
    results.partial.slice(0, 10).forEach(r => {
      const what = [];
      if (r.titleFound && !r.titleHighlighted) what.push('book');
      if (r.authorFound && !r.authorHighlighted) what.push('author');
      console.log(`   - #${r.number}. ${r.title} (${what.join(' & ')} not highlighted)`);
    });
    if (results.partial.length > 10) {
      console.log(`   ... and ${results.partial.length - 10} more`);
    }
  }
  
  console.log(`\n❌ MISSING (not found in text): ${results.missing.length}/${COMPLETE_BOOK_LIST.length} (${Math.round(results.missing.length/COMPLETE_BOOK_LIST.length*100)}%)`);
  if (results.missing.length > 0 && results.missing.length <= 15) {
    console.log('   Not mentioned on current page:');
    results.missing.forEach(r => {
      console.log(`   - #${r.number}. ${r.title}`);
    });
  }
  
  console.log('\n📈 DETAILED METRICS:');
  console.log(`   Books found in text: ${results.stats.booksFound}/${COMPLETE_BOOK_LIST.length}`);
  console.log(`   Books highlighted: ${results.stats.booksHighlighted}/${results.stats.booksFound}`);
  console.log(`   Authors found in text: ${results.stats.authorsFound}/${COMPLETE_BOOK_LIST.length}`);
  console.log(`   Authors highlighted: ${results.stats.authorsHighlighted}/${results.stats.authorsFound}`);
  
  const successRate = Math.round(results.stats.totalSuccess / COMPLETE_BOOK_LIST.length * 100);
  console.log(`\n🎯 OVERALL SUCCESS RATE: ${successRate}%`);
  
  if (successRate < 50) {
    console.log('\n⚠️ CRITICAL: Less than 50% of the verified list is working!');
    console.log('Major implementation issues detected.');
  } else if (successRate < 80) {
    console.log('\n⚠️ WARNING: Significant gaps in implementation.');
  } else {
    console.log('\n✅ Implementation is mostly working.');
  }
  
  return results;
}

// Function to find specific book/author on page
function findSpecificEntry(bookNumber) {
  if (bookNumber < 1 || bookNumber > COMPLETE_BOOK_LIST.length) {
    console.log('Invalid book number. Use 1-44.');
    return;
  }
  
  const book = COMPLETE_BOOK_LIST[bookNumber - 1];
  console.log(`\n🔍 Searching for #${bookNumber}: "${book.title}" by ${book.author}`);
  
  const pageText = document.body.innerText;
  const titles = [book.title, ...book.variations];
  
  // Search for title
  titles.forEach(title => {
    const regex = new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = pageText.match(regex);
    if (matches) {
      console.log(`   Found "${title}": ${matches.length} time(s)`);
      
      // Check if highlighted
      const highlighted = document.querySelector(`[data-entity="${title}"]`);
      if (highlighted) {
        console.log(`   ✅ Highlighted and clickable`);
      } else {
        console.log(`   ❌ NOT highlighted`);
      }
    }
  });
  
  // Search for author
  const authorRegex = new RegExp(book.author.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const authorMatches = pageText.match(authorRegex);
  if (authorMatches) {
    console.log(`   Found author "${book.author}": ${authorMatches.length} time(s)`);
    
    const highlighted = document.querySelector(`[data-entity="${book.author}"]`);
    if (highlighted) {
      console.log(`   ✅ Author highlighted`);
    } else {
      console.log(`   ❌ Author NOT highlighted`);
    }
  }
}

// Make functions globally available
window.bookVerification = {
  verifyAll: verifyAllBooks,
  find: findSpecificEntry,
  list: COMPLETE_BOOK_LIST
};

console.log(`
🛠️ BOOK VERIFICATION TOOLS LOADED

Commands:
- bookVerification.verifyAll() - Test all 44 books
- bookVerification.find(1-44) - Find specific book by number
- bookVerification.list - View complete book list

Run bookVerification.verifyAll() to see full status report.
`);