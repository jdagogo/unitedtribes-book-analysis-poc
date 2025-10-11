import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, ArrowLeft, Search, Home } from 'lucide-react';
import { Link } from 'wouter';
import TextSelectionModal from './text-selection-modal';
import BookSearch from './book-search';
import VideoModal from './video-modal';
import DiscoveryPlaylist from './DiscoveryPlaylist';
import TimelineDiscoveryFeed from './TimelineDiscoveryFeed';
import { findBookTitles } from '../data/book-titles-fuzzy';
import { findAuthors } from '../data/author-recognition';
import '../styles/literary-highlighting.css';
import '../styles/entity-spacing-fix.css';
import '../styles/book-search.css';
import '../styles/entity-highlighting.css';
import '../styles/author-highlighting.css';
import '../styles/video-link.css';
import blueNoteData from '../data/blue-note-cover-art.json';

interface BookPage {
  pageNumber: number;
  content: string;
  chapter: string;
  chapterTitle: string;
  wordCount: number;
}

interface PaginatedBookViewerProps {
  transcriptId: string;
}

// Book structure with actual page numbers and ranges
const BOOK_STRUCTURE = [
  { 
    title: "Foreword", 
    startPage: -1, // XI in roman numerals
    endPage: -1,
    romanNumeral: "XI"
  },
  { 
    title: "Monday's Children", 
    startPage: 1, 
    endPage: 32 
  },
  { 
    title: "Just Kids", 
    startPage: 33, 
    endPage: 88 
  },
  { 
    title: "Hotel Chelsea", 
    startPage: 89, 
    endPage: 210 
  },
  { 
    title: "Separate Ways Together", 
    startPage: 211, 
    endPage: 260 
  },
  { 
    title: "Holding Hands with God", 
    startPage: 261, 
    endPage: 284 
  },
  { 
    title: "A Note to the Reader", 
    startPage: 285, 
    endPage: 300 // Approximate end
  }
];

const WORDS_PER_PAGE = 250; // Slightly fewer words per page for larger font

