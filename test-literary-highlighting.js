// Test script for Literary Work Highlighting
console.log(`
========================================
LITERARY WORK HIGHLIGHTING TEST
========================================

Testing the new book/literary work highlighting feature
using the verified Goodreads list of 44 books from "Just Kids"

TEST 1: CHECK VISUAL HIGHLIGHTING
==================================
Look for purple/violet highlights on book titles:
- "Illuminations" by Rimbaud
- "A Season in Hell" by Rimbaud
- "Songs of Innocence" by Blake
- "Ariel" by Sylvia Plath
- "Little Women" by Alcott

✅ EXPECTED: Purple/violet background on book titles
✅ EXPECTED: Hover tooltip shows author name
✅ EXPECTED: Different shade for poetry vs prose

TEST 2: SEARCH FOR AUTHORS
===========================
Search for these authors to test recognition:
1. "Rimbaud" - Should find author mentions + book titles
2. "Blake" - Should find William Blake + his works
3. "Genet" - Should find Jean Genet + "Miracle of the Rose"

TEST 3: SEARCH FOR BOOK TITLES
===============================
Search for specific book titles:
1. "Season in Hell" - Should find the book
2. "Little Women" - Should find Alcott's novel
3. "Glass Menagerie" - Should find Tennessee Williams play

========================================
`);

// Function to count literary highlights on current page
function countLiteraryHighlights() {
  const literary = document.querySelectorAll('.literary-highlight');
  const poetry = document.querySelectorAll('.poetry-highlight');
  
  console.log('📚 Literary Highlights Found:');
  console.log(`  - Books/Prose: ${literary.length}`);
  console.log(`  - Poetry: ${poetry.length}`);
  console.log(`  - Total: ${literary.length + poetry.length}`);
  
  // Show first few examples
  if (literary.length > 0) {
    console.log('\n📖 Sample Book Highlights:');
    Array.from(literary).slice(0, 3).forEach(el => {
      const title = el.getAttribute('data-title');
      const author = el.getAttribute('data-author');
      console.log(`  - "${title}" by ${author}`);
    });
  }
  
  if (poetry.length > 0) {
    console.log('\n✍️ Sample Poetry Highlights:');
    Array.from(poetry).slice(0, 3).forEach(el => {
      const title = el.getAttribute('data-title');
      const author = el.getAttribute('data-author');
      console.log(`  - "${title}" by ${author}`);
    });
  }
}

// Function to test specific book search
function testBookSearch(bookTitle) {
  console.log(`\n🔍 Searching for "${bookTitle}"...`);
  
  // Find search input
  const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
  if (searchInput) {
    searchInput.value = bookTitle;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Trigger search
    const searchButton = document.querySelector('button[aria-label="Search"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Search'));
    if (searchButton) {
      searchButton.click();
      console.log('✅ Search triggered');
    }
  } else {
    console.log('❌ Search input not found');
  }
}

// Function to verify highlighting colors
function checkHighlightingStyles() {
  console.log('\n🎨 Checking Highlighting Styles:');
  
  const literary = document.querySelector('.literary-highlight');
  const poetry = document.querySelector('.poetry-highlight');
  
  if (literary) {
    const styles = window.getComputedStyle(literary);
    console.log('📚 Book highlight background:', styles.background);
  }
  
  if (poetry) {
    const styles = window.getComputedStyle(poetry);
    console.log('✍️ Poetry highlight background:', styles.background);
  }
  
  // Check if CSS is loaded
  const hasLiteraryCSS = Array.from(document.styleSheets).some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule => 
        rule.selectorText && rule.selectorText.includes('literary-highlight')
      );
    } catch(e) {
      return false;
    }
  });
  
  console.log('💅 Literary CSS loaded:', hasLiteraryCSS);
}

// List all books found on current page
function listBooksOnPage() {
  const allHighlights = document.querySelectorAll('.literary-highlight, .poetry-highlight');
  const books = new Map();
  
  allHighlights.forEach(el => {
    const title = el.getAttribute('data-title');
    const author = el.getAttribute('data-author');
    const key = `${title} by ${author}`;
    
    if (!books.has(key)) {
      books.set(key, {
        title,
        author,
        count: 0,
        type: el.classList.contains('poetry-highlight') ? 'poetry' : 'book'
      });
    }
    books.get(key).count++;
  });
  
  console.log('\n📚 Books Found on Current Page:');
  console.log('================================');
  
  Array.from(books.values())
    .sort((a, b) => b.count - a.count)
    .forEach(book => {
      const icon = book.type === 'poetry' ? '✍️' : '📖';
      console.log(`${icon} "${book.title}" by ${book.author} (${book.count} mentions)`);
    });
}

// Make functions available
window.countLiteraryHighlights = countLiteraryHighlights;
window.testBookSearch = testBookSearch;
window.checkHighlightingStyles = checkHighlightingStyles;
window.listBooksOnPage = listBooksOnPage;

console.log(`
Available test commands:
- countLiteraryHighlights() - Count book highlights on page
- testBookSearch('Ariel') - Search for a specific book
- checkHighlightingStyles() - Verify CSS is working
- listBooksOnPage() - List all books found on current page
`);

// Auto-run count on load
countLiteraryHighlights();