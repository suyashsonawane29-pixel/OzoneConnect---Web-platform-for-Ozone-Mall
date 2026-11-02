import React, { useState, useEffect } from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  imageUrl?: string;
  badge?: string;
}

const DEFAULT_FALLBACK_HERO =
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80';

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs,
  imageUrl,
  badge,
}) => {
  const [currentImg, setCurrentImg] = useState<string | undefined>(imageUrl);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCurrentImg(imageUrl);
    setIsLoaded(false);
  }, [imageUrl]);

  return (
    <div className="relative bg-charcoal-950 text-white overflow-hidden py-16 lg:py-24 border-b border-charcoal-800">
      {/* Background with vibrant display & intelligent directional vignette */}
      {currentImg && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={currentImg}
            alt={title}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (currentImg !== DEFAULT_FALLBACK_HERO) {
                setCurrentImg(DEFAULT_FALLBACK_HERO);
              }
            }}
            style={{ opacity: isLoaded ? 0.75 : 0.35 }}
            className="w-full h-full object-cover object-center transition-opacity duration-700"
          />
          {/* Left-to-right gradient: dark backing behind text on the left, translucent over image on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/90 via-charcoal-950/60 to-charcoal-950/10" />
          {/* Subtle vertical vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-charcoal-950/20" />
        </div>
      )}

      {/* Decorative Gold Radial Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} light />
        </div>

        <div className="max-w-3xl">
          {badge && (
            <span className="inline-block px-3 py-1 mb-4 rounded-full text-[11px] font-semibold tracking-widest uppercase bg-gold-500/20 text-gold-300 border border-gold-500/30">
              {badge}
            </span>
          )}

          {subtitle && (
            <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-gold-400 uppercase mb-2">
              {subtitle}
            </p>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            {title}
          </h1>

          {description && (
            <p className="text-base sm:text-lg text-charcoal-300 font-light leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
