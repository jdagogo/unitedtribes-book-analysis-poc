const fs = require('fs');

// Read the file
const content = fs.readFileSync('paginated-book-viewer.tsx', 'utf8');

// Split into lines
const lines = content.split('\n');

// Find line 1975 and fix it
if (lines[1974]) { // Line 1975 in 1-based indexing
  const line = lines[1974];
  // Check if it needs the closing bracket fix
  if (line.includes(') : currentPage')) {
    lines[1974] = '          )}\n        ) : currentPage?.originalData?.type === \'album_showcase\' ? (';
    console.log('Fixed line 1975 - added missing } bracket');
  }
}

// Write the fixed content back
fs.writeFileSync('paginated-book-viewer.tsx', lines.join('\n'));
console.log('File fixed successfully!');