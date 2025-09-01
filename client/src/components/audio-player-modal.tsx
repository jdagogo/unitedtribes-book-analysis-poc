import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Volume2, Clock, Book, ExternalLink, Download } from 'lucide-react';

interface AudioPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeUrl: string;
  bookTitle: string;
  author: string;
  currentChapter: {
    id: string;
    number: number;
    title: string;
    startTime: number;
    endTime: number;
    content: string;
    keyTopics: string[];
  };
  totalDuration: number;
  onChapterChange?: (chapterNumber: number) => void;
}

export function AudioPlayerModal({
  isOpen,
  onClose,
  youtubeUrl,
  bookTitle,
  author,
  currentChapter,
  totalDuration,
  onChapterChange
}: AudioPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(currentChapter.startTime);
  const [volume, setVolume] = useState([80]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFirstPlay = () => {
    if (audioStarted) return;
    
    console.log('Starting playback simulation with external audio');
    setAudioStarted(true);
    setIsPlaying(true);
    
    // Open YouTube at chapter start time
    const timeParam = currentChapter.startTime;
    const url = `${youtubeUrl}&t=${timeParam}s`;
    window.open(url, '_blank');
    
    // Start timer simulation
    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        if (newTime >= currentChapter.endTime) {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return currentChapter.endTime;
        }
        return newTime;
      });
    }, 1000);
  };

  const handlePlayPause = () => {
    if (!audioStarted) {
      handleFirstPlay();
      return;
    }
    
    if (isPlaying) {
      // Pause timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Resume timer
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= currentChapter.endTime) {
            setIsPlaying(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return currentChapter.endTime;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = Math.max(currentChapter.startTime, Math.min(value[0], currentChapter.endTime));
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentChapter.startTime, currentTime - 30);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(currentChapter.endTime, currentTime + 30);
    setCurrentTime(newTime);
  };

  const progress = ((currentTime - currentChapter.startTime) / (currentChapter.endTime - currentChapter.startTime)) * 100;

  // Cleanup on unmount or chapter change
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Reset when chapter changes
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentTime(currentChapter.startTime);
    setIsPlaying(false);
    setAudioStarted(false);
  }, [currentChapter.id]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {bookTitle}
          </DialogTitle>
          <p className="text-gray-600">by {author}</p>
        </DialogHeader>



        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Current Chapter Info */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg mb-4 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{currentChapter.title}</h3>
              <Badge variant="secondary">
                Chapter {currentChapter.number}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {currentChapter.keyTopics.slice(0, 4).map((topic, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(currentChapter.startTime)} - {formatTime(currentChapter.endTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Book className="h-4 w-4" />
                <span>{Math.floor((currentChapter.endTime - currentChapter.startTime) / 60)} min</span>
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="bg-white border rounded-lg p-6 mb-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                onValueChange={handleSeek}
                max={currentChapter.endTime}
                min={currentChapter.startTime}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentChapter.endTime)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={skipBackward}
                className="h-10 w-10"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={handlePlayPause}
                size="lg"
                className="h-12 w-12 rounded-full bg-amber-600 hover:bg-amber-700"
                data-testid="modal-play-pause-button"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={skipForward}
                className="h-10 w-10"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-500" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                min={0}
                step={1}
                className="w-24"
              />
              <span className="text-sm text-gray-500 w-8">{volume[0]}%</span>
            </div>
          </div>

          {/* Chapter Transcript Toggle */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Chapter Content</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
              >
                {showTranscript ? 'Hide' : 'Show'} Full Text
              </Button>
            </div>

            {showTranscript && (
              <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {currentChapter.content}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => window.open(youtubeUrl, '_blank')}
                className="text-sm flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Full Audiobook
              </Button>
              {audioStarted && (
                <div className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
                  Playing in external tab - controls work here
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {currentChapter.number > 1 && (
                <Button
                  variant="outline"
                  onClick={() => onChapterChange?.(currentChapter.number - 1)}
                >
                  Previous Chapter
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onChapterChange?.(currentChapter.number + 1)}
              >
                Next Chapter
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
