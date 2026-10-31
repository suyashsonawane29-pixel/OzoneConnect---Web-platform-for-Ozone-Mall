import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getEventById } from '../../firebase/services/eventsService';
import { registerForEvent } from '../../firebase/services/eventRegistrationsService';
import { EventItem, EventRegistration } from '../../types';
import { formatDate } from '../../utils/formatters';

const registrationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  numberOfGuests: z.coerce.number().min(1, 'Minimum 1 attendee').max(5, 'Maximum 5 per registration'),
  notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [registerSuccess, setRegisterSuccess] = useState<EventRegistration | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      numberOfGuests: 1,
    },
  });

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const found = await getEventById(id);
        setEvent(found);
      } catch (err) {
        console.error('Failed to load event details', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const onRegister = async (data: RegistrationFormData) => {
    if (!event) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const reg = await registerForEvent({
        eventId: event.id,
        eventTitle: event.title,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        numberOfGuests: data.numberOfGuests,
        notes: data.notes,
      });
      setRegisterSuccess(reg);
      reset();
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event?.title} at Ozone Mall Ojhar`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading event schedule..." />;
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl font-bold text-charcoal-900 mb-4">Event Not Found</h2>
        <p className="text-sm text-charcoal-500 mb-8">
          The requested event could not be found or has concluded.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 text-white hover:bg-gold-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events Calendar
        </Link>
      </div>
    );
  }

  const isPast = new Date(event.endDate) < new Date(new Date().toISOString().split('T')[0]);

  return (
    <div className="pb-24">
      {/* Event Header Banner */}
      <div className="relative h-80 sm:h-[420px] w-full bg-charcoal-950 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-medium backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Events Calendar</span>
          </Link>
        </div>

        <div className="absolute bottom-8 left-4 sm:left-8 right-4 sm:right-8 max-w-7xl mx-auto flex items-end justify-between">
          <div className="max-w-3xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-500 text-charcoal-950 mb-3 inline-block shadow-md">
              {event.category}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-300 mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gold-400" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-400" />
                {event.timeString}
              </span>
            </p>
          </div>

          <button
            onClick={handleShare}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-colors border border-white/20"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-gold-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        <Breadcrumbs
          items={[
            { label: 'Events Calendar', path: '/events' },
            { label: event.category },
            { label: event.title },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-charcoal-100 shadow-subtle space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
                Event Overview
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed font-light whitespace-pre-line">
                {event.description}
              </p>

              <div className="p-6 rounded-2xl bg-ivory-100 border border-charcoal-200/80 space-y-3">
                <h4 className="font-serif text-sm font-bold text-charcoal-900">
                  Visitor Information for this Event
                </h4>
                <ul className="text-xs text-charcoal-600 space-y-1.5 list-disc pl-4">
                  <li>Please arrive 15 minutes before the scheduled start time.</li>
                  <li>Complimentary basement parking is available with your registration pass.</li>
                  <li>Family-friendly environment with dedicated seating for seniors and children.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Venue Card & Registration Form */}
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle space-y-4">
              <h3 className="font-serif text-lg font-bold text-charcoal-900 pb-3 border-b border-charcoal-100">
                Venue & Schedule
              </h3>

              <div className="space-y-3 text-xs text-charcoal-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">Event Location</p>
                    <p>{event.venue}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">Date</p>
                    <p>{formatDate(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-charcoal-900">Timing</p>
                    <p>{event.timeString}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-charcoal-100 shadow-subtle">
              {isPast ? (
                <div className="text-center py-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-100 text-charcoal-600 inline-block mb-3">
                    Event Concluded
                  </span>
                  <p className="text-xs text-charcoal-500">
                    This event has already taken place. Stay tuned for future editions!
                  </p>
                </div>
              ) : registerSuccess ? (
                /* Confirmation Pass */
                <div className="text-center space-y-4 py-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">
                    RSVP Confirmed!
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Thank you, <span className="font-bold">{registerSuccess.fullName}</span>. Your digital pass for {registerSuccess.numberOfGuests} guest(s) is registered.
                  </p>

                  <div className="p-4 rounded-xl bg-ivory-100 border border-charcoal-200 text-left text-xs space-y-1 font-mono">
                    <p className="text-[10px] text-charcoal-400 uppercase font-sans">Confirmation ID</p>
                    <p className="font-bold text-charcoal-900">{registerSuccess.id}</p>
                    <p className="text-charcoal-500">{registerSuccess.email}</p>
                  </div>

                  <button
                    onClick={() => setRegisterSuccess(null)}
                    className="text-xs text-gold-700 hover:text-gold-900 font-semibold"
                  >
                    Register another guest
                  </button>
                </div>
              ) : event.isRegistrationOpen ? (
                /* Registration Form */
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">
                    Reserve Your Seat
                  </h3>
                  <p className="text-xs text-charcoal-500 mb-5">
                    Admission is complimentary. Reserve your digital pass below.
                  </p>

                  {submitError && (
                    <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        {...register('fullName')}
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                      {errors.fullName && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="rahul@example.com"
                        className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          {...register('phone')}
                          type="tel"
                          placeholder="98XXXXXXXX"
                          className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                        />
                        {errors.phone && (
                          <p className="text-[11px] text-red-500 mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                          Guests *
                        </label>
                        <input
                          {...register('numberOfGuests')}
                          type="number"
                          min="1"
                          max="5"
                          className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                        />
                        {errors.numberOfGuests && (
                          <p className="text-[11px] text-red-500 mt-1">
                            {errors.numberOfGuests.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        {...register('notes')}
                        rows={2}
                        placeholder="Wheelchair assistance or questions..."
                        className="w-full px-3 py-2 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-gold-600 hover:bg-gold-500 text-charcoal-950 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Securing Pass...' : 'Confirm RSVP'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-100 text-gold-800 inline-block mb-3">
                    Open Attendance
                  </span>
                  <p className="text-xs text-charcoal-600">
                    No prior registration required for this showcase. All mall visitors are warmly invited!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
