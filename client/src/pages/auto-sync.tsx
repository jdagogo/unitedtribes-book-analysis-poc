import { useState, useEffect } from 'react';
import { YouTubeAudioSync } from '@/components/youtube-audio-sync';
import { SynchronizedTranscript } from '@/components/synchronized-transcript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Upload, CheckCircle, FileAudio } from 'lucide-react';
import { Link } from 'wouter';

// We'll load the transcript data dynamically
const TRANSCRIPT_URL = '/transcript-PSN8N2v4oq0.json';

export default function AutoSyncPage() {
  const [wordTimestamps, setWordTimestamps] = useState<any[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [fullText, setFullText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptData, setTranscriptData] = useState<any>(null);

  // Load transcript data on mount
  useEffect(() => {
    fetch(TRANSCRIPT_URL)
      .then(res => res.json())
      .then(data => {
        setTranscriptData(data);
        
        // Convert the transcript data to the format our components expect
        const formattedWords = data.words.map((word: any, index: number) => ({
          word: word.word,
          start: word.start,
          end: word.end,
          index: index
        }));
        
        setWordTimestamps(formattedWords);
        setFullText(data.full_text || formattedWords.map((w: any) => w.word).join(' '));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load transcript:', err);
        setIsLoading(false);
      });
  }, []);

  // Handle word click - seek audio to that word's timestamp
  const handleWordClick = (wordIndex: number, timestamp: number) => {
    console.log(`Word clicked: ${wordTimestamps[wordIndex]?.word} at ${timestamp}s`);
    if (window.audioSync && window.audioSync.seekTo) {
      window.audioSync.seekTo(timestamp);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Auto-Synchronized Audio Player
            </h1>
            <p className="text-slate-600 mt-1">
              Using YouTube's automatic captions for perfect sync
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
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Perfectly Synced
          </Badge>
          <Badge variant="outline">
            {wordTimestamps.length} words with timestamps
          </Badge>
          {transcriptData && (
            <Badge variant="outline">
              Duration: {(transcriptData.duration / 60).toFixed(1)} minutes
            </Badge>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading transcript data...</p>
            </CardContent>
          </Card>
        ) : (
          <>
        <Alert className="mb-6 bg-green-50 border-green-300">
          <FileAudio className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Auto-sync complete!</strong> This transcript was automatically extracted from YouTube 
            with precise timestamps for each word. Click any word to jump to that exact moment.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle>YouTube Audio Player</CardTitle>
              <p className="text-sm text-gray-600">
                Merle Haggard - My House of Memories
              </p>
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
                    <span className="ml-2 font-mono">
                      {currentWordIndex >= 0 && wordTimestamps[currentWordIndex] 
                        ? wordTimestamps[currentWordIndex].word 
                        : 'Ready'}
                    </span>
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
                Extracted from YouTube captions with precise timing
              </p>
            </CardHeader>
            <CardContent>
              <SynchronizedTranscript
                text={fullText}
                wordTimestamps={wordTimestamps}
                currentWordIndex={currentWordIndex}
                onWordClick={handleWordClick}
                highlightColor="bg-yellow-300"
                scrollToHighlight={true}
                className="h-[500px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How This Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Automatic Extraction</h3>
                <p className="text-sm text-gray-700">
                  We used YouTube's transcript API to extract the captions with timestamps. 
                  This gives us the exact timing for when each word is spoken in the audio.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Perfect Synchronization</h3>
                <p className="text-sm text-gray-700">
                  Unlike manual syncing, this approach guarantees accuracy because the timestamps 
                  come directly from YouTube's speech recognition system.
                </p>
              </div>
            </div>
            
            {transcriptData && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Total words:</strong> {transcriptData.word_count} • 
                  <strong> Video ID:</strong> {transcriptData.video_id} • 
                  <strong> Duration:</strong> {(transcriptData.duration / 3600).toFixed(2)} hours
                </p>
              </div>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}