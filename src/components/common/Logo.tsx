import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  light?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ light = false, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const subClasses = {
    sm: 'text-[9px] tracking-[0.2em]',
    md: 'text-[10px] tracking-[0.3em]',
    lg: 'text-xs tracking-[0.35em]',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group focus:outline-none ${className}`}>
      {/* Refined Geometric Insignia */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gold-400/40 bg-gradient-to-br from-charcoal-900 to-charcoal-950 p-2 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-gold-400">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gold-accent stroke-current" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeDasharray="4 2" />
          <path d="M12 6V18M6 12H18" stroke="currentColor" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-serif font-bold leading-none tracking-wider ${
            light ? 'text-white' : 'text-charcoal-950'
          } ${sizeClasses[size]}`}
        >
          OZONE <span className="text-gold-500 font-normal">MALL</span>
        </span>
        <span
          className={`font-medium uppercase text-gold-600 dark:text-gold-400 font-sans mt-0.5 ${subClasses[size]}`}
        >
          OJHAR • MAHARASHTRA
        </span>
      </div>
    </Link>
  );
};
