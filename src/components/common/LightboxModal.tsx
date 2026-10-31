import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; title: string; description?: string; category?: string }[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors"
        aria-label="Close Lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation Left */}
      {images.length > 1 && (
        <button
          onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
          className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white z-50 transition-all hover:scale-110"
          aria-label="Previous Image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Navigation Right */}
      {images.length > 1 && (
        <button
          onClick={() => onNavigate((currentIndex + 1) % images.length)}
          className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white z-50 transition-all hover:scale-110"
          aria-label="Next Image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Container */}
      <div className="max-w-5xl max-h-[85vh] p-4 flex flex-col items-center">
        <div className="relative overflow-hidden rounded-xl shadow-2xl">
          <img
            src={current.url}
            alt={current.title}
            className="max-h-[70vh] w-auto max-w-full object-contain mx-auto"
          />
        </div>

        {/* Captions */}
        <div className="mt-4 text-center max-w-2xl px-4">
          {current.category && (
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-gold-400">
              {current.category}
            </span>
          )}
          <h4 className="font-serif text-lg sm:text-xl font-semibold text-white mt-1">
            {current.title}
          </h4>
          {current.description && (
            <p className="text-xs sm:text-sm text-charcoal-300 mt-1">{current.description}</p>
          )}
          <span className="text-[11px] text-charcoal-400 mt-2 block font-mono">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
};
