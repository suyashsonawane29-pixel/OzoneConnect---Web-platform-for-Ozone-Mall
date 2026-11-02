import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  Heart,
  Calendar,
  User,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  Award,
  CreditCard,
  QrCode,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Trash2,
  Coffee,
  Car,
  Gift,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Store, EventRegistration } from '../../types';
import { getStores } from '../../firebase/services/storesService';
import { getRegistrationsByEmail } from '../../firebase/services/eventRegistrationsService';
import { Logo } from '../../components/common/Logo';

export const UserProfilePage: React.FC = () => {
  const { currentUser, isAuthenticated, logout, updateProfileData, toggleFavoriteStore, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'card' | 'favorites' | 'events' | 'edit'>('card');
  const [favoriteStoresList, setFavoriteStoresList] = useState<Store[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(currentUser?.displayName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?from=/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.displayName || '');
      setEditPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Load favorite stores
  useEffect(() => {
    if (!currentUser?.favoriteStores || currentUser.favoriteStores.length === 0) {
      setFavoriteStoresList([]);
      return;
    }

    const loadFavorites = async () => {
      setIsLoadingFavorites(true);
      try {
        const allStores = await getStores({ publishedOnly: true });
        const filtered = allStores.filter((s) => currentUser.favoriteStores?.includes(s.id));
        setFavoriteStoresList(filtered);
      } catch (err) {
        console.error('Failed to load favorite stores', err);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, [currentUser?.favoriteStores]);

  // Load user registrations
  useEffect(() => {
    if (!currentUser?.email) return;

    const loadRegistrations = async () => {
      setIsLoadingEvents(true);
      try {
        const regs = await getRegistrationsByEmail(currentUser.email);
        setEventRegistrations(regs);
      } catch (err) {
        console.error('Failed to load user registrations', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadRegistrations();
  }, [currentUser?.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfileData({
        displayName: editName.trim(),
        phone: editPhone.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-charcoal-600">Loading your Privilege profile...</p>
        </div>
      </div>
    );
  }

  const tier = currentUser.membershipTier || 'Gold';
  const tierColor =
    tier === 'Platinum'
      ? 'from-charcoal-900 via-slate-800 to-charcoal-950 text-white border-slate-400/30'
      : tier === 'Gold'
      ? 'from-amber-950 via-charcoal-900 to-charcoal-950 text-gold-200 border-gold-500/40'
      : 'from-slate-800 via-charcoal-900 to-charcoal-950 text-gray-200 border-gray-400/30';

  const memberSinceFormatted = currentUser.memberSince
    ? new Date(currentUser.memberSince).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  const userMembershipNumber = `OZ-${currentUser.uid.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-ivory-100/60 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <nav className="flex items-center gap-2 text-xs text-charcoal-400 mb-1">
              <Link to="/" className="hover:text-gold-700 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-charcoal-700 font-medium">Privilege Club</span>
              <span>/</span>
              <span className="text-gold-800 font-semibold">My Account</span>
            </nav>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight flex items-center gap-3">
              <span>{currentUser.displayName}</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold-100 text-gold-800 border border-gold-300">
                <Crown className="w-3.5 h-3.5 text-gold-600" />
                {tier} Member
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-charcoal-900 text-gold-300 hover:bg-black transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Website CMS Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-600 bg-white border border-charcoal-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Digital Member Pass */}
          <div className="lg:col-span-5 space-y-6">
            {/* The Luxury Pass Card */}
            <div
              className={`relative rounded-3xl p-7 bg-gradient-to-br ${tierColor} border shadow-2xl overflow-hidden`}
            >
              {/* Background ambient lighting */}
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Card Header */}
              <div className="flex items-start justify-between relative z-10 mb-8">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                    <span className="text-[10px] tracking-widest uppercase font-bold text-gold-400">
                      Ozone Privilege Club
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wider mt-1">
                    OZONE MALL • OJHAR
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-400/40 flex items-center justify-center backdrop-blur-sm">
                  <Crown className="w-5 h-5 text-gold-400" />
                </div>
              </div>

              {/* Card Chip & Contactless */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-amber-300 to-amber-100 border border-amber-400/60 shadow-inner flex items-center justify-center">
                  <div className="w-7 h-5 border border-amber-600/40 rounded flex flex-col justify-around py-0.5">
                    <div className="w-full h-px bg-amber-600/40" />
                    <div className="w-full h-px bg-amber-600/40" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-charcoal-300">
                    Tier Status
                  </div>
                  <div className="text-sm font-bold text-gold-300 flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                    {tier} Member
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="space-y-4 relative z-10">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-charcoal-400">
                    Cardholder
                  </div>
                  <div className="font-serif text-base font-semibold text-white tracking-wide truncate">
                    {currentUser.displayName}
                  </div>
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-white/10">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-charcoal-400">
                      Member ID
                    </div>
                    <div className="font-mono text-xs font-semibold text-gold-300 tracking-wider">
                      {userMembershipNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-charcoal-400 text-right">
                      Member Since
                    </div>
                    <div className="font-mono text-xs text-charcoal-300 text-right">
                      {memberSinceFormatted}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Points Counter Card */}
            <div className="bg-white rounded-2xl p-6 border border-charcoal-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">
                      Rewards Balance
                    </h4>
                    <p className="text-xs text-charcoal-500">1 Point = ₹1.00 at participating outlets</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="bg-ivory-50 rounded-xl p-4 border border-charcoal-100 mb-4 flex items-baseline justify-between">
                <div>
                  <span className="font-serif text-3xl font-extrabold text-charcoal-900 tracking-tight">
                    {(currentUser.points || 500).toLocaleString('en-IN')}
                  </span>
                  <span className="ml-2 text-xs font-medium text-gold-700 uppercase tracking-wider">
                    Privilege Points
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-charcoal-500">Value Approx.</span>
                  <div className="text-sm font-bold text-charcoal-800">
                    ₹{(currentUser.points || 500).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-charcoal-600 bg-gold-50/50 p-3 rounded-lg border border-gold-100">
                <Sparkles className="w-4 h-4 text-gold-600 flex-shrink-0" />
                <span>Show your digital card QR code at billing counters to earn & redeem points.</span>
              </div>
            </div>

            {/* Tier Exclusive Privileges */}
            <div className="bg-white rounded-2xl p-6 border border-charcoal-100 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-600" />
                Your {tier} Privileges
              </h4>

              <ul className="space-y-3 text-xs text-charcoal-700">
                <li className="flex items-start gap-2.5">
                  <Car className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>Complimentary 2-hour VIP parking validation on weekend visits.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Coffee className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>Access to Level 2 Privilege Members Lounge with complimentary beverages.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Gift className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>Double points on dining and fashion purchases during your birthday month.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <span>Exclusive early invitations to seasonal collections and mall events.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Tabs & Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tabs Header */}
            <div className="bg-white rounded-2xl p-1.5 border border-charcoal-100 shadow-sm flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('card')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'card'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-gold-400" />
                Pass Details
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'favorites'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-gold-400" />
                Saved Stores ({currentUser.favoriteStores?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'events'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                Event RSVPs ({eventRegistrations.length})
              </button>

              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'edit'
                    ? 'bg-charcoal-900 text-white shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-ivory-100'
                }`}
              >
                <User className="w-3.5 h-3.5 text-gold-400" />
                Edit Profile
              </button>
            </div>

            {/* TAB 1: Pass Details / QR Scanner */}
            {activeTab === 'card' && (
              <div className="bg-white rounded-3xl p-7 border border-charcoal-100 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
                    Contactless Digital Member QR
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Scan this code at Ozone Mall checkout desks to earn points and claim member privileges.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-ivory-50 rounded-2xl border border-charcoal-100">
                  {/* Mock QR Code Graphic */}
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl border-2 border-charcoal-900 flex flex-col items-center justify-center shadow-md relative">
                    <QrCode className="w-28 h-28 text-charcoal-950" />
                    <span className="font-mono text-[9px] text-charcoal-500 font-bold tracking-widest mt-1">
                      {userMembershipNumber}
                    </span>
                  </div>

                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                        Quick Instructions
                      </span>
                      <h4 className="text-sm font-bold text-charcoal-900">Instant Store Validation</h4>
                      <p className="text-xs text-charcoal-600 mt-1">
                        Present this screen to the cashier before payment. Points will be automatically credited to your member account within 10 minutes.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-charcoal-200/60 flex flex-wrap gap-2 text-[11px] text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validated
                      </span>
                      <span>•</span>
                      <span>Card No: {userMembershipNumber}</span>
                      <span>•</span>
                      <span>Status: Active</span>
                    </div>
                  </div>
                </div>

                {/* Profile Snapshot Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-ivory-50/60 border border-charcoal-100">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400">Registered Email</span>
                    <div className="text-sm font-semibold text-charcoal-900 truncate mt-0.5">
                      {currentUser.email}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-ivory-50/60 border border-charcoal-100">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400">Contact Number</span>
                    <div className="text-sm font-semibold text-charcoal-900 truncate mt-0.5">
                      {currentUser.phone || 'Not provided'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-ivory-50/60 border border-charcoal-100">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400">Account Role</span>
                    <div className="text-sm font-semibold text-charcoal-900 capitalize mt-0.5">
                      {currentUser.role} {currentUser.role === 'admin' ? '(Admin Access)' : ''}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-ivory-50/60 border border-charcoal-100">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400">Preferred Location</span>
                    <div className="text-sm font-semibold text-charcoal-900 mt-0.5">
                      Ozone Mall, Ojhar, Nashik
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    to="/stores"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
                  >
                    Explore Stores
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/offers"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-ivory-100 text-charcoal-800 hover:bg-gold-50 hover:text-gold-800 border border-charcoal-200 transition-colors"
                  >
                    View Active Offers
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: Saved Stores */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-3xl p-7 border border-charcoal-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
                      My Saved Boutiques & Stores
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Quick access to directory listings, floor locations, and current promotions for your bookmarked brands.
                    </p>
                  </div>
                  <Link
                    to="/stores"
                    className="text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center gap-1"
                  >
                    Browse All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {isLoadingFavorites ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-charcoal-500 text-xs">
                    <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading saved stores...</span>
                  </div>
                ) : favoriteStoresList.length === 0 ? (
                  <div className="py-16 text-center bg-ivory-50/60 rounded-2xl border border-dashed border-charcoal-200 p-8">
                    <Heart className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <h4 className="font-serif text-base font-bold text-charcoal-800 mb-1">
                      No Saved Stores Yet
                    </h4>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-5">
                      Explore our premium retail collection and tap the bookmark heart icon on any store to save it here for fast reference.
                    </p>
                    <Link
                      to="/stores"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
                    >
                      Browse Store Directory
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteStoresList.map((store) => (
                      <div
                        key={store.id}
                        className="bg-ivory-50 rounded-2xl p-4 border border-charcoal-100 hover:border-gold-300 transition-all flex flex-col justify-between group"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={store.logoUrl || store.coverImageUrl}
                            alt={store.name}
                            className="w-14 h-14 rounded-xl object-cover bg-white border border-charcoal-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700">
                              {store.category}
                            </span>
                            <h4 className="font-serif font-bold text-charcoal-900 text-sm truncate group-hover:text-gold-800 transition-colors">
                              {store.name}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mt-1">
                              <MapPin className="w-3 h-3 text-gold-600" />
                              <span className="truncate">{store.floor} • Unit {store.unitNumber}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-charcoal-200/60 flex items-center justify-between">
                          <Link
                            to={`/stores/${store.slug}`}
                            className="text-xs font-semibold text-charcoal-800 hover:text-gold-700 flex items-center gap-1"
                          >
                            View Details <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => toggleFavoriteStore(store.id)}
                            className="text-xs text-charcoal-400 hover:text-red-500 transition-colors p-1"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Event Registrations */}
            {activeTab === 'events' && (
              <div className="bg-white rounded-3xl p-7 border border-charcoal-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
                      My Event RSVPs & Passes
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Confirmed tickets and RSVPs for upcoming mall exhibitions, launches, and celebrations.
                    </p>
                  </div>
                  <Link
                    to="/events"
                    className="text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center gap-1"
                  >
                    View All Events <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {isLoadingEvents ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-charcoal-500 text-xs">
                    <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading event reservations...</span>
                  </div>
                ) : eventRegistrations.length === 0 ? (
                  <div className="py-16 text-center bg-ivory-50/60 rounded-2xl border border-dashed border-charcoal-200 p-8">
                    <Calendar className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <h4 className="font-serif text-base font-bold text-charcoal-800 mb-1">
                      No Event Registrations Found
                    </h4>
                    <p className="text-xs text-charcoal-500 max-w-sm mx-auto mb-5">
                      Join us for live music, shopping festivals, and weekend artisan showcases. Secure your spot in just a click.
                    </p>
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm"
                    >
                      Discover Upcoming Events
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {eventRegistrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-ivory-50 rounded-2xl p-5 border border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {reg.status}
                            </span>
                            <span className="text-xs text-charcoal-400">
                              Registered on {new Date(reg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-charcoal-900 text-base">
                            {reg.eventTitle}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-charcoal-600">
                            <span>Guests: {reg.numberOfGuests}</span>
                            <span>•</span>
                            <span>Name: {reg.fullName}</span>
                          </div>
                        </div>

                        <Link
                          to={`/events/${reg.eventId}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase bg-white border border-charcoal-200 hover:bg-gold-50 hover:text-gold-800 transition-colors"
                        >
                          Event Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Edit Profile Details */}
            {activeTab === 'edit' && (
              <div className="bg-white rounded-3xl p-7 border border-charcoal-100 shadow-sm space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-1">
                    Personal Information & Preferences
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Update your account details to receive personalized boutique notifications and concierge offers.
                  </p>
                </div>

                {saveSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-800 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Your profile information has been successfully updated.</span>
                  </div>
                )}

                {saveError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs text-red-800 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        placeholder="e.g. Aarav Deshmukh"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Email Address (Read-only)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <input
                        type="email"
                        value={currentUser.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-500 bg-charcoal-50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-charcoal-400 mt-1">
                      Email address is linked to your authentication identity.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all"
                        placeholder="e.g. +91 98220 12345"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase bg-charcoal-900 text-white hover:bg-gold-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Profile</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
