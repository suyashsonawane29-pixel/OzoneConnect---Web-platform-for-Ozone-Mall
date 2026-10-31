import React, { useEffect, useState } from 'react';
import {
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from '../../firebase/services/enquiriesService';
import { Enquiry } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import {
  Mail,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  Trash2,
  Phone,
  Calendar,
  AlertCircle,
  MessageSquare,
  X,
} from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getEnquiries('all');
      setEnquiries(list);
    } catch (err) {
      console.error('Failed to load enquiries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openDetail = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setAdminNotes(enq.adminNotes || '');
  };

  const handleStatusChange = async (
    enquiryId: string,
    newStatus: Enquiry['status'],
    notes?: string
  ) => {
    setIsUpdating(true);
    try {
      const updated = await updateEnquiryStatus(enquiryId, newStatus, notes);
      setEnquiries((prev) => prev.map((e) => (e.id === enquiryId ? updated : e)));
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(updated);
      }
    } catch (err) {
      console.error('Failed to update enquiry status', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteEnquiry(deleteTargetId);
      setDeleteTargetId(null);
      if (selectedEnquiry && selectedEnquiry.id === deleteTargetId) {
        setSelectedEnquiry(null);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to delete enquiry', err);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Visitor Inquiries & Feedback
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Private inquiries submitted by visitors through the Contact form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'new', 'in_progress', 'resolved', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'bg-white text-charcoal-600 hover:bg-gold-50 border border-charcoal-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-charcoal-100 shadow-subtle flex items-center gap-3">
        <Search className="w-4 h-4 text-gold-600" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by visitor name, email, subject, or message text..."
          className="w-full text-xs text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enquiries List */}
        <div className={`space-y-3 ${selectedEnquiry ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {loading ? (
            <LoadingSpinner message="Loading submitted inquiries..." />
          ) : filteredEnquiries.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-charcoal-100 text-center text-xs text-charcoal-500">
              No inquiries found under this filter.
            </div>
          ) : (
            filteredEnquiries.map((enq) => {
              const isSelected = selectedEnquiry?.id === enq.id;
              return (
                <div
                  key={enq.id}
                  onClick={() => openDetail(enq)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gold-50/70 border-gold-400 shadow-md'
                      : 'bg-white border-charcoal-100 hover:border-charcoal-300 shadow-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            enq.status === 'new'
                              ? 'bg-rose-100 text-rose-800'
                              : enq.status === 'in_progress'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {enq.status.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-charcoal-400">
                          {formatDate(enq.createdAt)}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-charcoal-900 text-base">
                        {enq.subject}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                        {enq.message}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-charcoal-600 font-medium">
                        <span>{enq.name}</span>
                        <span>•</span>
                        <span className="text-charcoal-400">{enq.email}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(enq.id);
                      }}
                      className="p-1.5 text-charcoal-400 hover:text-red-600 rounded-lg"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selectedEnquiry && (
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-xl space-y-6 h-fit sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-100">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                Inquiry Detail
              </span>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-charcoal-400 hover:text-charcoal-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selectedEnquiry.status === 'new'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedEnquiry.status === 'in_progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Status: {selectedEnquiry.status.replace('_', ' ')}
              </span>

              <h3 className="font-serif text-xl font-bold text-charcoal-900 mt-3">
                {selectedEnquiry.subject}
              </h3>

              <div className="mt-3 space-y-1 text-xs text-charcoal-600 p-3 rounded-xl bg-ivory-100 border border-charcoal-200">
                <p>
                  <strong className="text-charcoal-900">From:</strong> {selectedEnquiry.name}
                </p>
                <p>
                  <strong className="text-charcoal-900">Email:</strong>{' '}
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-gold-700 hover:underline">
                    {selectedEnquiry.email}
                  </a>
                </p>
                {selectedEnquiry.phone && (
                  <p>
                    <strong className="text-charcoal-900">Phone:</strong>{' '}
                    <a href={`tel:${selectedEnquiry.phone}`} className="text-gold-700 hover:underline">
                      {selectedEnquiry.phone}
                    </a>
                  </p>
                )}
                <p>
                  <strong className="text-charcoal-900">Received:</strong>{' '}
                  {formatDate(selectedEnquiry.createdAt)}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-charcoal-400 mb-1">
                  Message Content
                </p>
                <div className="p-4 rounded-xl bg-ivory-50 border border-charcoal-100 text-xs text-charcoal-800 leading-relaxed font-light whitespace-pre-line">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* Status Updater */}
              <div className="mt-6 pt-4 border-t border-charcoal-100 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Update Resolution Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedEnquiry.id, 'new', adminNotes)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                      selectedEnquiry.status === 'new'
                        ? 'bg-rose-600 text-white'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-rose-50'
                    }`}
                  >
                    New
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEnquiry.id, 'in_progress', adminNotes)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                      selectedEnquiry.status === 'in_progress'
                        ? 'bg-amber-600 text-white'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-amber-50'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedEnquiry.id, 'resolved', adminNotes)}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                      selectedEnquiry.status === 'resolved'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-ivory-100 text-charcoal-700 hover:bg-emerald-50'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div className="mt-4 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record follow-up actions, phone call notes..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
                <button
                  onClick={() =>
                    handleStatusChange(selectedEnquiry.id, selectedEnquiry.status, adminNotes)
                  }
                  disabled={isUpdating}
                  className="w-full py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold uppercase hover:bg-gold-600 transition-colors"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Inquiry Record"
        message="Are you sure you want to permanently delete this customer inquiry from the database?"
        confirmText="Delete Record"
      />
    </div>
  );
};
