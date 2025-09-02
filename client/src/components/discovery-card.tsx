import React, { useState, useEffect } from 'react';
import { X, Sparkles, Music, Film, Book, MapPin, Calendar, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';

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
    type: 'music' | 'film' | 'book' | 'venue';
    title: string;
    creator?: string;
    year?: string;
    link?: string;
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
            `You asked about: ${userContext}. This text appears in "Just Kids" by Patti Smith.` :
            'This passage appears in "Just Kids," exploring the 1960s-70s New York art scene.',
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
              <h3 className="text-2xl font-bold tracking-tight drop-shadow-lg">
                Cultural Discovery
              </h3>
            </div>

            {userContext && (
              <p className="text-white/90 text-[15px] mt-3 font-medium pl-16">
                Your question: "{userContext}"
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex-1 flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
                <p className="text-gray-600">Discovering connections...</p>
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
                    className={`px-6 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'overview' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    📖 Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`px-6 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 transform hover:scale-105 ${
                      activeTab === 'media' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                    }`}
                  >
                    🎬 Related Media
                  </button>
                  <button
                    onClick={() => setActiveTab('connections')}
                    className={`px-6 py-3 rounded-full text-[15px] font-semibold transition-all duration-300 transform hover:scale-105 ${
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
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {discoveryContent.title}
                      </h4>
                      {discoveryContent.timeline && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Calendar size={14} />
                          <span>{discoveryContent.timeline.year}</span>
                          <span className="text-gray-400">•</span>
                          <span>{discoveryContent.timeline.context}</span>
                        </div>
                      )}
                      <p className="text-gray-700 leading-relaxed">
                        {discoveryContent.summary}
                      </p>
                    </div>

                    {discoveryContent.culturalContext && (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                        <h5 className="font-semibold text-indigo-900 mb-2">Cultural Context</h5>
                        <p className="text-gray-700 leading-relaxed">
                          {discoveryContent.culturalContext}
                        </p>
                      </div>
                    )}

                    {discoveryContent.quotes && discoveryContent.quotes.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Notable Quotes</h5>
                        {discoveryContent.quotes.map((quote, index) => (
                          <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 py-2 mb-3">
                            <p className="text-gray-700 italic mb-1">"{quote.text}"</p>
                            <cite className="text-sm text-gray-500">— {quote.source}</cite>
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
                      <div key={index} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white rounded-lg text-indigo-600">
                              {getMediaIcon(media.type)}
                            </div>
                            <div>
                              <h6 className="font-semibold text-gray-900">{media.title}</h6>
                              {media.creator && (
                                <p className="text-sm text-gray-600">{media.creator}</p>
                              )}
                              {media.year && (
                                <p className="text-xs text-gray-500 mt-1">{media.year}</p>
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
                    ))}

                    {discoveryContent.videoEmbeds && discoveryContent.videoEmbeds.length > 0 && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-gray-900 mb-3">Related Videos</h5>
                        {discoveryContent.videoEmbeds.map((video, index) => (
                          <div key={index} className="bg-black rounded-xl overflow-hidden mb-4">
                            <div className="aspect-video">
                              {/* Replace with actual embed */}
                              <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
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
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h6 className="font-semibold text-gray-900 text-lg">{connection.name}</h6>
                            <p className="text-indigo-600 text-sm mt-1">{connection.relationship}</p>
                            {connection.significance && (
                              <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                                {connection.significance}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="text-gray-400" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Selected: "{selectedText.substring(0, 50)}..."
                  </div>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700"
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