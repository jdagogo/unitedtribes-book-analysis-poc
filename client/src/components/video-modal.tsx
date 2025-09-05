import React, { useState, useEffect } from 'react';
import { X, Music } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoId: string;
  context?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  title,
  videoId,
  context
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[80] transition-all duration-300 ${
          isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'
        }`}
        onClick={handleClose}
      />
      
      {/* Video Modal */}
      <div 
        className={`fixed z-[90] transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-200">
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 px-8 pt-6 pb-5">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 text-white">
              <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg">
                <Music size={24} className="drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight drop-shadow-lg">
                {title}
              </h3>
            </div>
          </div>

          {/* Video Container */}
          <div className="bg-black">
            <iframe 
              width="640" 
              height="360" 
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="w-full"
            />
          </div>

          {/* Context Text */}
          {context && (
            <div className="px-8 py-5 bg-gradient-to-r from-indigo-50 to-white border-t border-indigo-200">
              <p className="text-indigo-900 text-lg leading-relaxed">
                {context}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoModal;