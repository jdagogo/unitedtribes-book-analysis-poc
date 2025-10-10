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
      flex-direction: column;
      gap: 1rem;
      height: 100vh;
      padding: 1.5rem 2rem;
    }

    .video-section {
      display: flex;
      flex-direction: column;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .title {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
      line-height: 1.4;
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
      justify-content: space-between;
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

    .analysis-panel {
      margin-top: 1rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    .analysis-panel-content {
      padding: 1.5rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .analysis-panel h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e40af;
    }

    .analysis-hint {
      margin: 0 0 1.5rem 0;
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .analysis-panel .analysis-text {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
    }

    .analysis-panel .analysis-text h1,
    .analysis-panel .analysis-text h2,
    .analysis-panel .analysis-text h3,
    .analysis-panel .analysis-text h4 {
      font-weight: 700;
      color: #1e40af;
      margin: 1.5rem 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #bfdbfe;
    }

    .analysis-panel .timestamp-button {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      margin: 0 0.25rem 0.25rem 0;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      vertical-align: baseline;
      box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
    }

    .analysis-panel .timestamp-button:hover {
      background: #dc2626;
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
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
        <button class="btn" onclick="toggleWorksDisplay()" id="playlist-btn">
          Works & Discovery Playlists ▼
        </button>
        <button class="btn" onclick="toggleAnalysisDisplay()" id="analysis-btn">
          Video Analysis ▼
        </button>
      </div>

      <!-- Collapsible Analysis Panel -->
      <div class="analysis-panel" id="analysis-panel" style="display: none;">
        <div class="analysis-panel-content">
          <h3>Video Analysis</h3>
          <p class="analysis-hint">Click timestamps to jump to specific moments</p>
          <div class="analysis-text">
            ${analysis ? analysis
              .replace(/\[([^\]]+)\]/g, '<button class="timestamp-button" onclick="jumpToTime(\'$1\')">$1</button>')
              .replace(/^## (.+)$/gm, '<h2>$1</h2>')
              .replace(/^### (.+)$/gm, '<h3>$1</h3>')
              .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
              .replace(/^\* (.+)$/gm, '• $1')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^(.)/gm, '<p>$1')
              .replace(/<\/p><p><h/g, '</p><h')
              .replace(/<\/h([1-6])><p>/g, '</h$1><p>')
              + '</p>'
              : 'No analysis available for this video.'}
          </div>
        </div>
      </div>
    </div>

    <!-- Analysis Section - Hidden, using collapsible panel instead -->
    <div class="analysis-section" style="display: none;">
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
          playsinline: 1,
          enablejsapi: 1,
          controls: 1,
          fs: 1,
          iv_load_policy: 3
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    }

    function onPlayerReady(event) {
      console.log('🎬 Player ready!');
      console.log('🔍 Event object:', event);
      console.log('🔍 Event.target:', event.target);

      // Ensure we're using the actual player from the event
      player = event.target;

      // Add a global reference for debugging
      window.globalPlayer = player;

      // Log all available methods/properties for debugging
      console.log('🔍 Player object keys:', Object.keys(player));
      console.log('🔍 Player prototype:', Object.getPrototypeOf(player));
      console.log('🔍 Player constructor:', player.constructor.name);

      // Test player methods immediately when ready
      console.log('Player methods available:', {
        hasPlayVideo: typeof player.playVideo === 'function',
        hasPauseVideo: typeof player.pauseVideo === 'function',
        hasGetPlayerState: typeof player.getPlayerState === 'function',
        hasSeekTo: typeof player.seekTo === 'function'
      });

      // Try alternative method names (YouTube sometimes uses different names)
      console.log('Alternative method checks:', {
        hasSeekTo: typeof player.seekTo === 'function',
        hasSeekToSeconds: typeof player.seekToSeconds === 'function',
        hasSeekToTime: typeof player.seekToTime === 'function',
        hasSetCurrentTime: typeof player.setCurrentTime === 'function'
      });

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
      console.log('🎯 jumpToTime called with:', timestamp);

      // Try to use the main player first, then fall back to global player
      let activePlayer = player || window.globalPlayer;

      if (!activePlayer) {
        console.log('❌ No player available (neither player nor globalPlayer)');
        return;
      }

      console.log('🎮 Using player:', activePlayer === player ? 'main player' : 'global player');

      // Check if player is ready by testing the player state
      try {
        const playerState = activePlayer.getPlayerState();
        console.log('🎮 Player state:', playerState);

        if (playerState === undefined || playerState === null) {
          console.log('❌ Player not fully initialized yet');
          return;
        }
      } catch (error) {
        console.log('❌ Player not ready, error checking state:', error);
        console.log('🔍 Available player methods:', Object.getOwnPropertyNames(activePlayer).filter(name => typeof activePlayer[name] === 'function'));
        return;
      }

      // Double-check seekTo method exists
      if (typeof activePlayer.seekTo !== 'function') {
        console.log('❌ Player seekTo method not available, type:', typeof activePlayer.seekTo);
        console.log('🔍 Available player methods:', Object.getOwnPropertyNames(activePlayer).filter(name => typeof activePlayer[name] === 'function'));
        return;
      }

      const seconds = timestampToSeconds(timestamp);
      console.log('⏰ Converted to seconds:', seconds);

      try {
        activePlayer.seekTo(seconds, true);
        activePlayer.playVideo();
        console.log('✅ Successfully seeked to', seconds, 'seconds');
      } catch (error) {
        console.log('❌ Error seeking:', error);
      }
    }

    // Convert timestamp to seconds
    function timestampToSeconds(timestamp) {
      console.log('🔍 Processing timestamp:', timestamp);

      const clean = timestamp.replace(/[\[\]]/g, '').trim();
      console.log('🧹 Cleaned timestamp:', clean);

      const parts = clean.split(':').map(p => parseInt(p, 10));
      console.log('📊 Parts:', parts);

      let seconds = 0;
      if (parts.length === 3) {
        // H:M:S format
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        // M:S format
        seconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 1) {
        // Just seconds
        seconds = parts[0];
      }

      console.log('⏱️ Final seconds:', seconds);
      return seconds;
    }

    // Global state tracking
    let isPlaylistVisible = false;
    let isAnalysisVisible = false;

    // Toggle works display - simplified without pause functionality
    function toggleWorksDisplay() {
      console.log('🔵 Button clicked - toggleWorksDisplay called');

      const button = document.getElementById('playlist-btn');

      if (!isPlaylistVisible) {
        // Show the playlists modal
        if (button) {
          button.textContent = 'Works & Discovery Playlists ▲';
          isPlaylistVisible = true;
        }
        showPlaylistsModal();
      } else {
        // Hide the playlists modal
        if (button) {
          button.textContent = 'Works & Discovery Playlists ▼';
          isPlaylistVisible = false;
        }
        closePlaylistsModal();
      }
    }

    // Show playlists modal
    function showPlaylistsModal() {
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

    // Close playlists modal
    function closePlaylistsModal() {
      // Send message to parent to close the modal
      if (window.parent !== window) {
        const message = {
          type: 'CLOSE_PLAYLIST_DATA'
        };
        console.log('📤 Sending close message to parent:', message);
        window.parent.postMessage(message, '*');
        console.log('✅ Close message sent successfully');
      }
    }

    // Toggle analysis display
    function toggleAnalysisDisplay() {
      console.log('📄 Analysis button clicked');
      const panel = document.getElementById('analysis-panel');
      const button = document.getElementById('analysis-btn');

      if (!isAnalysisVisible) {
        // Show analysis
        panel.style.display = 'block';
        button.textContent = 'Video Analysis ▲';
        isAnalysisVisible = true;
        console.log('📄 Analysis panel shown');
      } else {
        // Hide analysis
        panel.style.display = 'none';
        button.textContent = 'Video Analysis ▼';
        isAnalysisVisible = false;
        console.log('📄 Analysis panel hidden');
      }
    }


    // Load YouTube IFrame API
    if (!window.YT) {
      console.log('📺 Loading YouTube IFrame API...');
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Set up global callback
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else if (window.YT && window.YT.Player) {
      console.log('📺 YouTube API already loaded, initializing player...');
      onYouTubeIframeAPIReady();
    } else {
      console.log('📺 YouTube API exists but Player not ready, waiting...');
      setTimeout(() => {
        if (window.YT && window.YT.Player) {
          onYouTubeIframeAPIReady();
        }
      }, 1000);
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