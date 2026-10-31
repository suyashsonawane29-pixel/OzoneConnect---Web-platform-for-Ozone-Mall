import {
  doc,
  getDoc,
  setDoc,
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
} from '../dbClient';
import { VisitorInformation } from '../../types';
import { INITIAL_VISITOR_INFO } from '../seed/seedData';

const COLLECTION_NAME = 'visitorInformation';
const DOC_ID = 'default';

function getLocalVisitorInfo(): VisitorInformation {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.visitorInfo);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.visitorInfo, JSON.stringify(INITIAL_VISITOR_INFO));
      return INITIAL_VISITOR_INFO;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_VISITOR_INFO;
  }
}

function saveLocalVisitorInfo(data: VisitorInformation) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.visitorInfo, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving visitor info to localStorage', e);
  }
}

export async function getVisitorInformation(): Promise<VisitorInformation> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as VisitorInformation;
      }
    } catch (err) {
      console.warn('Firestore fetch visitor info error, falling back to local', err);
    }
  }

  return getLocalVisitorInfo();
}

export async function updateVisitorInformation(
  updates: Partial<VisitorInformation>
): Promise<VisitorInformation> {
  const now = new Date().toISOString();
  const current = getLocalVisitorInfo();
  const updated: VisitorInformation = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.error('Firestore update visitor info error', err);
    }
  }

  saveLocalVisitorInfo(updated);
  return updated;
}
