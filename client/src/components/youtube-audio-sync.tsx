import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  index: number;
}

interface YouTubeAudioSyncProps {
  youtubeUrl: string;
  videoId: string;
  startTime?: number;
  words?: WordTimestamp[];
  onWordHighlight?: (wordIndex: number) => void;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

// Global YouTube player instance to prevent recreation
let globalYouTubePlayer: any = null;
let isYouTubeAPIReady = false;

// Ensure global access to player
declare global {
  interface Window {
    audioSync: any;
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    globalYouTubePlayer: any;
  }
}

// Store player globally for cross-page access
if (typeof window !== 'undefined') {
  window.globalYouTubePlayer = globalYouTubePlayer;
}

export function YouTubeAudioSync({
  youtubeUrl,
  videoId,
  startTime = 0,
  words = [],
  onWordHighlight,
  onTimeUpdate,
  className = ''
}: YouTubeAudioSyncProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isReady, setIsReady] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHighlightedWord = useRef<number>(-1);

  // Load YouTube IFrame API only once
  useEffect(() => {
    if (isYouTubeAPIReady) {
      setIsReady(true);
      return;
    }

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      isYouTubeAPIReady = true;
      setIsReady(true);
      return;
    }

    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      isYouTubeAPIReady = true;
      setIsReady(true);
    };
  }, []);

  // Initialize YouTube player only once
  useEffect(() => {
    if (!isReady || !playerContainerRef.current) return;
    
    // Use existing player if available
    if (globalYouTubePlayer) {
      console.log('Using existing YouTube player');
      // Re-expose the player in case it was lost
      window.audioSync = {
        seekTo: (time: number, allowSeekAhead: boolean = true) => {
          console.log('[GLOBAL SEEK] Called with time:', time);
          if (globalYouTubePlayer && globalYouTubePlayer.seekTo) {
            globalYouTubePlayer.seekTo(time, allowSeekAhead);
            console.log('[GLOBAL SEEK] Executed successfully');
          } else {
            console.error('[GLOBAL SEEK] Player not ready');
          }
        },
        getCurrentTime: () => globalYouTubePlayer?.getCurrentTime ? globalYouTubePlayer.getCurrentTime() : 0,
        playVideo: () => globalYouTubePlayer?.playVideo ? globalYouTubePlayer.playVideo() : null,
        pauseVideo: () => globalYouTubePlayer?.pauseVideo ? globalYouTubePlayer.pauseVideo() : null,
        getDuration: () => globalYouTubePlayer?.getDuration ? globalYouTubePlayer.getDuration() : 0,
        getPlayerState: () => globalYouTubePlayer?.getPlayerState ? globalYouTubePlayer.getPlayerState() : -1
      };
      return;
    }

    const playerId = 'youtube-audio-player';
    playerContainerRef.current.innerHTML = `<div id="${playerId}"></div>`;

    // Create player instance only once
    globalYouTubePlayer = new window.YT.Player(playerId, {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        start: startTime,
        modestbranding: 1,
        fs: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          console.log('🎵 YouTube player initialized successfully');
          setDuration(event.target.getDuration());
          event.target.setVolume(volume);
          
          // Store player globally for all pages
          window.globalYouTubePlayer = event.target;
          
          // Expose complete player API globally
          window.audioSync = {
            seekTo: (time: number, allowSeekAhead: boolean = true) => {
              console.log('[GLOBAL PLAYER] seekTo called with time:', time);
              try {
                event.target.seekTo(time, allowSeekAhead);
                console.log('[GLOBAL PLAYER] ✅ Seek executed to:', time);
                return true;
              } catch (error) {
                console.error('[GLOBAL PLAYER] ❌ Seek failed:', error);
                return false;
              }
            },
            getCurrentTime: () => {
              try {
                return event.target.getCurrentTime();
              } catch (e) {
                console.error('[GLOBAL PLAYER] Error getting time:', e);
                return 0;
              }
            },
            playVideo: () => event.target.playVideo(),
            pauseVideo: () => event.target.pauseVideo(),
            getDuration: () => event.target.getDuration(),
            getPlayerState: () => event.target.getPlayerState(),
            isReady: () => true,
            player: event.target // Direct access to player
          };
          
          console.log('✅ window.audioSync API exposed globally');
          console.log('✅ window.globalYouTubePlayer exposed globally');
          
          // Log available methods
          console.log('Available audioSync methods:', Object.keys(window.audioSync));
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTracking();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopTracking();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            stopTracking();
          }
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event.data);
          // Fallback handling
          handlePlayerError(event.data);
        }
      }
    });
  }, [isReady, videoId, startTime, volume]);

  // Enhanced time tracking with word highlighting
  const startTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    trackingIntervalRef.current = setInterval(() => {
      if (globalYouTubePlayer && globalYouTubePlayer.getCurrentTime) {
        try {
          const time = globalYouTubePlayer.getCurrentTime();
          setCurrentTime(time);
          
          // Notify parent of time update
          if (onTimeUpdate) {
            onTimeUpdate(time);
          }

          // Find and highlight current word
          if (words.length > 0) {
            const wordIndex = findCurrentWord(time);
            if (wordIndex !== lastHighlightedWord.current) {
              lastHighlightedWord.current = wordIndex;
              setCurrentWordIndex(wordIndex);
              if (onWordHighlight && wordIndex >= 0) {
                onWordHighlight(wordIndex);
              }
            }
          }
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }
    }, 50); // 50ms for smooth word highlighting
  }, [words, onTimeUpdate, onWordHighlight]);

  const stopTracking = useCallback(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  }, []);

  // Find which word should be highlighted at current time
  const findCurrentWord = useCallback((time: number): number => {
    if (!words || words.length === 0) return -1;
    
    // Binary search for efficiency with large word arrays
    let left = 0;
    let right = words.length - 1;
    let result = -1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const word = words[mid];
      
      if (time >= word.start && time <= word.end) {
        return mid;
      } else if (time < word.start) {
        right = mid - 1;
      } else {
        result = mid; // Keep track of last word before current time
        left = mid + 1;
      }
    }
    
    return result;
  }, [words]);

  // Playback controls
  const togglePlayback = useCallback(() => {
    if (!globalYouTubePlayer) {
      console.error('YouTube player not initialized');
      return;
    }

    try {
      if (isPlaying) {
        globalYouTubePlayer.pauseVideo();
      } else {
        globalYouTubePlayer.playVideo();
      }
    } catch (error) {
      console.error('Playback toggle error:', error);
    }
  }, [isPlaying]);

  // Seek to specific time - Fixed to ensure it works properly
  const seekTo = useCallback((time: number) => {
    console.log('[SEEK] Internal seekTo called with time:', time);
    
    if (!globalYouTubePlayer || !globalYouTubePlayer.seekTo) {
      console.error('[SEEK] Cannot seek: YouTube player not ready');
      console.log('[SEEK] globalYouTubePlayer:', globalYouTubePlayer);
      return;
    }

    try {
      console.log('[SEEK] Calling player.seekTo');
      globalYouTubePlayer.seekTo(time, true);
      setCurrentTime(time);
      
      // Immediately update word highlight
      const wordIndex = findCurrentWord(time);
      setCurrentWordIndex(wordIndex);
      if (onWordHighlight && wordIndex >= 0) {
        onWordHighlight(wordIndex);
      }
      console.log('[SEEK] ✅ Seek completed successfully');
    } catch (error) {
      console.error('[SEEK] ❌ Seek error:', error);
    }
  }, [findCurrentWord, onWordHighlight]);
  
  // No need for this duplicate - removed to prevent conflicts

  // Seek to specific word
  const seekToWord = useCallback((wordIndex: number) => {
    if (wordIndex >= 0 && wordIndex < words.length) {
      const word = words[wordIndex];
      seekTo(word.start);
    }
  }, [words, seekTo]);

  // Skip controls - Fixed to use globalYouTubePlayer directly
  const skipBackward = useCallback(() => {
    const newTime = Math.max(0, currentTime - 10);
    console.log('[SKIP BACK] Skipping to:', newTime);
    
    if (globalYouTubePlayer && globalYouTubePlayer.seekTo) {
      globalYouTubePlayer.seekTo(newTime, true);
      setCurrentTime(newTime);
    } else {
      console.error('[SKIP BACK] Player not ready');
    }
  }, [currentTime]);

  const skipForward = useCallback(() => {
    const newTime = Math.min(duration, currentTime + 10);
    console.log('[SKIP FORWARD] Skipping to:', newTime);
    
    if (globalYouTubePlayer && globalYouTubePlayer.seekTo) {
      globalYouTubePlayer.seekTo(newTime, true);
      setCurrentTime(newTime);
    } else {
      console.error('[SKIP FORWARD] Player not ready');
    }
  }, [currentTime, duration]);

  // Volume control
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (globalYouTubePlayer && globalYouTubePlayer.setVolume) {
      try {
        globalYouTubePlayer.setVolume(newVolume);
      } catch (error) {
        console.error('Volume change error:', error);
      }
    }
  }, []);

  // Progress bar seek - Fixed to work with drag events
  const handleProgressSeek = useCallback((value: number[]) => {
    const targetTime = value[0];
    console.log('[SCRUBBER] Seeking to:', targetTime);
    
    if (globalYouTubePlayer && globalYouTubePlayer.seekTo) {
      globalYouTubePlayer.seekTo(targetTime, true);
      setCurrentTime(targetTime);
      
      // Update word highlight immediately
      const wordIndex = findCurrentWord(targetTime);
      setCurrentWordIndex(wordIndex);
      if (onWordHighlight && wordIndex >= 0) {
        onWordHighlight(wordIndex);
      }
    } else {
      console.error('[SCRUBBER] Player not ready');
    }
  }, [findCurrentWord, onWordHighlight]);

  // Error handling
  const handlePlayerError = useCallback((errorCode: number) => {
    const errorMessages: { [key: number]: string } = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not embeddable',
      150: 'Video not embeddable'
    };

    console.error(`YouTube Player Error ${errorCode}: ${errorMessages[errorCode] || 'Unknown error'}`);
    
    // Attempt recovery
    if (errorCode === 5) {
      // HTML5 error - try reloading
      setTimeout(() => {
        if (globalYouTubePlayer && globalYouTubePlayer.loadVideoById) {
          globalYouTubePlayer.loadVideoById(videoId, startTime);
        }
      }, 1000);
    }
  }, [videoId, startTime]);

    // Cleanup
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed duplicate window.audioSync assignment to prevent conflicts

  return (
    <div className={`youtube-audio-sync ${className}`}>
      {/* Hidden YouTube player container */}
      <div ref={playerContainerRef} className="hidden" />
      
      {/* Audio Controls UI */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            onValueChange={handleProgressSeek}
            max={duration}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipBackward}
            disabled={!isReady}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={togglePlayback}
            disabled={!isReady}
            className="h-12 w-12"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={skipForward}
            disabled={!isReady}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Volume Control */}
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

        {/* Status */}
        {!isReady && (
          <div className="text-center text-sm text-gray-500 mt-2">
            Loading YouTube player...
          </div>
        )}
        
        {currentWordIndex >= 0 && words[currentWordIndex] && (
          <div className="text-center text-sm text-blue-600 mt-2">
            Current word: "{words[currentWordIndex].word}"
          </div>
        )}
      </div>
    </div>
  );
}