import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, SkipBack, SkipForward, Volume2, BookOpen, X } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  startTime: number;
  endTime: number;
  wordCount: number;
}

interface NativeAudioPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentChapter: Chapter;
  allChapters: Chapter[];
  onChapterChange: (chapter: Chapter) => void;
  title: string;
  author: string;
}

export function NativeAudioPlayer({
  isOpen,
  onClose,
  currentChapter,
  allChapters,
  onChapterChange,
  title,
  author
}: NativeAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const youtubePlayerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // YouTube URL with timestamp
  const YOUTUBE_URL = 'https://www.youtube.com/watch?v=PSN8N2v4oq0&t=946s';
  const YOUTUBE_VIDEO_ID = 'PSN8N2v4oq0';
  const START_TIME = 946; // Start at 15:46

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isOpen) return;

    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      setIsYouTubeReady(true);
      return;
    }

    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      setIsYouTubeReady(true);
    };

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [isOpen]);

  // Initialize YouTube player when API is ready (only once)
  useEffect(() => {
    if (!isYouTubeReady || !isOpen || !playerContainerRef.current) return;
    
    // Check if player already exists
    if (youtubePlayerRef.current) {
      console.log('YouTube player already exists, skipping initialization');
      return;
    }

    // Create a unique ID for the player div
    const playerId = `youtube-player-${Date.now()}`;
    playerContainerRef.current.innerHTML = `<div id="${playerId}"></div>`;

    // Initialize YouTube player (audio only, hidden)
    youtubePlayerRef.current = new window.YT.Player(playerId, {
      height: '0',
      width: '0',
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        start: START_TIME,
        modestbranding: 1,
        fs: 0,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: (event: any) => {
          console.log('YouTube player ready');
          event.target.setVolume(volume[0]);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimeTracking();
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
            stopTimeTracking();
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            stopTimeTracking();
          }
        },
        onError: (event: any) => {
          console.error('YouTube player error:', event.data);
          // Attempt to recover
          if (event.data === 5 && youtubePlayerRef.current) {
            setTimeout(() => {
              youtubePlayerRef.current.loadVideoById(YOUTUBE_VIDEO_ID, START_TIME);
            }, 1000);
          }
        }
      }
    });
  }, [isYouTubeReady, isOpen]); // Remove currentChapter and volume from dependencies

  // Handle chapter changes without recreating player
  useEffect(() => {
    if (!youtubePlayerRef.current || !youtubePlayerRef.current.seekTo) return;
    
    // When chapter changes, seek to new position
    const newStartTime = START_TIME + (currentChapter.startTime || 0);
    console.log(`Chapter changed, seeking to ${newStartTime} seconds`);
    
    try {
      youtubePlayerRef.current.seekTo(newStartTime, true);
      setCurrentTime(0); // Reset relative time for new chapter
    } catch (error) {
      console.error('Error seeking to new chapter:', error);
    }
  }, [currentChapter.id]); // Only depend on chapter ID

  const duration = currentChapter.endTime - currentChapter.startTime;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Time tracking functions with improved reliability
  const startTimeTracking = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      if (youtubePlayerRef.current && youtubePlayerRef.current.getCurrentTime) {
        try {
          const ytTime = youtubePlayerRef.current.getCurrentTime();
          // Adjust time relative to chapter start
          const relativeTime = ytTime - START_TIME - (currentChapter.startTime || 0);
          const clampedTime = Math.max(0, Math.min(relativeTime, duration));
          setCurrentTime(clampedTime);
          
          // Trigger any callbacks for word highlighting
          if (window.onAudioTimeUpdate) {
            window.onAudioTimeUpdate(ytTime);
          }
        } catch (error) {
          console.error('Error tracking time:', error);
        }
      }
    }, 50); // Reduced to 50ms for smoother word highlighting
  };

  const stopTimeTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (!youtubePlayerRef.current) {
      console.log('YouTube player not ready');
      return;
    }
    
    if (isPlaying) {
      youtubePlayerRef.current.pauseVideo();
    } else {
      youtubePlayerRef.current.playVideo();
    }
  };

  const handleSeek = (value: number[]) => {
    const seekTime = value[0];
    setCurrentTime(seekTime);
    if (youtubePlayerRef.current && youtubePlayerRef.current.seekTo) {
      try {
        // Seek to the absolute time in the YouTube video
        const absoluteTime = START_TIME + (currentChapter.startTime || 0) + seekTime;
        console.log(`Seeking to ${absoluteTime} seconds (relative: ${seekTime})`);
        youtubePlayerRef.current.seekTo(absoluteTime, true);
        
        // Force immediate time update
        if (youtubePlayerRef.current.getCurrentTime) {
          setTimeout(() => {
            const ytTime = youtubePlayerRef.current.getCurrentTime();
            const relativeTime = ytTime - START_TIME - (currentChapter.startTime || 0);
            setCurrentTime(Math.max(0, Math.min(relativeTime, duration)));
          }, 100);
        }
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 30);
    handleSeek([newTime]);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 30);
    handleSeek([newTime]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    if (youtubePlayerRef.current && youtubePlayerRef.current.setVolume) {
      youtubePlayerRef.current.setVolume(value[0]);
    }
  };

  // Reset when chapter changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [currentChapter.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const chapterDuration = currentChapter.endTime - currentChapter.startTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-amber-800">
            {title}
          </DialogTitle>
          <p className="text-gray-600">by {author}</p>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden px-6">
          {/* Current Chapter Info */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg mb-4 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-amber-800">{currentChapter.title}</h3>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {currentChapter.wordCount.toLocaleString()} words
              </Badge>
            </div>
            
            {/* Audio Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  onValueChange={handleSeek}
                  max={chapterDuration}
                  step={1}
                  className="w-full"
                  data-testid="audio-progress-slider"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(chapterDuration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={skipBackward}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 rounded-full"
                  data-testid="skip-backward-button"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handlePlayPause}
                  size="lg"
                  className="h-12 w-12 rounded-full bg-amber-600 hover:bg-amber-700"
                  data-testid="native-play-pause-button"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                
                <Button
                  onClick={skipForward}
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 rounded-full"
                  data-testid="skip-forward-button"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <Volume2 className="h-4 w-4 text-gray-500" />
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-32"
                  data-testid="volume-slider"
                />
                <span className="text-sm text-gray-500 w-10">{volume[0]}%</span>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs value={showTranscript ? "transcript" : "chapters"} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="chapters" 
                onClick={() => setShowTranscript(false)}
                data-testid="chapters-tab"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Chapters
              </TabsTrigger>
              <TabsTrigger 
                value="transcript" 
                onClick={() => setShowTranscript(true)}
                data-testid="transcript-tab"
              >
                Transcript
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chapters" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {allChapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        chapter.id === currentChapter.id
                          ? 'bg-amber-50 border-amber-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => onChapterChange(chapter)}
                      data-testid={`chapter-${index + 1}-item`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{chapter.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {chapter.wordCount.toLocaleString()} words
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="transcript" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                <div className="prose max-w-none">
                  <h4 className="font-semibold mb-3">{currentChapter.title}</h4>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {currentChapter.content}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hidden YouTube Player Container */}
        <div ref={playerContainerRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}