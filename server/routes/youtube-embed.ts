import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Get data path from environment or use default
const VIDEO_DATA_PATH = process.env.VIDEO_DATA_PATH ||
  '/Users/j.d.heilprin/Desktop/my-claude/podcast-test/youtube-analysis-viewer/data/videos';

// Generate embed HTML for a video with playlist functionality
router.get('/videos/:videoname/embed-html', async (req, res) => {
  const { videoname } = req.params;

  try {
    const videoPath = path.join(VIDEO_DATA_PATH, videoname);

    // Check if directory exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('<h1>Video not found</h1>');
    }

    // Read metadata
    const metadataPath = path.join(videoPath, 'metadata.json');
    const metadata = fs.existsSync(metadataPath)
      ? JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      : null;

    if (!metadata || !metadata.video_id) {
      return res.status(404).send('<h1>Video metadata not found</h1>');
    }

    const videoId = metadata.video_id || metadata.videoId;

    // Generate the embed HTML with communication to parent
    const embedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title || 'Video'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .video-container {
      flex: 1;
      position: relative;
      width: 100%;
      background: #000;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .controls-bar {
      background: #1a1a1a;
      padding: 12px 20px;
      border-top: 1px solid #333;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .video-title {
      flex: 1;
      font-size: 14px;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .btn {
      padding: 8px 16px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn:hover {
      background: #357abd;
      transform: translateY(-1px);
    }
    .btn:active {
      transform: translateY(0);
    }
    .playlist-data {
      display: none;
    }
  </style>
</head>
<body>
  <div class="video-container">
    <iframe
      id="youtube-player"
      src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  </div>

  <div class="controls-bar">
    <div class="video-title">${metadata.title || 'Untitled'}</div>
    <button class="btn" onclick="sendPlaylistData()">
      Show Playlists & Works
    </button>
  </div>

  <!-- Hidden data for parent frame -->
  <div id="playlist-data" class="playlist-data">
    ${JSON.stringify({
      videoId: videoname,
      works: metadata.works || [],
      playlists: metadata.playlists || [],
      title: metadata.title,
      channel: metadata.channel
    })}
  </div>

  <script>
    // Communication with parent window
    function sendPlaylistData() {
      const data = document.getElementById('playlist-data').textContent;
      // Send message to parent window
      window.parent.postMessage({
        type: 'SHOW_PLAYLIST_DATA',
        data: JSON.parse(data)
      }, '*');
    }

    // Notify parent that embed is loaded
    window.addEventListener('load', () => {
      window.parent.postMessage({
        type: 'EMBED_LOADED',
        videoId: '${videoname}'
      }, '*');
    });

    // Handle YouTube player events
    let player;
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('youtube-player', {
        events: {
          'onStateChange': onPlayerStateChange
        }
      });
    }

    function onPlayerStateChange(event) {
      window.parent.postMessage({
        type: 'PLAYER_STATE_CHANGE',
        state: event.data
      }, '*');
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  </script>
</body>
</html>
    `;

    res.set('Content-Type', 'text/html');
    res.send(embedHtml);
  } catch (error) {
    console.error('Error generating embed HTML:', error);
    res.status(500).send('<h1>Error loading video</h1>');
  }
});

export default router;