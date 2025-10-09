import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, Play, X, Video, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showAIDiscovery, setShowAIDiscovery] = useState(false);
  const [showVideoEmbed, setShowVideoEmbed] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [expandedPlaylists, setExpandedPlaylists] = useState<number[]>([]);
  const [selectedPlaylistIndices, setSelectedPlaylistIndices] = useState<number[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Array<{title: string, artist: string, playlistName: string, playlistIndex: number, songIndex: number}>>([]);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [combinedSongs, setCombinedSongs] = useState<Array<{title: string, artist: string, playlistName: string}>>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSongVideoId, setCurrentSongVideoId] = useState<string | null>(null);
  const hasShownNotificationRef = useRef(false);

  // Music playlists
  const musicPlaylists = [
    {
      name: "Johnny Cash at Folsom/San Quentin",
      songs: [
        { title: "Folsom Prison Blues", artist: "Johnny Cash" },
        { title: "I Walk the Line", artist: "Johnny Cash" },
        { title: "Ring of Fire", artist: "Johnny Cash" },
        { title: "A Boy Named Sue", artist: "Johnny Cash" }
      ]
    },
    {
      name: "Merle Haggard Classics",
      songs: [
        { title: "Mama Tried", artist: "Merle Haggard" },
        { title: "Okie from Muskogee", artist: "Merle Haggard" },
        { title: "Sing Me Back Home", artist: "Merle Haggard" },
        { title: "The Fugitive", artist: "Merle Haggard" }
      ]
    },
    {
      name: "George Jones Honky Tonk Classics",
      songs: [
        { title: "The Grand Tour", artist: "George Jones" },
        { title: "He Stopped Loving Her Today", artist: "George Jones" },
        { title: "White Lightning", artist: "George Jones" }
      ]
    },
    {
      name: "Bob Wills and Texas Playboys",
      songs: [
        { title: "San Antonio Rose", artist: "Bob Wills" },
        { title: "Faded Love", artist: "Bob Wills" },
        { title: "Take Me Back to Tulsa", artist: "Bob Wills" }
      ]
    }
  ];

  // Curated video playlist
  const discoveryVideos = [
    {
      id: 'NbovcK1HWfg',
      title: 'Merle on seeing Johnny Cash perform at San Quentin',
      description: '1981 interview about coming clean with his prison past'
    },
    {
      id: 'WQER0p0GlxE',
      title: 'Johnny Cash introduces Merle and his past',
      description: 'The moment that changed Merle\'s career'
    },
    {
      id: '7e2B-thaJG0',
      title: 'Johnny Cash performing at San Quentin',
      description: 'The legendary 1969 prison concert'
    }
  ];

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
    console.log('✅ Player ready at chapter start');
  }, []);

  // Fetch video ID when song changes in music player
  useEffect(() => {
    if (showMusicPlayer && combinedSongs.length > 0 && currentSongIndex >= 0) {
      const song = combinedSongs[currentSongIndex];
      const searchQuery = `${song.title} ${song.artist}`;

      console.log('🎵 Fetching video for:', searchQuery);
      setCurrentSongVideoId(null); // Show loading state

      fetch(`/api/youtube/search-track?song=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.videoId) {
            console.log('✅ Found video:', data.title, 'by', data.channel);
            setCurrentSongVideoId(data.videoId);
          } else {
            console.error('❌ No video found for:', searchQuery);
          }
        })
        .catch(err => {
          console.error('❌ Error fetching video:', err);
        });
    }
  }, [showMusicPlayer, combinedSongs, currentSongIndex]);

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
            <p className="text-xl text-gray-700 mb-2">
              Chapters {CHAPTER_NUMBER}-15: {CHAPTER_TITLE}
            </p>
            <Badge className="mt-2 bg-blue-600 text-white text-base px-3 py-1">
              25 minutes • Narrated by Merle Haggard
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowAIDiscovery(!showAIDiscovery)}
            >
              <Video className="mr-2 h-5 w-5" />
              🤖 AI Discovery
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg">
                <Home className="mr-2 h-5 w-5" />
                Home
              </Button>
            </Link>
          </div>
        </div>

        {/* AI Discovery Playlist */}
        {showAIDiscovery && (
          <Card className="mb-8 border-4 border-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-600 p-4 rounded-full">
                    <Video className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-purple-900 mb-1">
                      🤖 AI Discovery: The Prison Story
                    </h3>
                    <p className="text-xl text-purple-700">
                      Watch how Johnny Cash helped Merle embrace his past
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowAIDiscovery(false)}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-4"
                >
                  <X className="h-12 w-12 stroke-[3]" />
                </Button>
              </div>

              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                AI found 3 videos that tell the complete story of how Johnny Cash's advice
                transformed Merle's career and relationship with his prison past.
              </p>

              {/* Video Playlist */}
              <div className="space-y-3 mb-8">
                <h4 className="text-2xl font-bold text-purple-900">📺 Video Playlist</h4>
                {discoveryVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      setCurrentVideoIndex(index);
                      setShowVideoEmbed(true);
                      setShowAIDiscovery(false);
                      // Pause the audiobook
                      if (window.audioSync?.pauseVideo) {
                        window.audioSync.pauseVideo();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="bg-purple-600 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-base text-gray-600">
                          {video.description}
                        </p>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Play className="mr-2 h-4 w-4" />
                        Watch
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Music Playlists - Click to Toggle Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-2xl font-bold text-purple-900">🎵 Music Playlists</h4>
                  {(selectedPlaylistIndices.length > 0 || selectedSongs.length > 0) && (
                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        // Combine selected playlists and individual songs
                        const playlistSongs = selectedPlaylistIndices.flatMap(idx =>
                          musicPlaylists[idx].songs.map(song => ({
                            ...song,
                            playlistName: musicPlaylists[idx].name
                          }))
                        );
                        const individualSongs = selectedSongs.map(s => ({
                          title: s.title,
                          artist: s.artist,
                          playlistName: s.playlistName
                        }));
                        const allSongs = [...playlistSongs, ...individualSongs];
                        setCombinedSongs(allSongs);
                        setCurrentSongIndex(0);
                        setShowMusicPlayer(true);
                        setShowAIDiscovery(false);
                        if (window.audioSync?.pauseVideo) {
                          window.audioSync.pauseVideo();
                        }
                      }}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Play Selection ({selectedPlaylistIndices.length > 0 ? `${selectedPlaylistIndices.length} playlists` : ''}
                      {selectedPlaylistIndices.length > 0 && selectedSongs.length > 0 ? ', ' : ''}
                      {selectedSongs.length > 0 ? `${selectedSongs.length} songs` : ''})
                    </Button>
                  )}
                </div>

                {musicPlaylists.map((playlist, index) => {
                  const isExpanded = expandedPlaylists.includes(index);
                  const isSelected = selectedPlaylistIndices.includes(index);
                  return (
                    <div key={index} className={`bg-white border-2 rounded-lg transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-purple-200 hover:border-purple-300 hover:shadow'
                    }`}>
                      {/* Playlist Header - Click anywhere to select/deselect */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => {
                          // Toggle playlist selection
                          const isCurrentlySelected = selectedPlaylistIndices.includes(index);

                          if (isCurrentlySelected) {
                            // Deselecting playlist - remove all its songs from selectedSongs
                            setSelectedPlaylistIndices(prev => prev.filter(i => i !== index));
                            setSelectedSongs(prev => prev.filter(s => s.playlistIndex !== index));
                          } else {
                            // Selecting playlist - add all its songs to selectedSongs
                            setSelectedPlaylistIndices(prev => [...prev, index]);
                            const allSongsInPlaylist = playlist.songs.map((song, songIndex) => ({
                              ...song,
                              playlistName: playlist.name,
                              playlistIndex: index,
                              songIndex
                            }));
                            setSelectedSongs(prev => [...prev, ...allSongsInPlaylist]);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {/* Selection Indicator */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-purple-600' : 'bg-gray-200'
                          }`}>
                            {isSelected ? (
                              <span className="text-white text-2xl">✓</span>
                            ) : (
                              <span className="text-gray-400 text-xl font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className={`text-xl font-bold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                              {playlist.name}
                            </h5>
                            <p className="text-base text-gray-600">{playlist.songs.length} songs</p>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation(); // Don't trigger selection
                              setExpandedPlaylists(prev =>
                                prev.includes(index)
                                  ? prev.filter(i => i !== index)
                                  : [...prev, index]
                              );
                            }}
                            className="text-purple-600 text-base"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-5 w-5 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-5 w-5 mr-1" />
                                View
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Songs List - Individual Selection */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 border-t border-purple-200 pt-3">
                          {playlist.songs.map((song, songIndex) => {
                            const songId = { playlistIndex: index, songIndex };
                            const isSongSelected = selectedSongs.some(
                              s => s.playlistIndex === index && s.songIndex === songIndex
                            );
                            return (
                              <div
                                key={songIndex}
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                  isSongSelected
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-purple-200 bg-white hover:border-purple-300'
                                }`}
                                onClick={() => {
                                  // Toggle individual song selection
                                  const exists = selectedSongs.some(
                                    s => s.playlistIndex === index && s.songIndex === songIndex
                                  );

                                  if (exists) {
                                    // Unchecking a song - remove it and uncheck the playlist if it was checked
                                    setSelectedSongs(prev => prev.filter(
                                      s => !(s.playlistIndex === index && s.songIndex === songIndex)
                                    ));
                                    // If playlist was selected, deselect it
                                    setSelectedPlaylistIndices(prev => prev.filter(i => i !== index));
                                  } else {
                                    // Checking a song - add it
                                    setSelectedSongs(prev => [...prev, {
                                      ...song,
                                      playlistName: playlist.name,
                                      playlistIndex: index,
                                      songIndex
                                    }]);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isSongSelected ? 'bg-purple-600' : 'bg-gray-200'
                                  }`}>
                                    {isSongSelected ? (
                                      <span className="text-white text-sm">✓</span>
                                    ) : (
                                      <Badge className="bg-purple-600 text-white text-sm">
                                        {songIndex + 1}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h6 className="text-lg font-bold text-gray-900">{song.title}</h6>
                                    <p className="text-base text-gray-600">{song.artist}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowAIDiscovery(false)}
                  className="text-lg"
                >
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Embed */}
        {showVideoEmbed && (
          <Card className="mb-8 border-4 border-green-500 bg-black shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                      {currentVideoIndex + 1} of {discoveryVideos.length}
                    </Badge>
                    <p className="text-green-400 text-sm">🤖 AI-Curated Discovery</p>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {discoveryVideos[currentVideoIndex].title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {discoveryVideos[currentVideoIndex].description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowVideoEmbed(false)}
                  className="text-white hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="aspect-video">
                <iframe
                  key={discoveryVideos[currentVideoIndex].id}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${discoveryVideos[currentVideoIndex].id}`}
                  title={discoveryVideos[currentVideoIndex].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={() => {
                    setShowVideoEmbed(false);
                    setShowAIDiscovery(true);
                  }}
                >
                  ← Back to Playlist
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => setCurrentVideoIndex(Math.max(0, currentVideoIndex - 1))}
                    disabled={currentVideoIndex === 0}
                  >
                    ← Previous
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white text-black hover:bg-gray-200"
                    onClick={() => setCurrentVideoIndex(Math.min(discoveryVideos.length - 1, currentVideoIndex + 1))}
                    disabled={currentVideoIndex === discoveryVideos.length - 1}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Music Player with Playlist */}
        {showMusicPlayer && combinedSongs.length > 0 && (
          <Card className="mb-8 border-4 border-purple-500 bg-white shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                      {currentSongIndex + 1} of {combinedSongs.length}
                    </Badge>
                    <p className="text-purple-600 text-sm">🎵 Now Playing</p>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {combinedSongs[currentSongIndex].title}
                  </h3>
                  <p className="text-gray-600 text-base">
                    {combinedSongs[currentSongIndex].artist}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    From: {combinedSongs[currentSongIndex].playlistName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowMusicPlayer(false)}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-4"
                >
                  <X className="h-12 w-12 stroke-[3]" />
                </Button>
              </div>

              {/* Embedded Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {currentSongVideoId ? (
                  <iframe
                    key={`song-${currentSongIndex}`}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${currentSongVideoId}?autoplay=1`}
                    title={combinedSongs[currentSongIndex].title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Loading video...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mb-4 gap-4">
                <Button
                  variant="outline"
                  className="text-xl font-semibold px-8 py-6"
                  onClick={() => setCurrentSongIndex(Math.max(0, currentSongIndex - 1))}
                  disabled={currentSongIndex === 0}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  className="text-xl font-semibold px-8 py-6"
                  onClick={() => setCurrentSongIndex(Math.min(combinedSongs.length - 1, currentSongIndex + 1))}
                  disabled={currentSongIndex === combinedSongs.length - 1}
                >
                  Next →
                </Button>
              </div>

              {/* Combined Playlist */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Now Playing</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {combinedSongs.map((song, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        idx === currentSongIndex
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-white border border-gray-200 hover:bg-purple-50'
                      }`}
                      onClick={() => setCurrentSongIndex(idx)}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={`text-base ${idx === currentSongIndex ? 'bg-purple-600' : 'bg-gray-400'}`}>
                          {idx + 1}
                        </Badge>
                        <div className="flex-1">
                          <h5 className={`text-lg font-semibold ${idx === currentSongIndex ? 'text-purple-900' : 'text-gray-900'}`}>
                            {song.title}
                          </h5>
                          <p className="text-base text-gray-600">{song.artist}</p>
                          <p className="text-sm text-purple-600">{song.playlistName}</p>
                        </div>
                        {idx === currentSongIndex && <Play className="h-6 w-6 text-purple-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  startTime={CHAPTER_START}
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
                <p className="text-base text-gray-600">Playlists & entities from this chapter</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Entities */}
                  <div>
                    <h3 className="font-bold text-xl mb-3 text-purple-900">Key People & Places</h3>
                    <div className="space-y-2">
                      <div
                        className="p-3 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('Johnny Cash', 'person')}
                      >
                        <span className="font-semibold text-base">Johnny Cash</span>
                        <span className="text-base text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-3 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('June Carter Cash', 'person')}
                      >
                        <span className="font-semibold text-base">June Carter Cash</span>
                        <span className="text-base text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-3 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('George Jones', 'person')}
                      >
                        <span className="font-semibold text-base">George Jones</span>
                        <span className="text-base text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-3 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('Bob Wills', 'person')}
                      >
                        <span className="font-semibold text-base">Bob Wills</span>
                        <span className="text-base text-gray-600 ml-2">• Person</span>
                      </div>
                      <div
                        className="p-3 bg-purple-50 rounded hover:bg-purple-100 cursor-pointer transition-colors"
                        onClick={() => handleDiscoveryClick('San Quentin State Prison', 'place')}
                      >
                        <span className="font-semibold text-base">San Quentin</span>
                        <span className="text-base text-gray-600 ml-2">• Place</span>
                      </div>
                    </div>
                  </div>

                  {/* Discovery Playlists */}
                  <div>
                    <h3 className="font-bold text-xl mb-3 text-purple-900">Music Playlists</h3>
                    <div className="space-y-3">
                      {musicPlaylists.map((playlist, index) => (
                        <div
                          key={index}
                          className="border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-lg cursor-pointer transition-all bg-gradient-to-r from-purple-50 to-pink-50"
                          onClick={() => {
                            setShowAIDiscovery(true);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-lg text-purple-900 mb-1">{playlist.name}</h4>
                              <p className="text-sm text-gray-600">{playlist.songs.length} songs</p>
                            </div>
                            <Play className="h-8 w-8 text-purple-600" />
                          </div>
                        </div>
                      ))}
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
