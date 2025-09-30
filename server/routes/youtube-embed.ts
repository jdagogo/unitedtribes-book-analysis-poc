import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { extractWorks } from '../utils/extractWorks';
import { extractDiscoveryPlaylist } from '../utils/extractDiscoveryPlaylist';

const router = Router();

// Get data path from environment or use default
const VIDEO_DATA_PATH = process.env.VIDEO_DATA_PATH ||
  '/Users/j.d.heilprin/Desktop/my-claude/podcast-test/youtube-analysis-viewer/data/videos';

// Generate embed HTML for a video with full analysis interface
router.get('/videos/:videoname/embed-html', async (req, res) => {
  const { videoname } = req.params;

  try {
    const videoPath = path.join(VIDEO_DATA_PATH, videoname);

    // Check if directory exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).send('<h1>Video not found</h1>');
    }

    // Read all video data files
    const metadataPath = path.join(videoPath, 'metadata.json');
    const analysisPath = path.join(videoPath, 'analysis.md');
    const transcriptPath = path.join(videoPath, 'transcript.json');

    const metadata = fs.existsSync(metadataPath)
      ? JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      : null;

    const analysis = fs.existsSync(analysisPath)
      ? fs.readFileSync(analysisPath, 'utf-8')
      : null;

    const transcript = fs.existsSync(transcriptPath)
      ? fs.readFileSync(transcriptPath, 'utf-8')
      : null;

    if (!metadata || !metadata.video_id) {
      return res.status(404).send('<h1>Video metadata not found</h1>');
    }

    const videoId = metadata.video_id || metadata.videoId;

    // Parse works and playlists from analysis
    let works = [];
    let playlists = [];

    if (analysis) {
      works = extractWorks(analysis);
      const discoveryCategories = extractDiscoveryPlaylist(analysis);

      // Convert discovery categories to playlists format
      playlists = discoveryCategories.map(category => ({
        name: category.title,
        tracks: category.songs.map(song => ({
          title: song.title,
          artist: song.artist
        }))
      }));
    }

    // Generate the full analysis interface HTML
    const embedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.title || 'Video Analysis'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #fff;
      color: #000;
      height: 100vh;
      overflow: hidden;
    }

    .main-layout {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
      height: 100vh;
      padding: 1.5rem 2rem;
    }

    .video-section {
      flex: 1;
      min-width: 400px;
      max-width: 1000px;
      display: flex;
      flex-direction: column;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: #000;
      line-height: 1.3;
    }

    .channel {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 1.125rem;
      font-weight: 500;
    }

    .player-wrapper {
      width: 100%;
      position: relative;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      border: 2px solid #e5e7eb;
    }

    .player {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .controls-bar {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
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

    .analysis-section {
      width: 550px;
      position: sticky;
      top: 1.5rem;
      max-height: calc(100vh - 3rem);
      display: flex;
      flex-direction: column;
      background: #fff;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    }

    .analysis-header {
      padding: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
      background: #f9fafb;
    }

    .analysis-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #000;
    }

    .analysis-hint {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .analysis-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.75rem;
      background: #fff;
    }

    .works-section {
      margin-bottom: 2rem;
      padding: 20px;
      background: #1a1a1a;
      color: #fff;
      border-radius: 8px;
    }

    .works-title {
      font-size: 18px;
      font-weight: 700;
      color: #4a90e2;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .works-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 12px;
    }

    .work-item {
      padding: 14px 18px;
      background: #0a0a0a;
      border: 1px solid #333;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .work-item:hover {
      background: #1a1a1a;
      border-color: #4a90e2;
      box-shadow: 0 0 15px rgba(74, 144, 226, 0.3);
      transform: translateY(-2px);
    }

    .work-title {
      font-weight: 600;
      color: #fff;
      font-size: 16px;
    }

    .work-creator {
      font-size: 14px;
      color: #4a90e2;
      margin-top: 4px;
    }

    .work-year {
      font-size: 13px;
      color: #888;
      margin-top: 2px;
    }

    .work-add-btn {
      padding: 8px 14px;
      background: #4a90e2;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .work-add-btn.added {
      background: #10b981;
    }

    .work-add-btn:hover {
      opacity: 0.9;
    }

    .analysis-text {
      font-size: 1.125rem;
      font-weight: 500;
      line-height: 1.7;
      color: #000;
    }

    .analysis-text h1, .analysis-text h2, .analysis-text h3, .analysis-text h4 {
      font-weight: 700;
      color: #1e40af;
      margin: 2rem 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #bfdbfe;
    }

    .timestamp-button {
      display: inline-block;
      padding: 0.375rem 0.875rem;
      margin: 0 0.375rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 6px;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
      font-size: 0.875rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      vertical-align: middle;
      box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    .timestamp-button:hover {
      background: #dc2626;
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .hidden {
      display: none;
    }

    @media (max-width: 1400px) {
      .main-layout {
        flex-direction: column;
      }

      .video-section {
        min-width: 100%;
        max-width: 100%;
      }

      .analysis-section {
        width: 100%;
        position: relative;
        max-height: 600px;
        margin-top: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="main-layout">
    <!-- Video Section -->
    <div class="video-section">
      <h1 class="title">${metadata.title || 'Untitled'}</h1>
      ${metadata.channel ? `<div class="channel">${metadata.channel}</div>` : ''}

      <div class="player-wrapper">
        <div id="youtube-player" class="player"></div>
      </div>

      <div class="controls-bar">
        <button class="btn" onclick="toggleWorksDisplay()">
          Show Playlists & Works
        </button>
      </div>
    </div>

    <!-- Analysis Section -->
    <div class="analysis-section">
      <div class="analysis-header">
        <h2>Video Analysis</h2>
        <p class="analysis-hint">Click timestamps to jump to specific moments</p>
      </div>

      <div class="analysis-content">
        <!-- No internal works display - this will trigger parent modal -->

        <!-- Analysis Content -->
        <div class="analysis-text" id="analysis-text">
          ${analysis ? analysis.replace(/\[([^\]]+)\]/g, '<button class="timestamp-button" onclick="jumpToTime(\'$1\')">$1</button>') : 'No analysis available for this video.'}
        </div>
      </div>
    </div>
  </div>

  <!-- Hidden data for parent communication -->
  <div id="video-data" class="hidden">
    ${JSON.stringify({
      videoId: videoname,
      metadata: metadata,
      works: works,
      playlists: playlists,
      relatedContent: playlists // Use playlists as relatedContent for now
    })}
  </div>

  <script>
    let player;
    let worksVisible = false;
    let discoveryPlaylist = new Set();

    // Initialize YouTube player
    function onYouTubeIframeAPIReady() {
      player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: '${videoId}',
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          playsinline: 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    function onPlayerReady(event) {
      // Notify parent that player is ready
      window.parent.postMessage({
        type: 'PLAYER_READY',
        videoId: '${videoname}'
      }, '*');
    }

    function onPlayerStateChange(event) {
      window.parent.postMessage({
        type: 'PLAYER_STATE_CHANGE',
        state: event.data
      }, '*');
    }

    // Jump to timestamp
    function jumpToTime(timestamp) {
      if (!player || !player.seekTo) return;

      const seconds = timestampToSeconds(timestamp);
      player.seekTo(seconds, true);
      player.playVideo();
    }

    // Convert timestamp to seconds
    function timestampToSeconds(timestamp) {
      const clean = timestamp.replace(/[\[\]]/g, '');
      const parts = clean.split(':').map(p => parseInt(p, 10));

      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
      return 0;
    }

    // Toggle works display - send data to parent modal
    function toggleWorksDisplay() {
      console.log('🔵 Button clicked - toggleWorksDisplay called');

      // Check if we're in an iframe
      if (window.parent === window) {
        console.error('❌ Not in iframe - window.parent === window');
        return;
      }

      // Always send data to parent to trigger the modal
      const videoDataElement = document.getElementById('video-data');
      if (!videoDataElement) {
        console.error('❌ video-data element not found');
        return;
      }

      const videoData = JSON.parse(videoDataElement.textContent);
      console.log('📊 Video data to send:', videoData);

      const message = {
        type: 'SHOW_PLAYLIST_DATA',
        data: videoData
      };

      console.log('📤 Sending message to parent:', message);
      window.parent.postMessage(message, '*');
      console.log('✅ Message sent successfully');
    }


    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      onYouTubeIframeAPIReady();
    }

    // Notify parent that embed is loaded
    window.addEventListener('load', () => {
      window.parent.postMessage({
        type: 'EMBED_LOADED',
        videoId: '${videoname}'
      }, '*');
    });
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