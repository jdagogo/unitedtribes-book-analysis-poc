// Test script to debug the spacing issue with entity highlighting

function testHighlighting() {
  // Find all highlighted entities on the page
  const allHighlights = document.querySelectorAll(
    '.entity-highlight, .literary-highlight, .entity-literary, .entity-person, .entity-venue, .entity-author'
  );
  
  console.log(`Found ${allHighlights.length} highlighted entities`);
  
  const spacingIssues = [];
  
  allHighlights.forEach((highlight, index) => {
    const text = highlight.textContent;
    const prevNode = highlight.previousSibling;
    const nextNode = highlight.nextSibling;
    
    // Check if there are extra spaces before or after
    let hasProblem = false;
    let problemDesc = '';
    
    // Check previous text node
    if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
      const prevText = prevNode.textContent;
      if (prevText.endsWith('  ') || prevText.endsWith(' \n')) {
        hasProblem = true;
        problemDesc += `Extra space before: "${prevText.slice(-5)}" `;
      }
    }
    
    // Check next text node  
    if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
      const nextText = nextNode.textContent;
      if (nextText.startsWith('  ') || nextText.startsWith('\n ')) {
        hasProblem = true;
        problemDesc += `Extra space after: "${nextText.slice(0, 5)}" `;
      }
    }
    
    // Check the highlighted text itself
    if (text.startsWith(' ') || text.endsWith(' ')) {
      hasProblem = true;
      problemDesc += `Space in highlight: "${text}" `;
    }
    
    if (hasProblem) {
      spacingIssues.push({
        index,
        text: text.trim(),
        entity: highlight.getAttribute('data-entity'),
        classes: highlight.className,
        problem: problemDesc,
        context: {
          before: prevNode?.textContent?.slice(-20) || '',
          highlighted: text,
          after: nextNode?.textContent?.slice(0, 20) || ''
        }
      });
    }
  });
  
  if (spacingIssues.length > 0) {
    console.log('\n❌ FOUND SPACING ISSUES:');
    console.log('=' .repeat(50));
    spacingIssues.forEach(issue => {
      console.log(`\n📍 Entity: "${issue.text}" (${issue.entity})`);
      console.log(`   Classes: ${issue.classes}`);
      console.log(`   Problem: ${issue.problem}`);
      console.log(`   Context: ...${issue.context.before}[${issue.context.highlighted}]${issue.context.after}...`);
    });
  } else {
    console.log('\n✅ No spacing issues found!');
  }
  
  return spacingIssues;
}

// Check for duplicate highlights (might cause spacing)
function checkDuplicates() {
  const allHighlights = document.querySelectorAll('.entity-highlight');
  const positions = new Map();
  
  allHighlights.forEach(highlight => {
    const rect = highlight.getBoundingClientRect();
    const key = `${Math.round(rect.left)},${Math.round(rect.top)}`;
    
    if (positions.has(key)) {
      console.log('⚠️ Duplicate highlight at position:', key);
      console.log('  First:', positions.get(key));
      console.log('  Second:', highlight.textContent);
    } else {
      positions.set(key, highlight.textContent);
    }
  });
}

// Check raw HTML for issues
function checkRawHTML() {
  const pageContent = document.querySelector('.page-content');
  if (!pageContent) {
    console.log('No page content found');
    return;
  }
  
  const html = pageContent.innerHTML;
  
  // Look for common patterns that might cause spacing
  const patterns = [
    /></span>\\s+<span/g,  // Space between spans
    />\\s{2,}</g,          // Multiple spaces after tags
    />\\n\\s+</g,          // Newlines with spaces between tags
    /span>\\s+([A-Z])/g    // Space after span before capital letter
  ];
  
  patterns.forEach((pattern, i) => {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      console.log(`\n⚠️ Pattern ${i + 1} found ${matches.length} times:`);
      matches.slice(0, 3).forEach(m => {
        console.log(`  "${m.replace(/\n/g, '\\n')}"`);
      });
    }
  });
}

// Run all tests
console.log(`
========================================
ENTITY HIGHLIGHTING SPACING DEBUGGER
========================================
`);

const issues = testHighlighting();
console.log(`\n📊 Summary: ${issues.length} spacing issues found`);

console.log('\n🔍 Checking for duplicates...');
checkDuplicates();

console.log('\n🔍 Checking raw HTML...');
checkRawHTML();

// Make functions available globally
window.debugSpacing = {
  test: testHighlighting,
  duplicates: checkDuplicates,
  html: checkRawHTML,
  issues: issues
};

console.log(`
Available commands:
- window.debugSpacing.test() - Re-run spacing test
- window.debugSpacing.duplicates() - Check for duplicate highlights
- window.debugSpacing.html() - Check raw HTML patterns
- window.debugSpacing.issues - View last found issues
`);