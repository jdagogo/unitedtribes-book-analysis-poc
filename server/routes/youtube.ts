import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Get data path from environment or use default
const VIDEO_DATA_PATH = process.env.VIDEO_DATA_PATH ||
  '/Users/j.d.heilprin/Desktop/my-claude/podcast-test/youtube-analysis-viewer/data/videos';

// Cache file for tracking API usage
const API_CACHE_PATH = path.join(__dirname, '../../data/youtube-api-cache.json');

// Cache file for song-to-video mappings
const VIDEO_CACHE_PATH = path.join(__dirname, '../../data/youtube-video-cache.json');

// Load or create API call cache
let apiCache = {};
try {
  if (fs.existsSync(API_CACHE_PATH)) {
    apiCache = JSON.parse(fs.readFileSync(API_CACHE_PATH, 'utf-8'));
  }
} catch (error) {
  console.error('Error loading API cache:', error);
  apiCache = {};
}

// Load or create video cache
let videoCache = {};
try {
  if (fs.existsSync(VIDEO_CACHE_PATH)) {
    videoCache = JSON.parse(fs.readFileSync(VIDEO_CACHE_PATH, 'utf-8'));
  }
} catch (error) {
  console.error('Error loading video cache:', error);
  videoCache = {};
}

// Function to track API calls
function trackApiCall(endpoint, units = 100, keyUsed = currentKeyIndex) {
  const now = Date.now();
  const callId = `${endpoint}_${now}_${Math.random().toString(36).substr(2, 9)}`;

  apiCache[callId] = {
    endpoint,
    timestamp: now,
    date: new Date(now).toISOString(),
    units,
    keyIndex: keyUsed,
    keyName: `YOUTUBE_API_KEY${keyUsed > 0 ? `_${keyUsed + 1}` : ''}`
  };

  // Save cache
  try {
    fs.writeFileSync(API_CACHE_PATH, JSON.stringify(apiCache, null, 2));
  } catch (error) {
    console.error('Error saving API cache:', error);
  }
}

// Function to create cache key from song and artist
function createCacheKey(song: string, artist?: string): string {
  const normalizedSong = song.toLowerCase().trim();
  const normalizedArtist = artist?.toLowerCase().trim() || '';
  return `${normalizedSong}|${normalizedArtist}`;
}

// Function to get cached video
function getCachedVideo(song: string, artist?: string) {
  const key = createCacheKey(song, artist);
  return videoCache[key];
}

// Function to save video to cache
function saveVideoToCache(song: string, artist: string | undefined, videoData: any) {
  const key = createCacheKey(song, artist);
  videoCache[key] = {
    ...videoData,
    cachedAt: new Date().toISOString(),
    song,
    artist
  };

  // Save to file
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(VIDEO_CACHE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(VIDEO_CACHE_PATH, JSON.stringify(videoCache, null, 2));
    console.log(`💾 Cached video for: ${song} - ${artist}`);
  } catch (error) {
    console.error('Error saving video cache:', error);
  }
}

