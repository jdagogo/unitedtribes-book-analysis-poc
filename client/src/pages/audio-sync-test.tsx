import { useState, useEffect } from 'react';
import { YouTubeAudioSync } from '@/components/youtube-audio-sync';
import { SynchronizedTranscript, generateWordTimestamps } from '@/components/synchronized-transcript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'wouter';

// ACTUAL text from the YouTube video
const SAMPLE_TEXT = `
This is Merle Haggard. HarperCollins Audio Presents My House of Memories for the record 
by Merle Haggard with Tom Carter. Performed by the author.

My name is Merle Haggard, and this is my story. I was born in Oildale, California, in 1937, 
right in the middle of the Great Depression. My parents were Okies who'd come to California 
looking for work, like so many others during those hard times. We lived in a converted boxcar 
that my father had turned into a house. It wasn't much, but it was home.

Music found me early. I remember hearing Bob Wills on the radio when I was just a kid, 
and something about that Texas swing sound just grabbed hold of me and never let go. 
My older brother gave me my first guitar when I was twelve, and from that moment on, 
I knew what I wanted to do with my life.

But the road to becoming a musician wasn't straight or easy. I got into trouble as a teenager, 
hopping freight trains and running wild. I ended up in San Quentin prison when I was twenty, 
and that's where I saw Johnny Cash perform. That concert changed my life. When I got out, 
I was determined to make something of myself through music.

Bakersfield became my musical home. The honky-tonks on Edison Highway were where I learned 
my craft, playing for tips and free beer. Buck Owens was already making a name for himself, 
and together we helped create what people now call the Bakersfield Sound - a rougher, 
more electric alternative to the smooth Nashville sound that dominated country music at the time.
`;

export default function AudioSyncTestPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [wordTimestamps, setWordTimestamps] = useState<any[]>([]);

  // Generate word timestamps for the sample text
  useEffect(() => {
    // Generate timestamps based on actual YouTube video timing
    const words = SAMPLE_TEXT.split(/\s+/).filter(w => w.length > 0);
    
    // Known timestamps for key words
    const knownTimestamps: { [key: string]: number } = {
      'This': 0,
      'HarperCollins': 6,
      'Audio': 6.5,
      'Presents': 7,
      'My': 10,
      'House': 10.3,
      'Memories': 10.9
    };
    
    let currentTime = 0;
    const timestamps = words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?]/g, '');
      if (knownTimestamps[cleanWord] !== undefined) {
        currentTime = knownTimestamps[cleanWord];
      } else if (knownTimestamps[word] !== undefined) {
        currentTime = knownTimestamps[word];
      } else {
        currentTime += 0.4; // Default spacing
      }
      
      return {
        word,
        start: currentTime,
        end: currentTime + 0.3,
        index
      };
    });
    
    setWordTimestamps(timestamps);
  }, []);

  // Handle word click - seek audio to that word's timestamp
  const handleWordClick = (wordIndex: number, timestamp: number) => {
    console.log(`Word clicked: ${wordTimestamps[wordIndex]?.word} at ${timestamp}s`);
    // The YouTube player will handle the actual seeking
    if (window.audioSync && window.audioSync.seekTo) {
      window.audioSync.seekTo(timestamp);
    }
  };

  // Handle word highlighting from audio playback
  const handleWordHighlight = (wordIndex: number) => {
    setCurrentWordIndex(wordIndex);
  };

  // Handle time updates from audio player
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-amber-900">
            Audio-Transcript Synchronization Test
          </h1>
          <div className="flex gap-2">
            <Link href="/audio-sync-calibration">
              <Button variant="default" size="sm">
                Open Calibration Tool
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-700">
          Testing word-level synchronization with Merle Haggard's audiobook on YouTube
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-2">
        {/* Audio Player */}
        <Card>
          <CardHeader>
            <CardTitle>YouTube Audio Player</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">Merle Haggard</Badge>
              <Badge variant="secondary">My House of Memories</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <YouTubeAudioSync
              youtubeUrl="https://www.youtube.com/watch?v=PSN8N2v4oq0"
              videoId="PSN8N2v4oq0"
              startTime={0}
              words={wordTimestamps}
              onWordHighlight={handleWordHighlight}
              onTimeUpdate={handleTimeUpdate}
            />
            
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              <div className="font-semibold mb-1">Debug Info:</div>
              <div>Current Time: {currentTime.toFixed(2)}s</div>
              <div>Current Word Index: {currentWordIndex}</div>
              <div>Total Words: {wordTimestamps.length}</div>
            </div>
          </CardContent>
        </Card>

        {/* Synchronized Transcript */}
        <Card>
          <CardHeader>
            <CardTitle>Synchronized Transcript</CardTitle>
            <p className="text-sm text-gray-600">
              Click any word to jump to that point in the audio
            </p>
          </CardHeader>
          <CardContent>
            <SynchronizedTranscript
              text={SAMPLE_TEXT}
              wordTimestamps={wordTimestamps}
              currentWordIndex={currentWordIndex}
              onWordClick={handleWordClick}
              highlightColor="bg-yellow-300"
              scrollToHighlight={true}
              className="h-[400px]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <div className="max-w-6xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                <strong>Play the audio</strong> - Click the play button to start the YouTube audiobook
              </li>
              <li>
                <strong>Watch word highlighting</strong> - Words should highlight in yellow as they're spoken
              </li>
              <li>
                <strong>Click any word</strong> - The audio should immediately jump to that word
              </li>
              <li>
                <strong>Test reliability</strong> - Try jumping between different sections multiple times
              </li>
              <li>
                <strong>Check synchronization</strong> - The highlighted word should match what you hear
              </li>
            </ol>
            
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This test page demonstrates the word-level synchronization system 
                that will be integrated throughout the United Tribes platform. Every piece of content 
                will have this level of audio-text integration, enabling seamless navigation between 
                written and spoken words.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}