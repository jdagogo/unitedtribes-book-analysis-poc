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

  useEffect(() => {
    if (isOpen && searchQuery) {
      searchYouTube();
    }
  }, [isOpen, searchQuery]);

  const searchYouTube = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the YouTube Analysis API on port 3003
      const url = `http://localhost:3003/api/youtube-search?song=${encodeURIComponent(searchQuery)}`;
      console.log('🔍 Searching YouTube for:', searchQuery);
      console.log('📡 API URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 API Response:', data);

      // Transform the response into VideoResult format
      const videos: VideoResult[] = data.map((item: any) => {
        // Extract video ID from URL (format: https://www.youtube.com/watch?v=VIDEO_ID)
        const urlParams = new URL(item.url).searchParams;
        const videoId = urlParams.get('v') || '';

        return {
          url: item.url,
          title: item.title,
          channel: item.channel,
          videoId,
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        };
      });

      setResults(videos);
      console.log('✅ Found', videos.length, 'videos');
    } catch (err) {
      console.error('❌ Search failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to search YouTube');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoClick = (videoId: string) => {
    // Open video in new tab
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
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

          {!isLoading && !error && results.length > 0 && (
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
