import React, { useEffect } from 'react';
import { X } from 'lucide-react';

function TrailerModal({ trailerKey, onClose }) {
  if (!trailerKey) return null;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    /* Modal container wraps with a blur background and provides padding context */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 transition-all duration-300">
      
      {/* Container adapts directly to screens with maximum viewport control */}
      <div className="relative w-full max-w-4xl aspect-video bg-zinc-950 rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        
        {/* Mobile-Friendly Close Target Button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 bg-black/70 hover:bg-black text-white p-2 rounded-full transition-colors duration-200 border border-zinc-700/50 active:scale-90"
          aria-label="Close modal"
        >
          <X size={18} className="sm:w-[20px] sm:h-[20px]" />
        </button>

        {/* Video Player Frame */}
        <div className="w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&modestbranding=1&rel=0`}
            title="Movie Trailer"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>

      </div>
    </div>
  );
}

export default TrailerModal;