import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
} from '../dbClient';
import { Enquiry } from '../../types';

const COLLECTION_NAME = 'enquiries';

function getLocalEnquiries(): Enquiry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.enquiries);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalEnquiries(items: Enquiry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.enquiries, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving enquiries to localStorage', e);
  }
}

export async function submitEnquiry(
  data: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Enquiry> {
  const now = new Date().toISOString();
  const enquiryData: Omit<Enquiry, 'id'> = {
    ...data,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(colRef, enquiryData);
      return { id: docRef.id, ...enquiryData };
    } catch (err) {
      console.error('Firestore submitEnquiry error', err);
    }
  }

  const list = getLocalEnquiries();
  const newEnquiry: Enquiry = {
    id: `enq-${Date.now()}`,
    ...enquiryData,
  };
  list.unshift(newEnquiry);
  saveLocalEnquiries(list);
  return newEnquiry;
}

export async function getEnquiries(filterStatus?: string): Promise<Enquiry[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, COLLECTION_NAME);
      const snap = await getDocs(colRef);
      let results: Enquiry[] = [];
      snap.forEach((docSnap) => {
        results.push({ id: docSnap.id, ...docSnap.data() } as Enquiry);
      });
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (filterStatus && filterStatus !== 'all') {
        results = results.filter((e) => e.status === filterStatus);
      }
      return results;
    } catch (err) {
      console.warn('Firestore fetch enquiries error', err);
    }
  }

  let list = getLocalEnquiries();
  if (filterStatus && filterStatus !== 'all') {
    list = list.filter((e) => e.status === filterStatus);
  }
  return list;
}

export async function updateEnquiryStatus(
  id: string,
  status: Enquiry['status'],
  adminNotes?: string
): Promise<Enquiry> {
  const now = new Date().toISOString();
  const updates: Partial<Enquiry> = { status, updatedAt: now };
  if (adminNotes !== undefined) {
    updates.adminNotes = adminNotes;
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, updates);
    } catch (err) {
      console.error('Firestore updateEnquiryStatus error', err);
    }
  }

  const list = getLocalEnquiries();
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) {
    throw new Error(`Enquiry with id ${id} not found`);
  }
  const updated = {
    ...list[index],
    ...updates,
  };
  list[index] = updated;
  saveLocalEnquiries(list);
  return updated;
}

export async function deleteEnquiry(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Firestore deleteEnquiry error', err);
    }
  }

  const list = getLocalEnquiries();
  const filtered = list.filter((e) => e.id !== id);
  saveLocalEnquiries(filtered);
}
