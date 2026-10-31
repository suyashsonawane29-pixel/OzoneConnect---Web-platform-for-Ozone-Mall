import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../../firebase/services/offersService';
import { Offer, StoreCategory } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Sparkles, X, Tag } from 'lucide-react';
import { formatDate, getOfferStatus } from '../../utils/formatters';

const offerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  storeName: z.string().min(2, 'Store name required'),
  category: z.enum([
    'Fashion',
    'Electronics',
    'Beauty & Personal Care',
    'Lifestyle',
    'Food & Dining',
    'Entertainment',
    'Other',
  ]),
  discountText: z.string().min(2, 'e.g. Up to 50% Off / Flat ₹500 Off'),
  badgeText: z.string().optional(),
  description: z.string().min(10, 'Offer description'),
  terms: z.string().min(5, 'Terms and conditions'),
  imageUrl: z.string().min(1, 'Image URL required'),
  startDate: z.string().min(10, 'Start date (YYYY-MM-DD)'),
  endDate: z.string().min(10, 'End date (YYYY-MM-DD)'),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

type OfferFormData = z.infer<typeof offerSchema>;

export const AdminOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
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
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getOffers({ publishedOnly: false });
      setOffers(list);
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingOffer(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    reset({
      title: '',
      storeName: '',
      category: 'Fashion',
      discountText: 'Flat 20% Off',
      badgeText: 'Trending',
      description: '',
      terms: 'Valid on select merchandise till stocks last. T&C apply.',
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80',
      startDate: today,
      endDate: nextMonth,
      isFeatured: false,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    reset({
      title: offer.title,
      storeName: offer.storeName,
      category: offer.category,
      discountText: offer.discountText,
      badgeText: offer.badgeText || '',
      description: offer.description,
      terms: offer.terms,
      imageUrl: offer.imageUrl,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isFeatured: offer.isFeatured,
      isPublished: offer.isPublished,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: OfferFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, data);
        setFeedback({ type: 'success', message: `Offer "${data.title}" updated successfully.` });
      } else {
        await createOffer(data);
        setFeedback({ type: 'success', message: `Offer "${data.title}" published successfully.` });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (offer: Offer) => {
    try {
      await updateOffer(offer.id, { isPublished: !offer.isPublished });
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isPublished: !o.isPublished } : o))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteOffer(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'Offer deleted successfully.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete offer.' });
    }
  };

  const filteredOffers = offers.filter(
    (o) =>
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.discountText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Offers & Promotions Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage public sales, discount deals, and validity periods. Expired deals are automatically excluded from active tabs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Offer</span>
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
          placeholder="Search offers by title, participating store, or discount..."
          className="w-full text-xs text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading mall promotions..." />
        ) : filteredOffers.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No offers found. Click "Post New Offer" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3.5">Promotion Title</th>
                  <th className="px-6 py-3.5">Store</th>
                  <th className="px-6 py-3.5">Discount Offer</th>
                  <th className="px-6 py-3.5">Validity Dates</th>
                  <th className="px-6 py-3.5">State</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredOffers.map((offer) => {
                  const status = getOfferStatus(offer.startDate, offer.endDate);
                  return (
                    <tr key={offer.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-charcoal-900">{offer.title}</p>
                        <p className="text-[11px] text-charcoal-400">{offer.category}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-charcoal-800">{offer.storeName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          {offer.discountText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-charcoal-600 text-[11px]">
                        {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(offer)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            offer.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {offer.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(offer)}
                            className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-ivory-100"
                            title="Edit Offer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(offer.id)}
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Offer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingOffer ? 'Edit Promotion' : 'Post New Promotion'}
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
                  Offer Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. End of Season Mega Clearance"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Participating Store *
                  </label>
                  <input
                    {...register('storeName')}
                    type="text"
                    placeholder="e.g. Westside Lifestyle"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  {errors.storeName && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.storeName.message}</p>
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
                    Discount Highlight *
                  </label>
                  <input
                    {...register('discountText')}
                    type="text"
                    placeholder="e.g. Flat 30% Off / Buy 1 Get 1"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  {errors.discountText && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.discountText.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    {...register('badgeText')}
                    type="text"
                    placeholder="e.g. Trending / Hot Deal"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Start Date (YYYY-MM-DD) *
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  {errors.startDate && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    End Date (YYYY-MM-DD) *
                  </label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                  {errors.endDate && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Summary of promotional offer..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Terms & Conditions *
                </label>
                <textarea
                  {...register('terms')}
                  rows={2}
                  placeholder="Valid till stocks last. Cannot be clubbed with other vouchers..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Promotional Banner Image URL *
                </label>
                <input
                  {...register('imageUrl')}
                  type="url"
                  placeholder="https://images.unsplash.com/..."
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
                  {isSaving ? 'Saving...' : editingOffer ? 'Update Offer' : 'Publish Offer'}
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
        title="Delete Offer"
        message="Are you sure you want to remove this promotion? It will immediately disappear from the public website."
        confirmText="Delete Offer"
      />
    </div>
  );
};
