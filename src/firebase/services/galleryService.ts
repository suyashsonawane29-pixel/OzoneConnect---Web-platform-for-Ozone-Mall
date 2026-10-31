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
import { GalleryItem } from '../../types';
import { INITIAL_GALLERY } from '../seed/seedData';

const COLLECTION_NAME = 'gallery';

function getLocalGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.gallery);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.gallery, JSON.stringify(INITIAL_GALLERY));
      return INITIAL_GALLERY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_GALLERY;
  }
}

function saveLocalGallery(items: GalleryItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.gallery, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving gallery to localStorage', e);
  }
}

export async function getGalleryItems(options: {
  category?: string;
  publishedOnly?: boolean;
} = {}): Promise<GalleryItem[]> {
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
      const results: GalleryItem[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as GalleryItem);
      });
      return results.sort((a, b) => a.orderIndex - b.orderIndex);
    } catch (err) {
      console.warn('Firestore fetch gallery error, falling back to local', err);
    }
  }

  let list = getLocalGallery();
  if (publishedOnly) {
    list = list.filter((g) => g.isPublished);
  }
  if (category && category !== 'All') {
    list = list.filter((g) => g.category === category);
  }
  return list.sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createGalleryItem(
  data: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<GalleryItem> {
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
      console.error('Firestore createGallery error', err);
    }
  }

  const list = getLocalGallery();
  const newItem: GalleryItem = {
    ...data,
    id: `gal-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  list.push(newItem);
  saveLocalGallery(list);
  return newItem;
}

export async function updateGalleryItem(
  id: string,
  updates: Partial<GalleryItem>
): Promise<GalleryItem> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateGallery error', err);
    }
  }

  const list = getLocalGallery();
  const index = list.findIndex((g) => g.id === id);
  if (index === -1) {
    throw new Error(`Gallery item with id ${id} not found`);
  }
  const updated = {
    ...list[index],
    ...updates,
    updatedAt: now,
  };
  list[index] = updated;
  saveLocalGallery(list);
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteGallery error', err);
    }
  }

  const list = getLocalGallery();
  const filtered = list.filter((g) => g.id !== id);
  saveLocalGallery(filtered);
}
