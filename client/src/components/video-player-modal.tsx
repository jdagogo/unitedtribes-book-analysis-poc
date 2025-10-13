import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoEmbedHtml: string;
  videoTitle: string;
}

export function VideoPlayerModal({ isOpen, onClose, videoEmbedHtml, videoTitle }: VideoPlayerModalProps) {
  const videoIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-[1000px]">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div style={{ backgroundColor: '#3b82f6' }} className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-white text-xl font-semibold truncate pr-4">
              {videoTitle}
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Video Player */}
          <div className="bg-black">
            <iframe
              ref={videoIframeRef}
              srcDoc={videoEmbedHtml}
              style={{
                width: '100%',
                height: '700px',
                border: 'none',
                display: 'block'
              }}
              title={videoTitle}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
