// Debug script for context highlighting
console.log('=== CONTEXT HIGHLIGHTING DEBUG ===\n');

// Function to debug the current state
function debugHighlighting() {
  console.log('🔍 DEBUGGING CONTEXT HIGHLIGHTING:\n');
  
  // 1. Check URL Parameters
  console.log('1️⃣ URL PARAMETERS:');
  const urlParams = new URLSearchParams(window.location.search);
  const fromSearch = urlParams.get('fromSearch');
  const searchTerm = urlParams.get('searchTerm');
  const context = urlParams.get('context');
  const page = urlParams.get('page');
  
  console.log('  - fromSearch:', fromSearch);
  console.log('  - searchTerm:', searchTerm);
  console.log('  - context:', context ? context.substring(0, 50) + '...' : null);
  console.log('  - page:', page);
  console.log('  - Full URL:', window.location.href);
  
  // 2. Check DOM Elements
  console.log('\n2️⃣ DOM ELEMENTS:');
  const searchHighlights = document.querySelectorAll('.search-highlight');
  const contextHighlights = document.querySelectorAll('.search-context-highlight');
  const contentRef = document.querySelector('[ref="contentRef"]') || document.querySelector('.page-content');
  
  console.log('  - Search highlights found:', searchHighlights.length);
  console.log('  - Context highlights found:', contextHighlights.length);
  console.log('  - Content container exists:', !!contentRef);
  
  // 3. Check if applyDualHighlighting would run
  console.log('\n3️⃣ CONDITION CHECKS:');
  console.log('  - Has fromSearch=true?', fromSearch === 'true');
  console.log('  - Has searchTerm?', !!searchTerm);
  console.log('  - Has context?', !!context);
  console.log('  - Should apply context highlighting?', fromSearch === 'true' && !!context);
  
  // 4. Check page content
  console.log('\n4️⃣ PAGE CONTENT:');
  const pageContent = document.body.innerText.substring(0, 200);
  console.log('  - Sample content:', pageContent + '...');
  
  if (searchTerm) {
    const searchTermInPage = document.body.innerText.toLowerCase().includes(searchTerm.toLowerCase());
    console.log('  - Search term "' + searchTerm + '" found in page?', searchTermInPage);
  }
  
  if (context) {
    const normalizedContext = context.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"').replace(/\s+/g, ' ');
    const pageText = document.body.innerText.toLowerCase().replace(/['']/g, "'").replace(/[""]/g, '"').replace(/\s+/g, ' ');
    const contextInPage = pageText.includes(normalizedContext);
    console.log('  - Context snippet found in page?', contextInPage);
  }
  
  // 5. Check CSS classes
  console.log('\n5️⃣ CSS CLASSES LOADED:');
  const styles = Array.from(document.styleSheets).some(sheet => {
    try {
      return Array.from(sheet.cssRules || []).some(rule => 
        rule.selectorText && rule.selectorText.includes('search-context-highlight')
      );
    } catch(e) {
      return false;
    }
  });
  console.log('  - CSS for .search-context-highlight loaded?', styles);
  
  console.log('\n----------------------------\n');
}

// Function to manually trigger highlighting
function triggerHighlighting() {
  console.log('🔧 MANUALLY TRIGGERING HIGHLIGHTING...\n');
  
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('searchTerm');
  const context = urlParams.get('context');
  
  if (!searchTerm || !context) {
    console.log('❌ Missing searchTerm or context in URL');
    return;
  }
  
  // Find and highlight manually
  const pageText = document.body.innerText;
  const normalizeText = (text) => {
    return text.toLowerCase()
      .replace(/['']/g, "'")
      .replace(/[""]/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normalizedContext = normalizeText(context);
  const normalizedPage = normalizeText(pageText);
  
  const index = normalizedPage.indexOf(normalizedContext);
  if (index !== -1) {
    console.log('✅ Context found at position:', index);
    
    // Try to find the actual element
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    let found = false;
    while (node = walker.nextNode()) {
      if (normalizeText(node.textContent).includes(normalizedContext.substring(0, 30))) {
        console.log('✅ Found text node containing context');
        if (node.parentElement) {
          node.parentElement.style.backgroundColor = 'rgba(147, 197, 253, 0.3)';
          node.parentElement.style.border = '2px solid blue';
          console.log('✅ Applied manual highlighting');
          found = true;
          break;
        }
      }
    }
    
    if (!found) {
      console.log('❌ Could not find exact text node');
    }
  } else {
    console.log('❌ Context not found in page text');
  }
}

// Function to test by adding URL params
function testWithParams() {
  const params = new URLSearchParams({
    page: '103',
    searchTerm: 'Hotel Chelsea',
    context: 'We were staying at the Hotel Chelsea',
    fromSearch: 'true'
  });
  
  const newUrl = window.location.pathname + '?' + params.toString();
  console.log('📍 Setting URL to:', newUrl);
  window.history.pushState({}, '', newUrl);
  console.log('✅ URL updated. Reload the page to trigger highlighting.');
}

// Make functions available
window.debugHighlighting = debugHighlighting;
window.triggerHighlighting = triggerHighlighting;
window.testWithParams = testWithParams;

console.log('Available debug commands:');
console.log('- debugHighlighting() - Check current state');
console.log('- triggerHighlighting() - Manually apply highlighting');
console.log('- testWithParams() - Add test URL params\n');

// Auto-run debug on load
debugHighlighting();