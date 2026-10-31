import React, { useState } from 'react';
import { isFirebaseConfigured, db } from '../../firebase/config';
import { seedFirestoreDatabase } from '../../firebase/seed/seedDatabase';
import {
  ShieldCheck,
  Database,
  RefreshCw,
  Server,
  Key,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      if (isFirebaseConfigured && db) {
        const res = await seedFirestoreDatabase(db);
        setSeedResult(`Cloud Firestore: ${res.message}`);
      } else {
        localStorage.clear();
        setSeedResult('Local cache successfully reset and re-seeded with realistic Ozone Mall Ojhar directory records.');
        window.location.reload();
      }
    } catch (err: any) {
      setSeedResult(`Seeding error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
          Website Settings & Backend Architecture
        </h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Review Firebase connection status, database seeding tools, and security rules.
        </p>
      </div>

      {/* 1. Connection Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isFirebaseConfigured
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">
                Firebase Backend Status
              </h3>
              <p className="text-xs text-charcoal-500">
                {isFirebaseConfigured
                  ? 'Active Production Cloud Firestore & Firebase Auth Connection'
                  : 'Local Resilient Development Database Active'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isFirebaseConfigured
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {isFirebaseConfigured ? 'Connected' : 'Offline / Demo Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200/80 space-y-1">
            <p className="text-charcoal-400 font-bold uppercase text-[10px]">Cloud Firestore</p>
            <p className="font-bold text-charcoal-900">
              {isFirebaseConfigured ? 'Connected to Project' : 'In-Memory / LocalStorage Layer'}
            </p>
            <p className="text-charcoal-500 text-[11px]">
              Stores, Offers, Events, Dining, Gallery, FAQs, Inquiries
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-ivory-100 border border-charcoal-200/80 space-y-1">
            <p className="text-charcoal-400 font-bold uppercase text-[10px]">Authentication</p>
            <p className="font-bold text-charcoal-900">
              {isFirebaseConfigured ? 'Firebase Auth (Email/Pass)' : 'Admin Session Layer'}
            </p>
            <p className="text-charcoal-500 text-[11px]">
              Role-protected administrator credentials
            </p>
          </div>
        </div>
      </div>

      {/* 2. Database Seeding & Development Tools */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-charcoal-100">
          <div className="p-2.5 rounded-xl bg-gold-50 text-gold-600 border border-gold-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">
              Database Seeding & Reset Utility
            </h3>
            <p className="text-xs text-charcoal-500">
              Populate realistic Ozone Mall Ojhar directory records (Stores, Events, Dining, Offers).
            </p>
          </div>
        </div>

        <p className="text-xs text-charcoal-600 leading-relaxed font-light">
          Use this action to seed or re-populate the complete Ozone Mall database with realistic initial brand boutiques (Westside, Croma, Nykaa Luxe, Fabindia), dining outlets (The Amber Terrace, Artisan Cafes), and 4K Cineplex listings.
        </p>

        {seedResult && (
          <div className="p-4 rounded-2xl bg-gold-50 border border-gold-200 text-gold-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-gold-600 flex-shrink-0" />
            <span>{seedResult}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Database...' : 'Seed Database Now'}</span>
          </button>
        </div>
      </div>

      {/* 3. Security & Production Checklist */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-charcoal-100">
          <ShieldCheck className="w-5 h-5 text-gold-600" />
          <h3 className="font-serif text-lg font-bold text-charcoal-900">
            Security & Firebase Architecture Notes
          </h3>
        </div>

        <ul className="text-xs text-charcoal-600 space-y-2.5 font-light leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span>
              <strong>Private Inquiries:</strong> Contact form submissions from visitors are stored strictly in private collections with Firestore security rules preventing public reads.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span>
              <strong>Admin Only Writes:</strong> Public visitors have read-only access to published content. Modifications, deletions, and draft publishing require authenticated administrator tokens.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gold-600 font-bold">•</span>
            <span>
              <strong>No Hardcoded Secrets:</strong> Firebase credentials are read exclusively from Vite environment variables (<code>.env</code>) and omitted from public repositories.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
