import {
  doc,
  getDoc,
  setDoc,
  db,
  isFirebaseConfigured,
  LOCAL_STORAGE_KEYS,
} from '../dbClient';
import { HomepageContent, AboutPageContent } from '../../types';
import { INITIAL_HOMEPAGE_CONTENT, INITIAL_ABOUT_CONTENT } from '../seed/seedData';

const COLLECTION_NAME = 'siteContent';
const HOMEPAGE_DOC_ID = 'homepage_content';
const ABOUT_DOC_ID = 'about_page_content';

function getLocalHomepageContent(): HomepageContent {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.homepageContent);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.homepageContent, JSON.stringify(INITIAL_HOMEPAGE_CONTENT));
      return INITIAL_HOMEPAGE_CONTENT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_HOMEPAGE_CONTENT;
  }
}

function saveLocalHomepageContent(data: HomepageContent) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.homepageContent, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving homepage content', e);
  }
}

function getLocalAboutContent(): AboutPageContent {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.aboutContent);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.aboutContent, JSON.stringify(INITIAL_ABOUT_CONTENT));
      return INITIAL_ABOUT_CONTENT;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ABOUT_CONTENT;
  }
}

function saveLocalAboutContent(data: AboutPageContent) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEYS.aboutContent, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving about content', e);
  }
}

export async function getHomepageContent(): Promise<HomepageContent> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, HOMEPAGE_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as HomepageContent;
      }
    } catch (err) {
      console.warn('Firestore fetch homepage content error, falling back to local', err);
    }
  }

  return getLocalHomepageContent();
}

export async function updateHomepageContent(
  updates: Partial<HomepageContent>
): Promise<HomepageContent> {
  const now = new Date().toISOString();
  const current = getLocalHomepageContent();
  const updated: HomepageContent = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, HOMEPAGE_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.error('Firestore updateHomepageContent error', err);
    }
  }

  saveLocalHomepageContent(updated);
  return updated;
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, ABOUT_DOC_ID);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as AboutPageContent;
      }
    } catch (err) {
      console.warn('Firestore fetch about content error, falling back to local', err);
    }
  }

  return getLocalAboutContent();
}

export async function updateAboutPageContent(
  updates: Partial<AboutPageContent>
): Promise<AboutPageContent> {
  const now = new Date().toISOString();
  const current = getLocalAboutContent();
  const updated: AboutPageContent = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, COLLECTION_NAME, ABOUT_DOC_ID);
      await setDoc(docRef, updated, { merge: true });
    } catch (err) {
      console.error('Firestore updateAboutPageContent error', err);
    }
  }

  saveLocalAboutContent(updated);
  return updated;
}
