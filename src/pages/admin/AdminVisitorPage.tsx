import React, { useEffect, useState } from 'react';
import {
  getVisitorInformation,
  updateVisitorInformation,
} from '../../firebase/services/visitorService';
import { VisitorInformation } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Save, CheckCircle2, MapPin, Clock, Car, Bus, Accessibility, Phone, Mail } from 'lucide-react';

export const AdminVisitorPage: React.FC = () => {
  const [data, setData] = useState<VisitorInformation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const info = await getVisitorInformation();
        setData(info);
      } catch (err) {
        console.error('Failed to load visitor info', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateVisitorInformation(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update visitor information.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !data) {
    return <LoadingSpinner fullPage message="Loading visitor details..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Visitor Information & Guidelines
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Configure mall operational hours, parking specs, EV facilities, and transit details.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Updated Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 pb-2 border-b border-charcoal-100">
            Address & Location Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Mall Name
              </label>
              <input
                type="text"
                value={data.mallName}
                onChange={(e) => setData({ ...data, mallName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={data.tagline}
                onChange={(e) => setData({ ...data, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Highway Street Address
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={data.state}
                onChange={(e) => setData({ ...data, state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Postal Pincode
              </label>
              <input
                type="text"
                value={data.pincode}
                onChange={(e) => setData({ ...data, pincode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-charcoal-100">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 pb-2 border-b border-charcoal-100">
            Operating Hours & Contact Desk
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Weekday Hours (Mon – Fri)
              </label>
              <input
                type="text"
                value={data.openingHoursWeekday}
                onChange={(e) => setData({ ...data, openingHoursWeekday: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Weekend Hours (Sat – Sun)
              </label>
              <input
                type="text"
                value={data.openingHoursWeekend}
                onChange={(e) => setData({ ...data, openingHoursWeekend: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Customer Care Helpline
              </label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Information Desk Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-charcoal-100">
          <h3 className="font-serif text-lg font-bold text-charcoal-900 pb-2 border-b border-charcoal-100">
            Parking, EV & Accessibility Guidelines
          </h3>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Parking & EV Charging Information
            </label>
            <textarea
              rows={3}
              value={data.parkingInfo}
              onChange={(e) => setData({ ...data, parkingInfo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Public Transport & Directions
            </label>
            <textarea
              rows={3}
              value={data.publicTransportInfo}
              onChange={(e) => setData({ ...data, publicTransportInfo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Universal Accessibility Statement
            </label>
            <textarea
              rows={3}
              value={data.accessibilityInfo}
              onChange={(e) => setData({ ...data, accessibilityInfo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-charcoal-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-charcoal-950 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Visitor Information'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
