// Test script for complete title matching and author highlighting
console.log(`
========================================
COMPLETE TITLE & AUTHOR MATCHING TEST
========================================

Testing improved book title recognition:
1. Complete titles preferred over partials
2. Authors highlighted when near their books
3. Proper handling of variations (II vs 2)

TEST 1: AGE OF ROCK II
=======================
Looking for "The Age of Rock II" mentions
`);

function testAgeOfRock() {
  console.log('🔍 Searching for Age of Rock variations...\n');
  
  // Check what's highlighted on current page
  const bookHighlights = document.querySelectorAll('.entity-literary, .literary-highlight');
  const authorHighlights = document.querySelectorAll('.entity-author, .author-highlight');
  
  // Look for Age of Rock specifically
  let foundAgeOfRock = false;
  let foundEisen = false;
  
  bookHighlights.forEach(el => {
    const text = el.textContent;
    const title = el.getAttribute('data-entity');
    
    if (text.toLowerCase().includes('age of rock') || 
        title?.toLowerCase().includes('age of rock')) {
      console.log('📚 Found Age of Rock:');
      console.log('  - Highlighted text:', text);
      console.log('  - Data title:', title);
      console.log('  - Full match?', text.includes('II') || text.includes('2'));
      foundAgeOfRock = true;
    }
  });
  
  authorHighlights.forEach(el => {
    const text = el.textContent;
    if (text.includes('Eisen')) {
      console.log('👤 Found Jonathan Eisen:');
      console.log('  - Highlighted text:', text);
      foundEisen = true;
    }
  });
  
  if (foundAgeOfRock && foundEisen) {
    console.log('\n✅ Both book and author are highlighted!');
  } else if (foundAgeOfRock) {
    console.log('\n⚠️ Book found but author not highlighted');
  } else {
    console.log('\n❌ Age of Rock not found on this page');
  }
}

function checkAllBookMatches() {
  console.log('\n📚 ALL BOOK MATCHES ON PAGE:\n');
  console.log('=' .repeat(40));
  
  const books = document.querySelectorAll('.entity-literary, .literary-highlight, .entity-poetry');
  const authors = document.querySelectorAll('.entity-author, .author-highlight');
  
  console.log(`Found ${books.length} books and ${authors.length} authors\n`);
  
  // Create a map of books and nearby authors
  const bookAuthorPairs = new Map();
  
  books.forEach(book => {
    const bookText = book.textContent;
    const bookTitle = book.getAttribute('data-entity');
    const bookAuthor = book.getAttribute('data-author');
    
    // Look for author highlight nearby (within parent paragraph)
    const parent = book.closest('p') || book.parentElement;
    const nearbyAuthor = parent?.querySelector('.entity-author, .author-highlight');
    
    if (!bookAuthorPairs.has(bookTitle)) {
      bookAuthorPairs.set(bookTitle, {
        title: bookTitle,
        text: bookText,
        dataAuthor: bookAuthor,
        nearbyAuthor: nearbyAuthor?.textContent || null,
        count: 0
      });
    }
    bookAuthorPairs.get(bookTitle).count++;
  });
  
  // Display results
  Array.from(bookAuthorPairs.values()).forEach(pair => {
    console.log(`📖 "${pair.text}"`);
    console.log(`   Title: ${pair.title}`);
    console.log(`   Author (data): ${pair.dataAuthor}`);
    if (pair.nearbyAuthor) {
      console.log(`   ✅ Author highlighted nearby: ${pair.nearbyAuthor}`);
    } else {
      console.log(`   ⚠️ No author highlight found nearby`);
    }
    console.log('');
  });
}

function testMatchPriority() {
  console.log('\n🎯 TESTING MATCH PRIORITY:\n');
  console.log('=' .repeat(40));
  
  const allHighlights = document.querySelectorAll('.entity-literary, .literary-highlight');
  const matchLengths = [];
  
  allHighlights.forEach(el => {
    const text = el.textContent;
    matchLengths.push({
      text: text,
      length: text.length
    });
  });
  
  // Sort by length to see if we're getting complete matches
  matchLengths.sort((a, b) => b.length - a.length);
  
  console.log('Longest matches first (should be complete titles):');
  matchLengths.slice(0, 5).forEach(m => {
    console.log(`  [${m.length} chars] "${m.text}"`);
  });
  
  // Check for potential partial matches
  const potentialPartials = matchLengths.filter(m => m.length < 15);
  if (potentialPartials.length > 0) {
    console.log('\n⚠️ Short matches that might be partials:');
    potentialPartials.forEach(m => {
      console.log(`  [${m.length} chars] "${m.text}"`);
    });
  }
}

function findTextOnPage(searchText) {
  console.log(`\n🔎 Looking for "${searchText}" on page...`);
  
  const pageText = document.body.innerText;
  const index = pageText.toLowerCase().indexOf(searchText.toLowerCase());
  
  if (index !== -1) {
    const context = pageText.substring(Math.max(0, index - 50), Math.min(pageText.length, index + 100));
    console.log('Found at position', index);
    console.log('Context:', '...' + context + '...');
    
    // Check if it's highlighted
    const highlighted = Array.from(document.querySelectorAll('.entity-literary, .entity-author')).some(el => 
      el.textContent.toLowerCase().includes(searchText.toLowerCase())
    );
    
    if (highlighted) {
      console.log('✅ Text is highlighted');
    } else {
      console.log('❌ Text found but NOT highlighted');
    }
  } else {
    console.log('Not found on current page');
  }
}

// Run all tests
function runAllTests() {
  testAgeOfRock();
  checkAllBookMatches();
  testMatchPriority();
}

// Make functions available
window.testAgeOfRock = testAgeOfRock;
window.checkAllBookMatches = checkAllBookMatches;
window.testMatchPriority = testMatchPriority;
window.findTextOnPage = findTextOnPage;
window.runAllTests = runAllTests;

console.log(`
Available commands:
- runAllTests() - Run all tests
- testAgeOfRock() - Check Age of Rock II specifically
- checkAllBookMatches() - List all books with authors
- testMatchPriority() - Check if complete titles are preferred
- findTextOnPage("Age of Rock II") - Find specific text
`);

// Auto-run
runAllTests();