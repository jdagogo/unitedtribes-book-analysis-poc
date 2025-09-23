// Debug script for Love and Mr. Lewisham book recognition
console.log('🔍 Debugging Love and Mr. Lewisham Recognition');

const debugLewisham = {
  // Find all text containing Lewisham on the page
  findLewishamText: function() {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) {
      console.log('❌ No page content found');
      return;
    }
    
    const text = pageContent.innerText;
    const htmlContent = pageContent.innerHTML;
    
    // Find all occurrences of Lewisham
    const lewishamRegex = /(.{0,50})(Lewisham)(.{0,50})/gi;
    let match;
    const occurrences = [];
    
    while ((match = lewishamRegex.exec(text)) !== null) {
      occurrences.push({
        before: match[1],
        word: match[2],
        after: match[3],
        fullContext: match[0],
        index: match.index
      });
    }
    
    console.log(`Found ${occurrences.length} occurrences of "Lewisham":`);
    occurrences.forEach((occ, i) => {
      console.log(`\n${i + 1}. At position ${occ.index}:`);
      console.log(`   Before: "${occ.before}"`);
      console.log(`   Word: "${occ.word}"`);
      console.log(`   After: "${occ.after}"`);
      console.log(`   Full: "${occ.fullContext}"`);
    });
    
    return occurrences;
  },
  
  // Check what's actually being highlighted
  checkHighlighting: function() {
    const highlighted = document.querySelectorAll('.entity-literary');
    console.log(`\n📚 Literary entities highlighted: ${highlighted.length}`);
    
    highlighted.forEach((el, i) => {
      if (el.textContent.toLowerCase().includes('lewisham')) {
        console.log(`\n${i + 1}. Highlighted text: "${el.textContent}"`);
        console.log(`   Data attributes:`);
        console.log(`   - entity: ${el.getAttribute('data-entity')}`);
        console.log(`   - author: ${el.getAttribute('data-author')}`);
        console.log(`   - bookid: ${el.getAttribute('data-bookid')}`);
        
        // Get surrounding text
        const parent = el.parentElement;
        if (parent) {
          const parentText = parent.innerText || parent.textContent;
          const highlightedText = el.textContent;
          const index = parentText.indexOf(highlightedText);
          if (index !== -1) {
            const before = parentText.substring(Math.max(0, index - 30), index);
            const after = parentText.substring(index + highlightedText.length, index + highlightedText.length + 30);
            console.log(`   Context: "${before}[${highlightedText}]${after}"`);
          }
        }
      }
    });
  },
  
  // Test the regex pattern directly
  testPattern: function() {
    const testTexts = [
      "Love and Mr. Lewisham inscribed by H.G. Wells",
      "Love and Mr Lewisham inscribed",
      "Love and Mr.\nLewisham inscribed",
      "book Love and Mr. Lewisham by Wells"
    ];
    
    // Test patterns we're using
    const patterns = [
      /\bLove\s+and\s+Mr\.?\s+Lewisham\b/gi,
      /\bLove[\s\n\r]+and[\s\n\r]+Mr\.?[\s\n\r]+Lewisham\b/gi,
      /\bLove[\s\n\r]{1,3}and[\s\n\r]{1,3}Mr\.?[\s\n\r]{1,3}Lewisham\b/gi
    ];
    
    console.log('\n🧪 Testing regex patterns:');
    
    testTexts.forEach(text => {
      console.log(`\nText: "${text}"`);
      patterns.forEach((pattern, i) => {
        const matches = text.match(pattern);
        if (matches) {
          console.log(`  Pattern ${i + 1}: ✅ Matched "${matches[0]}"`);
        } else {
          console.log(`  Pattern ${i + 1}: ❌ No match`);
        }
      });
    });
  },
  
  // Get the actual text from the page
  getActualText: function() {
    const pageContent = document.querySelector('.page-content');
    if (!pageContent) return null;
    
    // Get both text and HTML
    const text = pageContent.innerText;
    const html = pageContent.innerHTML;
    
    // Find the section with Lewisham
    const index = text.toLowerCase().indexOf('lewisham');
    if (index === -1) {
      console.log('❌ "Lewisham" not found on this page');
      return null;
    }
    
    // Extract surrounding context
    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + 100);
    const context = text.substring(start, end);
    
    console.log('\n📄 Actual text on page:');
    console.log(`"${context}"`);
    
    // Show character codes to detect hidden characters
    const closeContext = text.substring(Math.max(0, index - 20), index + 30);
    console.log('\n🔤 Character analysis:');
    for (let i = 0; i < closeContext.length; i++) {
      const char = closeContext[i];
      const code = char.charCodeAt(0);
      if (code === 32) {
        console.log(`  [${i}]: SPACE (${code})`);
      } else if (code === 10) {
        console.log(`  [${i}]: NEWLINE (${code})`);
      } else if (code === 13) {
        console.log(`  [${i}]: CARRIAGE RETURN (${code})`);
      } else if (code === 9) {
        console.log(`  [${i}]: TAB (${code})`);
      } else {
        console.log(`  [${i}]: '${char}' (${code})`);
      }
    }
    
    return context;
  },
  
  // Full diagnostic
  diagnose: function() {
    console.log('🏥 FULL DIAGNOSTIC FOR LOVE AND MR. LEWISHAM');
    console.log('=============================================');
    
    console.log('\n1️⃣ Finding all Lewisham occurrences:');
    this.findLewishamText();
    
    console.log('\n2️⃣ Checking what is highlighted:');
    this.checkHighlighting();
    
    console.log('\n3️⃣ Testing regex patterns:');
    this.testPattern();
    
    console.log('\n4️⃣ Getting actual page text:');
    this.getActualText();
    
    console.log('\n5️⃣ Summary:');
    const highlighted = document.querySelectorAll('.entity-literary');
    const lewishamHighlights = Array.from(highlighted).filter(el => 
      el.textContent.toLowerCase().includes('lewisham')
    );
    
    console.log(`  - Total literary highlights: ${highlighted.length}`);
    console.log(`  - Lewisham highlights: ${lewishamHighlights.length}`);
    
    if (lewishamHighlights.length > 0) {
      lewishamHighlights.forEach(el => {
        console.log(`    • "${el.textContent}"`);
      });
    }
  }
};

// Make it globally available
window.debugLewisham = debugLewisham;

console.log('✅ Debug functions available:');
console.log('  - debugLewisham.diagnose() - Run full diagnostic');
console.log('  - debugLewisham.findLewishamText() - Find all Lewisham text');
console.log('  - debugLewisham.getActualText() - Get actual text with character codes');
console.log('  - debugLewisham.checkHighlighting() - Check what is highlighted');
console.log('');
console.log('📝 Navigate to a page with "Lewisham" and run: debugLewisham.diagnose()');