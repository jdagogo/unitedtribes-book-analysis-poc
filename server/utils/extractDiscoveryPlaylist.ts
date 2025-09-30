export interface DiscoveryPlaylistCategory {
  title: string;
  songs: Array<{
    title: string;
    artist: string;
  }>;
}

export function extractDiscoveryPlaylist(analysis: string): DiscoveryPlaylistCategory[] {
  const categories: DiscoveryPlaylistCategory[] = [];

  // Find the DISCOVERY PLAYLIST section
  const playlistMatch = analysis.match(/## DISCOVERY PLAYLIST\s*\n([\s\S]*?)(?=\n## |$)/);
  if (!playlistMatch) {
    return categories;
  }

  const playlistContent = playlistMatch[1];

  // Split into categories by looking for bold text followed by songs
  const categoryPattern = /\*\*([^*]+)\*\*\s*\n((?:- .+\n?)+)/g;
  let match;

  while ((match = categoryPattern.exec(playlistContent)) !== null) {
    const categoryTitle = match[1].trim();
    const songsText = match[2];

    // Parse individual songs
    const songs: Array<{ title: string; artist: string }> = [];
    const songLines = songsText.split('\n').filter(line => line.trim().startsWith('-'));

    for (const line of songLines) {
      // Remove the leading dash and trim
      const songText = line.replace(/^-\s*/, '').trim();

      // Remove quotes if present
      const cleanedText = songText.replace(/^["']|["']$/g, '');

      // Try to parse "Song Title" - Artist format
      const dashMatch = cleanedText.match(/^(.+?)\s*-\s*(.+)$/);
      if (dashMatch) {
        songs.push({
          title: dashMatch[1].replace(/^["']|["']$/g, '').trim(),
          artist: dashMatch[2].trim()
        });
      } else {
        // If no dash, assume it's just a title and try to infer artist from category
        songs.push({
          title: cleanedText,
          artist: inferArtistFromCategory(categoryTitle, cleanedText)
        });
      }
    }

    if (songs.length > 0) {
      categories.push({
        title: categoryTitle,
        songs
      });
    }
  }

  return categories;
}

function inferArtistFromCategory(categoryTitle: string, songTitle: string): string {
  // Try to extract artist name from category title
  // e.g., "John Coltrane Spiritual Period" -> "John Coltrane"
  // e.g., "McCoy Tyner Quartal Harmony" -> "McCoy Tyner"

  // Common patterns for artist names in category titles
  const artistPatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+)(?:\s+[A-Z]|$)/, // Two-word names like "John Coltrane"
    /^([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)(?:\s+[A-Z]|$)/, // Three-word names
    /^The ([A-Z][a-z]+)/, // Bands starting with "The"
  ];

  for (const pattern of artistPatterns) {
    const match = categoryTitle.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // Check for specific known patterns
  if (categoryTitle.includes('Coltrane')) return 'John Coltrane';
  if (categoryTitle.includes('McCoy Tyner')) return 'McCoy Tyner';
  if (categoryTitle.includes('Miles Davis')) return 'Miles Davis';
  if (categoryTitle.includes('Thelonious Monk')) return 'Thelonious Monk';
  if (categoryTitle.includes('Wayne Shorter')) return 'Wayne Shorter';
  if (categoryTitle.includes('Spiritual Jazz')) return 'Various Artists';
  if (categoryTitle.includes('Contemporary')) return 'Various Artists';
  if (categoryTitle.includes('Van Gelder')) return 'Various Artists';

  // Default fallback
  return 'Various Artists';
}