export interface Work {
  title: string;
  artist?: string;
  type?: string;
  year?: number;
}

export function extractWorks(analysis: string): Work[] {
  const works: Work[] = [];

  // Find the WORKS DISCUSSED IN THIS VIDEO section
  const worksMatch = analysis.match(/## WORKS DISCUSSED IN THIS VIDEO\s*\n([\s\S]*?)(?=\n## |\n\*\*\[|$)/);
  if (!worksMatch) {
    return works;
  }

  const worksContent = worksMatch[1];
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
        title: title,
        artist: creator || undefined,
        type: 'work',
        year
      });
    }
  }

  return works;
}