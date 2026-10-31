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
import { DiningOutlet, DiningCategory } from '../../types';
import { INITIAL_DINING } from '../seed/seedData';

const COLLECTION_NAME = 'diningOutlets';

function getLocalDining(): DiningOutlet[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.dining);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.dining, JSON.stringify(INITIAL_DINING));
      return INITIAL_DINING;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DINING;
  }
}

function saveLocalDining(items: DiningOutlet[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.dining, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving dining to localStorage', e);
  }
}

export async function getDiningOutlets(options: {
  category?: DiningCategory | 'All';
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  searchTerm?: string;
} = {}): Promise<DiningOutlet[]> {
  const { category, publishedOnly = false, featuredOnly = false, searchTerm } = options;

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
        constraints.push(where('diningType', '==', category));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      let results: DiningOutlet[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as DiningOutlet);
      });

      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter(
          (d) =>
            d.name.toLowerCase().includes(lower) ||
            d.cuisineType.toLowerCase().includes(lower) ||
            d.description.toLowerCase().includes(lower)
        );
      }
      return results;
    } catch (err) {
      console.warn('Firestore fetch dining error, falling back to local', err);
    }
  }

  let list = getLocalDining();

  if (publishedOnly) {
    list = list.filter((d) => d.isPublished);
  }
  if (featuredOnly) {
    list = list.filter((d) => d.isFeatured);
  }
  if (category && category !== 'All') {
    list = list.filter((d) => d.diningType === category);
  }
  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(lower) ||
        d.cuisineType.toLowerCase().includes(lower) ||
        d.description.toLowerCase().includes(lower)
    );
  }

  return list;
}

export async function getDiningOutletById(id: string): Promise<DiningOutlet | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as DiningOutlet;
      }
    } catch (err) {
      console.warn('Firestore fetch dining by id error', err);
    }
  }

  const list = getLocalDining();
  return list.find((d) => d.id === id) || null;
}

export async function createDiningOutlet(
  data: Omit<DiningOutlet, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DiningOutlet> {
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
      console.error('Firestore createDiningOutlet error', err);
    }
  }

  const list = getLocalDining();
  const newItem: DiningOutlet = {
    ...data,
    id: `dining-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(newItem);
  saveLocalDining(list);
  return newItem;
}

export async function updateDiningOutlet(
  id: string,
  updates: Partial<DiningOutlet>
): Promise<DiningOutlet> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateDiningOutlet error', err);
    }
  }

  const list = getLocalDining();
  const index = list.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error(`Dining outlet with id ${id} not found`);
  }
  const updated = {
    ...list[index],
    ...updates,
    updatedAt: now,
  };
  list[index] = updated;
  saveLocalDining(list);
  return updated;
}

export async function deleteDiningOutlet(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteDiningOutlet error', err);
    }
  }

  const list = getLocalDining();
  const filtered = list.filter((d) => d.id !== id);
  saveLocalDining(filtered);
}
