export type StoreCategory =
  | 'Fashion'
  | 'Electronics'
  | 'Beauty & Personal Care'
  | 'Lifestyle'
  | 'Food & Dining'
  | 'Entertainment'
  | 'Other';

export type FloorLevel =
  | 'Lower Ground (LG)'
  | 'Ground Floor (G)'
  | 'First Floor (1F)'
  | 'Second Floor (2F)'
  | 'Third Floor (3F)'
  | 'Food Court';

export interface Store {
  id: string;
  name: string;
  slug: string;
  category: StoreCategory;
  subCategory?: string;
  floor: FloorLevel;
  unitNumber: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours: string;
  description: string;
  shortDescription: string;
  logoUrl: string;
  coverImageUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  tags?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title: string;
  storeId?: string;
  storeName: string;
  category: StoreCategory;
  discountText: string;
  badgeText?: string;
  description: string;
  terms: string;
  imageUrl: string;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'Cultural'
  | 'Festival'
  | 'Fashion'
  | 'Kids'
  | 'Music'
  | 'Workshop'
  | 'Sale & Promo'
  | 'Other';

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  venue: string;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;   // ISO date YYYY-MM-DD
  timeString: string;
  imageUrl: string;
  isFeatured: boolean;
  isPublished: boolean;
  isRegistrationOpen: boolean;
  maxRegistrations?: number;
  currentRegistrations?: number;
  createdAt: string;
  updatedAt: string;
}

export type DiningCategory =
  | 'Casual Dining'
  | 'Food Court'
  | 'Quick Bites'
  | 'Fine Dining'
  | 'Cafe & Bakery'
  | 'Beverages & Desserts';

export interface DiningOutlet {
  id: string;
  name: string;
  diningType: DiningCategory;
  cuisineType: string; // e.g. "North Indian, Continental, Asian"
  floor: FloorLevel;
  unitNumber: string;
  phone?: string;
  openingHours: string;
  averageCostForTwo?: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  menuUrls?: string[];
  features?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EntertainmentActivity {
  id: string;
  title: string;
  type: 'Cinema' | 'Arcade' | 'Bowling' | 'Kids Zone' | 'VR Gaming' | 'Live Arena';
  floor: FloorLevel;
  unitNumber: string;
  openingHours: string;
  priceRange?: string;
  description: string;
  coverImageUrl: string;
  galleryUrls?: string[];
  bookingUrl?: string;
  features?: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Architecture' | 'Shopping' | 'Dining' | 'Events' | 'Entertainment' | 'Atmosphere';
  imageUrl: string;
  description?: string;
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisitorInformation {
  id: string;
  mallName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  openingHoursWeekday: string;
  openingHoursWeekend: string;
  parkingInfo: string;
  publicTransportInfo: string;
  accessibilityInfo: string;
  amenities: {
    title: string;
    description: string;
    icon: string;
  }[];
  googleMapsEmbedUrl?: string;
  googleMapsDirectionsUrl?: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Timings' | 'Parking' | 'Services' | 'Events & Offers';
  orderIndex: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phone: string;
  numberOfGuests: number;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface HomepageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  heroCtaPrimaryText: string;
  heroCtaPrimaryLink: string;
  heroCtaSecondaryText: string;
  heroCtaSecondaryLink: string;
  statsSection: {
    label: string;
    value: string;
  }[];
  announcementBanner?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  featuredHighlights: {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
  }[];
  updatedAt: string;
}

export interface AboutPageContent {
  mainTitle: string;
  subtitle: string;
  storyParagraphs: string[];
  bannerImageUrl: string;
  visionTitle: string;
  visionText: string;
  missionTitle: string;
  missionText: string;
  features: {
    title: string;
    description: string;
  }[];
  updatedAt: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor';
}
