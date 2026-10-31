import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getEntertainmentActivities,
  createEntertainmentActivity,
  updateEntertainmentActivity,
  deleteEntertainmentActivity,
} from '../../firebase/services/entertainmentService';
import { EntertainmentActivity, FloorLevel } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Film, X } from 'lucide-react';

const entSchema = z.object({
  title: z.string().min(3, 'Title required'),
  type: z.enum(['Cinema', 'Arcade', 'Bowling', 'Kids Zone', 'VR Gaming', 'Live Arena']),
  floor: z.enum([
    'Lower Ground (LG)',
    'Ground Floor (G)',
    'First Floor (1F)',
    'Second Floor (2F)',
    'Third Floor (3F)',
    'Food Court',
  ]),
  unitNumber: z.string().min(1, 'Unit number required'),
  openingHours: z.string().min(3, 'Hours required'),
  priceRange: z.string().optional(),
  description: z.string().min(10, 'Description required'),
  coverImageUrl: z.string().min(1, 'Cover image URL required'),
  bookingUrl: z.string().url('Must be valid URL').optional().or(z.literal('')),
  featuresString: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

type EntFormData = z.infer<typeof entSchema>;

export const AdminEntertainmentPage: React.FC = () => {
  const [activities, setActivities] = useState<EntertainmentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntertainmentActivity | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntFormData>({
    resolver: zodResolver(entSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getEntertainmentActivities({ publishedOnly: false });
      setActivities(list);
    } catch (err) {
      console.error('Failed to load entertainment activities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    reset({
      title: '',
      type: 'Cinema',
      floor: 'Third Floor (3F)',
      unitNumber: '3F-01',
      openingHours: '10:00 AM - 11:30 PM',
      priceRange: '₹200 - ₹500',
      description: '',
      coverImageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      bookingUrl: 'https://in.bookmyshow.com',
      featuresString: 'Dolby Atmos 7.1, 4K Projection, Recliner Seats',
      isFeatured: false,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: EntertainmentActivity) => {
    setEditingItem(item);
    reset({
      title: item.title,
      type: item.type,
      floor: item.floor,
      unitNumber: item.unitNumber,
      openingHours: item.openingHours,
      priceRange: item.priceRange || '',
      description: item.description,
      coverImageUrl: item.coverImageUrl,
      bookingUrl: item.bookingUrl || '',
      featuresString: item.features?.join(', ') || '',
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: EntFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const features = data.featuresString
        ? data.featuresString.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      if (editingItem) {
        await updateEntertainmentActivity(editingItem.id, {
          ...data,
          bookingUrl: data.bookingUrl || undefined,
          features,
        });
        setFeedback({ type: 'success', message: `Activity "${data.title}" updated.` });
      } else {
        await createEntertainmentActivity({
          ...data,
          bookingUrl: data.bookingUrl || undefined,
          features,
        });
        setFeedback({ type: 'success', message: `Activity "${data.title}" created.` });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (item: EntertainmentActivity) => {
    try {
      await updateEntertainmentActivity(item.id, { isPublished: !item.isPublished });
      setActivities((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPublished: !i.isPublished } : i))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteEntertainmentActivity(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'Activity deleted successfully.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete activity.' });
    }
  };

  const filtered = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Entertainment & Cineplex Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage cinema screens, bowling alley, arcade arenas, and family play zones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attraction</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-subtle flex items-center gap-3">
        <Search className="w-4 h-4 text-gold-600" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search attractions by title or type..."
          className="w-full text-xs text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading entertainment venues..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No attractions found. Click "Add Attraction" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3.5">Attraction</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Floor / Unit</th>
                  <th className="px-6 py-3.5">Pricing</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-charcoal-900">{item.title}</p>
                      <p className="text-[11px] text-charcoal-400">{item.openingHours}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal-700">{item.type}</td>
                    <td className="px-6 py-4 text-charcoal-600">
                      {item.floor} • Unit {item.unitNumber}
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">{item.priceRange || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          item.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {item.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-ivory-100"
                          title="Edit Activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingItem ? 'Edit Attraction' : 'Add Attraction'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Attraction Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Ozone Cineplex (4 Screens)"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Attraction Type *
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Cinema">Cinema</option>
                    <option value="Arcade">Arcade</option>
                    <option value="Bowling">Bowling</option>
                    <option value="Kids Zone">Kids Zone</option>
                    <option value="VR Gaming">VR Gaming</option>
                    <option value="Live Arena">Live Arena</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Floor Level *
                  </label>
                  <select
                    {...register('floor')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Third Floor (3F)">Third Floor (3F)</option>
                    <option value="Second Floor (2F)">Second Floor (2F)</option>
                    <option value="First Floor (1F)">First Floor (1F)</option>
                    <option value="Ground Floor (G)">Ground Floor (G)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Unit Number *
                  </label>
                  <input
                    {...register('unitNumber')}
                    type="text"
                    placeholder="e.g. 3F-Cinema"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    {...register('openingHours')}
                    type="text"
                    placeholder="10:00 AM - 11:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Price Range
                  </label>
                  <input
                    {...register('priceRange')}
                    type="text"
                    placeholder="₹180 - ₹450"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Cinematic specs, games, and features..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Cover Image URL *
                  </label>
                  <input
                    {...register('coverImageUrl')}
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Online Booking URL (Optional)
                  </label>
                  <input
                    {...register('bookingUrl')}
                    type="url"
                    placeholder="https://in.bookmyshow.com"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Features (Comma-separated)
                </label>
                <input
                  {...register('featuresString')}
                  type="text"
                  placeholder="4K Laser, Dolby Atmos 7.1, VIP Recliners"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800">
                  <input
                    {...register('isFeatured')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0"
                  />
                  <span>Publish Immediately</span>
                </label>
              </div>

              <div className="pt-4 border-t border-charcoal-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-charcoal-600 hover:bg-charcoal-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-charcoal-950 text-xs font-bold uppercase tracking-wider shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingItem ? 'Update Attraction' : 'Save Attraction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Attraction"
        message="Are you sure you want to remove this attraction from the entertainment directory?"
        confirmText="Delete Attraction"
      />
    </div>
  );
};
