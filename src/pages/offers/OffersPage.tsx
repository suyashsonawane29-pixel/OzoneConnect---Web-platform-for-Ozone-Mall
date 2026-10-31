import React, { useEffect, useState } from 'react';
import { PageHero } from '../../components/common/PageHero';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { getOffers } from '../../firebase/services/offersService';
import { Offer, StoreCategory } from '../../types';
import { formatDate, getOfferStatus } from '../../utils/formatters';
import { Tag, Calendar, Store, AlertCircle, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES: (StoreCategory | 'All')[] = [
  'All',
  'Fashion',
  'Electronics',
  'Beauty & Personal Care',
  'Food & Dining',
  'Lifestyle',
  'Entertainment',
];

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | 'All'>('All');
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getOffers({ publishedOnly: true });
        setOffers(list);
      } catch (err) {
        console.error('Error fetching offers', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredOffers = offers.filter((offer) => {
    const status = getOfferStatus(offer.startDate, offer.endDate);
    if (activeTab === 'active' && status !== 'active') return false;
    if (activeTab === 'upcoming' && status !== 'upcoming') return false;
    if (selectedCategory !== 'All' && offer.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div>
      <PageHero
        badge="Special Privileges"
        title="Offers, Sales & Exclusive Deals"
        subtitle="OZONE MALL REWARDS"
        description="Experience exceptional savings across leading fashion labels, electronic giants, and culinary destinations at Ozone Mall Ojhar."
        breadcrumbs={[{ label: 'Offers & Promotions' }]}
        imageUrl="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Tab & Filter Bar */}
        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-ivory-100 border border-charcoal-200">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'active'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Active Deals Now
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Upcoming Promos
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-gold-500 text-charcoal-950 font-bold'
                      : 'bg-ivory-100 text-charcoal-700 hover:bg-gold-50 border border-charcoal-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingSpinner message="Checking seasonal promotions..." />
        ) : filteredOffers.length === 0 ? (
          <EmptyState
            title={`No ${activeTab === 'active' ? 'Active' : 'Upcoming'} Offers in This Category`}
            description="There are currently no promotions listed in this category. Check back soon as our stores update their weekend sales regularly."
            actionText="View All Deals"
            onActionClick={() => setSelectedCategory('All')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer) => {
              const isExpanded = expandedOfferId === offer.id;
              const status = getOfferStatus(offer.startDate, offer.endDate);

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Media image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900">
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-full h-full object-cover filter brightness-95"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950 shadow-md">
                          {offer.discountText}
                        </span>
                        {offer.badgeText && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-charcoal-900 text-white shadow-sm">
                            {offer.badgeText}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                            status === 'active'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {status === 'active' ? 'Active Now' : 'Starts Soon'}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-charcoal-500 mb-2">
                        <span className="font-bold text-gold-700 uppercase tracking-widest text-[10px]">
                          {offer.category}
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          <span>
                            {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
                          </span>
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">
                        {offer.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light mb-4">
                        {offer.description}
                      </p>

                      <div className="flex items-center gap-2 p-3 rounded-xl bg-ivory-100 text-xs text-charcoal-700">
                        <Store className="w-4 h-4 text-gold-600 flex-shrink-0" />
                        <span className="font-semibold">{offer.storeName}</span>
                      </div>

                      {/* Expandable Terms */}
                      {offer.terms && (
                        <div className="mt-4 pt-3 border-t border-charcoal-100">
                          <button
                            onClick={() =>
                              setExpandedOfferId(isExpanded ? null : offer.id)
                            }
                            className="flex items-center justify-between w-full text-xs font-semibold text-charcoal-500 hover:text-charcoal-900"
                          >
                            <span className="flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-gold-600" />
                              <span>Terms & Conditions</span>
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isExpanded && (
                            <p className="mt-2 text-[11px] text-charcoal-500 bg-ivory-50 p-3 rounded-lg border border-charcoal-100 leading-relaxed font-light">
                              {offer.terms}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="pt-4 border-t border-charcoal-50 flex items-center justify-between">
                      <Link
                        to="/stores"
                        className="text-xs font-bold uppercase tracking-wider text-charcoal-900 hover:text-gold-600 flex items-center gap-1"
                      >
                        <span>Visit Participating Stores</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
