import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Store as StoreIcon, Tag, Calendar, ArrowRight, CornerDownLeft } from 'lucide-react';
import { getStores } from '../../firebase/services/storesService';
import { getOffers } from '../../firebase/services/offersService';
import { getEvents } from '../../firebase/services/eventsService';
import { Store, Offer, EventItem } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setSearchTerm('');
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setStores([]);
      setOffers([]);
      setEvents([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [allStores, allOffers, allEvents] = await Promise.all([
          getStores({ searchTerm, publishedOnly: true }),
          getOffers({ activeOnly: true, publishedOnly: true }),
          getEvents({ type: 'upcoming', publishedOnly: true }),
        ]);

        const term = searchTerm.toLowerCase();
        setStores(allStores.slice(0, 4));
        setOffers(
          allOffers
            .filter(
              (o) =>
                o.title.toLowerCase().includes(term) ||
                o.storeName.toLowerCase().includes(term) ||
                o.description.toLowerCase().includes(term)
            )
            .slice(0, 3)
        );
        setEvents(
          allEvents
            .filter(
              (e) =>
                e.title.toLowerCase().includes(term) ||
                e.description.toLowerCase().includes(term) ||
                e.venue.toLowerCase().includes(term)
            )
            .slice(0, 3)
        );
      } catch (err) {
        console.error('Global search error', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  const totalResults = stores.length + offers.length + events.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-charcoal-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-6 py-4 border-b border-charcoal-100 bg-ivory-50">
          <Search className="w-5 h-5 text-gold-600 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stores, brands, offers, movies, events..."
            className="w-full bg-transparent border-0 text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-0 text-base font-sans"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-charcoal-400 hover:text-charcoal-600 rounded-full mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-xs font-semibold uppercase text-charcoal-500 bg-charcoal-100 hover:bg-charcoal-200 rounded-lg"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-6">
          {loading && (
            <div className="py-12 text-center text-sm text-charcoal-500">
              Searching Ozone Mall directory...
            </div>
          )}

          {!loading && !searchTerm && (
            <div className="py-8 px-4 text-center">
              <p className="text-xs font-semibold tracking-wider uppercase text-charcoal-400 mb-3">
                Suggested Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Fashion', 'Electronics', 'Fine Dining', 'Offers', 'Cinema', 'Westside', 'Croma'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-ivory-100 hover:bg-gold-50 text-charcoal-700 hover:text-gold-700 border border-charcoal-200 hover:border-gold-300 transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {!loading && searchTerm && totalResults === 0 && (
            <div className="py-12 text-center">
              <p className="text-base font-serif font-semibold text-charcoal-800">
                No matching results found
              </p>
              <p className="text-xs text-charcoal-500 mt-1">
                Try searching for store names like "Westside", categories like "Dining", or explore our directory.
              </p>
            </div>
          )}

          {/* Stores section */}
          {stores.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold tracking-wider uppercase text-gold-600">
                <StoreIcon className="w-3.5 h-3.5" />
                <span>Stores & Outlets ({stores.length})</span>
              </div>
              <div className="space-y-1">
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/stores/${s.slug}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ivory-100 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={s.logoUrl}
                        alt={s.name}
                        className="w-10 h-10 rounded-lg object-cover border border-charcoal-200"
                      />
                      <div>
                        <p className="text-sm font-semibold text-charcoal-900 group-hover:text-gold-700">
                          {s.name}
                        </p>
                        <p className="text-xs text-charcoal-500">
                          {s.floor} • {s.category}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-gold-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Offers section */}
          {offers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold tracking-wider uppercase text-gold-600">
                <Tag className="w-3.5 h-3.5" />
                <span>Active Offers ({offers.length})</span>
              </div>
              <div className="space-y-1">
                {offers.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => handleSelect(`/offers`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ivory-100 text-left transition-colors group"
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 mb-1 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {o.discountText}
                      </span>
                      <p className="text-sm font-semibold text-charcoal-900 group-hover:text-gold-700">
                        {o.title}
                      </p>
                      <p className="text-xs text-charcoal-500">{o.storeName}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-gold-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Events section */}
          {events.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold tracking-wider uppercase text-gold-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>Upcoming Events ({events.length})</span>
              </div>
              <div className="space-y-1">
                {events.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect(`/events/${e.id}`)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-ivory-100 text-left transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-charcoal-900 group-hover:text-gold-700">
                        {e.title}
                      </p>
                      <p className="text-xs text-charcoal-500">
                        {e.startDate} • {e.venue}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-gold-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-ivory-100 border-t border-charcoal-100 flex items-center justify-between text-[11px] text-charcoal-500 px-6">
          <div className="flex items-center gap-1">
            <CornerDownLeft className="w-3.5 h-3.5 text-charcoal-400" />
            <span>Select to navigate</span>
          </div>
          <span>Ozone Mall, Ojhar</span>
        </div>
      </div>
    </div>
  );
};
