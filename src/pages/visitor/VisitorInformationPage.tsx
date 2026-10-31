import React, { useEffect, useState } from 'react';
import { PageHero } from '../../components/common/PageHero';
import { SectionHeading } from '../../components/common/SectionHeading';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getVisitorInformation } from '../../firebase/services/visitorService';
import { getFaqs } from '../../firebase/services/faqsService';
import { VisitorInformation, FAQ } from '../../types';
import {
  MapPin,
  Clock,
  Car,
  Bus,
  Accessibility,
  Wifi,
  Zap,
  HeartHandshake,
  Sun,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Wifi,
  Zap,
  Accessibility,
  HeartHandshake,
  Sun,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  Car,
  Clock,
};

export const VisitorInformationPage: React.FC = () => {
  const [visitorInfo, setVisitorInfo] = useState<VisitorInformation | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [vData, fData] = await Promise.all([
          getVisitorInformation(),
          getFaqs({ publishedOnly: true }),
        ]);
        setVisitorInfo(vData);
        setFaqs(fData);
      } catch (err) {
        console.error('Failed to load visitor information', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !visitorInfo) {
    return <LoadingSpinner fullPage message="Preparing visitor guide..." />;
  }

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="pb-24 space-y-16 sm:space-y-24">
      <PageHero
        badge="Visitor Guide"
        title="Hours, Directions & Mall Amenities"
        subtitle="PLAN YOUR VISIT"
        description="Everything you need to know for a seamless visit to Ozone Mall Ojhar: timings, parking, EV charging, amenities, accessibility, and answers to common questions."
        breadcrumbs={[{ label: 'Visitor Information' }]}
        imageUrl="https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* 1. Operating Hours & Address Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white border border-charcoal-100 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-4 border border-gold-200">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Operating Hours</h3>
              <p className="text-xs text-charcoal-500 mb-4">Retail stores, hypermarket & dining</p>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-bold text-charcoal-900">Monday – Friday</p>
                  <p className="text-charcoal-600">{visitorInfo.openingHoursWeekday}</p>
                </div>
                <div className="pt-2 border-t border-charcoal-100">
                  <p className="font-bold text-charcoal-900">Saturday – Sunday</p>
                  <p className="text-charcoal-600">{visitorInfo.openingHoursWeekend}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-charcoal-100 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-4 border border-gold-200">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Location & Address</h3>
              <p className="text-xs text-charcoal-500 mb-4">Highway accessibility in Ojhar</p>

              <div className="text-xs text-charcoal-700 leading-relaxed space-y-1">
                <p className="font-bold text-charcoal-900">Ozone Mall</p>
                <p>{visitorInfo.address}</p>
                <p>{visitorInfo.city}, {visitorInfo.state} {visitorInfo.pincode}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-charcoal-100">
              <a
                href={visitorInfo.googleMapsDirectionsUrl || 'https://maps.google.com'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-gold-700 hover:text-gold-900 flex items-center gap-1.5"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-charcoal-100 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-4 border border-gold-200">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Helpline & Support</h3>
              <p className="text-xs text-charcoal-500 mb-4">Customer care & desk assistance</p>

              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-bold text-charcoal-900">Phone</p>
                  <p className="text-charcoal-600">{visitorInfo.phone}</p>
                </div>
                <div className="pt-2 border-t border-charcoal-100">
                  <p className="font-bold text-charcoal-900">Email Inquiries</p>
                  <p className="text-charcoal-600">{visitorInfo.email}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Map & Highway Access */}
        <section className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 shadow-premium grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                Directions
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal-900 mt-1 mb-4">
                How to Reach Ozone Mall
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed mb-6">
                Situated prominently on the Mumbai-Agra Highway (NH-3), Ozone Mall is a mere 18 kilometers from Nashik City center and within minutes of HAL Ojhar Airport.
              </p>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-ivory-100 border border-charcoal-200">
                  <Car className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">By Private Vehicle & Cabs</p>
                    <p className="text-charcoal-600 mt-0.5">
                      Direct access from NH-3 with dedicated slip lanes leading into our underground parking gates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-ivory-100 border border-charcoal-200">
                  <Bus className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">By Public Transport</p>
                    <p className="text-charcoal-600 mt-0.5">
                      {visitorInfo.publicTransportInfo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-charcoal-100">
              <a
                href={visitorInfo.googleMapsDirectionsUrl || 'https://maps.google.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-charcoal-900 hover:bg-gold-600 text-white transition-colors"
              >
                <span>Navigate to Ozone Mall</span>
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 min-h-[360px] bg-charcoal-100">
            <iframe
              title="Ozone Mall Google Map"
              src={visitorInfo.googleMapsEmbedUrl}
              className="w-full h-full min-h-[400px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* 3. Parking & Accessibility Details */}
        <section id="parking" className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-charcoal-100 shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-6 border border-gold-200">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-3">
              Parking & EV Charging
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed mb-6">
              {visitorInfo.parkingInfo}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-700">
              <Zap className="w-4 h-4" />
              <span>Tata Power High-Voltage Fast Chargers on B1</span>
            </div>
          </div>

          <div id="accessibility" className="p-8 sm:p-10 rounded-3xl bg-white border border-charcoal-100 shadow-subtle">
            <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center mb-6 border border-gold-200">
              <Accessibility className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal-900 mb-3">
              Universal Accessibility
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed mb-6">
              {visitorInfo.accessibilityInfo}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-gold-700">
              <HeartHandshake className="w-4 h-4" />
              <span>Complimentary loan wheelchairs at Information Desk</span>
            </div>
          </div>
        </section>

        {/* 4. Amenities Grid */}
        <section>
          <SectionHeading
            align="center"
            tag="Convenience & Care"
            title="Comprehensive Visitor Amenities"
            description="Designed to offer a relaxing, comfortable visit for families, shoppers, and travellers."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visitorInfo.amenities?.map((amenity, idx) => {
              const IconComponent = ICON_MAP[amenity.icon] || HelpCircle;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center mb-4 border border-gold-200/50">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-charcoal-900 text-base mb-1">
                    {amenity.title}
                  </h4>
                  <p className="text-xs text-charcoal-500 font-light leading-relaxed">
                    {amenity.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. FAQs Accordion */}
        {faqs.length > 0 && (
          <section id="faqs" className="max-w-4xl mx-auto">
            <SectionHeading
              align="center"
              tag="Frequently Asked Questions"
              title="Everything You Need to Know"
              description="Quick answers about visiting Ozone Mall, Cineplex timings, registrations, and policies."
            />

            <div className="space-y-4">
              {faqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-ivory-50 transition-colors"
                    >
                      <span className="font-serif font-bold text-charcoal-900 text-base sm:text-lg">
                        {faq.question}
                      </span>
                      <div className="p-2 rounded-full bg-ivory-100 text-charcoal-500 flex-shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed border-t border-charcoal-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
