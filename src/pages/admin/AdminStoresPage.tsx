import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getStores,
  createStore,
  updateStore,
  deleteStore,
} from '../../firebase/services/storesService';
import { Store, StoreCategory, FloorLevel } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  X,
  Upload,
} from 'lucide-react';
import { uploadImage } from '../../firebase/services/storageService';

const storeSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  category: z.enum([
    'Fashion',
    'Electronics',
    'Beauty & Personal Care',
    'Lifestyle',
    'Food & Dining',
    'Entertainment',
    'Other',
  ]),
  floor: z.enum([
    'Lower Ground (LG)',
    'Ground Floor (G)',
    'First Floor (1F)',
    'Second Floor (2F)',
    'Third Floor (3F)',
    'Food Court',
  ]),
  unitNumber: z.string().min(1, 'Unit number required (e.g. G-12)'),
  phone: z.string().optional(),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  website: z.string().url('Must be valid URL').optional().or(z.literal('')),
  openingHours: z.string().min(3, 'e.g. 10:00 AM - 10:00 PM'),
  shortDescription: z.string().min(5, 'Short description for cards'),
  description: z.string().min(10, 'Full description'),
  logoUrl: z.string().min(1, 'Logo URL or image upload required'),
  coverImageUrl: z.string().min(1, 'Cover image URL or upload required'),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  tagsString: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

export const AdminStoresPage: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getStores({ publishedOnly: false });
      setStores(list);
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStore(null);
    reset({
      name: '',
      category: 'Fashion',
      floor: 'Ground Floor (G)',
      unitNumber: '',
      phone: '',
      email: '',
      website: '',
      openingHours: '10:00 AM - 9:30 PM',
      shortDescription: '',
      description: '',
      logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      isFeatured: false,
      isPublished: true,
      tagsString: 'Fashion, Retail',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    reset({
      name: store.name,
      category: store.category,
      floor: store.floor,
      unitNumber: store.unitNumber,
      phone: store.phone || '',
      email: store.email || '',
      website: store.website || '',
      openingHours: store.openingHours,
      shortDescription: store.shortDescription,
      description: store.description,
      logoUrl: store.logoUrl,
      coverImageUrl: store.coverImageUrl,
      isFeatured: store.isFeatured,
      isPublished: store.isPublished,
      tagsString: store.tags?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: StoreFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const tags = data.tagsString
        ? data.tagsString.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      if (editingStore) {
        await updateStore(editingStore.id, {
          name: data.name,
          category: data.category,
          floor: data.floor,
          unitNumber: data.unitNumber,
          phone: data.phone || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
          openingHours: data.openingHours,
          shortDescription: data.shortDescription,
          description: data.description,
          logoUrl: data.logoUrl,
          coverImageUrl: data.coverImageUrl,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
          tags,
        });
        setFeedback({ type: 'success', message: `Store "${data.name}" updated successfully.` });
      } else {
        await createStore({
          name: data.name,
          category: data.category,
          floor: data.floor,
          unitNumber: data.unitNumber,
          phone: data.phone || undefined,
          email: data.email || undefined,
          website: data.website || undefined,
          openingHours: data.openingHours,
          shortDescription: data.shortDescription,
          description: data.description,
          logoUrl: data.logoUrl,
          coverImageUrl: data.coverImageUrl,
          isFeatured: data.isFeatured,
          isPublished: data.isPublished,
          tags,
        });
        setFeedback({ type: 'success', message: `Store "${data.name}" created successfully.` });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (store: Store) => {
    try {
      await updateStore(store.id, { isPublished: !store.isPublished });
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, isPublished: !s.isPublished } : s))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteStore(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'Store listing deleted.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete store.' });
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'coverImageUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadImage(file, 'stores');
      setValue(field, res.url);
    } catch (err: any) {
      alert(err.message || 'Failed to upload image.');
    }
  };

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.floor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Stores Directory Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Create, edit, preview, and publish brand stores for the public website.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Store</span>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-subtle flex items-center gap-3">
        <Search className="w-4 h-4 text-gold-600" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search stores by name, category, or floor level..."
          className="w-full text-xs text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Stores List */}
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching store listings..." />
        ) : filteredStores.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No stores found. Click "Add New Store" to publish one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3.5">Store Brand</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Floor / Unit</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Featured</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={store.logoUrl}
                          alt={store.name}
                          className="w-10 h-10 rounded-lg object-cover border border-charcoal-200"
                        />
                        <div>
                          <p className="font-bold text-charcoal-900">{store.name}</p>
                          <p className="text-[11px] text-charcoal-400">{store.openingHours}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal-700">{store.category}</td>
                    <td className="px-6 py-4 text-charcoal-600">
                      <p className="font-medium text-charcoal-800">{store.floor}</p>
                      <p className="text-[11px] text-charcoal-400">Unit: {store.unitNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(store)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          store.isPublished
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                        }`}
                      >
                        {store.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {store.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-gold-700 font-bold text-[10px] uppercase bg-gold-50 px-2 py-0.5 rounded-full border border-gold-200">
                          <Sparkles className="w-2.5 h-2.5" /> Featured
                        </span>
                      ) : (
                        <span className="text-charcoal-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/stores/${store.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100"
                          title="Preview on Public Website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(store)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-ivory-100"
                          title="Edit Store"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(store.id)}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Store"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingStore ? 'Edit Store Listing' : 'Add New Store Listing'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Store Brand Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="e.g. Zara Atelier"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Floor Level *
                  </label>
                  <select
                    {...register('floor')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Lower Ground (LG)">Lower Ground (LG)</option>
                    <option value="Ground Floor (G)">Ground Floor (G)</option>
                    <option value="First Floor (1F)">First Floor (1F)</option>
                    <option value="Second Floor (2F)">Second Floor (2F)</option>
                    <option value="Third Floor (3F)">Third Floor (3F)</option>
                    <option value="Food Court">Food Court</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Unit / Shop Number *
                  </label>
                  <input
                    {...register('unitNumber')}
                    type="text"
                    placeholder="e.g. G-14"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  {errors.unitNumber && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.unitNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Operating Hours
                  </label>
                  <input
                    {...register('openingHours')}
                    type="text"
                    placeholder="10:00 AM - 10:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Store Phone
                  </label>
                  <input
                    {...register('phone')}
                    type="text"
                    placeholder="+91 253 XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Store Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="store@brand.com"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Short Summary (for card displays) *
                </label>
                <input
                  {...register('shortDescription')}
                  type="text"
                  placeholder="e.g. Contemporary apparel, studio cosmetics, and designer footwear."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Full Store Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Detailed store profile and offerings..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              {/* Logo & Cover Image URLs / Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-charcoal-700">Logo Image URL</label>
                    <label className="text-[10px] text-gold-700 hover:text-gold-900 cursor-pointer font-bold flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'logoUrl')}
                      />
                    </label>
                  </div>
                  <input
                    {...register('logoUrl')}
                    type="url"
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-charcoal-700">Cover Image URL</label>
                    <label className="text-[10px] text-gold-700 hover:text-gold-900 cursor-pointer font-bold flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'coverImageUrl')}
                      />
                    </label>
                  </div>
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
                  Search Tags (Comma-separated)
                </label>
                <input
                  {...register('tagsString')}
                  type="text"
                  placeholder="Fashion, Ethnic, Shoes, Women"
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
                  <span>Mark as Featured Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0"
                  />
                  <span>Publish to Public Website</span>
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
                  {isSaving ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Store Listing"
        message="Are you sure you want to permanently delete this store from the Ozone Mall directory? This will remove its public page immediately."
        confirmText="Delete Store"
      />
    </div>
  );
};
