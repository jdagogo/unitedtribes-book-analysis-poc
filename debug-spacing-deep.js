// Deep diagnostic for spacing issues in entity highlighting

function deepSpacingAnalysis() {
  console.log('🔍 DEEP SPACING ANALYSIS');
  console.log('=' .repeat(50));
  
  // Get all highlighted spans
  const highlights = document.querySelectorAll('.entity-highlight, .entity-literary, .entity-person, .entity-venue, .entity-author, .literary-highlight');
  
  const issues = [];
  
  highlights.forEach((span, i) => {
    // Get the parent paragraph
    const paragraph = span.closest('p');
    if (!paragraph) return;
    
    // Get the raw HTML of the paragraph
    const paragraphHTML = paragraph.innerHTML;
    
    // Find this span in the HTML
    const spanOuterHTML = span.outerHTML;
    const spanIndex = paragraphHTML.indexOf(spanOuterHTML);
    
    if (spanIndex === -1) return;
    
    // Check what's immediately before and after the span in the HTML
    const beforeChar = spanIndex > 0 ? paragraphHTML[spanIndex - 1] : '';
    const afterChar = spanIndex + spanOuterHTML.length < paragraphHTML.length ? 
                      paragraphHTML[spanIndex + spanOuterHTML.length] : '';
    
    // Check the actual text content
    const textContent = span.textContent;
    
    // Check computed styles
    const computedStyle = window.getComputedStyle(span);
    
    // Check for problems
    const problems = [];
    
    // Check if span text has leading/trailing spaces
    if (textContent !== textContent.trim()) {
      problems.push(`Text has whitespace: "${textContent}"`);
    }
    
    // Check HTML context
    if (beforeChar === ' ' && afterChar === ' ') {
      problems.push('Span surrounded by spaces in HTML');
    }
    
    // Check display type
    if (computedStyle.display === 'inline-block') {
      problems.push('Still using inline-block display');
    }
    
    // Check margins
    const marginLeft = computedStyle.marginLeft;
    const marginRight = computedStyle.marginRight;
    if (marginLeft !== '0px' || marginRight !== '0px') {
      problems.push(`Has margins: left=${marginLeft}, right=${marginRight}`);
    }
    
    // Check padding
    const paddingLeft = computedStyle.paddingLeft;
    const paddingRight = computedStyle.paddingRight;
    if (paddingLeft !== '0px' || paddingRight !== '0px') {
      problems.push(`Has horizontal padding: left=${paddingLeft}, right=${paddingRight}`);
    }
    
    if (problems.length > 0) {
      issues.push({
        text: textContent,
        entity: span.getAttribute('data-entity'),
        classes: span.className,
        problems,
        html: {
          before: beforeChar === ' ' ? 'SPACE' : beforeChar === '\\n' ? 'NEWLINE' : `"${beforeChar}"`,
          after: afterChar === ' ' ? 'SPACE' : afterChar === '\\n' ? 'NEWLINE' : `"${afterChar}"`
        },
        computed: {
          display: computedStyle.display,
          marginLeft: computedStyle.marginLeft,
          marginRight: computedStyle.marginRight,
          paddingLeft: computedStyle.paddingLeft,
          paddingRight: computedStyle.paddingRight,
          wordSpacing: computedStyle.wordSpacing,
          whiteSpace: computedStyle.whiteSpace
        }
      });
    }
  });
  
  return issues;
}

