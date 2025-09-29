import React, { useState, useEffect } from 'react';
import { Music } from 'lucide-react';

interface PlaylistItem {
  id: string;
  title: string;
  artist?: string;
  type: 'work' | 'song';
  category?: string;
  videoId?: string;
  thumbnail?: string;
}

interface DiscoveryPlaylistProps {
  items: Map<string, PlaylistItem>;
  onPlayItem?: (item: PlaylistItem) => void;
  onRemoveItem?: (id: string) => void;
  onClearPlaylist?: () => void;
}

const DiscoveryPlaylist: React.FC<DiscoveryPlaylistProps> = ({
  items,
  onPlayItem,
  onRemoveItem,
  onClearPlaylist
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupedItems, setGroupedItems] = useState<Map<string, PlaylistItem[]>>(new Map());

  // Group items by category
  useEffect(() => {
    const grouped = new Map<string, PlaylistItem[]>();

    items.forEach((item) => {
      const category = item.category || 'Uncategorized';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });

    setGroupedItems(grouped);
  }, [items]);

  const itemCount = items.size;

  if (itemCount === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '9999px',
          padding: '12px 24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          zIndex: 50,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        }}
      >
        <Music size={20} />
        <span>Discovery Playlist ({itemCount})</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            border: '1px solid #e5e7eb',
            padding: '16px',
            maxWidth: '448px', // max-w-md equivalent
            width: '100%',
            maxHeight: '384px', // max-h-96 equivalent
            overflowY: 'auto',
            zIndex: 50,
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              Discovery Playlist
            </h3>
            {itemCount > 0 && (
              <button
                onClick={onClearPlaylist}
                style={{
                  padding: '6px 12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Grouped Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from(groupedItems.entries()).map(([category, categoryItems]) => (
              <div key={category}>
                {/* Category Header */}
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#4a90e2',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>{category}</span>
                  <span style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontWeight: '400'
                  }}>
                    ({categoryItems.length})
                  </span>
                </div>

                {/* Category Items */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 14px',
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f3f4f6';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                      onClick={() => onPlayItem?.(item)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '500',
                          color: '#1f2937',
                          fontSize: '14px'
                        }}>
                          {item.title}
                        </div>
                        {item.artist && (
                          <div style={{
                            fontSize: '13px',
                            color: '#4a90e2',
                            marginTop: '2px'
                          }}>
                            {item.artist}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem?.(item.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fecaca';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Play All Button */}
          {itemCount > 0 && (
            <button
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Play All ({itemCount} items)
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default DiscoveryPlaylist;