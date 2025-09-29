import React, { useState, useEffect } from 'react';
import { BookOpen, Music, Plus, Check } from 'lucide-react';

interface Work {
  name: string;
  type: string;
  creator?: string;
  year?: number;
  description?: string;
}

interface Song {
  title: string;
  artist: string;
  album?: string;
  year?: number;
}

interface RelatedContent {
  category: string;
  songs: Song[];
}

interface TimelineDiscoveryFeedProps {
  works?: Work[];
  relatedContent?: RelatedContent[];
  discoveryPlaylist: Set<string>;
  onAddToPlaylist: (id: string, item: any) => void;
  onRemoveFromPlaylist: (id: string) => void;
}

const TimelineDiscoveryFeed: React.FC<TimelineDiscoveryFeedProps> = ({
  works = [],
  relatedContent = [],
  discoveryPlaylist,
  onAddToPlaylist,
  onRemoveFromPlaylist
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [allWorksAdded, setAllWorksAdded] = useState(false);

  // Check if all works are added
  useEffect(() => {
    const allAdded = works.length > 0 && works.every(work =>
      discoveryPlaylist.has(`work-${work.name}`)
    );
    setAllWorksAdded(allAdded);
  }, [works, discoveryPlaylist]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddWork = (work: Work) => {
    const id = `work-${work.name}`;
    if (discoveryPlaylist.has(id)) {
      onRemoveFromPlaylist(id);
    } else {
      onAddToPlaylist(id, {
        id,
        title: work.name,
        artist: work.creator,
        type: 'work',
        category: 'Works Discussed'
      });
    }
  };

  const handleAddSong = (song: Song, category: string) => {
    const id = `related-${category}-${song.title}`;
    if (discoveryPlaylist.has(id)) {
      onRemoveFromPlaylist(id);
    } else {
      onAddToPlaylist(id, {
        id,
        title: song.title,
        artist: song.artist,
        type: 'song',
        category
      });
    }
  };

  const handleAddAllWorks = () => {
    if (allWorksAdded) {
      // Remove all works
      works.forEach(work => {
        const id = `work-${work.name}`;
        onRemoveFromPlaylist(id);
      });
    } else {
      // Add all works
      works.forEach(work => {
        const id = `work-${work.name}`;
        if (!discoveryPlaylist.has(id)) {
          onAddToPlaylist(id, {
            id,
            title: work.name,
            artist: work.creator,
            type: 'work',
            category: 'Works Discussed'
          });
        }
      });
    }
  };

  const handleAddAllSongs = (category: string, songs: Song[]) => {
    const allAdded = songs.every(song =>
      discoveryPlaylist.has(`related-${category}-${song.title}`)
    );

    if (allAdded) {
      // Remove all songs
      songs.forEach(song => {
        const id = `related-${category}-${song.title}`;
        onRemoveFromPlaylist(id);
      });
    } else {
      // Add all songs
      songs.forEach(song => {
        const id = `related-${category}-${song.title}`;
        if (!discoveryPlaylist.has(id)) {
          onAddToPlaylist(id, {
            id,
            title: song.title,
            artist: song.artist,
            type: 'song',
            category
          });
        }
      });
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: '#1a1a1a',
      color: '#fff',
      minHeight: '100vh'
    }}>
      {/* Works Discussed Section */}
      {works.length > 0 && (
        <div style={{
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '2px solid #333'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#4a90e2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <BookOpen size={20} />
              Works Discussed
            </h2>
            <button
              onClick={handleAddAllWorks}
              style={{
                padding: '10px 20px',
                background: allWorksAdded ? '#10b981' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {allWorksAdded ? (
                <>
                  <Check size={16} />
                  All Works Added
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add All Works
                </>
              )}
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px',
            marginTop: '12px'
          }}>
            {works.map((work, idx) => {
              const isAdded = discoveryPlaylist.has(`work-${work.name}`);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '14px 18px',
                    background: '#0a0a0a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#4a90e2';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(74, 144, 226, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0a0a0a';
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#fff',
                      fontSize: '16px'
                    }}>
                      {work.name}
                    </div>
                    {work.creator && (
                      <div style={{
                        fontSize: '14px',
                        color: '#4a90e2',
                        marginTop: '4px'
                      }}>
                        by {work.creator}
                      </div>
                    )}
                    {work.year && (
                      <div style={{
                        fontSize: '13px',
                        color: '#888',
                        marginTop: '2px'
                      }}>
                        {work.year}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddWork(work)}
                    style={{
                      padding: '8px 14px',
                      background: isAdded ? '#10b981' : '#4a90e2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = isAdded ? '0.8' : '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} />
                        Added
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Songs Sections */}
      {relatedContent.map((content, idx) => {
        const isExpanded = expandedCategories.has(content.category);
        const allSongsAdded = content.songs.every(song =>
          discoveryPlaylist.has(`related-${content.category}-${song.title}`)
        );

        return (
          <div key={idx} style={{
            marginBottom: '20px',
            background: '#0a0a0a',
            borderRadius: '12px',
            border: '1px solid #333',
            overflow: 'hidden'
          }}>
            {/* Category Header */}
            <div
              style={{
                padding: '16px 20px',
                background: isExpanded ? '#1a1a1a' : '#0a0a0a',
                borderBottom: isExpanded ? '1px solid #333' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onClick={() => toggleCategory(content.category)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Music size={18} color="#4a90e2" />
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#4a90e2'
                }}>
                  {content.category}
                </h3>
                <span style={{
                  fontSize: '14px',
                  color: '#888'
                }}>
                  ({content.songs.length} songs)
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {isExpanded && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddAllSongs(content.category, content.songs);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: allSongsAdded ? '#10b981' : '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {allSongsAdded ? '✓ All Added' : 'Add All'}
                  </button>
                )}
                <span style={{
                  fontSize: '18px',
                  color: '#888',
                  transition: 'transform 0.2s ease',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  display: 'inline-block'
                }}>
                  ▶
                </span>
              </div>
            </div>

            {/* Songs List */}
            {isExpanded && (
              <div style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {content.songs.map((song, songIdx) => {
                  const songId = `related-${content.category}-${song.title}`;
                  const isAdded = discoveryPlaylist.has(songId);

                  return (
                    <div
                      key={songIdx}
                      style={{
                        padding: '10px 14px',
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2a2a2a';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '500',
                          color: '#fff',
                          fontSize: '14px'
                        }}>
                          {song.title}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#4a90e2',
                          marginTop: '2px'
                        }}>
                          {song.artist}
                          {song.album && (
                            <span style={{ color: '#888' }}> • {song.album}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddSong(song, content.category)}
                        style={{
                          padding: '6px 12px',
                          background: isAdded ? '#10b981' : '#4a90e2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isAdded ? '✓ Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TimelineDiscoveryFeed;