export const PaginatedBookViewer: React.FC<PaginatedBookViewerProps> = ({ transcriptId }) => {
  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [jumpToPage, setJumpToPage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<{ 
    name: string; 
    type: string; 
    mentions: Array<{ page: number; chapter: string; context: string }>;
    culturalContext?: any;
  } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedSearchTerm, setHighlightedSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Clear search state when page changes
  useEffect(() => {
    setAiQuery('');
    setSearchResults([]);
    setSearchError(null);
    setSelectedVideo(null);
  }, [currentPageIndex]);
  const [videoEmbedHtml, setVideoEmbedHtml] = useState<string>('');
  const [savedVideoEmbedHtml, setSavedVideoEmbedHtml] = useState<string>(''); // Store video HTML before playlist
  const [videoPlaylistData, setVideoPlaylistData] = useState<any>(null);
  const [showPlaylistView, setShowPlaylistView] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [showPlaylistPlayer, setShowPlaylistPlayer] = useState(false);

  // Discovery panel state for page 15
  const [discoveryTab, setDiscoveryTab] = useState<'featured' | 'read' | 'watch' | 'music' | 'explorer'>('featured');
  const [discoveryPanelExpanded, setDiscoveryPanelExpanded] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<any[]>([]);
  const [selectedDiscoveryIndex, setSelectedDiscoveryIndex] = useState(0);

  // Album cover audio player state
  const [isAlbumAudioPlaying, setIsAlbumAudioPlaying] = useState(false);
  const albumAudioIframeRef = useRef<HTMLIFrameElement>(null);

  // Discovery panel state for page 4
  const [page4DiscoveryExpanded, setPage4DiscoveryExpanded] = useState(false);
  const [page4PreloadedVideos, setPage4PreloadedVideos] = useState<any[]>([]);
  const [page1DiscoveryExpanded, setPage1DiscoveryExpanded] = useState(false);
  const [page1PreloadedVideos, setPage1PreloadedVideos] = useState<any[]>([]);
  const [page17DiscoveryExpanded, setPage17DiscoveryExpanded] = useState(false);
  const [defaultDiscoveryExpanded, setDefaultDiscoveryExpanded] = useState(false);
  const [defaultDiscoveryTab, setDefaultDiscoveryTab] = useState<'music'>('music');
  const [page9PreloadedVideos, setPage9PreloadedVideos] = useState<any[]>([]);

  // Book modal state
  const [showBookModal, setShowBookModal] = useState(false);
  const [currentBookUrl, setCurrentBookUrl] = useState('');
  const [currentBookId, setCurrentBookId] = useState('');
  const [bookModalVideoHtml, setBookModalVideoHtml] = useState('');
  const [bookModalVideoData, setBookModalVideoData] = useState<any>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  // Visualization modal state
  const [showVisualizationModal, setShowVisualizationModal] = useState(false);

  // UnitedAI Search state
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<any>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiMatchedVideos, setAiMatchedVideos] = useState<any[]>([]);
  const [aiArticleReferences, setAiArticleReferences] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Debug: Log when visualization modal state changes
  // Modal state tracking removed - working correctly

  // Track items added by each "Add All" button for toggle functionality
  const [addedWorksMain, setAddedWorksMain] = useState<Set<string>>(new Set());
  const [addedWorksModal, setAddedWorksModal] = useState<Set<string>>(new Set());
  const [addedPlaylistsByName, setAddedPlaylistsByName] = useState<Map<string, Set<string>>>(new Map());
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [loadingPlaylistVideos, setLoadingPlaylistVideos] = useState(false);

  // Discovery Playlist State
  const [discoveryPlaylist, setDiscoveryPlaylist] = useState<Set<string>>(new Set());
  const [discoveryItems, setDiscoveryItems] = useState<Map<string, any>>(new Map());


  const contentRef = useRef<HTMLDivElement>(null);
  const videoIframeRef = useRef<HTMLIFrameElement>(null);

  // Check if this is the Blue Note book
  const [isBlueNote, setIsBlueNote] = useState(false);

  // Search videos function
  const searchVideos = async (query: string) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search API response:', data);
      console.log('Setting search results:', data.results);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search videos. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiQuery.trim()) {
      searchVideos(aiQuery.trim());
    }
  };

  // Preload videos for page 4 discovery section
  useEffect(() => {
    const loadPage4Videos = async () => {
      if (page4PreloadedVideos.length === 0) {
        try {
          const response = await fetch(
            `/api/youtube/search?q=${encodeURIComponent('Blue Note')}`
          );
          if (response.ok) {
            const data = await response.json();
            const results = data.results || [];

            console.log('Page 4 search results:', results.map((v: any) => ({
              title: v.title,
              channel: v.channel
            })));

            // Find the specific videos we want
            const voxVideo = results.find((v: any) =>
              v.title.includes('Greatest Album Covers') && v.channel.includes('Vox')
            );
            console.log('Found Vox video:', voxVideo);

            const kennedyVideo = results.find((v: any) =>
              v.title.includes('Blue Note Records') && v.channel.includes('Kennedy Center')
            );
            console.log('Found Kennedy video:', kennedyVideo);

            // Add them in order if found
            const selectedVideos = [];
            if (voxVideo) selectedVideos.push(voxVideo);
            if (kennedyVideo) selectedVideos.push(kennedyVideo);

            console.log('Selected videos for page 4:', selectedVideos.length);

            // If we didn't find both, just use first 2 results
            if (selectedVideos.length < 2) {
              setPage4PreloadedVideos(results.slice(0, 2));
            } else {
              setPage4PreloadedVideos(selectedVideos);
            }
          }
        } catch (error) {
          console.error('Failed to preload page 4 videos:', error);
        }
      }
    };
    loadPage4Videos();
  }, []);

  // Preload videos for page 1 discovery section
  useEffect(() => {
    const loadPage1Videos = async () => {
      if (page1PreloadedVideos.length === 0) {
        try {
          const response = await fetch(
            `/api/youtube/search?q=${encodeURIComponent('Blue Note')}`
          );
          if (response.ok) {
            const data = await response.json();
            const results = data.results || [];

            console.log('Page 1 search results:', results.map((v: any) => ({
              title: v.title,
              channel: v.channel
            })));

            // Find the specific videos we want
            const voxVideo = results.find((v: any) =>
              v.title.includes('Greatest Album Covers') && v.channel.includes('Vox')
            );
            console.log('Found Vox video:', voxVideo);

            const kennedyVideo = results.find((v: any) =>
              v.title.includes('Blue Note Records') && v.channel.includes('Kennedy Center')
            );
            console.log('Found Kennedy video:', kennedyVideo);

            // Add them in order if found
            const selectedVideos = [];
            if (voxVideo) selectedVideos.push(voxVideo);
            if (kennedyVideo) selectedVideos.push(kennedyVideo);

            console.log('Selected videos for page 1:', selectedVideos.length);

            // If we didn't find both, just use first 2 results
            if (selectedVideos.length < 2) {
              setPage1PreloadedVideos(results.slice(0, 2));
            } else {
              setPage1PreloadedVideos(selectedVideos);
            }
          }
        } catch (error) {
          console.error('Failed to preload page 1 videos:', error);
        }
      }
    };
    loadPage1Videos();
  }, []);

  // Preload page 9 featured videos
  useEffect(() => {
    const loadPage9Videos = async () => {
      if (page9PreloadedVideos.length === 0) {
        try {
          const [dexterResponse, maxineResponse] = await Promise.all([
            fetch(`/api/youtube/search?q=${encodeURIComponent('Dexter Gordon Rare Interviews')}`),
            fetch(`/api/youtube/search?q=${encodeURIComponent('maxine')}`)
          ]);

          const videos = [];

          if (dexterResponse.ok) {
            const dexterData = await dexterResponse.json();
            const dexterResults = dexterData.results || [];
            if (dexterResults.length > 0) {
              videos.push(dexterResults[0]);
            }
          }

          if (maxineResponse.ok) {
            const maxineData = await maxineResponse.json();
            const maxineResults = maxineData.results || [];
            if (maxineResults.length > 0) {
              videos.push(maxineResults[0]);
            }
          }

          setPage9PreloadedVideos(videos);
        } catch (error) {
          console.error('Failed to preload page 9 videos:', error);
        }
      }
    };
    loadPage9Videos();
  }, []);

  // Embed video player
  const embedVideo = async (video: any) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      console.log(`🎬 Embedding video: ${video.id}`);

      // Fetch the embed HTML from our local endpoint
      const response = await fetch(
        `/api/videos/${video.id}/embed-html`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const htmlContent = await response.text();
      setSelectedVideo(video);
      setVideoEmbedHtml(htmlContent);
      console.log(`✅ Video embedded successfully`);

    } catch (error) {
      console.error('❌ Error embedding video:', error);
      setSearchError(`Failed to load video "${video.title}".`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add track to current playlist
  const addToPlaylist = (track: any) => {
    setCurrentPlaylist(prev => [...prev, track]);
  };

  // Remove track from playlist
  const removeFromPlaylist = (index: number) => {
    setCurrentPlaylist(prev => prev.filter((_, i) => i !== index));
  };

  // Clear playlist
  const clearPlaylist = () => {
    setCurrentPlaylist([]);
  };

  // Helper functions for toggleable "Add All" buttons
  const getItemKey = (item: any): string => {
    return JSON.stringify({ title: item.title, artist: item.artist });
  };

  const toggleAllWorks = (isModal: boolean = false) => {
    if (!videoPlaylistData?.works) return;

    const addedSet = isModal ? addedWorksModal : addedWorksMain;
    const setAddedSet = isModal ? setAddedWorksModal : setAddedWorksMain;

    const allWorksAdded = videoPlaylistData.works.every((work: any) =>
      addedSet.has(getItemKey(work))
    );

    if (allWorksAdded) {
      // Remove all works that were added by this button
      const newSet = new Set(addedSet);
      videoPlaylistData.works.forEach((work: any) => {
        const key = getItemKey(work);
        if (newSet.has(key)) {
          newSet.delete(key);
          // Remove from current playlist
          setCurrentPlaylist(prev => prev.filter(item => getItemKey(item) !== key));
        }
      });
      setAddedSet(newSet);
    } else {
      // Add all works that aren't already added
      const newSet = new Set(addedSet);
      videoPlaylistData.works.forEach((work: any) => {
        const key = getItemKey(work);
        if (!newSet.has(key)) {
          newSet.add(key);
          addToPlaylist(work);
        }
      });
      setAddedSet(newSet);
    }
  };

  const toggleAllPlaylistTracks = (playlistName: string, tracks: any[]) => {
    if (!tracks || tracks.length === 0) return;

    const currentPlaylistTracks = addedPlaylistsByName.get(playlistName) || new Set();

    const allTracksAdded = tracks.every((track: any) =>
      currentPlaylistTracks.has(getItemKey(track))
    );

    if (allTracksAdded) {
      // Remove all tracks that were added by this button
      const newPlaylistMap = new Map(addedPlaylistsByName);
      const newTrackSet = new Set(currentPlaylistTracks);

      tracks.forEach((track: any) => {
        const key = getItemKey(track);
        if (newTrackSet.has(key)) {
          newTrackSet.delete(key);
          // Remove from current playlist
          setCurrentPlaylist(prev => prev.filter(item => getItemKey(item) !== key));
        }
      });

      newPlaylistMap.set(playlistName, newTrackSet);
      setAddedPlaylistsByName(newPlaylistMap);
    } else {
      // Add all tracks that aren't already added
      const newPlaylistMap = new Map(addedPlaylistsByName);
      const newTrackSet = new Set(currentPlaylistTracks);

      tracks.forEach((track: any) => {
        const key = getItemKey(track);
        if (!newTrackSet.has(key)) {
          newTrackSet.add(key);
          addToPlaylist(track);
        }
      });

      newPlaylistMap.set(playlistName, newTrackSet);
      setAddedPlaylistsByName(newPlaylistMap);
    }
  };

  const areAllWorksAdded = (isModal: boolean = false): boolean => {
    if (!videoPlaylistData?.works) return false;
    const addedSet = isModal ? addedWorksModal : addedWorksMain;
    return videoPlaylistData.works.every((work: any) =>
      addedSet.has(getItemKey(work))
    );
  };

  const areAllPlaylistTracksAdded = (playlistName: string, tracks: any[]): boolean => {
    if (!tracks || tracks.length === 0) return false;
    const currentPlaylistTracks = addedPlaylistsByName.get(playlistName) || new Set();
    return tracks.every((track: any) =>
      currentPlaylistTracks.has(getItemKey(track))
    );
  };

  // Toggle individual song in playlist
  const toggleIndividualSong = (item: any) => {
    const itemKey = getItemKey(item);
    const isInPlaylist = currentPlaylist.some(playlistItem => getItemKey(playlistItem) === itemKey);

    if (isInPlaylist) {
      // Remove from playlist
      setCurrentPlaylist(prev => prev.filter(playlistItem => getItemKey(playlistItem) !== itemKey));
    } else {
      // Add to playlist
      addToPlaylist(item);
    }
  };

  // Play the playlist - search YouTube for each track
  const playPlaylist = async () => {
    if (currentPlaylist.length === 0) return;

    // Temporarily clear and restore video HTML to stop it from playing
    // This pauses the video without breaking the player view
    const currentHtml = videoEmbedHtml;
    setSavedVideoEmbedHtml(currentHtml);
    setVideoEmbedHtml('');

    // Restore after a brief moment so the player container stays visible
    setTimeout(() => {
      setVideoEmbedHtml(currentHtml);
    }, 100);

    setLoadingPlaylistVideos(true);
    setShowPlaylistPlayer(true);
    setCurrentTrackIndex(0);

    // Search YouTube for each track in the playlist
    const videosPromises = currentPlaylist.map(async (track) => {
      try {
        const response = await fetch(
          `/api/youtube/search-track?song=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`
        );
        const data = await response.json();

        console.log(`Response for ${track.title}:`, data);

        // Handle response from our YouTube search endpoint
        if (data.videoId) {
          console.log(`✓ Found video for ${track.title}: ${data.videoId}`);
          return {
            ...track,
            videoId: data.videoId,
            videoTitle: data.title || track.title,
            channelTitle: data.channel || track.artist,
            thumbnail: `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`
          };
        } else {
          console.log(`✗ No videoId in response for ${track.title}:`, data);
        }
      } catch (error) {
        console.error(`Failed to find video for ${track.title} by ${track.artist}:`, error);
      }

      // Return track with no video if search fails
      return {
        ...track,
        videoId: null,
        videoTitle: `${track.title} - ${track.artist}`,
        error: true
      };
    });

    const videos = await Promise.all(videosPromises);
    setPlaylistVideos(videos);
    setLoadingPlaylistVideos(false);
  };

  // Fetch playlist data for a video
  const fetchPlaylistData = async (videoId: string) => {
    try {
      console.log(`🎵 Fetching playlist data for: ${videoId}`);

      // Try to get video data from our local API
      // videoId here is actually the directory name from search results
      const response = await fetch(
        `/api/youtube/videos/${videoId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match expected playlist format
      // The local endpoint returns {metadata, analysis, transcript}
      // Ensure playlists have tracks property (not songs)
      const playlists = (data.metadata?.playlists || []).map((playlist: any) => ({
        ...playlist,
        tracks: playlist.tracks || playlist.songs || []  // Support both tracks and songs
      }));

      const playlistData = {
        works: data.metadata?.works || [],
        playlists: playlists,
        analysis: data.analysis || null
      };

      setVideoPlaylistData(playlistData);

      // Pause the video when opening playlist modal
      // Since the video is in a nested iframe (srcDoc), we need to access it differently
      if (videoIframeRef.current && videoIframeRef.current.contentWindow) {
        try {
          // Get all iframes in the embedded document
          const iframes = videoIframeRef.current.contentWindow.document.getElementsByTagName('iframe');
          if (iframes.length > 0) {
            // Send pause command to the YouTube iframe
            iframes[0].contentWindow?.postMessage(
              '{"event":"command","func":"pauseVideo","args":""}',
              '*'
            );
          }
        } catch (e) {
          console.log('Could not pause video:', e);
          // Alternative approach: Try to pause via global message
          window.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
      }

      setShowPlaylistView(true);
      console.log(`✅ Playlist data loaded:`, data);

    } catch (error) {
      console.error('❌ Error fetching playlist data:', error);
    }
  };

  // Close video and return to search
  const closeVideo = () => {
    setSelectedVideo(null);
    setVideoEmbedHtml('');
    setVideoPlaylistData(null);
    setShowPlaylistView(false);
  };

  // Discovery Playlist Handlers
  const handleAddToDiscoveryPlaylist = (id: string, item: any) => {
    setDiscoveryPlaylist(prev => new Set(prev).add(id));
    setDiscoveryItems(prev => new Map(prev).set(id, item));
  };

  const handleRemoveFromDiscoveryPlaylist = (id: string) => {
    setDiscoveryPlaylist(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDiscoveryItems(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleClearDiscoveryPlaylist = () => {
    setDiscoveryPlaylist(new Set());
    setDiscoveryItems(new Map());
  };


  // UnitedAI Search handler
  const handleUnitedAISearch = async () => {
    console.log('🔍 UnitedAI Search called with query:', aiQuery);
    if (!aiQuery.trim()) {
      console.log('❌ Query is empty, returning');
      return;
    }

    setIsAiSearching(true);
    setAiError(null);

    try {
      console.log('📡 Sending request to UnitedAI API...');
      const response = await fetch('https://166ws8jk15.execute-api.us-east-1.amazonaws.com/prod/v2/broker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: aiQuery,
          domain: 'music',
          format_instructions: 'Please format your response with clear section headers. Use headers that end with a colon (:) for each major topic or section. For example: "Early Influences:", "Musical Collaboration:", "Historical Context:", etc.'
        })
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Received data:', data);
      setAiResults(data);

      // Extract article references from the narrative
      if (data.narrative) {
        const references = extractArticleReferences(data.narrative);
        console.log('📰 Found article references:', references);
        setAiArticleReferences(references);
      }

      // Also search for matching analyzed videos
      // Extract key terms from the query for better matching
      try {
        console.log('🎥 Searching for matching analyzed videos...');

        // Extract key music-related terms from the query
        const musicTerms = ['Coltrane', 'Miles', 'Davis', 'Blue Train', 'Love Supreme',
                           'Kind of Blue', 'Monk', 'Thelonious', 'Dexter', 'Gordon',
                           'Bill', 'Charlap', 'jazz', 'bebop', 'hard bop'];

        // Find which terms appear in the query
        const queryLower = aiQuery.toLowerCase();
        const matchedTerms = musicTerms.filter(term =>
          queryLower.includes(term.toLowerCase())
        );

        // Use matched terms if found, otherwise use full query
        const searchTerm = matchedTerms.length > 0 ? matchedTerms[0] : aiQuery;

        console.log('🎵 Searching videos with term:', searchTerm);
        const videoResponse = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (videoResponse.ok) {
          const videoData = await videoResponse.json();
          console.log('✅ Found matching videos:', videoData.results?.length || 0);
          setAiMatchedVideos(videoData.results || []);
        }
      } catch (videoError) {
        console.error('⚠️ Video search error (non-critical):', videoError);
        // Don't fail the whole search if video matching fails
      }
    } catch (error) {
      console.error('❌ UnitedAI search error:', error);
      setAiError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsAiSearching(false);
    }
  };

  // Helper function to extract article references from narrative text
  const extractArticleReferences = (text: string) => {
    const publications = [
      { name: 'Rolling Stone', pattern: /Rolling Stone/gi, color: '#e63946', image: '/rolling-stone-logo.png' },
      { name: 'Pitchfork', pattern: /Pitchfork/gi, color: '#ff3864', image: '/pitchfork-logo.png' },
      { name: 'DownBeat', pattern: /DownBeat/gi, color: '#1a5490', image: '/downbeat-logo.png' },
      { name: 'The New Yorker', pattern: /The New Yorker/gi, color: '#000000', image: '/new-yorker-logo.png' },
      { name: 'NPR', pattern: /NPR/gi, color: '#db0a34', image: '/npr-logo.png' },
      { name: 'The Guardian', pattern: /The Guardian/gi, color: '#052962', image: '/guardian-logo.png' }
    ];

    const references: any[] = [];

    publications.forEach(pub => {
      const matches = text.match(pub.pattern);
      if (matches && matches.length > 0) {
        // Extract context around the mention to create a title
        const lines = text.split('\n');
        lines.forEach(line => {
          if (pub.pattern.test(line)) {
            references.push({
              publication: pub.name,
              context: line.trim().substring(0, 200), // First 200 chars of the line
              color: pub.color,
              image: pub.image,
              url: `https://www.google.com/search?q=${encodeURIComponent(pub.name + ' ' + aiQuery)}`
            });
          }
        });
      }
    });

    return references;
  };

  // Helper function to format narrative text with bold blue headers
  const formatNarrative = (text: string) => {
    console.log('🎨 formatNarrative called with text length:', text.length);
    console.log('🎨 Raw text preview:', text.substring(0, 500));

    // Split by any combination of newlines (handles \n\n, \n, or any mix)
    const lines = text.split('\n').filter(line => line.trim());
    console.log('🎨 Total lines after split:', lines.length);

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      // Enhanced header detection with multiple patterns:
      const endsWithColon = trimmed.endsWith(':') &&
                           trimmed.length < 80 &&
                           !trimmed.includes('.') &&
                           !trimmed.includes('?');

      // Detect markdown-style headers (## Header or ### Header)
      const isMarkdownHeader = /^#{1,3}\s+/.test(trimmed);

      // Detect numbered sections (1. Header or I. Header or A. Header)
      const isNumberedHeader = /^(\d+\.|[IVX]+\.|[A-Z]\.)\s+[A-Z]/.test(trimmed) &&
                              trimmed.length < 100 &&
                              !trimmed.match(/\.\s+[A-Z].*\./); // Not a sentence with period

      // Detect all-caps short lines (common header style)
      const isAllCaps = trimmed === trimmed.toUpperCase() &&
                       trimmed.length < 60 &&
                       trimmed.length > 3 &&
                       /^[A-Z\s]+$/.test(trimmed);

      // Detect title case short lines starting with strong words
      const isTitleCase = /^(Early|Musical|The|A |Key|Important|Notable|Historical|Critical|Major|Primary|Influence|Legacy|Impact|Relationship|Connection|Background|Overview|Summary|Context)/.test(trimmed) &&
                         trimmed.length < 80 &&
                         !trimmed.includes('.') &&
                         !trimmed.includes(',') &&
                         trimmed.split(' ').length <= 8;

      const isHeader = endsWithColon || isMarkdownHeader || isNumberedHeader || isAllCaps || isTitleCase;

      if (isHeader) {
        // Remove markdown symbols if present
        const cleanedText = trimmed.replace(/^#{1,3}\s+/, '');
        console.log('🎨 ✓ HEADER:', cleanedText);
        return (
          <div key={idx} style={{
            marginTop: idx === 0 ? '0' : '1.5rem',
            marginBottom: '0.75rem',
            fontWeight: '800',
            fontSize: '18px',
            color: '#2563eb',
            lineHeight: '1.4'
          }}>
            {cleanedText}
          </div>
        );
      }

      // Regular text line - check for publication mentions and make them clickable
      console.log('🎨 → Body:', trimmed.substring(0, 60) + '...');

      // Define publications to detect
      const publications = [
        { name: 'Rolling Stone', color: '#e63946', image: '/rolling-stone-logo.png' },
        { name: 'Pitchfork', color: '#ff3864', image: '/pitchfork-logo.png' },
        { name: 'DownBeat', color: '#1a5490', image: '/downbeat-logo.png' },
        { name: 'The New Yorker', color: '#000000', image: '/new-yorker-logo.png' },
        { name: 'NPR', color: '#db0a34', image: '/npr-logo.png' },
        { name: 'The Guardian', color: '#052962', image: '/guardian-logo.png' }
      ];

      // Check if line contains any publication names and make full article references clickable
      let processedLine: any = trimmed;
      publications.forEach(pub => {
        // Enhanced regex to capture complete article references including titles that come AFTER publication name
        // Captures patterns like:
        // - [Source: Pitchfork Article: Title Here]
        // - according to Rolling Stone's "Article Title"
        // - in Pitchfork: Article Title
        // - Pitchfork Article: Title
        const articleRefRegex = new RegExp(
          // Pattern 1: Source/prefix + Publication + Article title after
          `(\\[?(?:source|Source):\\s*)?(${pub.name})` + // Optional [Source: Publication
          `(?:\\s+(?:Article|Review|Interview|Piece|Story|Report))?` + // Optional descriptor
          `(?::\\s*|\\s+-\\s+)` + // Separator (: or -)
          `([^\\]\\[.!?]{3,100}?)(?:\\]|$|\\.|!)` + // Article title until ] or end
          `|` + // OR
          // Pattern 2: Prefix + Publication (shorter match)
          `(according to|per|via|in|from)\\s+(${pub.name})` +
          `(?:\\s+(?:Article|Review|Interview)?(?::\\s*|\\s+-\\s+)([^.!?]{3,100}?))?`, // Optional article title
          'gi'
        );

        const matches = [...trimmed.matchAll(articleRefRegex)];
        if (matches.length > 0) {
          console.log('🔍 Found publication matches in line:', trimmed);
          console.log('🔍 Matches:', matches.map(m => m[0]));

          let lastIndex = 0;
          const newParts: any[] = [];

          matches.forEach((match, matchIdx) => {
            const fullMatch = match[0];
            const matchStart = match.index!;

            // Add text before this match
            if (matchStart > lastIndex) {
              newParts.push(trimmed.substring(lastIndex, matchStart));
            }

            // Add clickable article reference with full context
            newParts.push(
              <span
                key={`${idx}-article-${matchIdx}`}
                onClick={() => {
                  console.log('📰 Clicked article reference:', fullMatch);
                  setSelectedArticle({
                    publication: pub.name,
                    color: pub.color,
                    image: pub.image,
                    context: trimmed,
                    articleRef: fullMatch.trim()
                  });
                }}
                style={{
                  color: '#3b82f6',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {fullMatch}
              </span>
            );

            lastIndex = matchStart + fullMatch.length;
          });

          // Add remaining text after last match
          if (lastIndex < trimmed.length) {
            newParts.push(trimmed.substring(lastIndex));
          }

          processedLine = newParts;
        }
      });

      return (
        <div key={idx} style={{
          marginBottom: '0.75rem',
          fontSize: '16px',
          color: '#000000',
          lineHeight: '1.7'
        }}>
          {processedLine}
        </div>
      );
    }).filter(Boolean);
  };

  const handlePlayDiscoveryItem = (item: any) => {
    console.log('🎵 Playing discovery item:', item);
    // Video will be automatically hidden when playlist modal opens
  };

  // Apply dual highlighting: entity (yellow) and context (light blue)
  const applyDualHighlighting = useCallback((searchTerm: string, context?: string, pageText?: string) => {
    console.log('🎨 applyDualHighlighting called:', { searchTerm, context: context?.substring(0, 50) });
    
    if (!contentRef.current) {
      console.log('❌ No contentRef.current');
      return;
    }
    
    // Check URL parameters to determine if we arrived from search
    const urlParams = new URLSearchParams(window.location.search);
    const fromSearch = urlParams.get('fromSearch') === 'true';
    
    console.log('📍 URL check:', { fromSearch, url: window.location.search });
    
    // ONLY apply context highlighting if we arrived from search
    // Regular page navigation should not trigger this
    if (!fromSearch) {
      console.log('⏭️ Not from search, skipping context highlighting');
      // Just scroll to search term if it exists, no context highlighting
      const firstHighlight = document.querySelector('.search-highlight');
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
      }
      return;
    }
    
    // Get page content - use the provided pageText or the current page content
    let pageContent = pageText || '';
    
    // If no pageText provided, get it from the current page data
    if (!pageContent && pages[currentPageIndex]) {
      pageContent = pages[currentPageIndex].content;
    }
    
    // Fallback to DOM if still no content (shouldn't happen)
    if (!pageContent && contentRef.current) {
      // Get original text without HTML tags by looking at original paragraphs
      const paragraphs = contentRef.current.querySelectorAll('p');
      const textParts: string[] = [];
      paragraphs.forEach(p => {
        // Try to get text without HTML entities
        const clone = p.cloneNode(true) as HTMLElement;
        // Remove all span elements to get clean text
        clone.querySelectorAll('span').forEach(span => {
          span.replaceWith(span.textContent || '');
        });
        textParts.push(clone.textContent || '');
      });
      pageContent = textParts.join(' ');
    }
    
    console.log('📖 Page content sample:', pageContent.substring(0, 100));
    
    // First, find and highlight the context if provided (only when from search)
    if (context && fromSearch && searchTerm) {
      console.log('✅ Applying context highlighting for search term:', searchTerm);
      
      // Normalize both context and page content for matching
      const normalizeText = (text: string) => {
        return text
          .toLowerCase()
          .replace(/['']/g, "'")
          .replace(/[""]/g, '"')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const normalizedSearchTerm = normalizeText(searchTerm);
      const normalizedContext = normalizeText(context);
      const normalizedPageContent = normalizeText(pageContent);
      
      console.log('🔎 Search term:', normalizedSearchTerm);
      console.log('📝 Context preview:', normalizedContext.substring(0, 100));
      console.log('📄 Page content length:', normalizedPageContent.length);
      
      // Find the paragraph that contains the search term
      // This is more reliable than trying to match the entire context
      const paragraphs = contentRef.current.querySelectorAll('p');
      let foundParagraph = null;
      let searchTermFoundInContext = false;
      
      // First, verify the search term is actually in the provided context
      if (normalizedContext.includes(normalizedSearchTerm)) {
        searchTermFoundInContext = true;
        console.log('✅ Search term found in context');
      } else {
        console.log('⚠️ Search term NOT found in provided context - context may be incorrect');
      }
      
      // Search each paragraph for the one that best matches our search
      let bestMatch = null;
      let bestScore = 0;
      
      for (const p of paragraphs) {
        const pText = normalizeText(p.textContent || '');
        let score = 0;
        
        // Highest priority: paragraph contains the exact search term
        if (pText.includes(normalizedSearchTerm)) {
          score += 100;
          console.log('📍 Paragraph contains search term:', normalizedSearchTerm);
        }
        
        // Second priority: paragraph contains significant portion of context
        if (normalizedContext.length > 20) {
          // Check how much of the context is in this paragraph
          const contextWords = normalizedContext.split(' ');
          let matchedWords = 0;
          
          for (const word of contextWords) {
            if (word.length > 2 && pText.includes(word)) {
              matchedWords++;
            }
          }
          
          // Calculate percentage of context words found
          const contextMatchPercentage = (matchedWords / contextWords.length) * 100;
          score += contextMatchPercentage;
          
          if (contextMatchPercentage > 50) {
            console.log(`📊 Paragraph matches ${contextMatchPercentage.toFixed(0)}% of context words`);
          }
        }
        
        // Track the best matching paragraph
        if (score > bestScore) {
          bestScore = score;
          bestMatch = p;
          console.log(`🎯 New best match with score: ${score}`);
        }
      }
      
      foundParagraph = bestMatch;
      if (foundParagraph) {
        console.log(`✅ Selected best paragraph with score: ${bestScore}`);
      }
      
      if (foundParagraph) {
        console.log('✅ Found context paragraph, applying highlight');
        // Apply context highlighting to the paragraph
        foundParagraph.classList.add('search-context-highlight');
        foundParagraph.classList.add('search-context-highlight-enter');
        
        // Now find and enhance the search term within the context
        setTimeout(() => {
          const searchHighlights = document.querySelectorAll('.search-highlight');
          if (searchHighlights.length > 0) {
            // Find the highlight within or near the context
            const firstHighlight = searchHighlights[0];
            firstHighlight.classList.add('search-highlight-pulse');
            firstHighlight.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest' 
            });
            
            setTimeout(() => {
              firstHighlight.classList.remove('search-highlight-pulse');
            }, 2000);
          }
        }, 100);
      } else {
        console.log('❌ Could not find context paragraph');
      }
    } else if (searchTerm) {
      // Fallback: If we can't find the context, just highlight around the search term
      console.log('🔄 Fallback: Highlighting around search term');
      const searchHighlights = document.querySelectorAll('.search-highlight');
      if (searchHighlights.length > 0) {
        const firstHighlight = searchHighlights[0];
        // Add context highlighting to the parent paragraph or container
        const parent = firstHighlight.closest('p') || firstHighlight.parentElement;
        if (parent) {
          parent.classList.add('search-context-highlight');
          parent.classList.add('search-context-highlight-enter');
          console.log('✅ Applied context highlight to parent element');
        }
        
        firstHighlight.classList.add('search-highlight-pulse');
        firstHighlight.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
        
        setTimeout(() => {
          firstHighlight.classList.remove('search-highlight-pulse');
        }, 2000);
      }
    }
  }, [highlightedSearchTerm, pages, currentPageIndex]);

  // Handle URL parameters and context highlighting after page changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromSearch = urlParams.get('fromSearch') === 'true';
    const searchTerm = urlParams.get('searchTerm');
    const context = urlParams.get('context');
    
    console.log('🔄 URL param check effect:', { 
      fromSearch, 
      searchTerm,  // This should be the full search term
      searchTermLength: searchTerm?.length,
      hasContext: !!context, 
      hasPage: !!pages[currentPageIndex] 
    });
    
    // Only apply highlighting if we came from search and have a search term
    if (fromSearch && searchTerm && pages[currentPageIndex]) {
      console.log('📌 Applying highlighting from URL params');
      // Set the search term for highlighting
      setHighlightedSearchTerm(searchTerm);
      
      // Apply dual highlighting with a small delay to ensure DOM is ready
      setTimeout(() => {
        console.log('⏰ Delayed call to applyDualHighlighting');
        // Pass the clean page content to avoid HTML tags in text
        const currentPageContent = pages[currentPageIndex]?.content || '';
        applyDualHighlighting(searchTerm, context || undefined, currentPageContent);
        
        // Clear URL parameters after applying highlighting to prevent re-application
        setTimeout(() => {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          console.log('🧹 Cleared URL parameters after highlighting');
        }, 1000);
      }, 500);
    } else if (!fromSearch) {
      // Clear any existing context highlighting when not from search
      const contextHighlights = document.querySelectorAll('.search-context-highlight');
      contextHighlights.forEach(el => {
        el.classList.remove('search-context-highlight');
        el.classList.remove('search-context-highlight-enter');
      });
    }
  }, [currentPageIndex, pages, applyDualHighlighting]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Escape to close search
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
      // Left arrow for previous page
      if (e.key === 'ArrowLeft' && currentPageIndex > 0) {
        e.preventDefault();
        setCurrentPageIndex(prev => prev - 1);
        window.scrollTo(0, 0);
      }
      // Right arrow for next page
      if (e.key === 'ArrowRight' && currentPageIndex < pages.length - 1) {
        e.preventDefault();
        setCurrentPageIndex(prev => prev + 1);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, currentPageIndex, pages.length]);

  // Handle text selection
  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      // Only show modal for meaningful selections (10+ characters)
      if (text.length >= 10 && contentRef.current?.contains(selection?.anchorNode as Node)) {
        setSelectedText(text);
        setShowSelectionModal(true);
        // Clear the selection after capturing it
        selection?.removeAllRanges();
      }
    };

    // Add event listeners for text selection
    const handleMouseUp = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 100);
    };

    // Add event listener to the document
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Close selection modal
  const handleCloseSelectionModal = useCallback(() => {
    setShowSelectionModal(false);
    setSelectedText('');
  }, []);

  // Load transcript
  useEffect(() => {
    const loadTranscript = async () => {
      try {
        setIsLoading(true);

        console.log('🔵 Loading transcript with ID:', transcriptId);

        // Check if this is Blue Note book
        if (transcriptId === 'bluenote') {
          console.log('🎵 Loading Blue Note book data');
          setIsBlueNote(true);
          // Load Blue Note data directly - store raw data for rendering
          const blueNotePages: any[] = blueNoteData.pages.map((page: any) => ({
            ...page,
            pageNumber: page.page,
            content: page.type === 'text' ? page.content :
                    page.type === 'album_showcase' ?
                    `Album: ${page.album?.title || ''}\nArtist: ${page.album?.artist || ''}\nYear: ${page.album?.year || ''}\nCatalog: ${page.album?.catalog || ''}\nDesigner: ${page.album?.designer || ''}` :
                    page.type === 'cover' ?
                    `${page.title}\n\n${page.subtitle || ''}\n\nBy ${page.authors?.join(', ') || ''}\n\n${page.content || ''}` :
                    page.type === 'photo' ?
                    `${page.title || ''}\n\n${page.caption || page.content || ''}` :
                    page.type === 'index' ?
                    `${page.title}\n\n${page.content || ''}\n\n${page.sections?.map((s: any) => `${s.title}: Pages ${s.pages.join(', ')}`).join('\n') || ''}\n\n${page.note || ''}` :
                    page.type === 'page_image' ?
                    `${page.title || ''}` :
                    'Page content',
            chapter: page.title || 'section',
            chapterTitle: page.title || (page.type === 'album_showcase' ? page.album?.title : 'Blue Note'),
            wordCount: 50,
            // Keep original data for rendering
            originalData: page
          }));
          console.log('🎵 Blue Note pages created:', blueNotePages.length);
          setPages(blueNotePages);
          setFullTranscript('Blue Note Records Collection');
          setIsLoading(false);
          return; // Exit early for Blue Note
        }

        // For non-Blue Note books
        console.log('📚 Loading regular book:', transcriptId);
        // Load regular transcript
        const response = await fetch(`/transcripts/${transcriptId}/transcript.txt`);
        if (!response.ok) throw new Error('Failed to load transcript');
        const text = await response.text();
        setFullTranscript(text);

        // Split into pages
        const bookPages = splitIntoPages(text);
        setPages(bookPages);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transcript');
        setIsLoading(false);
      }
    };

    loadTranscript();
  }, [transcriptId]);

  // Listen for messages from embedded iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('🔴 Parent received message:', event.data);
      console.log('🔴 Event origin:', event.origin);
      console.log('🔴 Event source type:', event.source ? 'iframe' : 'unknown');


      // Handle messages from the embedded video iframe
      if (event.data && event.data.type) {
        console.log('🔴 Message type:', event.data.type);
        switch (event.data.type) {
          case 'SHOW_PLAYLIST_DATA':
            console.log('🎯 SHOW_PLAYLIST_DATA received!');
            // Store the data and show the modal immediately
            if (event.data.data) {
              console.log('📊 Setting playlist data for modal:', event.data.data);

              // Ensure playlists have tracks property (not songs)
              const playlists = (event.data.data.playlists || []).map((playlist: any) => ({
                ...playlist,
                tracks: playlist.tracks || playlist.songs || []  // Support both tracks and songs
              }));

              setVideoPlaylistData({
                works: event.data.data.works || [],
                playlists: playlists,
                relatedContent: event.data.data.relatedContent || []
              });

              // Show the playlist modal (video will be automatically hidden via display:none)
              console.log('📦 Setting showPlaylistView to true');
              setShowPlaylistView(true);
              console.log('✅ Modal should now be visible');

            } else {
              console.error('❌ No data in SHOW_PLAYLIST_DATA message');
            }
            break;
          case 'CLOSE_PLAYLIST_DATA':
            console.log('🎯 CLOSE_PLAYLIST_DATA received!');
            console.log('📦 Setting showPlaylistView to false');
            setShowPlaylistView(false);
            console.log('✅ Modal should now be closed');
            break;
          case 'ADD_TO_PLAYLIST':
            // Handle adding items to discovery playlist from iframe
            if (event.data.item) {
              const item = event.data.item;
              handleAddToDiscoveryPlaylist(item.id, item);
              console.log('➕ Added to playlist from iframe:', item);
            }
            break;
          case 'EMBED_LOADED':
            console.log('✅ Video embed loaded:', event.data.videoId);
            break;
          case 'PLAYER_READY':
            console.log('🎬 YouTube player ready:', event.data.videoId);
            break;
          case 'PLAYER_STATE_CHANGE':
            console.log('🎬 Player state changed:', event.data.state);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleAddToDiscoveryPlaylist]);

  // Split transcript into pages
  const splitIntoPages = useCallback((text: string): BookPage[] => {
    // Format text with paragraph breaks
    const formatTextWithParagraphs = (rawText: string): string => {
      // First, preserve any existing line breaks
      if (rawText.includes('\n\n')) {
        return rawText; // Already formatted with paragraphs
      }
      
      // Split into sentences more carefully
      const sentences = rawText.match(/[^.!?]+[.!?]+/g) || [rawText];
      
      const paragraphs: string[] = [];
      let currentParagraph: string[] = [];
      let wordCount = 0;
      
      sentences.forEach((sentence, index) => {
        const trimmedSentence = sentence.trim();
        const sentenceWords = trimmedSentence.split(/\s+/).length;
        
        currentParagraph.push(trimmedSentence);
        wordCount += sentenceWords;
        
        // Determine if we should start a new paragraph
        const hasDialogue = trimmedSentence.includes('"');
        const nextHasDialogue = sentences[index + 1]?.includes('"');
        const isLongParagraph = wordCount > 60; // About 3-4 sentences worth
        const endsWithExclamation = trimmedSentence.endsWith('!');
        const endsWithQuestion = trimmedSentence.endsWith('?');
        
        // Natural paragraph break points:
        // 1. After 60+ words (about 3-4 sentences)
        // 2. Before or after dialogue shifts
        // 3. After emphatic statements (! or ?)
        // 4. When topic seems to shift (next sentence starts with time/place indicators)
        const nextStartsNewTopic = sentences[index + 1] && 
          /^(When |Where |After |Before |Later |Then |Now |In |At |On |During |That |The next |One |It was |There |I was |He was |She was )/i.test(sentences[index + 1].trim());
        
        const shouldBreak = isLongParagraph || 
                          (hasDialogue && !nextHasDialogue) || 
                          (!hasDialogue && nextHasDialogue) ||
                          (endsWithExclamation && !hasDialogue) ||
                          (endsWithQuestion && !hasDialogue) ||
                          nextStartsNewTopic;
        
        if (shouldBreak && currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
          wordCount = 0;
        }
      });
      
      // Add any remaining sentences
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join(' '));
      }
      
      // Filter out empty paragraphs and join with double line breaks
      return paragraphs
        .filter(p => p.trim().length > 0)
        .join('\n\n');
    };
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    const bookPages: BookPage[] = [];
    
    // Calculate total pages needed
    const totalPages = Math.ceil(totalWords / WORDS_PER_PAGE);
    
    // Map words to book structure
    let wordIndex = 0;
    
    // Process Foreword (1 page)
    const forewordWords = Math.min(WORDS_PER_PAGE, totalWords - wordIndex);
    if (forewordWords > 0) {
      const forewordContent = words.slice(wordIndex, wordIndex + forewordWords).join(' ');
      bookPages.push({
        pageNumber: -1, // XI
        content: formatTextWithParagraphs(forewordContent),
        chapter: 'foreword',
        chapterTitle: 'Foreword',
        wordCount: forewordWords
      });
      wordIndex += forewordWords;
    }
    
    // Process each chapter based on its page range
    for (const chapter of BOOK_STRUCTURE.slice(1)) { // Skip foreword as we handled it
      const chapterPages = chapter.endPage - chapter.startPage + 1;
      const wordsForChapter = chapterPages * WORDS_PER_PAGE;
      
      for (let page = chapter.startPage; page <= chapter.endPage && wordIndex < totalWords; page++) {
        const pageWords = Math.min(WORDS_PER_PAGE, totalWords - wordIndex);
        if (pageWords <= 0) break;
        
        const pageContent = words.slice(wordIndex, wordIndex + pageWords).join(' ');
        bookPages.push({
          pageNumber: page,
          content: formatTextWithParagraphs(pageContent),
          chapter: chapter.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          chapterTitle: chapter.title,
          wordCount: pageWords
        });
        wordIndex += pageWords;
      }
    }
    
    return bookPages;
  }, []);

  // Get current page
  const currentPage = useMemo(() => {
    return pages[currentPageIndex] || null;
  }, [pages, currentPageIndex]);

  // Clear discovery results when page changes
  useEffect(() => {
    setDiscoveryResults([]);
    setIsAlbumAudioPlaying(false);
  }, [currentPage]);

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex, pages.length]);

  const goToPrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentPageIndex]);

  const handlePageJump = useCallback(() => {
    const targetPage = jumpToPage.toLowerCase() === 'xi' ? -1 : parseInt(jumpToPage);
    
    if (isNaN(targetPage) && jumpToPage.toLowerCase() !== 'xi') {
      return;
    }
    
    const pageIndex = pages.findIndex(p => p.pageNumber === targetPage);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setJumpToPage('');
      window.scrollTo(0, 0);
    }
  }, [jumpToPage, pages]);
  

  const goToChapter = useCallback((chapterTitle: string) => {
    const pageIndex = pages.findIndex(p => p.chapterTitle === chapterTitle);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      window.scrollTo(0, 0);
    }
  }, [pages]);

  // Define discoverable entities with cultural context
  const ENTITY_CONTEXTS = {
    // Core People - Main Characters
    "Robert Mapplethorpe": {
      type: "artist",
      period: "NYC Photography & Art Scene (1960s-80s)",
      significance: "Revolutionary photographer who transformed art photography, explored sexuality and beauty. Patti's soulmate and artistic partner.",
      discoveryValue: "Explore the evolution from collage artist to master photographer, BDSM culture in art, and AIDS crisis.",
      relatedWorks: ["Self Portrait with Whip", "X Portfolio", "Calla Lily", "Black Males series", "Lady Lisa Lyon"],
      pages: [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 112, 145, 178, 203, 234],
      aliases: ["Robert", "Mapplethorpe", "Robert Michael Mapplethorpe"]
    },
    "Sam Shepard": {
      type: "author",
      period: "American Theater & Film (1960s-2010s)",
      significance: "Playwright and actor who redefined American theater, Patti's later partner.",
      discoveryValue: "Explore Off-Broadway theater, experimental drama, and the American West in literature.",
      relatedWorks: ["Buried Child", "True West", "Days of Heaven"],
      pages: [189, 201, 212, 223, 234, 245]
    },
    
    // Musicians & Bands
    "Bob Dylan": {
      type: "musician",
      period: "Folk Revival & Electric Era (1960s-70s)",
      significance: "Revolutionary songwriter who transformed popular music with poetic lyrics. Nobel Prize in Literature 2016.",
      discoveryValue: "Explore the folk revival movement, protest music, and the controversial electric turn at Newport Folk Festival.",
      relatedWorks: ["Highway 61 Revisited", "Blonde on Blonde", "Like a Rolling Stone", "The Times They Are a-Changin'", "Tangled Up in Blue"],
      pages: [45, 67, 89, 112, 145, 178, 203, 234],
      aliases: ["Dylan", "Bobby Dylan"]
    },
    "Jimi Hendrix": {
      type: "musician",
      period: "Psychedelic Rock Era (1960s)",
      significance: "Guitar virtuoso who revolutionized electric guitar. Died at 27, member of the '27 Club'.",
      discoveryValue: "Explore psychedelic rock, Woodstock, and the transformation of guitar as lead instrument.",
      relatedWorks: ["Electric Ladyland", "Are You Experienced", "Purple Haze", "All Along the Watchtower", "Voodoo Child"],
      pages: [56, 78, 92, 134, 189, 212],
      aliases: ["Hendrix", "James Marshall Hendrix"]
    },
    "Janis Joplin": {
      type: "musician",
      period: "Blues Rock Era (1960s)",
      significance: "Powerful blues singer who broke gender barriers in rock. Died at 27.",
      discoveryValue: "Explore women in rock, blues revival, and the tragedy of the 27 Club.",
      relatedWorks: ["Piece of My Heart", "Me and Bobby McGee", "Pearl album", "Ball and Chain", "Cry Baby"],
      pages: [78, 89, 112, 134, 156],
      aliases: ["Janis"]
    },
    "The Rolling Stones": {
      type: "musician",
      period: "British Invasion (1960s-present)",
      significance: "Rock band that brought blues to mainstream rock, cultural icons of rebellion.",
      discoveryValue: "Explore British Invasion, blues rock, and counterculture movements.",
      relatedWorks: ["Exile on Main St.", "Let It Bleed", "Sympathy for the Devil", "Gimme Shelter", "Wild Horses"],
      pages: [67, 89, 112, 145],
      aliases: ["Rolling Stones", "The Stones"]
    },
    "John Lennon": {
      type: "musician",
      period: "Beatles & Solo Career (1960s-80)",
      significance: "Beatle who became peace activist and avant-garde artist. Murdered in 1980 outside Dakota building.",
      discoveryValue: "Explore The Beatles' breakup, Yoko Ono collaboration, bed-ins for peace, and primal scream therapy.",
      relatedWorks: ["Imagine", "Working Class Hero", "Double Fantasy", "Give Peace a Chance", "Instant Karma"],
      pages: [45, 67, 89, 112],
      aliases: ["Lennon"]
    },
    "Jim Morrison": {
      type: "musician",
      period: "The Doors Era (1960s-71)",
      significance: "Poet-shaman of rock who merged poetry with psychedelic rock. The Lizard King. Died at 27 in Paris.",
      discoveryValue: "Explore The Doors, UCLA film school, poetry and excess, Miami incident, Paris grave as pilgrimage site.",
      relatedWorks: ["Light My Fire", "The End", "Riders on the Storm", "Break On Through", "L.A. Woman"],
      pages: [89, 112, 134, 156],
      aliases: ["Morrison", "The Lizard King"]
    },
    "Lou Reed": {
      type: "musician",
      period: "Velvet Underground & Solo (1960s-2013)",
      significance: "Velvet Underground leader who brought street poetry and transgression to rock.",
      discoveryValue: "Explore Velvet Underground, Warhol's Factory, glam rock transformation.",
      relatedWorks: ["Walk on the Wild Side", "Heroin", "Transformer"],
      pages: [112, 134, 156, 178]
    },
    "John Coltrane": {
      type: "musician",
      period: "Jazz Revolution (1950s-60s)",
      significance: "Jazz saxophonist who pioneered spiritual jazz and free jazz movements. Spiritual seeker who transformed jazz into meditation.",
      discoveryValue: "Explore modal jazz, spiritual jazz, sheets of sound technique, and collaboration with Miles Davis.",
      relatedWorks: ["A Love Supreme", "Giant Steps", "My Favorite Things", "Naima", "Impressions"],
      pages: [78, 101, 134, 178],
      aliases: ["Coltrane"]
    },
    "James Brown": {
      type: "musician",
      period: "Soul & Funk Pioneer (1950s-2000s)",
      significance: "Godfather of Soul, pioneer of funk music, influential in hip-hop development.",
      discoveryValue: "Explore the birth of funk, soul music, and influence on hip-hop culture.",
      relatedWorks: ["Get Up (I Feel Like Being a) Sex Machine", "Papa's Got a Brand New Bag"],
      pages: [78, 112, 156]
    },
    "Tim Buckley": {
      type: "musician",
      period: "Folk & Experimental (1960s-70s)",
      significance: "Innovative vocalist who moved from folk to avant-garde. Father of Jeff Buckley.",
      discoveryValue: "Explore vocal experimentation, folk-jazz fusion, tragic early death.",
      relatedWorks: ["Song to the Siren", "Starsailor", "Happy Sad"],
      pages: [134, 156, 178]
    },
    
    // Visual Artists
    "Andy Warhol": {
      type: "artist",
      period: "Pop Art Movement (1960s-80s)",
      significance: "Pop art icon who blurred lines between commercial and fine art. Creator of The Factory. Shot by Valerie Solanas in 1968.",
      discoveryValue: "Explore Pop Art, celebrity culture, The Factory scene, Velvet Underground, Interview magazine, Screen Tests.",
      relatedWorks: ["Campbell's Soup Cans", "Marilyn Diptych", "Chelsea Girls film", "Elvis", "Electric Chair series"],
      pages: [67, 89, 102, 145, 167, 198, 224],
      aliases: ["Warhol"]
    },
    "Picasso": {
      type: "artist",
      period: "Modern Art Pioneer (1900s-1970s)",
      significance: "Co-founder of Cubism, most influential artist of 20th century.",
      discoveryValue: "Explore Cubism, Blue Period, and the revolution of modern art.",
      relatedWorks: ["Guernica", "Les Demoiselles d'Avignon", "The Old Guitarist"],
      pages: [34, 67, 123]
    },
    "Modigliani": {
      type: "artist",
      period: "École de Paris (1900s-1920)",
      significance: "Italian painter known for portraits with elongated faces, bohemian lifestyle in Paris.",
      discoveryValue: "Explore École de Paris, Montparnasse art scene, and expressionist portraiture.",
      relatedWorks: ["Reclining Nude", "Portrait of Jeanne Hébuterne"],
      pages: [45, 89]
    },
    "Frida Kahlo": {
      type: "artist",
      period: "Mexican Surrealism (1920s-50s)",
      significance: "Mexican artist who transformed pain into powerful self-portraits. Wife of Diego Rivera.",
      discoveryValue: "Explore Mexican identity, surrealism, feminist art, Casa Azul, indigenous culture.",
      relatedWorks: ["The Two Fridas", "Self-Portrait with Thorn Necklace", "The Broken Column", "What the Water Gave Me"],
      pages: [67, 89, 112],
      aliases: ["Frida"]
    },
    "Diego Rivera": {
      type: "artist",
      period: "Mexican Muralism (1920s-50s)",
      significance: "Mexican muralist who brought art to the people, husband of Frida Kahlo.",
      discoveryValue: "Explore Mexican muralism, communist politics in art.",
      relatedWorks: ["Detroit Industry Murals", "Man at the Crossroads"],
      pages: [67, 89]
    },
    "Salvador Dalí": {
      type: "artist",
      period: "Surrealism (1920s-80s)",
      significance: "Surrealist master known for melting clocks and eccentric personality. The mad genius with distinctive mustache.",
      discoveryValue: "Explore surrealism, paranoid-critical method, collaboration with Hitchcock, Gala as muse.",
      relatedWorks: ["The Persistence of Memory", "The Elephants", "Christ of Saint John of the Cross"],
      pages: [45, 67],
      aliases: ["Dalí"]
    },
    
    // Authors & Poets
    "Arthur Rimbaud": {
      type: "author",
      period: "Symbolist Poetry (1870s)",
      significance: "Teen prodigy poet who influenced surrealism and beat generation. The original enfant terrible of poetry. Stopped writing at 19.",
      discoveryValue: "Explore symbolist poetry, 'poet as seer', derangement of the senses, relationship with Verlaine, African adventures.",
      relatedWorks: ["Illuminations", "A Season in Hell", "The Drunken Boat", "Vowels", "The Sleeper in the Valley"],
      pages: [12, 34, 67, 89, 123, 156, 189, 234, 267],
      aliases: ["Rimbaud"]
    },
    "William Burroughs": {
      type: "author",
      period: "Beat Generation (1950s-90s)",
      significance: "Beat writer who pioneered cut-up technique. The gentleman junkie who wrote about control systems.",
      discoveryValue: "Explore Beat Generation, experimental writing, Tangier years, collaboration with Brion Gysin.",
      relatedWorks: ["Naked Lunch", "Junky", "The Soft Machine", "Cities of the Red Night", "The Wild Boys"],
      pages: [89, 112, 145, 178, 201],
      aliases: ["Burroughs", "William S. Burroughs"]
    },
    "Allen Ginsberg": {
      type: "author",
      period: "Beat Generation (1950s-90s)",
      significance: "Beat poet whose 'Howl' challenged censorship. Buddhist Jewish gay poet who made poetry political.",
      discoveryValue: "Explore Beat poetry, anti-war movement, LGBTQ rights, Naropa Institute, relationship with Peter Orlovsky.",
      relatedWorks: ["Howl", "Kaddish", "America", "Sunflower Sutra", "A Supermarket in California"],
      pages: [123, 145, 167, 189, 212],
      aliases: ["Ginsberg"]
    },
    "Jack Kerouac": {
      type: "author",
      period: "Beat Generation (1940s-60s)",
      significance: "Beat novelist who captured American wanderlust. King of the Beats who struggled with his legacy.",
      discoveryValue: "Explore spontaneous prose, Buddhism, road culture, French-Canadian roots, jazz influence on prose.",
      relatedWorks: ["On the Road", "The Dharma Bums", "Big Sur", "Mexico City Blues", "Visions of Gerard"],
      pages: [89, 112, 134],
      aliases: ["Kerouac"]
    },
    "Jean Genet": {
      type: "author",
      period: "French Literature (1940s-80s)",
      significance: "Thief turned writer who celebrated criminality and homosexuality. Saint Genet - patron saint of outsiders.",
      discoveryValue: "Explore prison literature, theatrical revolution, Black Panthers support, Palestinian activism.",
      relatedWorks: ["Our Lady of the Flowers", "The Thief's Journal", "The Balcony", "Querelle", "The Maids"],
      pages: [145, 167, 189],
      aliases: ["Genet"]
    },
    "Baudelaire": {
      type: "author",
      period: "French Symbolism (1850s-60s)",
      significance: "Poet of modernity who found beauty in decay and evil.",
      discoveryValue: "Explore Les Fleurs du mal, dandyism, art criticism.",
      relatedWorks: ["Les Fleurs du mal", "Paris Spleen", "The Painter of Modern Life"],
      pages: [34, 56, 78]
    },
    "William Blake": {
      type: "author",
      period: "Romantic Poetry & Art (1780s-1820s)",
      significance: "Visionary poet-artist who saw angels and created illuminated books. Prophet-poet who created entire mythologies.",
      discoveryValue: "Explore mystical Christianity, printmaking, influence on counterculture, Jerusalem, Albion.",
      relatedWorks: ["Songs of Innocence and Experience", "The Marriage of Heaven and Hell", "The Tyger", "London", "Jerusalem"],
      pages: [45, 67, 89],
      aliases: ["Blake"]
    },
    
    // Venues & Places
    "Chelsea Hotel": {
      type: "venue",
      period: "NYC Cultural Landmark (1884-present)",
      significance: "Legendary hotel housing artists, writers, musicians. Where Nancy Spungen died, Dylan Thomas drank, and Patti & Robert lived.",
      discoveryValue: "Explore NYC bohemian history, Room 100 (Patti and Robert's room), Harry Smith's archives.",
      relatedWorks: ["'Chelsea Girls' by Warhol", "'Chelsea Hotel' by Leonard Cohen", "'Sad Eyed Lady of the Lowlands' written there"],
      pages: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
      aliases: ["Hotel Chelsea", "The Chelsea"]
    },
    "Max's Kansas City": {
      type: "venue",
      period: "NYC Nightclub (1965-1981)",
      significance: "Warhol's hangout, birthplace of glam rock and punk. Mickey Ruskin's club where you paid in art.",
      discoveryValue: "Explore NYC underground scene, Velvet Underground, backroom politics, Debbie Harry waitressing.",
      relatedWorks: ["'Back rooms' where Warhol held court", "'Live at Max's Kansas City' albums"],
      pages: [112, 134, 156, 178, 201, 223],
      aliases: ["Max's"]
    },
    "CBGB": {
      type: "venue",
      period: "Punk Rock Birthplace (1973-2006)",
      significance: "Launched punk and new wave: Ramones, Blondie, Talking Heads, Patti Smith Group.",
      discoveryValue: "Explore the birth of punk rock and NYC's underground music revolution.",
      relatedWorks: ["'Horses' by Patti Smith", "debut performances"],
      pages: [178, 189, 201, 212, 223]
    },
    "The Factory": {
      type: "venue",
      period: "Warhol's Studios (1962-1984)",
      significance: "Warhol's studio where art, film, and music merged. Silver-foiled walls and amphetamine energy.",
      discoveryValue: "Explore Superstars, Screen Tests, Velvet Underground rehearsals.",
      relatedWorks: ["'Exploding Plastic Inevitable' multimedia shows"],
      pages: [134, 156, 178]
    },
    "Brooklyn": {
      type: "venue",
      period: "NYC Borough",
      significance: "Where Patti and Robert first lived together, beginning of their story.",
      discoveryValue: "Explore 1960s Brooklyn, pre-gentrification artist life.",
      relatedWorks: ["Hall Street loft where they first lived"],
      pages: [23, 34, 45, 56]
    },
    "Greenwich Village": {
      type: "venue",
      period: "NYC Neighborhood",
      significance: "Bohemian heart of NYC, folk music scene, gay liberation birthplace. Where beats became hippies.",
      discoveryValue: "Explore Washington Square Park, Cafe Wha?, Stonewall Inn, MacDougal Street, Bleecker Street venues.",
      relatedWorks: ["Folk City", "The Bitter End", "Gaslight Cafe", "The Bottom Line"],
      pages: [67, 89, 112, 134],
      aliases: ["The Village", "Village"]
    },
    "Coney Island": {
      type: "venue",
      period: "NYC Beach & Amusement",
      significance: "Working-class pleasure beach, site of Patti and Robert's early adventures.",
      discoveryValue: "Explore Nathan's Famous, Wonder Wheel, freak shows.",
      relatedWorks: ["Astroland", "Steeplechase Park ruins"],
      pages: [34, 56, 78]
    },
    "Museum of Modern Art": {
      type: "venue",
      period: "NYC Art Institution",
      significance: "MoMA - temple of modern art where Patti worked in the bookstore, meeting artists and intellectuals.",
      discoveryValue: "Explore Abstract Expressionism, Pop Art exhibitions, museum bookstores as cultural centers.",
      relatedWorks: ["The Museum of Modern Art collection", "Guernica", "'Starry Night' in collection"],
      pages: [123, 145, 167],
      aliases: ["MoMA", "The Museum of Modern Art"]
    }
  };
  
  // Create flat list for highlighting with aliases
  const DISCOVERABLE_ENTITIES = Object.keys(ENTITY_CONTEXTS).map(name => ({
    name,
    type: ENTITY_CONTEXTS[name].type,
    totalMentions: ENTITY_CONTEXTS[name].pages.length,
    pages: ENTITY_CONTEXTS[name].pages,
    aliases: ENTITY_CONTEXTS[name].aliases || []
  }));

  // Highlight entities in page content (including literary works)
  const highlightEntitiesInText = useCallback((text: string): string => {
    // First, normalize multiple spaces to single spaces to prevent spacing issues
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    // Track positions that have already been highlighted to avoid overlaps
    const replacements: Array<{start: number, end: number, entity: any, match: string, isSearchTerm?: boolean, type?: string}> = [];

    // FIRST: Add discovery passage highlighting (using music-video style for blue background with line)
    // Do this BEFORE entity highlighting to preserve the full sentence

    // Debug: Check if the text contains our target
    if (normalizedText.includes("collages")) {
      console.log('🎯 Found "collages" in text!');
      console.log('📄 Full text around it:', normalizedText.substring(normalizedText.indexOf("collages") - 50, normalizedText.indexOf("collages") + 150));
    }
    if (normalizedText.includes("Robert's collages")) {
      console.log('✅ Found exact "Robert\'s collages" in text!');
    }
    if (normalizedText.includes("show consisted")) {
      console.log('✅ Found "show consisted" in text!');
    }

    const discoveryPassage1 = /The show consisted of Robert['']s collages that centered on freaks, but he prepared one fairly large altarpiece for the event/gi;
    let discoveryMatch1;
    while ((discoveryMatch1 = discoveryPassage1.exec(normalizedText)) !== null) {
      console.log('DISCOVERY MATCH FOUND!', discoveryMatch1[0]);
      replacements.push({
        start: discoveryMatch1.index,
        end: discoveryMatch1.index + discoveryMatch1[0].length,
        entity: { name: 'Discovery Passage - Robert\'s Freaks Exhibition', type: 'music-video' },
        match: discoveryMatch1[0],
        type: 'music-video'
      });
    }

    // Define important entities to highlight (do this AFTER discovery passages)
    const importantEntities = [
      {
        name: 'Robert Mapplethorpe',
        aliases: ['Robert Mapplethorpe', 'Mapplethorpe', 'Robert', 'Bobby'],
        type: 'person'
      },
      {
        name: 'Hotel Chelsea',
        aliases: ['Hotel Chelsea', 'Chelsea Hotel', 'the Chelsea'],
        type: 'place'
      }
    ];

    // SPECIAL TEST: Add John Coltrane video reference
    const coltranePattern = /John Coltrane, the man who gave us A Love Supreme/gi;
    let coltraneMatch;
    while ((coltraneMatch = coltranePattern.exec(normalizedText)) !== null) {
      replacements.push({
        start: coltraneMatch.index,
        end: coltraneMatch.index + coltraneMatch[0].length,
        entity: { name: 'John Coltrane - A Love Supreme', type: 'music-video' },
        match: coltraneMatch[0],
        type: 'music-video'
      });
    }
    
    // Collect matches for important entities (Robert Mapplethorpe, Hotel Chelsea, etc.)
    const entityMatches: Array<{start: number, end: number, entity: any, match: string, type: string}> = [];
    
    importantEntities.forEach(entity => {
      entity.aliases.forEach(alias => {
        // Special handling for "Robert" - only highlight if it's likely referring to Mapplethorpe
        if (alias === 'Robert') {
          // Only highlight "Robert" if it appears alone or in specific contexts
          const robertRegex = /\bRobert\b(?!\s+(Louis\s+)?Stevenson|\s+Frost|\s+Burns|\s+Lowell)/gi;
          let robertMatch;
          while ((robertMatch = robertRegex.exec(normalizedText)) !== null) {
            entityMatches.push({
              start: robertMatch.index,
              end: robertMatch.index + robertMatch[0].length,
              entity: { name: entity.name, type: entity.type },
              match: robertMatch[0],
              type: entity.type
            });
          }
        } else {
          const aliasRegex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          let aliasMatch;
          while ((aliasMatch = aliasRegex.exec(normalizedText)) !== null) {
            entityMatches.push({
              start: aliasMatch.index,
              end: aliasMatch.index + aliasMatch[0].length,
              entity: { name: entity.name, type: entity.type },
              match: aliasMatch[0],
              type: entity.type
            });
          }
        }
      });
    });
    
    // Sort entity matches by length (longest first) to prefer complete names
    entityMatches.sort((a, b) => (b.end - b.start) - (a.end - a.start));
    
    // Add non-overlapping entity matches to replacements
    entityMatches.forEach(em => {
      const overlaps = replacements.some(r => 
        (em.start >= r.start && em.start < r.end) || 
        (em.end > r.start && em.end <= r.end) ||
        (em.start <= r.start && em.end >= r.end)
      );
      
      if (!overlaps) {
        replacements.push(em);
      }
    });
    
    // Use fuzzy matching to find all book titles in the text
    const bookMatches = findBookTitles(normalizedText);
    
    // Convert book matches to our replacement format
    const literaryMatches: Array<{start: number, end: number, entity: any, match: string, type: string}> = [];
    
    bookMatches.forEach(bookMatch => {
      literaryMatches.push({
        start: bookMatch.startIndex,
        end: bookMatch.endIndex,
        entity: { 
          title: bookMatch.title,
          author: bookMatch.author,
          bookId: bookMatch.bookId
        },
        match: bookMatch.matchedText,
        type: 'literary'
      });
    });
    
    // Use comprehensive author recognition
    const authorMatches = findAuthors(normalizedText);
    
    authorMatches.forEach(authorMatch => {
      literaryMatches.push({
        start: authorMatch.startIndex,
        end: authorMatch.endIndex,
        entity: { 
          name: authorMatch.fullName,
          authorId: authorMatch.authorId
        },
        match: authorMatch.matchedText,
        type: 'author'
      });
    });
    
    // Sort literary matches by length (longest first) to prefer complete titles
    literaryMatches.sort((a, b) => (b.end - b.start) - (a.end - a.start));
    
    // Add non-overlapping literary matches to replacements
    literaryMatches.forEach(lm => {
      const overlaps = replacements.some(r => 
        (lm.start >= r.start && lm.start < r.end) || 
        (lm.end > r.start && lm.end <= r.end) ||
        (lm.start <= r.start && lm.end >= r.end)
      );
      
      if (!overlaps) {
        replacements.push(lm);
      }
    });
    
    // Then, highlight search terms if present
    if (highlightedSearchTerm && highlightedSearchTerm.length >= 2) {
      const escapedSearchTerm = highlightedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(`(${escapedSearchTerm})`, 'gi');
      
      let match;
      while ((match = searchRegex.exec(normalizedText)) !== null) {
        const start = match.index;
        const end = match.index + match[0].length;
        
        replacements.push({
          start,
          end,
          entity: null,
          match: match[0],
          isSearchTerm: true
        });
      }
    }
    
    DISCOVERABLE_ENTITIES.forEach(entity => {
      // Create list of all names to match (main name + aliases)
      const namesToMatch = [entity.name, ...(entity.aliases || [])];
      
      namesToMatch.forEach(nameToMatch => {
        // Create regex to match entity name (case insensitive, whole words)
        const escapedName = nameToMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b(${escapedName})\\b`, 'gi');
        
        let match;
        while ((match = regex.exec(normalizedText)) !== null) {
          const start = match.index;
          const end = match.index + match[0].length;
          
          // Check if this position overlaps with any existing replacement
          const hasOverlap = replacements.some(r => 
            (start >= r.start && start < r.end) || 
            (end > r.start && end <= r.end) ||
            (start <= r.start && end >= r.end)
          );
          
          if (!hasOverlap) {
            replacements.push({
              start,
              end,
              entity,
              match: match[0]
            });
          }
        }
      });
    });
    
    // Remove overlapping matches, keeping longer ones
    const filteredReplacements = replacements.filter((r, index) => {
      // Check if this replacement is overlapped by a longer one
      for (let i = 0; i < replacements.length; i++) {
        if (i === index) continue;
        const other = replacements[i];
        // If another match is longer and overlaps, skip this one
        if (other.match.length > r.match.length) {
          if ((r.start >= other.start && r.start < other.end) || 
              (r.end > other.start && r.end <= other.end)) {
            return false;
          }
        }
      }
      return true;
    });
    
    // Sort by position (forward order to build result correctly)
    filteredReplacements.sort((a, b) => a.start - b.start);
    
    // Apply replacements by building a new string
    let result = '';
    let lastEnd = 0;
    
    filteredReplacements.forEach(r => {
      // Add the text before this replacement
      result += normalizedText.slice(lastEnd, r.start);
      
      // Add the replacement
      let replacement;
      if (r.isSearchTerm) {
        // Highlight search terms with a different style
        replacement = `<span class="search-highlight" style="background-color: #fef3c7; font-weight: 600; padding: 2px 0; border-radius: 3px; box-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);">${r.match}</span>`;
      } else if (r.type === 'literary') {
        // Highlight literary works with purple/violet theme - make them clickable like other entities
        const work = r.entity;
        // Use consistent entity-literary class for all books
        replacement = `<span class="entity-highlight entity-literary literary-highlight" data-entity="${work.title}" data-author="${work.author}" data-type="literary" data-bookid="${work.bookId || ''}">${r.match}</span>`;
      } else if (r.type === 'author') {
        // Highlight authors with orange theme when near their books
        const authorEntity = r.entity;
        replacement = `<span class="entity-highlight entity-author author-highlight" data-entity="${authorEntity.name || authorEntity.author}" data-type="author" data-relatedbook="${authorEntity.relatedBook || ''}">${r.match}</span>`;
      } else if (r.type === 'music-video') {
        // Subtle highlighting for music/video references - just bold purple text
        replacement = `<span class="entity-highlight entity-music-video" data-entity="${r.entity.name}" data-type="music-video" style="color: #581C87; font-weight: 600; cursor: pointer; position: relative;" title="🎵 Video">${r.match}</span>`;
      } else if (r.type === 'person' || r.type === 'place') {
        // Highlight persons and places with appropriate styles
        const entityClass = r.type === 'person' ? 'entity-person' : 'entity-place';
        replacement = `<span class="entity-highlight ${entityClass}" data-entity="${r.entity.name}" data-type="${r.type}">${r.match}</span>`;
      } else {
        // Highlight other entities as before
        replacement = `<span class="entity-highlight entity-${r.entity.type}" data-entity="${r.entity.name}" data-type="${r.entity.type}" data-mentions="${r.entity.totalMentions || ''}">${r.match}</span>`;
      }
      
      result += replacement;
      lastEnd = r.end;
    });
    
    // Add any remaining text after the last replacement
    result += normalizedText.slice(lastEnd);
    
    return result;
  }, [highlightedSearchTerm]);

  // Get chapter for a given page
  const getChapterForPage = (pageNumber: number): string => {
    for (const chapter of BOOK_STRUCTURE) {
      if (pageNumber >= chapter.startPage && pageNumber <= chapter.endPage) {
        return chapter.title;
      }
    }
    return 'Unknown';
  };

  // Show entity occurrences using Search & Discover modal
  const showEntityOccurrences = useCallback((entityName: string) => {
    // Handle potential entity name mapping
    // For example, if "Chelsea Hotel" is stored in ENTITY_CONTEXTS but the display/search should be "Hotel Chelsea"
    let searchTerm = entityName;
    
    // Special handling for Hotel Chelsea (entity stored as "Chelsea Hotel" but should search as "Hotel Chelsea")
    if (entityName === "Chelsea Hotel") {
      searchTerm = "Hotel Chelsea";
    }
    
    // Open Search & Discover modal with the entity name pre-populated
    setInitialSearchTerm(searchTerm);
    setShowSearch(true);
    // Clear the old selectedEntity state to prevent the old modal from showing
    setSelectedEntity(null);
  }, []);

  // Navigate to specific page from entity mentions
  const navigateToEntityMention = useCallback((pageNumber: number) => {
    const pageIndex = pages.findIndex(p => p.pageNumber === pageNumber);
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      setSelectedEntity(null);
      window.scrollTo(0, 0);
    }
  }, [pages]);

  // Handle search navigation with context highlighting using URL parameters
  const handleSearchNavigate = useCallback((pageIndex: number, searchTerm?: string, context?: string) => {
    console.log('🔍 handleSearchNavigate called:', { pageIndex, searchTerm, hasContext: !!context });
    
    // Set URL parameters to trigger context highlighting after page loads
    if (searchTerm && context) {
      // Ensure the full search term is properly encoded
      const params = new URLSearchParams();
      params.set('fromSearch', 'true');
      params.set('searchTerm', searchTerm); // Full search term, properly encoded
      params.set('context', context.substring(0, 200)); // Limit context length for URL
      
      console.log('📝 Setting URL params with search term:', searchTerm);
      window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    }
    
    // Navigate to the page
    setCurrentPageIndex(pageIndex);
    
    // Don't set search term here - let the URL parameter effect handle it
    // This ensures proper timing with page render
    if (searchTerm) {
      // Don't call applyDualHighlighting here - let the useEffect handle it
      // based on URL parameters to avoid duplicate calls
      console.log('📝 Search navigation triggered, URL params set');
    }
  }, [pages]);

  if (isLoading) {
    return (
      <div className="paginated-book-viewer loading">
        <div className="loading-spinner">Loading book...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paginated-book-viewer error">
        <p>Error loading book: {error}</p>
      </div>
    );
  }

  const displayPageNumber = currentPage?.pageNumber === -1 ? 'XI' : currentPage?.pageNumber;
  const totalPages = pages.length;
  
  // Check if current page is a chapter start
  const isChapterStart = (pageNumber: number | undefined): boolean => {
    if (!pageNumber) return false;
    const chapterStartPages = [-1, 1, 33, 89, 211, 261, 285]; // Including foreword
    return chapterStartPages.includes(pageNumber);
  };

  // Render Blue Note two-panel layout if it's the Blue Note book
  if (isBlueNote) {
    return (
      <div className="paginated-book-viewer bluenote-viewer" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Left Panel - Book Content (60%) */}
        <div style={{
          width: '60%',
          height: '100%',
          overflowY: 'auto',
          borderRight: '2px solid #e5e7eb',
          padding: '2rem'
        }}>
          {/* Navigation Controls */}
          <div style={{
            position: 'sticky',
            top: 0,
            background: 'white',
            zIndex: 10,
            paddingBottom: '1rem',
            marginBottom: '2rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <Link href="/">
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <ArrowLeft size={16} />
                  Media Hub
                </button>
              </Link>

              <button
                onClick={() => {
                  setCurrentPageIndex(0);
                  window.scrollTo(0, 0);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                <BookOpen size={16} />
                Cover
              </button>

              <button
                onClick={() => {
                  setCurrentPageIndex(1);
                  window.scrollTo(0, 0);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                <Search size={16} />
                Index
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPageIndex === 0 ? '#e5e7eb' : '#1e3a8a',
                  color: currentPageIndex === 0 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPageIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <ChevronLeft size={20} />
                Previous
              </button>

              <span style={{
                padding: '0.5rem 1rem',
                background: '#f3f4f6',
                borderRadius: '6px',
                fontWeight: '600',
                color: 'black'
              }}>
                Page {currentPage?.pageNumber} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPageIndex === pages.length - 1}
                style={{
                  padding: '0.5rem 1rem',
                  background: currentPageIndex === pages.length - 1 ? '#e5e7eb' : '#1e3a8a',
                  color: currentPageIndex === pages.length - 1 ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPageIndex === pages.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Next
                <ChevronRight size={20} />
              </button>

              {currentPage?.originalData && (
                <span style={{ color: '#1e3a8a', fontSize: '150%', fontWeight: '600', marginLeft: '2rem' }}>
                  {(() => {
                    const data = currentPage.originalData;
                    if (data.type === 'album_showcase' && data.album) {
                      return `${data.album.artist} - ${data.album.title}${data.album.year ? ` (${data.album.year})` : ''}`;
                    } else if (data.type === 'page_image' && data.title) {
                      return data.title;
                    } else if (data.type === 'index') {
                      return 'Index';
                    } else if (data.type === 'cover') {
                      return `${data.title} - ${data.subtitle}`;
                    }
                    return data.title || '';
                  })()}
                </span>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
            {currentPage && currentPage.originalData && (
              <>
                {/* Render based on page type */}
                {currentPage.originalData.type === 'cover' && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 200px)'
                  }}>
                    {currentPage.originalData.cover_image && (
                      <img
                        src={currentPage.originalData.cover_image}
                        alt="Blue Note Cover"
                        style={{ maxWidth: '88%', maxHeight: '85vh', height: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                      />
                    )}
                  </div>
                )}

                {currentPage.originalData.type === 'page_image' && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100vh - 200px)'
                  }}>
                    {currentPage.originalData.image && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={currentPage.originalData.image}
                          alt={currentPage.originalData.title || "Page image"}
                          style={{ maxWidth: '88%', maxHeight: '85vh', height: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                        />

                        {/* FINAL INTERACTIVE HOTSPOTS for page 5 - STABLE POSITIONING */}
                        {currentPage.pageNumber === 5 && (
                          <>
                            {/* HOTSPOT 1 - Alfred Lion (Gold) */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '10.0439%',
                                left: '24.6852%',
                                width: '100px',
                                height: '30px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease',
                                zIndex: 10,
                                border: '2px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 215, 0, 0.4)';
                                e.target.style.border = '2px solid #FFD700';
                                e.target.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.border = '2px solid transparent';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => {
                                setDiscoveryResults([{
                                  type: 'biography',
                                  title: 'Alfred Lion',
                                  subtitle: 'Co-founder of Blue Note Records',
                                  description: 'Alfred Lion (1908-1987) was a German-American record producer and jazz enthusiast who co-founded Blue Note Records in 1939 with Francis Wolff. Born in Berlin, Lion emigrated to New York and became one of the most influential figures in jazz recording history. His dedication to artistic integrity and respect for musicians made Blue Note a legendary label.',
                                  details: [
                                    'Co-founded Blue Note Records in 1939',
                                    'Produced recordings for John Coltrane, Thelonious Monk, Art Blakey',
                                    'Known for giving artists complete creative freedom',
                                    'Pioneered high-quality jazz recording techniques',
                                    'Sold Blue Note to Liberty Records in 1966'
                                  ]
                                }]);
                                setSelectedDiscoveryIndex(0);
                              }}
                              title="Alfred Lion - Co-founder of Blue Note Records"
                            />

                            {/* HOTSPOT 2 - Thelonious Monk (Blue) */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '15.7349%',
                                left: '19.8247%',
                                width: '120px',
                                height: '30px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease',
                                zIndex: 10,
                                border: '2px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(69, 183, 209, 0.4)';
                                e.target.style.border = '2px solid #45b7d1';
                                e.target.style.boxShadow = '0 4px 15px rgba(69, 183, 209, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.border = '2px solid transparent';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => {
                                console.log('🎹 Thelonious Monk clicked!');
                                // Check if this album is already displayed - if so, clear it (toggle off)
                                if (discoveryResults.length > 0 && discoveryResults[0].title === 'Thelonious Monk' && discoveryResults[0].type === 'album_cover') {
                                  console.log('🎹 Toggling off - clearing discovery results');
                                  setDiscoveryResults([]);
                                  setSelectedDiscoveryIndex(0);
                                  setIsAlbumAudioPlaying(false);
                                } else {
                                  // Show the album cover with video
                                  const albumData = {
                                    type: 'album_cover',
                                    title: 'Thelonious Monk',
                                    subtitle: 'Genius of Modern Music',
                                    image: '/thelonious-monk-cover.png',
                                    videoId: 'dG1BADiWfdU'
                                  };
                                  console.log('🎹 Setting discovery results:', albumData);
                                  setDiscoveryResults([albumData]);
                                  setSelectedDiscoveryIndex(0);
                                  setIsAlbumAudioPlaying(false);
                                  console.log('🎹 Discovery results set complete');
                                }
                              }}
                              title="Thelonious Monk - Jazz Piano Pioneer"
                            />

                            {/* HOTSPOT 3 - Herbie Hancock (Blue) */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '19.5289%',
                                left: '27.5631%',
                                width: '110px',
                                height: '30px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease',
                                zIndex: 10,
                                border: '2px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(69, 183, 209, 0.4)';
                                e.target.style.border = '2px solid #45b7d1';
                                e.target.style.boxShadow = '0 4px 15px rgba(69, 183, 209, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.border = '2px solid transparent';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => {
                                console.log('🎹 Herbie Hancock clicked!');
                                // Check if this album is already displayed - if so, clear it (toggle off)
                                if (discoveryResults.length > 0 && discoveryResults[0].title === 'Herbie Hancock' && discoveryResults[0].type === 'album_cover') {
                                  console.log('🎹 Toggling off - clearing discovery results');
                                  setDiscoveryResults([]);
                                  setSelectedDiscoveryIndex(0);
                                  setIsAlbumAudioPlaying(false);
                                } else {
                                  // Show the album cover with video
                                  const albumData = {
                                    type: 'album_cover',
                                    title: 'Herbie Hancock',
                                    subtitle: 'Takin\' Off',
                                    image: '/herbie-hancock-cover.png',
                                    videoId: 'CrmFJjmRIi4'
                                  };
                                  console.log('🎹 Setting discovery results:', albumData);
                                  setDiscoveryResults([albumData]);
                                  setSelectedDiscoveryIndex(0);
                                  setIsAlbumAudioPlaying(false);
                                  console.log('🎹 Discovery results set complete');
                                }
                              }}
                              title="Herbie Hancock - Jazz Piano Innovator"
                            />

                            {/* HOTSPOT 4 - Rudy Van Gelder (Purple) */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '65.4632%',
                                left: '40.4369%',
                                width: '130px',
                                height: '30px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent',
                                borderRadius: '6px',
                                transition: 'all 0.3s ease',
                                zIndex: 10,
                                border: '2px solid transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(165, 94, 234, 0.4)';
                                e.target.style.border = '2px solid #a55eea';
                                e.target.style.boxShadow = '0 4px 15px rgba(165, 94, 234, 0.5)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.border = '2px solid transparent';
                                e.target.style.boxShadow = 'none';
                              }}
                              onClick={() => {
                                setDiscoveryResults([{
                                  type: 'biography',
                                  title: 'Rudy Van Gelder',
                                  subtitle: 'Legendary Recording Engineer',
                                  description: 'Rudy Van Gelder (1924-2016) was an American recording engineer who specialized in jazz and is considered one of the most important recording engineers in music history. He engineered thousands of albums including many of the most famous Blue Note Records releases, creating the distinctive "Blue Note sound."',
                                  details: [
                                    'Engineered over 2,000 jazz albums including most Blue Note classics',
                                    'Developed innovative microphone techniques for jazz recording',
                                    'Worked from his parents\' living room (1952-1959) then custom studio',
                                    'Created the warm, intimate sound associated with Blue Note Records',
                                    'Received Grammy Trustees Award for lifetime achievement in 2002'
                                  ]
                                }]);
                                setSelectedDiscoveryIndex(0);
                              }}
                              title="Rudy Van Gelder - Legendary Recording Engineer"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {currentPage.originalData.type === 'album_showcase' && (
                  currentPage.originalData.image ? (
                    // If it has an image property, render it like a page_image
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 'calc(100vh - 200px)'
                    }}>
                      <img
                        src={currentPage.originalData.image}
                        alt={currentPage.originalData.title || "Album cover"}
                        style={{ maxWidth: '88%', maxHeight: '85vh', height: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                      />
                    </div>
                  ) : (
                    // Original album showcase rendering
                    <>
                      {currentPage.chapterTitle && (
                        <h2 style={{
                          fontSize: '24px',
                          fontWeight: 'bold',
                          marginBottom: '1rem',
                          color: '#1e3a8a'
                        }}>
                          {currentPage.chapterTitle}
                        </h2>
                      )}
                      <div dangerouslySetInnerHTML={{
                        __html: highlightEntitiesInText(currentPage.content)
                      }} />
                    </>
                  )
                )}

                {currentPage.originalData.type === 'test_integration' && (
                  <div style={{ padding: '2rem' }}>
                    <h2 style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#1e3a8a',
                      marginBottom: '1.5rem',
                      textAlign: 'center'
                    }}>
                      {currentPage.originalData.title}
                    </h2>
                    <div style={{
                      fontSize: '18px',
                      lineHeight: '1.6',
                      color: '#374151',
                      textAlign: 'center'
                    }}>
                      {currentPage.originalData.content}
                    </div>
                    {currentPage.originalData.note && (
                      <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontStyle: 'italic',
                        color: '#6b7280',
                        textAlign: 'center'
                      }}>
                        {currentPage.originalData.note}
                      </div>
                    )}
                  </div>
                )}

                {currentPage.originalData.type === 'index' && (
                  <div style={{ padding: '0.5rem 0 2rem 0' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '1.5rem' }}>
                      {currentPage.originalData.title}
                    </h2>
                    <p style={{ fontSize: '18px', marginBottom: '1.5rem', color: '#6b7280' }}>
                      {currentPage.originalData.note}
                    </p>
                    {currentPage.originalData.sections?.map((section: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '3rem' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: '#1e3a8a' }}>
                          {section.title}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(216px, 1fr))', gap: '1.8rem' }}>
                          {section.pages?.map((page: number, pageIdx: number) => (
                            <div
                              key={pageIdx}
                              style={{
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '0.75rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                background: '#f9fafb',
                                overflow: 'hidden'
                              }}
                              onClick={() => {
                                const pageIndex = pages.findIndex(p => p.pageNumber === page);
                                if (pageIndex !== -1) setCurrentPageIndex(pageIndex);
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              {/* Show thumbnail image for album pages */}
                              {section.albums && (
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <img
                                    src={
                                      page === 7 ? '/bluenote-page7-bluetrain-thumb.png' :
                                      page === 8 ? '/bluenote-page9-thumb.png' :
                                      page === 9 ? '/bluenote-page15-thumb.png' :
                                      page === 10 ? '/bluenote-page10-correct-thumb.png' :
                                      page === 11 ? '/bluenote-page14-thumb.png' :
                                      page === 12 ? '/bluenote-page17-thumb.png' :
                                      page === 13 ? '/bluenote-page13-thumb.png' :
                                      page === 14 ? '/bluenote-page14-thumb.png' :
                                      page === 15 ? '/bluenote-page15-thumb.png' :
                                      page === 16 ? '/bluenote-page16-thumb.png' :
                                      page === 17 ? '/bluenote-page17-thumb.png' :
                                      '/bluenote-cover.png'
                                    }
                                    alt={section.albums[pageIdx]}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      aspectRatio: '1',
                                      objectFit: 'cover',
                                      borderRadius: '4px'
                                    }}
                                  />
                                </div>
                              )}
                              {/* Show thumbnail images for history pages */}
                              {section.thumbnails && (
                                <div style={{ marginBottom: '0.9rem' }}>
                                  <img
                                    src={`/bluenote-page${page}.png`}
                                    alt={`Page ${page}`}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      aspectRatio: '1',
                                      objectFit: 'contain',
                                      borderRadius: '4px',
                                      backgroundColor: '#f3f4f6'
                                    }}
                                  />
                                </div>
                              )}
                              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                                Page {page}
                              </div>
                              {section.albums && (
                                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.3' }}>
                                  {section.albums[pageIdx]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Default text rendering for other types */}
                {!['cover', 'page_image', 'album_showcase', 'index', 'test_integration'].includes(currentPage.originalData.type) && (
                  <>
                    {currentPage.chapterTitle && (
                      <h2 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        marginBottom: '1rem',
                        color: '#1e3a8a'
                      }}>
                        {currentPage.chapterTitle}
                      </h2>
                    )}
                    <div dangerouslySetInnerHTML={{
                      __html: highlightEntitiesInText(currentPage.content)
                    }} />
                  </>
                )}
              </>
            )}
            {/* Fallback for pages without originalData */}
            {currentPage && !currentPage.originalData && (
              <>
                {currentPage.chapterTitle && (
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    color: '#1e3a8a'
                  }}>
                    {currentPage.chapterTitle}
                  </h2>
                )}
                <div dangerouslySetInnerHTML={{
                  __html: highlightEntitiesInText(currentPage.content)
                }} />
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Media Area (40%) */}
        <div style={{
          width: '40%',
          height: '100%',
          background: '#f9fafb',
          padding: '2rem',
          overflowY: 'auto'
        }}>
          {(() => {
            if (currentPage?.originalData?.type === 'test_integration') {
              return (
            // YouTube Analysis Test Integration
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedVideo ? (
                // Video Player View
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <button
                      onClick={closeVideo}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#374151',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e5e7eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                      }}
                    >
                      ← Back to Search
                    </button>


                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      Playing Video
                    </div>
                  </div>

                  {/* Show Playlist Data Modal */}
                  {showPlaylistView && videoPlaylistData && (
                    <>
                      {/* Modal Background Overlay */}
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} onClick={() => setShowPlaylistView(false)}>
                        {/* Modal Content */}
                        <div style={{
                          position: 'relative',
                          width: '90%',
                          maxWidth: '600px',
                          maxHeight: '90vh',
                          background: 'white',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          overflowY: 'auto',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                        }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>
                          📚 Works & Playlists
                        </h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          {/* Playlist Counter */}
                          <div style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600'
                          }}>
                            🎵 Playlist: {currentPlaylist.length} tracks
                          </div>
                          {currentPlaylist.length > 0 && (
                            <>
                              <button
                                onClick={() => {
                                  playPlaylist();
                                  setShowPlaylistView(false);
                                }}
                                style={{
                                  background: '#3b82f6',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  fontWeight: '600'
                                }}
                              >
                                ▶ Play All
                              </button>
                              <button
                                onClick={clearPlaylist}
                                style={{
                                  background: '#f59e0b',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '0.5rem 1rem',
                                  cursor: 'pointer',
                                  fontSize: '16px',
                                  fontWeight: '600'
                                }}
                              >
                                Clear
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setShowPlaylistView(false)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.5rem 1rem',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            ✕ Close
                          </button>
                        </div>
                      </div>

                      {/* Works Section */}
                      {videoPlaylistData.works && videoPlaylistData.works.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '22px', fontWeight: '600', color: '#000' }}>
                              🎵 Works Mentioned ({videoPlaylistData.works.length})
                            </h4>
                            <button
                              onClick={() => toggleAllWorks(false)}
                              style={{
                                background: areAllWorksAdded(false) ? '#ef4444' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}
                            >
                              {areAllWorksAdded(false) ? '- Remove All' : '+ Add All'}
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {videoPlaylistData.works.map((work: any, idx: number) => {
                              const isAdded = currentPlaylist.some(item =>
                                item.title === work.title && item.artist === work.artist
                              );
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    background: isAdded ? '#dcfce7' : '#f0fdf4',
                                    border: isAdded ? '2px solid #16a34a' : '2px solid #22c55e',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    fontSize: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#000',
                                    opacity: isAdded ? 0.8 : 1
                                  }}
                                >
                                  <button
                                    onClick={() => toggleIndividualSong(work)}
                                    style={{
                                      background: isAdded ? '#ef4444' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '0.25rem 0.5rem',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      marginRight: '0.5rem'
                                    }}
                                  >
                                    {isAdded ? '- Remove' : '+ Add'}
                                  </button>
                                  <strong>{work.title}</strong> - {work.artist}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Playlists Section */}
                      {videoPlaylistData.playlists && videoPlaylistData.playlists.length > 0 && (
                        <div>
                          <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '1rem', color: '#000' }}>
                            🎼 Discovery Playlists ({videoPlaylistData.playlists.length})
                          </h4>
                          <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                            {videoPlaylistData.playlists.map((playlist: any, idx: number) => (
                              <div
                                key={idx}
                                style={{
                                  marginBottom: '1.5rem',
                                  background: '#faf5ff',
                                  border: '2px solid #8b5cf6',
                                  borderRadius: '8px',
                                  padding: '1rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                  <h5 style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                                    {playlist.name}
                                  </h5>
                                  <button
                                    onClick={() => toggleAllPlaylistTracks(playlist.name, playlist.tracks)}
                                    style={{
                                      background: areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '#ef4444' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.4rem 0.8rem',
                                      cursor: 'pointer',
                                      fontSize: '15px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    {areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '- Remove All' : '+ Add All'}
                                  </button>
                                </div>
                                <div style={{ fontSize: '16px', color: '#000' }}>
                                  {playlist.tracks.map((track: any, tidx: number) => {
                                    const isAdded = currentPlaylist.some(item =>
                                      item.title === track.title && item.artist === track.artist
                                    );
                                    return (
                                      <div
                                        key={tidx}
                                        style={{
                                          marginBottom: '0.5rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          padding: '0.25rem 0.5rem',
                                          background: isAdded ? '#dcfce7' : 'transparent',
                                          borderRadius: '4px'
                                        }}
                                      >
                                        <button
                                          onClick={() => toggleIndividualSong(track)}
                                          style={{
                                            background: isAdded ? '#ef4444' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            padding: '0.2rem 0.4rem',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            opacity: 1
                                          }}
                                        >
                                          {isAdded ? '- Remove' : '+ Add'}
                                        </button>
                                        <span style={{ opacity: isAdded ? 0.8 : 1 }}>
                                          <strong>"{track.title}"</strong> - {track.artist}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Playlist Player Modal - Shows YouTube videos for playlist tracks */}
                  {showPlaylistPlayer && (
                    <>
                      {/* Modal Background Overlay */}
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }} onClick={() => {
                        setShowPlaylistPlayer(false);
                        setPlaylistVideos([]);
                        setCurrentTrackIndex(0);
                        // Restore the saved video HTML
                        if (savedVideoEmbedHtml) {
                          setVideoEmbedHtml(savedVideoEmbedHtml);
                        }
                      }}>
                        {/* Modal Content */}
                        <div style={{
                          position: 'relative',
                          width: '95%',
                          maxWidth: '1400px',
                          height: '90vh',
                          background: '#1a1a1a',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }} onClick={(e) => e.stopPropagation()}>

                          {/* Header */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1rem',
                            borderBottom: '2px solid #333',
                            paddingBottom: '1rem'
                          }}>
                            <h2 style={{
                              fontSize: '28px',
                              fontWeight: 'bold',
                              color: '#fff'
                            }}>
                              🎵 Playing Playlist ({currentPlaylist.length} tracks)
                            </h2>
                            <button
                              onClick={() => {
                                setShowPlaylistPlayer(false);
                                setPlaylistVideos([]);
                                setCurrentTrackIndex(0);
                                // Restore the saved video HTML
                                if (savedVideoEmbedHtml) {
                                  setVideoEmbedHtml(savedVideoEmbedHtml);
                                }
                              }}
                              style={{
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}
                            >
                              ✕ Close
                            </button>
                          </div>

                          {/* Loading State */}
                          {loadingPlaylistVideos && (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              color: '#fff',
                              fontSize: '24px'
                            }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ marginBottom: '1rem' }}>🔍 Searching YouTube for tracks...</div>
                                <div style={{ fontSize: '16px', color: '#888' }}>This may take a few seconds</div>
                              </div>
                            </div>
                          )}

                          {/* Main Content Area */}
                          {!loadingPlaylistVideos && playlistVideos.length > 0 && (
                            <div style={{
                              display: 'flex',
                              gap: '1.5rem',
                              flex: 1,
                              overflow: 'hidden'
                            }}>
                              {/* Left Side - Video Player */}
                              <div style={{
                                flex: '1 1 70%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem'
                              }}>
                                {/* Current Track Info */}
                                <div style={{
                                  background: '#2a2a2a',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  color: '#fff'
                                }}>
                                  <div style={{ fontSize: '14px', color: '#888', marginBottom: '0.5rem' }}>
                                    Now Playing
                                  </div>
                                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                                    {playlistVideos[currentTrackIndex]?.title}
                                  </div>
                                  <div style={{ fontSize: '22px', color: '#10b981', fontWeight: '600' }}>
                                    {playlistVideos[currentTrackIndex]?.artist}
                                  </div>
                                  {playlistVideos[currentTrackIndex]?.videoTitle && (
                                    <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '0.75rem', fontStyle: 'italic' }}>
                                      YouTube: {playlistVideos[currentTrackIndex].videoTitle}
                                    </div>
                                  )}
                                </div>

                                {/* YouTube Video Embed */}
                                {playlistVideos[currentTrackIndex]?.videoId ? (
                                  <iframe
                                    key={playlistVideos[currentTrackIndex].videoId}
                                    src={`https://www.youtube.com/embed/${playlistVideos[currentTrackIndex].videoId}?autoplay=0&rel=0`}
                                    style={{
                                      width: '100%',
                                      flex: 1,
                                      border: 'none',
                                      borderRadius: '8px',
                                      background: '#000'
                                    }}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#2a2a2a',
                                    borderRadius: '8px',
                                    color: '#888'
                                  }}>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '24px', marginBottom: '1rem' }}>❌ Video not found</div>
                                      <div>Could not find a YouTube video for this track</div>
                                    </div>
                                  </div>
                                )}

                                {/* Player Controls */}
                                <div style={{
                                  display: 'flex',
                                  gap: '1rem',
                                  justifyContent: 'center',
                                  padding: '1rem',
                                  background: '#2a2a2a',
                                  borderRadius: '8px'
                                }}>
                                  <button
                                    onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                                    disabled={currentTrackIndex === 0}
                                    style={{
                                      background: currentTrackIndex === 0 ? '#555' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.75rem 1.5rem',
                                      cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ⏮ Previous
                                  </button>
                                  <button
                                    onClick={() => setCurrentTrackIndex(Math.min(playlistVideos.length - 1, currentTrackIndex + 1))}
                                    disabled={currentTrackIndex === playlistVideos.length - 1}
                                    style={{
                                      background: currentTrackIndex === playlistVideos.length - 1 ? '#555' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.75rem 1.5rem',
                                      cursor: currentTrackIndex === playlistVideos.length - 1 ? 'not-allowed' : 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    Next ⏭
                                  </button>
                                </div>
                              </div>

                              {/* Right Side - Playlist */}
                              <div style={{
                                flex: '0 0 30%',
                                background: '#2a2a2a',
                                borderRadius: '8px',
                                padding: '1rem',
                                overflowY: 'auto'
                              }}>
                                <h3 style={{
                                  fontSize: '22px',
                                  fontWeight: 'bold',
                                  color: '#fff',
                                  marginBottom: '1rem',
                                  borderBottom: '1px solid #444',
                                  paddingBottom: '0.5rem'
                                }}>
                                  Playlist Tracks
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {playlistVideos.map((video, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => setCurrentTrackIndex(idx)}
                                      style={{
                                        background: idx === currentTrackIndex ? '#3b82f6' : '#333',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: idx === currentTrackIndex ? '2px solid #60a5fa' : '2px solid transparent'
                                      }}
                                    >
                                      <div style={{
                                        fontSize: '12px',
                                        color: '#888',
                                        marginBottom: '0.25rem'
                                      }}>
                                        Track {idx + 1}
                                      </div>
                                      <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        marginBottom: '0.25rem'
                                      }}>
                                        {video.title}
                                      </div>
                                      <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#10b981'
                                      }}>
                                        {video.artist}
                                      </div>
                                      {video.videoId && (
                                        <div style={{
                                          fontSize: '12px',
                                          color: idx === currentTrackIndex ? '#bfdbfe' : '#888',
                                          marginTop: '0.5rem'
                                        }}>
                                          ✓ Video found
                                        </div>
                                      )}
                                      {video.error && (
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#f87171',
                                          marginTop: '0.5rem'
                                        }}>
                                          ✗ No video
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <iframe
                    ref={videoIframeRef}
                    srcDoc={videoEmbedHtml}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      flex: 1
                    }}
                    title={selectedVideo.title}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                // Search Interface View
                <div>

              <div style={{ padding: '2rem', color: '#1f2937' }}>
                <p style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '20px', fontWeight: '700', color: '#000000' }}>
                  Search YouTube Analysis Videos
                </p>
                <p style={{ fontSize: '18px', marginBottom: '1.5rem', textAlign: 'center', color: '#000000', fontWeight: '600' }}>
                  Enter a search term to find related videos
                </p>

                <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Enter search term..."
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '2px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }}
                    />
                    <button
                      type="submit"
                      disabled={searchLoading}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: searchLoading ? '#dc2626' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'background 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!searchLoading) {
                          e.currentTarget.style.background = '#15803d';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!searchLoading) {
                          e.currentTarget.style.background = '#16a34a';
                        }
                      }}
                    >
                      {searchLoading ? '🔄 Searching...' : '🔍 Search'}
                    </button>
                  </div>
                </form>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '18px', marginBottom: '1rem', color: '#1f2937', fontWeight: '600' }}>
                    Quick Search:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                    {['Blue Note', 'John Coltrane', 'Miles Davis'].map((subject: string) => (
                      <button
                        key={subject}
                        onClick={() => {
                          setAiQuery(subject);
                          searchVideos(subject);
                        }}
                        style={{
                          padding: '0.75rem 1.25rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#2563eb';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div style={{
                    padding: '1rem',
                    background: '#fee2e2',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    color: '#dc2626'
                  }}>
                    {searchError}
                  </div>
                )}

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                      Search Results ({searchResults.length})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                      {searchResults.map((video: any) => (
                        <div
                          key={video.id}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            background: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                          }}
                          onClick={() => embedVideo(video)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                          }}
                        >
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                          )}
                          <div style={{ padding: '1rem' }}>
                            <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                              {video.title}
                            </p>
                            <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                              {video.channel} • {video.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
            </div>
          );
            } else if (currentPage?.originalData?.type === 'album_showcase') {
              return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedVideo ? (
                    // Video Player View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <button
                          onClick={closeVideo}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                        >
                          ← Back to Search
                        </button>
                      </div>

                      {showPlaylistView && videoPlaylistData && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => setShowPlaylistView(false)}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '90%',
                              maxWidth: '600px',
                              maxHeight: '90vh',
                              background: 'white',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              overflowY: 'auto',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>
                                  📚 Works & Playlists
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  {/* Playlist Counter */}
                                  <div style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    🎵 Playlist: {currentPlaylist.length} tracks
                                  </div>
                                  {currentPlaylist.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => {
                                          playPlaylist();
                                          setShowPlaylistView(false);
                                        }}
                                        style={{
                                          background: '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ▶ Play All
                                      </button>
                                      <button
                                        onClick={clearPlaylist}
                                        style={{
                                          background: '#f59e0b',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Clear
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setShowPlaylistView(false)}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close
                                  </button>
                                </div>
                              </div>

                              {/* Works Section */}
                              {videoPlaylistData.works && videoPlaylistData.works.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '22px', fontWeight: '600', color: '#000' }}>
                                      🎵 Works Mentioned ({videoPlaylistData.works.length})
                                    </h4>
                                    <button
                                      onClick={() => toggleAllWorks(true)}
                                      style={{
                                        background: areAllWorksAdded(true) ? '#ef4444' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      {areAllWorksAdded(true) ? '- Remove All' : '+ Add All'}
                                    </button>
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {videoPlaylistData.works.map((work: any, idx: number) => {
                                      const isAdded = currentPlaylist.some(item =>
                                        item.title === work.title && item.artist === work.artist
                                      );
                                      return (
                                        <div
                                          key={idx}
                                          style={{
                                            background: isAdded ? '#dcfce7' : '#f0fdf4',
                                            border: isAdded ? '2px solid #16a34a' : '2px solid #22c55e',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem',
                                            fontSize: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#000',
                                            opacity: isAdded ? 0.8 : 1
                                          }}
                                        >
                                          <button
                                            onClick={() => toggleIndividualSong(work)}
                                            style={{
                                              background: isAdded ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              padding: '0.25rem 0.5rem',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              marginRight: '0.5rem'
                                            }}
                                          >
                                            {isAdded ? '- Remove' : '+ Add'}
                                          </button>
                                          <strong>{work.title}</strong> - {work.artist}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Playlists Section */}
                              {videoPlaylistData.playlists && videoPlaylistData.playlists.length > 0 && (
                                <div>
                                  <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '1rem', color: '#000' }}>
                                    🎼 Discovery Playlists ({videoPlaylistData.playlists.length})
                                  </h4>
                                  <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                    {videoPlaylistData.playlists.map((playlist: any, idx: number) => (
                                      <div
                                        key={idx}
                                        style={{
                                          marginBottom: '1.5rem',
                                          background: '#faf5ff',
                                          border: '2px solid #8b5cf6',
                                          borderRadius: '8px',
                                          padding: '1rem'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                          <h5 style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                                            {playlist.name}
                                          </h5>
                                          <button
                                            onClick={() => toggleAllPlaylistTracks(playlist.name, playlist.tracks)}
                                            style={{
                                              background: areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '6px',
                                              padding: '0.4rem 0.8rem',
                                              cursor: 'pointer',
                                              fontSize: '15px',
                                              fontWeight: '600'
                                            }}
                                          >
                                            {areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '- Remove All' : '+ Add All'}
                                          </button>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#000' }}>
                                          {playlist.tracks.map((track: any, tidx: number) => {
                                            const isAdded = currentPlaylist.some(item =>
                                              item.title === track.title && item.artist === track.artist
                                            );
                                            return (
                                              <div
                                                key={tidx}
                                                style={{
                                                  marginBottom: '0.5rem',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '0.5rem',
                                                  padding: '0.25rem 0.5rem',
                                                  background: isAdded ? '#dcfce7' : 'transparent',
                                                  borderRadius: '4px'
                                                }}
                                              >
                                                <button
                                                  onClick={() => toggleIndividualSong(track)}
                                                  style={{
                                                    background: isAdded ? '#ef4444' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '0.2rem 0.4rem',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    opacity: 1
                                                  }}
                                                >
                                                  {isAdded ? '- Remove' : '+ Add'}
                                                </button>
                                                <span style={{ opacity: isAdded ? 0.8 : 1 }}>
                                                  <strong>"{track.title}"</strong> - {track.artist}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Playlist Player Modal - Shows YouTube videos for playlist tracks */}
                      {showPlaylistPlayer && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => {
                            setShowPlaylistPlayer(false);
                            setPlaylistVideos([]);
                            setCurrentTrackIndex(0);
                            // Restore the saved video HTML
                            if (savedVideoEmbedHtml) {
                              setVideoEmbedHtml(savedVideoEmbedHtml);
                            }
                          }}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '95%',
                              maxWidth: '1400px',
                              height: '90vh',
                              background: '#1a1a1a',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }} onClick={(e) => e.stopPropagation()}>

                              {/* Header */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                borderBottom: '2px solid #333',
                                paddingBottom: '1rem'
                              }}>
                                <h2 style={{
                                  fontSize: '28px',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  margin: 0
                                }}>
                                  🎵 Playlist Player ({playlistVideos.length} videos)
                                </h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <div style={{
                                    background: '#4ade80',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    Track {currentTrackIndex + 1} of {playlistVideos.length}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowPlaylistPlayer(false);
                                      setPlaylistVideos([]);
                                      setCurrentTrackIndex(0);
                                    }}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close Player
                                  </button>
                                </div>
                              </div>

                              {/* Main Content Area */}
                              <div style={{ display: 'flex', flex: 1, gap: '1rem', height: 'calc(100% - 80px)' }}>
                                {/* Video Player */}
                                <div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
                                  {playlistVideos[currentTrackIndex] ? (
                                    <>
                                      <div style={{ marginBottom: '1rem' }}>
                                        <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '0.5rem' }}>
                                          {playlistVideos[currentTrackIndex].title}
                                        </h3>
                                        <p style={{ color: '#999', fontSize: '16px' }}>
                                          {playlistVideos[currentTrackIndex].channel}
                                        </p>
                                      </div>
                                      <iframe
                                        src={`https://www.youtube.com/embed/${playlistVideos[currentTrackIndex].videoId}?autoplay=0`}
                                        style={{
                                          width: '100%',
                                          flex: 1,
                                          border: 'none',
                                          borderRadius: '8px',
                                          background: '#000'
                                        }}
                                        title={playlistVideos[currentTrackIndex].title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                      {/* Player Controls */}
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '1rem',
                                        marginTop: '1rem'
                                      }}>
                                        <button
                                          onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                                          disabled={currentTrackIndex === 0}
                                          style={{
                                            background: currentTrackIndex === 0 ? '#666' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.75rem 1.5rem',
                                            cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                          }}
                                        >
                                          ⏮ Previous
                                        </button>
                                        <button
                                          onClick={() => setCurrentTrackIndex(Math.min(playlistVideos.length - 1, currentTrackIndex + 1))}
                                          disabled={currentTrackIndex === playlistVideos.length - 1}
                                          style={{
                                            background: currentTrackIndex === playlistVideos.length - 1 ? '#666' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '0.75rem 1.5rem',
                                            cursor: currentTrackIndex === playlistVideos.length - 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                          }}
                                        >
                                          Next ⏭
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: '100%',
                                      color: 'white',
                                      fontSize: '18px'
                                    }}>
                                      Loading video...
                                    </div>
                                  )}
                                </div>

                                {/* Playlist Sidebar */}
                                <div style={{
                                  flex: '1',
                                  background: '#2a2a2a',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  overflowY: 'auto'
                                }}>
                                  <h4 style={{ color: 'white', fontSize: '18px', marginBottom: '1rem' }}>
                                    Playlist Queue
                                  </h4>
                                  {playlistVideos.map((video: any, idx: number) => (
                                    <div
                                      key={idx}
                                      onClick={() => setCurrentTrackIndex(idx)}
                                      style={{
                                        padding: '0.75rem',
                                        marginBottom: '0.5rem',
                                        background: idx === currentTrackIndex ? '#3b82f6' : '#3a3a3a',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (idx !== currentTrackIndex) {
                                          e.currentTarget.style.background = '#4a4a4a';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (idx !== currentTrackIndex) {
                                          e.currentTarget.style.background = '#3a3a3a';
                                        }
                                      }}
                                    >
                                      <div style={{
                                        color: '#888',
                                        fontSize: '12px',
                                        marginBottom: '0.25rem'
                                      }}>
                                        Track {idx + 1}
                                      </div>
                                      <div style={{
                                        color: 'white',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        marginBottom: '0.25rem'
                                      }}>
                                        {video.title}
                                      </div>
                                      <div style={{
                                        color: '#10b981',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                      }}>
                                        {video.artist}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <iframe
                        ref={videoIframeRef}
                        srcDoc={videoEmbedHtml}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          flex: 1
                        }}
                        title={selectedVideo.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Search Interface View
                    <div>

                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="text"
                            className="united-tribes-search-input"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            placeholder="Search UnitedTribes videos"
                            style={{
                              width: '100%',
                              padding: '1rem 3.5rem 1rem 1.5rem',
                              border: '2px solid #1e3a8a',
                              borderRadius: '10px',
                              fontSize: '24px',
                              outline: 'none',
                              fontWeight: '500',
                              color: '#000',
                              backgroundColor: 'white',
                              lineHeight: '1.2'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.backgroundColor = '#f0f9ff';
                              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#1e3a8a';
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setAiQuery('');
                                setSearchResults([]);
                                setSearchError(null);
                              }}
                              style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                border: '2px solid #6b7280',
                                background: 'white',
                                color: '#6b7280',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#3b82f6';
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#6b7280';
                                e.currentTarget.style.color = '#6b7280';
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <button
                          type="submit"
                          style={{
                            padding: '1rem 2rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '20px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#2563eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#3b82f6';
                          }}
                        >
                          Search
                        </button>
                      </div>
                    </form>

                    {/* Search Results */}
                    {searchLoading && (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>
                        Searching videos...
                      </div>
                    )}

                    {searchError && (
                      <div style={{
                        padding: '1rem',
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}>
                        {searchError}
                      </div>
                    )}

                    {!searchLoading && searchResults.length > 0 && (
                      <div style={{ marginTop: '2rem', flex: 1, overflowY: 'auto' }}>
                        <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                          Search Results ({searchResults.length})
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                          {searchResults.map((video: any) => (
                            <div
                              key={video.id}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                              }}
                              onClick={() => embedVideo(video)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                            >
                              {video.thumbnail && (
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                              )}
                              <div style={{ padding: '1rem' }}>
                                <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                  {video.title}
                                </p>
                                <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                  {video.channel} • {video.duration}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        color: '#6b7280'
                      }}>
                        No results found for "{searchQuery}"
                      </div>
                    )}

                    {/* ENHANCED DISCOVERY PANEL - PAGE 9 (Dexter Gordon) */}
                    {currentPage?.originalData?.page === 9 && (
                      <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            🎵 UnitedTribes AI-Enhanced Discovery
                          </h3>
                          <button
                            onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#374151',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>

                        {discoveryPanelExpanded && (
                          <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                          <button
                            onClick={() => setDiscoveryTab('featured')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'featured' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Featured
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('read')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'read' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'read' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'read' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('watch')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'watch' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'watch' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'watch' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('music')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'music' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'music' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'music' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Music
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('explorer')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'explorer' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'explorer' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'explorer' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            United AI Explorer
                          </button>
                        </div>

                          {/* Tab Content */}
                          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          {discoveryTab === 'featured' && (
                            <div>
                              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>Featured Videos</h4>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {page9PreloadedVideos.map((video: any, idx: number) => (
                                  <div
                                    key={idx}
                                    onClick={() => embedVideo(video)}
                                    style={{
                                      cursor: 'pointer',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      background: 'white',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                      transition: 'transform 0.2s, box-shadow 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'scale(1.02)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    {video.thumbnail && (
                                      <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                      />
                                    )}
                                    <div style={{ padding: '1rem' }}>
                                      <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                        {video.title}
                                      </p>
                                      <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                        {video.channel} • {video.duration}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {discoveryTab === 'music' && (
                            <div>
                              {/* Dexter Gordon Album Cover with Audio Player */}
                              <div
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                    console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} Dexter Gordon - GO`);
                                  }
                                }}
                              >
                                <img
                                  src="https://m.media-amazon.com/images/I/61GwLV5SVHL._UF1000,1000_QL80_.jpg"
                                  alt="Dexter Gordon - GO"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                />
                                {isAlbumAudioPlaying && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    ♪ Playing...
                                  </div>
                                )}
                              </div>

                              {/* Hidden YouTube iframe for audio playback */}
                              <iframe
                                ref={albumAudioIframeRef}
                                src="https://www.youtube.com/embed/9u9XBnDZ8TA?enablejsapi=1&controls=0"
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  opacity: 0,
                                  pointerEvents: 'none'
                                }}
                                allow="autoplay"
                              />
                            </div>
                          )}

                          {discoveryTab === 'watch' && (
                            <div>
                              {/* Album Cover Display */}
                              {discoveryResults.length > 0 && discoveryResults[0].type === 'album_cover' && (
                                <div style={{ marginBottom: '2rem' }}>
                                  <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                                    {discoveryResults[0].title}
                                  </h4>
                                  {discoveryResults[0].subtitle && (
                                    <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '1rem' }}>
                                      {discoveryResults[0].subtitle}
                                    </p>
                                  )}
                                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                    <img
                                      src={discoveryResults[0].image}
                                      alt={discoveryResults[0].title}
                                      style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                                    />
                                  </div>
                                </div>
                              )}

                              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>🎬 Round Midnight (1986)</h4>

                              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                  Dexter Gordon's Acting Career
                                </p>
                                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                                  Dexter Gordon received an Academy Award nomination for Best Actor for his role
                                  in Bertrand Tavernier's "Round Midnight" - a rare honor for a jazz musician.
                                </p>
                              </div>

                              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                                  The film tells the story of an aging jazz saxophonist in Paris, inspired by the lives
                                  of Bud Powell and Lester Young.
                                </p>
                                <p style={{ fontSize: '14px', color: '#6b7280', fontStyle: 'italic' }}>
                                  Directed by Bertrand Tavernier
                                </p>
                              </div>

                              {/* Video Player */}
                              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                                  🎥 Watch the trailer:
                                </p>
                                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
                                  <iframe
                                    src="https://www.youtube.com/embed/JFIOUdVSTQw"
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      border: 'none',
                                      borderRadius: '8px'
                                    }}
                                    title="Round Midnight - Dexter Gordon"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              </div>

                              {/* Stream/Purchase Film */}
                              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#fef3c7', borderRadius: '6px', border: '2px solid #fbbf24' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                                  🎬 Stream the Film
                                </p>
                                <p style={{ fontSize: '13px', color: '#78350f', marginBottom: '1rem' }}>
                                  Available on Criterion Collection with restored picture and sound
                                </p>
                                <a
                                  href="https://www.criterion.com/films/28405-round-midnight"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '13px',
                                    color: '#fff',
                                    background: '#92400e',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontWeight: '600'
                                  }}
                                >
                                  Purchase from Criterion here
                                </a>
                              </div>

                              {/* Criterion Article */}
                              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                  📖 Criterion Collection: "Return from Exile"
                                </p>
                                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.5' }}>
                                  Deep dive into the making of Round Midnight and Dexter Gordon's remarkable comeback
                                </p>
                                <iframe
                                  src="https://www.criterion.com/current/posts/7757--round-midnight-return-from-exile"
                                  style={{
                                    width: '100%',
                                    height: '400px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    marginBottom: '0.5rem'
                                  }}
                                  title="Criterion - Round Midnight Article"
                                />
                                <a
                                  href="https://www.criterion.com/current/posts/7757--round-midnight-return-from-exile"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    color: '#3b82f6',
                                    textDecoration: 'underline'
                                  }}
                                >
                                  Open in new tab →
                                </a>
                              </div>

                              {/* New Yorker Article */}
                              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                  📰 The New Yorker: "A Feast of Music and Acting"
                                </p>
                                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem', lineHeight: '1.5' }}>
                                  Classic review of the film from The New Yorker archives
                                </p>
                                <img
                                  src="https://www.dropbox.com/scl/fi/ps1qr5mdigvfefjicnbxw/Round-Midnight-Revisited-A-Feast-of-Music-and-Acting-The-New-Yorker-2.png?rlkey=ox3tb9fqzkv4y6l2hluzu5ai1&raw=1"
                                  alt="The New Yorker article on Round Midnight"
                                  style={{
                                    width: '100%',
                                    borderRadius: '6px',
                                    marginBottom: '0.5rem',
                                    border: '1px solid #e5e7eb'
                                  }}
                                />
                                <a
                                  href="https://www.newyorker.com/magazine/2018/08/06/round-midnight-revisited-a-feast-of-music-and-acting"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '13px',
                                    color: '#fff',
                                    background: '#92400e',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    marginTop: '0.5rem'
                                  }}
                                >
                                  Read Full Article ($1.00)
                                </a>
                              </div>
                            </div>
                          )}

                          {discoveryTab === 'explorer' && (
                            <div>
                              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>🤖 United AI Explorer</h4>

                              <div style={{ padding: '2rem', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                                  AI-Powered Discovery Coming Soon
                                </p>
                                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                                  This tab will feature our special AI explorer API to help you discover deep connections
                                  between artists, albums, and cultural movements.
                                </p>
                                <p style={{ fontSize: '14px', color: '#3b82f6', marginTop: '1rem' }}>
                                  🔮 Stay tuned for intelligent recommendations and historical insights
                                </p>
                              </div>
                            </div>
                          )}

                          {discoveryTab === 'read' && (
                            <div>
                              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>📚 Related Books & Audio</h4>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>

                                {/* Kansas City Lightning */}
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                  <img
                                    src="https://www.harpercollins.com/cdn/shop/files/9780062005618_1618c813-096a-4f49-bebe-775d51820fcc.jpg?v=1759161105&width=350"
                                    alt="Kansas City Lightning"
                                    style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: '#f3f4f6' }}
                                  />
                                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Kansas City Lightning</h5>
                                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.75rem' }}>by Stanley Crouch</p>
                                  <button
                                    onClick={async () => {
                                      setCurrentBookUrl('https://www.harpercollins.com/products/kansas-city-lightning-stanley-crouch?variant=40974806220834');
                                      setCurrentBookId('kansas-city-lightning');

                                      // Preload the video for the modal
                                      try {
                                        const video = {
                                          id: 'stanely_crouch_on_kansas_city_lightning_the_rise_a',
                                          title: 'Stanley Crouch on "Kansas City Lightning: The Rise and Times of Charlie Parker"'
                                        };

                                        const response = await fetch(`/api/videos/${video.id}/embed-html`);
                                        if (response.ok) {
                                          const htmlContent = await response.text();
                                          setBookModalVideoHtml(htmlContent);
                                          setBookModalVideoData(video);
                                        }
                                      } catch (error) {
                                        console.error('Error loading video for modal:', error);
                                      }

                                      setShowBookModal(true);
                                    }}
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      padding: '0.75rem',
                                      background: '#00563f',
                                      color: 'white',
                                      textAlign: 'center',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Buy on HarperCollins
                                  </button>
                                </div>

                                {/* Strange Fruit */}
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                  <img
                                    src="https://www.harpercollins.com/cdn/shop/products/9780060959562_743f3505-1385-4671-8d13-ff7266b59fa3.jpg?v=1699295481&width=350"
                                    alt="Strange Fruit"
                                    style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: '#f3f4f6' }}
                                  />
                                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Strange Fruit</h5>
                                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.75rem' }}>by David Margolick</p>
                                  <button
                                    onClick={() => {
                                      setCurrentBookUrl('https://www.harpercollins.com/products/strange-fruit-david-margolickdavid-margolick?variant=41176753209378');
                                      setShowBookModal(true);
                                    }}
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      padding: '0.75rem',
                                      background: '#00563f',
                                      color: 'white',
                                      textAlign: 'center',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Buy on HarperCollins
                                  </button>
                                </div>

                                {/* The Jazzmen */}
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                  <img
                                    src="https://www.harpercollins.com/cdn/shop/files/9780063444867_5591af52-3546-420e-9c1c-01e009614e19.jpg?v=1759274524&width=350"
                                    alt="The Jazzmen"
                                    style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: '#f3f4f6' }}
                                  />
                                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>The Jazzmen</h5>
                                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.75rem' }}>by Larry Tye</p>
                                  <button
                                    onClick={() => {
                                      setCurrentBookUrl('https://www.harpercollins.com/products/the-jazzmen-larry-tye?variant=43110379749410');
                                      setShowBookModal(true);
                                    }}
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      padding: '0.75rem',
                                      background: '#00563f',
                                      color: 'white',
                                      textAlign: 'center',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Buy on HarperCollins
                                  </button>
                                </div>

                                {/* Dexter Gordon Book from Amazon */}
                                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                  <img
                                    src="https://m.media-amazon.com/images/I/71IrtNbSGFL._SY522_.jpg"
                                    alt="Sophisticated Giant: Dexter Gordon"
                                    style={{ width: '100%', height: 'auto', aspectRatio: '2/3', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: '#f3f4f6' }}
                                  />
                                  <h5 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>Sophisticated Giant</h5>
                                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.75rem' }}>The Life of Dexter Gordon</p>
                                  <button
                                    onClick={() => {
                                      setCurrentBookUrl('https://www.amazon.com/exec/obidos/ASIN/0520280644/wnycorg-20/');
                                      setShowBookModal(true);
                                    }}
                                    style={{
                                      display: 'block',
                                      width: '100%',
                                      padding: '0.75rem',
                                      background: '#ff9900',
                                      color: 'white',
                                      textAlign: 'center',
                                      border: 'none',
                                      borderRadius: '6px',
                                      fontWeight: '600',
                                      fontSize: '14px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Buy on Amazon
                                  </button>
                                </div>

                              </div>
                            </div>
                          )}
                          </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* DISCOVERY PANEL - PAGE 8 (Thelonious Monk - Genius of Modern Music Volume 1) */}
                    {currentPage?.originalData?.page === 8 && (
                      <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            🎵 UnitedTribes AI-Enhanced Discovery
                          </h3>
                          <button
                            onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151'
                            }}
                          >
                            {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>

                        {discoveryPanelExpanded && (
                          <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                          <button
                            onClick={() => setDiscoveryTab('featured')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'featured' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Featured
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('read')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'read' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'read' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'read' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('watch')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'watch' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'watch' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'watch' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('music')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'music' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'music' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'music' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Music
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('explorer')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'explorer' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'explorer' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'explorer' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            United AI Explorer
                          </button>
                        </div>

                          {/* Tab Content */}
                          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          {discoveryTab === 'featured' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Featured content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'read' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Read content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'watch' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Watch content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'music' && (
                            <div>
                              {/* Thelonious Monk Album Cover with Audio Player */}
                              <div
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                    console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} Thelonious Monk`);
                                  }
                                }}
                              >
                                <img
                                  src="https://images.genius.com/401b02f094dbcfc056a83d1107ee861e.600x600x1.jpg"
                                  alt="Thelonious Monk - Genius of Modern Music"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                />
                                {isAlbumAudioPlaying && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    ♪ Playing...
                                  </div>
                                )}
                              </div>

                              {/* Hidden YouTube iframe for audio playback */}
                              <iframe
                                ref={albumAudioIframeRef}
                                src="https://www.youtube.com/embed/V_h5P2meI5I?enablejsapi=1&controls=0"
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  opacity: 0,
                                  pointerEvents: 'none'
                                }}
                                allow="autoplay"
                              />
                            </div>
                          )}
                          {discoveryTab === 'explorer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              {/* AI Search Section */}
                              <div>
                                <label style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  marginBottom: '0.5rem',
                                  display: 'block'
                                }}>
                                  Ask About Thelonious Monk
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                  <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                      type="text"
                                      value={aiQuery}
                                      onChange={(e) => setAiQuery(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isAiSearching && aiQuery.trim()) {
                                          handleUnitedAISearch();
                                        }
                                      }}
                                      placeholder="What would you like to know about Thelonious Monk?"
                                      disabled={isAiSearching}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: aiQuery ? '2.5rem' : '0.75rem',
                                        fontSize: '16px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        opacity: isAiSearching ? 0.6 : 1
                                      }}
                                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                    {aiQuery && (
                                      <button
                                        onClick={() => {
                                          setAiQuery('');
                                          setAiResults(null);
                                          setAiError(null);
                                        }}
                                        style={{
                                          position: 'absolute',
                                          right: '0.5rem',
                                          top: '50%',
                                          transform: 'translateY(-50%)',
                                          background: '#e5e7eb',
                                          border: '2px solid #9ca3af',
                                          color: '#1f2937',
                                          fontSize: '20px',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          padding: 0,
                                          lineHeight: 1,
                                          borderRadius: '50%',
                                          width: '28px',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#d1d5db';
                                          e.currentTarget.style.borderColor = '#6b7280';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#e5e7eb';
                                          e.currentTarget.style.borderColor = '#9ca3af';
                                        }}
                                        title="Clear"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleUnitedAISearch}
                                    disabled={isAiSearching || !aiQuery.trim()}
                                    style={{
                                      background: isAiSearching ? '#2563eb' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '0.75rem 1.5rem',
                                      fontSize: '16px',
                                      fontWeight: '600',
                                      cursor: isAiSearching || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                                      transition: 'background 0.2s',
                                      animation: isAiSearching ? 'buttonPulse 1.5s ease-in-out infinite' : 'none'
                                    }}
                                  >
                                    {isAiSearching ? 'Searching...' : 'Search'}
                                  </button>
                                </div>

                                {/* Search Results */}
                                {aiResults && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '1.5rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    position: 'relative'
                                  }}>
                                    <button
                                      onClick={() => {
                                        setAiResults(null);
                                        setAiQuery('');
                                        setAiError(null);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                      Clear Results
                                    </button>
                                    <div style={{ paddingTop: '2.5rem' }}>
                                      {formatNarrative(aiResults.narrative)}
                                    </div>
                                  </div>
                                )}

                                {aiError && (
                                  <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '0.5rem' }}>
                                    Error: {aiError}
                                  </p>
                                )}
                              </div>

                              {/* Network Visualization */}
                              <div>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '0.5rem'
                                }}>
                                  <label style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                  }}>
                                    Thelonious Monk Network Visualization
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Expand button clicked!');
                                      setShowVisualizationModal(true);
                                    }}
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                  >
                                    <span>⤢</span> Expand
                                  </button>
                                </div>
                                <div style={{
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#f9fafb'
                                }}>
                                  <iframe
                                    src="http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/thelonious-monk-network.html"
                                    style={{
                                      width: '100%',
                                      height: '400px',
                                      border: 'none'
                                    }}
                                    title="Thelonious Monk Network Visualization"
                                  />
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                                  Interactive network showing connections between Thelonious Monk and related artists
                                </p>
                              </div>
                            </div>
                          )}
                          </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* DISCOVERY PANEL - PAGE 10 (Art Blakey - Like Someone in Love) */}
                    {currentPage?.originalData?.page === 10 && (
                      <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            🎵 UnitedTribes AI-Enhanced Discovery
                          </h3>
                          <button
                            onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151'
                            }}
                          >
                            {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>

                        {discoveryPanelExpanded && (
                          <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                          <button
                            onClick={() => setDiscoveryTab('featured')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'featured' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Featured
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('read')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'read' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'read' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'read' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('watch')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'watch' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'watch' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'watch' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('music')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'music' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'music' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'music' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Music
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('explorer')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'explorer' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'explorer' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'explorer' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            United AI Explorer
                          </button>
                        </div>

                          {/* Tab Content */}
                          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          {discoveryTab === 'featured' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Featured content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'read' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Read content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'watch' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Watch content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'music' && (
                            <div>
                              {/* Art Blakey Album Cover with Audio Player */}
                              <div
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                    console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} Art Blakey - Like Someone in Love`);
                                  }
                                }}
                              >
                                <img
                                  src="https://store.bluenote.com/cdn/shop/files/ArtBlakey_LikeSomeoneInLoveLP.png?v=1731519659&width=800"
                                  alt="Art Blakey and the Jazz Messengers - Like Someone in Love"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                />
                                {isAlbumAudioPlaying && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    ♪ Playing...
                                  </div>
                                )}
                              </div>

                              {/* Hidden YouTube iframe for audio playback */}
                              <iframe
                                ref={albumAudioIframeRef}
                                src="https://www.youtube.com/embed/6unIPgt_fCw?enablejsapi=1&controls=0"
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  opacity: 0,
                                  pointerEvents: 'none'
                                }}
                                allow="autoplay"
                              />
                            </div>
                          )}
                          {discoveryTab === 'explorer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              {/* AI Search Section */}
                              <div>
                                <label style={{
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  marginBottom: '0.5rem',
                                  display: 'block'
                                }}>
                                  Ask About Art Blakey
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                  <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                      type="text"
                                      value={aiQuery}
                                      onChange={(e) => setAiQuery(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isAiSearching && aiQuery.trim()) {
                                          handleUnitedAISearch();
                                        }
                                      }}
                                      placeholder="What would you like to know about Art Blakey?"
                                      disabled={isAiSearching}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: aiQuery ? '2.5rem' : '0.75rem',
                                        fontSize: '16px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        opacity: isAiSearching ? 0.6 : 1
                                      }}
                                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                    {aiQuery && (
                                      <button
                                        onClick={() => {
                                          setAiQuery('');
                                          setAiResults(null);
                                          setAiError(null);
                                        }}
                                        style={{
                                          position: 'absolute',
                                          right: '0.5rem',
                                          top: '50%',
                                          transform: 'translateY(-50%)',
                                          background: '#e5e7eb',
                                          border: '2px solid #9ca3af',
                                          color: '#1f2937',
                                          fontSize: '20px',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          padding: 0,
                                          lineHeight: 1,
                                          borderRadius: '50%',
                                          width: '28px',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#d1d5db';
                                          e.currentTarget.style.borderColor = '#6b7280';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#e5e7eb';
                                          e.currentTarget.style.borderColor = '#9ca3af';
                                        }}
                                        title="Clear"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleUnitedAISearch}
                                    disabled={isAiSearching || !aiQuery.trim()}
                                    style={{
                                      background: isAiSearching ? '#2563eb' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '0.75rem 1.5rem',
                                      fontSize: '16px',
                                      fontWeight: '600',
                                      cursor: isAiSearching || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                                      transition: 'background 0.2s',
                                      animation: isAiSearching ? 'buttonPulse 1.5s ease-in-out infinite' : 'none'
                                    }}
                                  >
                                    {isAiSearching ? 'Searching...' : 'Search'}
                                  </button>
                                </div>

                                {/* Search Results */}
                                {aiResults && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '1.5rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    position: 'relative'
                                  }}>
                                    <button
                                      onClick={() => {
                                        setAiResults(null);
                                        setAiQuery('');
                                        setAiError(null);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                      Clear Results
                                    </button>
                                    <div style={{ paddingTop: '2.5rem' }}>
                                      {formatNarrative(aiResults.narrative)}
                                    </div>
                                  </div>
                                )}

                                {aiError && (
                                  <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '0.5rem' }}>
                                    Error: {aiError}
                                  </p>
                                )}
                              </div>

                              {/* Network Visualization */}
                              <div>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '0.5rem'
                                }}>
                                  <label style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                  }}>
                                    Art Blakey Network Visualization
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Expand button clicked!');
                                      setShowVisualizationModal(true);
                                    }}
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                  >
                                    <span>⤢</span> Expand
                                  </button>
                                </div>
                                <div style={{
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#f9fafb'
                                }}>
                                  <iframe
                                    src="http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/art-blakey-network.html"
                                    style={{
                                      width: '100%',
                                      height: '400px',
                                      border: 'none'
                                    }}
                                    title="Art Blakey Network Visualization"
                                  />
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                                  Interactive network showing connections between Art Blakey and related artists
                                </p>
                              </div>
                            </div>
                          )}
                          </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* DISCOVERY PANEL - PAGE 11 */}
                    {currentPage?.originalData?.page === 11 && (
                      <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            🎵 UnitedTribes AI-Enhanced Discovery
                          </h3>
                          <button
                            onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151'
                            }}
                          >
                            {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>

                        {discoveryPanelExpanded && (
                          <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                          <button
                            onClick={() => setDiscoveryTab('featured')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'featured' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Featured
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('read')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'read' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'read' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'read' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('watch')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'watch' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'watch' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'watch' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('music')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'music' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'music' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'music' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Music
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('explorer')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'explorer' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'explorer' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'explorer' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            United AI Explorer
                          </button>
                        </div>

                          {/* Tab Content */}
                          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          {discoveryTab === 'featured' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Featured content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'read' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Read content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'watch' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Watch content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'music' && (
                            <div>
                              {/* Hank Mobley Album Cover with Audio Player */}
                              <div
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                    console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} Hank Mobley - A Caddy for Daddy`);
                                  }
                                }}
                              >
                                <img
                                  src="https://store.bluenote.com/cdn/shop/files/HankMobley-ACaddyForDaddy_UHQCD.png?v=1745436203"
                                  alt="Hank Mobley - A Caddy for Daddy"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                />
                                {isAlbumAudioPlaying && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    ♪ Playing...
                                  </div>
                                )}
                              </div>

                              {/* Hidden YouTube iframe for audio playback */}
                              <iframe
                                ref={albumAudioIframeRef}
                                src="https://www.youtube.com/embed/MJQjQIoq7u8?enablejsapi=1&controls=0"
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  opacity: 0,
                                  pointerEvents: 'none'
                                }}
                                allow="autoplay"
                              />
                            </div>
                          )}
                          {discoveryTab === 'explorer' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Explorer content coming soon...</p>
                            </div>
                          )}
                          </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* DISCOVERY PANEL - PAGE 12 */}
                    {currentPage?.originalData?.page === 12 && (
                      <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            🎵 UnitedTribes AI-Enhanced Discovery
                          </h3>
                          <button
                            onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151'
                            }}
                          >
                            {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>

                        {discoveryPanelExpanded && (
                          <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                          <button
                            onClick={() => setDiscoveryTab('featured')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'featured' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Featured
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('read')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'read' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'read' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'read' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('watch')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'watch' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'watch' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'watch' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('music')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'music' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'music' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'music' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Music
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('explorer')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'explorer' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'explorer' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'explorer' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            United AI Explorer
                          </button>
                        </div>

                          {/* Tab Content */}
                          <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          {discoveryTab === 'featured' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Featured content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'read' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Read content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'watch' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Watch content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'music' && (
                            <div>
                              {/* Sonny Rollins Album Cover with Audio Player */}
                              <div
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                    console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} Sonny Rollins Vol. 2`);
                                  }
                                }}
                              >
                                <img
                                  src="https://i.ebayimg.com/images/g/6MgAAOSwBI9ngV5j/s-l1600.webp"
                                  alt="Sonny Rollins - Sonny Rollins Vol. 2"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                />
                                {isAlbumAudioPlaying && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    ♪ Playing...
                                  </div>
                                )}
                              </div>

                              {/* Hidden YouTube iframe for audio playback */}
                              <iframe
                                ref={albumAudioIframeRef}
                                src="https://www.youtube.com/embed/m2daCTUm2dU?enablejsapi=1&controls=0"
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  opacity: 0,
                                  pointerEvents: 'none'
                                }}
                                allow="autoplay"
                              />
                            </div>
                          )}
                          {discoveryTab === 'explorer' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Explorer content coming soon...</p>
                            </div>
                          )}
                          </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Book Modal - Enhanced with Purchase, Audiobook, and Video */}
                    {showBookModal && (
                      <div
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.85)',
                          zIndex: 10000,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2rem'
                        }}
                        onClick={() => setShowBookModal(false)}
                      >
                        <div
                          style={{
                            position: 'relative',
                            width: '75%',
                            maxWidth: '1200px',
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '2rem',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Close button */}
                          <button
                            onClick={() => setShowBookModal(false)}
                            style={{
                              position: 'absolute',
                              top: '1rem',
                              right: '1rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              cursor: 'pointer',
                              fontSize: '20px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 10
                            }}
                          >
                            ✕
                          </button>

                          {/* Enhanced modal for Kansas City Lightning */}
                          {currentBookId === 'kansas-city-lightning' ? (
                            <div>
                              {/* Section 1: Purchase */}
                              <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                                  📚 Purchase Book
                                </h3>
                                <div style={{ textAlign: 'center', background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                                  <img
                                    src="https://www.dropbox.com/scl/fi/ij9eb3s2hhe5t5sdfgocs/Screenshot-2025-10-03-at-10.28.15-AM.png?rlkey=l6t415nrnw0f6khaygc2nnsrf&raw=1"
                                    alt="Kansas City Lightning on HarperCollins"
                                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1rem' }}
                                  />
                                  <a
                                    href={currentBookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-block',
                                      padding: '1rem 2rem',
                                      background: '#00563f',
                                      color: 'white',
                                      textDecoration: 'none',
                                      borderRadius: '8px',
                                      fontSize: '18px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    Buy on HarperCollins →
                                  </a>
                                </div>
                              </div>

                              {/* Section 2: Audiobook Sample */}
                              <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                                  🎧 Listen: Audiobook Sample
                                </h3>
                                <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Book cover */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                      <img
                                        src="https://www.harpercollins.com/cdn/shop/files/9780062005618_1618c813-096a-4f49-bebe-775d51820fcc.jpg?v=1759161105&width=350"
                                        alt="Kansas City Lightning"
                                        style={{
                                          width: '150px',
                                          height: 'auto',
                                          borderRadius: '8px',
                                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                      />
                                    </div>

                                    {/* Info and buttons */}
                                    <div style={{ flex: 1, minWidth: '250px' }}>
                                      <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                                        Kansas City Lightning
                                      </h4>
                                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '1rem' }}>
                                        Narrated audiobook sample
                                      </p>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button
                                          onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                          }}
                                        >
                                          {showAudioPlayer ? '⏸ Hide Player' : '▶ Play Sample'}
                                        </button>
                                        <a
                                          href="https://www.harpercollins.com/products/kansas-city-lightning-stanley-crouch?variant=40974806220834"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0.75rem 1.5rem',
                                            background: '#00563f',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            fontSize: '16px',
                                            fontWeight: '600'
                                          }}
                                        >
                                          Buy on HarperCollins →
                                        </a>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Audio player (toggleable) */}
                                  {showAudioPlayer && (
                                    <div style={{ marginTop: '1rem', width: '100%' }}>
                                      <iframe
                                        src="https://www.youtube.com/embed/XMC9R3L1wo4?autoplay=1"
                                        style={{
                                          width: '100%',
                                          height: '80px',
                                          border: 'none',
                                          borderRadius: '8px'
                                        }}
                                        title="Audiobook Sample"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Section 3: Video About the Book */}
                              <div>
                                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                                  🎬 Watch: Author Discussion
                                </h3>
                                <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                                  <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '1rem' }}>
                                    Stanley Crouch discusses "Kansas City Lightning: The Rise and Times of Charlie Parker"
                                  </p>
                                  <div style={{ width: '100%', height: '400px' }}>
                                    <iframe
                                      src="https://www.youtube.com/embed/zowjztg8QlI"
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: '8px'
                                      }}
                                      title="Stanley Crouch on Kansas City Lightning"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Fallback for other books - simple modal */
                            <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '1.5rem' }}>
                                Click below to visit the book page and make a purchase
                              </p>
                              <a
                                href={currentBookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-block',
                                  padding: '1rem 2rem',
                                  background: currentBookUrl.includes('amazon') ? '#ff9900' : '#00563f',
                                  color: 'white',
                                  textDecoration: 'none',
                                  borderRadius: '8px',
                                  fontSize: '18px',
                                  fontWeight: '600'
                                }}
                              >
                                {currentBookUrl.includes('amazon') ? 'Purchase on Amazon →' : 'Purchase on HarperCollins →'}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
                </div>
              );
            } else if (currentPage?.originalData?.page === 7 && currentPage?.originalData?.type === 'page_image') {
              // Page 7 - John Coltrane Blue Train - Add YouTube search
              return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedVideo ? (
                    // Video Player View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <button
                          onClick={closeVideo}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                        >
                          ← Back to Search
                        </button>
                      </div>

                      {showPlaylistView && videoPlaylistData && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => setShowPlaylistView(false)}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '90%',
                              maxWidth: '600px',
                              maxHeight: '90vh',
                              background: 'white',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              overflowY: 'auto',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>
                                  📚 Works & Playlists
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  {/* Playlist Counter */}
                                  <div style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    🎵 Playlist: {currentPlaylist.length} tracks
                                  </div>
                                  {currentPlaylist.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => {
                                          playPlaylist();
                                          setShowPlaylistView(false);
                                        }}
                                        style={{
                                          background: '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ▶ Play All
                                      </button>
                                      <button
                                        onClick={clearPlaylist}
                                        style={{
                                          background: '#f59e0b',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Clear
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setShowPlaylistView(false)}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close
                                  </button>
                                </div>
                              </div>

                              {/* Works Section */}
                              {videoPlaylistData.works && videoPlaylistData.works.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '22px', fontWeight: '600', color: '#000' }}>
                                      🎵 Works Mentioned ({videoPlaylistData.works.length})
                                    </h4>
                                    <button
                                      onClick={() => toggleAllWorks(true)}
                                      style={{
                                        background: areAllWorksAdded(true) ? '#ef4444' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      {areAllWorksAdded(true) ? '- Remove All' : '+ Add All'}
                                    </button>
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {videoPlaylistData.works.map((work: any, idx: number) => {
                                      const isAdded = currentPlaylist.some(item =>
                                        item.title === work.title && item.artist === work.artist
                                      );
                                      return (
                                        <div
                                          key={idx}
                                          style={{
                                            background: isAdded ? '#dcfce7' : '#f0fdf4',
                                            border: isAdded ? '2px solid #16a34a' : '2px solid #22c55e',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem',
                                            fontSize: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#000',
                                            opacity: isAdded ? 0.8 : 1
                                          }}
                                        >
                                          <button
                                            onClick={() => toggleIndividualSong(work)}
                                            style={{
                                              background: isAdded ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              padding: '0.25rem 0.5rem',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              marginRight: '0.5rem'
                                            }}
                                          >
                                            {isAdded ? '- Remove' : '+ Add'}
                                          </button>
                                          <strong>{work.title}</strong> - {work.artist}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Playlists Section */}
                              {videoPlaylistData.playlists && videoPlaylistData.playlists.length > 0 && (
                                <div>
                                  <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '1rem', color: '#000' }}>
                                    🎼 Discovery Playlists ({videoPlaylistData.playlists.length})
                                  </h4>
                                  <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                    {videoPlaylistData.playlists.map((playlist: any, idx: number) => (
                                      <div
                                        key={idx}
                                        style={{
                                          marginBottom: '1.5rem',
                                          background: '#faf5ff',
                                          border: '2px solid #8b5cf6',
                                          borderRadius: '8px',
                                          padding: '1rem'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                          <h5 style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                                            {playlist.name}
                                          </h5>
                                          <button
                                            onClick={() => toggleAllPlaylistTracks(playlist.name, playlist.tracks)}
                                            style={{
                                              background: areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '6px',
                                              padding: '0.4rem 0.8rem',
                                              cursor: 'pointer',
                                              fontSize: '15px',
                                              fontWeight: '600'
                                            }}
                                          >
                                            {areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '- Remove All' : '+ Add All'}
                                          </button>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#000' }}>
                                          {playlist.tracks.map((track: any, tidx: number) => {
                                            const isAdded = currentPlaylist.some(item =>
                                              item.title === track.title && item.artist === track.artist
                                            );
                                            return (
                                              <div
                                                key={tidx}
                                                style={{
                                                  marginBottom: '0.5rem',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '0.5rem',
                                                  padding: '0.25rem 0.5rem',
                                                  background: isAdded ? '#dcfce7' : 'transparent',
                                                  borderRadius: '4px'
                                                }}
                                              >
                                                <button
                                                  onClick={() => toggleIndividualSong(track)}
                                                  style={{
                                                    background: isAdded ? '#ef4444' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '0.2rem 0.4rem',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    opacity: 1
                                                  }}
                                                >
                                                  {isAdded ? '- Remove' : '+ Add'}
                                                </button>
                                                <span style={{ opacity: isAdded ? 0.8 : 1 }}>
                                                  <strong>"{track.title}"</strong> - {track.artist}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Playlist Player Modal - Shows YouTube videos for playlist tracks */}
                      {showPlaylistPlayer && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => {
                            setShowPlaylistPlayer(false);
                            setPlaylistVideos([]);
                            setCurrentTrackIndex(0);
                            // Restore the saved video HTML
                            if (savedVideoEmbedHtml) {
                              setVideoEmbedHtml(savedVideoEmbedHtml);
                            }
                          }}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '95%',
                              maxWidth: '1400px',
                              height: '90vh',
                              background: '#1a1a1a',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }} onClick={(e) => e.stopPropagation()}>

                              {/* Header */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                borderBottom: '2px solid #333',
                                paddingBottom: '1rem'
                              }}>
                                <h2 style={{
                                  fontSize: '28px',
                                  fontWeight: 'bold',
                                  color: '#fff'
                                }}>
                                  🎵 Playing Playlist ({currentPlaylist.length} tracks)
                                </h2>
                                <button
                                  onClick={() => {
                                    setShowPlaylistPlayer(false);
                                    setPlaylistVideos([]);
                                    setCurrentTrackIndex(0);
                                  }}
                                  style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}
                                >
                                  ✕ Close
                                </button>
                              </div>

                              {/* Loading State */}
                              {loadingPlaylistVideos && (
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  color: '#fff',
                                  fontSize: '24px'
                                }}>
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ marginBottom: '1rem' }}>🔍 Searching YouTube for tracks...</div>
                                    <div style={{ fontSize: '16px', color: '#888' }}>This may take a few seconds</div>
                                  </div>
                                </div>
                              )}

                              {/* Main Content Area */}
                              {!loadingPlaylistVideos && playlistVideos.length > 0 && (
                                <div style={{
                                  display: 'flex',
                                  gap: '1.5rem',
                                  flex: 1,
                                  overflow: 'hidden'
                                }}>
                                  {/* Left Side - Video Player */}
                                  <div style={{
                                    flex: '1 1 70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                  }}>
                                    {/* Current Track Info */}
                                    <div style={{
                                      background: '#2a2a2a',
                                      padding: '1rem',
                                      borderRadius: '8px',
                                      color: '#fff'
                                    }}>
                                      <div style={{ fontSize: '14px', color: '#888', marginBottom: '0.5rem' }}>
                                        Now Playing
                                      </div>
                                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '0.25rem' }}>
                                        {playlistVideos[currentTrackIndex]?.title}
                                      </div>
                                      <div style={{ fontSize: '22px', color: '#10b981', fontWeight: '600' }}>
                                        {playlistVideos[currentTrackIndex]?.artist}
                                      </div>
                                      {playlistVideos[currentTrackIndex]?.videoTitle && (
                                        <div style={{ fontSize: '16px', color: '#6b7280', marginTop: '0.75rem', fontStyle: 'italic' }}>
                                          YouTube: {playlistVideos[currentTrackIndex].videoTitle}
                                        </div>
                                      )}
                                    </div>

                                    {/* YouTube Video Embed */}
                                    {playlistVideos[currentTrackIndex]?.videoId ? (
                                      <iframe
                                        key={playlistVideos[currentTrackIndex].videoId}
                                        src={`https://www.youtube.com/embed/${playlistVideos[currentTrackIndex].videoId}?autoplay=1&rel=0`}
                                        style={{
                                          width: '100%',
                                          flex: 1,
                                          border: 'none',
                                          borderRadius: '8px',
                                          background: '#000'
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#2a2a2a',
                                        borderRadius: '8px',
                                        color: '#888'
                                      }}>
                                        <div style={{ textAlign: 'center' }}>
                                          <div style={{ fontSize: '24px', marginBottom: '1rem' }}>❌ Video not found</div>
                                          <div>Could not find a YouTube video for this track</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Player Controls */}
                                    <div style={{
                                      display: 'flex',
                                      gap: '1rem',
                                      justifyContent: 'center',
                                      padding: '1rem',
                                      background: '#2a2a2a',
                                      borderRadius: '8px'
                                    }}>
                                      <button
                                        onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                                        disabled={currentTrackIndex === 0}
                                        style={{
                                          background: currentTrackIndex === 0 ? '#555' : '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ⏮ Previous
                                      </button>
                                      <button
                                        onClick={() => setCurrentTrackIndex(Math.min(playlistVideos.length - 1, currentTrackIndex + 1))}
                                        disabled={currentTrackIndex === playlistVideos.length - 1}
                                        style={{
                                          background: currentTrackIndex === playlistVideos.length - 1 ? '#555' : '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === playlistVideos.length - 1 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Next ⏭
                                      </button>
                                    </div>
                                  </div>

                                  {/* Right Side - Playlist */}
                                  <div style={{
                                    flex: '0 0 30%',
                                    background: '#2a2a2a',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    overflowY: 'auto'
                                  }}>
                                    <h3 style={{
                                      fontSize: '22px',
                                      fontWeight: 'bold',
                                      color: '#fff',
                                      marginBottom: '1rem',
                                      borderBottom: '1px solid #444',
                                      paddingBottom: '0.5rem'
                                    }}>
                                      Playlist Tracks
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                      {playlistVideos.map((video, idx) => (
                                        <div
                                          key={idx}
                                          onClick={() => setCurrentTrackIndex(idx)}
                                          style={{
                                            background: idx === currentTrackIndex ? '#3b82f6' : '#333',
                                            padding: '0.75rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            border: idx === currentTrackIndex ? '2px solid #60a5fa' : '2px solid transparent'
                                          }}
                                        >
                                          <div style={{
                                            fontSize: '18px',
                                            fontWeight: idx === currentTrackIndex ? 'bold' : 'normal',
                                            color: '#fff'
                                          }}>
                                            {idx + 1}. {video.title} - {video.artist}
                                          </div>
                                          {video.videoId && (
                                            <div style={{
                                              fontSize: '14px',
                                              color: idx === currentTrackIndex ? '#bfdbfe' : '#10b981',
                                              marginTop: '0.25rem'
                                            }}>
                                              ✓ Video found
                                            </div>
                                          )}
                                          {video.error && (
                                            <div style={{
                                              fontSize: '14px',
                                              color: '#f87171',
                                              marginTop: '0.25rem'
                                            }}>
                                              ✗ No video
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <iframe
                        ref={videoIframeRef}
                        srcDoc={videoEmbedHtml}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          flex: 1
                        }}
                        title={selectedVideo.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Search View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Search Form */}
                      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              className="united-tribes-search-input"
                              value={aiQuery}
                              onChange={(e) => setAiQuery(e.target.value)}
                              placeholder="Search UnitedTribes videos"
                              style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                paddingRight: searchQuery ? '3.5rem' : '1.5rem',
                                border: '2px solid #1e3a8a',
                                borderRadius: '10px',
                                fontSize: '24px',
                                outline: 'none',
                                fontWeight: '500',
                                color: '#000',
                                backgroundColor: 'white',
                                lineHeight: '1.2'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#f0f9ff';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#1e3a8a';
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAiQuery('');
                                  setSearchResults([]);
                                  setSearchError(null);
                                }}
                                style={{
                                  position: 'absolute',
                                  right: '1rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  border: '2px solid #6b7280',
                                  background: 'white',
                                  color: '#6b7280',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#3b82f6';
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#6b7280';
                                  e.currentTarget.style.color = '#6b7280';
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <button
                            type="submit"
                            style={{
                              padding: '1rem 2rem',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '20px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#3b82f6';
                            }}
                          >
                            Search
                          </button>
                        </div>
                      </form>

                      {/* Search Results */}
                      {searchLoading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>
                          Searching videos...
                        </div>
                      )}

                      {searchError && (
                        <div style={{
                          padding: '1rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          {searchError}
                        </div>
                      )}

                      {!searchLoading && searchResults.length > 0 && (
                        <div style={{ marginTop: '2rem', flex: 1, overflowY: 'auto' }}>
                          <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                            Search Results ({searchResults.length})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {searchResults.map((video: any) => (
                              <div
                                key={video.id}
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: 'white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onClick={() => embedVideo(video)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              >
                                {video.thumbnail && (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                  />
                                )}
                                <div style={{ padding: '1rem' }}>
                                  <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                    {video.title}
                                  </p>
                                  <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                    {video.channel} • {video.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
                        <div style={{
                          textAlign: 'center',
                          padding: '2rem',
                          color: '#6b7280'
                        }}>
                          No results found for "{searchQuery}"
                        </div>
                      )}

                      {/* DISCOVERY PANEL - PAGE 7 */}
                      <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            🎵 UnitedTribes AI-Enhanced Discovery
                          </h3>
                          <button
                            onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#374151'
                            }}
                          >
                            {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                          </button>
                        </div>

                        {discoveryPanelExpanded && (
                          <>
                        {/* Tab Navigation */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                          <button
                            onClick={() => setDiscoveryTab('featured')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'featured' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'featured' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'featured' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Featured
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('read')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'read' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'read' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'read' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('watch')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'watch' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'watch' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'watch' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('music')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'music' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'music' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'music' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            Music
                          </button>
                          <button
                            onClick={() => setDiscoveryTab('explorer')}
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: discoveryTab === 'explorer' ? '#3b82f6' : 'transparent',
                              color: discoveryTab === 'explorer' ? 'white' : '#6b7280',
                              border: 'none',
                              borderBottom: discoveryTab === 'explorer' ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}
                          >
                            United AI Explorer
                          </button>
                        </div>

                          {/* Tab Content */}
                          <div style={{ padding: discoveryTab === 'music' ? '0' : '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          {discoveryTab === 'featured' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Featured content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'read' && (
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(2, 1fr)',
                              gap: '1rem',
                              padding: '0.5rem'
                            }}>
                              {/* Book 1 */}
                              <div style={{
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <img
                                  src="https://target.scene7.com/is/image/Target/GUEST_6dd22dce-0216-4a09-82ea-071ff97b03e6?wid=750&qlt=80"
                                  alt="Book 1"
                                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                                />
                                <button
                                  onClick={() => window.open('https://www.target.com', '_blank')}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    textAlign: 'center',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Purchase
                                </button>
                              </div>

                              {/* Book 2 */}
                              <div style={{
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <img
                                  src="https://target.scene7.com/is/image/Target/GUEST_5305f798-34dd-4dae-891f-84bb6609a78b?wid=750&qlt=80"
                                  alt="Book 2"
                                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                                />
                                <button
                                  onClick={() => window.open('https://www.target.com', '_blank')}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    textAlign: 'center',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Purchase
                                </button>
                              </div>

                              {/* Book 3 */}
                              <div style={{
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <img
                                  src="https://i.thriftbooks.com/api/imagehandler/m/A9C33549018300D71A02C50321221A591058D4CA.jpeg"
                                  alt="Book 3"
                                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                                />
                                <button
                                  onClick={() => window.open('https://www.thriftbooks.com', '_blank')}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    textAlign: 'center',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Purchase
                                </button>
                              </div>

                              {/* Book 4 */}
                              <div style={{
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                              >
                                <img
                                  src="https://m.media-amazon.com/images/I/81Cg4Xm7alL._UF1000,1000_QL80_.jpg"
                                  alt="Book 4"
                                  style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
                                />
                                <button
                                  onClick={() => window.open('https://www.amazon.com', '_blank')}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    textAlign: 'center',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Purchase
                                </button>
                              </div>
                            </div>
                          )}
                          {discoveryTab === 'watch' && (
                            <div>
                              <p style={{ fontSize: '14px', color: '#6b7280' }}>Watch content coming soon...</p>
                            </div>
                          )}
                          {discoveryTab === 'music' && (
                            <div>
                              {/* Blue Train Album Cover with Audio Player */}
                              <div
                                style={{
                                  background: 'white',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                    console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} Blue Train`);
                                  }
                                }}
                              >
                                <img
                                  src="https://store.everythingjazz.fr/cdn/shop/files/4.JC_BLUETRAIN_CM_EXPANDED.png?v=1728130386&width=1000"
                                  alt="John Coltrane - Blue Train"
                                  style={{
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '4px',
                                    opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                    transition: 'opacity 0.3s ease'
                                  }}
                                />
                                {isAlbumAudioPlaying && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    ♪ Playing...
                                  </div>
                                )}
                              </div>

                              {/* Hidden YouTube iframe for audio playback */}
                              <iframe
                                ref={albumAudioIframeRef}
                                src="https://www.youtube.com/embed/HT_Zs5FKDZE?enablejsapi=1&controls=0"
                                style={{
                                  position: 'absolute',
                                  width: '1px',
                                  height: '1px',
                                  opacity: 0,
                                  pointerEvents: 'none'
                                }}
                                allow="autoplay"
                              />
                            </div>
                          )}
                          {discoveryTab === 'explorer' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              {/* Search Interface */}
                              <div>
                                <label style={{
                                  display: 'block',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#1f2937',
                                  marginBottom: '0.5rem'
                                }}>
                                  UnitedAI Chat Explorer
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                      type="text"
                                      value={aiQuery}
                                      onChange={(e) => setAiQuery(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !isAiSearching) {
                                          e.preventDefault();
                                          handleUnitedAISearch();
                                        }
                                      }}
                                      placeholder="Ask about John Coltrane and Blue Train..."
                                      disabled={isAiSearching}
                                      style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        paddingRight: aiQuery ? '2.5rem' : '0.75rem',
                                        fontSize: '16px',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        opacity: isAiSearching ? 0.6 : 1
                                      }}
                                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                    {aiQuery && (
                                      <button
                                        onClick={() => {
                                          setAiQuery('');
                                          setAiResults(null);
                                          setAiError(null);
                                        }}
                                        style={{
                                          position: 'absolute',
                                          right: '0.5rem',
                                          top: '50%',
                                          transform: 'translateY(-50%)',
                                          background: '#e5e7eb',
                                          border: '2px solid #9ca3af',
                                          color: '#1f2937',
                                          fontSize: '20px',
                                          fontWeight: '700',
                                          cursor: 'pointer',
                                          padding: 0,
                                          lineHeight: 1,
                                          borderRadius: '50%',
                                          width: '28px',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.background = '#d1d5db';
                                          e.currentTarget.style.borderColor = '#6b7280';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.background = '#e5e7eb';
                                          e.currentTarget.style.borderColor = '#9ca3af';
                                        }}
                                        title="Clear"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    onClick={handleUnitedAISearch}
                                    disabled={isAiSearching || !aiQuery.trim()}
                                    style={{
                                      background: isAiSearching ? '#2563eb' : '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '0.75rem 1.5rem',
                                      fontSize: '16px',
                                      fontWeight: '600',
                                      cursor: isAiSearching || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                                      transition: 'background 0.2s',
                                      animation: isAiSearching ? 'buttonPulse 1.5s ease-in-out infinite' : 'none'
                                    }}
                                  >
                                    {isAiSearching ? 'Searching...' : 'Search'}
                                  </button>
                                </div>

                                {/* Search Results */}
                                {aiResults && (
                                  <div style={{
                                    marginTop: '1rem',
                                    padding: '1.5rem',
                                    background: 'white',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                    position: 'relative'
                                  }}>
                                    <button
                                      onClick={() => {
                                        setAiResults(null);
                                        setAiQuery('');
                                        setAiError(null);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '0.75rem',
                                        right: '0.75rem',
                                        background: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                      Clear Results
                                    </button>
                                    <div style={{ paddingTop: '2.5rem' }}>
                                      {formatNarrative(aiResults.narrative)}
                                    </div>
                                  </div>
                                )}

                                {aiError && (
                                  <p style={{ fontSize: '14px', color: '#ef4444', marginTop: '0.5rem' }}>
                                    Error: {aiError}
                                  </p>
                                )}
                              </div>

                              {/* Network Visualization */}
                              <div>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '0.5rem'
                                }}>
                                  <label style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#1f2937'
                                  }}>
                                    John Coltrane Network Visualization
                                  </label>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Expand button clicked!');
                                      setShowVisualizationModal(true);
                                    }}
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                  >
                                    <span>⤢</span> Expand
                                  </button>
                                </div>
                                <div style={{
                                  border: '2px solid #d1d5db',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: '#f9fafb'
                                }}>
                                  <iframe
                                    src="http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/john-coltrane-network.html"
                                    style={{
                                      width: '100%',
                                      height: '400px',
                                      border: 'none'
                                    }}
                                    title="John Coltrane Network Visualization"
                                  />
                                </div>
                                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.5rem' }}>
                                  Interactive network showing connections between John Coltrane and related artists
                                </p>
                              </div>
                            </div>
                          )}
                          </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else if (currentPage?.originalData?.page === 8 && currentPage?.originalData?.type === 'page_image') {
              // Page 8 - Blue Train Session - Add YouTube search (same as page 7)
              return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedVideo ? (
                    // Video Player View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <button
                          onClick={closeVideo}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                        >
                          ← Back to Search
                        </button>
                      </div>

                      {showPlaylistView && videoPlaylistData && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => setShowPlaylistView(false)}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '90%',
                              maxWidth: '600px',
                              maxHeight: '90vh',
                              background: 'white',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              overflowY: 'auto',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>
                                  📚 Works & Playlists
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  {/* Playlist Counter */}
                                  <div style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    🎵 Playlist: {currentPlaylist.length} tracks
                                  </div>
                                  {currentPlaylist.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => {
                                          playPlaylist();
                                          setShowPlaylistView(false);
                                        }}
                                        style={{
                                          background: '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ▶ Play All
                                      </button>
                                      <button
                                        onClick={clearPlaylist}
                                        style={{
                                          background: '#f59e0b',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Clear
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setShowPlaylistView(false)}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close
                                  </button>
                                </div>
                              </div>

                              {/* Works Section */}
                              {videoPlaylistData.works && videoPlaylistData.works.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '22px', fontWeight: '600', color: '#000' }}>
                                      🎵 Works Mentioned ({videoPlaylistData.works.length})
                                    </h4>
                                    <button
                                      onClick={() => toggleAllWorks(true)}
                                      style={{
                                        background: areAllWorksAdded(true) ? '#ef4444' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      {areAllWorksAdded(true) ? '- Remove All' : '+ Add All'}
                                    </button>
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {videoPlaylistData.works.map((work: any, idx: number) => {
                                      const isAdded = currentPlaylist.some(item =>
                                        item.title === work.title && item.artist === work.artist
                                      );
                                      return (
                                        <div
                                          key={idx}
                                          style={{
                                            background: isAdded ? '#dcfce7' : '#f0fdf4',
                                            border: isAdded ? '2px solid #16a34a' : '2px solid #22c55e',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem',
                                            fontSize: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#000',
                                            opacity: isAdded ? 0.8 : 1
                                          }}
                                        >
                                          <button
                                            onClick={() => toggleIndividualSong(work)}
                                            style={{
                                              background: isAdded ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              padding: '0.25rem 0.5rem',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              marginRight: '0.5rem'
                                            }}
                                          >
                                            {isAdded ? '- Remove' : '+ Add'}
                                          </button>
                                          <strong>{work.title}</strong> - {work.artist}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Playlists Section */}
                              {videoPlaylistData.playlists && videoPlaylistData.playlists.length > 0 && (
                                <div>
                                  <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '1rem', color: '#000' }}>
                                    🎼 Discovery Playlists ({videoPlaylistData.playlists.length})
                                  </h4>
                                  <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                    {videoPlaylistData.playlists.map((playlist: any, idx: number) => (
                                      <div
                                        key={idx}
                                        style={{
                                          marginBottom: '1.5rem',
                                          background: '#faf5ff',
                                          border: '2px solid #8b5cf6',
                                          borderRadius: '8px',
                                          padding: '1rem'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                          <h5 style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                                            {playlist.name}
                                          </h5>
                                          <button
                                            onClick={() => toggleAllPlaylistTracks(playlist.name, playlist.tracks)}
                                            style={{
                                              background: areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '6px',
                                              padding: '0.4rem 0.8rem',
                                              cursor: 'pointer',
                                              fontSize: '15px',
                                              fontWeight: '600'
                                            }}
                                          >
                                            {areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '- Remove All' : '+ Add All'}
                                          </button>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#000' }}>
                                          {playlist.tracks.map((track: any, tidx: number) => {
                                            const isAdded = currentPlaylist.some(item =>
                                              item.title === track.title && item.artist === track.artist
                                            );
                                            return (
                                              <div
                                                key={tidx}
                                                style={{
                                                  marginBottom: '0.5rem',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '0.5rem',
                                                  padding: '0.25rem 0.5rem',
                                                  background: isAdded ? '#dcfce7' : 'transparent',
                                                  borderRadius: '4px'
                                                }}
                                              >
                                                <button
                                                  onClick={() => toggleIndividualSong(track)}
                                                  style={{
                                                    background: isAdded ? '#ef4444' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '0.2rem 0.4rem',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    opacity: 1
                                                  }}
                                                >
                                                  {isAdded ? '- Remove' : '+ Add'}
                                                </button>
                                                <span style={{ opacity: isAdded ? 0.8 : 1 }}>
                                                  <strong>"{track.title}"</strong> - {track.artist}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Playlist Player Modal - Shows YouTube videos for playlist tracks */}
                      {showPlaylistPlayer && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => {
                            setShowPlaylistPlayer(false);
                            setPlaylistVideos([]);
                            setCurrentTrackIndex(0);
                            // Restore the saved video HTML
                            if (savedVideoEmbedHtml) {
                              setVideoEmbedHtml(savedVideoEmbedHtml);
                            }
                          }}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '95%',
                              maxWidth: '1400px',
                              height: '90vh',
                              background: '#1a1a1a',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }} onClick={(e) => e.stopPropagation()}>

                              {/* Header */}
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                borderBottom: '2px solid #333',
                                paddingBottom: '1rem'
                              }}>
                                <h2 style={{
                                  fontSize: '28px',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  margin: 0
                                }}>
                                  🎵 Playlist Player ({playlistVideos.length} videos)
                                </h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <div style={{
                                    background: '#4ade80',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    Track {currentTrackIndex + 1} of {playlistVideos.length}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowPlaylistPlayer(false);
                                      setPlaylistVideos([]);
                                      setCurrentTrackIndex(0);
                                    }}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close Player
                                  </button>
                                </div>
                              </div>

                              {/* Main Content Area */}
                              <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden' }}>
                                {/* Left Side - Video Player */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                  {loadingPlaylistVideos ? (
                                    <div style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: '#2a2a2a',
                                      borderRadius: '8px'
                                    }}>
                                      <div style={{ textAlign: 'center', color: '#fff' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '1rem' }}>⏳ Loading videos...</div>
                                        <div>Searching YouTube for playlist tracks</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                    {playlistVideos[currentTrackIndex]?.videoId ? (
                                      <iframe
                                        key={playlistVideos[currentTrackIndex].videoId}
                                        src={`https://www.youtube.com/embed/${playlistVideos[currentTrackIndex].videoId}?autoplay=1&rel=0`}
                                        style={{
                                          width: '100%',
                                          flex: 1,
                                          border: 'none',
                                          borderRadius: '8px',
                                          background: '#000'
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#2a2a2a',
                                        borderRadius: '8px',
                                        color: '#888'
                                      }}>
                                        <div style={{ textAlign: 'center' }}>
                                          <div style={{ fontSize: '24px', marginBottom: '1rem' }}>❌ Video not found</div>
                                          <div>Could not find a YouTube video for this track</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Player Controls */}
                                    <div style={{
                                      display: 'flex',
                                      gap: '1rem',
                                      justifyContent: 'center',
                                      padding: '1rem',
                                      background: '#2a2a2a',
                                      borderRadius: '8px'
                                    }}>
                                      <button
                                        onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                                        disabled={currentTrackIndex === 0}
                                        style={{
                                          background: currentTrackIndex === 0 ? '#555' : '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ⏮ Previous
                                      </button>
                                      <button
                                        onClick={() => setCurrentTrackIndex(Math.min(playlistVideos.length - 1, currentTrackIndex + 1))}
                                        disabled={currentTrackIndex === playlistVideos.length - 1}
                                        style={{
                                          background: currentTrackIndex === playlistVideos.length - 1 ? '#555' : '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === playlistVideos.length - 1 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Next ⏭
                                      </button>
                                    </div>
                                  </>
                                  )}
                                </div>

                                {/* Right Side - Playlist */}
                                <div style={{
                                  flex: '0 0 30%',
                                  background: '#2a2a2a',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  overflowY: 'auto'
                                }}>
                                  <h3 style={{
                                    fontSize: '22px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    marginBottom: '1rem',
                                    borderBottom: '1px solid #444',
                                    paddingBottom: '0.5rem'
                                  }}>
                                    Playlist Tracks
                                  </h3>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {playlistVideos.map((video, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => setCurrentTrackIndex(idx)}
                                        style={{
                                          background: idx === currentTrackIndex ? '#3b82f6' : '#333',
                                          padding: '0.75rem',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          border: idx === currentTrackIndex ? '2px solid #60a5fa' : '2px solid transparent'
                                        }}
                                      >
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#888',
                                          marginBottom: '0.25rem'
                                        }}>
                                          Track {idx + 1}
                                        </div>
                                        <div style={{
                                          fontSize: '18px',
                                          fontWeight: 'bold',
                                          color: '#fff',
                                          marginBottom: '0.25rem'
                                        }}>
                                          {video.title}
                                        </div>
                                        <div style={{
                                          fontSize: '16px',
                                          fontWeight: '600',
                                          color: '#10b981'
                                        }}>
                                          {video.artist}
                                        </div>
                                        {video.videoId && (
                                          <div style={{
                                            fontSize: '14px',
                                            color: idx === currentTrackIndex ? '#bfdbfe' : '#10b981',
                                            marginTop: '0.25rem'
                                          }}>
                                            ✓ Video found
                                          </div>
                                        )}
                                        {video.error && (
                                          <div style={{
                                            fontSize: '14px',
                                            color: '#f87171',
                                            marginTop: '0.25rem'
                                          }}>
                                            ✗ No video
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <iframe
                        ref={videoIframeRef}
                        srcDoc={videoEmbedHtml}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          flex: 1
                        }}
                        title={selectedVideo.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Search View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Search Form */}
                      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              className="united-tribes-search-input"
                              value={aiQuery}
                              onChange={(e) => setAiQuery(e.target.value)}
                              placeholder="Search UnitedTribes videos"
                              style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                paddingRight: searchQuery ? '3.5rem' : '1.5rem',
                                border: '2px solid #1e3a8a',
                                borderRadius: '10px',
                                fontSize: '24px',
                                outline: 'none',
                                fontWeight: '500',
                                color: '#000',
                                backgroundColor: 'white',
                                lineHeight: '1.2'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#f0f9ff';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#1e3a8a';
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAiQuery('');
                                  setSearchResults([]);
                                  setSearchError(null);
                                }}
                                style={{
                                  position: 'absolute',
                                  right: '1rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  border: '2px solid #6b7280',
                                  background: 'white',
                                  color: '#6b7280',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#3b82f6';
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#6b7280';
                                  e.currentTarget.style.color = '#6b7280';
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <button
                            type="submit"
                            style={{
                              padding: '1rem 2rem',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '20px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#3b82f6';
                            }}
                          >
                            Search
                          </button>
                        </div>
                      </form>

                      {/* Search Results */}
                      {searchLoading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>
                          Searching videos...
                        </div>
                      )}

                      {searchError && (
                        <div style={{
                          padding: '1rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          {searchError}
                        </div>
                      )}

                      {!searchLoading && searchResults.length > 0 && (
                        <div style={{ marginTop: '2rem', flex: 1, overflowY: 'auto' }}>
                          <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                            Search Results ({searchResults.length})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {searchResults.map((video: any) => (
                              <div
                                key={video.id}
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: 'white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onClick={() => embedVideo(video)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              >
                                {video.thumbnail && (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                  />
                                )}
                                <div style={{ padding: '1rem' }}>
                                  <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                    {video.title}
                                  </p>
                                  <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                    {video.channel} • {video.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
                        <div style={{
                          textAlign: 'center',
                          padding: '2rem',
                          color: '#6b7280'
                        }}>
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            } else if (currentPage?.originalData?.page >= 3 && currentPage?.originalData?.page <= 6 && currentPage?.originalData?.type === 'page_image') {
              // Pages 3-6 - Add YouTube search (same as pages 7-8)
              return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedVideo ? (
                    // Video Player View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <button
                          onClick={closeVideo}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#374151',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                          }}
                        >
                          ← Back to Search
                        </button>
                      </div>

                      {showPlaylistView && videoPlaylistData && (
                        <>
                          {/* Modal Background Overlay */}
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => setShowPlaylistView(false)}>
                            {/* Modal Content */}
                            <div style={{
                              position: 'relative',
                              width: '90%',
                              maxWidth: '600px',
                              maxHeight: '90vh',
                              background: 'white',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              overflowY: 'auto',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>
                                  📚 Works & Playlists
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  {/* Playlist Counter */}
                                  <div style={{
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    🎵 Playlist: {currentPlaylist.length} tracks
                                  </div>
                                  {currentPlaylist.length > 0 && (
                                    <>
                                      <button
                                        onClick={() => {
                                          playPlaylist();
                                          setShowPlaylistView(false);
                                        }}
                                        style={{
                                          background: '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ▶ Play All
                                      </button>
                                      <button
                                        onClick={clearPlaylist}
                                        style={{
                                          background: '#f59e0b',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.5rem 1rem',
                                          cursor: 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Clear
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setShowPlaylistView(false)}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close
                                  </button>
                                </div>
                              </div>

                              {/* Works Section */}
                              {videoPlaylistData.works && videoPlaylistData.works.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '22px', fontWeight: '600', color: '#000' }}>
                                      🎵 Works Mentioned ({videoPlaylistData.works.length})
                                    </h4>
                                    <button
                                      onClick={() => toggleAllWorks(true)}
                                      style={{
                                        background: areAllWorksAdded(true) ? '#ef4444' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                      }}
                                    >
                                      {areAllWorksAdded(true) ? '- Remove All' : '+ Add All'}
                                    </button>
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {videoPlaylistData.works.map((work: any, idx: number) => {
                                      const isAdded = currentPlaylist.some(item =>
                                        item.title === work.title && item.artist === work.artist
                                      );
                                      return (
                                        <div
                                          key={idx}
                                          style={{
                                            background: isAdded ? '#dcfce7' : '#f0fdf4',
                                            border: isAdded ? '2px solid #16a34a' : '2px solid #22c55e',
                                            borderRadius: '8px',
                                            padding: '0.75rem 1rem',
                                            fontSize: '18px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#000',
                                            opacity: isAdded ? 0.8 : 1
                                          }}
                                        >
                                          <button
                                            onClick={() => toggleIndividualSong(work)}
                                            style={{
                                              background: isAdded ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '4px',
                                              padding: '0.25rem 0.5rem',
                                              cursor: 'pointer',
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              marginRight: '0.5rem'
                                            }}
                                          >
                                            {isAdded ? '- Remove' : '+ Add'}
                                          </button>
                                          <strong>{work.title}</strong> - {work.artist}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Playlists Section */}
                              {videoPlaylistData.playlists && videoPlaylistData.playlists.length > 0 && (
                                <div>
                                  <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '1rem', color: '#000' }}>
                                    🎼 Discovery Playlists ({videoPlaylistData.playlists.length})
                                  </h4>
                                  <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                    {videoPlaylistData.playlists.map((playlist: any, idx: number) => (
                                      <div
                                        key={idx}
                                        style={{
                                          marginBottom: '1.5rem',
                                          background: '#faf5ff',
                                          border: '2px solid #8b5cf6',
                                          borderRadius: '8px',
                                          padding: '1rem'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                          <h5 style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                                            {playlist.name}
                                          </h5>
                                          <button
                                            onClick={() => toggleAllPlaylistTracks(playlist.name, playlist.tracks)}
                                            style={{
                                              background: areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '#ef4444' : '#3b82f6',
                                              color: 'white',
                                              border: 'none',
                                              borderRadius: '6px',
                                              padding: '0.4rem 0.8rem',
                                              cursor: 'pointer',
                                              fontSize: '15px',
                                              fontWeight: '600'
                                            }}
                                          >
                                            {areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '- Remove All' : '+ Add All'}
                                          </button>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#000' }}>
                                          {playlist.tracks.map((track: any, tidx: number) => {
                                            const isAdded = currentPlaylist.some(item =>
                                              item.title === track.title && item.artist === track.artist
                                            );
                                            return (
                                              <div
                                                key={tidx}
                                                style={{
                                                  marginBottom: '0.5rem',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: '0.5rem',
                                                  padding: '0.25rem 0.5rem',
                                                  background: isAdded ? '#dcfce7' : 'transparent',
                                                  borderRadius: '4px'
                                                }}
                                              >
                                                <button
                                                  onClick={() => toggleIndividualSong(track)}
                                                  style={{
                                                    background: isAdded ? '#ef4444' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '0.2rem 0.4rem',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    opacity: 1
                                                  }}
                                                >
                                                  {isAdded ? '- Remove' : '+ Add'}
                                                </button>
                                                <span style={{ opacity: isAdded ? 0.8 : 1 }}>
                                                  <strong>"{track.title}"</strong> - {track.artist}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Playlist Player Modal */}
                      {showPlaylistPlayer && (
                        <>
                          <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 10000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} onClick={() => {
                            setShowPlaylistPlayer(false);
                            setPlaylistVideos([]);
                            setCurrentTrackIndex(0);
                            // Restore the saved video HTML
                            if (savedVideoEmbedHtml) {
                              setVideoEmbedHtml(savedVideoEmbedHtml);
                            }
                          }}>
                            <div style={{
                              position: 'relative',
                              width: '95%',
                              maxWidth: '1400px',
                              height: '90vh',
                              background: '#1a1a1a',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              display: 'flex',
                              flexDirection: 'column',
                              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                                borderBottom: '2px solid #333',
                                paddingBottom: '1rem'
                              }}>
                                <h2 style={{
                                  fontSize: '28px',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  margin: 0
                                }}>
                                  🎵 Playlist Player ({playlistVideos.length} videos)
                                </h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <div style={{
                                    background: '#4ade80',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                  }}>
                                    Track {currentTrackIndex + 1} of {playlistVideos.length}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowPlaylistPlayer(false);
                                      setPlaylistVideos([]);
                                      setCurrentTrackIndex(0);
                                    }}
                                    style={{
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '0.5rem 1rem',
                                      cursor: 'pointer',
                                      fontSize: '16px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    ✕ Close Player
                                  </button>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                  {loadingPlaylistVideos ? (
                                    <div style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: '#2a2a2a',
                                      borderRadius: '8px'
                                    }}>
                                      <div style={{ textAlign: 'center', color: '#fff' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '1rem' }}>⏳ Loading videos...</div>
                                        <div>Searching YouTube for playlist tracks</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                    {playlistVideos[currentTrackIndex]?.videoId ? (
                                      <iframe
                                        key={playlistVideos[currentTrackIndex].videoId}
                                        src={`https://www.youtube.com/embed/${playlistVideos[currentTrackIndex].videoId}?autoplay=1&rel=0`}
                                        style={{
                                          width: '100%',
                                          flex: 1,
                                          border: 'none',
                                          borderRadius: '8px',
                                          background: '#000'
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#2a2a2a',
                                        borderRadius: '8px',
                                        color: '#888'
                                      }}>
                                        <div style={{ textAlign: 'center' }}>
                                          <div style={{ fontSize: '24px', marginBottom: '1rem' }}>❌ Video not found</div>
                                          <div>Could not find a YouTube video for this track</div>
                                        </div>
                                      </div>
                                    )}
                                    <div style={{
                                      display: 'flex',
                                      gap: '1rem',
                                      justifyContent: 'center',
                                      padding: '1rem',
                                      background: '#2a2a2a',
                                      borderRadius: '8px'
                                    }}>
                                      <button
                                        onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                                        disabled={currentTrackIndex === 0}
                                        style={{
                                          background: currentTrackIndex === 0 ? '#555' : '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        ⏮ Previous
                                      </button>
                                      <button
                                        onClick={() => setCurrentTrackIndex(Math.min(playlistVideos.length - 1, currentTrackIndex + 1))}
                                        disabled={currentTrackIndex === playlistVideos.length - 1}
                                        style={{
                                          background: currentTrackIndex === playlistVideos.length - 1 ? '#555' : '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === playlistVideos.length - 1 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        Next ⏭
                                      </button>
                                    </div>
                                  </>
                                  )}
                                </div>
                                <div style={{
                                  flex: '0 0 30%',
                                  background: '#2a2a2a',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  overflowY: 'auto'
                                }}>
                                  <h3 style={{
                                    fontSize: '22px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    marginBottom: '1rem',
                                    borderBottom: '1px solid #444',
                                    paddingBottom: '0.5rem'
                                  }}>
                                    Playlist Tracks
                                  </h3>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {playlistVideos.map((video, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => setCurrentTrackIndex(idx)}
                                        style={{
                                          background: idx === currentTrackIndex ? '#3b82f6' : '#333',
                                          padding: '0.75rem',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          border: idx === currentTrackIndex ? '2px solid #60a5fa' : '2px solid transparent'
                                        }}
                                      >
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#888',
                                          marginBottom: '0.25rem'
                                        }}>
                                          Track {idx + 1}
                                        </div>
                                        <div style={{
                                          fontSize: '18px',
                                          fontWeight: 'bold',
                                          color: '#fff',
                                          marginBottom: '0.25rem'
                                        }}>
                                          {video.title}
                                        </div>
                                        <div style={{
                                          fontSize: '16px',
                                          fontWeight: '600',
                                          color: '#10b981'
                                        }}>
                                          {video.artist}
                                        </div>
                                        {video.videoId && (
                                          <div style={{
                                            fontSize: '14px',
                                            color: idx === currentTrackIndex ? '#bfdbfe' : '#10b981',
                                            marginTop: '0.25rem'
                                          }}>
                                            ✓ Video found
                                          </div>
                                        )}
                                        {video.error && (
                                          <div style={{
                                            fontSize: '14px',
                                            color: '#f87171',
                                            marginTop: '0.25rem'
                                          }}>
                                            ✗ No video
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <iframe
                        ref={videoIframeRef}
                        srcDoc={videoEmbedHtml}
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          flex: 1
                        }}
                        title={selectedVideo.title}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // Search View
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <input
                              type="text"
                              className="united-tribes-search-input"
                              value={aiQuery}
                              onChange={(e) => setAiQuery(e.target.value)}
                              placeholder="Search UnitedTribes videos"
                              style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                paddingRight: searchQuery ? '3.5rem' : '1.5rem',
                                border: '2px solid #1e3a8a',
                                borderRadius: '10px',
                                fontSize: '24px',
                                outline: 'none',
                                fontWeight: '500',
                                color: '#000',
                                backgroundColor: 'white',
                                lineHeight: '1.2'
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#f0f9ff';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#1e3a8a';
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            />
                            {searchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAiQuery('');
                                  setSearchResults([]);
                                  setSearchError(null);
                                }}
                                style={{
                                  position: 'absolute',
                                  right: '1rem',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  border: '2px solid #6b7280',
                                  background: 'white',
                                  color: '#6b7280',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#3b82f6';
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                  e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#6b7280';
                                  e.currentTarget.style.color = '#6b7280';
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                          <button
                            type="submit"
                            style={{
                              padding: '1rem 2rem',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '20px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#3b82f6';
                            }}
                          >
                            Search
                          </button>
                        </div>
                      </form>

                      {/* Page 1 - Pre-populated Discovery Section */}
                      {currentPage?.originalData?.page === 1 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                              🎵 UnitedTribes AI-Enhanced Discovery
                            </h3>
                            <button
                              onClick={() => setPage1DiscoveryExpanded(!page1DiscoveryExpanded)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {page1DiscoveryExpanded ? '▼ Collapse' : '▶ Expand'}
                            </button>
                          </div>

                          {page1DiscoveryExpanded && (
                            <div style={{ marginTop: '1rem' }}>
                              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                                Featured Videos ({page1PreloadedVideos.length})
                              </h4>
                              {page1PreloadedVideos.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                  {page1PreloadedVideos.map((video: any) => (
                                    <div
                                      key={video.id}
                                      style={{
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                      }}
                                      onClick={() => embedVideo(video)}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                      }}
                                    >
                                      {video.thumbnail && (
                                        <img
                                          src={video.thumbnail}
                                          alt={video.title}
                                          style={{ width: '100%', height: 'auto', display: 'block' }}
                                        />
                                      )}
                                      <div style={{ padding: '1rem' }}>
                                        <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                          {video.title}
                                        </p>
                                        <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                          {video.channel} • {video.duration}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                  Loading videos...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* DISCOVERY PANEL - PAGE 4 (Blue Note Chiefs) */}
                      {currentPage?.originalData?.page === 4 && (
                        <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                              🎵 UnitedTribes AI-Enhanced Discovery
                            </h3>
                            <button
                              onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                            </button>
                          </div>

                          {discoveryPanelExpanded && (
                            <div>
                              {/* Tabs */}
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                <button
                                  onClick={() => setDiscoveryTab('featured')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'featured' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'featured' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Featured
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('read')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'read' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'read' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Read
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('watch')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'watch' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'watch' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Watch
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('music')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'music' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'music' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Music
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('explorer')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'explorer' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'explorer' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  United AI Explorer
                                </button>
                              </div>

                              {/* Tab Content */}
                              <div style={{ padding: '1rem' }}>
                                {discoveryTab === 'featured' && (
                                  <div>
                                    {page4PreloadedVideos.length > 0 ? (
                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                        {page4PreloadedVideos.map((video: any) => (
                                          <div
                                            key={video.id}
                                            style={{
                                              cursor: 'pointer',
                                              borderRadius: '8px',
                                              overflow: 'hidden',
                                              background: 'white',
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                              transition: 'transform 0.2s, box-shadow 0.2s'
                                            }}
                                            onClick={() => embedVideo(video)}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.transform = 'translateY(-2px)';
                                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.transform = 'translateY(0)';
                                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                            }}
                                          >
                                            {video.thumbnail && (
                                              <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                style={{ width: '100%', height: 'auto', display: 'block' }}
                                              />
                                            )}
                                            <div style={{ padding: '1rem' }}>
                                              <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                                {video.title}
                                              </p>
                                              <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                                {video.channel} • {video.duration}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                        Loading featured videos...
                                      </div>
                                    )}
                                  </div>
                                )}
                                {discoveryTab === 'read' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Reading recommendations coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'watch' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Video content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'music' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Music content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'explorer' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Explorer content coming soon...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {searchLoading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>
                          Searching videos...
                        </div>
                      )}

                      {searchError && (
                        <div style={{
                          padding: '1rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '8px',
                          marginBottom: '1rem'
                        }}>
                          {searchError}
                        </div>
                      )}

                      {!searchLoading && searchResults.length > 0 && (
                        <div style={{ marginTop: '2rem', flex: 1, overflowY: 'auto' }}>
                          <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                            Search Results ({searchResults.length})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {searchResults.map((video: any) => (
                              <div
                                key={video.id}
                                style={{
                                  cursor: 'pointer',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  background: 'white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                  transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                onClick={() => embedVideo(video)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                }}
                              >
                                {video.thumbnail && (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                  />
                                )}
                                <div style={{ padding: '1rem' }}>
                                  <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                    {video.title}
                                  </p>
                                  <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                    {video.channel} • {video.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
                        <div style={{
                          textAlign: 'center',
                          padding: '2rem',
                          color: '#6b7280'
                        }}>
                          No results found for "{searchQuery}"
                        </div>
                      )}

                      {/* DISCOVERY PANEL - PAGE 5 */}
                      {currentPage?.originalData?.page === 5 && (
                        <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                              🎵 UnitedTribes AI-Enhanced Discovery
                            </h3>
                            <button
                              onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                            </button>
                          </div>

                          {discoveryPanelExpanded && (
                            <div>
                              {/* Tabs */}
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                <button
                                  onClick={() => setDiscoveryTab('featured')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'featured' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'featured' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Featured
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('read')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'read' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'read' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Read
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('watch')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'watch' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'watch' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Watch
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('music')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'music' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'music' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Music
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('explorer')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'explorer' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'explorer' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  United AI Explorer
                                </button>
                              </div>

                              {/* Tab Content */}
                              <div style={{ padding: discoveryTab === 'music' ? '0' : '1rem' }}>
                                {discoveryTab === 'featured' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Featured content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'read' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Reading recommendations coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'watch' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Video content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'music' && (
                                  <div>
                                    {/* Music content displays via album cover below */}
                                  </div>
                                )}
                                {discoveryTab === 'explorer' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Explorer content coming soon...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Album Cover Display with Hidden Audio Player */}
                      {!selectedVideo && !searchLoading && !searchQuery && searchResults.length === 0 && discoveryResults.length > 0 && discoveryResults[0].type === 'album_cover' && (
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                            {discoveryResults[0].title}
                            {discoveryResults[0].subtitle && (
                              <span style={{ fontSize: '18px', color: '#6b7280', fontWeight: '400', marginLeft: '0.5rem' }}>
                                - {discoveryResults[0].subtitle}
                              </span>
                            )}
                          </h3>
                          <div
                            style={{
                              background: 'white',
                              padding: '1rem',
                              borderRadius: '8px',
                              boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                              cursor: discoveryResults[0].videoId ? 'pointer' : 'default',
                              transition: 'all 0.3s ease',
                              border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                            }}
                            onClick={() => {
                              if (discoveryResults[0].videoId && albumAudioIframeRef.current) {
                                const iframe = albumAudioIframeRef.current;
                                const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                iframe.contentWindow?.postMessage(
                                  JSON.stringify({ event: 'command', func: command, args: [] }),
                                  '*'
                                );
                                setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} audio for ${discoveryResults[0].title}`);
                              }
                            }}
                          >
                            <img
                              src={discoveryResults[0].image}
                              alt={discoveryResults[0].title}
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                transition: 'opacity 0.3s ease'
                              }}
                            />
                            {isAlbumAudioPlaying && (
                              <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}>
                                ♪ Playing...
                              </div>
                            )}
                          </div>

                          {/* Hidden YouTube iframe for audio playback */}
                          {discoveryResults[0].videoId && (
                            <iframe
                              ref={albumAudioIframeRef}
                              src={`https://www.youtube.com/embed/${discoveryResults[0].videoId}?enablejsapi=1&controls=0`}
                              style={{
                                position: 'absolute',
                                width: '1px',
                                height: '1px',
                                opacity: 0,
                                pointerEvents: 'none'
                              }}
                              allow="autoplay"
                            />
                          )}
                        </div>
                      )}

                      {/* DISCOVERY PANEL - PAGE 6 (Cover Story) */}
                      {currentPage?.originalData?.page === 6 && (
                        <div style={{ marginTop: '2rem', borderTop: '2px solid #e5e7eb', paddingTop: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                              🎵 UnitedTribes AI-Enhanced Discovery
                            </h3>
                            <button
                              onClick={() => setDiscoveryPanelExpanded(!discoveryPanelExpanded)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {discoveryPanelExpanded ? '▼ Collapse' : '▶ Expand'}
                            </button>
                          </div>

                          {discoveryPanelExpanded && (
                            <div>
                              {/* Tabs */}
                              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>
                                <button
                                  onClick={() => setDiscoveryTab('featured')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'featured' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'featured' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Featured
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('read')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'read' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'read' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Read
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('watch')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'watch' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'watch' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Watch
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('music')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'music' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'music' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  Music
                                </button>
                                <button
                                  onClick={() => setDiscoveryTab('explorer')}
                                  style={{
                                    padding: '0.5rem 1rem',
                                    background: discoveryTab === 'explorer' ? '#3b82f6' : '#f3f4f6',
                                    color: discoveryTab === 'explorer' ? 'white' : '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  United AI Explorer
                                </button>
                              </div>

                              {/* Tab Content */}
                              <div style={{ padding: '1rem' }}>
                                {discoveryTab === 'featured' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Featured content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'read' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Reading recommendations coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'watch' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Video content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'music' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Music content coming soon...
                                  </div>
                                )}
                                {discoveryTab === 'explorer' && (
                                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    Explorer content coming soon...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            } else if ((currentPage?.originalData?.page === 1 && currentPage?.originalData?.type === 'cover') ||
                       (currentPage?.originalData?.page === 2 && currentPage?.originalData?.type === 'index')) {
              // Pages 1-2 (cover and index) - Use same implementation as pages 3-6
              return (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {selectedVideo ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <button onClick={closeVideo} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          background: '#f3f4f6', border: '1px solid #d1d5db',
                          borderRadius: '6px', padding: '0.5rem 1rem',
                          cursor: 'pointer', fontSize: '14px',
                          fontWeight: '500', color: '#374151', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}>
                          ← Back to Search
                        </button>
                        <button onClick={() => {
                          console.log('🎵 Playlist button clicked - stopping video');
                          // Save current video and clear it to stop playback
                          if (videoEmbedHtml) {
                            console.log('✅ Saving and clearing video HTML');
                            setSavedVideoEmbedHtml(videoEmbedHtml);
                            setVideoEmbedHtml('');
                          }
                          if (selectedVideo?.id) {
                            fetchPlaylistData(selectedVideo.id);
                          }
                        }} style={{
                          background: '#8b5cf6', color: 'white', border: 'none',
                          borderRadius: '6px', padding: '0.5rem 1rem',
                          cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#7c3aed'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#8b5cf6'; }}>
                          📚 Works & Discovery Playlists
                        </button>
                      </div>

                      {showPlaylistView && videoPlaylistData && (
                        <>
                          <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.7)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }} onClick={() => {
                            setShowPlaylistView(false);
                            // Restore video when closing playlist
                            if (savedVideoEmbedHtml) {
                              setVideoEmbedHtml(savedVideoEmbedHtml);
                              setSavedVideoEmbedHtml('');
                            }
                          }}>
                            <div style={{
                              position: 'relative', width: '90%', maxWidth: '600px', maxHeight: '90vh',
                              background: 'white', borderRadius: '12px', padding: '1.5rem',
                              overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000' }}>📚 Works & Playlists</h3>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <div style={{
                                    background: '#10b981', color: 'white', padding: '0.5rem 1rem',
                                    borderRadius: '6px', fontSize: '16px', fontWeight: '600'
                                  }}>
                                    🎵 Playlist: {currentPlaylist.length} tracks
                                  </div>
                                  {currentPlaylist.length > 0 && (
                                    <>
                                      <button onClick={() => { playPlaylist(); setShowPlaylistView(false); }} style={{
                                        background: '#3b82f6', color: 'white', border: 'none',
                                        borderRadius: '6px', padding: '0.5rem 1rem',
                                        cursor: 'pointer', fontSize: '16px', fontWeight: '600'
                                      }}>▶ Play All</button>
                                      <button onClick={clearPlaylist} style={{
                                        background: '#f59e0b', color: 'white', border: 'none',
                                        borderRadius: '6px', padding: '0.5rem 1rem',
                                        cursor: 'pointer', fontSize: '16px', fontWeight: '600'
                                      }}>Clear</button>
                                    </>
                                  )}
                                  <button onClick={() => {
                                    setShowPlaylistView(false);
                                    // Restore video when closing playlist
                                    if (savedVideoEmbedHtml) {
                                      setVideoEmbedHtml(savedVideoEmbedHtml);
                                      setSavedVideoEmbedHtml('');
                                    }
                                  }} style={{
                                    background: '#ef4444', color: 'white', border: 'none',
                                    borderRadius: '6px', padding: '0.5rem 1rem',
                                    cursor: 'pointer', fontSize: '16px', fontWeight: '600'
                                  }}>✕ Close</button>
                                </div>
                              </div>
                              {videoPlaylistData.works && videoPlaylistData.works.length > 0 && (
                                <div style={{ marginBottom: '2rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '22px', fontWeight: '600', color: '#000' }}>
                                      🎵 Works Mentioned ({videoPlaylistData.works.length})
                                    </h4>
                                    <button onClick={() => toggleAllWorks(true)} style={{
                                      background: areAllWorksAdded(true) ? '#ef4444' : '#3b82f6',
                                      color: 'white', border: 'none', borderRadius: '6px',
                                      padding: '0.5rem 1rem', cursor: 'pointer',
                                      fontSize: '16px', fontWeight: '600'
                                    }}>
                                      {areAllWorksAdded(true) ? '- Remove All' : '+ Add All'}
                                    </button>
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    {videoPlaylistData.works.map((work: any, idx: number) => {
                                      const isAdded = currentPlaylist.some(item =>
                                        item.title === work.title && item.artist === work.artist
                                      );
                                      return (
                                        <div key={idx} style={{
                                          background: isAdded ? '#dcfce7' : '#f0fdf4',
                                          border: isAdded ? '2px solid #16a34a' : '2px solid #22c55e',
                                          borderRadius: '8px', padding: '0.75rem 1rem',
                                          fontSize: '18px', display: 'flex',
                                          alignItems: 'center', gap: '0.5rem',
                                          color: '#000', opacity: isAdded ? 0.8 : 1
                                        }}>
                                          <button onClick={() => toggleIndividualSong(work)} style={{
                                            background: isAdded ? '#ef4444' : '#3b82f6',
                                            color: 'white', border: 'none', borderRadius: '4px',
                                            padding: '0.25rem 0.5rem', cursor: 'pointer',
                                            fontSize: '14px', fontWeight: '600', marginRight: '0.5rem'
                                          }}>
                                            {isAdded ? '- Remove' : '+ Add'}
                                          </button>
                                          <strong>{work.title}</strong> - {work.artist}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              {videoPlaylistData.playlists && videoPlaylistData.playlists.length > 0 && (
                                <div>
                                  <h4 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '1rem', color: '#000' }}>
                                    🎼 Discovery Playlists ({videoPlaylistData.playlists.length})
                                  </h4>
                                  <div style={{ maxHeight: '800px', overflowY: 'auto' }}>
                                    {videoPlaylistData.playlists.map((playlist: any, idx: number) => (
                                      <div key={idx} style={{
                                        marginBottom: '1.5rem', background: '#faf5ff',
                                        border: '2px solid #8b5cf6', borderRadius: '8px', padding: '1rem'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                          <h5 style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                                            {playlist.name}
                                          </h5>
                                          <button onClick={() => toggleAllPlaylistTracks(playlist.name, playlist.tracks)} style={{
                                            background: areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '#ef4444' : '#3b82f6',
                                            color: 'white', border: 'none', borderRadius: '6px',
                                            padding: '0.4rem 0.8rem', cursor: 'pointer',
                                            fontSize: '15px', fontWeight: '600'
                                          }}>
                                            {areAllPlaylistTracksAdded(playlist.name, playlist.tracks) ? '- Remove All' : '+ Add All'}
                                          </button>
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#000' }}>
                                          {playlist.tracks.map((track: any, tidx: number) => {
                                            const isAdded = currentPlaylist.some(item =>
                                              item.title === track.title && item.artist === track.artist
                                            );
                                            return (
                                              <div key={tidx} style={{
                                                marginBottom: '0.5rem', display: 'flex', alignItems: 'center',
                                                gap: '0.5rem', padding: '0.25rem 0.5rem',
                                                background: isAdded ? '#dcfce7' : 'transparent', borderRadius: '4px'
                                              }}>
                                                <button onClick={() => toggleIndividualSong(track)} style={{
                                                  background: isAdded ? '#ef4444' : '#3b82f6',
                                                  color: 'white', border: 'none', borderRadius: '4px',
                                                  padding: '0.2rem 0.4rem', cursor: 'pointer',
                                                  fontSize: '12px', fontWeight: '600', opacity: 1
                                                }}>
                                                  {isAdded ? '- Remove' : '+ Add'}
                                                </button>
                                                <span style={{ opacity: isAdded ? 0.8 : 1 }}>
                                                  <strong>"{track.title}"</strong> - {track.artist}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {showPlaylistPlayer && (
                        <>
                          <div style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)', zIndex: 10000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }} onClick={() => {
                            setShowPlaylistPlayer(false);
                            setPlaylistVideos([]);
                            setCurrentTrackIndex(0);
                            // Restore the saved video HTML
                            if (savedVideoEmbedHtml) {
                              setVideoEmbedHtml(savedVideoEmbedHtml);
                            }
                          }}>
                            <div style={{
                              position: 'relative', width: '95%', maxWidth: '1400px', height: '90vh',
                              background: '#1a1a1a', borderRadius: '12px', padding: '1.5rem',
                              display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }} onClick={(e) => e.stopPropagation()}>
                              <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '1rem', borderBottom: '2px solid #333', paddingBottom: '1rem'
                              }}>
                                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                  🎵 Playlist Player ({playlistVideos.length} videos)
                                </h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                  <div style={{
                                    background: '#4ade80', color: 'white', padding: '0.5rem 1rem',
                                    borderRadius: '6px', fontSize: '16px', fontWeight: '600'
                                  }}>
                                    Track {currentTrackIndex + 1} of {playlistVideos.length}
                                  </div>
                                  <button onClick={() => {
                                    setShowPlaylistPlayer(false);
                                    setPlaylistVideos([]);
                                    setCurrentTrackIndex(0);
                                    // Restore the saved video HTML
                                    if (savedVideoEmbedHtml) {
                                      setVideoEmbedHtml(savedVideoEmbedHtml);
                                    }
                                  }} style={{
                                    background: '#ef4444', color: 'white', border: 'none',
                                    borderRadius: '6px', padding: '0.5rem 1rem',
                                    cursor: 'pointer', fontSize: '16px', fontWeight: '600'
                                  }}>✕ Close Player</button>
                                </div>
                              </div>
                              <div style={{ display: 'flex', flex: 1, gap: '1rem', overflow: 'hidden' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                  {loadingPlaylistVideos ? (
                                    <div style={{
                                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      background: '#2a2a2a', borderRadius: '8px'
                                    }}>
                                      <div style={{ textAlign: 'center', color: '#fff' }}>
                                        <div style={{ fontSize: '24px', marginBottom: '1rem' }}>⏳ Loading videos...</div>
                                        <div>Searching YouTube for playlist tracks</div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                    {playlistVideos[currentTrackIndex]?.videoId ? (
                                      <iframe key={playlistVideos[currentTrackIndex].videoId}
                                        src={`https://www.youtube.com/embed/${playlistVideos[currentTrackIndex].videoId}?autoplay=1&rel=0`}
                                        style={{
                                          width: '100%', flex: 1, border: 'none',
                                          borderRadius: '8px', background: '#000'
                                        }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen />
                                    ) : (
                                      <div style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#2a2a2a', borderRadius: '8px', color: '#888'
                                      }}>
                                        <div style={{ textAlign: 'center' }}>
                                          <div style={{ fontSize: '24px', marginBottom: '1rem' }}>❌ Video not found</div>
                                          <div>Could not find a YouTube video for this track</div>
                                        </div>
                                      </div>
                                    )}
                                    <div style={{
                                      display: 'flex', gap: '1rem', justifyContent: 'center',
                                      padding: '1rem', background: '#2a2a2a', borderRadius: '8px'
                                    }}>
                                      <button onClick={() => setCurrentTrackIndex(Math.max(0, currentTrackIndex - 1))}
                                        disabled={currentTrackIndex === 0} style={{
                                          background: currentTrackIndex === 0 ? '#555' : '#3b82f6',
                                          color: 'white', border: 'none', borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === 0 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px', fontWeight: '600'
                                        }}>⏮ Previous</button>
                                      <button onClick={() => setCurrentTrackIndex(Math.min(playlistVideos.length - 1, currentTrackIndex + 1))}
                                        disabled={currentTrackIndex === playlistVideos.length - 1} style={{
                                          background: currentTrackIndex === playlistVideos.length - 1 ? '#555' : '#3b82f6',
                                          color: 'white', border: 'none', borderRadius: '6px',
                                          padding: '0.75rem 1.5rem',
                                          cursor: currentTrackIndex === playlistVideos.length - 1 ? 'not-allowed' : 'pointer',
                                          fontSize: '16px', fontWeight: '600'
                                        }}>Next ⏭</button>
                                    </div>
                                  </>
                                  )}
                                </div>
                                <div style={{
                                  flex: '0 0 30%', background: '#2a2a2a',
                                  borderRadius: '8px', padding: '1rem', overflowY: 'auto'
                                }}>
                                  <h3 style={{
                                    fontSize: '22px', fontWeight: 'bold', color: '#fff',
                                    marginBottom: '1rem', borderBottom: '1px solid #444', paddingBottom: '0.5rem'
                                  }}>Playlist Tracks</h3>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {playlistVideos.map((video, idx) => (
                                      <div key={idx} onClick={() => setCurrentTrackIndex(idx)} style={{
                                        background: idx === currentTrackIndex ? '#3b82f6' : '#333',
                                        padding: '0.75rem', borderRadius: '6px', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: idx === currentTrackIndex ? '2px solid #60a5fa' : '2px solid transparent'
                                      }}>
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#888',
                                          marginBottom: '0.25rem'
                                        }}>
                                          Track {idx + 1}
                                        </div>
                                        <div style={{
                                          fontSize: '18px',
                                          fontWeight: 'bold',
                                          color: '#fff',
                                          marginBottom: '0.25rem'
                                        }}>
                                          {video.title}
                                        </div>
                                        <div style={{
                                          fontSize: '16px',
                                          fontWeight: '600',
                                          color: '#10b981'
                                        }}>
                                          {video.artist}
                                        </div>
                                        {video.videoId && (
                                          <div style={{
                                            fontSize: '14px',
                                            color: idx === currentTrackIndex ? '#bfdbfe' : '#10b981',
                                            marginTop: '0.25rem'
                                          }}>✓ Video found</div>
                                        )}
                                        {video.error && (
                                          <div style={{
                                            fontSize: '14px', color: '#f87171', marginTop: '0.25rem'
                                          }}>✗ No video</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <iframe ref={videoIframeRef} srcDoc={videoEmbedHtml} style={{
                        width: '100%', height: '100%', border: 'none', flex: 1,
                        display: showPlaylistPlayer ? 'none' : 'block'
                      }} title={selectedVideo.title}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen />
                    </div>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <input type="text" className="united-tribes-search-input"
                            value={aiQuery} onChange={(e) => setAiQuery(e.target.value)}
                            placeholder="Search UnitedTribes videos"
                            style={{
                              flex: 1, padding: '1rem 1.5rem', border: '2px solid #1e3a8a',
                              borderRadius: '10px', fontSize: '24px', outline: 'none',
                              fontWeight: '500', color: '#000', backgroundColor: 'white', lineHeight: '1.2'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.backgroundColor = '#f0f9ff';
                              e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.2)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = '#1e3a8a';
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.boxShadow = 'none';
                            }} />
                          <button type="submit" style={{
                            padding: '1rem 2rem', background: '#3b82f6', color: 'white',
                            border: 'none', borderRadius: '10px', fontSize: '20px',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; }}>
                            Search
                          </button>
                        </div>
                      </form>

                      {/* Page 1 - Pre-populated Discovery Section */}
                      {currentPage?.originalData?.page === 1 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                              🎵 UnitedTribes AI-Enhanced Discovery
                            </h3>
                            <button
                              onClick={() => setPage1DiscoveryExpanded(!page1DiscoveryExpanded)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#f3f4f6',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              {page1DiscoveryExpanded ? '▼ Collapse' : '▶ Expand'}
                            </button>
                          </div>

                          {page1DiscoveryExpanded && (
                            <div style={{ marginTop: '1rem' }}>
                              <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                                Featured Videos ({page1PreloadedVideos.length})
                              </h4>
                              {page1PreloadedVideos.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                  {page1PreloadedVideos.map((video: any) => (
                                    <div
                                      key={video.id}
                                      style={{
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: 'white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s, box-shadow 0.2s'
                                      }}
                                      onClick={() => embedVideo(video)}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                      }}
                                    >
                                      {video.thumbnail && (
                                        <img
                                          src={video.thumbnail}
                                          alt={video.title}
                                          style={{ width: '100%', height: 'auto', display: 'block' }}
                                        />
                                      )}
                                      <div style={{ padding: '1rem' }}>
                                        <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                          {video.title}
                                        </p>
                                        <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                          {video.channel} • {video.duration}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                  Loading videos...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {searchLoading && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#3b82f6', fontSize: '18px', fontWeight: '600' }}>
                          Searching videos...
                        </div>
                      )}
                      {searchError && (
                        <div style={{
                          padding: '1rem', background: '#fee2e2', color: '#dc2626',
                          borderRadius: '8px', marginBottom: '1rem'
                        }}>
                          {searchError}
                        </div>
                      )}
                      {!searchLoading && searchResults.length > 0 && (
                        <div style={{ marginTop: '2rem', flex: 1, overflowY: 'auto' }}>
                          <h4 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '1rem', color: '#1f2937' }}>
                            Search Results ({searchResults.length})
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                            {searchResults.map((video: any) => (
                              <div key={video.id} style={{
                                cursor: 'pointer', borderRadius: '8px', overflow: 'hidden',
                                background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                              }}
                              onClick={() => embedVideo(video)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}>
                                {video.thumbnail && (
                                  <img src={video.thumbnail} alt={video.title}
                                    style={{ width: '100%', height: 'auto', display: 'block' }} />
                                )}
                                <div style={{ padding: '1rem' }}>
                                  <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1f2937' }}>
                                    {video.title}
                                  </p>
                                  <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                    {video.channel} • {video.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            } else {
                // Discovery panel for pages 3-14
                console.log('🎵 Discovery panel rendering - discoveryResults:', discoveryResults);
                // Check if we have album cover to display
                if (discoveryResults.length > 0 && discoveryResults[0].type === 'album_cover') {
                  console.log('🎵 Rendering album cover:', discoveryResults[0]);
                  return (
                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
                        {discoveryResults[0].title}
                      </h3>
                      {discoveryResults[0].subtitle && (
                        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '1.5rem' }}>
                          {discoveryResults[0].subtitle}
                        </p>
                      )}
                      <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <img
                          src={discoveryResults[0].image}
                          alt={discoveryResults[0].title}
                          style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  );
                }

                // Page 12 (Sonny Rollins) - Collapsible discovery section
                if (currentPage?.originalData?.page === 12) {
                  return (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                          🎵 UnitedTribes AI-Enhanced Discovery
                        </h3>
                        <button
                          onClick={() => setPage17DiscoveryExpanded(!page17DiscoveryExpanded)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {page17DiscoveryExpanded ? '▼ Collapse' : '▶ Expand'}
                        </button>
                      </div>

                      {page17DiscoveryExpanded && (
                        <div style={{ marginTop: '1rem' }}>
                          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1f2937' }}>
                            Sonny Rollins
                          </h3>
                          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '1.5rem' }}>
                            Vol. 2
                          </p>
                          <div
                            style={{
                              background: 'white',
                              padding: '1rem',
                              borderRadius: '8px',
                              boxShadow: isAlbumAudioPlaying ? '0 4px 20px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                            }}
                            onClick={() => {
                              if (albumAudioIframeRef.current) {
                                const iframe = albumAudioIframeRef.current;
                                const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                iframe.contentWindow?.postMessage(
                                  JSON.stringify({ event: 'command', func: command, args: [] }),
                                  '*'
                                );
                                setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                console.log(`🎵 ${isAlbumAudioPlaying ? 'Pausing' : 'Playing'} audio for Sonny Rollins`);
                              }
                            }}
                          >
                            <img
                              src="/sonny-rollins-cover.png"
                              alt="Sonny Rollins Vol. 2"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                opacity: isAlbumAudioPlaying ? 0.95 : 1,
                                transition: 'opacity 0.3s ease'
                              }}
                            />
                            {isAlbumAudioPlaying && (
                              <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '6px',
                                textAlign: 'center',
                                fontSize: '16px',
                                fontWeight: '600'
                              }}>
                                ♪ Playing...
                              </div>
                            )}
                          </div>

                          {/* Hidden YouTube iframe for audio playback */}
                          <iframe
                            ref={albumAudioIframeRef}
                            src="https://www.youtube.com/embed/X1alDkoPCNE?enablejsapi=1&controls=0"
                            style={{
                              position: 'absolute',
                              width: '1px',
                              height: '1px',
                              opacity: 0,
                              pointerEvents: 'none'
                            }}
                            allow="autoplay"
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                // Default Discovery panel for other pages with Music tab
                return (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', border: '2px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                        🎵 UnitedTribes AI-Enhanced Discovery
                      </h3>
                      <button
                        onClick={() => setDefaultDiscoveryExpanded(!defaultDiscoveryExpanded)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {defaultDiscoveryExpanded ? '▼ Collapse' : '▶ Expand'}
                      </button>
                    </div>

                    {defaultDiscoveryExpanded && (
                      <div style={{ marginTop: '1rem' }}>
                        {/* Music Tab Content */}
                        <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                          <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>Album Collection</h4>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {/* Thelonious Monk Album */}
                            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              <div
                                style={{
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  const albumData = {
                                    type: 'album_cover',
                                    title: 'Thelonious Monk',
                                    subtitle: 'Genius of Modern Music',
                                    image: '/thelonious-monk-cover.png',
                                    videoId: 'dG1BADiWfdU'
                                  };
                                  setDiscoveryResults([albumData]);
                                  setSelectedDiscoveryIndex(0);

                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                  }
                                }}
                              >
                                <img
                                  src="/thelonious-monk-cover.png"
                                  alt="Thelonious Monk"
                                  style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '0.5rem' }}
                                />
                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>Thelonious Monk</p>
                                <p style={{ fontSize: '14px', color: '#6b7280' }}>Genius of Modern Music</p>
                              </div>
                            </div>

                            {/* Herbie Hancock Album */}
                            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              <div
                                style={{
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  const albumData = {
                                    type: 'album_cover',
                                    title: 'Herbie Hancock',
                                    subtitle: 'Takin\' Off',
                                    image: '/herbie-hancock-cover.png',
                                    videoId: 'CrmFJjmRIi4'
                                  };
                                  setDiscoveryResults([albumData]);
                                  setSelectedDiscoveryIndex(0);

                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                  }
                                }}
                              >
                                <img
                                  src="/herbie-hancock-cover.png"
                                  alt="Herbie Hancock"
                                  style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '0.5rem' }}
                                />
                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>Herbie Hancock</p>
                                <p style={{ fontSize: '14px', color: '#6b7280' }}>Takin' Off</p>
                              </div>
                            </div>

                            {/* Sonny Rollins Album */}
                            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              <div
                                style={{
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  border: isAlbumAudioPlaying ? '2px solid #3b82f6' : '2px solid transparent'
                                }}
                                onClick={() => {
                                  const albumData = {
                                    type: 'album_cover',
                                    title: 'Sonny Rollins',
                                    subtitle: 'Vol. 2',
                                    image: '/sonny-rollins-cover.png',
                                    videoId: 'X1alDkoPCNE'
                                  };
                                  setDiscoveryResults([albumData]);
                                  setSelectedDiscoveryIndex(0);

                                  if (albumAudioIframeRef.current) {
                                    const iframe = albumAudioIframeRef.current;
                                    const command = isAlbumAudioPlaying ? 'pauseVideo' : 'playVideo';
                                    iframe.contentWindow?.postMessage(
                                      JSON.stringify({ event: 'command', func: command, args: [] }),
                                      '*'
                                    );
                                    setIsAlbumAudioPlaying(!isAlbumAudioPlaying);
                                  }
                                }}
                              >
                                <img
                                  src="/sonny-rollins-cover.png"
                                  alt="Sonny Rollins"
                                  style={{ width: '100%', height: 'auto', borderRadius: '4px', marginBottom: '0.5rem' }}
                                />
                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>Sonny Rollins</p>
                                <p style={{ fontSize: '14px', color: '#6b7280' }}>Vol. 2</p>
                              </div>
                            </div>
                          </div>

                          {/* Hidden YouTube iframe for audio playback */}
                          {discoveryResults.length > 0 && discoveryResults[0].videoId && (
                            <iframe
                              ref={albumAudioIframeRef}
                              src={`https://www.youtube.com/embed/${discoveryResults[0].videoId}?enablejsapi=1&controls=0`}
                              style={{
                                position: 'absolute',
                                width: '1px',
                                height: '1px',
                                opacity: 0,
                                pointerEvents: 'none'
                              }}
                              allow="autoplay"
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
          })()}
        </div>

        {/* Visualization Modal */}
        {(() => {
          console.log('🎬 Blue Note - Rendering modal section, showVisualizationModal:', showVisualizationModal);
          return null;
        })()}
        {showVisualizationModal && (() => {
          // Determine which visualization to show based on current page
          const visualizationData = currentPage?.originalData?.page === 1 ? {
            artist: 'John Coltrane',
            url: 'http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/john-coltrane-network.html'
          } : currentPage?.originalData?.page === 8 ? {
            artist: 'Thelonious Monk',
            url: 'http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/thelonious-monk-network.html'
          } : currentPage?.originalData?.page === 10 ? {
            artist: 'Art Blakey',
            url: 'http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/art-blakey-network.html'
          } : {
            artist: 'John Coltrane',
            url: 'http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/john-coltrane-network.html'
          };

          return (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem'
            }}
            onClick={() => setShowVisualizationModal(false)}
          >
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                width: '95%',
                maxWidth: '1800px',
                height: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: '1.5rem',
                borderBottom: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9fafb'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: 0
                }}>
                  {visualizationData.artist} Network Visualization
                </h2>
                <button
                  onClick={() => setShowVisualizationModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '32px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    lineHeight: 1,
                    fontWeight: '300'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div style={{
                flex: 1,
                display: 'flex',
                gap: '1.5rem',
                padding: '1.5rem',
                overflow: 'hidden'
              }}>
                {/* Left Side - Visualization or Video */}
                <div style={{
                  flex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  minWidth: 0
                }}>
                  {selectedVideo ? (
                    /* Video Player View */
                    <>
                      <button
                        onClick={() => setSelectedVideo(null)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          marginBottom: '0.5rem',
                          alignSelf: 'flex-start'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        ← Back to Visualization
                      </button>
                      <div style={{
                        flex: 1,
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        overflow: 'auto',
                        background: '#000',
                        minHeight: 0
                      }}>
                        <iframe
                          src={`/api/videos/${selectedVideo.id}/embed-html`}
                          style={{
                            width: '100%',
                            height: '800px',
                            border: 'none'
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={selectedVideo.title}
                        />
                      </div>
                    </>
                  ) : selectedArticle ? (
                    /* Article Card View */
                    <>
                      <button
                        onClick={() => setSelectedArticle(null)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          marginBottom: '0.5rem',
                          alignSelf: 'flex-start'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        ← Back to Visualization
                      </button>
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'white',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        border: '2px solid #d1d5db',
                        overflow: 'auto'
                      }}>
                        {/* Publication image - takes up most space */}
                        <div style={{
                          width: '100%',
                          flex: '1',
                          minHeight: '500px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          marginBottom: '0.75rem',
                          overflow: 'hidden',
                          background: '#f3f4f6'
                        }}>
                          {selectedArticle.publication === 'Pitchfork' ? (
                            <img
                              src="/pitchfork-article.png"
                              alt="Pitchfork Article"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#6b7280',
                              textAlign: 'center',
                              padding: '2rem'
                            }}>
                              {selectedArticle.publication} Article Image (Placeholder)
                            </div>
                          )}
                        </div>

                        {/* Three compact purchase buttons */}
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '1rem',
                          justifyContent: 'center'
                        }}>
                          {/* Option 1: Authenticate - Purple */}
                          <button
                            style={{
                              width: '200px',
                              background: '#7c3aed',
                              color: 'white',
                              border: '2px solid #6d28d9',
                              borderRadius: '8px',
                              padding: '0.5rem 0.5rem',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                              textAlign: 'center',
                              lineHeight: '1.2'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#6d28d9';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#7c3aed';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.3)';
                            }}
                          >
                            Authenticate and Read<br/>Pitchfork Here
                          </button>

                          {/* Option 2: Digital Wallet - Green */}
                          <button
                            style={{
                              width: '200px',
                              background: '#16a34a',
                              color: 'white',
                              border: '2px solid #15803d',
                              borderRadius: '8px',
                              padding: '0.5rem 0.5rem',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                              textAlign: 'center',
                              lineHeight: '1.2'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#15803d';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#16a34a';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.3)';
                            }}
                          >
                            UnitedTribes Digital<br/>Wallet — <strong>25¢</strong>
                          </button>

                          {/* Option 3: Purchase - Blue */}
                          <button
                            style={{
                              width: '200px',
                              background: '#2563eb',
                              color: 'white',
                              border: '2px solid #1d4ed8',
                              borderRadius: '8px',
                              padding: '0.5rem 0.5rem',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                              textAlign: 'center',
                              lineHeight: '1.2'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#1d4ed8';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#2563eb';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
                            }}
                          >
                            Purchase from<br/>Pitchfork — <strong>25¢</strong>
                          </button>
                        </div>

                        {/* Article title if available - remove brackets */}
                        {selectedArticle.articleRef && (
                          <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#3b82f6',
                            marginBottom: '0.5rem',
                            lineHeight: '1.4'
                          }}>
                            {selectedArticle.articleRef.replace(/^\[|\]$/g, '')}
                          </h3>
                        )}

                        {/* Source name */}
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#000000',
                          marginBottom: '0.75rem'
                        }}>
                          Source: {selectedArticle.publication}
                        </h4>

                        {/* Context/excerpt */}
                        <div style={{
                          fontSize: '14px',
                          color: '#000000',
                          lineHeight: '1.6'
                        }}>
                          {selectedArticle.context}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Visualization View */
                    <>
                      <div style={{
                        flex: 1,
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#f9fafb'
                      }}>
                        <iframe
                          src={visualizationData.url}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                          title={`${visualizationData.artist} Network Visualization - Expanded`}
                        />
                      </div>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: 0,
                        textAlign: 'center'
                      }}>
                        Interactive network showing connections between {visualizationData.artist} and related artists
                      </p>
                    </>
                  )}
                </div>

                {/* Right Side - Search Interface */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  minWidth: '300px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '0.75rem'
                    }}>
                      UnitedAI Chat Explorer
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isAiSearching) {
                              e.preventDefault();
                              handleUnitedAISearch();
                            }
                          }}
                          placeholder="Ask about John Coltrane and Blue Train..."
                          disabled={isAiSearching}
                          style={{
                            width: '100%',
                            padding: '1rem',
                            paddingRight: aiQuery ? '3rem' : '1rem',
                            fontSize: '16px',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            opacity: isAiSearching ? 0.6 : 1
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                        {aiQuery && (
                          <button
                            onClick={() => {
                              setAiQuery('');
                              setAiResults(null);
                              setAiError(null);
                            }}
                            style={{
                              position: 'absolute',
                              right: '0.75rem',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: '#e5e7eb',
                              border: '2px solid #9ca3af',
                              color: '#1f2937',
                              fontSize: '24px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#d1d5db';
                              e.currentTarget.style.borderColor = '#6b7280';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#e5e7eb';
                              e.currentTarget.style.borderColor = '#9ca3af';
                            }}
                            title="Clear"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleUnitedAISearch}
                        disabled={isAiSearching || !aiQuery.trim()}
                        style={{
                          background: isAiSearching ? '#2563eb' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '1rem 1.5rem',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: isAiSearching || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background 0.2s',
                          animation: isAiSearching ? 'buttonPulse 1.5s ease-in-out infinite' : 'none'
                        }}
                      >
                        {isAiSearching ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>

                  {/* Results Area */}
                  <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    overflowY: 'auto',
                    position: 'relative'
                  }}>
                    {aiResults ? (
                      <>
                        <button
                          onClick={() => {
                            setAiResults(null);
                            setAiQuery('');
                            setAiError(null);
                            setAiMatchedVideos([]);
                          }}
                          style={{
                            position: 'absolute',
                            top: '0.75rem',
                            right: '0.75rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                          Clear Results
                        </button>
                        <div style={{ paddingTop: '2.5rem' }}>
                          {formatNarrative(aiResults.narrative)}

                          {/* Related Videos Section */}
                          {aiMatchedVideos.length > 0 && (
                            <div style={{
                              marginTop: '2rem',
                              paddingTop: '2rem',
                              borderTop: '2px solid #e5e7eb'
                            }}>
                              <h3 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#2563eb',
                                marginBottom: '1rem'
                              }}>
                                Related Analyzed Videos ({aiMatchedVideos.length})
                              </h3>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '1rem'
                              }}>
                                {aiMatchedVideos.map((video, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      console.log('🎬 Loading video from UnitedAI results:', video);
                                      setSelectedVideo(video);
                                      // Modal stays open, video replaces visualization on left side
                                    }}
                                    style={{
                                      cursor: 'pointer',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      border: '2px solid #e5e7eb',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = '#3b82f6';
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#e5e7eb';
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      style={{
                                        width: '100%',
                                        aspectRatio: '16/9',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <div style={{ padding: '0.75rem' }}>
                                      <p style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        margin: 0,
                                        lineHeight: '1.4',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                      }}>
                                        {video.title}
                                      </p>
                                      {video.channel && (
                                        <p style={{
                                          fontSize: '12px',
                                          color: '#6b7280',
                                          margin: '0.25rem 0 0 0'
                                        }}>
                                          {video.channel}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : aiError ? (
                      <p style={{ fontSize: '16px', color: '#ef4444', margin: 0, textAlign: 'center' }}>
                        Error: {aiError}
                      </p>
                    ) : (
                      <p style={{
                        fontSize: '18px',
                        color: '#6b7280',
                        textAlign: 'center',
                        margin: 0
                      }}>
                        {isAiSearching ? 'Searching UnitedAI...' : 'Enter a question and click Search'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })()}
      </div>
    );
  }

  // Regular single-panel layout for other books
  return (
    <div className="paginated-book-viewer">
      <style>{`
        /* Base responsive design */
        .paginated-book-viewer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
          position: relative;
          font-size: 16px;
        }
        
        @media (max-width: 1200px) {
          .paginated-book-viewer {
            padding: 1.5rem;
          }
        }
        
        @media (max-width: 768px) {
          .paginated-book-viewer {
            padding: 1rem;
          }
        }

        .book-header {
          position: sticky;
          top: 0;
          background: white;
          z-index: 50;
          padding: 1rem 0 1.5rem;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 2rem;
        }

        .book-navigation {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 3rem;
          flex-wrap: wrap;
        }
        
        .book-navigation .page-controls {
          flex: 0 0 auto;
        }
        
        .book-navigation .page-jump {
          margin-left: auto;
          margin-right: 15%;
        }

        .page-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.94rem 1.56rem;
          background: #1e3a8a;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 55px;
        }

        .nav-button:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 22.5px;
          font-weight: 600;
          color: #111827;
          padding: 0.75rem 1.25rem;
          background: #f3f4f6;
          border-radius: 6px;
          min-width: 175px;
          text-align: center;
        }

        .page-jump {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .page-jump input {
          width: 112px;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          text-align: center;
          min-height: 50px;
        }
        
        .page-jump input::placeholder {
          color: #64748b;
          font-weight: 600;
        }

        .page-jump input:focus {
          outline: none;
          border-color: #1e3a8a;
        }

        .jump-btn {
          padding: 0.75rem 1.25rem;
          background: #60a5fa;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 50px;
        }

        .jump-btn:hover {
          background: #3b82f6;
        }

        .chapter-context {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 8px;
          border: 1px solid #fbbf24;
          font-size: 22.5px;
          margin-top: 1rem;
        }

        .chapter-context strong {
          color: #7c2d12;
          font-weight: 700;
        }
        
        /* Entity highlighting styles */
        .entity-highlight {
          cursor: pointer;
          padding: 0.15rem 0.3rem;
          border-radius: 4px;
          transition: all 0.2s ease;
          position: relative;
          font-weight: 500;
          display: inline-block;
          margin: 0 0.1rem;
        }
        
        /* Musicians - Blue theme */
        .entity-musician {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%);
          color: #1e40af;
          border-bottom: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
        }
        
        .entity-musician:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.25);
        }
        
        /* Artists - Green theme */
        .entity-artist {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%);
          color: #047857;
          border-bottom: 2px solid #10b981;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
        }
        
        .entity-artist:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(16, 185, 129, 0.25);
        }
        
        /* Authors - Orange theme */
        .entity-author {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%);
          color: #92400e;
          border-bottom: 2px solid #f59e0b;
          box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
        }
        
        .entity-author:hover {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(245, 158, 11, 0.25);
        }
        
        /* Venues - Red theme */
        .entity-venue {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
          color: #991b1b;
          border-bottom: 2px solid #ef4444;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
        }
        
        .entity-venue:hover {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(220, 38, 38, 0.3) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.25);
        }
        
        /* Add a subtle glow animation on hover */
        @keyframes entityGlow {
          0% { box-shadow: 0 2px 4px rgba(var(--color-rgb), 0.2); }
          50% { box-shadow: 0 4px 12px rgba(var(--color-rgb), 0.4); }
          100% { box-shadow: 0 2px 4px rgba(var(--color-rgb), 0.2); }
        }
        
        /* Entity hover tooltip removed - clicking entities opens Search & Discover modal instead
        .entity-highlight:hover::after {
          content: attr(data-entity);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          white-space: nowrap;
          z-index: 1000;
          margin-bottom: 0.5rem;
          opacity: 0;
          animation: fadeIn 0.2s forwards;
          pointer-events: none;
        }
        */
        
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        
        /* Entity occurrences popup */
        .entity-popup {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          max-width: 600px;
          width: 90%;
          max-height: 70vh;
          overflow: hidden;
          z-index: 1000;
        }
        
        .entity-popup-header {
          padding: 1.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
        }
        
        .entity-popup-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        
        .entity-popup-meta {
          font-size: 1.05rem;
          opacity: 0.95;
        }
        
        .entity-popup-content {
          padding: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .entity-mention {
          padding: 1.2rem;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 10px;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
        }
        
        .entity-mention:hover {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          transform: translateX(6px);
          border-color: #8b5cf6;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }
        
        .entity-mention-page {
          font-weight: 700;
          color: #1e3a8a;
          margin-bottom: 0.4rem;
          font-size: 1.1rem;
        }
        
        .entity-mention-chapter {
          color: #6b7280;
          font-size: 0.95rem;
        }
        
        .entity-popup-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.2s;
        }
        
        .entity-popup-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
        
        .entity-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 999;
        }

        .page-content {
          background: white;
          padding: 2.5rem 3rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          min-height: 500px;
          font-size: 22px !important;
          line-height: 1.6;
          color: #1a1a1a;
          user-select: text;
          cursor: text;
          font-family: Georgia, 'Times New Roman', serif;
          max-width: 1020px;
          margin: 0 auto;
        }
        
        @media (max-width: 1200px) {
          .page-content {
            padding: 2rem 2.5rem;
            font-size: 21px !important;
          }
        }
        
        @media (max-width: 768px) {
          .page-content {
            padding: 1.5rem;
            font-size: 20px !important;
            max-width: 100%;
          }
        }
        
        .page-content ::selection {
          background-color: #6366f1;
          color: white;
        }
        
        .page-content ::-moz-selection {
          background-color: #6366f1;
          color: white;
        }

        .page-content p {
          margin-bottom: 1.4rem;
          text-align: left;
          text-indent: 2em;
          color: #1a1a1a;
          font-size: 22px !important;
          line-height: 1.6 !important;
        }
        
        .page-content p:first-of-type {
          text-indent: 0;
        }
        
        /* Only show drop cap on chapter start pages */
        .page-content.chapter-start p:first-of-type::first-letter {
          font-size: 3.6rem;
          font-weight: 700;
          float: left;
          line-height: 1;
          margin: 0.1rem 0.3rem 0 0;
          color: #1e3a8a;
          font-family: Georgia, serif;
        }

        .chapter-sidebar {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border: 2px solid #cbd5e1;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
          width: 280px;
          max-width: 280px;
        }

        .chapter-sidebar h3 {
          font-size: 1.3rem !important;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding-bottom: 0.8rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .chapter-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .chapter-list li {
          margin-bottom: 0.8rem;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .chapter-link {
          display: block;
          padding: 1rem 1.4rem;
          background: rgba(248, 250, 252, 0.5);
          border: 2px solid transparent;
          border-radius: 10px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 1.15rem !important;
          color: #334155;
          width: 100%;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }

        .chapter-link:hover {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
          color: white !important;
          transform: translateX(8px);
          border-color: #2563eb;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
        }
        
        .chapter-link:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2), transparent);
          animation: pulse 0.5s ease-out;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .chapter-link.active {
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
          color: white !important;
          font-weight: 600;
          border-color: #1d4ed8;
          transform: translateX(4px);
          box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
        }
        
        .chapter-link.active::after {
          content: '◀';
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1rem;
          opacity: 0.8;
        }

        .page-footer {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 3rem;
        }
        
        .page-footer .word-count {
          flex: 0 0 auto;
        }
        
        .page-footer .page-controls {
          margin-left: auto;
          margin-right: 15%;
        }

        .word-count {
          font-size: 1rem;
          color: #4b5563;
          font-style: italic;
        }
        

        @media (max-width: 1400px) {
          .chapter-sidebar {
            width: 240px;
            max-width: 240px;
            padding: 1.5rem;
          }
          
          .chapter-link {
            padding: 0.9rem 1.2rem;
            font-size: 1.05rem !important;
          }
        }
        
        @media (max-width: 1200px) {
          .chapter-sidebar {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .book-navigation {
            flex-direction: column;
            gap: 1rem;
          }

          .page-controls {
            width: 100%;
            justify-content: space-between;
          }

          .page-jump {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
          }

          .page-jump input {
            flex: 1;
          }

          .page-content {
            padding: 2rem 1.5rem;
            line-height: 1.65;
          }
          
          .page-content p {
            text-indent: 1.5rem;
            font-size: 20px !important;
          }
        }
      `}</style>

      {/* Navigation Buttons - positioned above chapters */}
      <div style={{
        position: 'fixed',
        top: '50px',
        left: '35px',
        display: 'flex',
        gap: '0.5rem',
        zIndex: 10
      }}>
        <Link href="/">
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1.125rem',
            fontWeight: '500',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#6d28d9';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#7c3aed';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
            <Home size={20} />
            <span>Media Hub</span>
          </button>
        </Link>

        <button
          onClick={() => {
            setCurrentPageIndex(0);
            window.scrollTo(0, 0);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1.125rem',
            fontWeight: '500',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
          <BookOpen size={20} />
          <span>Cover</span>
        </button>

        <button
          onClick={() => {
            setCurrentPageIndex(1);
            window.scrollTo(0, 0);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1.125rem',
            fontWeight: '500',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}>
          <Search size={20} />
          <span>Index</span>
        </button>
      </div>

      {/* Chapter Sidebar */}
      <div className="chapter-sidebar">
        <h3><BookOpen size={16} /> Chapters</h3>
        <ul className="chapter-list">
          {BOOK_STRUCTURE.map(chapter => (
            <li key={chapter.title}>
              <button
                className={`chapter-link ${currentPage?.chapterTitle === chapter.title ? 'active' : ''}`}
                onClick={() => goToChapter(chapter.title)}
              >
                {chapter.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Entity Occurrences Popup - Deprecated: Now using Search & Discover modal */}
      {/* Keeping this commented in case we need to reference the old implementation
      {selectedEntity && (
        <>
          <div className="entity-popup-overlay" onClick={() => setSelectedEntity(null)} />
          <div className="entity-popup">
            <div className="entity-popup-header">
              <button className="entity-popup-close" onClick={() => setSelectedEntity(null)}>×</button>
              <div className="entity-popup-title">{selectedEntity.name}</div>
              <div className="entity-popup-meta">
                {selectedEntity.culturalContext?.period || selectedEntity.type}
              </div>
            </div>
            <div className="entity-popup-content">
              {selectedEntity.culturalContext && (
                <div className="cultural-context">
                  <p className="significance">{selectedEntity.culturalContext.significance}</p>
                  <p className="discovery-value">🔍 {selectedEntity.culturalContext.discoveryValue}</p>
                  {selectedEntity.culturalContext.relatedWorks && (
                    <div className="related-works">
                      <strong>Key Works:</strong>
                      <div className="works-list">
                        {selectedEntity.culturalContext.relatedWorks.map((work: string, idx: number) => (
                          <span key={idx} className="work-tag">{work}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="occurrences-section">
                <h4>{selectedEntity.mentions.length} mentions in the book:</h4>
                {selectedEntity.mentions.map((mention, idx) => (
                  <div 
                    key={idx} 
                    className="entity-mention"
                    onClick={() => navigateToEntityMention(mention.page)}
                  >
                    <div className="entity-mention-page">Page {mention.page}</div>
                    <div className="entity-mention-chapter">{mention.chapter}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
      */}

      {/* Main Content */}
      <div className="book-content">
        <div className="book-header">
          <div className="book-navigation">
            <div className="page-controls">
              <button 
                className="nav-button"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
              >
                <ChevronLeft size={25} />
                Previous
              </button>
              
              <div className="page-info">
                Page {displayPageNumber} of {totalPages}
              </div>
              
              <button 
                className="nav-button"
                onClick={goToNextPage}
                disabled={currentPageIndex === pages.length - 1}
              >
                Next
                <ChevronRight size={25} />
              </button>
            </div>

            <div className="page-jump">
              <input
                type="text"
                placeholder="Page..."
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePageJump()}
              />
              <button className="jump-btn" onClick={handlePageJump}>
                Jump
              </button>
            </div>

          </div>
          
          {/* Yellow Bar Container - Positioned to align with Page input */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            marginTop: '1rem'
          }}>
            <div className="chapter-context" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 'calc(85% + 2rem)',
              marginRight: 'calc(15% - 2rem)',
              paddingRight: '2rem'
            }}>
              <div style={{ fontSize: '22.5px' }}>
                Currently reading: <strong>{currentPage?.chapterTitle}</strong>
              </div>
              
              {/* Search & Discover Button - Aligned with Page input */}
              <button 
                onClick={() => setShowSearch(true)}
                className="search-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.86rem 1.43rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  minHeight: '50px'
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
            >
              <Search size={21} />
              <span style={{ fontWeight: '800', letterSpacing: '0.025em', fontSize: '1.17rem' }}>Search & Discover</span>
            </button>
            </div>
          </div>
        </div>

        <div 
          ref={contentRef}
          className={`page-content ${isChapterStart(currentPage?.pageNumber) ? 'chapter-start' : ''}`}
        >
          {currentPage && (
            <>
              {currentPage.content.split('\n\n').map((paragraph, index) => (
                <p 
                  key={index}
                  dangerouslySetInnerHTML={{ 
                    __html: highlightEntitiesInText(paragraph) 
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('entity-highlight')) {
                      const entityType = target.getAttribute('data-type');
                      const entityName = target.getAttribute('data-entity');
                      
                      if (entityType === 'music-video') {
                        // Open video modal for John Coltrane
                        setShowVideoModal(true);
                      } else if (entityName) {
                        showEntityOccurrences(entityName);
                      }
                    }
                  }}
                />
              ))}
            </>
          )}
        </div>

        <div className="page-footer">
          <div className="word-count">
            {currentPage?.wordCount} words on this page
          </div>
          <div className="page-controls">
            <button 
              className="nav-button"
              onClick={goToPrevPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft size={20} />
              Previous Page
            </button>
            
            <button 
              className="nav-button"
              onClick={goToNextPage}
              disabled={currentPageIndex === pages.length - 1}
            >
              Next Page
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Text Selection Modal */}
      {showSelectionModal && (
        <TextSelectionModal
          selectedText={selectedText}
          onClose={handleCloseSelectionModal}
          onSearch={(searchText) => {
            setInitialSearchTerm(searchText);
            setShowSearch(true);
            handleCloseSelectionModal();
          }}
        />
      )}

      {/* Book Search Modal */}
      <BookSearch
        fullText={fullTranscript}
        pages={pages}
        onNavigate={handleSearchNavigate}
        isOpen={showSearch}
        onClose={() => {
          setShowSearch(false);
          setInitialSearchTerm(''); // Reset initial search term
        }}
        initialSearchTerm={initialSearchTerm}
      />

      {/* Video Modal - John Coltrane Test */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="John Coltrane - A Love Supreme"
        videoId="QUAhvJW3ZD4"
        context="John Coltrane's spiritual jazz masterpiece that influenced a generation of artists including Patti Smith."
      />

      {/* Discovery Playlist - Shows when items are added */}
      <DiscoveryPlaylist
        items={discoveryItems}
        onPlayItem={handlePlayDiscoveryItem}
        onRemoveItem={handleRemoveFromDiscoveryPlaylist}
        onClearPlaylist={handleClearDiscoveryPlaylist}
      />

      {/* Visualization Modal */}
      {(() => {
        console.log('🎬 Rendering modal section, showVisualizationModal:', showVisualizationModal);
        return null;
      })()}
      {showVisualizationModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}
          onClick={() => setShowVisualizationModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '95%',
              maxWidth: '1400px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f9fafb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0
              }}>
                John Coltrane Network Visualization
              </h2>
              <button
                onClick={() => setShowVisualizationModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '32px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  lineHeight: 1,
                  fontWeight: '300'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              gap: '1.5rem',
              padding: '1.5rem',
              overflow: 'hidden'
            }}>
              {/* Left Side - Visualization */}
              <div style={{
                flex: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minWidth: 0
              }}>
                <div style={{
                  flex: 1,
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#f9fafb'
                }}>
                  <iframe
                    src="http://unitedtribes-visualizations-1758769416.s3-website-us-east-1.amazonaws.com/john-coltrane-network.html"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title="John Coltrane Network Visualization - Expanded"
                  />
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0,
                  textAlign: 'center'
                }}>
                  Interactive network showing connections between John Coltrane and related artists
                </p>
              </div>

              {/* Right Side - Search Interface */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minWidth: '300px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '0.75rem'
                  }}>
                    UnitedAI Chat Explorer
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isAiSearching) {
                            e.preventDefault();
                            handleUnitedAISearch();
                          }
                        }}
                        placeholder="Ask about John Coltrane and Blue Train..."
                        disabled={isAiSearching}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          paddingRight: aiQuery ? '3rem' : '1rem',
                          fontSize: '16px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                          opacity: isAiSearching ? 0.6 : 1
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                      {aiQuery && (
                        <button
                          onClick={() => {
                            setAiQuery('');
                            setAiResults(null);
                            setAiError(null);
                          }}
                          style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#e5e7eb',
                            border: '2px solid #9ca3af',
                            color: '#1f2937',
                            fontSize: '24px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1,
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#d1d5db';
                            e.currentTarget.style.borderColor = '#6b7280';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                            e.currentTarget.style.borderColor = '#9ca3af';
                          }}
                          title="Clear"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleUnitedAISearch}
                      disabled={isAiSearching || !aiQuery.trim()}
                      style={{
                        background: isAiSearching ? '#2563eb' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '1rem 1.5rem',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isAiSearching || !aiQuery.trim() ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s',
                        animation: isAiSearching ? 'buttonPulse 1.5s ease-in-out infinite' : 'none'
                      }}
                    >
                      {isAiSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Results Area */}
                <div style={{
                  flex: 1,
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb',
                  overflowY: 'auto',
                  position: 'relative'
                }}>
                  {aiResults ? (
                    <>
                      <button
                        onClick={() => {
                          setAiResults(null);
                          setAiQuery('');
                          setAiError(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                      >
                        Clear Results
                      </button>
                      <div style={{ paddingTop: '2.5rem' }}>
                        {formatNarrative(aiResults.narrative)}
                      </div>
                    </>
                  ) : aiError ? (
                    <p style={{ fontSize: '16px', color: '#ef4444', margin: 0, textAlign: 'center' }}>
                      Error: {aiError}
                    </p>
                  ) : (
                    <p style={{
                      fontSize: '18px',
                      color: '#6b7280',
                      textAlign: 'center',
                      margin: 0
                    }}>
                      {isAiSearching ? 'Searching UnitedAI...' : 'Enter a question and click Search'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};