import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from '../../firebase/services/galleryService';
import { uploadImage } from '../../firebase/services/storageService';
import { GalleryItem } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, Image as ImageIcon, X } from 'lucide-react';

const gallerySchema = z.object({
  title: z.string().min(2, 'Title required'),
  category: z.enum([
    'Architecture',
    'Shopping',
    'Dining',
    'Events',
    'Entertainment',
    'Atmosphere',
  ]),
  imageUrl: z.string().min(1, 'Image URL or file upload required'),
  description: z.string().optional(),
  orderIndex: z.coerce.number().default(1),
  isPublished: z.boolean().default(true),
});

type GalleryFormData = z.infer<typeof gallerySchema>;

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getGalleryItems({ publishedOnly: false });
      setItems(list);
    } catch (err) {
      console.error('Failed to load gallery items', err);
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
      category: 'Architecture',
      imageUrl: '',
      description: '',
      orderIndex: items.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    reset({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || '',
      orderIndex: item.orderIndex,
      isPublished: item.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImage(file, 'gallery');
      setValue('imageUrl', res.url);
      if (!editingItem) {
        setValue('title', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err: any) {
      alert(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: GalleryFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (editingItem) {
        await updateGalleryItem(editingItem.id, data);
        setFeedback({ type: 'success', message: 'Gallery item updated.' });
      } else {
        await createGalleryItem(data);
        setFeedback({ type: 'success', message: 'Gallery media uploaded and published.' });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (item: GalleryItem) => {
    try {
      await updateGalleryItem(item.id, { isPublished: !item.isPublished });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPublished: !item.isPublished } : i))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteGalleryItem(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'Image deleted from gallery.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete image.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Image Gallery Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Upload, categorize, reorder, and publish visual lifestyle and architectural showcases.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image</span>
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

      {/* Grid of gallery cards */}
      {loading ? (
        <LoadingSpinner message="Loading gallery media..." />
      ) : items.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-charcoal-100 text-center text-xs text-charcoal-500">
          No gallery images uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-charcoal-100 shadow-subtle hover:shadow-premium transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-950">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gold-500 text-charcoal-950 shadow-sm">
                      {item.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-white backdrop-blur-sm">
                      Order: #{item.orderIndex}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-serif font-bold text-charcoal-900 text-base">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-charcoal-500 mt-1 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.isPublished
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-charcoal-100 text-charcoal-600'
                    }`}
                  >
                    {item.isPublished ? 'Published' : 'Draft'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-charcoal-600 hover:text-gold-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(item.id)}
                      className="p-1.5 text-charcoal-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingItem ? 'Edit Gallery Photo' : 'Upload Gallery Photo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              {/* File upload zone */}
              <div className="p-4 rounded-2xl bg-ivory-100 border-2 border-dashed border-charcoal-200 text-center">
                <input
                  type="file"
                  id="gallery-file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="gallery-file" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-gold-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-charcoal-900">
                    {isUploading ? 'Uploading to Firebase Storage...' : 'Click to Upload Image File'}
                  </p>
                  <p className="text-[10px] text-charcoal-400 mt-0.5">
                    JPG, PNG, WebP up to 5MB supported
                  </p>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Or Direct Image URL *
                </label>
                <input
                  {...register('imageUrl')}
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
                {errors.imageUrl && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.imageUrl.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Photo Title / Headline *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Grand Sunlit Atrium"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Dining">Dining</option>
                    <option value="Events">Events</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Atmosphere">Atmosphere</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Order Index
                  </label>
                  <input
                    {...register('orderIndex')}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Description / Caption (Optional)
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Atmosphere details for lightbox caption..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800">
                  <input
                    {...register('isPublished')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0"
                  />
                  <span>Publish to Public Gallery</span>
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
                  {isSaving ? 'Saving...' : editingItem ? 'Update Photo' : 'Upload & Publish'}
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
        title="Delete Gallery Photo"
        message="Are you sure you want to permanently delete this image from the gallery?"
        confirmText="Delete Image"
      />
    </div>
  );
};
