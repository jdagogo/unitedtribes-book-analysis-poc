// Test script for Context Highlighting Feature
// Run this in the browser console at http://localhost:3000

console.log(`
========================================
CONTEXT HIGHLIGHTING TEST INSTRUCTIONS
========================================

To test the dual highlighting system:

1. Open http://localhost:3000 in your browser
2. Navigate to the book reader page
3. Click the Search button or press Cmd/Ctrl + F
4. Search for "Hotel Chelsea" (or any entity)
5. Click on any search result

EXPECTED BEHAVIOR:
✅ You should be navigated to the correct page
✅ The search term "Hotel Chelsea" should be highlighted in YELLOW
✅ The surrounding context (from the search result) should have a LIGHT BLUE background
✅ The page should auto-scroll to the highlighted section
✅ The search term should pulse 2 times to draw attention

VISUAL INDICATORS:
🟡 Yellow highlight = The exact search term
🔵 Light blue background = The context snippet from search result
➡️ Blue left border = Context indicator

TEST CASES:
1. Search "Hotel Chelsea" → Click result → See dual highlighting
2. Search "bermuda" → Click result → See dual highlighting  
3. Search "Robert Mapplethorpe" → Click result → See dual highlighting
4. Search any term → Navigate → Verify context is preserved

DEBUGGING:
Check sessionStorage for stored context:
  sessionStorage.getItem('searchContext')
  sessionStorage.getItem('searchTerm')

Check for applied CSS classes:
  document.querySelector('.search-highlight')
  document.querySelector('.search-context-highlight')
========================================
`);

// Helper function to verify highlighting
function checkHighlighting() {
  const searchHighlights = document.querySelectorAll('.search-highlight');
  const contextHighlights = document.querySelectorAll('.search-context-highlight');
  
  console.log('Highlighting Status:');
  console.log(`  Search term highlights: ${searchHighlights.length}`);
  console.log(`  Context highlights: ${contextHighlights.length}`);
  
  if (searchHighlights.length > 0) {
    console.log('  ✅ Search term highlighting is working');
  } else {
    console.log('  ❌ No search term highlighting found');
  }
  
  if (contextHighlights.length > 0) {
    console.log('  ✅ Context highlighting is working');
  } else {
    console.log('  ❌ No context highlighting found');
  }
  
  // Check sessionStorage
  const storedContext = sessionStorage.getItem('searchContext');
  const storedTerm = sessionStorage.getItem('searchTerm');
  
  if (storedContext || storedTerm) {
    console.log('\nStored in sessionStorage:');
    console.log(`  Search term: "${storedTerm}"`);
    console.log(`  Context: "${storedContext?.substring(0, 100)}..."`);
  }
}

// Make function available globally
window.checkHighlighting = checkHighlighting;

console.log('\nRun checkHighlighting() after navigating from a search result to verify the feature is working.');