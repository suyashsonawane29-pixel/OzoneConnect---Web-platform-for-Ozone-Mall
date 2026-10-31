import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Utensils,
  Film,
  Calendar,
  Tag,
  MapPin,
  Clock,
  ShieldCheck,
  Wifi,
  Zap,
  HeartHandshake,
  ChevronRight,
} from 'lucide-react';
import { SectionHeading } from '../../components/common/SectionHeading';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getHomepageContent } from '../../firebase/services/contentService';
import { getStores } from '../../firebase/services/storesService';
import { getOffers } from '../../firebase/services/offersService';
import { getEvents } from '../../firebase/services/eventsService';
import { getDiningOutlets } from '../../firebase/services/diningService';
import { getEntertainmentActivities } from '../../firebase/services/entertainmentService';
import { getVisitorInformation } from '../../firebase/services/visitorService';
import {
  HomepageContent,
  Store,
  Offer,
  EventItem,
  DiningOutlet,
  EntertainmentActivity,
  VisitorInformation,
} from '../../types';
import { formatDate } from '../../utils/formatters';

export const HomePage: React.FC = () => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [currentOffers, setCurrentOffers] = useState<Offer[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [diningHighlights, setDiningHighlights] = useState<DiningOutlet[]>([]);
  const [entertainment, setEntertainment] = useState<EntertainmentActivity[]>([]);
  const [visitorInfo, setVisitorInfo] = useState<VisitorInformation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          homeContent,
          storesList,
          offersList,
          eventsList,
          diningList,
          entList,
          vInfo,
        ] = await Promise.all([
          getHomepageContent(),
          getStores({ featuredOnly: true, publishedOnly: true }),
          getOffers({ activeOnly: true, publishedOnly: true, featuredOnly: true }),
          getEvents({ type: 'upcoming', publishedOnly: true, featuredOnly: true }),
          getDiningOutlets({ featuredOnly: true, publishedOnly: true }),
          getEntertainmentActivities({ publishedOnly: true }),
          getVisitorInformation(),
        ]);

        setContent(homeContent);
        setFeaturedStores(storesList.slice(0, 4));
        setCurrentOffers(offersList.slice(0, 3));
        setUpcomingEvents(eventsList.slice(0, 2));
        setDiningHighlights(diningList.slice(0, 3));
        setEntertainment(entList.slice(0, 3));
        setVisitorInfo(vInfo);
      } catch (err) {
        console.error('Failed to load homepage content', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !content) {
    return <LoadingSpinner fullPage message="Welcoming you to Ozone Mall..." />;
  }

  const categories = [
    { name: 'Fashion & Apparel', icon: ShoppingBag, count: '35+ Stores', path: '/stores?category=Fashion' },
    { name: 'Electronics & Tech', icon: Zap, count: '12+ Brands', path: '/stores?category=Electronics' },
    { name: 'Dining & Cafes', icon: Utensils, count: '25+ Outlets', path: '/dining' },
    { name: 'Cineplex & Gaming', icon: Film, count: '4 Screens', path: '/entertainment' },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center bg-charcoal-950 text-white overflow-hidden">
        {/* Background lifestyle image with layered gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={content.heroImageUrl}
            alt="Ozone Mall Ojhar Architecture"
            className="w-full h-full object-cover object-center filter brightness-90 transform scale-105 transition-transform duration-10000 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/60 to-charcoal-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/80 via-transparent to-charcoal-950/40" />
        </div>

        {/* Ambient Gold Halo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-950/80 border border-gold-500/40 text-gold-300 text-xs font-semibold tracking-[0.25em] uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>{content.heroSubtitle}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.15] drop-shadow-sm">
            {content.heroTitle}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-charcoal-200 font-light leading-relaxed mb-10">
            {content.heroDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={content.heroCtaPrimaryLink || '/stores'}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase bg-gold-500 hover:bg-gold-400 text-charcoal-950 transition-all shadow-lg hover:shadow-gold-glow hover:-translate-y-0.5"
            >
              <span>{content.heroCtaPrimaryText || 'Explore Stores'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              to={content.heroCtaSecondaryLink || '/offers'}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md transition-all hover:-translate-y-0.5"
            >
              <span>{content.heroCtaSecondaryText || 'Discover Offers'}</span>
              <Tag className="w-4 h-4 ml-2 text-gold-400" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10 max-w-4xl mx-auto">
            {content.statsSection?.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="font-serif text-2xl sm:text-3xl font-bold text-gold-400">{stat.value}</p>
                <p className="text-xs uppercase tracking-widest text-charcoal-300 mt-1 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Curated Experiences"
          title="Designed for Every Passion"
          description="From high-street trends and flagship technology to artisan culinary delights and 4K cinema."
          linkText="View Directory"
          linkUrl="/stores"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.path}
                className="group p-8 rounded-2xl bg-white border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gold-50 group-hover:bg-gold-500 text-gold-600 group-hover:text-charcoal-950 flex items-center justify-center mb-6 transition-all duration-300 border border-gold-200/40">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-1">{cat.count}</p>
                </div>
                <div className="mt-8 flex items-center text-xs font-semibold uppercase tracking-wider text-charcoal-400 group-hover:text-gold-600 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED STORES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="Brand Spotlight"
          title="Featured Brand Boutiques"
          description="Explore prestigious fashion, electronics, and lifestyle retailers at Ozone Mall Ojhar."
          linkText="All 80+ Stores"
          linkUrl="/stores"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredStores.map((store) => (
            <Link
              key={store.id}
              to={`/stores/${store.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-100">
                <img
                  src={store.coverImageUrl}
                  alt={store.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-charcoal-900 shadow-sm backdrop-blur-sm">
                    {store.floor.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                    {store.category}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors mt-1">
                    {store.name}
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-2 line-clamp-2 leading-relaxed">
                    {store.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-charcoal-50 flex items-center justify-between text-xs font-semibold text-charcoal-400 group-hover:text-gold-600">
                  <span>Unit {store.unitNumber}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. CURRENT OFFERS & PROMOTIONS */}
      {currentOffers.length > 0 && (
        <section className="bg-gradient-to-b from-ivory-200/60 to-ivory-100 py-16 border-y border-charcoal-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              tag="Privileges & Rewards"
              title="Exclusive Offers & Promotions"
              description="Take advantage of limited-time seasonal savings across top brand stores and dining."
              linkText="View All Deals"
              linkUrl="/offers"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gold-200/70 shadow-subtle hover:shadow-premium transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-charcoal-900">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover filter brightness-95 hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950 shadow-md">
                        {offer.discountText}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-charcoal-400 font-medium mb-1">
                        <span>{offer.storeName}</span>
                        <span>Valid till {formatDate(offer.endDate)}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-charcoal-900 mt-1">
                        {offer.title}
                      </h3>
                      <p className="text-xs text-charcoal-600 mt-2 line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between">
                      <Link
                        to="/offers"
                        className="text-xs font-bold uppercase tracking-wider text-charcoal-900 hover:text-gold-600 flex items-center gap-1.5"
                      >
                        <span>View Terms & Stores</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. DINING & ENTERTAINMENT HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-px bg-gold-500"></span>
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
                Gastronomy & Leisure
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-950 mb-4 leading-tight">
              Flavors to Savor & Endless Moments of Wonder
            </h2>
            <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed mb-8">
              Whether you are meeting friends for freshly brewed single-origin coffees, enjoying a family feast on our open-air terrace restaurant, or immersing yourself in 4K Dolby Atmos cinema, Ozone Mall is where Ojhar comes together.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-charcoal-100 shadow-sm">
                <div className="p-3 rounded-lg bg-gold-50 text-gold-700">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-charcoal-900">The Amber Rooftop & Food Court</h4>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Authentic North Indian curries, wood-fired Italian pizzas, street delicacies, and artisan bakeries on Level 3.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-charcoal-100 shadow-sm">
                <div className="p-3 rounded-lg bg-gold-50 text-gold-700">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-charcoal-900">Ozone Cineplex (4 Screens)</h4>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Barco 4K laser projection, immersive 3D surround audio, plush VIP recliners, and gourmet in-seat services.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/dining"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 hover:bg-gold-600 text-white transition-colors"
              >
                <span>Explore Dining</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
              <Link
                to="/entertainment"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white hover:bg-gold-50 text-charcoal-900 border border-charcoal-200 transition-colors"
              >
                <span>Cineplex & Games</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                alt="Dining terrace"
                className="rounded-2xl object-cover h-64 w-full shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80"
                alt="Artisan coffee"
                className="rounded-2xl object-cover h-48 w-full shadow-md"
              />
            </div>
            <div className="space-y-4 pt-8">
              <img
                src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80"
                alt="Cineplex"
                className="rounded-2xl object-cover h-48 w-full shadow-md"
              />
              <img
                src="https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80"
                alt="Bowling lounge"
                className="rounded-2xl object-cover h-64 w-full shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. UPCOMING EVENTS */}
      {upcomingEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            tag="Happenings"
            title="Celebrations & Events"
            description="Live concerts, cultural evenings, weekend workshops, and festive celebrations."
            linkText="All Events"
            linkUrl="/events"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="group bg-white rounded-2xl overflow-hidden border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300 flex flex-col sm:flex-row"
              >
                <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden bg-charcoal-900">
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-100 text-gold-800">
                        {evt.category}
                      </span>
                      <span className="text-xs text-charcoal-400 font-medium">
                        {formatDate(evt.startDate)}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-charcoal-500 mt-2 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-charcoal-50 flex items-center justify-between">
                    <span className="text-xs text-charcoal-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gold-600" />
                      {evt.timeString}
                    </span>
                    <Link
                      to={`/events/${evt.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-charcoal-900 hover:text-gold-600 flex items-center gap-1"
                    >
                      <span>RSVP / Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. VISITOR FACILITIES & AMENITIES */}
      <section className="bg-charcoal-950 text-white py-20 border-y border-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            light
            tag="World-Class Standards"
            title="Every Detail Considered for Your Comfort"
            description="From high-speed EV charging stations to step-free universal accessibility and baby care suites."
            linkText="Visitor Guide"
            linkUrl="/visitor-information"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 hover:border-gold-500/40 transition-colors">
              <Zap className="w-8 h-8 text-gold-400 mb-4" />
              <h4 className="font-serif font-bold text-white text-base">EV Fast Charging</h4>
              <p className="text-xs text-charcoal-300 mt-2 leading-relaxed">
                Dedicated high-voltage charging slots in Basement B1 for electric cars & scooters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 hover:border-gold-500/40 transition-colors">
              <Wifi className="w-8 h-8 text-gold-400 mb-4" />
              <h4 className="font-serif font-bold text-white text-base">High-Speed Wi-Fi</h4>
              <p className="text-xs text-charcoal-300 mt-2 leading-relaxed">
                Seamless internet access across all shopping corridors, restaurants, and atriums.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 hover:border-gold-500/40 transition-colors">
              <HeartHandshake className="w-8 h-8 text-gold-400 mb-4" />
              <h4 className="font-serif font-bold text-white text-base">Universal Accessibility</h4>
              <p className="text-xs text-charcoal-300 mt-2 leading-relaxed">
                Step-free ramps, braille elevators, accessible restrooms, and free wheelchairs.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 hover:border-gold-500/40 transition-colors">
              <ShieldCheck className="w-8 h-8 text-gold-400 mb-4" />
              <h4 className="font-serif font-bold text-white text-base">24/7 Security & Medical</h4>
              <p className="text-xs text-charcoal-300 mt-2 leading-relaxed">
                Round-the-clock CCTV surveillance, trained emergency attendants, and first aid suite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LOCATION & DIRECTIONS */}
      {visitorInfo && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 shadow-premium grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
                  Plan Your Visit
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-950 mt-2 mb-4">
                  Find Us in Ojhar, Nashik
                </h3>
                <p className="text-sm text-charcoal-600 leading-relaxed mb-6">
                  Conveniently situated right on the Mumbai-Agra National Highway (NH-3), Ozone Mall offers effortless connectivity with ample two-level basement parking and dedicated valet services.
                </p>

                <div className="space-y-3 text-xs text-charcoal-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gold-600 mt-0.5 flex-shrink-0" />
                    <span>{visitorInfo.address}, {visitorInfo.city}, Maharashtra {visitorInfo.pincode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span>Mall Hours: {visitorInfo.openingHoursWeekday}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-charcoal-100 flex flex-wrap gap-4">
                <a
                  href={visitorInfo.googleMapsDirectionsUrl || 'https://maps.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 hover:bg-gold-600 text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 mr-2" />
                  <span>Get Driving Directions</span>
                </a>
                <Link
                  to="/visitor-information"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-ivory-100 hover:bg-gold-50 text-charcoal-900 border border-charcoal-200 transition-colors"
                >
                  <span>Parking & Transport Details</span>
                </Link>
              </div>
            </div>

            {/* Embedded Interactive Map */}
            <div className="min-h-[320px] bg-charcoal-100 relative">
              <iframe
                title="Ozone Mall Location"
                src={visitorInfo.googleMapsEmbedUrl}
                className="w-full h-full min-h-[350px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
