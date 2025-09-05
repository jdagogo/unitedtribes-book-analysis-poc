// Test to verify the spacing issue and potential fix

function analyzeTextReconstruction() {
  console.log('📝 TEXT RECONSTRUCTION ANALYSIS');
  console.log('=' .repeat(50));
  
  // Simulate the text processing that happens in the component
  const testText = "I saw  Coltrane  perform. He played with  Kerouac  nearby.";
  
  console.log('Original text:', JSON.stringify(testText));
  console.log('Length:', testText.length);
  
  // Current approach (what the code does)
  const words = testText.split(/\s+/).filter(word => word.length > 0);
  const reconstructed = words.join(' ');
  
  console.log('\nCurrent approach:');
  console.log('Words:', words);
  console.log('Reconstructed:', JSON.stringify(reconstructed));
  console.log('Length:', reconstructed.length);
  console.log('Match original?', testText === reconstructed);
  
  // The issue: we've normalized spacing, so now when we try to highlight
  // entities, the positions might not match
  
  // Test highlighting on reconstructed text
  const entities = ['Coltrane', 'Kerouac'];
  let highlighted = reconstructed;
  
  entities.forEach(entity => {
    const regex = new RegExp(`\\b(${entity})\\b`, 'gi');
    highlighted = highlighted.replace(regex, '<span>$1</span>');
  });
  
  console.log('\nHighlighted result:');
  console.log(highlighted);
  
  // Now test if we had preserved original spacing
  console.log('\n' + '=' .repeat(50));
  console.log('ALTERNATIVE: Preserve spacing approach');
  
  // Better approach - preserve original spacing structure
  const sentences = testText.match(/[^.!?]+[.!?]+\s*/g) || [testText];
  console.log('Sentences with spacing preserved:', sentences.map(s => JSON.stringify(s)));
  
  const betterReconstruction = sentences.join('');
  console.log('Better reconstruction:', JSON.stringify(betterReconstruction));
  console.log('Matches original?', testText === betterReconstruction);
}

// Check actual page content
function checkActualPageContent() {
  console.log('\n📄 ACTUAL PAGE CONTENT CHECK');
  console.log('=' .repeat(50));
  
  const pageContent = document.querySelector('.page-content');
  if (!pageContent) {
    console.log('No page content found');
    return;
  }
  
  // Get all text nodes to see actual spacing
  const walker = document.createTreeWalker(
    pageContent,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  let textNodes = [];
  while (node = walker.nextNode()) {
    const text = node.textContent;
    if (text.trim()) {
      // Check for multiple spaces
      const doubleSpaces = (text.match(/  +/g) || []).length;
      if (doubleSpaces > 0) {
        console.log(`Text node with ${doubleSpaces} double spaces:`, JSON.stringify(text.substring(0, 50)));
      }
      textNodes.push(text);
    }
  }
  
  console.log(`Total text nodes: ${textNodes.length}`);
  
  // Check for Coltrane and Kerouac in text nodes
  const targets = ['Coltrane', 'Kerouac'];
  targets.forEach(target => {
    const found = textNodes.filter(t => t.includes(target));
    if (found.length > 0) {
      console.log(`\n${target} found in ${found.length} text nodes:`);
      found.forEach(t => {
        const index = t.indexOf(target);
        const before = t.substring(Math.max(0, index - 10), index);
        const after = t.substring(index + target.length, index + target.length + 10);
        console.log(`  Context: "${before}[${target}]${after}"`);
      });
    }
  });
}

// Run tests
console.clear();
analyzeTextReconstruction();
checkActualPageContent();

// Export
window.spacingAnalysis = {
  reconstruct: analyzeTextReconstruction,
  check: checkActualPageContent
};