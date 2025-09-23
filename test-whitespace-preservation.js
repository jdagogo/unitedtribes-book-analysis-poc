// Test to understand whitespace handling in the text reconstruction

function testWhitespaceHandling() {
  // Get a paragraph from the page
  const paragraph = document.querySelector('.page-content p');
  if (!paragraph) {
    console.log('No paragraph found');
    return;
  }
  
  // Get the innerHTML and textContent
  const html = paragraph.innerHTML;
  const text = paragraph.textContent;
  
  console.log('📝 Paragraph Analysis:');
  console.log('=' .repeat(50));
  
  // Look for highlighted entities
  const highlights = paragraph.querySelectorAll('.entity-highlight, .entity-person, .entity-literary');
  
  if (highlights.length === 0) {
    console.log('No highlights in this paragraph');
    return;
  }
  
  highlights.forEach((highlight, i) => {
    console.log(`\n🔍 Highlight ${i + 1}: "${highlight.textContent}"`);
    
    // Find position in HTML
    const highlightHTML = highlight.outerHTML;
    const htmlIndex = html.indexOf(highlightHTML);
    
    if (htmlIndex !== -1) {
      // Get surrounding context in HTML (10 chars before and after)
      const beforeStart = Math.max(0, htmlIndex - 20);
      const afterEnd = Math.min(html.length, htmlIndex + highlightHTML.length + 20);
      
      const beforeContext = html.substring(beforeStart, htmlIndex);
      const afterContext = html.substring(htmlIndex + highlightHTML.length, afterEnd);
      
      console.log('HTML Context:');
      console.log(`  Before: "${beforeContext.replace(/\n/g, '\\n').replace(/  /g, '[2SP]')}"`);
      console.log(`  Highlight: "${highlightHTML.substring(0, 50)}..."`);
      console.log(`  After: "${afterContext.replace(/\n/g, '\\n').replace(/  /g, '[2SP]')}"`);
    }
    
    // Check text nodes around the highlight
    const prevNode = highlight.previousSibling;
    const nextNode = highlight.nextSibling;
    
    if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
      const prevText = prevNode.textContent;
      console.log(`Previous text node (last 10 chars): "${prevText.slice(-10).replace(/\n/g, '\\n').replace(/  /g, '[2SP]')}"`);
    }
    
    if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
      const nextText = nextNode.textContent;
      console.log(`Next text node (first 10 chars): "${nextText.slice(0, 10).replace(/\n/g, '\\n').replace(/  /g, '[2SP]')}"`);
    }
  });
}

// Check raw page data
function checkPageData() {
  // Try to access React component data
  const pageContent = document.querySelector('.page-content');
  if (!pageContent) return;
  
  // Get React fiber to access props
  const reactFiber = pageContent._reactInternalFiber || 
                    pageContent._reactInternalInstance ||
                    Object.keys(pageContent).find(key => key.startsWith('__reactInternalInstance'));
  
  if (reactFiber) {
    console.log('\n📊 React Component Data:');
    console.log('Found React internal data');
    // This would require more complex traversal
  }
  
  // Check the actual content being rendered
  const paragraphs = document.querySelectorAll('.page-content p');
  let totalDoubleSpaces = 0;
  let totalTripleSpaces = 0;
  
  paragraphs.forEach(p => {
    const text = p.textContent;
    const doubleSpaces = (text.match(/  /g) || []).length;
    const tripleSpaces = (text.match(/   /g) || []).length;
    
    totalDoubleSpaces += doubleSpaces;
    totalTripleSpaces += tripleSpaces;
  });
  
  console.log('\n📈 Whitespace Statistics:');
  console.log(`  Total paragraphs: ${paragraphs.length}`);
  console.log(`  Double spaces found: ${totalDoubleSpaces}`);
  console.log(`  Triple+ spaces found: ${totalTripleSpaces}`);
}

// Main execution
console.clear();
console.log('🔬 WHITESPACE PRESERVATION TEST');
console.log('=' .repeat(50));

testWhitespaceHandling();
checkPageData();

// Make available globally
window.whitespaceTest = {
  test: testWhitespaceHandling,
  stats: checkPageData
};

console.log(`
\nCommands:
- window.whitespaceTest.test() - Analyze first paragraph
- window.whitespaceTest.stats() - Get whitespace statistics
`);