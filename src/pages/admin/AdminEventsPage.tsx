import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../firebase/services/eventsService';
import { EventItem, EventCategory } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Users, Calendar, X } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const eventSchema = z.object({
  title: z.string().min(3, 'Event title required'),
  category: z.enum([
    'Cultural',
    'Festival',
    'Fashion',
    'Kids',
    'Music',
    'Workshop',
    'Sale & Promo',
    'Other',
  ]),
  description: z.string().min(10, 'Full description required'),
  venue: z.string().min(3, 'e.g. Central Atrium / Food Court Level 3'),
  startDate: z.string().min(10, 'Start date required'),
  endDate: z.string().min(10, 'End date required'),
  timeString: z.string().min(3, 'e.g. 6:00 PM - 9:30 PM'),
  imageUrl: z.string().min(1, 'Image URL required'),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  isRegistrationOpen: z.boolean().default(false),
  maxRegistrations: z.coerce.number().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
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
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getEvents({ type: 'all', publishedOnly: false });
      setEvents(list);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    const today = new Date().toISOString().split('T')[0];
    reset({
      title: '',
      category: 'Music',
      description: '',
      venue: 'Central Atrium (Ground Floor), Ozone Mall Ojhar',
      startDate: today,
      endDate: today,
      timeString: '6:00 PM - 9:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      isFeatured: false,
      isPublished: true,
      isRegistrationOpen: true,
      maxRegistrations: 200,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    reset({
      title: evt.title,
      category: evt.category,
      description: evt.description,
      venue: evt.venue,
      startDate: evt.startDate,
      endDate: evt.endDate,
      timeString: evt.timeString,
      imageUrl: evt.imageUrl,
      isFeatured: evt.isFeatured,
      isPublished: evt.isPublished,
      isRegistrationOpen: evt.isRegistrationOpen,
      maxRegistrations: evt.maxRegistrations,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: EventFormData) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        setFeedback({ type: 'success', message: `Event "${data.title}" updated.` });
      } else {
        await createEvent(data);
        setFeedback({ type: 'success', message: `Event "${data.title}" created.` });
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (evt: EventItem) => {
    try {
      await updateEvent(evt.id, { isPublished: !evt.isPublished });
      setEvents((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, isPublished: !e.isPublished } : e))
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteEvent(deleteTargetId);
      setDeleteTargetId(null);
      setFeedback({ type: 'success', message: 'Event removed from schedule.' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete event.' });
    }
  };

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Events & Experiences Management
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Publish cultural celebrations, musical concerts, workshops, and manage online RSVPs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-gold-600 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
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
          placeholder="Search events by title, venue, or category..."
          className="w-full text-xs text-charcoal-900 placeholder-charcoal-400 bg-transparent focus:outline-none"
        />
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-charcoal-100 shadow-subtle overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading events schedule..." />
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-charcoal-500">
            No events found. Click "Create New Event" to publish one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-100 text-charcoal-600 uppercase tracking-wider font-semibold border-b border-charcoal-100">
                <tr>
                  <th className="px-6 py-3.5">Event Title</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Date & Venue</th>
                  <th className="px-6 py-3.5">RSVP Status</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-charcoal-900">{evt.title}</p>
                      <p className="text-[11px] text-charcoal-400">{evt.timeString}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-charcoal-700">{evt.category}</td>
                    <td className="px-6 py-4 text-charcoal-600">
                      <p className="font-medium text-charcoal-800">{formatDate(evt.startDate)}</p>
                      <p className="text-[11px] text-charcoal-400 truncate max-w-xs">{evt.venue}</p>
                    </td>
                    <td className="px-6 py-4">
                      {evt.isRegistrationOpen ? (
                        <div className="text-[11px]">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase text-[9px]">
                            RSVP Open
                          </span>
                          <p className="text-charcoal-500 mt-1">
                            {evt.currentRegistrations || 0} / {evt.maxRegistrations || '∞'} Booked
                          </p>
                        </div>
                      ) : (
                        <span className="text-charcoal-400">Walk-in</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(evt)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          evt.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {evt.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(evt)}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-gold-700 hover:bg-ivory-100"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(evt.id)}
                          className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Event"
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
                {editingEvent ? 'Edit Event' : 'Create New Event'}
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
                  Event Title *
                </label>
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Ojhar Diwali Musical Evening"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
                {errors.title && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Event Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Festival">Festival</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Kids">Kids</option>
                    <option value="Music">Music</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Sale & Promo">Sale & Promo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Timing String *
                  </label>
                  <input
                    {...register('timeString')}
                    type="text"
                    placeholder="e.g. 6:30 PM - 10:00 PM"
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Venue / Location *
                </label>
                <input
                  {...register('venue')}
                  type="text"
                  placeholder="e.g. Central Atrium (Ground Floor), Ozone Mall"
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Event Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Full agenda and details..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Banner Image URL *
                </label>
                <input
                  {...register('imageUrl')}
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-charcoal-800">
                  <input
                    {...register('isRegistrationOpen')}
                    type="checkbox"
                    className="w-4 h-4 rounded text-gold-600 focus:ring-0"
                  />
                  <span>Enable Online RSVP Registration</span>
                </label>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Max Registrations (Optional)
                  </label>
                  <input
                    {...register('maxRegistrations')}
                    type="number"
                    placeholder="250"
                    className="w-full px-3 py-1.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500 font-sans"
                  />
                </div>
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
                  <span>Publish to Public Schedule</span>
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
                  {isSaving ? 'Saving...' : editingEvent ? 'Update Event' : 'Publish Event'}
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
        title="Delete Event"
        message="Are you sure you want to cancel and delete this event listing? Registered attendees will not be able to view it anymore."
        confirmText="Delete Event"
      />
    </div>
  );
};
