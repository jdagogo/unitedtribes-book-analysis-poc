import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BookChapter } from '../../../shared/schema';

interface EnhancedAudioPlayerProps {
  audioUrl: string;
  chapters: BookChapter[];
  currentChapter: number;
  onChapterChange: (chapterIndex: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export function EnhancedAudioPlayer({
  audioUrl,
  chapters,
  currentChapter,
  onChapterChange,
  onTimeUpdate,
  className = ""
}: EnhancedAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time for display
  const formatTime = (time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle play/pause
  const togglePlayback = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Skip to specific time
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Skip to chapter
  const skipToChapter = useCallback((chapterIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (chapter?.audioTimestamp !== null) {
      seekTo(chapter.audioTimestamp || 0);
      onChapterChange(chapterIndex);
    }
  }, [chapters, seekTo, onChapterChange]);

  // Skip forward/backward
  const skipTime = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      seekTo(newTime);
    }
  }, [currentTime, duration, seekTo]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-advance to next chapter if available
      if (currentChapter < chapters.length - 1) {
        skipToChapter(currentChapter + 1);
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.error('Audio loading error');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentChapter, chapters.length, onTimeUpdate, skipToChapter]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const currentChapterData = chapters[currentChapter];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 ${className}`}>
      <CardContent className="p-6">
        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
          data-testid="audio-element"
        />

        {/* Chapter Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg" data-testid="current-chapter-title">
              Chapter {currentChapterData?.chapterNumber}: {currentChapterData?.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              Narrated by Merle Haggard
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(currentTime)} / {formatTime(duration)}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div
            ref={progressRef}
            className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newTime = (clickX / rect.width) * duration;
              seekTo(newTime);
            }}
            data-testid="progress-bar"
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            {/* Chapter markers */}
            {chapters.map((chapter, index) => {
              if (!chapter.audioTimestamp || !duration) return null;
              const markerPosition = (chapter.audioTimestamp / duration) * 100;
              return (
                <div
                  key={chapter.id}
                  className="absolute top-0 w-1 h-full bg-blue-500 cursor-pointer hover:bg-blue-600"
                  style={{ left: `${markerPosition}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    skipToChapter(index);
                  }}
                  title={`Chapter ${chapter.chapterNumber}: ${chapter.title}`}
                />
              );
            })}
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => skipTime(-30)}
            data-testid="button-skip-back"
          >
            <SkipBack className="h-4 w-4" />
            30s
          </Button>

          <Button
            size="lg"
            onClick={togglePlayback}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            data-testid="button-play-pause"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => skipTime(30)}
            data-testid="button-skip-forward"
          >
            <SkipForward className="h-4 w-4" />
            30s
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={([newVolume]) => setVolume(newVolume)}
              max={1}
              step={0.1}
              className="w-20"
              data-testid="volume-slider"
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-1">
            {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
              <Button
                key={speed}
                variant={playbackRate === speed ? "default" : "ghost"}
                size="sm"
                onClick={() => setPlaybackRate(speed)}
                className="text-xs px-2 py-1"
                data-testid={`speed-${speed}`}
              >
                {speed}x
              </Button>
            ))}
          </div>

          {/* Chapter Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipToChapter(Math.max(0, currentChapter - 1))}
              disabled={currentChapter === 0}
              data-testid="button-prev-chapter"
            >
              ← Prev
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipToChapter(Math.min(chapters.length - 1, currentChapter + 1))}
              disabled={currentChapter === chapters.length - 1}
              data-testid="button-next-chapter"
            >
              Next →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}