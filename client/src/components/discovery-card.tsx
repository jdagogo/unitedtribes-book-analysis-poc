import React, { useState, useEffect } from 'react';
import { X, Sparkles, Music, Film, Book, MapPin, Calendar, ExternalLink, ChevronRight, Loader2, Instagram, Frame, Youtube, FileText } from 'lucide-react';
import { ArticleScreenshotModal } from './article-screenshot-modal';

interface DiscoveryCardProps {
  selectedText: string;
  userContext?: string;
  onClose: () => void;
}

interface DiscoveryContent {
  title: string;
  summary: string;
  culturalContext?: string;
  timeline?: {
    year: string;
    context: string;
  };
  relatedMedia?: {
    type: 'music' | 'film' | 'book' | 'venue' | 'instagram' | 'artwork' | 'youtube' | 'article';
    title: string;
    creator?: string;
    year?: string;
    link?: string;
    embedId?: string;
    imageUrl?: string;
    description?: string;
    museum?: string;
    exhibition?: string;
    publication?: string;
  }[];
  connections?: {
    name: string;
    relationship: string;
    significance?: string;
  }[];
  quotes?: {
    text: string;
    source: string;
  }[];
  videoEmbeds?: {
    title: string;
    embedId: string;
    platform: 'youtube' | 'vimeo';
  }[];
}

