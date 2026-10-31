import React, { useEffect, useState } from 'react';
import { PageHero } from '../../components/common/PageHero';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { getEntertainmentActivities } from '../../firebase/services/entertainmentService';
import { EntertainmentActivity } from '../../types';
import { Film, Gamepad2, Ticket, MapPin, Clock, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const EntertainmentPage: React.FC = () => {
  const [activities, setActivities] = useState<EntertainmentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getEntertainmentActivities({ publishedOnly: true });
        setActivities(list);
      } catch (err) {
        console.error('Failed to load entertainment activities', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <PageHero
        badge="Cinema & Recreation"
        title="Entertainment, Cineplex & Leisure"
        subtitle="ENDLESS FAMILY THRILLS"
        description="Experience 4K Dolby Atmos cinema, state-of-the-art cosmic UV bowling, 360-degree virtual reality rides, and safe toddler play parks at Ozone Mall Ojhar."
        breadcrumbs={[{ label: 'Entertainment & Cineplex' }]}
        imageUrl="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {loading ? (
          <LoadingSpinner message="Setting up the entertainment arena..." />
        ) : activities.length === 0 ? (
          <EmptyState
            title="Entertainment Updates Coming Soon"
            description="Our cinema and gaming lounges are updating their seasonal schedule."
          />
        ) : (
          <div className="space-y-12">
            {activities.map((act, idx) => (
              <div
                key={act.id}
                className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 grid grid-cols-1 lg:grid-cols-12"
              >
                {/* Media left column */}
                <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto min-h-[300px] overflow-hidden bg-charcoal-950">
                  <img
                    src={act.coverImageUrl}
                    alt={act.title}
                    className="w-full h-full object-cover filter brightness-95"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950 shadow-md">
                      {act.type}
                    </span>
                  </div>
                </div>

                {/* Info right column */}
                <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-px bg-gold-500"></span>
                      <span className="text-[10px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
                        Level {act.floor.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-950 mb-3">
                      {act.title}
                    </h3>

                    <p className="text-sm text-charcoal-600 font-light leading-relaxed mb-6">
                      {act.description}
                    </p>

                    {/* Features list */}
                    {act.features && act.features.length > 0 && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {act.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-charcoal-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Foot bar */}
                  <div className="pt-6 border-t border-charcoal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs text-charcoal-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        <span className="font-semibold text-charcoal-800">
                          {act.floor} • Unit {act.unitNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span>Timings: {act.openingHours}</span>
                      </div>
                      {act.priceRange && (
                        <div className="flex items-center gap-2 text-gold-800 font-medium">
                          <Ticket className="w-3.5 h-3.5 text-gold-600" />
                          <span>Pricing: {act.priceRange}</span>
                        </div>
                      )}
                    </div>

                    {act.bookingUrl && (
                      <a
                        href={act.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 hover:bg-gold-600 text-white transition-colors shadow-sm"
                      >
                        <span>Book Tickets Online</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-2" />
                      </a>
                    )}
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