// Check paragraph construction
function checkParagraphConstruction() {
  console.log('\\n📝 CHECKING PARAGRAPH CONSTRUCTION');
  console.log('=' .repeat(50));
  
  const paragraphs = document.querySelectorAll('.page-content p');
  
  paragraphs.forEach((p, i) => {
    const html = p.innerHTML;
    
    // Look for patterns that might cause issues
    const doubleSpaces = (html.match(/  +/g) || []).length;
    const spaceBeforeSpan = (html.match(/ <span/g) || []).length;
    const spaceAfterSpan = (html.match(/<\\/span> /g) || []).length;
    const newlinesInHTML = (html.match(/\\n/g) || []).length;
    
    if (doubleSpaces > 0 || spaceBeforeSpan > 0 || spaceAfterSpan > 0 || newlinesInHTML > 0) {
      console.log(`\\nParagraph ${i + 1} potential issues:`);
      if (doubleSpaces > 0) console.log(`  - ${doubleSpaces} double spaces`);
      if (spaceBeforeSpan > 0) console.log(`  - ${spaceBeforeSpan} spaces before spans`);
      if (spaceAfterSpan > 0) console.log(`  - ${spaceAfterSpan} spaces after spans`);
      if (newlinesInHTML > 0) console.log(`  - ${newlinesInHTML} newlines in HTML`);
      
      // Show a sample of the problematic HTML
      const sample = html.substring(0, 200).replace(/\\n/g, '\\\\n');
      console.log(`  Sample: ${sample}...`);
    }
  });
}

// Check specific entities mentioned by user
function checkSpecificEntities() {
  console.log('\\n🎯 CHECKING SPECIFIC ENTITIES (Coltrane, Kerouac)');
  console.log('=' .repeat(50));
  
  const targets = ['Coltrane', 'Kerouac'];
  
  targets.forEach(target => {
    const spans = Array.from(document.querySelectorAll('.entity-highlight, .entity-person'))
      .filter(span => span.textContent.includes(target));
    
    console.log(`\\n${target}: Found ${spans.length} instances`);
    
    spans.forEach((span, i) => {
      const parent = span.parentNode;
      const prevSibling = span.previousSibling;
      const nextSibling = span.nextSibling;
      
      console.log(`  Instance ${i + 1}:`);
      console.log(`    Text: "${span.textContent}"`);
      console.log(`    Classes: ${span.className}`);
      
      if (prevSibling) {
        const prevText = prevSibling.nodeType === Node.TEXT_NODE ? 
                        prevSibling.textContent : 'NOT_TEXT_NODE';
        console.log(`    Before: "${prevText.slice(-10)}"`);
      }
      
      if (nextSibling) {
        const nextText = nextSibling.nodeType === Node.TEXT_NODE ? 
                        nextSibling.textContent : 'NOT_TEXT_NODE';
        console.log(`    After: "${nextText.slice(0, 10)}"`);
      }
      
      // Get visual position to see if there's actual space
      const rect = span.getBoundingClientRect();
      const prevRect = prevSibling && prevSibling.nodeType === Node.ELEMENT_NODE ? 
                       prevSibling.getBoundingClientRect() : null;
      const nextRect = nextSibling && nextSibling.nodeType === Node.ELEMENT_NODE ? 
                       nextSibling.getBoundingClientRect() : null;
      
      if (prevRect) {
        const gap = rect.left - prevRect.right;
        if (gap > 5) console.log(`    ⚠️ Visual gap before: ${gap}px`);
      }
      
      if (nextRect) {
        const gap = nextRect.left - rect.right;
        if (gap > 5) console.log(`    ⚠️ Visual gap after: ${gap}px`);
      }
    });
  });
}

// Run all diagnostics
console.clear();
console.log('🔧 ENTITY SPACING DEEP DIAGNOSTIC');
console.log('=' .repeat(50));

const issues = deepSpacingAnalysis();

if (issues.length > 0) {
  console.log('\\n❌ ISSUES FOUND:');
  issues.forEach(issue => {
    console.log(`\\n"${issue.text}" (${issue.entity})`);
    issue.problems.forEach(p => console.log(`  - ${p}`));
    console.log(`  HTML context: before=${issue.html.before}, after=${issue.html.after}`);
    console.log(`  Computed styles:`, issue.computed);
  });
} else {
  console.log('\\n✅ No issues detected in analysis');
}

checkParagraphConstruction();
checkSpecificEntities();

// Export for further use
window.spacingDebug = {
  analyze: deepSpacingAnalysis,
  paragraphs: checkParagraphConstruction,
  specific: checkSpecificEntities,
  issues
};

console.log(`
\\n🛠️ Tools available:
- window.spacingDebug.analyze() - Re-run analysis
- window.spacingDebug.paragraphs() - Check paragraph construction
- window.spacingDebug.specific() - Check Coltrane/Kerouac
- window.spacingDebug.issues - View found issues
`);