import { getStores } from './storesService';
import { getOffers } from './offersService';
import { getEvents } from './eventsService';
import { getDiningOutlets } from './diningService';
import { getGalleryItems } from './galleryService';
import { getEnquiries } from './enquiriesService';
import { getOfferStatus } from '../../utils/formatters';

export interface DashboardStats {
  totalStores: number;
  publishedStores: number;
  totalOffers: number;
  activeOffers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalDiningOutlets: number;
  totalGalleryImages: number;
  unresolvedEnquiries: number;
  newEnquiriesCount: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [stores, offers, events, dining, gallery, enquiries] = await Promise.all([
    getStores({ publishedOnly: false }),
    getOffers({ publishedOnly: false }),
    getEvents({ type: 'all', publishedOnly: false }),
    getDiningOutlets({ publishedOnly: false }),
    getGalleryItems({ publishedOnly: false }),
    getEnquiries('all'),
  ]);

  const today = new Date().toISOString().split('T')[0];

  const publishedStores = stores.filter((s) => s.isPublished).length;
  const activeOffers = offers.filter(
    (o) => o.isPublished && getOfferStatus(o.startDate, o.endDate) === 'active'
  ).length;
  const upcomingEvents = events.filter((e) => e.isPublished && e.endDate >= today).length;
  const unresolvedEnquiries = enquiries.filter(
    (e) => e.status === 'new' || e.status === 'in_progress'
  ).length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

  return {
    totalStores: stores.length,
    publishedStores,
    totalOffers: offers.length,
    activeOffers,
    totalEvents: events.length,
    upcomingEvents,
    totalDiningOutlets: dining.length,
    totalGalleryImages: gallery.length,
    unresolvedEnquiries,
    newEnquiriesCount,
  };
}
