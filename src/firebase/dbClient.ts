import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import {
  INITIAL_STORES,
  INITIAL_OFFERS,
  INITIAL_EVENTS,
  INITIAL_DINING,
  INITIAL_ENTERTAINMENT,
  INITIAL_GALLERY,
  INITIAL_VISITOR_INFO,
  INITIAL_FAQS,
  INITIAL_HOMEPAGE_CONTENT,
  INITIAL_ABOUT_CONTENT,
} from './seed/seedData';

// Local storage keys for resilient offline / demo mode
const LOCAL_STORAGE_KEYS = {
  stores: 'ozone_mall_stores',
  offers: 'ozone_mall_offers',
  events: 'ozone_mall_events',
  dining: 'ozone_mall_dining',
  entertainment: 'ozone_mall_entertainment',
  gallery: 'ozone_mall_gallery',
  faqs: 'ozone_mall_faqs',
  visitorInfo: 'ozone_mall_visitor_info',
  homepageContent: 'ozone_mall_homepage_content',
  aboutContent: 'ozone_mall_about_content',
  enquiries: 'ozone_mall_enquiries',
  eventRegistrations: 'ozone_mall_event_registrations',
};

// Initialize local seed data if not present
function initializeLocalCache() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.stores)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.stores, JSON.stringify(INITIAL_STORES));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.offers)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.offers, JSON.stringify(INITIAL_OFFERS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.events)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.events, JSON.stringify(INITIAL_EVENTS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.dining)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.dining, JSON.stringify(INITIAL_DINING));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.entertainment)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.entertainment, JSON.stringify(INITIAL_ENTERTAINMENT));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.gallery)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.gallery, JSON.stringify(INITIAL_GALLERY));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.faqs)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.faqs, JSON.stringify(INITIAL_FAQS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.visitorInfo)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.visitorInfo, JSON.stringify(INITIAL_VISITOR_INFO));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.homepageContent)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.homepageContent, JSON.stringify(INITIAL_HOMEPAGE_CONTENT));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.aboutContent)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.aboutContent, JSON.stringify(INITIAL_ABOUT_CONTENT));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.enquiries)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.enquiries, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.eventRegistrations)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.eventRegistrations, JSON.stringify([]));
  }
}

// Auto-run local cache initialization
initializeLocalCache();

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
};
