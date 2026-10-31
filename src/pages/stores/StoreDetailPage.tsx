import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Tag,
  ArrowLeft,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getStoreBySlug, getStores } from '../../firebase/services/storesService';
import { getOffers } from '../../firebase/services/offersService';
import { Store, Offer } from '../../types';

export const StoreDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [relatedStores, setRelatedStores] = useState<Store[]>([]);
  const [storeOffers, setStoreOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await getStoreBySlug(slug);
        if (found) {
          setStore(found);
          const [allSameCat, offers] = await Promise.all([
            getStores({ category: found.category, publishedOnly: true }),
            getOffers({ storeId: found.id, activeOnly: true, publishedOnly: true }),
          ]);
          setRelatedStores(allSameCat.filter((s) => s.id !== found.id).slice(0, 3));
          setStoreOffers(offers);
        }
      } catch (err) {
        console.error('Failed to load store detail', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${store?.name} at Ozone Mall Ojhar`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading store details..." />;
  }

  if (!store) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900 mb-4">Store Not Found</h2>
        <p className="text-sm text-charcoal-500 mb-8">
          The requested store could not be located in our directory. It may have moved or been updated.
        </p>
        <Link
          to="/stores"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 text-white hover:bg-gold-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Stores Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Hero Cover Banner */}
      <div className="relative h-72 sm:h-96 w-full bg-charcoal-950 overflow-hidden">
        <img
          src={store.coverImageUrl}
          alt={store.name}
          className="w-full h-full object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/stores"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-medium backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Stores</span>
          </Link>
        </div>

        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8 max-w-7xl mx-auto flex items-end justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white p-2 shadow-2xl border border-charcoal-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={store.logoUrl}
                alt={`${store.name} logo`}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950">
                  {store.category}
                </span>
                {store.isFeatured && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gold-300">
                    <Sparkles className="w-3 h-3 text-gold-400" /> Featured Boutique
                  </span>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {store.name}
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-300 mt-1">
                {store.floor} • Unit {store.unitNumber}
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-colors border border-white/20"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-gold-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        <Breadcrumbs
          items={[
            { label: 'Stores Directory', path: '/stores' },
            { label: store.category, path: `/stores?category=${encodeURIComponent(store.category)}` },
            { label: store.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Description & Offers */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-charcoal-100 shadow-subtle">
              <h2 className="font-serif text-2xl font-bold text-charcoal-900 mb-4">
                About {store.name}
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed font-light mb-6 whitespace-pre-line">
                {store.description}
              </p>

              {store.tags && store.tags.length > 0 && (
                <div className="pt-6 border-t border-charcoal-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-3">
                    Categories & Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {store.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs bg-ivory-100 text-charcoal-700 border border-charcoal-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Offers for this Store */}
            {storeOffers.length > 0 && (
              <div className="bg-gradient-to-br from-gold-50/80 to-ivory-100 p-8 rounded-3xl border border-gold-300 shadow-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-gold-600" />
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">
                    Active Offers at this Store
                  </h3>
                </div>

                <div className="space-y-4">
                  {storeOffers.map((off) => (
                    <div
                      key={off.id}
                      className="p-5 rounded-2xl bg-white border border-gold-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div>
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {off.discountText}
                        </span>
                        <h4 className="font-serif font-bold text-charcoal-900 text-base mt-1">
                          {off.title}
                        </h4>
                        <p className="text-xs text-charcoal-600 mt-1">{off.description}</p>
                      </div>
                      <Link
                        to="/offers"
                        className="px-4 py-2 rounded-full text-xs font-bold uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors whitespace-nowrap"
                      >
                        View Deal
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Location & Contacts */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
              <h3 className="font-serif text-lg font-bold text-charcoal-900 pb-3 border-b border-charcoal-100">
                Store Information
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">{store.floor}</p>
                    <p className="text-charcoal-500">Unit No: {store.unitNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">Operating Hours</p>
                    <p className="text-charcoal-500">{store.openingHours}</p>
                  </div>
                </div>

                {store.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-charcoal-900">Direct Phone</p>
                      <a
                        href={`tel:${store.phone}`}
                        className="text-gold-700 hover:underline font-medium"
                      >
                        {store.phone}
                      </a>
                    </div>
                  </div>
                )}

                {store.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-charcoal-900">Customer Support</p>
                      <a
                        href={`mailto:${store.email}`}
                        className="text-gold-700 hover:underline truncate block"
                      >
                        {store.email}
                      </a>
                    </div>
                  </div>
                )}

                {store.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-charcoal-900">Official Brand Site</p>
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gold-700 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Visit Website</span>
                        <Globe className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-charcoal-100">
                <Link
                  to="/visitor-information"
                  className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-ivory-100 hover:bg-gold-50 text-charcoal-800 text-xs font-semibold uppercase tracking-wider border border-charcoal-200 transition-colors"
                >
                  Mall Map & Directions
                </Link>
              </div>
            </div>

            {/* Similar stores */}
            {relatedStores.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-charcoal-100 shadow-subtle">
                <h4 className="font-serif text-sm font-bold text-charcoal-900 mb-4">
                  More in {store.category}
                </h4>
                <div className="space-y-3">
                  {relatedStores.map((rel) => (
                    <Link
                      key={rel.id}
                      to={`/stores/${rel.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-ivory-100 transition-colors group"
                    >
                      <img
                        src={rel.logoUrl}
                        alt={rel.name}
                        className="w-10 h-10 rounded-lg object-cover border border-charcoal-200"
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-charcoal-900 group-hover:text-gold-700 truncate">
                          {rel.name}
                        </p>
                        <p className="text-[11px] text-charcoal-500">{rel.floor.split(' ')[0]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
