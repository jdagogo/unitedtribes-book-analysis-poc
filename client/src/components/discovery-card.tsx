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
  const [activeTab, setActiveTab] = useState<'overview' | 'media' | 'connections'>('overview');
  const [articleViewerData, setArticleViewerData] = useState<{ url: string; title: string; screenshot?: string; price?: number } | null>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    fetchDiscoveryContent();
  }, []);

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
        <div className="bg-white rounded-3xl shadow-2xl w-[960px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-8 pt-8 pb-6">
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
                    🔗 Connections
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
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

                {/* Connections Tab */}
                {activeTab === 'connections' && (
                  <div className="space-y-4">
                    {discoveryContent.connections?.map((connection, index) => (
                      <div key={index} className="bg-gradient-to-r from-indigo-50 to-white rounded-xl p-5 border border-indigo-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h6 className="font-semibold text-gray-900 text-xl">{connection.name}</h6>
                            <p className="text-indigo-600 text-base mt-1">{connection.relationship}</p>
                            {connection.significance && (
                              <p className="text-indigo-700 text-base mt-2 leading-relaxed">
                                {connection.significance}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="text-indigo-400" size={20} />
                        </div>
                      </div>
                    ))}
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
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-lg font-semibold text-white"
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
    </>
  );
};

export default DiscoveryCard;