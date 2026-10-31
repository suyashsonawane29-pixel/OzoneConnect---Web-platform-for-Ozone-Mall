import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
} from '../dbClient';
import { Offer, StoreCategory } from '../../types';
import { INITIAL_OFFERS } from '../seed/seedData';
import { getOfferStatus } from '../../utils/formatters';

const COLLECTION_NAME = 'offers';

function getLocalOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.offers);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.offers, JSON.stringify(INITIAL_OFFERS));
      return INITIAL_OFFERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_OFFERS;
  }
}

function saveLocalOffers(offers: Offer[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.offers, JSON.stringify(offers));
  } catch (e) {
    console.error('Error saving offers to localStorage', e);
  }
}

export async function getOffers(options: {
  category?: StoreCategory | 'All';
  storeId?: string;
  activeOnly?: boolean;
  publishedOnly?: boolean;
  featuredOnly?: boolean;
} = {}): Promise<Offer[]> {
  const { category, storeId, activeOnly = false, publishedOnly = false, featuredOnly = false } = options;

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const constraints: any[] = [];
      if (publishedOnly) {
        constraints.push(where('isPublished', '==', true));
      }
      if (featuredOnly) {
        constraints.push(where('isFeatured', '==', true));
      }
      if (category && category !== 'All') {
        constraints.push(where('category', '==', category));
      }
      if (storeId) {
        constraints.push(where('storeId', '==', storeId));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      let results: Offer[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as Offer);
      });

      if (activeOnly) {
        results = results.filter((o) => getOfferStatus(o.startDate, o.endDate) === 'active');
      }
      return results;
    } catch (err) {
      console.warn('Firestore fetch offers failed, falling back to local', err);
    }
  }

  let list = getLocalOffers();

  if (publishedOnly) {
    list = list.filter((o) => o.isPublished);
  }
  if (featuredOnly) {
    list = list.filter((o) => o.isFeatured);
  }
  if (category && category !== 'All') {
    list = list.filter((o) => o.category === category);
  }
  if (storeId) {
    list = list.filter((o) => o.storeId === storeId);
  }
  if (activeOnly) {
    list = list.filter((o) => getOfferStatus(o.startDate, o.endDate) === 'active');
  }

  return list;
}

export async function getOfferById(id: string): Promise<Offer | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Offer;
      }
    } catch (err) {
      console.warn('Firestore fetch offer by id error', err);
    }
  }

  const list = getLocalOffers();
  return list.find((o) => o.id === id) || null;
}

export async function createOffer(
  data: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Offer> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
    } catch (err) {
      console.error('Firestore createOffer error', err);
    }
  }

  const offers = getLocalOffers();
  const newOffer: Offer = {
    ...data,
    id: `offer-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  offers.unshift(newOffer);
  saveLocalOffers(offers);
  return newOffer;
}

export async function updateOffer(id: string, updates: Partial<Offer>): Promise<Offer> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateOffer error', err);
    }
  }

  const offers = getLocalOffers();
  const index = offers.findIndex((o) => o.id === id);
  if (index === -1) {
    throw new Error(`Offer with id ${id} not found`);
  }
  const updated = {
    ...offers[index],
    ...updates,
    updatedAt: now,
  };
  offers[index] = updated;
  saveLocalOffers(offers);
  return updated;
}

export async function deleteOffer(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteOffer error', err);
    }
  }

  const offers = getLocalOffers();
  const filtered = offers.filter((o) => o.id !== id);
  saveLocalOffers(filtered);
}
