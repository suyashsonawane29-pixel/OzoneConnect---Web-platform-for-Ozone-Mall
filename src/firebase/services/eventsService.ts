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
import { EventItem, EventCategory } from '../../types';
import { INITIAL_EVENTS } from '../seed/seedData';

const COLLECTION_NAME = 'events';

function getLocalEvents(): EventItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.events);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.events, JSON.stringify(INITIAL_EVENTS));
      return INITIAL_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EVENTS;
  }
}

function saveLocalEvents(events: EventItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.events, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events to localStorage', e);
  }
}

export async function getEvents(options: {
  category?: EventCategory | 'All';
  type?: 'upcoming' | 'past' | 'all';
  publishedOnly?: boolean;
  featuredOnly?: boolean;
} = {}): Promise<EventItem[]> {
  const { category, type = 'all', publishedOnly = false, featuredOnly = false } = options;
  const today = new Date().toISOString().split('T')[0];

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

      const q = query(colRef, ...constraints);
      const snap = await getDocs(q);
      let results: EventItem[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as EventItem);
      });

      if (type === 'upcoming') {
        results = results.filter((e) => e.endDate >= today);
      } else if (type === 'past') {
        results = results.filter((e) => e.endDate < today);
      }
      return results;
    } catch (err) {
      console.warn('Firestore fetch events error, falling back to local', err);
    }
  }

  let list = getLocalEvents();

  if (publishedOnly) {
    list = list.filter((e) => e.isPublished);
  }
  if (featuredOnly) {
    list = list.filter((e) => e.isFeatured);
  }
  if (category && category !== 'All') {
    list = list.filter((e) => e.category === category);
  }
  if (type === 'upcoming') {
    list = list.filter((e) => e.endDate >= today);
  } else if (type === 'past') {
    list = list.filter((e) => e.endDate < today);
  }

  return list;
}

export async function getEventById(id: string): Promise<EventItem | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as EventItem;
      }
    } catch (err) {
      console.warn('Firestore fetch event by id error', err);
    }
  }

  const list = getLocalEvents();
  return list.find((e) => e.id === id) || null;
}

export async function createEvent(
  data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt' | 'currentRegistrations'> & {
    currentRegistrations?: number;
  }
): Promise<EventItem> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, {
        ...data,
        currentRegistrations: data.currentRegistrations || 0,
        createdAt: now,
        updatedAt: now,
      });
      return {
        id: docRef.id,
        ...data,
        currentRegistrations: data.currentRegistrations || 0,
        createdAt: now,
        updatedAt: now,
      };
    } catch (err) {
      console.error('Firestore createEvent error', err);
    }
  }

  const events = getLocalEvents();
  const newEvent: EventItem = {
    ...data,
    id: `event-${Date.now()}`,
    currentRegistrations: data.currentRegistrations || 0,
    createdAt: now,
    updatedAt: now,
  };
  events.unshift(newEvent);
  saveLocalEvents(events);
  return newEvent;
}

export async function updateEvent(id: string, updates: Partial<EventItem>): Promise<EventItem> {
  const now = new Date().toISOString();

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: now,
      });
    } catch (err) {
      console.error('Firestore updateEvent error', err);
    }
  }

  const events = getLocalEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error(`Event with id ${id} not found`);
  }
  const updated = {
    ...events[index],
    ...updates,
    updatedAt: now,
  };
  events[index] = updated;
  saveLocalEvents(events);
  return updated;
}

export async function deleteEvent(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteEvent error', err);
    }
  }

  const events = getLocalEvents();
  const filtered = events.filter((e) => e.id !== id);
  saveLocalEvents(filtered);
}
