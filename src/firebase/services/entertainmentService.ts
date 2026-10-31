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
import { EntertainmentActivity } from '../../types';
import { INITIAL_ENTERTAINMENT } from '../seed/seedData';

const COLLECTION_NAME = 'entertainment';

function getLocalEntertainment(): EntertainmentActivity[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.entertainment);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.entertainment, JSON.stringify(INITIAL_ENTERTAINMENT));
      return INITIAL_ENTERTAINMENT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENTERTAINMENT;
  }
}

function saveLocalEntertainment(items: EntertainmentActivity[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.entertainment, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving entertainment to localStorage', e);
  }
}

export async function getEntertainmentActivities(options: {
  publishedOnly?: boolean;
  featuredOnly?: boolean;
} = {}): Promise<EntertainmentActivity[]> {
  const { publishedOnly = false, featuredOnly = false } = options;

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

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      const results: EntertainmentActivity[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as EntertainmentActivity);
      });
      return results;
    } catch (err) {
      console.warn('Firestore fetch entertainment error, falling back to local', err);
    }
  }

  let list = getLocalEntertainment();
  if (publishedOnly) {
    list = list.filter((i) => i.isPublished);
  }
  if (featuredOnly) {
    list = list.filter((i) => i.isFeatured);
  }
  return list;
}

export async function getEntertainmentActivityById(id: string): Promise<EntertainmentActivity | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as EntertainmentActivity;
      }
    } catch (err) {
      console.warn('Firestore fetch entertainment by id error', err);
    }
  }

  const list = getLocalEntertainment();
  return list.find((i) => i.id === id) || null;
}

export async function createEntertainmentActivity(
  data: Omit<EntertainmentActivity, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EntertainmentActivity> {
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
      console.error('Firestore createEntertainment error', err);
    }
  }

  const list = getLocalEntertainment();
  const newItem: EntertainmentActivity = {
    ...data,
    id: `ent-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(newItem);
  saveLocalEntertainment(list);
  return newItem;
}

export async function updateEntertainmentActivity(
  id: string,
  updates: Partial<EntertainmentActivity>
): Promise<EntertainmentActivity> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateEntertainment error', err);
    }
  }

  const list = getLocalEntertainment();
  const index = list.findIndex((i) => i.id === id);
  if (index === -1) {
    throw new Error(`Entertainment activity with id ${id} not found`);
  }
  const updated = {
    ...list[index],
    ...updates,
    updatedAt: now,
  };
  list[index] = updated;
  saveLocalEntertainment(list);
  return updated;
}

export async function deleteEntertainmentActivity(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteEntertainment error', err);
    }
  }

  const list = getLocalEntertainment();
  const filtered = list.filter((i) => i.id !== id);
  saveLocalEntertainment(filtered);
}