export const DiscoveryCard: React.FC<DiscoveryCardProps> = ({
  selectedText,
  userContext,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [discoveryContent, setDiscoveryContent] = useState<DiscoveryContent | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'connections'>('media');
  const [articleViewerData, setArticleViewerData] = useState<{ url: string; title: string; screenshot?: string; price?: number } | null>(null);

  // Video search state
  const [searchQuery, setSearchQuery] = useState(selectedText);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [videoEmbedHtml, setVideoEmbedHtml] = useState<string>('');
  const [showPlaylistView, setShowPlaylistView] = useState(false);
  const [videoPlaylistData, setVideoPlaylistData] = useState<any>(null);
  const [savedVideoEmbedHtml, setSavedVideoEmbedHtml] = useState<string>('');
  const [currentPlaylist, setCurrentPlaylist] = useState<any[]>([]);
  const [addedWorksModal, setAddedWorksModal] = useState<Set<string>>(new Set());
  const [addedPlaylistsByName, setAddedPlaylistsByName] = useState<Map<string, Set<string>>>(new Map());
  const [showPlaylistPlayer, setShowPlaylistPlayer] = useState(false);
  const [loadingPlaylistVideos, setLoadingPlaylistVideos] = useState(false);
  const [playlistVideos, setPlaylistVideos] = useState<any[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const videoIframeRef = React.useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    fetchDiscoveryContent();
  }, []);

  // Listen for messages from iframe to trigger playlist modal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Message received:', event.data, 'from origin:', event.origin);

      // Check if event.data is an object with a type property
      if (event.data && typeof event.data === 'object' && event.data.type === 'SHOW_PLAYLIST_DATA' && selectedVideo?.id) {
        console.log('🎵 Received SHOW_PLAYLIST_DATA message from iframe');
        if (videoEmbedHtml) {
          setSavedVideoEmbedHtml(videoEmbedHtml);
          setVideoEmbedHtml('');
        }
        fetchPlaylistData(selectedVideo.id);
      } else if (event.data && typeof event.data === 'object' && event.data.type === 'CLOSE_PLAYLIST_DATA') {
        console.log('🎵 Received CLOSE_PLAYLIST_DATA message from iframe');
        setShowPlaylistView(false);
        if (savedVideoEmbedHtml) {
          setVideoEmbedHtml(savedVideoEmbedHtml);
          setSavedVideoEmbedHtml('');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedVideo, videoEmbedHtml, savedVideoEmbedHtml]);

  const fetchDiscoveryContent = async () => {
    setIsLoading(true);
    
    try {
      // Use the SMART endpoint that actually analyzes the text
      const response = await fetch('/api/discovery/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText,
          userContext
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discovery content');
      }

      const data = await response.json();
      
      if (data.success && data.discovery) {
        // Add video matches to the discovery content
        const enrichedContent = {
          ...data.discovery,
          videoMatches: data.discovery.videoMatches || [],
          sources: data.sources || {}
        };
        setDiscoveryContent(enrichedContent);
      } else {
        // Fallback content if API doesn't return expected format
        setDiscoveryContent({
          title: "Cultural Discovery",
          summary: `Exploring: "${selectedText}"`,
          culturalContext: userContext ? 
            `You asked about: ${userContext}. This text appears in <i>Just Kids</i> by Patti Smith.` :
            'This passage appears in <i>Just Kids</i>, exploring the 1960s-70s New York art scene.',
          timeline: {
            year: "1967-1975",
            context: "The period covered in Just Kids"
          },
          relatedMedia: [],
          connections: [],
          quotes: []
        });
      }
    } catch (error) {
      console.error('Error fetching discovery content:', error);
      // Use fallback content on error
      setDiscoveryContent({
        title: "Discovery",
        summary: `Selected text: "${selectedText.substring(0, 100)}..."`,
        culturalContext: "Unable to load full context. Please try again.",
        relatedMedia: [],
        connections: [],
        quotes: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'music': return <Music size={16} />;
      case 'film': return <Film size={16} />;
      case 'book': return <Book size={16} />;
      case 'venue': return <MapPin size={16} />;
      case 'instagram': return <Instagram size={16} />;
      case 'artwork': return <Frame size={16} />;
      case 'youtube': return <Youtube size={16} />;
      case 'article': return <FileText size={16} />;
      default: return null;
    }
  };

  // Embed video player
  const embedVideo = async (video: any) => {
    setSearchLoading(true);
    setSearchError(null);

    try {
      console.log('🎬 Video object:', video);
      console.log(`🎬 Embedding video ID: ${video.id}`);

      // Fetch the embed HTML from our local endpoint
      const response = await fetch(
        `/api/videos/${video.id}/embed-html`
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // The API returns HTML directly as text, not JSON
      const htmlContent = await response.text();
      console.log('📺 Received HTML length:', htmlContent.length);

      if (htmlContent) {
        setVideoEmbedHtml(htmlContent);
        setSelectedVideo(video);
        console.log('✅ Video embedded successfully');
      } else {
        throw new Error('No embed HTML received');
      }
    } catch (error) {
      console.error('❌ Error embedding video:', error);
      setSearchError(`Failed to load video player: ${error.message}`);
    } finally {
      setSearchLoading(false);
    }
  };

  // Playlist management functions
  const getItemKey = (item: any): string => {
    return JSON.stringify({ title: item.title, artist: item.artist });
  };

  const addToPlaylist = (track: any) => {
    setCurrentPlaylist(prev => [...prev, track]);
  };

  const clearPlaylist = () => {
    setCurrentPlaylist([]);
  };

  const toggleIndividualSong = (item: any) => {
    const itemKey = getItemKey(item);
    const isInPlaylist = currentPlaylist.some(playlistItem => getItemKey(playlistItem) === itemKey);

    if (isInPlaylist) {
      setCurrentPlaylist(prev => prev.filter(playlistItem => getItemKey(playlistItem) !== itemKey));
    } else {
      addToPlaylist(item);
    }
  };

  const toggleAllWorks = () => {
    if (!videoPlaylistData?.works) return;

    const allWorksAdded = videoPlaylistData.works.every((work: any) =>
      addedWorksModal.has(getItemKey(work))
    );

    if (allWorksAdded) {
      const newSet = new Set(addedWorksModal);
      videoPlaylistData.works.forEach((work: any) => {
        const key = getItemKey(work);
        if (newSet.has(key)) {
          newSet.delete(key);
          setCurrentPlaylist(prev => prev.filter(item => getItemKey(item) !== key));
        }
      });
      setAddedWorksModal(newSet);
    } else {
      const newSet = new Set(addedWorksModal);
      videoPlaylistData.works.forEach((work: any) => {
        const key = getItemKey(work);
        if (!newSet.has(key)) {
          newSet.add(key);
          addToPlaylist(work);
        }
      });
      setAddedWorksModal(newSet);
    }
  };

  const toggleAllPlaylistTracks = (playlistName: string, tracks: any[]) => {
    if (!tracks || tracks.length === 0) return;

    const currentPlaylistTracks = addedPlaylistsByName.get(playlistName) || new Set();
    const allTracksAdded = tracks.every((track: any) =>
      currentPlaylistTracks.has(getItemKey(track))
    );

    if (allTracksAdded) {
      const newPlaylistMap = new Map(addedPlaylistsByName);
      const newTrackSet = new Set(currentPlaylistTracks);

      tracks.forEach((track: any) => {
        const key = getItemKey(track);
        if (newTrackSet.has(key)) {
          newTrackSet.delete(key);
          setCurrentPlaylist(prev => prev.filter(item => getItemKey(item) !== key));
        }
      });

      newPlaylistMap.set(playlistName, newTrackSet);
      setAddedPlaylistsByName(newPlaylistMap);
    } else {
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

  const areAllWorksAdded = (): boolean => {
    if (!videoPlaylistData?.works) return false;
    return videoPlaylistData.works.every((work: any) =>
      addedWorksModal.has(getItemKey(work))
    );
  };

  const areAllPlaylistTracksAdded = (playlistName: string, tracks: any[]): boolean => {
    if (!tracks || tracks.length === 0) return false;
    const currentPlaylistTracks = addedPlaylistsByName.get(playlistName) || new Set();
    return tracks.every((track: any) =>
      currentPlaylistTracks.has(getItemKey(track))
    );
  };

  const fetchPlaylistData = async (videoId: string) => {
    try {
      console.log(`🎵 Fetching playlist data for: ${videoId}`);

      const response = await fetch(`/api/youtube/videos/${videoId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const playlists = (data.metadata?.playlists || []).map((playlist: any) => ({
        ...playlist,
        tracks: playlist.tracks || playlist.songs || []
      }));

      const playlistData = {
        works: data.metadata?.works || [],
        playlists: playlists,
        analysis: data.analysis || null
      };

      setVideoPlaylistData(playlistData);
      setShowPlaylistView(true);
    } catch (error) {
      console.error('Error fetching playlist data:', error);
      setSearchError(`Failed to load playlist data: ${error.message}`);
    }
  };

  const playPlaylist = async () => {
    if (currentPlaylist.length === 0) return;

    const currentHtml = videoEmbedHtml;
    setSavedVideoEmbedHtml(currentHtml);
    setVideoEmbedHtml('');

    setTimeout(() => {
      setVideoEmbedHtml(currentHtml);
    }, 100);

    setLoadingPlaylistVideos(true);
    setShowPlaylistPlayer(true);
    setCurrentTrackIndex(0);

    const videosPromises = currentPlaylist.map(async (track) => {
      try {
        const response = await fetch(
          `/api/youtube/search-track?song=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`
        );
        const data = await response.json();

        if (data.videoId) {
          return {
            ...track,
            videoId: data.videoId,
            videoTitle: data.title || track.title,
            channelTitle: data.channel || track.artist,
            thumbnail: `https://img.youtube.com/vi/${data.videoId}/hqdefault.jpg`
          };
        }
      } catch (error) {
        console.error(`Failed to find video for ${track.title}:`, error);
      }

      return {
        ...track,
        videoId: null,
        videoTitle: `${track.title} - ${track.artist}`
      };
    });

    const videos = await Promise.all(videosPromises);
    setPlaylistVideos(videos);
    setLoadingPlaylistVideos(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] transition-all duration-300 ${
          isVisible ? 'bg-black/50 backdrop-blur-md' : 'bg-black/0'
        }`}
        onClick={handleClose}
      />
      
      {/* Discovery Card */}
      <div 
        className={`fixed z-[70] transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-[1200px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-8 pt-4 pb-6">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg">
                <Sparkles size={24} className="drop-shadow-lg" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight drop-shadow-lg">
                Discover
              </h3>
            </div>

            {userContext && (
              <p className="text-white/90 text-[19px] mt-3 font-medium pl-16">
                Your question: "{userContext}"
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={40} />
                <p className="text-indigo-600 text-lg font-medium">Discovering connections...</p>
              </div>
            </div>
          )}

          {/* Content */}
          {!isLoading && discoveryContent && (
            <>
              {/* Tabs as Pills */}
              <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-7 py-3.5 rounded-full text-[18px] font-semibold transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'overview' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    📖 Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-7 py-3.5 rounded-full text-[18px] font-semibold transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'media' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    🎬 Related Media
                  </button>
                  <button
                    onClick={() => setActiveTab('connections')}
                    className={`px-7 py-3.5 rounded-full text-[18px] font-semibold transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'connections'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    🎬 UnitedTribes Video Search
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-8 py-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedText.charAt(0).toUpperCase() + selectedText.slice(1)} discover
                      </h4>
                      {discoveryContent.timeline && (
                        <div className="flex items-center gap-2 text-base text-indigo-600 mb-4">
                          <Calendar size={14} />
                          <span>{discoveryContent.timeline.year}</span>
                          <span className="text-indigo-400">•</span>
                          <span>{discoveryContent.timeline.context}</span>
                        </div>
                      )}
                      <p className="text-gray-800 text-lg leading-relaxed">
                        This passage "{selectedText}..." captures a moment in <i>Just Kids</i> that deserves deeper analysis.
                      </p>
                    </div>

                    {discoveryContent.culturalContext && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                        <h5 className="font-semibold text-indigo-900 text-xl mb-2">Cultural Context</h5>
                        <p className="text-gray-800 text-lg leading-relaxed">
                          {discoveryContent.culturalContext}
                        </p>
                      </div>
                    )}

                    {discoveryContent.quotes && discoveryContent.quotes.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-indigo-900 text-xl mb-3">Notable Quotes</h5>
                        {discoveryContent.quotes.map((quote, index) => (
                          <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-2 mb-3">
                            <p className="text-gray-800 text-lg italic mb-1">"{quote.text}"</p>
                            <cite className="text-base text-indigo-600">— {quote.source}</cite>
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Media Tab */}
                {activeTab === 'media' && (
                  <div className="space-y-4">
                    {discoveryContent.relatedMedia?.map((media, index) => (
                      <div key={index}>
                        {/* Special handling for Instagram embeds */}
                        {media.type === 'instagram' && media.embedId ? (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-purple-600">
                                  {getMediaIcon(media.type)}
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-900 text-lg">{media.title}</h6>
                                  {media.creator && (
                                    <p className="text-base text-purple-700">{media.creator}</p>
                                  )}
                                  {media.year && (
                                    <p className="text-sm text-purple-600 mt-1">{media.year}</p>
                                  )}
                                </div>
                              </div>
                              {media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-700 p-2"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                            {/* Instagram Embed */}
                            <div className="bg-white rounded-lg overflow-hidden shadow-md">
                              <iframe
                                src={`https://www.instagram.com/p/${media.embedId}/embed`}
                                className="w-full"
                                height="500"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency={true}
                                allow="encrypted-media"
                              ></iframe>
                            </div>
                          </div>
                        ) : media.type === 'artwork' && media.imageUrl ? (
                          /* Special handling for artwork with embedded images */
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-300 shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-amber-700">
                                  {getMediaIcon(media.type)}
                                </div>
                                <div>
                                  <h6 className="font-bold text-gray-900 text-xl">{media.title}</h6>
                                  <p className="text-base text-amber-800 font-semibold">{media.creator}, {media.year}</p>
                                  {media.museum && (
                                    <p className="text-sm text-amber-700 mt-1">{media.museum}</p>
                                  )}
                                  {media.exhibition && (
                                    <p className="text-xs text-amber-600 italic">{media.exhibition}</p>
                                  )}
                                </div>
                              </div>
                              {media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-700 hover:text-amber-800 p-2 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1"
                                  title="View in Art Gallery NSW collection"
                                >
                                  <ExternalLink size={16} />
                                  <span className="text-xs font-medium">View in Gallery</span>
                                </a>
                              )}
                            </div>

                            {/* Artwork Image */}
                            <div className="bg-white rounded-lg overflow-hidden shadow-xl mb-4 border-2 border-amber-300">
                              <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 p-2">
                                <img
                                  src={media.imageUrl}
                                  alt={media.title}
                                  className="w-full h-auto rounded-md"
                                  style={{
                                    maxHeight: '600px',
                                    objectFit: 'contain',
                                    backgroundColor: '#fdfaf7'
                                  }}
                                  loading="eager"
                                  onError={(e) => {
                                    console.error('Failed to load image:', media.imageUrl);
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCI+SW1hZ2UgTG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=';
                                  }}
                                />
                              </div>
                            </div>

                            {/* Artwork Description */}
                            {media.description && (
                              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200">
                                <div className="text-gray-800 text-base leading-relaxed">
                                  {media.description.split('\n').map((line, idx) => {
                                    // Parse for bold text (text between **)
                                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                                    return (
                                      <p key={idx} className={idx === 0 ? "italic" : "mt-3"}>
                                        {parts.map((part, partIdx) => {
                                          if (part.startsWith('**') && part.endsWith('**')) {
                                            const boldText = part.slice(2, -2);
                                            // Check if this is a clickable article title
                                            if ((boldText === 'Forty Years of Rolling Stone: Patti Smith' ||
                                                 boldText === 'Edie Sedgwick Is the Poster Girl for the No-Pants Look' ||
                                                 boldText === 'Patti Smith Announces 50th Anniversary Horses Tour') && media.link) {
                                              // Use media.screenshot if available, otherwise use hardcoded paths
                                              const screenshotPath = media.screenshot || (
                                                boldText.includes('Rolling Stone')
                                                  ? '/article-screenshots/rolling-stone-patti-smith.png'
                                                  : boldText.includes('Vogue')
                                                    ? '/article-screenshots/vogue-edie-sedgwick.png'
                                                    : '/article-screenshots/pitchfork-horses-50th.png'
                                              );
                                              return (
                                                <button
                                                  key={partIdx}
                                                  onClick={() => setArticleViewerData({
                                                    url: media.link!,
                                                    title: boldText,
                                                    screenshot: screenshotPath,
                                                    price: media.price || 0.25
                                                  })}
                                                  className="font-bold text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                                                >
                                                  {boldText}
                                                </button>
                                              );
                                            }
                                            return <strong key={partIdx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                                          }
                                          return <span key={partIdx}>{part}</span>;
                                        })}
                                      </p>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : media.type === 'youtube' && (media.embedId || media.embedUrl) ? (
                          /* YouTube video embed - elegantly constrained */
                          <div className="bg-gradient-to-r from-red-50 to-gray-50 rounded-xl p-4 border border-red-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-red-600">
                                  {getMediaIcon(media.type)}
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-900 text-lg">{media.title}</h6>
                                  {media.creator && (
                                    <p className="text-base text-red-700">{media.creator}</p>
                                  )}
                                  {media.year && (
                                    <p className="text-sm text-red-600 mt-1">{media.year}</p>
                                  )}
                                </div>
                              </div>
                              {/* HBO Logo for HBO content */}
                              {media.imageUrl && media.creator?.includes('HBO') ? (
                                <img
                                  src={media.imageUrl}
                                  alt="HBO"
                                  className="h-16 object-contain"
                                />
                              ) : media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-red-600 hover:text-red-700 p-2"
                                  title="Watch on YouTube"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>

                            {/* YouTube Embed - constrained size */}
                            <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                              <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                                <iframe
                                  src={media.embedUrl || `https://www.youtube.com/embed/${media.embedId}?rel=0&modestbranding=1`}
                                  className="absolute top-0 left-0 w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={media.title}
                                ></iframe>
                              </div>
                            </div>

                            {/* Video Description */}
                            {media.description && (
                              <div className="mt-3 text-sm text-gray-700 italic">
                                {media.description}
                              </div>
                            )}

                            {/* HBO Monetization Buttons */}
                            {media.creator?.includes('HBO') && (
                              <div className="mt-4 flex gap-4 justify-center">
                                {/* Watch on HBO Max */}
                                <div className="inline-flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                  <a
                                    href={media.link || 'https://www.max.com'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Watch on HBO Max
                                  </a>
                                  <p className="text-xs text-gray-600">
                                    Stream with subscription
                                  </p>
                                </div>

                                {/* Purchase Episode */}
                                <div className="inline-flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                  <button
                                    onClick={() => {
                                      alert('Demo: This would process a $1.00 micropayment to purchase the documentary via Lightning Network or similar instant payment system');
                                    }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    Purchase Documentary
                                  </button>
                                  <div className="text-center">
                                    <p className="text-sm font-semibold text-blue-900">
                                      Only $1.00
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Instant micropayment via digital wallet
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : media.type === 'tiktok' && media.embedUrl ? (
                          /* TikTok embed */
                          <div className="bg-gradient-to-r from-black to-gray-900 rounded-xl p-4 border border-gray-700">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-black">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.08 2.65 1.62 4.18 1.65v4.16c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                  </svg>
                                </div>
                                <div>
                                  <h6 className="font-semibold text-white text-lg">{media.title}</h6>
                                  {media.creator && (
                                    <p className="text-base text-gray-300">{media.creator}</p>
                                  )}
                                  {media.year && (
                                    <p className="text-sm text-gray-400 mt-1">{media.year}</p>
                                  )}
                                </div>
                              </div>
                              {media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white hover:text-gray-300 p-2"
                                  title="View on TikTok"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>

                            {/* TikTok Embed */}
                            <div className="bg-black rounded-lg overflow-hidden shadow-lg">
                              <div className="relative" style={{ paddingBottom: '177.77%', height: 0 }}>
                                <iframe
                                  src={media.embedUrl}
                                  className="absolute top-0 left-0 w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={media.title}
                                ></iframe>
                              </div>
                            </div>

                            {/* Description */}
                            {media.description && (
                              <div className="mt-3 text-sm text-gray-300 italic">
                                {media.description}
                              </div>
                            )}
                          </div>
                        ) : media.type === 'article' && media.imageUrl ? (
                          /* Article with image - Patti's Substack */
                          <div className="bg-gradient-to-r from-slate-50 to-zinc-50 rounded-xl p-4 border border-slate-300">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-slate-700">
                                  {getMediaIcon(media.type)}
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-900 text-lg">
                                    {media.title.includes('**') ? (
                                      media.title.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          return <span key={idx}>{part.slice(2, -2)}</span>;
                                        }
                                        return <span key={idx}>{part}</span>;
                                      })
                                    ) : (
                                      media.title
                                    )}
                                  </h6>
                                  {media.creator && (
                                    <p className="text-base text-slate-700">{media.creator}</p>
                                  )}
                                  {media.publication && (
                                    <p className="text-sm text-slate-600 italic">{media.publication}</p>
                                  )}
                                </div>
                              </div>
                              {media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-600 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Read on Substack"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>

                            {/* Article Image - constrained height */}
                            <div className="bg-white rounded-lg overflow-hidden shadow-md mb-3">
                              <img
                                src={media.imageUrl}
                                alt={media.title}
                                className="w-full h-auto"
                                style={{ maxHeight: '300px', objectFit: 'cover' }}
                                loading="lazy"
                              />
                            </div>

                            {/* Article Description */}
                            {media.description && (
                              <div className="text-sm text-slate-700 leading-relaxed">
                                {media.description.split('\n').map((line, idx) => {
                                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                                  return (
                                    <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                                      {parts.map((part, partIdx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          return <strong key={partIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
                                        }
                                        return <span key={partIdx} className={idx === 0 && partIdx === 0 ? "" : idx > 2 ? "italic" : ""}>{part}</span>;
                                      })}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : media.type === 'article' && media.screenshot ? (
                          /* Article with screenshot - clickable title for modal */
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-200 rounded-lg text-purple-700">
                                  {getMediaIcon(media.type)}
                                </div>
                                <div>
                                  {media.title.includes('**') ? (
                                    <h6 className="mb-2">
                                      {media.title.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          const boldText = part.slice(2, -2);
                                          return (
                                            <button
                                              key={idx}
                                              onClick={() => setArticleViewerData({
                                                url: media.link!,
                                                title: boldText,
                                                screenshot: media.screenshot,
                                                price: media.price || 0.25
                                              })}
                                              className="font-extrabold text-xl text-purple-900 hover:text-purple-700 hover:underline decoration-2 underline-offset-2 transition-all hover:bg-purple-200 px-1 py-0.5 rounded leading-snug"
                                            >
                                              {boldText}
                                            </button>
                                          );
                                        }
                                        return <span key={idx} className="text-xl font-extrabold text-gray-900">{part}</span>;
                                      })}
                                    </h6>
                                  ) : (
                                    <h6 className="font-extrabold text-gray-900 text-xl mb-2 leading-snug">{media.title}</h6>
                                  )}
                                  {media.creator && (
                                    <p className="text-base font-semibold text-purple-800">{media.creator}</p>
                                  )}
                                  {media.year && (
                                    <p className="text-sm text-purple-700 mt-1">{media.year}</p>
                                  )}
                                </div>
                              </div>
                              {media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800 p-3 hover:bg-purple-200 rounded-lg transition-all"
                                >
                                  <ExternalLink size={24} />
                                </a>
                              )}
                            </div>
                            {media.description && (
                              <div className="mt-4 text-lg text-gray-800 bg-white/80 p-4 rounded-lg font-medium">
                                {media.description}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Regular media items */
                          <div className="bg-indigo-50 rounded-xl p-4 hover:bg-indigo-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg text-indigo-600">
                                  {getMediaIcon(media.type)}
                                </div>
                                <div>
                                  <h6 className="font-semibold text-gray-900 text-lg">{media.title}</h6>
                                  {media.creator && (
                                    <p className="text-base text-indigo-700">{media.creator}</p>
                                  )}
                                  {media.year && (
                                    <p className="text-sm text-indigo-600 mt-1">{media.year}</p>
                                  )}
                                </div>
                              </div>
                              {media.link && (
                                <a
                                  href={media.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-700 p-2"
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {discoveryContent.videoEmbeds && discoveryContent.videoEmbeds.length > 0 && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-indigo-900 text-xl mb-3">Related Videos</h5>
                        {discoveryContent.videoEmbeds.map((video, index) => (
                          <div key={index} className="bg-black rounded-xl overflow-hidden mb-4">
                            <div className="aspect-video">
                              {/* Replace with actual embed */}
                              <div className="w-full h-full flex items-center justify-center bg-indigo-900 text-white">
                                Video: {video.title}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* UnitedTribes Video Search Tab */}
                {activeTab === 'connections' && (
                  <div>
                    {videoEmbedHtml && selectedVideo ? (
                      /* Video Player View */
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => {
                          setVideoEmbedHtml('');
                          setSelectedVideo(null);
                        }} style={{
                          position: 'absolute',
                          top: '2px',
                          left: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          background: '#3b82f6',
                          border: '1px solid #2563eb',
                          borderRadius: '3px',
                          padding: '3px 5px',
                          cursor: 'pointer',
                          fontSize: '9px',
                          fontWeight: '700',
                          color: 'white',
                          transition: 'all 0.2s',
                          zIndex: 10,
                          lineHeight: '1'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#3b82f6'; }}>
                          ← Back
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <iframe
                            ref={videoIframeRef}
                            srcDoc={videoEmbedHtml}
                            style={{
                              width: '80%',
                              height: '650px',
                              border: 'none'
                            }}
                            title={selectedVideo.title}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    ) : (
                      /* Search View */
                      <div>
                        {/* Search Form */}
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (searchQuery.trim()) {
                            setSearchLoading(true);
                            setSearchError(null);
                            fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`)
                              .then(res => res.json())
                              .then(data => {
                                setSearchResults(data.results || []);
                                setSearchLoading(false);
                              })
                              .catch(err => {
                                setSearchError('Failed to search videos');
                                setSearchLoading(false);
                              });
                          }
                        }} style={{ marginBottom: '1.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search UnitedTribes videos..."
                                style={{
                                  width: '100%',
                                  padding: '0.75rem',
                                  paddingRight: searchQuery ? '3rem' : '0.75rem',
                                  fontSize: '20px',
                                  fontWeight: '600',
                                  border: '2px solid #3b82f6',
                                  borderRadius: '8px',
                                  outline: 'none',
                                  color: '#1e40af',
                                  transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#2563eb';
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              {searchQuery && (
                                <button
                                  onClick={() => setSearchQuery('')}
                                  style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: '#3b82f6',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.2s'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                  type="button"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <button
                              type="submit"
                              disabled={searchLoading || !searchQuery.trim()}
                              style={{
                                padding: '0.75rem 1.5rem',
                                background: searchLoading ? '#9ca3af' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: searchLoading || !searchQuery.trim() ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {searchLoading ? 'Searching...' : 'Search'}
                            </button>
                          </div>
                        </form>

                        {/* Search Error */}
                        {searchError && (
                          <div style={{
                            padding: '1rem',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            color: '#991b1b',
                            marginBottom: '1rem'
                          }}>
                            {searchError}
                          </div>
                        )}

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            {searchResults.map((video: any, idx: number) => (
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
                                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
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
                                  <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.4', color: '#1e40af' }}>
                                    {video.title}
                                  </p>
                                  <p style={{ fontSize: '16px', color: '#1f2937', fontWeight: '600' }}>
                                    {video.channel} • {video.duration}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-indigo-50 border-t border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium text-blue-600">
                    Selected: "{selectedText.substring(0, 50)}..."
                  </div>
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    Close
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Article Screenshot Modal - Proof of Concept */}
      {articleViewerData && (
        <ArticleScreenshotModal
          screenshotUrl={articleViewerData.screenshot || '/article-screenshots/rolling-stone-patti-smith.png'}
          articleUrl={articleViewerData.url}
          title={articleViewerData.title}
          price={articleViewerData.price}
          onClose={() => setArticleViewerData(null)}
        />
      )}

      {/* Playlist Modal */}
      {showPlaylistView && videoPlaylistData && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onClick={() => {
            setShowPlaylistView(false);
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
                    <button onClick={() => toggleAllWorks()} style={{
                      background: areAllWorksAdded() ? '#ef4444' : '#3b82f6',
                      color: 'white', border: 'none', borderRadius: '6px',
                      padding: '0.5rem 1rem', cursor: 'pointer',
                      fontSize: '16px', fontWeight: '600'
                    }}>
                      {areAllWorksAdded() ? '- Remove All' : '+ Add All'}
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

      {/* Playlist Player Modal */}
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
                          fontSize: '14px',
                          color: '#888',
                          marginBottom: '0.25rem'
                        }}>
                          Track {idx + 1}
                        </div>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: '#fff',
                          marginBottom: '0.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {video.title}
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#10b981',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {video.artist}
                        </div>
                        {video.videoId && (
                          <div style={{
                            fontSize: '14px',
                            color: idx === currentTrackIndex ? '#bfdbfe' : '#888',
                            marginTop: '0.5rem'
                          }}>
                            ✓ Video found
                          </div>
                        )}
                        {!video.videoId && (
                          <div style={{
                            fontSize: '14px',
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
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DiscoveryCard;