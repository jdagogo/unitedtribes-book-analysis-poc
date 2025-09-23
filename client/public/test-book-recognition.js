// Test script for verifying book title recognition with fuzzy matching
console.log('📚 Book Title Recognition Test Script Loaded');

const testBookRecognition = {
  // List of all 44 books we should recognize
  expectedBooks: [
    "Foxe's Book of Martyrs",
    "The Shoes of the Fisherman",
    "The Red Shoes", 
    "A Child's Garden of Verses",
    "Little Women",
    "The Fabulous Life of Diego Rivera",
    "Illuminations",
    "Love on the Left Bank",
    "Collages",
    "Songs of Innocence and of Experience",
    "America: A Prophecy",
    "Milton: A Poem",
    "The Glass Menagerie",
    "Psychedelic Prayers",
    "The Electric Kool-Aid Acid Test",
    "Miracle of the Rose",
    "The Diary of a Young Girl",
    "Ariel",
    "Love and Mr. Lewisham",
    "Andy Warhol's Index",
    "East of Eden",
    "Junky",
    "Doctor Martino",
    "Crazy Horse",
    "Brighton Rock",
    "The Rise and Fall of the City of Mahagonny",
    "The Golden Bough",
    "Diary of a Drug Fiend",
    "Locus Solus",
    "Alice's Adventures in Wonderland",
    "Through the Looking-Glass",
    "The Happy Birthday of Death",
    "Cain's Book",
    "The Adventures of Huckleberry Finn",
    "Zelda",
    "The Holy Barbarians",
    "Protest: The Beat Generation and the Angry Young Men",
    "The Age of Rock 2",
    "Seventh Heaven",
    "Les Enfants terribles",
    "Love Affair: A Memoir of Jackson Pollock",
    "Witt",
    "A Season in Hell",
    "The Women Of Cairo",
    "Death in Venice"
  ],

  // Check if books are being highlighted
  checkBookHighlighting: function() {
    const bookHighlights = document.querySelectorAll('.entity-literary');
    const authorHighlights = document.querySelectorAll('.entity-author');
    
    console.log('📊 Book Recognition Status:');
    console.log(`  - Literary works highlighted (purple): ${bookHighlights.length}`);
    console.log(`  - Authors highlighted (orange): ${authorHighlights.length}`);
    
    if (bookHighlights.length > 0) {
      console.log('✅ Book highlighting is active');
      
      // Extract unique book titles
      const uniqueBooks = new Set();
      bookHighlights.forEach(el => {
        const title = el.getAttribute('data-entity');
        if (title) uniqueBooks.add(title);
      });
      
      console.log(`📚 Unique books found: ${uniqueBooks.size}`);
      uniqueBooks.forEach(title => {
        console.log(`  - ${title}`);
      });
    } else {
      console.log('❌ No book highlighting found');
    }
    
    return {
      bookHighlights: bookHighlights.length,
      authorHighlights: authorHighlights.length,
      uniqueBooks: uniqueBooks ? uniqueBooks.size : 0
    };
  },

  // Test specific book variations
  testVariations: function() {
    console.log('🔍 Testing Book Title Variations:');
    
    const testCases = [
      { search: "Foxe's Book of Martyrs", expected: "Foxe's Book of Martyrs" },
      { search: "Book of Martyrs", expected: "Foxe's Book of Martyrs" },
      { search: "Electric Kool-Aid", expected: "The Electric Kool-Aid Acid Test" },
      { search: "Alice in Wonderland", expected: "Alice's Adventures in Wonderland" },
      { search: "Child's Garden", expected: "A Child's Garden of Verses" },
      { search: "Through the Looking Glass", expected: "Through the Looking-Glass" },
      { search: "Age of Rock", expected: "The Age of Rock 2" }
    ];
    
    console.log('Test these manually by searching for:');
    testCases.forEach(test => {
      console.log(`  "${test.search}" → Should highlight as "${test.expected}"`);
    });
  },

  // Check specific page for expected books
  checkCurrentPage: function() {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) {
      console.log('❌ No page content found');
      return;
    }
    
    const text = pageContent.textContent;
    console.log('📖 Checking current page for book mentions...');
    
    const foundBooks = [];
    this.expectedBooks.forEach(book => {
      // Check for various forms of the book title
      const variations = [
        book,
        book.replace(/^The /, ''),
        book.replace(/^A /, ''),
        book.split(':')[0] // Just the part before colon
      ];
      
      for (let variation of variations) {
        if (text.includes(variation)) {
          foundBooks.push(book);
          break;
        }
      }
    });
    
    if (foundBooks.length > 0) {
      console.log(`✅ Found ${foundBooks.length} book mentions on this page:`);
      foundBooks.forEach(book => console.log(`  - ${book}`));
    } else {
      console.log('ℹ️ No book titles found on current page');
    }
    
    return foundBooks;
  },

  // Full diagnostic
  diagnose: function() {
    console.log('🏥 Full Book Recognition Diagnostic:');
    console.log('=====================================');
    
    const results = this.checkBookHighlighting();
    const pageBooks = this.checkCurrentPage();
    
    // Check if highlighting matches what we found
    const bookElements = document.querySelectorAll('.entity-literary');
    const highlightedTitles = new Set();
    bookElements.forEach(el => {
      const title = el.getAttribute('data-entity');
      if (title) highlightedTitles.add(title);
    });
    
    console.log('\n📈 Summary:');
    console.log(`  - Total book highlights: ${results.bookHighlights}`);
    console.log(`  - Unique books highlighted: ${results.uniqueBooks}`);
    console.log(`  - Expected books on page: ${pageBooks.length}`);
    console.log(`  - Authors highlighted: ${results.authorHighlights}`);
    
    // Check for specific problem cases
    console.log('\n🔍 Checking specific variations:');
    const problemCases = [
      "Child's Garden", // Should match "A Child's Garden of Verses"
      "Electric Kool-Aid", // Should match full title
      "Alice", // Should match Alice in Wonderland
      "Kool-Aid Acid Test" // Should match full title
    ];
    
    problemCases.forEach(test => {
      const found = Array.from(bookElements).some(el => 
        el.textContent.toLowerCase().includes(test.toLowerCase())
      );
      console.log(`  "${test}": ${found ? '✅ Found' : '❌ Not found'}`);
    });
    
    return {
      results,
      pageBooks,
      highlightedTitles: Array.from(highlightedTitles)
    };
  }
};

// Make it globally available
window.testBookRecognition = testBookRecognition;

console.log('✅ Test functions available:');
console.log('  - testBookRecognition.checkBookHighlighting() - Check current highlighting');
console.log('  - testBookRecognition.checkCurrentPage() - Check page for book mentions');
console.log('  - testBookRecognition.testVariations() - Show test cases for variations');
console.log('  - testBookRecognition.diagnose() - Full diagnostic report');
console.log('');
console.log('📝 Navigate to different pages and run diagnose() to test book recognition');