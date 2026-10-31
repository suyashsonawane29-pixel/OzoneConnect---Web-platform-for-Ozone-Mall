import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../../firebase/services/faqsService';
import { FAQ } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Edit2, Trash2, Eye, EyeOff, HelpCircle, X } from 'lucide-react';

const faqSchema = z.object({
  question: z.string().min(5, 'Question required'),
  answer: z.string().min(10, 'Answer required'),
  category: z.enum(['General', 'Timings', 'Parking', 'Services', 'Events & Offers']),
  orderIndex: z.coerce.number().default(1),
  isPublished: z.boolean().default(true),
});

type FaqFormData = z.infer<typeof faqSchema>;

export const AdminFaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
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
  } = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getFaqs({ publishedOnly: false });
      setFaqs(list);
    } catch (err) {
      console.error('Failed to load FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    reset({
      question: '',
      answer: '',
      category: 'General',
      orderIndex: faqs.length + 1,
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f: FAQ) => {
    setEditingFaq(f);
    reset({
      question: f.question,
      answer: f.answer,
      category: f.category,
      orderIndex: f.orderIndex,
      isPublished: f.isPublished,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FaqFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (editingFaq) {
        await updateFaq(editingFaq.id, data);
        setFeedback({ type: 'success', message: 'FAQ updated successfully.' });
      } else {
        await createFaq(data);
        setFeedback({ type: 'success', message: 'New FAQ added.' });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (f: FAQ) => {
    try {
      await updateFaq(f.id, { isPublished: !f.isPublished });
      setFaqs((prev) =>
        prev.map((item) => (item.id === f.id ? { ...item, isPublished: !item.isPublished } : item))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteFaq(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'FAQ deleted.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete FAQ.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Frequently Asked Questions (FAQs)
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage visitor questions, categories, and display order.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New FAQ</span>
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading FAQs..." />
        ) : faqs.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No FAQs recorded. Click "Add New FAQ" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Question</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Answer Preview</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-charcoal-500">
                      #{faq.orderIndex}
                    </td>
                    <td className="px-6 py-4 font-bold text-charcoal-900 max-w-xs">{faq.question}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-ivory-100 text-charcoal-700 border border-charcoal-200">
                        {faq.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 max-w-sm truncate">{faq.answer}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(faq)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          faq.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {faq.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-ivory-100"
                          title="Edit FAQ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(faq.id)}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete FAQ"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
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
                  Question *
                </label>
                <input
                  {...register('question')}
                  type="text"
                  placeholder="e.g. Is valet parking available at Ozone Mall?"
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
                    <option value="General">General</option>
                    <option value="Timings">Timings</option>
                    <option value="Parking">Parking</option>
                    <option value="Services">Services</option>
                    <option value="Events & Offers">Events & Offers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Display Order Index
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
                  Answer *
                </label>
                <textarea
                  {...register('answer')}
                  rows={4}
                  placeholder="Comprehensive response for visitors..."
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
                  <span>Publish to FAQ Section</span>
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
                  {isSaving ? 'Saving...' : editingFaq ? 'Update FAQ' : 'Add FAQ'}
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
        title="Delete FAQ"
        message="Are you sure you want to remove this FAQ item?"
        confirmText="Delete FAQ"
      />
    </div>
  );
};
