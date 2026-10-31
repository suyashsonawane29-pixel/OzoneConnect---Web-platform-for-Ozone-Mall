import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../../components/common/PageHero';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { getEvents } from '../../firebase/services/eventsService';
import { EventItem, EventCategory } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Cultural',
  'Music',
  'Kids',
  'Festival',
  'Fashion',
  'Workshop',
  'Sale & Promo',
];

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All'>('All');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await getEvents({ type: timeFilter, publishedOnly: true });
        setEvents(list);
      } catch (err) {
        console.error('Error fetching events', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [timeFilter]);

  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div>
      <PageHero
        badge="Community & Festivities"
        title="Live Events, Shows & Workshops"
        subtitle="EVENTS CALENDAR"
        description="Celebrate culture, music, fashion, and joy with family and friends at Ozone Mall Ojhar's central atriums and outdoor plaza."
        breadcrumbs={[{ label: 'Events & Experiences' }]}
        imageUrl="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Filter Controls */}
        <div className="bg-white p-6 rounded-2xl border border-charcoal-100 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center p-1 rounded-xl bg-ivory-100 border border-charcoal-200">
              <button
                onClick={() => setTimeFilter('upcoming')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  timeFilter === 'upcoming'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setTimeFilter('past')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  timeFilter === 'past'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Past Highlights
              </button>
            </div>

            {/* Categories */}
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
          <LoadingSpinner message="Checking event schedule..." />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title={`No ${timeFilter === 'upcoming' ? 'Upcoming' : 'Past'} Events in This Category`}
            description="We are constantly planning new cultural showcases and concerts. Please check back shortly or explore another category."
            actionText="View All Events"
            onActionClick={() => setSelectedCategory('All')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/events/${evt.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-charcoal-900">
                    <img
                      src={evt.imageUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950 shadow-md">
                        {evt.category}
                      </span>
                    </div>

                    {evt.isRegistrationOpen && timeFilter === 'upcoming' && (
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500 text-white shadow-sm flex items-center gap-1">
                          <Users className="w-2.5 h-2.5" /> RSVP Open
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-charcoal-400 font-medium mb-2">
                      <Calendar className="w-3.5 h-3.5 text-gold-600" />
                      <span>{formatDate(evt.startDate)}</span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors mb-2">
                      {evt.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-charcoal-600 line-clamp-2 leading-relaxed font-light mb-4">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-charcoal-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                        <span>{evt.timeString}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gold-600 flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-charcoal-50 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-charcoal-900 group-hover:text-gold-600">
                    <span>{evt.isRegistrationOpen ? 'Register / Details' : 'View Highlights'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
