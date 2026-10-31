import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  imageUrl?: string;
  badge?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  description,
  breadcrumbs,
  imageUrl,
  badge,
}) => {
  return (
    <div className="relative bg-charcoal-950 text-white overflow-hidden py-16 lg:py-24 border-b border-charcoal-800">
      {/* Background with subtle gradient & overlay */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105 transform animate-pulse duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-charcoal-950/50" />
        </div>
      )}

      {/* Decorative Gold Radial Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

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
