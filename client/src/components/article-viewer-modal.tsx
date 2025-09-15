import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2 } from 'lucide-react';

interface ArticleViewerModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function ArticleViewerModal({ url, title, onClose }: ArticleViewerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-[90vw] h-[90vh] max-w-[1400px] bg-white rounded-xl shadow-2xl overflow-hidden animate-slideUpFade">

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white via-white to-white/95 z-10 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 truncate max-w-[600px]">
              {title}
            </h2>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in new tab</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
            aria-label="Close article viewer"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Content Area */}
        <div className="h-full pt-16 bg-gray-50">
          {isLoading && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading article...</p>
              </div>
            </div>
          )}

          {loadError ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to load article preview
                </h3>
                <p className="text-gray-600 mb-6">
                  Some articles cannot be displayed in this viewer due to security restrictions.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open article in new tab
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={title}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              style={{
                backgroundColor: 'white',
                minHeight: 'calc(100% - 1px)'
              }}
            />
          )}
        </div>

        {/* Footer gradient for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-gray-200 to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slideUpFade {
          animation: slideUpFade 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}