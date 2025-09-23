import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

// Global player instance
let globalPlayer: any = null;
let playerInitialized = false;

interface YouTubePlayerSimpleProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  onReady?: () => void;
}

export function YouTubePlayerSimple({ 
  videoId, 
  onTimeUpdate,
  onReady 
}: YouTubePlayerSimpleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playerReady, setPlayerReady] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const recoveryTimeoutRef = useRef<NodeJS.Timeout>();
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize YouTube iframe API
  useEffect(() => {
    console.log('🎵 [PLAYER] Initializing YouTube Player Simple...');
    
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      console.log('✅ [PLAYER] YouTube API already loaded');
      createPlayer();
      return;
    }

    // Load YouTube iframe API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback
    window.onYouTubeIframeAPIReady = () => {
      console.log('✅ [PLAYER] YouTube iframe API ready');
      createPlayer();
    };

    return () => {
      // Cleanup on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Create player instance with recovery
  const createPlayer = () => {
    if (!playerRef.current) {
      console.log('⚠️ [PLAYER] Container not ready');
      return;
    }

    if (isRecovering) {
      console.log('⚠️ [PLAYER] Already recovering...');
      return;
    }

    console.log('🎬 [PLAYER] Creating YouTube player instance...');
    setLoadAttempts(prev => prev + 1);
    
    // Reset player state
    playerInitialized = false;
    globalPlayer = null;
    setPlayerReady(false);
    
    // Create unique ID for player
    const playerId = 'youtube-player-' + Date.now();
    playerRef.current.innerHTML = `<div id="${playerId}"></div>`;

    try {
      globalPlayer = new window.YT.Player(playerId, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
          onError: handleError
        }
      });
      
      playerInitialized = true;
      console.log('✅ [PLAYER] Player instance created');
      
      // Set timeout to check if player loads
      loadTimeoutRef.current = setTimeout(() => {
        if (!playerReady) {
          console.error('❌ [PLAYER] Player failed to load after 10 seconds');
          recoverPlayer();
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ [PLAYER] Failed to create player:', error);
      recoverPlayer();
    }
  };
  
  // Recovery mechanism - FIXED to actually work
  const recoverPlayer = () => {
    console.log('🔄 [RECOVERY] Starting player recovery...');
    setIsRecovering(true);
    
    // Clear any existing timeouts
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Force destroy existing player
    try {
      if (globalPlayer) {
        if (globalPlayer.destroy) {
          globalPlayer.destroy();
        } else if (globalPlayer.pauseVideo) {
          globalPlayer.pauseVideo();
        }
      }
    } catch (e) {
      console.log('⚠️ [RECOVERY] Error cleaning up old player:', e);
    }
    
    // Reset everything
    globalPlayer = null;
    playerInitialized = false;
    window.audioSync = null;
    setPlayerReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Clear and recreate container
    if (playerRef.current) {
      playerRef.current.innerHTML = '';
      
      // Force recreate after DOM clears
      setTimeout(() => {
        console.log(`🔄 [RECOVERY] Recreating player (attempt ${loadAttempts + 1}/5)`);
        setIsRecovering(false);
        setErrorCount(0);
        
        // Check if YouTube API is still available
        if (window.YT && window.YT.Player) {
          createPlayer();
        } else {
          // Reload YouTube API
          console.log('🔄 [RECOVERY] Reloading YouTube API...');
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          tag.onload = () => {
            setTimeout(createPlayer, 500);
          };
          document.body.appendChild(tag);
        }
      }, 1000);
    }
  };

  // Player ready handler
  const handlePlayerReady = (event: any) => {
    console.log('✅ [PLAYER] Player is READY!');
    
    // Clear load timeout since player loaded successfully
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    
    setPlayerReady(true);
    setErrorCount(0);  // Reset error count on successful load
    setLoadAttempts(0); // Reset load attempts
    
    // Get duration
    const dur = event.target.getDuration();
    setDuration(dur);
    console.log(`📊 [PLAYER] Duration: ${dur} seconds`);
    
    // Set volume
    event.target.setVolume(volume);
    
    // Expose global seek function
    window.audioSync = {
      seekTo: (time: number) => {
        console.log(`🎯 [SEEK] Request to seek to ${time} seconds`);
        if (globalPlayer && globalPlayer.seekTo) {
          try {
            globalPlayer.seekTo(time, true);
            console.log(`✅ [SEEK] Successfully seeked to ${time}`);
            return true;
          } catch (e) {
            console.error('❌ [SEEK] Failed:', e);
            return false;
          }
        } else {
          console.error('❌ [SEEK] Player not available');
          return false;
        }
      },
      getCurrentTime: () => globalPlayer?.getCurrentTime ? globalPlayer.getCurrentTime() : 0,
      getDuration: () => globalPlayer?.getDuration ? globalPlayer.getDuration() : 0,
      playVideo: () => {
        if (globalPlayer?.playVideo) {
          globalPlayer.playVideo();
          console.log('▶️ [PLAYER] Play command sent');
        }
      },
      pauseVideo: () => {
        if (globalPlayer?.pauseVideo) {
          globalPlayer.pauseVideo();
          console.log('⏸️ [PLAYER] Pause command sent');
        }
      },
      isReady: () => playerReady,
      player: globalPlayer
    };
    
    console.log('🌐 [PLAYER] window.audioSync exposed globally');
    console.log('📋 [PLAYER] Available methods:', Object.keys(window.audioSync));
    
    // Start time monitoring
    startTimeMonitoring();
    
    // Notify parent
    if (onReady) {
      onReady();
    }
    
    // Test basic seeks after 2 seconds
    setTimeout(() => {
      console.log('🧪 [PLAYER] Testing basic seeks...');
      testBasicSeeks();
    }, 2000);
  };

  // Handle state changes
  const handleStateChange = (event: any) => {
    const states: { [key: number]: string } = {
      [-1]: 'unstarted',
      [0]: 'ended',
      [1]: 'playing',
      [2]: 'paused',
      [3]: 'buffering',
      [5]: 'cued'
    };
    
    const state = states[event.data] || 'unknown';
    console.log(`📺 [PLAYER] State changed to: ${state}`);
    
    if (event.data === 1) { // Playing
      setIsPlaying(true);
    } else if (event.data === 2 || event.data === 0) { // Paused or Ended
      setIsPlaying(false);
    }
  };

  // Handle errors with recovery
  const handleError = (event: any) => {
    console.error(`❌ [PLAYER] Error code: ${event.data}`);
    setErrorCount(prev => prev + 1);
    
    // Trigger recovery
    if (!isRecovering) {
      recoverPlayer();
    }
  };

  // Monitor time
  const startTimeMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (globalPlayer && globalPlayer.getCurrentTime) {
        try {
          const time = globalPlayer.getCurrentTime();
          setCurrentTime(time);
          
          if (onTimeUpdate) {
            onTimeUpdate(time);
          }
        } catch (e) {
          console.error('❌ [PLAYER] Error getting time:', e);
        }
      }
    }, 100); // Update 10 times per second for smooth highlighting
  };

  // Test basic seeks
  const testBasicSeeks = () => {
    console.log('🧪 [TEST] Testing seek to 30 seconds...');
    window.audioSync.seekTo(30);
    
    setTimeout(() => {
      const time = window.audioSync.getCurrentTime();
      console.log(`📍 [TEST] Current time after seek to 30: ${time}s`);
      
      console.log('🧪 [TEST] Testing seek to 60 seconds...');
      window.audioSync.seekTo(60);
      
      setTimeout(() => {
        const time2 = window.audioSync.getCurrentTime();
        console.log(`📍 [TEST] Current time after seek to 60: ${time2}s`);
        
        console.log('🧪 [TEST] Testing seek to 120 seconds...');
        window.audioSync.seekTo(120);
        
        setTimeout(() => {
          const time3 = window.audioSync.getCurrentTime();
          console.log(`📍 [TEST] Current time after seek to 120: ${time3}s`);
          console.log('✅ [TEST] Basic seek tests complete');
        }, 1500);
      }, 1500);
    }, 1500);
  };

  // Control functions
  const handlePlayPause = () => {
    console.log(`🎮 [CONTROL] Play/Pause clicked. Current state: ${isPlaying ? 'playing' : 'paused'}`);
    
    if (!globalPlayer) {
      console.error('❌ [CONTROL] Player not available');
      return;
    }
    
    if (isPlaying) {
      globalPlayer.pauseVideo();
      console.log('⏸️ [CONTROL] Pausing...');
    } else {
      globalPlayer.playVideo();
      console.log('▶️ [CONTROL] Playing...');
    }
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    console.log(`⏪ [CONTROL] Skip back to ${newTime}s`);
    window.audioSync?.seekTo(newTime);
  };

  const handleSkipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    console.log(`⏩ [CONTROL] Skip forward to ${newTime}s`);
    window.audioSync?.seekTo(newTime);
  };

  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    console.log(`🎚️ [CONTROL] Slider seek to ${seekTime}s`);
    window.audioSync?.seekTo(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (globalPlayer && globalPlayer.setVolume) {
      globalPlayer.setVolume(newVolume);
      console.log(`🔊 [CONTROL] Volume set to ${newVolume}%`);
    }
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="youtube-player-simple">
      {/* Hidden player container */}
      <div ref={playerRef} style={{ display: 'none' }} />
      
      {/* Controls UI */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="mb-4">
          {!playerReady ? (
            <div className="text-center text-gray-500">
              ⏳ Loading YouTube player...
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <Slider
                value={[currentTime]}
                onValueChange={handleSeek}
                max={duration}
                step={1}
                className="w-full mb-2"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </>
          )}
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipBack}
            disabled={!playerReady}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            disabled={!playerReady}
            className="h-12 w-12"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkipForward}
            disabled={!playerReady}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-32"
          />
          <span className="text-sm text-gray-500 w-10">{volume}%</span>
        </div>

        {/* Debug info and recovery */}
        {(errorCount > 0 || isRecovering || !playerReady) && (
          <div className="mt-2 space-y-2">
            {errorCount > 0 && (
              <div className="text-sm text-red-500">
                ⚠️ Player errors: {errorCount}
              </div>
            )}
            {isRecovering && (
              <div className="text-sm text-orange-500">
                🔄 Recovering player... (attempt {loadAttempts}/5)
              </div>
            )}
            {!playerReady && !isRecovering && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => recoverPlayer()}
                className="w-full"
              >
                🔄 Reload Player
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}