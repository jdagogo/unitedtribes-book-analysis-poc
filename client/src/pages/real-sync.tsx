import { useState, useEffect, useRef } from 'react';
import { ManualSyncTool, syncPointsToWordTimestamps } from '@/components/manual-sync-tool';
import { YouTubeAudioSync } from '@/components/youtube-audio-sync';
import { SynchronizedTranscript } from '@/components/synchronized-transcript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Home, Play, Info, Upload, FileText, Save, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

// Default sample transcript (incomplete - user should upload complete version)
const DEFAULT_TRANSCRIPT = `
This is Merle Haggard. HarperCollins Audio presents My House of Memories for the record 
by Merle Haggard with Tom Carter. Performed by the author.

Chapter One

My name is Merle Ronald Haggard, and I was born April 6, 1937, in a boxcar in Oildale, California. 
Actually, it wasn't really a boxcar. My father had taken an old refrigerator car from the Santa Fe Railroad 
and converted it into a house. The floor was hardwood, polished and clean. The walls were covered with 
wallpaper, and there were venetian blinds on the windows. It was small but comfortable, and it was home.

[INCOMPLETE TRANSCRIPT - Please upload complete transcript file for full synchronization]
`;

export default function RealSyncPage() {
  const [transcript, setTranscript] = useState(DEFAULT_TRANSCRIPT);
  const [wordTimestamps, setWordTimestamps] = useState<any[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [transcriptWordCount, setTranscriptWordCount] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle sync completion
  const handleSyncComplete = (syncMap: any[]) => {
    const timestamps = syncPointsToWordTimestamps(syncMap);
    setWordTimestamps(timestamps);
    setIsSynced(true);
    setShowSuccessMessage(true);
    
    // Save to localStorage for persistence
    localStorage.setItem('merle-sync-map', JSON.stringify(timestamps));
    localStorage.setItem('merle-transcript', transcript);
    
    // Automatically switch to test tab after a brief delay
    setTimeout(() => {
      setActiveTab('test');
      // Hide success message after switching
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }, 1500);
  };
  
  // Handle transcript file upload
  const handleTranscriptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTranscript(content);
      localStorage.setItem('merle-transcript', content);
      // Clear old sync map when new transcript is loaded
      setWordTimestamps([]);
      setIsSynced(false);
      localStorage.removeItem('merle-sync-map');
      setActiveTab('capture');
    };
    reader.readAsText(file);
  };
  
  // Handle transcript text area change
  const handleTranscriptTextChange = (value: string) => {
    setTranscript(value);
    localStorage.setItem('merle-transcript', value);
    // Clear old sync map when transcript is edited
    setWordTimestamps([]);
    setIsSynced(false);
    localStorage.removeItem('merle-sync-map');
  };

  // Load saved transcript and sync map if available
  useEffect(() => {
    // Load saved transcript
    const savedTranscript = localStorage.getItem('merle-transcript');
    if (savedTranscript) {
      setTranscript(savedTranscript);
    }
    
    // Load saved sync map
    const savedSyncMap = localStorage.getItem('merle-sync-map');
    if (savedSyncMap) {
      try {
        const timestamps = JSON.parse(savedSyncMap);
        setWordTimestamps(timestamps);
        setIsSynced(true);
      } catch (e) {
        console.error('Failed to load saved sync map:', e);
      }
    }
  }, []);
  
  // Update word count when transcript changes
  useEffect(() => {
    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    setTranscriptWordCount(words.length);
  }, [transcript]);

  // Handle word click
  const handleWordClick = (wordIndex: number, timestamp: number) => {
    console.log(`Word clicked: index ${wordIndex} at ${timestamp}s`);
    if (window.audioSync && window.audioSync.seekTo) {
      window.audioSync.seekTo(timestamp);
    }
  };

  // Update time from audio player
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.audioSync && window.audioSync.getCurrentTime) {
        const time = window.audioSync.getCurrentTime();
        setCurrentTime(time);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Real Audio-Transcript Synchronization
            </h1>
            <p className="text-slate-600 mt-1">
              Manually capture actual word timings for perfect sync
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        {/* Status */}
        <div className="flex gap-2 items-center">
          <Badge variant={isSynced ? 'default' : 'secondary'}>
            {isSynced ? 'Synced' : 'Not Synced'}
          </Badge>
          <Badge variant="outline">
            Transcript: {transcriptWordCount} words
          </Badge>
          {isSynced && (
            <Badge variant="outline">
              {wordTimestamps.length} words mapped
            </Badge>
          )}
          <Badge variant="outline">
            Current: {currentTime.toFixed(1)}s
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Transcript</TabsTrigger>
            <TabsTrigger value="capture">Capture Sync</TabsTrigger>
            <TabsTrigger value="test" disabled={!isSynced}>Test Sync</TabsTrigger>
            <TabsTrigger value="info">Instructions</TabsTrigger>
          </TabsList>
          
          {/* Tab 0: Upload/Edit Transcript */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Load Complete Transcript</CardTitle>
                <p className="text-sm text-gray-600">
                  Upload the complete transcript file or paste the full text
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label htmlFor="transcript-file">Upload Transcript File (.txt)</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      ref={fileInputRef}
                      id="transcript-file"
                      type="file"
                      accept=".txt,.text,text/plain"
                      onChange={handleTranscriptUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <Button
                      onClick={() => {
                        setTranscript(DEFAULT_TRANSCRIPT);
                        localStorage.removeItem('merle-transcript');
                        setWordTimestamps([]);
                        setIsSynced(false);
                        localStorage.removeItem('merle-sync-map');
                      }}
                      variant="outline"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>
                
                {/* Text Area for Direct Edit */}
                <div>
                  <Label htmlFor="transcript-text">Or Paste/Edit Transcript Directly</Label>
                  <Textarea
                    id="transcript-text"
                    value={transcript}
                    onChange={(e) => handleTranscriptTextChange(e.target.value)}
                    className="mt-2 h-96 font-mono text-sm"
                    placeholder="Paste the complete transcript here..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Current: {transcriptWordCount} words • 
                    {transcript.includes('[INCOMPLETE') && (
                      <span className="text-orange-600 font-semibold">
                        ⚠️ Using incomplete sample transcript
                      </span>
                    )}
                    {transcriptWordCount > 100 && !transcript.includes('[INCOMPLETE') && (
                      <span className="text-green-600 font-semibold">
                        ✓ Complete transcript loaded
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Save Button */}
                <Button
                  onClick={() => {
                    localStorage.setItem('merle-transcript', transcript);
                    setActiveTab('capture');
                  }}
                  className="w-full"
                  disabled={transcriptWordCount < 10}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Transcript & Continue to Sync
                </Button>
                
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> The transcript must match exactly what is spoken in the YouTube audio. 
                    Including timestamps like "0:25" or chapter markers is fine - they'll be treated as words during sync.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 1: Capture Sync Points */}
          <TabsContent value="capture" className="space-y-4">
            {/* Success Message */}
            {showSuccessMessage && (
              <Alert className="bg-green-50 border-green-300">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> Your sync map has been created and saved. 
                  Switching to Test tab where you can click any word to jump to that point in the audio...
                </AlertDescription>
              </Alert>
            )}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Audio Player */}
              <Card>
                <CardHeader>
                  <CardTitle>YouTube Audio</CardTitle>
                  <p className="text-sm text-gray-600">
                    Play this while marking sync points
                  </p>
                </CardHeader>
                <CardContent>
                  <YouTubeAudioSync
                    youtubeUrl="https://www.youtube.com/watch?v=PSN8N2v4oq0"
                    videoId="PSN8N2v4oq0"
                    startTime={0}
                    words={[]}
                    onTimeUpdate={setCurrentTime}
                  />
                  
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Start playing the audio, then use the sync tool to mark when you hear each word.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Manual Sync Tool */}
              <ManualSyncTool 
                transcript={transcript}
                onSyncComplete={handleSyncComplete}
              />
            </div>

            {/* Full Transcript for Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Full Transcript</CardTitle>
                <p className="text-sm text-gray-600">
                  Reference text - what you should be hearing
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto p-4 bg-gray-50 rounded font-mono text-sm whitespace-pre-wrap">
                  {transcript}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Test Synchronized Playback */}
          <TabsContent value="test" className="space-y-4">
            {/* Instructions for testing */}
            {showSuccessMessage && (
              <Alert className="bg-blue-50 border-blue-300">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Test Your Sync:</strong> Click any word in the transcript below to jump to that exact moment in the audio. 
                  The words should highlight in green as the audio plays.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Audio Player with Sync */}
              <Card>
                <CardHeader>
                  <CardTitle>Synchronized Audio Player</CardTitle>
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
                  
                  <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <span className="ml-2 font-mono">{currentTime.toFixed(2)}s</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Word:</span>
                        <span className="ml-2 font-mono">#{currentWordIndex}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Synchronized Transcript */}
              <Card>
                <CardHeader>
                  <CardTitle>Click-to-Seek Transcript</CardTitle>
                  <p className="text-sm text-gray-600">
                    Click any word to jump to that point
                  </p>
                </CardHeader>
                <CardContent>
                  <SynchronizedTranscript
                    text={transcript}
                    wordTimestamps={wordTimestamps}
                    currentWordIndex={currentWordIndex}
                    onWordClick={handleWordClick}
                    highlightColor="bg-green-300"
                    scrollToHighlight={true}
                    className="h-[400px]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button 
                    onClick={() => {
                      setIsSynced(false);
                      setWordTimestamps([]);
                      setActiveTab('capture');
                      localStorage.removeItem('merle-sync-map');
                    }}
                    variant="destructive"
                  >
                    Clear Sync & Recapture
                  </Button>
                  <Button
                    onClick={() => setActiveTab('upload')}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Load Different Transcript
                  </Button>
                  <Button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(wordTimestamps, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'merle-sync-verified.json';
                      a.click();
                    }}
                    variant="outline"
                  >
                    Export Verified Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Instructions */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>How to Create Perfect Sync</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 0: Load Complete Transcript</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Go to the "Upload Transcript" tab</li>
                    <li>Upload a .txt file with the complete transcript</li>
                    <li>Or paste the full transcript in the text area</li>
                    <li>Ensure it matches exactly what's spoken in the audio</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Capture Sync Points</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Go to the "Capture Sync" tab</li>
                    <li>Start playing the YouTube audio</li>
                    <li>When you hear "This", click "Mark" immediately</li>
                    <li>When you hear "HarperCollins", click "Mark" immediately</li>
                    <li>Continue marking 10-20 key words throughout the audio</li>
                    <li>The system will interpolate timing for all other words</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 2: Test the Sync</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    <li>Go to the "Test Sync" tab</li>
                    <li>Play the audio and watch words highlight in real-time</li>
                    <li>Click any word to jump to that exact moment</li>
                    <li>If timing is off, go back and capture more sync points</li>
                  </ol>
                </div>

                <Alert className="mt-4">
                  <AlertDescription>
                    <strong>Why this works:</strong> Instead of guessing when words are spoken, 
                    we capture the ACTUAL timestamps by listening to the audio. This creates a 
                    perfect sync map that works reliably.
                  </AlertDescription>
                </Alert>

                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold mb-2">Tips for Best Results:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Mark distinctive words that are easy to hear clearly</li>
                    <li>Spread sync points throughout the entire transcript</li>
                    <li>Mark at least one word every 10-15 seconds</li>
                    <li>Re-mark a word if you made a mistake (it will update)</li>
                    <li>The more sync points, the more accurate the interpolation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}