import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Play, Pause, SkipBack, Target, Save, Download, 
  Upload, RefreshCw, ChevronRight, Clock, CheckCircle 
} from 'lucide-react';

interface SyncPoint {
  wordIndex: number;
  word: string;
  timestamp: number;
  confidence: 'manual' | 'interpolated';
}

interface ManualSyncToolProps {
  transcript: string;
  onSyncComplete?: (syncMap: SyncPoint[]) => void;
  className?: string;
}

export function ManualSyncTool({ 
  transcript, 
  onSyncComplete,
  className = '' 
}: ManualSyncToolProps) {
  // Parse transcript into words
  const words = transcript.split(/\s+/).filter(w => w.length > 0);
  
  // State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [syncPoints, setSyncPoints] = useState<SyncPoint[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [mode, setMode] = useState<'capture' | 'review'>('capture');
  const [isPlayerConnected, setIsPlayerConnected] = useState(false);
  
  // Refs
  const playerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // YouTube player integration and time tracking
  useEffect(() => {
    // Wait for player to be available
    const checkPlayer = () => {
      if (window.audioSync) {
        playerRef.current = window.audioSync;
        console.log('ManualSyncTool: Connected to YouTube player');
        setIsPlayerConnected(true);
        return true;
      }
      return false;
    };
    
    // Check immediately and then periodically
    if (!checkPlayer()) {
      const retryInterval = setInterval(() => {
        if (checkPlayer()) {
          clearInterval(retryInterval);
        }
      }, 500);
      
      // Clean up retry interval after 10 seconds
      setTimeout(() => clearInterval(retryInterval), 10000);
    }
    
    // Update current time from player
    const timeInterval = setInterval(() => {
      if (window.audioSync && window.audioSync.getCurrentTime) {
        try {
          const time = window.audioSync.getCurrentTime();
          if (!isNaN(time)) {
            setCurrentTime(time);
          }
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }
    }, 100);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        markSyncPoint();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipToNextUnmarked();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentWordIndex(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentWordIndex, currentTime, words, syncPoints]);

  // Skip to next unmarked word
  const skipToNextUnmarked = useCallback(() => {
    const nextUnmarked = words.findIndex((_, idx) => 
      idx > currentWordIndex && !syncPoints.some(sp => sp.wordIndex === idx)
    );
    if (nextUnmarked >= 0) {
      setCurrentWordIndex(nextUnmarked);
    }
  }, [currentWordIndex, syncPoints, words]);

  // Mark current word at current timestamp
  const markSyncPoint = useCallback(() => {
    if (currentWordIndex >= words.length) return;
    
    const syncPoint: SyncPoint = {
      wordIndex: currentWordIndex,
      word: words[currentWordIndex],
      timestamp: currentTime,
      confidence: 'manual'
    };
    
    // Add or update sync point
    setSyncPoints(prev => {
      const existing = prev.findIndex(sp => sp.wordIndex === currentWordIndex);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = syncPoint;
        return updated;
      }
      return [...prev, syncPoint].sort((a, b) => a.wordIndex - b.wordIndex);
    });
    
    // Move to next word
    setCurrentWordIndex(prev => Math.min(prev + 1, words.length - 1));
  }, [currentWordIndex, currentTime, words]);

  // Calculate interpolated timestamps
  const calculateInterpolation = useCallback(() => {
    if (syncPoints.length < 2) return;
    
    const interpolated: SyncPoint[] = [...syncPoints];
    
    // Sort by word index
    syncPoints.sort((a, b) => a.wordIndex - b.wordIndex);
    
    // Interpolate between each pair of manual points
    for (let i = 0; i < syncPoints.length - 1; i++) {
      const start = syncPoints[i];
      const end = syncPoints[i + 1];
      const wordGap = end.wordIndex - start.wordIndex;
      const timeGap = end.timestamp - start.timestamp;
      
      if (wordGap > 1) {
        const timePerWord = timeGap / wordGap;
        
        for (let j = start.wordIndex + 1; j < end.wordIndex; j++) {
          const interpolatedTime = start.timestamp + (j - start.wordIndex) * timePerWord;
          interpolated.push({
            wordIndex: j,
            word: words[j],
            timestamp: interpolatedTime,
            confidence: 'interpolated'
          });
        }
      }
    }
    
    // Extrapolate before first point
    if (syncPoints[0].wordIndex > 0) {
      const firstPoint = syncPoints[0];
      const secondPoint = syncPoints[1] || firstPoint;
      const wordsPerSecond = (secondPoint.wordIndex - firstPoint.wordIndex) / 
                             (secondPoint.timestamp - firstPoint.timestamp || 1);
      const estimatedRate = wordsPerSecond > 0 ? wordsPerSecond : 2.5;
      
      for (let i = 0; i < firstPoint.wordIndex; i++) {
        interpolated.push({
          wordIndex: i,
          word: words[i],
          timestamp: Math.max(0, firstPoint.timestamp - (firstPoint.wordIndex - i) / estimatedRate),
          confidence: 'interpolated'
        });
      }
    }
    
    // Extrapolate after last point
    const lastPoint = syncPoints[syncPoints.length - 1];
    if (lastPoint.wordIndex < words.length - 1) {
      const prevPoint = syncPoints[syncPoints.length - 2] || lastPoint;
      const wordsPerSecond = (lastPoint.wordIndex - prevPoint.wordIndex) / 
                             (lastPoint.timestamp - prevPoint.timestamp || 1);
      const estimatedRate = wordsPerSecond > 0 ? wordsPerSecond : 2.5;
      
      for (let i = lastPoint.wordIndex + 1; i < words.length; i++) {
        interpolated.push({
          wordIndex: i,
          word: words[i],
          timestamp: lastPoint.timestamp + (i - lastPoint.wordIndex) / estimatedRate,
          confidence: 'interpolated'
        });
      }
    }
    
    return interpolated.sort((a, b) => a.wordIndex - b.wordIndex);
  }, [syncPoints, words]);

  // Export sync data
  const exportSyncData = useCallback(() => {
    const fullSyncMap = calculateInterpolation() || syncPoints;
    
    // Show a success message
    const message = `✅ Sync map created with ${syncPoints.length} manual points and ${fullSyncMap.length - syncPoints.length} interpolated points!`;
    console.log(message);
    
    const exportData = {
      transcript,
      totalWords: words.length,
      manualPoints: syncPoints.length,
      syncMap: fullSyncMap,
      metadata: {
        createdAt: new Date().toISOString(),
        averageWordsPerSecond: syncPoints.length >= 2 ? 
          (syncPoints[syncPoints.length - 1].wordIndex - syncPoints[0].wordIndex) /
          (syncPoints[syncPoints.length - 1].timestamp - syncPoints[0].timestamp) : null
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-map-${Date.now()}.json`;
    a.click();
    
    // Notify parent component that sync is complete
    if (onSyncComplete) {
      onSyncComplete(fullSyncMap);
      // This will trigger the page to switch to the Test tab automatically
    }
  }, [calculateInterpolation, syncPoints, transcript, words, onSyncComplete]);

  // Import sync data
  const importSyncData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.syncMap) {
          const manualPoints = data.syncMap.filter((sp: SyncPoint) => sp.confidence === 'manual');
          setSyncPoints(manualPoints);
          setMode('review');
        }
      } catch (error) {
        console.error('Failed to import sync data:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Calculate progress
  const progress = (syncPoints.length / Math.max(words.length * 0.1, 10)) * 100;
  const isComplete = syncPoints.length >= Math.max(words.length * 0.1, 5);

  // Get speech rate estimate
  const speechRate = syncPoints.length >= 2 ? 
    ((syncPoints[syncPoints.length - 1].wordIndex - syncPoints[0].wordIndex) /
     (syncPoints[syncPoints.length - 1].timestamp - syncPoints[0].timestamp)).toFixed(2) : 
    'N/A';

  return (
    <div className={`manual-sync-tool ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Manual Sync Capture</span>
            <div className="flex gap-2">
              <Badge variant={mode === 'capture' ? 'default' : 'outline'}>
                Capture Mode
              </Badge>
              <Badge variant={mode === 'review' ? 'default' : 'outline'}>
                Review Mode
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <Alert>
            <AlertDescription>
              <strong>How to sync:</strong> Play the audio and click "Mark" (or press SPACE) 
              when you hear each highlighted word. Mark at least 5-10 words throughout the 
              transcript for accurate synchronization.
              {!isPlayerConnected && (
                <span className="block mt-2 text-orange-600">
                  ⏳ Waiting for audio player connection...
                </span>
              )}
              {isPlayerConnected && (
                <span className="block mt-2 text-green-600">
                  ✓ Audio player connected - Time: {currentTime.toFixed(1)}s
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Current Word Display */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-2">Current word #{currentWordIndex + 1}</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {words[currentWordIndex] || 'Complete!'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Listen for this word and click "Mark" when you hear it
            </p>
          </div>

          {/* Context (surrounding words) */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {currentWordIndex > 0 && (
              <span className="text-gray-400">{words[currentWordIndex - 1]}</span>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-bold text-lg px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">
              {words[currentWordIndex]}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {currentWordIndex < words.length - 1 && (
              <span className="text-gray-400">{words[currentWordIndex + 1]}</span>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={markSyncPoint}
              size="lg"
              className="flex-1"
              disabled={currentWordIndex >= words.length}
            >
              <Target className="h-5 w-5 mr-2" />
              Mark at {currentTime.toFixed(1)}s
            </Button>
            <Button 
              onClick={skipToNextUnmarked}
              variant="outline"
              disabled={currentWordIndex >= words.length - 1}
            >
              Skip Word
            </Button>
            <Button
              onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 1))}
              variant="outline"
              size="icon"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sync Points: {syncPoints.length}</span>
              <span>Speech Rate: {speechRate} words/sec</span>
            </div>
            <Progress value={Math.min(100, progress)} />
            
            {syncPoints.length === 0 && (
              <Alert>
                <AlertDescription>
                  <strong>Getting Started:</strong> Play the audio above and click "Mark" when you hear each word.
                  You need at least 5 sync points to create a sync map.
                </AlertDescription>
              </Alert>
            )}
            
            {syncPoints.length > 0 && syncPoints.length < 5 && (
              <Alert className="bg-yellow-50 dark:bg-yellow-900">
                <AlertDescription>
                  <strong>Keep going!</strong> You've marked {syncPoints.length} word{syncPoints.length !== 1 ? 's' : ''}. 
                  Mark at least {5 - syncPoints.length} more for a basic sync map.
                </AlertDescription>
              </Alert>
            )}
            
            {isComplete && (
              <Alert className="bg-green-50 dark:bg-green-900">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ready to export!</strong> You have enough sync points ({syncPoints.length}). 
                  Click "Export Sync Map" below to save and test your synchronization.
                  <br />
                  <span className="text-sm mt-1 block">
                    Tip: More sync points = better accuracy. Aim for 10-20 points throughout the transcript.
                  </span>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Sync Points List */}
          <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded p-2">
            <p className="text-xs font-semibold mb-2">Captured Sync Points:</p>
            <div className="space-y-1">
              {syncPoints.map((sp, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="font-mono">#{sp.wordIndex}: "{sp.word}"</span>
                  <span className="text-gray-500">{sp.timestamp.toFixed(2)}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={exportSyncData}
              variant={isComplete ? "default" : "outline"}
              className={`flex-1 ${isComplete ? 'animate-pulse' : ''}`}
              disabled={syncPoints.length < 2}
            >
              <Download className="h-4 w-4 mr-2" />
              {isComplete ? 'Export & Test Sync Map' : `Export Sync Map (${syncPoints.length} points)`}
            </Button>
            <Button
              onClick={() => {
                setSyncPoints([]);
                setCurrentWordIndex(0);
              }}
              variant="outline"
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <label>
              <Button variant="outline" size="icon" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importSyncData}
                className="hidden"
              />
            </label>
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-center text-gray-500">
            Tip: Press SPACEBAR to mark the current word
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to convert sync points to word timestamps
export function syncPointsToWordTimestamps(syncPoints: SyncPoint[]) {
  return syncPoints.map(sp => ({
    word: sp.word,
    start: sp.timestamp,
    end: sp.timestamp + 0.3,
    index: sp.wordIndex
  }));
}