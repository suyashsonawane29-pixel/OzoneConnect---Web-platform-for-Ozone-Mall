import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { Logo } from './Logo';
import { GlobalSearchModal } from './GlobalSearchModal';
import { getHomepageContent } from '../../firebase/services/contentService';
import { HomepageContent } from '../../types';

export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const location = useLocation();

  useEffect(() => {
    getHomepageContent().then((data) => setContent(data));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Stores', path: '/stores' },
    { label: 'Offers', path: '/offers', badge: 'Hot' },
    { label: 'Dining', path: '/dining' },
    { label: 'Entertainment', path: '/entertainment' },
    { label: 'Events', path: '/events' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Visitor Guide', path: '/visitor-information' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        {/* Top Announcement Bar */}
        {content?.announcementBanner?.enabled && (
          <div className="bg-charcoal-950 text-gold-300 px-4 py-2 text-xs font-medium border-b border-charcoal-800">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden truncate">
                <Sparkles className="w-3.5 h-3.5 text-gold-400 flex-shrink-0 animate-spin-slow" />
                <span className="truncate">{content.announcementBanner.text}</span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-[11px] text-charcoal-300 flex-shrink-0">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gold-400" /> 10:00 AM - 10:30 PM
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold-400" /> NH-3, Ojhar
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div
          className={`w-full transition-all duration-300 border-b ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-md shadow-sm border-charcoal-100 py-3'
              : 'bg-white/90 backdrop-blur-sm border-charcoal-100/60 py-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Brand Logo */}
              <Logo size="md" />

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-1.5 text-xs font-semibold tracking-wider uppercase transition-colors rounded-lg group ${
                        isActive
                          ? 'text-gold-700 bg-gold-50/70 font-bold'
                          : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-ivory-100'
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gold-600 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Action Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Search Trigger Button */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-charcoal-600 bg-ivory-100 hover:bg-gold-50 hover:text-gold-800 border border-charcoal-200 hover:border-gold-300 transition-colors"
                  aria-label="Search Ozone Mall"
                >
                  <Search className="w-3.5 h-3.5 text-gold-600" />
                  <span className="hidden md:inline">Search</span>
                  <span className="hidden xl:inline text-[10px] bg-white px-1.5 py-0.5 rounded border border-charcoal-200 text-charcoal-400 font-mono">
                    ⌘K
                  </span>
                </button>

                {/* Plan Visit CTA */}
                <Link
                  to="/visitor-information"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-all shadow-sm"
                >
                  Visit Mall
                </Link>

                {/* Mobile Menu Hamburger */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-charcoal-700 hover:bg-ivory-200 focus:outline-none"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[100px] z-50 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border-b border-charcoal-200 max-h-[85vh] overflow-y-auto px-6 py-6 shadow-2xl">
              <div className="mb-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-ivory-100 rounded-xl text-charcoal-500 text-sm border border-charcoal-200"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gold-600" /> Search stores, offers...
                  </span>
                  <span className="text-xs text-charcoal-400">Open</span>
                </button>
              </div>

              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wider uppercase transition-colors ${
                        isActive
                          ? 'bg-gold-50 text-gold-800 font-bold'
                          : 'text-charcoal-800 hover:bg-ivory-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {link.label}
                        {link.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white">
                            {link.badge}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 text-charcoal-400" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-charcoal-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-charcoal-600">
                  <Clock className="w-4 h-4 text-gold-600" />
                  <span>Open today: 10:00 AM - 10:30 PM</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-600">
                  <MapPin className="w-4 h-4 text-gold-600" />
                  <span>Mumbai-Agra Highway, Ojhar, Nashik</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal-600">
                  <Phone className="w-4 h-4 text-gold-600" />
                  <span>+91 253 278 1000</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
