import { useState, useEffect, useCallback, useRef } from 'react';
import { YouTubeAudioSync } from '@/components/youtube-audio-sync';
import { SynchronizedTranscript, generateWordTimestamps } from '@/components/synchronized-transcript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Home, Play, Pause, RotateCcw, Save, Download, Upload,
  Clock, Target, AlertCircle, CheckCircle, Settings
} from 'lucide-react';
import { Link } from 'wouter';

// Known sync points in the Merle Haggard audiobook (ACTUAL YouTube timestamps)
const KNOWN_SYNC_POINTS = [
  { 
    time: 6, // 0:06 in video
    text: "HarperCollins Audio Presents",
    description: "Merle says this at 6 seconds"
  },
  {
    time: 10, // 0:10
    text: "My House of Memories",
    description: "Title announcement"
  },
  {
    time: 14, // 0:14
    text: "for the record",
    description: "Subtitle"
  },
  {
    time: 18, // 0:18
    text: "by Merle Haggard with Tom Carter",
    description: "Author credits"
  },
  {
    time: 25, // 0:25
    text: "performed by the author",
    description: "Narrator announcement"
  }
];

// ACTUAL transcript as heard in the YouTube video
const FULL_TRANSCRIPT = `
This is Merle Haggard. HarperCollins Audio Presents My House of Memories for the record 
by Merle Haggard with Tom Carter. Performed by the author.

Chapter One

My name is Merle Ronald Haggard, and I was born April 6, 1937, in a boxcar in Oildale, California. 
Actually, it wasn't really a boxcar. My father had taken an old refrigerator car from the Santa Fe Railroad 
and converted it into a house. The floor was hardwood, polished and clean. The walls were covered with 
wallpaper, and there were venetian blinds on the windows. It was small but comfortable, and it was home.

My parents were Okies, part of that great migration from Oklahoma, Texas, and Arkansas that came to 
California during the Depression, looking for work in the fields and orchards. My father, James Francis 
Haggard, was a hard-working man who could do just about anything with his hands. He worked for the 
Santa Fe Railroad, and when he wasn't working, he was playing his fiddle or teaching me and my brother 
and sister about life.

Music was always part of our lives. Dad played fiddle, and Mom sang. I remember hearing Bob Wills and 
his Texas Playboys on the radio, and that Western swing sound just grabbed me. There was something about 
the way those instruments talked to each other, the way the steel guitar cried and the fiddle danced, 
that spoke to something deep inside me.

When I was nine years old, my father died. It was 1946, and he was only forty-seven. A stroke took him 
suddenly, and our whole world changed. Mom tried to hold things together, but it was hard. She had to work, 
and that meant I was on my own a lot. That's when I started getting into trouble.
`;

interface SyncPoint {
  id: string;
  expectedTime: number;
  actualTime: number;
  text: string;
  confidence: number;
}

