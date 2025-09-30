const fs = require('fs');

// Inline the extractWorks function for testing
function extractWorks(analysis) {
  const works = [];

  // Find the WORKS DISCUSSED IN THIS VIDEO section
  const worksMatch = analysis.match(/## WORKS DISCUSSED IN THIS VIDEO\s*\n([\s\S]*?)(?=\n## |\n\*\*\[|$)/);
  if (!worksMatch) {
    console.log('No works section found');
    return works;
  }

  const worksContent = worksMatch[1];
  console.log('Works content:', worksContent);
  const lines = worksContent.split('\n');

  for (const line of lines) {
    // Match patterns like:
    // - **Street of Dreams** - Bill Charlap Trio work
    // - **The Duke** - Dave Brubeck work
    const workPattern = line.match(/^-\s*\*\*([^*]+)\*\*\s*-\s*([^-]+?)(?:\s+work)?$/);

    if (workPattern) {
      const title = workPattern[1].trim();
      const creatorInfo = workPattern[2].trim();

      // Parse creator and possibly year
      const yearMatch = creatorInfo.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : undefined;
      const creator = creatorInfo.replace(/\s*\(\d{4}\)\s*/, '').trim();

      works.push({
        name: title,
        creator: creator || undefined,
        type: 'work',
        year
      });
      console.log('Found work:', title, 'by', creator);
    }
  }

  return works;
}

const analysis = fs.readFileSync('/Users/j.d.heilprin/Desktop/my-claude/podcast-test/youtube-analysis-viewer/data/videos/john_coltrane_on_giant_steps_blank_on_blank/analysis.md', 'utf-8');
const works = extractWorks(analysis);
console.log('\nExtracted works:', JSON.stringify(works, null, 2));