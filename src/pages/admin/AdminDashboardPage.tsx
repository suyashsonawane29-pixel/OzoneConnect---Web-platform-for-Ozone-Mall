import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Tag,
  Calendar,
  Image,
  Mail,
  UtensilsCrossed,
  Film,
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../../firebase/services/statsService';
import { getEnquiries } from '../../firebase/services/enquiriesService';
import { Enquiry } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashStats, enqs] = await Promise.all([
          getDashboardStats(),
          getEnquiries('all'),
        ]);
        setStats(dashStats);
        setRecentEnquiries(enqs.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner fullPage message="Calculating mall website metrics..." />;
  }

  const statCards = [
    {
      label: 'Published Stores',
      value: stats.publishedStores,
      subtext: `${stats.totalStores} Total in Directory`,
      icon: Store,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      link: '/admin/stores',
    },
    {
      label: 'Active Offers',
      value: stats.activeOffers,
      subtext: `${stats.totalOffers} Total Promos`,
      icon: Tag,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      link: '/admin/offers',
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEvents,
      subtext: `${stats.totalEvents} Total Events`,
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      link: '/admin/events',
    },
    {
      label: 'Gallery Media',
      value: stats.totalGalleryImages,
      subtext: 'High-Res Showcase',
      icon: Image,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      link: '/admin/gallery',
    },
    {
      label: 'Unresolved Enquiries',
      value: stats.unresolvedEnquiries,
      subtext: `${stats.newEnquiriesCount} New submissions`,
      icon: Mail,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      link: '/admin/enquiries',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-charcoal-950 text-white p-8 rounded-3xl border border-charcoal-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-bold uppercase tracking-wider mb-3 border border-gold-500/30">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>Website Management Overview</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to Ozone Mall CMS
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-300 font-light leading-relaxed">
            Manage public store directories, current offers, calendar events, dining outlets, photo galleries, and visitor enquiries in real time.
          </p>
        </div>

        {/* Ambient gold glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Database Statistics Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-charcoal-400 mb-4 font-sans">
          Live Database Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                to={card.link}
                className="bg-white p-5 rounded-2xl border border-charcoal-100 shadow-subtle hover:shadow-premium hover:border-gold-300 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl border ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-charcoal-400 group-hover:text-gold-600 transition-colors">
                    Manage →
                  </span>
                </div>
                <div>
                  <p className="font-serif text-3xl font-bold text-charcoal-900 group-hover:text-gold-700 transition-colors">
                    {card.value}
                  </p>
                  <p className="text-xs font-semibold text-charcoal-800 mt-1">{card.label}</p>
                  <p className="text-[11px] text-charcoal-400 mt-0.5">{card.subtext}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle">
        <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-4">
          Quick Content Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/stores"
            className="flex items-center gap-3 p-4 rounded-2xl bg-ivory-100 hover:bg-gold-50 border border-charcoal-200/80 hover:border-gold-300 transition-colors group"
          >
            <PlusCircle className="w-5 h-5 text-gold-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-charcoal-900">Add Store</p>
              <p className="text-[10px] text-charcoal-500">New Brand Boutique</p>
            </div>
          </Link>

          <Link
            to="/admin/offers"
            className="flex items-center gap-3 p-4 rounded-2xl bg-ivory-100 hover:bg-gold-50 border border-charcoal-200/80 hover:border-gold-300 transition-colors group"
          >
            <PlusCircle className="w-5 h-5 text-gold-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-charcoal-900">Post Offer</p>
              <p className="text-[10px] text-charcoal-500">Discounts & Sales</p>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="flex items-center gap-3 p-4 rounded-2xl bg-ivory-100 hover:bg-gold-50 border border-charcoal-200/80 hover:border-gold-300 transition-colors group"
          >
            <PlusCircle className="w-5 h-5 text-gold-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-charcoal-900">Create Event</p>
              <p className="text-[10px] text-charcoal-500">Shows & Festivals</p>
            </div>
          </Link>

          <Link
            to="/admin/gallery"
            className="flex items-center gap-3 p-4 rounded-2xl bg-ivory-100 hover:bg-gold-50 border border-charcoal-200/80 hover:border-gold-300 transition-colors group"
          >
            <PlusCircle className="w-5 h-5 text-gold-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-xs font-bold text-charcoal-900">Upload Media</p>
              <p className="text-[10px] text-charcoal-500">Gallery Photography</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Enquiries Table */}
      <div className="bg-white rounded-3xl border border-charcoal-100 shadow-subtle overflow-hidden">
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-charcoal-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">
              Recent Visitor Inquiries
            </h3>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Contact messages submitted from the public Ozone Mall website
            </p>
          </div>
          <Link
            to="/admin/enquiries"
            className="text-xs font-bold uppercase tracking-wider text-charcoal-900 hover:text-gold-600 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-charcoal-400">
            No visitor enquiries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-500 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3">Visitor</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Message</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-charcoal-900">{enq.name}</p>
                      <p className="text-charcoal-500 text-[11px]">{enq.email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal-800">{enq.subject}</td>
                    <td className="px-6 py-4 text-charcoal-500 max-w-xs truncate">{enq.message}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          enq.status === 'new'
                            ? 'bg-rose-100 text-rose-800'
                            : enq.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {enq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-400 text-[11px]">
                      {formatDate(enq.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/admin/enquiries"
                        className="text-gold-700 hover:text-gold-900 font-bold"
                      >
                        Process
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
