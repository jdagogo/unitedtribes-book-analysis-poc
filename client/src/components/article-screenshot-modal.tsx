import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Info } from 'lucide-react';

interface ArticleScreenshotModalProps {
  screenshotUrl: string;
  articleUrl: string;
  title: string;
  price?: number;
  onClose: () => void;
}

export function ArticleScreenshotModal({
  screenshotUrl,
  articleUrl,
  title,
  price = 0.25,
  onClose
}: ArticleScreenshotModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
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
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open full article</span>
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
        <div className="h-full pt-16 bg-gray-50 overflow-auto">
          {/* Proof of Concept Banner */}
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Proof of Concept:</strong> This preview demonstrates how Rolling Stone articles could be elegantly integrated
              within the reading experience. With proper licensing, readers would access full articles seamlessly.
            </p>
          </div>

          {/* Screenshot Container */}
          <div className="p-6 flex justify-center">
            <div className="relative max-w-full">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white rounded-lg">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-sm text-gray-500">Loading article preview...</p>
                  </div>
                </div>
              )}

              <img
                src={screenshotUrl}
                alt={`${title} - Article Preview`}
                className={`max-w-full h-auto rounded-lg shadow-lg border border-gray-200 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-300`}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Overlay gradient at bottom to show it continues */}
              {imageLoaded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent rounded-b-lg pointer-events-none" />
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="pb-8 px-6">
            <div className="flex gap-4 justify-center">
              {/* Read on Original Site */}
              <div className="inline-flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-600">
                  Interested in reading the full article?
                </p>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Read on {articleUrl.includes('vogue') ? 'Vogue' : articleUrl.includes('rollingstone') ? 'Rolling Stone' : 'Pitchfork'}
                </a>
                <p className="text-xs text-gray-500 max-w-xs">
                  Future integration would provide seamless access to full articles within this interface
                </p>
              </div>

              {/* Microtransaction Demo */}
              <div className="inline-flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200">
                <p className="text-gray-700 font-medium">
                  Instant Article Access
                </p>
                <button
                  onClick={() => {
                    // Demo microtransaction
                    alert(`Demo: This would process a ${price && price >= 100 ? `$${price.toFixed(2)}` : price === 0.50 ? '50¢' : '25¢'} ${price && price >= 100 ? 'ticket purchase' : 'micropayment'} via ${price && price >= 100 ? 'secure payment gateway' : 'Lightning Network or similar instant payment system'}`);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {price && price >= 100 ? 'Buy Tickets Here' : 'Purchase Article Here'}
                </button>
                <div className="text-center">
                  <p className="text-sm font-semibold text-blue-900">
                    {price && price >= 100 ? `$${price.toFixed(2)}` : `Only ${price === 0.50 ? '50¢' : '25¢'}`}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {price && price >= 100 ? 'Secure checkout via ticketing platform' : 'Instant micropayment via digital wallet'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 max-w-xs text-center">
                  Seamless microtransactions enable per-article purchases without subscriptions
                </p>
              </div>
            </div>
          </div>
        </div>
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