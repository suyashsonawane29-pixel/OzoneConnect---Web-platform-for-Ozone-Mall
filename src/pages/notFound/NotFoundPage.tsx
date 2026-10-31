import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { Logo } from '../../components/common/Logo';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto border border-gold-200">
          <Search className="w-8 h-8" />
        </div>

        <p className="text-xs font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
          404 • Page Not Found
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-950">
          We Couldn't Find That Destination
        </h1>

        <p className="text-sm text-charcoal-600 leading-relaxed font-light">
          The page or store directory listing you requested may have moved or no longer exists. Let's guide you back to Ozone Mall's premier destinations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
          >
            <Home className="w-3.5 h-3.5 mr-2" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/stores"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-ivory-100 hover:bg-gold-50 text-charcoal-900 border border-charcoal-200 transition-colors"
          >
            <span>Explore Stores Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
