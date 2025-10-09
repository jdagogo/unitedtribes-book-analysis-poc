import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Play } from 'lucide-react';
import { Link } from 'wouter';
import { YouTubePlayerSimple } from '@/components/youtube-player-simple';
import { SynchronizedTranscript } from '@/components/synchronized-transcript';
import { DiscoveryModal } from '@/components/discovery-modal';

// Chapters 14-15 data (extended for more entities)
// Starting from "I'd done everything I could do to keep my past quiet"
const CHAPTER_START = 11363; // 3:09:23
const CHAPTER_END = 12900; // 3:35:00
const VIDEO_ID = 'PSN8N2v4oq0';
const CHAPTER_NUMBER = 14;
const CHAPTER_TITLE = "Music Career Begins";
const START_WORD_INDEX = 30300;
const END_WORD_INDEX = 34192;

interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

export default function AudiobookPage() {
  const [transcriptWords, setTranscriptWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalEntityType, setModalEntityType] = useState<'person' | 'work' | 'place' | 'organization' | 'song'>('person');

  // Use refs to maintain handler persistence and avoid stale closures
  const wordClickHandlerRef = useRef<(wordIndex: number, timestamp: number) => void>();
  const transcriptWordsRef = useRef<Word[]>([]);
  const currentWordIndexRef = useRef(-1);

  // Keep refs in sync with state
  useEffect(() => {
    transcriptWordsRef.current = transcriptWords;
  }, [transcriptWords]);

  useEffect(() => {
    currentWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex]);

  // Load transcript data for Chapters 14-15
  useEffect(() => {
    fetch('/transcript-PSN8N2v4oq0.json')
      .then(res => res.json())
      .then(data => {
        // Extract words for Chapters 14-15 and add index field
        const chapterWords = data.words
          .slice(START_WORD_INDEX, END_WORD_INDEX)
          .map((word: Word, idx: number) => ({
            ...word,
            index: idx
          }));
        setTranscriptWords(chapterWords);
        setIsLoading(false);
        console.log('✅ Loaded', chapterWords.length, 'words for Chapters 14-15');
      })
      .catch(err => {
        console.error('Failed to load transcript:', err);
        setIsLoading(false);
      });
  }, []);

  // Handle time updates from player
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);

    const words = transcriptWordsRef.current;
    const currentIdx = currentWordIndexRef.current;

    // Debug: Log every 10th update
    if (Math.random() < 0.1) {
      console.log(`⏱️ Time update: ${time.toFixed(1)}s, Words: ${words.length}, First word start: ${words[0]?.start}, Last word end: ${words[words.length - 1]?.end}`);
    }

    if (words.length === 0) {
      return;
    }

    // Only highlight if we're within the chapter time range
    if (time < CHAPTER_START || time > CHAPTER_END) {
      if (Math.random() < 0.05) {
        console.log(`⚠️ Time ${time.toFixed(1)}s outside chapter range ${CHAPTER_START}-${CHAPTER_END}`);
      }
      return;
    }

    // Find current word index with tolerance and lookahead
    // Use larger tolerance and lookahead to compensate for player lag
    const tolerance = 0.3; // 300ms tolerance
    const lookahead = 0.05; // Look ahead 50ms to compensate for lag
    const adjustedTime = time + lookahead;

    let foundIndex = -1;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Check if we're within this word's timeframe (with tolerance and lookahead)
      if (adjustedTime >= (word.start - tolerance) && adjustedTime <= (word.end + tolerance)) {
        foundIndex = i;
        break;
      }

      // If we're past this word but before the next, stay on this word
      if (adjustedTime >= word.end && i < words.length - 1) {
        const nextWord = words[i + 1];
        if (adjustedTime < nextWord.start) {
          foundIndex = i;
          break;
        }
      }
    }

    if (foundIndex !== -1 && foundIndex !== currentIdx) {
      setCurrentWordIndex(foundIndex);
      console.log(`🔆 Word ${foundIndex}: "${words[foundIndex]?.word}" at ${time.toFixed(1)}s (adjusted: ${adjustedTime.toFixed(1)}s)`);
    }
  }, []);

  // Set up word click handler
  useEffect(() => {
    wordClickHandlerRef.current = (wordIndex: number, timestamp: number) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 Word clicked:', wordIndex, 'at', timestamp, 's');
      console.log('🎯 Word text:', transcriptWordsRef.current[wordIndex]?.word);

      // Seek 1 second before the clicked word for context
      const seekTime = Math.max(CHAPTER_START, timestamp - 1);
      console.log('⏪ Seeking to:', seekTime, 's (1s before word)');

      // Use the global audioSync interface
      if (window.audioSync) {
        console.log('✅ audioSync available');

        if (typeof window.audioSync.seekTo === 'function') {
          console.log('⏩ Calling seekTo...');
          const result = window.audioSync.seekTo(seekTime);
          console.log('⏩ seekTo result:', result);

          if (typeof window.audioSync.playVideo === 'function') {
            window.audioSync.playVideo();
          }
        } else {
          console.error('❌ seekTo function not available');
        }
      } else {
        console.error('❌ audioSync not available');
        console.error('🔍 Available on window:', Object.keys(window).filter(k => k.includes('audio')));
      }
    };
  }, []);

  const handleWordClick = useCallback((wordIndex: number, timestamp: number) => {
    if (wordClickHandlerRef.current) {
      wordClickHandlerRef.current(wordIndex, timestamp);
    }
  }, []);

  const handlePlayerReady = useCallback(() => {
    console.log('✅ Player ready - seeking to chapter start');
    // Seek to chapter start when player is ready
    if (window.audioSync && typeof window.audioSync.seekTo === 'function') {
      window.audioSync.seekTo(CHAPTER_START);
    }
  }, []);

  // Handle discovery item clicks
  const handleDiscoveryClick = useCallback((query: string, type: 'person' | 'work' | 'place' | 'organization' | 'song' = 'person') => {
    console.log('🔍 Discovery clicked:', query, type);
    setModalSearchQuery(query);
    setModalEntityType(type);
    setModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My House of Memories
            </h1>
            <p className="text-xl text-gray-700">
              Chapters {CHAPTER_NUMBER}-15: {CHAPTER_TITLE}
            </p>
            <Badge className="mt-2 bg-blue-600 text-white">
              25 minutes • Narrated by Merle Haggard
            </Badge>
          </div>
          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Audio Player & Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-2xl">Audio Player</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <YouTubePlayerSimple
                  videoId={VIDEO_ID}
                  onTimeUpdate={handleTimeUpdate}
                  onReady={handlePlayerReady}
                />
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card className="border-2 border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-2xl">Interactive Transcript</CardTitle>
                <p className="text-sm text-gray-600">Click any word to jump to that moment</p>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading transcript...</p>
                  </div>
                ) : (
                  <SynchronizedTranscript
                    text=""
                    wordTimestamps={transcriptWords}
                    currentWordIndex={currentWordIndex}
                    onWordClick={handleWordClick}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Discovery Panel */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-purple-300 sticky top-8">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="text-2xl">Contextual Discovery</CardTitle>
                <p className="text-sm text-gray-600">Playlists & entities from this chapter</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Entities */}
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-purple-900">Key People & Places</h3>
                    <div className="space-y-2">
                      <div
                        className="p-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('Johnny Cash', 'person')}
                      >
                        <span className="font-semibold">Johnny Cash</span>
                        <span className="text-sm text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('June Carter Cash', 'person')}
                      >
                        <span className="font-semibold">June Carter Cash</span>
                        <span className="text-sm text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('George Jones', 'person')}
                      >
                        <span className="font-semibold">George Jones</span>
                        <span className="text-sm text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('Bob Wills', 'person')}
                      >
                        <span className="font-semibold">Bob Wills</span>
                        <span className="text-sm text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-2 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('San Quentin State Prison', 'place')}
                      >
                        <span className="font-semibold">San Quentin</span>
                        <span className="text-sm text-gray-600 ml-2">• Place</span>
                      </div>
                    </div>
                  </div>

                  {/* Discovery Playlists */}
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-purple-900">Discovery Playlists</h3>
                    <div className="space-y-4">
                      {/* Johnny Cash Playlist */}
                      <div className="border border-purple-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">Johnny Cash at Folsom/San Quentin</h4>
                        <div className="space-y-1 text-sm">
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('Folsom Prison Blues Johnny Cash', 'song')}
                          >
                            • Folsom Prison Blues
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('I Walk the Line Johnny Cash', 'song')}
                          >
                            • I Walk the Line
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('Ring of Fire Johnny Cash', 'song')}
                          >
                            • Ring of Fire
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('A Boy Named Sue Johnny Cash', 'song')}
                          >
                            • A Boy Named Sue
                          </div>
                        </div>
                      </div>

                      {/* George Jones Playlist */}
                      <div className="border border-purple-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">George Jones Honky Tonk Classics</h4>
                        <div className="space-y-1 text-sm">
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('The Grand Tour George Jones', 'song')}
                          >
                            • The Grand Tour
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('He Stopped Loving Her Today George Jones', 'song')}
                          >
                            • He Stopped Loving Her Today
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('White Lightning George Jones', 'song')}
                          >
                            • White Lightning
                          </div>
                        </div>
                      </div>

                      {/* Bob Wills Playlist */}
                      <div className="border border-purple-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">Bob Wills and Texas Playboys</h4>
                        <div className="space-y-1 text-sm">
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('San Antonio Rose Bob Wills', 'song')}
                          >
                            • San Antonio Rose
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('Faded Love Bob Wills', 'song')}
                          >
                            • Faded Love
                          </div>
                          <div
                            className="text-gray-700 hover:text-purple-700 cursor-pointer transition-colors"
                            onClick={() => handleDiscoveryClick('Take Me Back to Tulsa Bob Wills', 'song')}
                          >
                            • Take Me Back to Tulsa
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chapter Info */}
        <Card className="mt-8 border-2 border-amber-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-3">About These Chapters</h3>
            <p className="text-gray-700 mb-4">
              Merle's music career begins and his personal life evolves. Chapter 14 covers playing in bands with Wynn Stewart,
              performing in Las Vegas at the Blackboard Club, and the unforgettable moment he first
              heard his own record on the radio. Chapter 15 explores his marriage troubles and continued musical journey.
              Rich with musical entities, venues, people, and career milestones.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="font-bold text-2xl text-blue-900">25:00</p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="font-bold text-2xl text-green-900">3,892</p>
                <p className="text-sm text-gray-600">Words</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="font-bold text-2xl text-purple-900">Chapters 14-15</p>
                <p className="text-sm text-gray-600">of 18</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discovery Modal */}
      <DiscoveryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        searchQuery={modalSearchQuery}
        entityType={modalEntityType}
      />
    </div>
  );
}
