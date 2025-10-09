import { useState, useEffect } from 'react';
import { X, Play, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  entityType?: 'person' | 'work' | 'place' | 'organization' | 'song';
}

interface VideoResult {
  url: string;
  title: string;
  channel: string;
  videoId: string;
  thumbnail: string;
}

export function DiscoveryModal({ isOpen, onClose, searchQuery, entityType = 'person' }: DiscoveryModalProps) {
  const [results, setResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && searchQuery) {
      searchYouTube();
      setSelectedVideoId(null); // Reset selected video when modal opens
    }
  }, [isOpen, searchQuery]);

  const searchYouTube = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the local YouTube API with auto-rotating keys (prioritizes VEVO/Official)
      // Parse the search query to extract song and artist if it's in "Song Artist official" format
      const queryParts = searchQuery.split(' official')[0]; // Remove "official" suffix
      const url = `/api/youtube/search-track?song=${encodeURIComponent(queryParts)}`;

      console.log('🔍 Searching YouTube for:', searchQuery);
      console.log('📡 API URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Response:', data);

      // The search-track endpoint returns a single video object
      if (data.videoId) {
        const video: VideoResult = {
          url: `https://www.youtube.com/watch?v=${data.videoId}`,
          title: data.title,
          channel: data.channel,
          videoId: data.videoId,
          thumbnail: `https://img.youtube.com/vi/${data.videoId}/mqdefault.jpg`
        };

        setResults([video]);
        // Automatically play the first (and only) result
        setSelectedVideoId(data.videoId);
        console.log('✅ Found video:', video.title, 'by', video.channel);
      } else {
        setResults([]);
        console.log('⚠️ No video found');
      }
    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to search YouTube');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = (videoId: string) => {
    // Play video embedded in modal
    setSelectedVideoId(videoId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-900">
            Discover: {searchQuery}
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Related YouTube videos and performances
          </p>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="mt-4 text-gray-600">Searching YouTube...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Error: {error}</p>
              <Button
                onClick={searchYouTube}
                className="mt-2"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No videos found for "{searchQuery}"</p>
            </div>
          )}

          {/* Embedded Video Player */}
          {selectedVideoId && (
            <div className="mb-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {results.length > 0 && (
                <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                  <h3 className="font-bold text-lg text-purple-900">{results[0].title}</h3>
                  <p className="text-sm text-gray-600">{results[0].channel}</p>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && results.length > 0 && !selectedVideoId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((video, index) => (
                <div
                  key={index}
                  className="border border-purple-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white"
                  onClick={() => handleVideoClick(video.videoId)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all">
                      <Play className="h-16 w-16 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-600">{video.channel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
