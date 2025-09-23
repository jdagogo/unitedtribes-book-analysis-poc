// Test script for URL-based Context Highlighting
// Run this in the browser console at http://localhost:3000

console.log(`
========================================
URL-BASED CONTEXT HIGHLIGHTING TEST
========================================

This test verifies that context highlighting works correctly using URL parameters
instead of component state, making it more reliable and persistent.

TEST 1: SEARCH NAVIGATION (Should have context highlighting)
=============================================================
1. Open search (Cmd/Ctrl + F)
2. Search for "Hotel Chelsea"
3. Click on any search result
4. Check the URL - should contain parameters like:
   ?page=103&searchTerm=Hotel%20Chelsea&context=[snippet]&fromSearch=true

✅ EXPECTED: Yellow highlight on "Hotel Chelsea"
✅ EXPECTED: Light blue background on surrounding context
✅ EXPECTED: Auto-scroll to highlighted section
✅ EXPECTED: URL contains search parameters

TEST 2: NORMAL NAVIGATION (Should clear highlighting)
======================================================
1. From the highlighted page, click "Next" or "Previous"
2. Check the URL - should be clean (no parameters)

✅ EXPECTED: Clean page with NO context highlighting
✅ EXPECTED: URL has no search parameters
✅ EXPECTED: Only standard entity highlighting remains

TEST 3: BROWSER BACK BUTTON (Should restore highlighting)
=========================================================
1. After navigating away, use browser back button
2. Return to the search result page

✅ EXPECTED: Highlighting restored from URL parameters
✅ EXPECTED: Context highlighting reappears
❌ FAIL: If highlighting doesn't restore

TEST 4: DIRECT URL ACCESS (Should apply highlighting)
=====================================================
1. Copy a URL with search parameters
2. Open it in a new tab/window

✅ EXPECTED: Highlighting applied based on URL params
✅ EXPECTED: Works even on fresh page load

========================================
`);

// Helper function to check current state
function checkURLHighlighting() {
  console.log('\n📊 CURRENT STATE CHECK:');
  console.log('------------------------');
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const fromSearch = urlParams.get('fromSearch');
  const searchTerm = urlParams.get('searchTerm');
  const context = urlParams.get('context');
  const page = urlParams.get('page');
  
  console.log('🔗 URL PARAMETERS:');
  if (fromSearch || searchTerm || context || page) {
    console.log('  fromSearch:', fromSearch || 'not set');
    console.log('  searchTerm:', searchTerm || 'not set');
    console.log('  context:', context ? context.substring(0, 50) + '...' : 'not set');
    console.log('  page:', page || 'not set');
  } else {
    console.log('  No URL parameters (clean URL)');
  }
  
  // Check for highlighting elements
  const contextHighlights = document.querySelectorAll('.search-context-highlight');
  const searchHighlights = document.querySelectorAll('.search-highlight');
  
  console.log('\n🎨 HIGHLIGHTING:');
  if (contextHighlights.length > 0) {
    console.log('  🔵 Context highlighting: ACTIVE (' + contextHighlights.length + ' elements)');
  } else {
    console.log('  ⚪ Context highlighting: NONE');
  }
  
  if (searchHighlights.length > 0) {
    console.log('  🟡 Search term highlighting: ACTIVE (' + searchHighlights.length + ' elements)');
  } else {
    console.log('  ⚪ Search term highlighting: NONE');
  }
  
  // Check if URL params match highlighting state
  console.log('\n✅ VALIDATION:');
  if (fromSearch === 'true' && contextHighlights.length > 0) {
    console.log('  ✅ URL params and highlighting are in sync');
  } else if (!fromSearch && contextHighlights.length === 0) {
    console.log('  ✅ No search params, no context highlighting (correct)');
  } else {
    console.log('  ⚠️ URL params and highlighting may be out of sync');
  }
  
  console.log('------------------------\n');
}

// Simulate search navigation with URL params
function simulateSearchNavigation() {
  const params = new URLSearchParams({
    page: '103',
    searchTerm: 'Hotel Chelsea',
    context: 'We were staying at the Hotel Chelsea, that haven for artists and poets',
    fromSearch: 'true'
  });
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({ fromSearch: true }, '', newUrl);
  window.location.reload(); // Reload to trigger highlighting
  
  console.log('📍 Simulated search navigation');
  console.log('   New URL:', newUrl);
  console.log('   Page will reload to apply highlighting...');
}

// Clear URL parameters
function clearURLParams() {
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, '', cleanUrl);
  console.log('✅ URL parameters cleared');
  console.log('   Clean URL:', cleanUrl);
}

// Make functions globally available
window.checkURLHighlighting = checkURLHighlighting;
window.simulateSearchNavigation = simulateSearchNavigation;
window.clearURLParams = clearURLParams;

console.log(`
Available test commands:
- checkURLHighlighting() - Check current URL params and highlighting state
- simulateSearchNavigation() - Add search params to URL and reload
- clearURLParams() - Remove all URL parameters
`);