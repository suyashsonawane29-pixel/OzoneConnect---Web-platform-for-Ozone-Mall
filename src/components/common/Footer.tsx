import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Shield,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-charcoal-950 text-white border-t border-charcoal-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-14 border-b border-charcoal-800">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Logo light size="lg" />
            <p className="text-sm text-charcoal-300 leading-relaxed max-w-sm mt-3">
              The landmark retail, dining, and lifestyle destination of Ojhar, Nashik.
              Featuring 80+ curated brand stores, 4-screen Dolby Atmos cinema, rooftop terrace dining, and vibrant family entertainment.
            </p>

            <div className="pt-2 space-y-2 text-xs text-charcoal-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
                <span>Mumbai-Agra National Highway (NH-3), Ojhar, Nashik, Maharashtra 422206</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>+91 253 278 1000 / +91 98220 54321</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>info@ozonemallojhar.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Mall Hours: 10:00 AM – 10:30 PM (Daily)</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-3 pt-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-charcoal-300 hover:text-gold-400 hover:border-gold-500/50 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Discover Directory */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gold-400 font-sans mb-4">
              Explore Ozone
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-300">
              <li>
                <Link to="/stores" className="hover:text-gold-300 transition-colors">
                  Store Directory
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-gold-300 transition-colors">
                  Offers & Promotions
                </Link>
              </li>
              <li>
                <Link to="/dining" className="hover:text-gold-300 transition-colors">
                  Dining & Restaurants
                </Link>
              </li>
              <li>
                <Link to="/entertainment" className="hover:text-gold-300 transition-colors">
                  Entertainment & Cinema
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-gold-300 transition-colors">
                  Events & Festivals
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-gold-300 transition-colors">
                  Mall Image Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Visitor Guide */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gold-400 font-sans mb-4">
              Visitor Info
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-300">
              <li>
                <Link to="/visitor-information" className="hover:text-gold-300 transition-colors">
                  Hours & Timings
                </Link>
              </li>
              <li>
                <Link to="/visitor-information#parking" className="hover:text-gold-300 transition-colors">
                  Parking & EV Charging
                </Link>
              </li>
              <li>
                <Link to="/visitor-information#accessibility" className="hover:text-gold-300 transition-colors">
                  Accessibility Services
                </Link>
              </li>
              <li>
                <Link to="/visitor-information#faqs" className="hover:text-gold-300 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gold-300 transition-colors">
                  About Ozone Mall
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-300 transition-colors">
                  Contact & Enquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gold-400 font-sans mb-4">
              Exclusive Updates
            </h4>
            <p className="text-xs text-charcoal-300 mb-4 leading-relaxed">
              Subscribe to receive private invitations to fashion showcases, sales, and cultural festivities.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-gold-950/60 border border-gold-600/50 text-gold-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-white placeholder-charcoal-500 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-gold-600 hover:bg-gold-500 text-charcoal-950 text-xs font-bold uppercase transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-400">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-400 gap-4">
          <p>© {new Date().getFullYear()} Ozone Mall, Ojhar, Maharashtra. All rights reserved.</p>

          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-charcoal-200 transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-charcoal-200 transition-colors">
              Contact
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-charcoal-900 hover:bg-charcoal-800 text-gold-400 border border-charcoal-800 hover:border-gold-500/40 transition-colors text-[11px]"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
