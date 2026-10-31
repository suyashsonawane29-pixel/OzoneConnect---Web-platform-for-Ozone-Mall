import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHero } from '../../components/common/PageHero';
import { submitEnquiry } from '../../firebase/services/enquiriesService';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().max(0, 'Spam detected'), // Hidden honeypot field
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      honeypot: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await submitEnquiry({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
      });
      setSubmitted(true);
      reset();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24">
      <PageHero
        badge="Connect With Us"
        title="We'd Love to Hear From You"
        subtitle="CONTACT & ENQUIRIES"
        description="Have a question about store leasing, upcoming events, customer feedback, or lost & found? Our management desk is here to assist."
        breadcrumbs={[{ label: 'Contact Us' }]}
        imageUrl="https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl overflow-hidden border border-charcoal-100 shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Direct Contact Details */}
          <div className="lg:col-span-5 bg-charcoal-950 text-white p-8 sm:p-12 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gold-400 font-sans">
                  Direct Inquiries
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Ozone Mall Management
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-300 font-light mt-2 leading-relaxed">
                  Our customer service team responds to all website enquiries within 24 business hours.
                </p>
              </div>

              <div className="space-y-6 text-xs text-charcoal-300">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gold-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Mall Address</p>
                    <p className="mt-1 leading-relaxed">
                      Mumbai-Agra National Highway (NH-3), Ojhar (Ozar), Nashik District, Maharashtra 422206
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gold-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Helpline Numbers</p>
                    <p className="mt-1">+91 253 278 1000</p>
                    <p>+91 98220 54321 (Guest Care)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gold-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Email Inquiries</p>
                    <p className="mt-1">info@ozonemallojhar.com</p>
                    <p>leasing@ozonemallojhar.com (Retail Leasing)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-gold-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Operational Timings</p>
                    <p className="mt-1">Monday – Friday: 10:00 AM – 10:00 PM</p>
                    <p>Saturday – Sunday: 10:00 AM – 10:30 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-charcoal-800 mt-8">
              <div className="flex items-center gap-2 text-xs text-charcoal-400">
                <Shield className="w-4 h-4 text-gold-500" />
                <span>Your contact submissions are encrypted and strictly private.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 bg-white flex flex-col justify-center">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-charcoal-950">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Ozone Mall, Ojhar. Our guest services desk has received your message and will review it shortly.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 text-white hover:bg-gold-600 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gold-600 font-sans">
                  Send a Message
                </span>
                <h3 className="font-serif text-2xl font-bold text-charcoal-950 mt-1 mb-2">
                  How Can We Help You?
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-500 mb-6 font-light">
                  Please complete the form below. All fields marked with * are required.
                </p>

                {errorMsg && (
                  <div className="p-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Anti-spam honeypot (hidden from human visitors) */}
                  <input
                    type="text"
                    {...register('honeypot')}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="e.g. Aditi Kulkarni"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-sans"
                      />
                      {errors.name && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="aditi@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-sans"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Phone Number (Optional)
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        placeholder="+91 98XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                        Subject / Topic *
                      </label>
                      <input
                        {...register('subject')}
                        type="text"
                        placeholder="e.g. Store Inquiry / Lost & Found"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-sans"
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-red-500 mt-1">{errors.subject.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Please describe how we can assist you..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-100 border border-charcoal-200 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500 font-sans"
                    />
                    {errors.message && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-charcoal-900 hover:bg-gold-600 text-white transition-all shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 mr-2" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
