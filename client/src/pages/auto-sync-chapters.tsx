import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { YouTubePlayerSimple } from '@/components/youtube-player-simple';
import { SynchronizedTranscript } from '@/components/synchronized-transcript';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Home, ChevronLeft, ChevronRight, List, BookOpen, 
  Clock, FileAudio, Play, Pause, SkipForward 
} from 'lucide-react';
import { Link } from 'wouter';
import { ManualTestConsole } from '@/components/manual-test-console';

// URLs for data files
const TRANSCRIPT_URL = '/transcript-PSN8N2v4oq0.json';
const CHAPTERS_URL = '/authentic-chapters-PSN8N2v4oq0.json';  // Using authentic book structure

interface Chapter {
  id: string;
  number: number;
  title: string;
  description?: string;
  start_time: number;
  end_time: number;
  start_word_index: number;
  end_word_index: number;
  word_count: number;
  duration_minutes: number;
  preview: string;
  progress_percentage: number;
}

interface ChapterData {
  title: string;
  subtitle?: string;
  author: string;
  coauthor?: string;
  narrator: string;
  publisher?: string;
  total_duration_hours: number;
  total_words: number;
  chapter_count: number;
  chapters: Chapter[];
  metadata?: any;
}

export default function AutoSyncChaptersPage() {
  const [wordTimestamps, setWordTimestamps] = useState<any[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHighlightingActive, setIsHighlightingActive] = useState(true);
  
  // Use refs to maintain handler persistence
  const wordClickHandlerRef = useRef<(wordIndex: number, timestamp: number) => void>();
  const [fullText, setFullText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [showChapterList, setShowChapterList] = useState(false);
  const [activeTab, setActiveTab] = useState('player');
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load transcript and chapter data on mount
  useEffect(() => {
    console.log('Starting to load transcript and chapters...');
    console.log('Transcript URL:', TRANSCRIPT_URL);
    console.log('Chapters URL:', CHAPTERS_URL);
    
    Promise.all([
      fetch(TRANSCRIPT_URL).then(res => {
        console.log('Transcript response status:', res.status);
        if (!res.ok) throw new Error(`Failed to load transcript: ${res.status}`);
        return res.json();
      }),
      fetch(CHAPTERS_URL).then(res => {
        console.log('Chapters response status:', res.status);
        if (!res.ok) throw new Error(`Failed to load chapters: ${res.status}`);
        return res.json();
      })
    ])
      .then(([transcript, chapters]) => {
        console.log('Data loaded successfully!');
        console.log('Transcript words:', transcript.words?.length);
        console.log('Chapters count:', chapters.chapters?.length);
        
        setTranscriptData(transcript);
        setChapterData(chapters);
        
        // Convert transcript to word timestamps
        const formattedWords = transcript.words.map((word: any, index: number) => ({
          word: word.word,
          start: word.start,
          end: word.end,
          index: index
        }));
        
        console.log('Formatted words:', formattedWords.length);
        setWordTimestamps(formattedWords);
        setFullText(transcript.full_text || formattedWords.map((w: any) => w.word).join(' '));
        
        // Set initial chapter
        if (chapters.chapters && chapters.chapters.length > 0) {
          console.log('Setting initial chapter:', chapters.chapters[0].title);
          setCurrentChapter(chapters.chapters[0]);
        }
        
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        console.error('Error details:', err.message);
        setLoadError(err.message || 'Failed to load audiobook data');
        setIsLoading(false);
      });
  }, []);

  // Update current chapter AND word index based on playback time
  useEffect(() => {
    if (!chapterData || !chapterData.chapters) return;
    
    // Find current chapter
    const chapter = chapterData.chapters.find(
      ch => currentTime >= ch.start_time && currentTime < ch.end_time
    );
    
    if (chapter && chapter.id !== currentChapter?.id) {
      setCurrentChapter(chapter);
    }
    
    // Calculate chapter progress
    if (chapter) {
      const chapterElapsed = currentTime - chapter.start_time;
      const chapterDuration = chapter.end_time - chapter.start_time;
      setChapterProgress((chapterElapsed / chapterDuration) * 100);
    }
    
    // CRITICAL: Find and highlight current word based on playback time with tolerance
    if (isHighlightingActive && wordTimestamps.length > 0) {
      // Add tolerance for gaps between words
      const tolerance = 0.2; // 200ms tolerance for word boundaries
      let currentWord = -1;
      
      // Find the word that best matches current time
      for (let i = 0; i < wordTimestamps.length; i++) {
        const word = wordTimestamps[i];
        if (currentTime >= (word.start - tolerance) && currentTime <= (word.end + tolerance)) {
          currentWord = i;
          break;
        }
        // If we're past this word but before the next, stay on this word
        if (currentTime >= word.end && i < wordTimestamps.length - 1) {
          const nextWord = wordTimestamps[i + 1];
          if (currentTime < nextWord.start) {
            currentWord = i;
            break;
          }
        }
      }
      
      if (currentWord !== -1 && currentWord !== currentWordIndex) {
        setCurrentWordIndex(currentWord);
        console.log(`🔆 [HIGHLIGHT] Word ${currentWord}: "${wordTimestamps[currentWord]?.word}" at ${currentTime.toFixed(1)}s`);
      }
    }
  }, [currentTime, chapterData, currentChapter, wordTimestamps, currentWordIndex, isHighlightingActive]);
  
  // Check for player readiness and handle pending seeks
  useEffect(() => {
    if (pendingSeek !== null) {
      const checkInterval = setInterval(() => {
        if (window.audioSync && window.audioSync.seekTo) {
          console.log('Player now ready, executing pending seek to:', pendingSeek);
          window.audioSync.seekTo(pendingSeek);
          setPendingSeek(null);
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Clear after 5 seconds to prevent infinite checking
      setTimeout(() => clearInterval(checkInterval), 5000);
      
      return () => clearInterval(checkInterval);
    }
  }, [pendingSeek]);

  // Jump to chapter - SIMPLIFIED AND TESTED
  const jumpToChapter = (chapter: Chapter) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📖 [CHAPTER CLICK] Chapter ${chapter.number}: ${chapter.title}`);
    console.log(`⏱️ [CHAPTER CLICK] Seeking to ${chapter.start_time} seconds`);
    
    // Update UI
    setCurrentChapter(chapter);
    setShowChapterList(false);
    setActiveTab('player');
    setCurrentWordIndex(chapter.start_word_index);
    
    // Attempt seek
    if (window.audioSync && window.audioSync.seekTo) {
      const result = window.audioSync.seekTo(chapter.start_time);
      if (result) {
        console.log('✅ [CHAPTER CLICK] Seek command executed successfully');
      } else {
        console.error('❌ [CHAPTER CLICK] Seek command failed');
      }
    } else {
      console.error('❌ [CHAPTER CLICK] window.audioSync not available');
      // Retry after delay
      setTimeout(() => {
        if (window.audioSync && window.audioSync.seekTo) {
          console.log('🔄 [CHAPTER CLICK] Retrying seek...');
          window.audioSync.seekTo(chapter.start_time);
        }
      }, 1000);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  // Navigate chapters with enhanced debugging
  const goToPreviousChapter = () => {
    console.log('[NAV ARROW] Previous button clicked');
    if (!currentChapter || !chapterData) {
      console.error('[NAV ARROW] Missing data:', { currentChapter, chapterData });
      return;
    }
    
    const prevIndex = currentChapter.number - 2;
    const prevChapter = chapterData.chapters[prevIndex];
    console.log('[NAV ARROW] Current chapter:', currentChapter.number, 'Going to:', prevIndex + 1);
    
    if (prevChapter) {
      console.log('[NAV ARROW] Found previous chapter:', prevChapter.title);
      jumpToChapter(prevChapter);
    } else {
      console.warn('[NAV ARROW] No previous chapter available');
    }
  };

  const goToNextChapter = () => {
    console.log('[NAV ARROW] Next button clicked');
    if (!currentChapter || !chapterData) {
      console.error('[NAV ARROW] Missing data:', { currentChapter, chapterData });
      return;
    }
    
    const nextIndex = currentChapter.number;
    const nextChapter = chapterData.chapters[nextIndex];
    console.log('[NAV ARROW] Current chapter:', currentChapter.number, 'Going to:', nextIndex + 1);
    
    if (nextChapter) {
      console.log('[NAV ARROW] Found next chapter:', nextChapter.title);
      jumpToChapter(nextChapter);
    } else {
      console.warn('[NAV ARROW] No next chapter available');
    }
  };

  // Set up word click handler with ref for persistence
  useEffect(() => {
    wordClickHandlerRef.current = (wordIndex: number, timestamp: number) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 [WORD CLICK] Word at index ${wordIndex} clicked`);
      console.log(`⏱️ [WORD CLICK] Seeking to ${timestamp} seconds`);
      
      // Update UI immediately
      setCurrentWordIndex(wordIndex);
      setCurrentTime(timestamp);
      setIsHighlightingActive(false);
      
      // Direct seek with retry
      let retries = 0;
      const trySeek = () => {
        if (window.audioSync && window.audioSync.seekTo) {
          const result = window.audioSync.seekTo(timestamp);
          console.log(result ? '✅ [WORD CLICK] Seek successful' : '⚠️ [WORD CLICK] Seek failed');
          setTimeout(() => setIsHighlightingActive(true), 300);
        } else if (retries < 3) {
          retries++;
          console.log(`🔄 [WORD CLICK] Retry ${retries}/3`);
          setTimeout(trySeek, 200);
        } else {
          console.error('❌ [WORD CLICK] Failed after 3 retries');
          setIsHighlightingActive(true);
        }
      };
      trySeek();
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    };
  }, []);
  
  // Stable handler that uses the ref
  const handleWordClick = useCallback((wordIndex: number, timestamp: number) => {
    if (wordClickHandlerRef.current) {
      wordClickHandlerRef.current(wordIndex, timestamp);
    }
  }, []);

  // Get chapter-specific transcript - memoized to prevent re-renders
  const chapterTranscript = useMemo(() => {
    if (!currentChapter || !wordTimestamps.length) return '';
    const chapterWords = wordTimestamps.slice(
      currentChapter.start_word_index,
      currentChapter.end_word_index
    );
    return chapterWords.map(w => w.word).join(' ');
  }, [currentChapter, wordTimestamps]);
  
  // Memoized chapter word timestamps
  const chapterWordTimestamps = useMemo(() => {
    if (!currentChapter || !wordTimestamps.length) return [];
    return wordTimestamps.slice(
      currentChapter.start_word_index,
      currentChapter.end_word_index
    );
  }, [currentChapter, wordTimestamps]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card>
          <CardContent className="p-8">
            <p className="text-gray-600">Loading audiobook data...</p>
            <p className="text-xs text-gray-500 mt-2">Fetching transcript and chapters...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Audiobook</h2>
            <p className="text-gray-600 mb-4">{loadError}</p>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono">
              <p>Transcript URL: {TRANSCRIPT_URL}</p>
              <p>Chapters URL: {CHAPTERS_URL}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Manual Test Console - provides test functions in browser console */}
      <ManualTestConsole />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {chapterData?.title || 'Audiobook'}
                  {chapterData?.subtitle && (
                    <span className="text-lg font-normal text-slate-600 ml-2">
                      {chapterData.subtitle}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-600">
                  by {chapterData?.author}
                  {chapterData?.coauthor && ` with ${chapterData.coauthor}`}
                  {' • '}
                  Narrated by {chapterData?.narrator}
                  {chapterData?.publisher && ` • ${chapterData.publisher}`}
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chapter Info Bar */}
      {currentChapter && (
        <div className="bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousChapter}
                  disabled={currentChapter.number === 1}
                  className="text-white hover:bg-indigo-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="font-semibold">
                    Chapter {currentChapter.number}: {currentChapter.title}
                  </p>
                  <p className="text-sm opacity-90">
                    {currentChapter.duration_minutes.toFixed(1)} minutes • {currentChapter.word_count.toLocaleString()} words
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextChapter}
                  disabled={!chapterData || currentChapter.number === chapterData.chapter_count}
                  className="text-white hover:bg-indigo-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Toggling chapter list:', !showChapterList);
                  if (!showChapterList) {
                    setActiveTab('chapters');
                  } else {
                    setActiveTab('player');
                  }
                  setShowChapterList(!showChapterList);
                }}
                className="text-white hover:bg-indigo-700"
              >
                <List className="h-4 w-4 mr-2" />
                {showChapterList ? 'Hide Chapters' : 'All Chapters'}
              </Button>
            </div>
            {/* Chapter Progress */}
            <div className="mt-2">
              <Progress value={chapterProgress} className="h-1 bg-indigo-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="player">Player</TabsTrigger>
            <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
          </TabsList>

          {/* Player Tab */}
          <TabsContent value="player" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Audio Player */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <YouTubePlayerSimple
                    videoId="PSN8N2v4oq0"
                    onTimeUpdate={setCurrentTime}
                    onReady={() => {
                      console.log('✅ [CHAPTERS PAGE] Player ready callback received');
                    }}
                  />
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Time:</span>
                      <span className="font-mono">{(currentTime / 60).toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Current Word:</span>
                      <span className="font-mono">
                        {currentWordIndex >= 0 && wordTimestamps[currentWordIndex] 
                          ? wordTimestamps[currentWordIndex].word 
                          : 'Ready'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chapter Transcript */}
              <Card>
                <CardHeader>
                  <CardTitle>Chapter Text</CardTitle>
                  <p className="text-sm text-gray-600">
                    Click any word to jump to that point
                  </p>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <SynchronizedTranscript
                      text={chapterTranscript}
                      wordTimestamps={chapterWordTimestamps}
                      currentWordIndex={
                        currentChapter && currentWordIndex >= currentChapter.start_word_index
                          ? currentWordIndex - currentChapter.start_word_index
                          : -1
                      }
                      onWordClick={handleWordClick}
                      highlightColor="bg-yellow-300"
                      scrollToHighlight={true}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Full Transcript Tab */}
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Complete Transcript</CardTitle>
                <p className="text-sm text-gray-600">
                  {transcriptData?.word_count.toLocaleString()} words • Click any word to jump
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <SynchronizedTranscript
                    text={fullText}
                    wordTimestamps={wordTimestamps}
                    currentWordIndex={currentWordIndex}
                    onWordClick={handleWordClick}
                    highlightColor="bg-yellow-300"
                    scrollToHighlight={true}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <div className="grid gap-4">
              {chapterData?.chapters.map((chapter) => (
                <Card 
                  key={chapter.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    currentChapter?.id === chapter.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => {
                    console.log(`🖱️ [CLICK] Chapter card ${chapter.number} clicked`);
                    jumpToChapter(chapter);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          Chapter {chapter.number}: {chapter.title}
                        </h3>
                        {chapter.description && (
                          <p className="text-sm text-indigo-600 font-medium mt-1 mb-2">
                            {chapter.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {chapter.preview}
                        </p>
                        <div className="flex gap-4 mt-2">
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {chapter.duration_minutes.toFixed(1)} min
                          </Badge>
                          <Badge variant="outline">
                            {chapter.word_count.toLocaleString()} words
                          </Badge>
                          <Badge variant="outline">
                            {(chapter.start_time / 60).toFixed(1)} - {(chapter.end_time / 60).toFixed(1)} min
                          </Badge>
                        </div>
                      </div>
                      {currentChapter?.id === chapter.id && (
                        <Badge className="bg-green-600">
                          <Play className="h-3 w-3 mr-1" />
                          Playing
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}