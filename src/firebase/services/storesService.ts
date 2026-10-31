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
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
} from '../dbClient';
import { Store, StoreCategory, FloorLevel } from '../../types';
import { INITIAL_STORES } from '../seed/seedData';
import { slugify } from '../../utils/formatters';

const COLLECTION_NAME = 'stores';

function getLocalStores(): Store[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.stores);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.stores, JSON.stringify(INITIAL_STORES));
      return INITIAL_STORES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STORES;
  }
}

function saveLocalStores(stores: Store[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.stores, JSON.stringify(stores));
  } catch (e) {
    console.error('Error saving stores to localStorage', e);
  }
}

export async function getStores(options: {
  category?: StoreCategory | 'All';
  floor?: FloorLevel | 'All';
  featuredOnly?: boolean;
  publishedOnly?: boolean;
  searchTerm?: string;
} = {}): Promise<Store[]> {
  const { category, floor, featuredOnly, publishedOnly = false, searchTerm } = options;

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
      if (floor && floor !== 'All') {
        constraints.push(where('floor', '==', floor));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      let results: Store[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as Store);
      });

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter(
          (s) =>
            s.name.toLowerCase().includes(lower) ||
            s.description.toLowerCase().includes(lower) ||
            s.category.toLowerCase().includes(lower) ||
            s.tags?.some((t) => t.toLowerCase().includes(lower))
        );
      }
      return results;
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to local cache', err);
    }
  }

  // Fallback to local store cache
  let list = getLocalStores();

  if (publishedOnly) {
    list = list.filter((s) => s.isPublished);
  }
  if (featuredOnly) {
    list = list.filter((s) => s.isFeatured);
  }
  if (category && category !== 'All') {
    list = list.filter((s) => s.category === category);
  }
  if (floor && floor !== 'All') {
    list = list.filter((s) => s.floor === floor);
  }
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.description.toLowerCase().includes(lower) ||
        s.category.toLowerCase().includes(lower) ||
        s.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  }

  return list;
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const q = query(colRef, where('slug', '==', slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as Store;
      }
    } catch (err) {
      console.warn('Firestore fetch failed for store slug', err);
    }
  }

  const list = getLocalStores();
  return list.find((s) => s.slug === slug || s.id === slug) || null;
}

export async function getStoreById(id: string): Promise<Store | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Store;
      }
    } catch (err) {
      console.warn('Firestore fetch failed for store id', err);
    }
  }

  const list = getLocalStores();
  return list.find((s) => s.id === id) || null;
}

export async function createStore(
  data: Omit<Store, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { slug?: string }
): Promise<Store> {
  const now = new Date().toISOString();
  const slug = data.slug || slugify(data.name);

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, {
        ...data,
        slug,
        createdAt: now,
        updatedAt: now,
      });
      return { id: docRef.id, ...data, slug, createdAt: now, updatedAt: now };
    } catch (err) {
      console.error('Firestore createStore error, storing locally', err);
    }
  }

  const stores = getLocalStores();
  const newStore: Store = {
    ...data,
    id: `store-${Date.now()}`,
    slug,
    createdAt: now,
    updatedAt: now,
  };
  stores.unshift(newStore);
  saveLocalStores(stores);
  return newStore;
}

export async function updateStore(id: string, updates: Partial<Store>): Promise<Store> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateStore error', err);
    }
  }

  const stores = getLocalStores();
  const index = stores.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error(`Store with id ${id} not found`);
  }
  const updated = {
    ...stores[index],
    ...updates,
    updatedAt: now,
  };
  stores[index] = updated;
  saveLocalStores(stores);
  return updated;
}

export async function deleteStore(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteStore error', err);
    }
  }

  const stores = getLocalStores();
  const filtered = stores.filter((s) => s.id !== id);
  saveLocalStores(filtered);
}
