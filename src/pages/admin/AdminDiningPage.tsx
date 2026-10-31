import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getDiningOutlets,
  createDiningOutlet,
  updateDiningOutlet,
  deleteDiningOutlet,
} from '../../firebase/services/diningService';
import { DiningOutlet, DiningCategory, FloorLevel } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Utensils, X } from 'lucide-react';

const diningSchema = z.object({
  name: z.string().min(2, 'Name required'),
  diningType: z.enum([
    'Casual Dining',
    'Food Court',
    'Quick Bites',
    'Fine Dining',
    'Cafe & Bakery',
    'Beverages & Desserts',
  ]),
  cuisineType: z.string().min(2, 'e.g. North Indian, Continental'),
  floor: z.enum([
    'Lower Ground (LG)',
    'Ground Floor (G)',
    'First Floor (1F)',
    'Second Floor (2F)',
    'Third Floor (3F)',
    'Food Court',
  ]),
  unitNumber: z.string().min(1, 'Unit number required'),
  phone: z.string().optional(),
  openingHours: z.string().min(3, 'e.g. 11:00 AM - 11:00 PM'),
  averageCostForTwo: z.string().optional(),
  description: z.string().min(10, 'Description required'),
  logoUrl: z.string().min(1, 'Logo URL required'),
  coverImageUrl: z.string().min(1, 'Cover image URL required'),
  featuresString: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

type DiningFormData = z.infer<typeof diningSchema>;

export const AdminDiningPage: React.FC = () => {
  const [outlets, setOutlets] = useState<DiningOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<DiningOutlet | null>(null);
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
  } = useForm<DiningFormData>({
    resolver: zodResolver(diningSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getDiningOutlets({ publishedOnly: false });
      setOutlets(list);
    } catch (err) {
      console.error('Failed to load dining outlets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingOutlet(null);
    reset({
      name: '',
      diningType: 'Casual Dining',
      cuisineType: 'Multi-Cuisine',
      floor: 'Food Court',
      unitNumber: 'FC-01',
      phone: '',
      openingHours: '11:00 AM - 11:00 PM',
      averageCostForTwo: '₹600 for two',
      description: '',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      featuresString: 'Takeaway Available, Vegetarian Options',
      isFeatured: false,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: DiningOutlet) => {
    setEditingOutlet(d);
    reset({
      name: d.name,
      diningType: d.diningType,
      cuisineType: d.cuisineType,
      floor: d.floor,
      unitNumber: d.unitNumber,
      phone: d.phone || '',
      openingHours: d.openingHours,
      averageCostForTwo: d.averageCostForTwo || '',
      description: d.description,
      logoUrl: d.logoUrl,
      coverImageUrl: d.coverImageUrl,
      featuresString: d.features?.join(', ') || '',
      isFeatured: d.isFeatured,
      isPublished: d.isPublished,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: DiningFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const features = data.featuresString
        ? data.featuresString.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      if (editingOutlet) {
        await updateDiningOutlet(editingOutlet.id, {
          ...data,
          features,
        });
        setFeedback({ type: 'success', message: `Outlet "${data.name}" updated.` });
      } else {
        await createDiningOutlet({
          ...data,
          features,
        });
        setFeedback({ type: 'success', message: `Outlet "${data.name}" added.` });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (d: DiningOutlet) => {
    try {
      await updateDiningOutlet(d.id, { isPublished: !d.isPublished });
      setOutlets((prev) =>
        prev.map((item) => (item.id === d.id ? { ...item, isPublished: !item.isPublished } : item))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDiningOutlet(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'Dining outlet removed.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete outlet.' });
    }
  };

  const filteredOutlets = outlets.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cuisineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.diningType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Dining & Food Outlets Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage restaurants, quick bite counters, cafes, and rooftop dining experiences.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dining Outlet</span>
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
          placeholder="Search dining outlets by name, cuisine, or category..."
          className="w-full text-xs text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Outlets Table */}
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading restaurants..." />
        ) : filteredOutlets.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No dining outlets listed. Click "Add Dining Outlet" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3.5">Outlet</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Cuisine</th>
                  <th className="px-6 py-3.5">Floor / Unit</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredOutlets.map((outlet) => (
                  <tr key={outlet.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={outlet.logoUrl}
                          alt={outlet.name}
                          className="w-10 h-10 rounded-lg object-cover border border-charcoal-200"
                        />
                        <div>
                          <p className="font-bold text-charcoal-900">{outlet.name}</p>
                          <p className="text-[11px] text-charcoal-400">{outlet.averageCostForTwo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal-700">{outlet.diningType}</td>
                    <td className="px-6 py-4 text-charcoal-600">{outlet.cuisineType}</td>
                    <td className="px-6 py-4 text-charcoal-600">
                      {outlet.floor} • Unit {outlet.unitNumber}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(outlet)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          outlet.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {outlet.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(outlet)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-ivory-100"
                          title="Edit Outlet"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(outlet.id)}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Outlet"
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
                {editingOutlet ? 'Edit Dining Outlet' : 'Add Dining Outlet'}
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
                  Outlet Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g. The Amber Terrace"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Dining Category *
                  </label>
                  <select
                    {...register('diningType')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Casual Dining">Casual Dining</option>
                    <option value="Food Court">Food Court</option>
                    <option value="Quick Bites">Quick Bites</option>
                    <option value="Fine Dining">Fine Dining</option>
                    <option value="Cafe & Bakery">Cafe & Bakery</option>
                    <option value="Beverages & Desserts">Beverages & Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Cuisine Specialty *
                  </label>
                  <input
                    {...register('cuisineType')}
                    type="text"
                    placeholder="e.g. North Indian, Continental"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Floor Level *
                  </label>
                  <select
                    {...register('floor')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Third Floor (3F)">Third Floor (3F)</option>
                    <option value="Food Court">Food Court</option>
                    <option value="Ground Floor (G)">Ground Floor (G)</option>
                    <option value="First Floor (1F)">First Floor (1F)</option>
                    <option value="Second Floor (2F)">Second Floor (2F)</option>
                    <option value="Lower Ground (LG)">Lower Ground (LG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Unit Number *
                  </label>
                  <input
                    {...register('unitNumber')}
                    type="text"
                    placeholder="e.g. 3F-01"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Avg. Cost for Two
                  </label>
                  <input
                    {...register('averageCostForTwo')}
                    type="text"
                    placeholder="e.g. ₹800 for two"
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
                  rows={2}
                  placeholder="Atmosphere, specialty dishes, and seating..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Logo Image URL
                  </label>
                  <input
                    {...register('logoUrl')}
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    {...register('coverImageUrl')}
                    type="url"
                    placeholder="https://..."
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
                  placeholder="Outdoor Terrace, Vegetarian Friendly, Live Mocktail Bar"
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
                  <span>Publish to Directory</span>
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
                  {isSaving ? 'Saving...' : editingOutlet ? 'Update Outlet' : 'Create Outlet'}
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
        title="Delete Dining Outlet"
        message="Are you sure you want to remove this dining outlet? It will be removed from the dining directory immediately."
        confirmText="Delete Outlet"
      />
    </div>
  );
};