// YouTube API keys with rotation
const YOUTUBE_API_KEYS = [
  process.env.YOUTUBE_API_KEY,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3,
  process.env.YOUTUBE_API_KEY_4,
  process.env.YOUTUBE_API_KEY_5,
  process.env.YOUTUBE_API_KEY_6,
  process.env.YOUTUBE_API_KEY_7,
  process.env.YOUTUBE_API_KEY_8,
  process.env.YOUTUBE_API_KEY_9
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

// Check YouTube API quota status for all configured keys
router.get('/quota-status', async (req, res) => {
  const quotaStatus = [];

  for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
    const apiKey = YOUTUBE_API_KEYS[i];
    if (!apiKey) continue;

    // Make a simple test request to check quota
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}`;

    try {
      await new Promise((resolve, reject) => {
        https.get(testUrl, (response) => {
          let data = '';
          response.on('data', (chunk) => { data += chunk; });
          response.on('end', () => {
            try {
              const result = JSON.parse(data);

              if (result.error) {
                if (result.error.code === 403 && result.error.message.includes('quota')) {
                  quotaStatus.push({
                    keyIndex: i,
                    keyName: `YOUTUBE_API_KEY${i > 0 ? `_${i + 1}` : ''}`,
                    status: 'QUOTA_EXCEEDED',
                    message: 'Daily quota limit exceeded'
                  });
                } else {
                  quotaStatus.push({
                    keyIndex: i,
                    keyName: `YOUTUBE_API_KEY${i > 0 ? `_${i + 1}` : ''}`,
                    status: 'ERROR',
                    message: result.error.message
                  });
                }
              } else if (result.items) {
                quotaStatus.push({
                  keyIndex: i,
                  keyName: `YOUTUBE_API_KEY${i > 0 ? `_${i + 1}` : ''}`,
                  status: 'WORKING',
                  message: 'API key is active and has quota available'
                });
              }
              resolve(null);
            } catch (error) {
              quotaStatus.push({
                keyIndex: i,
                keyName: `YOUTUBE_API_KEY${i > 0 ? `_${i + 1}` : ''}`,
                status: 'PARSE_ERROR',
                message: 'Failed to parse API response'
              });
              resolve(null);
            }
          });
        }).on('error', (error) => {
          quotaStatus.push({
            keyIndex: i,
            keyName: `YOUTUBE_API_KEY${i > 0 ? `_${i + 1}` : ''}`,
            status: 'REQUEST_FAILED',
            message: error.message
          });
          resolve(null);
        });
      });
    } catch (error) {
      quotaStatus.push({
        keyIndex: i,
        keyName: `YOUTUBE_API_KEY${i > 0 ? `_${i + 1}` : ''}`,
        status: 'ERROR',
        message: error.message
      });
    }
  }

  // Calculate summary
  const summary = {
    total: YOUTUBE_API_KEYS.length,
    working: quotaStatus.filter(k => k.status === 'WORKING').length,
    quotaExceeded: quotaStatus.filter(k => k.status === 'QUOTA_EXCEEDED').length,
    errors: quotaStatus.filter(k => !['WORKING', 'QUOTA_EXCEEDED'].includes(k.status)).length,
    currentKeyIndex: currentKeyIndex
  };

  res.json({
    keys: quotaStatus,
    summary,
    quotaInfo: {
      dailyLimit: 10000,
      searchCost: 100,
      detailsCost: 1,
      resetsAt: 'Midnight Pacific Time (PT)',
      currentTime: new Date().toISOString()
    }
  });
});

// Helper function to try search with all available keys
async function trySearchWithAllKeys(query: string, song: string, artist: string | undefined, startKeyIndex: number = 0): Promise<any> {
  let attemptsRemaining = YOUTUBE_API_KEYS.length;
  let keyIndex = startKeyIndex;

  while (attemptsRemaining > 0) {
    const apiKey = YOUTUBE_API_KEYS[keyIndex];

    if (!apiKey) {
      keyIndex = (keyIndex + 1) % YOUTUBE_API_KEYS.length;
      attemptsRemaining--;
      continue;
    }

    console.log(`🔑 Trying API key ${keyIndex + 1}/${YOUTUBE_API_KEYS.length}...`);

    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&key=${apiKey}`;

    try {
      const result: any = await new Promise((resolve, reject) => {
        https.get(searchUrl, (response) => {
          let data = '';
          response.on('data', (chunk) => { data += chunk; });
          response.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      // Check if we got an error
      if (result.error) {
        if (result.error.code === 403 || result.error.code === 429) {
          console.log(`❌ Key ${keyIndex + 1} quota exceeded, trying next...`);
          keyIndex = (keyIndex + 1) % YOUTUBE_API_KEYS.length;
          attemptsRemaining--;
          continue;
        } else {
          throw new Error(result.error.message);
        }
      }

      // Success! Process and return results
      if (result.items && result.items.length > 0) {
        trackApiCall('search-track', 100, keyIndex);

        // Sort by priority
        const sortedVideos = result.items.sort((a: any, b: any) => {
          const channelA = a.snippet.channelTitle || '';
          const channelB = b.snippet.channelTitle || '';
          const isVevoA = channelA.toUpperCase().includes('VEVO');
          const isVevoB = channelB.toUpperCase().includes('VEVO');
          if (isVevoA && !isVevoB) return -1;
          if (!isVevoA && isVevoB) return 1;
          return 0;
        });

        const video = sortedVideos[0];
        const videoData = {
          videoId: video.id.videoId,
          title: video.snippet.title,
          channel: video.snippet.channelTitle
        };

        console.log(`✅ Found: "${video.snippet.title}" by ${video.snippet.channelTitle}`);
        saveVideoToCache(song, artist, videoData);
        return videoData;
      } else {
        return { videoId: null, error: 'No results found' };
      }
    } catch (error) {
      console.error(`Error with key ${keyIndex + 1}:`, error);
      keyIndex = (keyIndex + 1) % YOUTUBE_API_KEYS.length;
      attemptsRemaining--;
    }
  }

  // All keys exhausted
  return { videoId: null, error: 'All API keys exhausted or invalid' };
}

// Search YouTube for a specific track (song + artist)
router.get('/search-track', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const { song, artist } = req.query;

  if (!song) {
    return res.status(400).json({ error: 'Song title required' });
  }

  // Check cache first
  const cached = getCachedVideo(song as string, artist as string);
  if (cached) {
    console.log(`✅ Cache hit for: ${song} - ${artist}`);
    return res.json({
      videoId: cached.videoId,
      title: cached.title,
      channel: cached.channel,
      fromCache: true
    });
  }

  console.log(`❌ Cache miss for: ${song} - ${artist}, searching YouTube...`);

  const query = artist ? `${song} ${artist}` : song as string;

  try {
    const result = await trySearchWithAllKeys(query, song as string, artist as string, currentKeyIndex);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
