// Test script for verifying context highlighting
console.log('🧪 Context Highlighting Test Script Loaded');

const testContextHighlighting = {
  // Check if context highlighting is applied
  checkHighlighting: function() {
    const contextHighlights = document.querySelectorAll('.search-context-highlight');
    const searchHighlights = document.querySelectorAll('.search-highlight');
    
    console.log('📊 Highlighting Status:');
    console.log(`  - Context highlights (blue background): ${contextHighlights.length}`);
    console.log(`  - Search term highlights (yellow): ${searchHighlights.length}`);
    
    if (contextHighlights.length > 0) {
      console.log('✅ Context highlighting is active');
      contextHighlights.forEach((el, i) => {
        console.log(`  Context ${i + 1}: "${el.textContent.substring(0, 100)}..."`);
      });
    } else {
      console.log('❌ No context highlighting found');
    }
    
    if (searchHighlights.length > 0) {
      console.log('✅ Search term highlighting is active');
      searchHighlights.forEach((el, i) => {
        console.log(`  Search ${i + 1}: "${el.textContent}"`);
      });
    }
    
    return {
      contextHighlights: contextHighlights.length,
      searchHighlights: searchHighlights.length
    };
  },
  
  // Clear all highlighting
  clearHighlighting: function() {
    document.querySelectorAll('.search-context-highlight').forEach(el => {
      el.classList.remove('search-context-highlight');
      el.classList.remove('search-context-highlight-enter');
    });
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });
    console.log('🧹 All highlighting cleared');
  },
  
  // Check URL parameters
  checkUrlParams: function() {
    const params = new URLSearchParams(window.location.search);
    console.log('🔍 URL Parameters:');
    console.log(`  - fromSearch: ${params.get('fromSearch')}`);
    console.log(`  - searchTerm: ${params.get('searchTerm')}`);
    console.log(`  - context: ${params.get('context')}`);
    return {
      fromSearch: params.get('fromSearch'),
      searchTerm: params.get('searchTerm'),
      context: params.get('context')
    };
  },
  
  // Force clear URL parameters
  clearUrlParams: function() {
    window.history.replaceState({}, '', window.location.pathname);
    console.log('✅ URL parameters cleared');
  },
  
  // Test search for a specific term
  testSearch: function(term) {
    console.log(`🔍 Testing search for: "${term}"`);
    
    // Simulate opening search
    const event = new KeyboardEvent('keydown', {
      key: 'f',
      ctrlKey: true,
      metaKey: true
    });
    document.dispatchEvent(event);
    
    console.log('📝 Search modal should be open. Enter your search term and click a result.');
    console.log('Then run: testContextHighlighting.checkHighlighting()');
  },
  
  // Full diagnostic
  diagnose: function() {
    console.log('🏥 Full Diagnostic Report:');
    console.log('========================');
    this.checkUrlParams();
    this.checkHighlighting();
    
    // Check for entity highlighting
    const personEntities = document.querySelectorAll('.entity-person');
    const placeEntities = document.querySelectorAll('.entity-place');
    const literaryEntities = document.querySelectorAll('.entity-literary');
    
    console.log('📚 Entity Highlighting:');
    console.log(`  - Person entities (blue): ${personEntities.length}`);
    console.log(`  - Place entities (green): ${placeEntities.length}`);
    console.log(`  - Literary works (purple): ${literaryEntities.length}`);
    
    // Check specific entities
    const robertFound = Array.from(personEntities).some(el => 
      el.textContent.toLowerCase().includes('robert') || 
      el.textContent.toLowerCase().includes('mapplethorpe')
    );
    const chelseaFound = Array.from(placeEntities).some(el => 
      el.textContent.toLowerCase().includes('chelsea')
    );
    
    console.log('🎯 Specific Entities:');
    console.log(`  - Robert Mapplethorpe: ${robertFound ? '✅ Found' : '❌ Not found'}`);
    console.log(`  - Hotel Chelsea: ${chelseaFound ? '✅ Found' : '❌ Not found'}`);
    
    return {
      urlParams: this.checkUrlParams(),
      highlighting: this.checkHighlighting(),
      entities: {
        person: personEntities.length,
        place: placeEntities.length,
        literary: literaryEntities.length,
        robertMapplethorpe: robertFound,
        hotelChelsea: chelseaFound
      }
    };
  }
};

// Make it globally available
window.testContextHighlighting = testContextHighlighting;

console.log('✅ Test functions available:');
console.log('  - testContextHighlighting.checkHighlighting() - Check current highlighting');
console.log('  - testContextHighlighting.clearHighlighting() - Clear all highlights');
console.log('  - testContextHighlighting.checkUrlParams() - Check URL parameters');
console.log('  - testContextHighlighting.clearUrlParams() - Clear URL parameters');
console.log('  - testContextHighlighting.diagnose() - Full diagnostic report');
console.log('');
console.log('📝 To test: Search for "Janis Joplin", click a result, then run diagnose()');