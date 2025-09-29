import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';

const router = Router();

// Get data path from environment or use default
const VIDEO_DATA_PATH = process.env.VIDEO_DATA_PATH ||
  '/Users/j.d.heilprin/Desktop/my-claude/podcast-test/youtube-analysis-viewer/data/videos';

// YouTube API keys with rotation
const YOUTUBE_API_KEYS = [
  process.env.YOUTUBE_API_KEY,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3
].filter(Boolean);

let currentKeyIndex = 0;

// Helper to get the next available API key
function getNextApiKey() {
  if (YOUTUBE_API_KEYS.length === 0) {
    console.error('No YouTube API keys configured');
    return null;
  }
  const key = YOUTUBE_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % YOUTUBE_API_KEYS.length;
  return key;
}

// Search through analyzed videos in the data directory
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const searchQuery = (q as string || '').toLowerCase().trim();

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    // Check if data directory exists
    if (!fs.existsSync(VIDEO_DATA_PATH)) {
      console.log('Video data directory not found:', VIDEO_DATA_PATH);
      return res.json({ results: [] });
    }

    // Read all video directories
    const videoDirs = fs.readdirSync(VIDEO_DATA_PATH)
      .filter(file => {
        const filePath = path.join(VIDEO_DATA_PATH, file);
        return fs.statSync(filePath).isDirectory();
      });

    const searchResults = [];

    // Search through each video's metadata and analysis
    for (const dir of videoDirs) {
      const metadataPath = path.join(VIDEO_DATA_PATH, dir, 'metadata.json');
      const analysisPath = path.join(VIDEO_DATA_PATH, dir, 'analysis.md');

      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

          // Search in title, channel, and description
          const searchableText = `${metadata.title || ''} ${metadata.channel || ''} ${metadata.description || ''}`.toLowerCase();

          // Also check analysis content if it exists
          let analysisText = '';
          if (fs.existsSync(analysisPath)) {
            analysisText = fs.readFileSync(analysisPath, 'utf-8').toLowerCase();
          }

          // Check if query matches
          if (searchableText.includes(searchQuery) || analysisText.includes(searchQuery)) {
            // Get video ID from metadata
            const videoId = metadata.video_id || metadata.videoId || '';

            // Generate thumbnail URL from video ID
            const thumbnail = videoId
              ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              : '';

            searchResults.push({
              id: dir,
              title: metadata.title || dir,
              channel: metadata.channel || '',
              description: metadata.description || '',
              thumbnail: thumbnail,
              duration: metadata.duration || 'Unknown',
              videoId: videoId,
              url: metadata.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '')
            });
          }
        } catch (error) {
          console.error(`Error reading metadata for ${dir}:`, error);
        }
      }
    }

    // Sort by relevance (title matches first)
    searchResults.sort((a, b) => {
      const aInTitle = a.title.toLowerCase().includes(searchQuery);
      const bInTitle = b.title.toLowerCase().includes(searchQuery);
      if (aInTitle && !bInTitle) return -1;
      if (!aInTitle && bInTitle) return 1;
      return 0;
    });

    return res.json({
      results: searchResults.slice(0, 20), // Limit to 20 results
      total: searchResults.length
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Failed to search videos' });
  }
});

// Get video data from shared directory
router.get('/videos/:videoname', async (req, res) => {
  const { videoname } = req.params;

  if (!videoname) {
    return res.status(400).json({ error: 'Video name required' });
  }

  try {
    const videoPath = path.join(VIDEO_DATA_PATH, videoname);

    // Check if directory exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Read metadata
    const metadataPath = path.join(videoPath, 'metadata.json');
    const metadata = fs.existsSync(metadataPath)
      ? JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      : null;

    // Read analysis
    const analysisPath = path.join(videoPath, 'analysis.md');
    const analysis = fs.existsSync(analysisPath)
      ? fs.readFileSync(analysisPath, 'utf-8')
      : null;

    // Read transcript
    const transcriptPath = path.join(videoPath, 'transcript.txt');
    const transcript = fs.existsSync(transcriptPath)
      ? fs.readFileSync(transcriptPath, 'utf-8')
      : null;

    return res.json({
      metadata,
      analysis,
      transcript
    });
  } catch (error) {
    console.error('Error reading video data:', error);
    return res.status(500).json({ error: 'Failed to read video data' });
  }
});

