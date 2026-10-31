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
import { FAQ } from '../../types';
import { INITIAL_FAQS } from '../seed/seedData';

const COLLECTION_NAME = 'faqs';

function getLocalFaqs(): FAQ[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.faqs);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.faqs, JSON.stringify(INITIAL_FAQS));
      return INITIAL_FAQS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FAQS;
  }
}

function saveLocalFaqs(items: FAQ[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.faqs, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving FAQs to localStorage', e);
  }
}

export async function getFaqs(options: {
  category?: string;
  publishedOnly?: boolean;
} = {}): Promise<FAQ[]> {
  const { category, publishedOnly = false } = options;

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const constraints: any[] = [];
      if (publishedOnly) {
        constraints.push(where('isPublished', '==', true));
      }
      if (category && category !== 'All') {
        constraints.push(where('category', '==', category));
      }

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      const results: FAQ[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as FAQ);
      });
      return results.sort((a, b) => a.orderIndex - b.orderIndex);
    } catch (err) {
      console.warn('Firestore fetch faqs error, falling back to local', err);
    }
  }

  let list = getLocalFaqs();
  if (publishedOnly) {
    list = list.filter((f) => f.isPublished);
  }
  if (category && category !== 'All') {
    list = list.filter((f) => f.category === category);
  }
  return list.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createFaq(
  data: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FAQ> {
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
      console.error('Firestore createFaq error', err);
    }
  }

  const list = getLocalFaqs();
  const newItem: FAQ = {
    ...data,
    id: `faq-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  list.push(newItem);
  saveLocalFaqs(list);
  return newItem;
}

export async function updateFaq(id: string, updates: Partial<FAQ>): Promise<FAQ> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateFaq error', err);
    }
  }

  const list = getLocalFaqs();
  const index = list.findIndex((f) => f.id === id);
  if (index === -1) {
    throw new Error(`FAQ with id ${id} not found`);
  }
  const updated = {
    ...list[index],
    ...updates,
    updatedAt: now,
  };
  list[index] = updated;
  saveLocalFaqs(list);
  return updated;
}

export async function deleteFaq(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteFaq error', err);
    }
  }

  const list = getLocalFaqs();
  const filtered = list.filter((f) => f.id !== id);
  saveLocalFaqs(filtered);
}
