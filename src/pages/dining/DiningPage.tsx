import React, { useEffect, useState, useMemo } from 'react';
import { PageHero } from '../../components/common/PageHero';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { getDiningOutlets } from '../../firebase/services/diningService';
import { DiningOutlet, DiningCategory } from '../../types';
import { Search, Utensils, MapPin, Clock, Phone, Sparkles, Filter, X } from 'lucide-react';

const DINING_CATEGORIES: (DiningCategory | 'All')[] = [
  'All',
  'Fine Dining',
  'Casual Dining',
  'Food Court',
  'Cafe & Bakery',
  'Quick Bites',
  'Beverages & Desserts',
];

export const DiningPage: React.FC = () => {
  const [diningOutlets, setDiningOutlets] = useState<DiningOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<DiningCategory | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getDiningOutlets({ publishedOnly: true });
        setDiningOutlets(list);
      } catch (err) {
        console.error('Failed to load dining outlets', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredOutlets = useMemo(() => {
    return diningOutlets.filter((outlet) => {
      if (selectedCategory !== 'All' && outlet.diningType !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          outlet.name.toLowerCase().includes(q) ||
          outlet.cuisineType.toLowerCase().includes(q) ||
          outlet.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [diningOutlets, selectedCategory, searchTerm]);

  return (
    <div>
      <PageHero
        badge="Culinary Journeys"
        title="Dining, Cafes & Food Street"
        subtitle="EPICUREAN OASIS"
        description="Experience exceptional gastronomy at Ozone Mall Ojhar. From scenic rooftop open-air dining to international quick bites and artisanal cafes."
        breadcrumbs={[{ label: 'Food & Dining' }]}
        imageUrl="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Search & Category Filter */}
        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-subtle space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-gold-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by restaurant name or cuisine..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-gold-500 font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {DINING_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-charcoal-900 text-white font-bold shadow-sm'
                      : 'bg-ivory-100 text-charcoal-700 hover:bg-gold-50 border border-charcoal-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Cooking up dining directory..." />
        ) : filteredOutlets.length === 0 ? (
          <EmptyState
            title="No Dining Outlets Found"
            description="We couldn't find any dining options matching your criteria. Try resetting your search or choosing another cuisine category."
            actionText="View All Outlets"
            onActionClick={() => {
              setSelectedCategory('All');
              setSearchTerm('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOutlets.map((outlet) => (
              <div
                key={outlet.id}
                className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900">
                    <img
                      src={outlet.coverImageUrl}
                      alt={outlet.name}
                      className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950 shadow-md">
                        {outlet.diningType}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-charcoal-900 shadow-sm backdrop-blur-sm">
                        {outlet.floor.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold-600 mb-1">
                      {outlet.cuisineType}
                    </p>

                    <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                      {outlet.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed mb-4 line-clamp-3">
                      {outlet.description}
                    </p>

                    {outlet.features && outlet.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {outlet.features.map((feat, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md text-[10px] bg-ivory-100 text-charcoal-600 border border-charcoal-200/80 font-medium"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-charcoal-500 pt-3 border-t border-charcoal-100">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gold-600" />
                          <span>{outlet.floor} • Unit {outlet.unitNumber}</span>
                        </span>
                        {outlet.averageCostForTwo && (
                          <span className="font-semibold text-charcoal-800">
                            {outlet.averageCostForTwo}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span>Hours: {outlet.openingHours}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-charcoal-50 flex items-center justify-between">
                    {outlet.phone ? (
                      <a
                        href={`tel:${outlet.phone}`}
                        className="text-xs font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Table Enquiries</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-charcoal-400">Walk-in Welcome</span>
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400">
                      Level 3 Food Court
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