// List available videos
router.get('/videos', async (req, res) => {
  try {
    if (!fs.existsSync(VIDEO_DATA_PATH)) {
      return res.json({ videos: [] });
    }

    const directories = fs.readdirSync(VIDEO_DATA_PATH)
      .filter(file => {
        const filePath = path.join(VIDEO_DATA_PATH, file);
        return fs.statSync(filePath).isDirectory();
      });

    const videos = directories.map(dir => {
      const metadataPath = path.join(VIDEO_DATA_PATH, dir, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
          return {
            name: dir,
            ...metadata
          };
        } catch (error) {
          console.error(`Error reading metadata for ${dir}:`, error);
        }
      }
      return { name: dir };
    }).filter(Boolean);

    return res.json({ videos });
  } catch (error) {
    console.error('Error listing videos:', error);
    return res.status(500).json({ error: 'Failed to list videos' });
  }
});

// Search YouTube for a specific track (song + artist)
router.get('/search-track', async (req, res) => {
  const { song, artist } = req.query;

  if (!song) {
    return res.status(400).json({ error: 'Song title required' });
  }

  // Search for the song and artist, we'll prioritize VEVO/Official in the results
  const query = artist ? `${song} ${artist}` : song as string;
  const apiKey = getNextApiKey();

  if (!apiKey) {
    return res.status(500).json({ error: 'No YouTube API keys configured' });
  }

  // Get more results so we can prioritize VEVO
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${apiKey}`;

  return new Promise((resolve, reject) => {
    https.get(searchUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.error) {
            console.log('YouTube API error details:', result.error);
            // Try next API key if quota exceeded (403) or forbidden (403)
            if ((result.error.code === 403 || result.error.code === 429) && YOUTUBE_API_KEYS.length > 1) {
              console.log('API quota exceeded, trying next key...');
              const nextKey = getNextApiKey();
              if (nextKey) {
                // Recursive call with next key
                const nextUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${nextKey}`;
                https.get(nextUrl, (resp) => {
                  let nextData = '';
                  resp.on('data', (chunk) => { nextData += chunk; });
                  resp.on('end', () => {
                    const nextResult = JSON.parse(nextData);
                    if (nextResult.items && nextResult.items.length > 0) {
                      const video = nextResult.items[0];
                      res.json({
                        videoId: video.id.videoId,
                        title: video.snippet.title,
                        channel: video.snippet.channelTitle
                      });
                    } else {
                      res.json({ videoId: null, error: 'No results found' });
                    }
                  });
                });
                return;
              }
            }
            console.error('YouTube API error:', result.error);
            res.status(500).json({ error: result.error.message });
          } else if (result.items && result.items.length > 0) {
            // Sort videos by priority:
            // 1. VEVO channels (ends with "VEVO")
            // 2. Official artist channels (includes artist name or "Official")
            // 3. Everything else
            const sortedVideos = result.items.sort((a, b) => {
              const channelA = a.snippet.channelTitle || '';
              const channelB = b.snippet.channelTitle || '';
              const titleA = a.snippet.title || '';
              const titleB = b.snippet.title || '';

              // Check if VEVO
              const isVevoA = channelA.toUpperCase().includes('VEVO');
              const isVevoB = channelB.toUpperCase().includes('VEVO');

              if (isVevoA && !isVevoB) return -1;
              if (!isVevoA && isVevoB) return 1;

              // Check if official artist channel
              const artistName = (artist as string || '').toLowerCase();
              const isOfficialA = channelA.toLowerCase().includes(artistName) ||
                                  channelA.toLowerCase().includes('official') ||
                                  titleA.toLowerCase().includes('official');
              const isOfficialB = channelB.toLowerCase().includes(artistName) ||
                                  channelB.toLowerCase().includes('official') ||
                                  titleB.toLowerCase().includes('official');

              if (isOfficialA && !isOfficialB) return -1;
              if (!isOfficialA && isOfficialB) return 1;

              return 0;
            });

            const video = sortedVideos[0];
            console.log(`Selected video: "${video.snippet.title}" by ${video.snippet.channelTitle}`);

            res.json({
              videoId: video.id.videoId,
              title: video.snippet.title,
              channel: video.snippet.channelTitle
            });
          } else {
            res.json({ videoId: null, error: 'No results found' });
          }
        } catch (error) {
          console.error('Error parsing YouTube response:', error);
          res.status(500).json({ error: 'Failed to parse YouTube response' });
        }
      });
    }).on('error', (error) => {
      console.error('YouTube API request failed:', error);
      res.status(500).json({ error: 'Failed to search YouTube' });
    });
  });
});

export default router;