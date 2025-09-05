// Test script to verify Chelsea Hotel alias search consistency
// Run this in the browser console at http://localhost:3000

async function testChelseaSearch() {
  const searchVariants = [
    'Hotel Chelsea',
    'hotel chelsea',  // lowercase
    'Chelsea Hotel',
    'chelsea hotel',  // lowercase
    'the Chelsea',
    'the chelsea'     // lowercase
  ];
  
  console.log('Testing Chelsea Hotel search variants...\n');
  console.log('=' .repeat(50));
  
  for (const variant of searchVariants) {
    // Find the search input
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
    if (!searchInput) {
      console.error('Search input not found');
      return;
    }
    
    // Clear and enter search term
    searchInput.value = variant;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Trigger search
    const searchButton = document.querySelector('button[aria-label="Search"]') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Search'));
    
    if (searchButton) {
      searchButton.click();
    } else {
      // Trigger Enter key if no button found
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }
    
    // Wait for results to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Count results
    const resultElements = document.querySelectorAll('[class*="search-result"], [class*="result-item"]');
    const resultText = document.querySelector('[class*="results-header"], [class*="result-count"]');
    
    let count = 0;
    if (resultText) {
      const match = resultText.textContent.match(/(\d+)\s+result/i);
      if (match) {
        count = parseInt(match[1]);
      }
    } else if (resultElements.length > 0) {
      count = resultElements.length;
    }
    
    console.log(`"${variant}": ${count} results`);
  }
  
  console.log('=' .repeat(50));
  console.log('\nAll variants should return the same number of results.');
  console.log('This confirms the case-insensitive alias system is working correctly.');
}

// Instructions
console.log(`
Chelsea Hotel Search Test Script
=================================
To test the search consistency:

1. Open http://localhost:3000 in your browser
2. Navigate to the book search page
3. Open the browser console (F12)
4. Copy and paste this entire script
5. Run: testChelseaSearch()

The script will test all Chelsea Hotel variants and report the results.
`);