export default function AudioSyncCalibrationPage() {
  // State for calibration
  const [globalOffset, setGlobalOffset] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [syncPoints, setSyncPoints] = useState<SyncPoint[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Calibration mode
  const [calibrationMode, setCalibrationMode] = useState<'manual' | 'auto' | 'sync-points'>('manual');
  const [isCapturingSyncPoint, setIsCapturingSyncPoint] = useState(false);
  const [selectedSyncPointIndex, setSelectedSyncPointIndex] = useState(-1);
  
  // Word timestamps with offset applied
  const [wordTimestamps, setWordTimestamps] = useState<any[]>([]);
  const [baseWordTimestamps, setBaseWordTimestamps] = useState<any[]>([]);
  
  // Debug information
  const [debugInfo, setDebugInfo] = useState({
    expectedWord: '',
    actualWord: '',
    drift: 0,
    accuracy: 100
  });

  // References
  const audioSyncRef = useRef<any>(null);
  const transcriptWords = useRef<string[]>([]);

  // Generate initial word timestamps
  useEffect(() => {
    const words = FULL_TRANSCRIPT.split(/\s+/).filter(w => w.length > 0);
    transcriptWords.current = words;
    
    // Start from actual beginning of YouTube video
    const baseStartTime = 0; // Video starts at 0:00
    const wordsPerSecond = 2.5; // Average speaking rate
    
    // Manual adjustments for known words
    const knownWords: { [key: string]: number } = {
      'This': 0,
      'is': 0.5,
      'Merle': 1,
      'Haggard.': 1.5,
      'HarperCollins': 6,
      'Audio': 6.5,
      'Presents': 7,
      'My': 10,
      'House': 10.3,
      'of': 10.6,
      'Memories': 10.9,
      'for': 13,
      'the': 13.3,
      'record': 13.6,
      'by': 17,
      'performed': 24,
      'Chapter': 30,
      'One': 31
    };
    
    let lastKnownTime = 0;
    const timestamps = words.map((word, index) => {
      // Check if we have a known timestamp for this word
      const cleanWord = word.replace(/[.,!?]/g, '');
      if (knownWords[word] !== undefined) {
        lastKnownTime = knownWords[word];
        return {
          word,
          start: knownWords[word],
          end: knownWords[word] + 0.4,
          index
        };
      } else if (knownWords[cleanWord] !== undefined) {
        lastKnownTime = knownWords[cleanWord];
        return {
          word,
          start: knownWords[cleanWord],
          end: knownWords[cleanWord] + 0.4,
          index
        };
      } else {
        // Estimate based on last known time
        const estimatedTime = lastKnownTime + 0.4;
        lastKnownTime = estimatedTime;
        return {
          word,
          start: estimatedTime,
          end: estimatedTime + 0.4,
          index
        };
      }
    });
    
    setBaseWordTimestamps(timestamps);
    setWordTimestamps(timestamps);
  }, []);

  // Apply offset to all timestamps
  useEffect(() => {
    if (baseWordTimestamps.length === 0) return;
    
    const adjustedTimestamps = baseWordTimestamps.map(ts => ({
      ...ts,
      start: ts.start + globalOffset,
      end: ts.end + globalOffset
    }));
    
    setWordTimestamps(adjustedTimestamps);
  }, [globalOffset, baseWordTimestamps]);

  // Update debug info
  useEffect(() => {
    if (wordTimestamps.length === 0) return;
    
    // Find expected word for current time
    const expectedIndex = wordTimestamps.findIndex(
      w => currentTime >= w.start && currentTime <= w.end
    );
    
    const expectedWord = expectedIndex >= 0 ? wordTimestamps[expectedIndex].word : 'N/A';
    const actualWord = currentWordIndex >= 0 ? wordTimestamps[currentWordIndex]?.word : 'N/A';
    
    // Calculate drift
    let drift = 0;
    if (expectedIndex >= 0 && currentWordIndex >= 0) {
      drift = (currentWordIndex - expectedIndex) * 0.4; // Approximate seconds drift
    }
    
    // Calculate accuracy (simple percentage based on drift)
    const accuracy = Math.max(0, Math.min(100, 100 - Math.abs(drift) * 10));
    
    setDebugInfo({
      expectedWord,
      actualWord,
      drift,
      accuracy
    });
  }, [currentTime, currentWordIndex, wordTimestamps]);

  // Handle offset adjustment
  const handleOffsetChange = (value: number[]) => {
    setGlobalOffset(value[0]);
  };

  // Reset calibration
  const resetCalibration = () => {
    setGlobalOffset(0);
    setPlaybackRate(1.0);
    setSyncPoints([]);
    setSelectedSyncPointIndex(-1);
  };

  // Capture sync point
  const captureSyncPoint = () => {
    if (!isCapturingSyncPoint) {
      setIsCapturingSyncPoint(true);
      return;
    }
    
    // Get current word being highlighted
    const currentWord = wordTimestamps[currentWordIndex];
    if (!currentWord) return;
    
    const newSyncPoint: SyncPoint = {
      id: `sp-${Date.now()}`,
      expectedTime: currentWord.start - globalOffset, // Original time
      actualTime: currentTime,
      text: currentWord.word,
      confidence: 100
    };
    
    setSyncPoints([...syncPoints, newSyncPoint]);
    setIsCapturingSyncPoint(false);
    
    // Auto-calculate new offset based on this sync point
    if (syncPoints.length === 0) {
      const suggestedOffset = currentTime - (currentWord.start - globalOffset);
      setGlobalOffset(suggestedOffset);
    }
  };

  // Calculate offset from sync points
  const calculateOffsetFromSyncPoints = () => {
    if (syncPoints.length === 0) return;
    
    // Average the differences between expected and actual times
    const offsets = syncPoints.map(sp => sp.actualTime - sp.expectedTime);
    const averageOffset = offsets.reduce((a, b) => a + b, 0) / offsets.length;
    
    setGlobalOffset(averageOffset);
  };

  // Jump to known sync point
  const jumpToSyncPoint = (point: typeof KNOWN_SYNC_POINTS[0]) => {
    if (window.audioSync && window.audioSync.seekTo) {
      window.audioSync.seekTo(point.time + globalOffset);
    }
  };

  // Export calibration data
  const exportCalibration = () => {
    const calibrationData = {
      globalOffset,
      playbackRate,
      syncPoints,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(calibrationData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merle-haggard-sync-calibration.json';
    a.click();
  };

  // Import calibration data
  const importCalibration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setGlobalOffset(data.globalOffset || 0);
        setPlaybackRate(data.playbackRate || 1.0);
        setSyncPoints(data.syncPoints || []);
      } catch (error) {
        console.error('Failed to import calibration:', error);
      }
    };
    reader.readAsText(file);
  };

  // Handle word click with offset
  const handleWordClick = (wordIndex: number, timestamp: number) => {
    console.log(`Word clicked: ${wordTimestamps[wordIndex]?.word} at ${timestamp}s (with offset: ${globalOffset})`);
    if (window.audioSync && window.audioSync.seekTo) {
      window.audioSync.seekTo(timestamp);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Audio-Transcript Sync Calibration
            </h1>
            <p className="text-slate-600 mt-1">
              Fine-tune the alignment between transcript and YouTube audio
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Status Bar */}
        <div className="flex gap-4 items-center bg-white p-3 rounded-lg shadow-sm">
          <Badge variant={Math.abs(globalOffset) < 1 ? 'default' : 'secondary'}>
            Offset: {globalOffset.toFixed(2)}s
          </Badge>
          <Badge variant={debugInfo.accuracy > 90 ? 'default' : 'destructive'}>
            Accuracy: {debugInfo.accuracy.toFixed(0)}%
          </Badge>
          <Badge variant="outline">
            Sync Points: {syncPoints.length}
          </Badge>
          {Math.abs(debugInfo.drift) > 2 && (
            <Alert className="flex-1 py-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Audio drift detected: {debugInfo.drift.toFixed(1)}s
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid gap-6 lg:grid-cols-3">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audio Player</CardTitle>
            </CardHeader>
            <CardContent>
              <YouTubeAudioSync
                youtubeUrl="https://www.youtube.com/watch?v=PSN8N2v4oq0"
                videoId="PSN8N2v4oq0"
                startTime={0}
                words={wordTimestamps}
                onWordHighlight={setCurrentWordIndex}
                onTimeUpdate={setCurrentTime}
              />
            </CardContent>
          </Card>

          {/* Calibration Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Calibration Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={calibrationMode} onValueChange={(v: any) => setCalibrationMode(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="manual">Manual</TabsTrigger>
                  <TabsTrigger value="auto">Auto</TabsTrigger>
                  <TabsTrigger value="sync-points">Points</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <Label>Global Offset ({globalOffset.toFixed(2)}s)</Label>
                    <Slider
                      value={[globalOffset]}
                      onValueChange={handleOffsetChange}
                      min={-60}
                      max={60}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>-60s</span>
                      <span>0s</span>
                      <span>+60s</span>
                    </div>
                  </div>

                  <div>
                    <Label>Playback Rate ({playbackRate.toFixed(2)}x)</Label>
                    <Slider
                      value={[playbackRate]}
                      onValueChange={(v) => setPlaybackRate(v[0])}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    onClick={resetCalibration} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Default
                  </Button>
                </TabsContent>

                <TabsContent value="auto" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Play the audio and click when you hear these phrases:
                  </p>
                  
                  {KNOWN_SYNC_POINTS.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{point.text}</p>
                        <p className="text-xs text-gray-500">{point.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => jumpToSyncPoint(point)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button 
                    onClick={calculateOffsetFromSyncPoints}
                    className="w-full"
                    disabled={syncPoints.length === 0}
                  >
                    Calculate Offset from Points
                  </Button>
                </TabsContent>

                <TabsContent value="sync-points" className="space-y-4">
                  <Button
                    onClick={captureSyncPoint}
                    variant={isCapturingSyncPoint ? 'destructive' : 'default'}
                    className="w-full"
                  >
                    {isCapturingSyncPoint ? 'Click on Correct Word' : 'Capture Sync Point'}
                  </Button>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {syncPoints.map((sp, index) => (
                      <div key={sp.id} className="text-xs p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">"{sp.text}"</span>
                          <span className="text-gray-500">
                            Δ {(sp.actualTime - sp.expectedTime).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Import/Export */}
              <div className="flex gap-2">
                <Button onClick={exportCalibration} size="sm" variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Label className="flex-1">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-1" />
                      Import
                    </span>
                  </Button>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={importCalibration}
                    className="hidden"
                  />
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Debug Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500">Current Time:</p>
                  <p className="font-mono">{currentTime.toFixed(2)}s</p>
                </div>
                <div>
                  <p className="text-gray-500">Word Index:</p>
                  <p className="font-mono">{currentWordIndex}</p>
                </div>
                <div>
                  <p className="text-gray-500">Expected Word:</p>
                  <p className="font-medium truncate">{debugInfo.expectedWord}</p>
                </div>
                <div>
                  <p className="text-gray-500">Actual Word:</p>
                  <p className="font-medium truncate">{debugInfo.actualWord}</p>
                </div>
                <div>
                  <p className="text-gray-500">Drift:</p>
                  <p className={`font-mono ${Math.abs(debugInfo.drift) > 2 ? 'text-red-600' : ''}`}>
                    {debugInfo.drift > 0 ? '+' : ''}{debugInfo.drift.toFixed(1)}s
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Base Start:</p>
                  <p className="font-mono">0s (0:00)</p>
                </div>
              </div>

              {/* Visual accuracy indicator */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-500">Sync Accuracy</span>
                  <span className="font-medium">{debugInfo.accuracy.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      debugInfo.accuracy > 90 ? 'bg-green-500' :
                      debugInfo.accuracy > 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${debugInfo.accuracy}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Transcript */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Synchronized Transcript</CardTitle>
              <p className="text-sm text-gray-600">
                Click any word to test synchronization with current offset
              </p>
            </CardHeader>
            <CardContent>
              <SynchronizedTranscript
                text={FULL_TRANSCRIPT}
                wordTimestamps={wordTimestamps}
                currentWordIndex={currentWordIndex}
                onWordClick={handleWordClick}
                highlightColor="bg-yellow-300"
                scrollToHighlight={true}
                className="h-[600px] font-serif text-lg leading-relaxed"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-7xl mx-auto mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Calibration Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Quick Calibration:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Play the audio and listen for "Harper Audio presents"</li>
                  <li>When you hear it, note the actual time</li>
                  <li>Adjust the Global Offset slider until words match audio</li>
                  <li>Test by clicking different words in the transcript</li>
                  <li>Fine-tune until synchronization is accurate</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Advanced Calibration:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Use "Sync Points" mode to capture multiple reference points</li>
                  <li>Play audio and click "Capture Sync Point" at known phrases</li>
                  <li>Click the actual word when you hear it spoken</li>
                  <li>After 3-4 points, click "Calculate Offset"</li>
                  <li>Export calibration data for future use</li>
                </ol>
              </div>
            </div>
            
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Once calibrated, the offset value can be saved and applied to all Merle Haggard 
                audiobook content across the platform for perfect synchronization.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}