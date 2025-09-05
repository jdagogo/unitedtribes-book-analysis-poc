// Test to verify the regex fix for entity highlighting

function testRegexWithWhitespace() {
  // Simulate various text scenarios with different whitespace
  const testCases = [
    "I saw Coltrane perform",  // Normal case
    "I saw  Coltrane  perform",  // Extra spaces
    "I saw\nColtrane perform",  // Newline before
    "I saw Coltrane\nperform",  // Newline after
    "I saw\n  Coltrane  \nperform",  // Complex whitespace
    "The book by Kerouac was",  // Normal
    "The book by  Kerouac  was",  // Extra spaces
    "The book by\n  Kerouac\nwas"  // Complex
  ];
  
  const entities = ['Coltrane', 'Kerouac'];
  
  console.log('Testing regex patterns with various whitespace:\n');
  
  testCases.forEach(text => {
    console.log(`\nOriginal text: "${text.replace(/\n/g, '\\n')}"`);
    
    entities.forEach(entity => {
      // Current pattern (might capture extra whitespace)
      const currentRegex = new RegExp(`\\b(${entity})\\b`, 'gi');
      let match = currentRegex.exec(text);
      if (match) {
        console.log(`  ${entity}: Found at index ${match.index}, matched: "${match[0]}"`);
        if (match[0] !== entity) {
          console.log(`    ⚠️ PROBLEM: Matched "${match[0]}" instead of "${entity}"`);
        }
      }
    });
  });
}

// Test the actual highlighting function behavior
function simulateHighlighting(text, entity) {
  const escapedName = entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b(${escapedName})\\b`, 'gi');
  
  let result = text;
  let match;
  const replacements = [];
  
  while ((match = regex.exec(text)) !== null) {
    replacements.push({
      start: match.index,
      end: match.index + match[0].length,
      match: match[0]
    });
  }
  
  // Apply replacements in reverse order
  replacements.sort((a, b) => b.start - a.start);
  replacements.forEach(r => {
    const replacement = `<span>${r.match}</span>`;
    result = result.slice(0, r.start) + replacement + result.slice(r.end);
  });
  
  return result;
}

console.log('\n========================================');
console.log('Testing actual replacement logic:');
console.log('========================================\n');

const problematicTexts = [
  "I saw  Coltrane  play",
  "Meeting\n  Kerouac\nwas amazing"
];

problematicTexts.forEach(text => {
  console.log(`Input: "${text.replace(/\n/g, '\\n')}"`);
  const result1 = simulateHighlighting(text, 'Coltrane');
  const result2 = simulateHighlighting(text, 'Kerouac');
  console.log(`Result: "${(result1 || result2).replace(/\n/g, '\\n')}"`);
  console.log('');
});

// Run the test
testRegexWithWhitespace();