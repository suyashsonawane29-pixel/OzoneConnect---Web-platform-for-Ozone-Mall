import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
} from '../dbClient';
import { EventRegistration } from '../../types';
import { updateEvent, getEventById } from './eventsService';

const COLLECTION_NAME = 'eventRegistrations';

function getLocalRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.eventRegistrations);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalRegistrations(items: EventRegistration[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.eventRegistrations, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving registrations', e);
  }
}

export async function registerForEvent(
  data: Omit<EventRegistration, 'id' | 'createdAt' | 'status'>
): Promise<EventRegistration> {
  const now = new Date().toISOString();
  const registration: Omit<EventRegistration, 'id'> = {
    ...data,
    status: 'confirmed',
    createdAt: now,
  };

  // Check event capacity
  const event = await getEventById(data.eventId);
  if (event) {
    if (event.maxRegistrations && (event.currentRegistrations || 0) >= event.maxRegistrations) {
      throw new Error('This event has reached full registration capacity.');
    }
    // Update registration count
    await updateEvent(data.eventId, {
      currentRegistrations: (event.currentRegistrations || 0) + (data.numberOfGuests || 1),
    });
  }

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, registration);
      return { id: docRef.id, ...registration };
    } catch (err) {
      console.error('Firestore registerForEvent error', err);
    }
  }

  const list = getLocalRegistrations();
  const newReg: EventRegistration = {
    id: `reg-${Date.now()}`,
    ...registration,
  };
  list.unshift(newReg);
  saveLocalRegistrations(list);
  return newReg;
}

export async function getRegistrationsForEvent(eventId: string): Promise<EventRegistration[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const q = query(colRef, where('eventId', '==', eventId));
      const snap = await getDocs(q);
      const results: EventRegistration[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as EventRegistration);
      });
      return results;
    } catch (err) {
      console.warn('Firestore fetch registrations error', err);
    }
  }

  const list = getLocalRegistrations();
  return list.filter((r) => r.eventId === eventId);
}

export async function getRegistrationsByEmail(email: string): Promise<EventRegistration[]> {
  if (!email) return [];
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const q = query(colRef, where('email', '==', email.toLowerCase().trim()));
      const snap = await getDocs(q);
      const results: EventRegistration[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as EventRegistration);
      });
      return results;
    } catch (err) {
      console.warn('Firestore fetch registrations by email error', err);
    }
  }

  const list = getLocalRegistrations();
  return list.filter((r) => r.email.toLowerCase().trim() === email.toLowerCase().trim());
}
