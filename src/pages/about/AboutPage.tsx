import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHero } from '../../components/common/PageHero';
import { SectionHeading } from '../../components/common/SectionHeading';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getAboutPageContent } from '../../firebase/services/contentService';
import { getVisitorInformation } from '../../firebase/services/visitorService';
import { AboutPageContent, VisitorInformation } from '../../types';
import { CheckCircle2, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [content, setContent] = useState<AboutPageContent | null>(null);
  const [visitorInfo, setVisitorInfo] = useState<VisitorInformation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [aboutData, vData] = await Promise.all([
          getAboutPageContent(),
          getVisitorInformation(),
        ]);
        setContent(aboutData);
        setVisitorInfo(vData);
      } catch (err) {
        console.error('Failed to load about page', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !content) {
    return <LoadingSpinner fullPage message="Loading Ozone Mall story..." />;
  }

  return (
    <div>
      <PageHero
        badge="About Ozone Mall"
        title="Ojhar's Premier Retail & Lifestyle Destination"
        subtitle="OUR STORY & HERITAGE"
        description="Crafted to bring luxury fashion, gourmet dining, and premier family entertainment to the heart of Northern Maharashtra."
        breadcrumbs={[{ label: 'About Ozone Mall' }]}
        imageUrl={content.bannerImageUrl}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20 sm:space-y-28">
        {/* 1. Main Narrative & Image */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-gold-500"></span>
              <span className="text-[11px] font-bold tracking-[0.25em] text-gold-600 uppercase font-sans">
                The Ozone Experience
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-950 leading-tight">
              {content.mainTitle}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-charcoal-600 font-light leading-relaxed">
              {content.storyParagraphs?.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-charcoal-100">
              <img
                src={content.bannerImageUrl}
                alt="Ozone Mall interior architecture"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-charcoal-950 text-white p-6 rounded-2xl shadow-xl max-w-xs border border-charcoal-800 hidden sm:block">
              <p className="font-serif text-2xl font-bold text-gold-400">80+ Brands</p>
              <p className="text-xs text-charcoal-300 mt-1">
                Fashion, electronics, dining, and family entertainment under one roof.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Vision & Commitment */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-charcoal-100 shadow-subtle flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                Our Future
              </span>
              <h3 className="font-serif text-2xl font-bold text-charcoal-950 mt-1 mb-4">
                {content.visionTitle}
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed font-light">
                {content.visionText}
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-charcoal-950 text-white border border-charcoal-900 shadow-subtle flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-gold-400 font-sans">
                Our Promise
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1 mb-4">
                {content.missionTitle}
              </h3>
              <p className="text-sm text-charcoal-300 leading-relaxed font-light">
                {content.missionText}
              </p>
            </div>
          </div>
        </section>

        {/* 3. Key Pillars & Features */}
        <section>
          <SectionHeading
            align="center"
            tag="Core Highlights"
            title="The Hallmarks of Ozone Mall"
            description="Built to the highest modern architectural, safety, and hospitality specifications."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.features?.map((feat, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-charcoal-100 hover:border-gold-300 hover:shadow-premium transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center text-gold-600 mb-4 border border-gold-200">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-charcoal-900 text-lg mb-2">
                  {feat.title}
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Location & Contact Summary */}
        {visitorInfo && (
          <section className="bg-ivory-200/60 p-8 sm:p-12 rounded-3xl border border-charcoal-200/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                  Connect With Us
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal-950 mt-1 mb-3">
                  Visit or Inquire Today
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-6">
                  Our customer service team is always available to help with store inquiries, event bookings, and lost & found assistance.
                </p>

                <div className="space-y-2.5 text-xs text-charcoal-700">
                  <p className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span>{visitorInfo.address}, {visitorInfo.city}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span>{visitorInfo.phone}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span>{visitorInfo.email}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-gold-600 flex-shrink-0" />
                    <span>Daily: {visitorInfo.openingHoursWeekday}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link
                  to="/visitor-information"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
                >
                  <span>Visitor Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-white text-charcoal-900 border border-charcoal-200 hover:bg-gold-50 transition-colors"
                >
                  <span>Contact Us</span>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
