import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  tag?: string;
  title: string;
  description?: string;
  linkText?: string;
  linkUrl?: string;
  align?: 'left' | 'center';
  light?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  tag,
  title,
  description,
  linkText,
  linkUrl,
  align = 'left',
  light = false,
}) => {
  const isCenter = align === 'center';

  return (
    <div
      className={`mb-8 sm:mb-12 flex flex-col ${
        isCenter ? 'items-center text-center' : 'items-start text-left'
      } md:flex-row md:items-end md:justify-between`}
    >
      <div className={`max-w-2xl ${isCenter ? 'mx-auto' : ''}`}>
        {tag && (
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-px bg-gold-500"></span>
            <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
              {tag}
            </span>
            {isCenter && <span className="w-6 h-px bg-gold-500"></span>}
          </div>
        )}

        <h2
          className={`font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
            light ? 'text-white' : 'text-charcoal-950'
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-2 text-sm sm:text-base leading-relaxed ${
              light ? 'text-charcoal-300' : 'text-charcoal-600'
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {linkText && linkUrl && (
        <div className="mt-4 md:mt-0 flex-shrink-0">
          <Link
            to={linkUrl}
            className={`group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors ${
              light
                ? 'text-gold-400 hover:text-gold-300'
                : 'text-charcoal-900 hover:text-gold-600'
            }`}
          >
            <span>{linkText}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
