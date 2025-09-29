'use client';

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styles from './EmbeddedVideoPlayer.module.css';

interface EmbeddedVideoPlayerProps {
  videoId: string;
  title: string;
  startTime?: number;
  highlights?: Array<{
    time: number;
    text: string;
    type: string;
  }>;
  onFullView?: () => void;
}

export interface VideoPlayerHandle {
  seekTo: (time: number) => void;
}

const EmbeddedVideoPlayer = forwardRef<VideoPlayerHandle, EmbeddedVideoPlayerProps>(({
  videoId,
  title,
  startTime = 0,
  highlights = [],
  onFullView
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Expose seekTo method to parent component
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      console.log('EmbeddedVideoPlayer: Seeking to', time);
      // Small delay to ensure player is ready
      setTimeout(() => {
        if (playerRef.current?.seekTo) {
          console.log('Actually seeking now to:', time);
          playerRef.current.seekTo(time, true);
          setCurrentTime(time);
          // Start playing after seeking
          playerRef.current.playVideo();
        } else {
          console.warn('Player not ready for seeking');
        }
      }, 100);
    }
  }));

  useEffect(() => {
    // Check if YouTube IFrame API is already loaded
    if ((window as any).YT && (window as any).YT.Player) {
      initializePlayer();
    } else {
      // Load YouTube IFrame API
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // Initialize player when API is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    }

    function initializePlayer() {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new (window as any).YT.Player(`player-${videoId}`, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          start: Math.floor(startTime),
          autoplay: 0,  // Explicitly disable autoplay
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
          playsinline: 1  // Better mobile support
        },
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
            if (startTime > 0) {
              event.target.seekTo(startTime, true);
            }
            // Make sure video doesn't auto-play
            event.target.pauseVideo();
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimeTracking();
            } else if (event.data === (window as any).YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopTimeTracking();
            }
          }
        }
      });
    }

    return () => {
      stopTimeTracking();
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, startTime]);

  const startTimeTracking = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekToTimestamp = (time: number) => {
    console.log('Seeking to timestamp:', time);
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
      // Don't auto-play, let user decide
      // playerRef.current.playVideo();
    } else {
      console.error('Player not ready for seeking');
    }
  };

  const togglePlayPause = () => {
    console.log('Toggle play/pause clicked', { isPlaying, player: playerRef.current });
    if (!playerRef.current) {
      console.error('Player not initialized');
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  return (
    <div className={styles.playerContainer}>
      <div className={styles.playerHeader}>
        <h3 className={styles.videoTitle}>{title}</h3>
      </div>

      <div className={styles.playerWrapper}>
        <div className={styles.videoSection}>
          <div className={styles.videoContainer}>
            <div id={`player-${videoId}`} className={styles.youtubePlayer}></div>
          </div>

          <div className={styles.controlsContainer}>
            <button
              className={styles.playPauseButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePlayPause();
              }}
              type="button"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {startTime > 0 && (
              <button
                className={styles.jumpToContextButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  seekToTimestamp(startTime);
                }}
                type="button"
              >
                Jump to Context
              </button>
            )}
          </div>
        </div>

        {highlights.length > 0 && (
          <div className={styles.timestampsContainer}>
            <h4>Related Timestamps:</h4>
            <div className={styles.timestampsList}>
              {highlights.map((highlight, idx) => (
                <button
                  key={idx}
                  className={styles.timestampButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    seekToTimestamp(highlight.time);
                  }}
                  type="button"
                >
                  <span className={styles.timestampTime}>
                    {formatTime(highlight.time)}
                  </span>
                  <span className={styles.timestampText}>
                    {highlight.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

EmbeddedVideoPlayer.displayName = 'EmbeddedVideoPlayer';

export default EmbeddedVideoPlayer;