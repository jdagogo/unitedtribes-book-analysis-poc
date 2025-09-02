import React, { useState, useEffect } from 'react';
import { X, Sparkles, Search, Hash } from 'lucide-react';
import { DiscoveryCard } from './discovery-card';

interface TextSelectionModalProps {
  selectedText: string;
  onClose: () => void;
  position?: { x: number; y: number };
}

export const TextSelectionModal: React.FC<TextSelectionModalProps> = ({
  selectedText,
  onClose,
  position
}) => {
  const [userContext, setUserContext] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showDiscoveryCard, setShowDiscoveryCard] = useState(false);

  // Animate in on mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleDiscover = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowDiscoveryCard(true);
    }, 200);
  };

  const handleDiscoveryClose = () => {
    setShowDiscoveryCard(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-200 ${
          isVisible ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed z-50 transition-all duration-200 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-[600px] max-w-[90vw] overflow-hidden border border-gray-100">
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 px-8 pt-8 pb-6">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Title with Icon */}
            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg animate-pulse">
                <Sparkles size={24} className="drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight drop-shadow-lg">
                Discover Context
              </h3>
            </div>

            {/* Subtitle */}
            <p className="text-white/90 text-[15px] mt-3 leading-relaxed font-medium pl-14">
              Explore cultural connections and deeper meaning in this passage
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Selected Text Display */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 block flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse"></span>
                Selected Passage
              </label>
              <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-transparent rounded-xl"></div>
                <blockquote className="relative pl-8 pr-6 py-5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="text-gray-900 leading-loose font-serif text-[17px] selection:bg-yellow-200 selection:text-gray-900">
                    <span className="text-3xl text-blue-400/50 leading-none align-top">"</span>
                    <span className="relative inline-block px-2 py-1 -mx-2 -my-1">
                      <span className="absolute inset-0 bg-yellow-200/50 rounded"></span>
                      <span className="relative font-medium">{selectedText}</span>
                    </span>
                    <span className="text-3xl text-blue-400/50 leading-none align-bottom">"</span>
                  </div>
                </blockquote>
              </div>
            </div>

            {/* Context Input */}
            <div className="mb-8">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 block flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></span>
                Add Your Context
                <span className="text-gray-400 font-normal normal-case text-xs ml-2 bg-gray-100 px-2 py-0.5 rounded-full">optional</span>
              </label>
              <div className="relative">
                <textarea
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  placeholder="What would you like to discover about this passage?"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all duration-300 text-gray-800 placeholder-gray-400 text-[16px] leading-relaxed shadow-sm hover:shadow-md"
                  rows={3}
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                />
                <div className="absolute bottom-4 right-4 text-sm font-medium text-gray-500 bg-white px-2 py-1 rounded-lg shadow-sm">
                  {userContext.length}/500
                </div>
              </div>
              
              {/* Suggestion Pills - Larger and Sexier */}
              <div className="mt-5 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Suggestions</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setUserContext('Tell me about the cultural significance of this passage')}
                    className="group relative px-5 py-2.5 text-[14px] font-medium text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200/50 hover:border-blue-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🎭</span>
                      Cultural Significance
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </button>
                  <button
                    onClick={() => setUserContext('How does this connect to 1960s New York City?')}
                    className="group relative px-5 py-2.5 text-[14px] font-medium text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-200/50 hover:border-purple-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🗽</span>
                      1960s NYC Context
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </button>
                  <button
                    onClick={() => setUserContext('Who are the related artists and what movements influenced this?')}
                    className="group relative px-5 py-2.5 text-[14px] font-medium text-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200/50 hover:border-green-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg">🎨</span>
                      Related Artists
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleDiscover}
                className="group flex-1 relative bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 transition-all duration-300 font-semibold text-[16px] shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <Search size={20} className="relative z-10" />
                <span className="relative z-10 tracking-wide">Discover Context</span>
                <span className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700"></span>
              </button>
              <button
                onClick={handleClose}
                className="px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 font-semibold text-gray-700 text-[16px] hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-gray-200 hover:border-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Hash size={16} className="text-indigo-500" />
                  <span className="font-bold text-gray-800">{selectedText.split(' ').length}</span> words
                </span>
                <span className="text-gray-300 text-lg">•</span>
                <span className="text-sm font-medium text-gray-600">
                  <span className="font-bold text-gray-800">{selectedText.length}</span> characters
                </span>
              </div>
              <span className="text-sm text-gray-500 flex items-center gap-2">
                Press 
                <kbd className="px-2.5 py-1 bg-white border-2 border-gray-300 rounded-lg text-[12px] font-bold font-mono shadow-sm">
                  ESC
                </kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for additional styling */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, -45%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Discovery Card */}
      {showDiscoveryCard && (
        <DiscoveryCard
          selectedText={selectedText}
          userContext={userContext}
          onClose={handleDiscoveryClose}
        />
      )}
    </>
  );
};

export default TextSelectionModal;