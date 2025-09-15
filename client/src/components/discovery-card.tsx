import React, { useState, useEffect } from 'react';
import { X, Sparkles, Music, Film, Book, MapPin, Calendar, ExternalLink, ChevronRight, Loader2, Instagram, Frame, Youtube, FileText } from 'lucide-react';

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
        <div className="bg-white rounded-3xl shadow-2xl w-[800px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
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
                        ) : media.type === 'youtube' && media.embedId ? (
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
                              {media.link && (
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
                                  src={`https://www.youtube.com/embed/${media.embedId}?rel=0&modestbranding=1`}
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
    </>
  );
};

export default DiscoveryCard;