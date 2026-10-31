import { doc, setDoc, writeBatch, type Firestore } from 'firebase/firestore';
import { db } from '../config';
import {
  INITIAL_STORES,
  INITIAL_OFFERS,
  INITIAL_EVENTS,
  INITIAL_DINING,
  INITIAL_ENTERTAINMENT,
  INITIAL_GALLERY,
  INITIAL_VISITOR_INFO,
  INITIAL_FAQS,
  INITIAL_HOMEPAGE_CONTENT,
  INITIAL_ABOUT_CONTENT,
} from './seedData';

export async function seedFirestoreDatabase(firestoreInstance: Firestore = db!): Promise<{
  success: boolean;
  message: string;
  count: number;
}> {
  if (!firestoreInstance) {
    throw new Error('Firestore instance is not available. Please configure Firebase credentials.');
  }

  let totalCount = 0;
  const batch = writeBatch(firestoreInstance);

  // 1. Stores
  for (const store of INITIAL_STORES) {
    const ref = doc(firestoreInstance, 'stores', store.id);
    batch.set(ref, store);
    totalCount++;
  }

  // 2. Offers
  for (const offer of INITIAL_OFFERS) {
    const ref = doc(firestoreInstance, 'offers', offer.id);
    batch.set(ref, offer);
    totalCount++;
  }

  // 3. Events
  for (const event of INITIAL_EVENTS) {
    const ref = doc(firestoreInstance, 'events', event.id);
    batch.set(ref, event);
    totalCount++;
  }

  // 4. Dining Outlets
  for (const dining of INITIAL_DINING) {
    const ref = doc(firestoreInstance, 'diningOutlets', dining.id);
    batch.set(ref, dining);
    totalCount++;
  }

  // 5. Entertainment
  for (const ent of INITIAL_ENTERTAINMENT) {
    const ref = doc(firestoreInstance, 'entertainment', ent.id);
    batch.set(ref, ent);
    totalCount++;
  }

  // 6. Gallery
  for (const item of INITIAL_GALLERY) {
    const ref = doc(firestoreInstance, 'gallery', item.id);
    batch.set(ref, item);
    totalCount++;
  }

  // 7. Visitor Info
  const visitorRef = doc(firestoreInstance, 'visitorInformation', 'default');
  batch.set(visitorRef, INITIAL_VISITOR_INFO);
  totalCount++;

  // 8. FAQs
  for (const faq of INITIAL_FAQS) {
    const ref = doc(firestoreInstance, 'faqs', faq.id);
    batch.set(ref, faq);
    totalCount++;
  }

  // 9. Site Content
  const homeRef = doc(firestoreInstance, 'siteContent', 'homepage_content');
  batch.set(homeRef, INITIAL_HOMEPAGE_CONTENT);
  totalCount++;

  const aboutRef = doc(firestoreInstance, 'siteContent', 'about_page_content');
  batch.set(aboutRef, INITIAL_ABOUT_CONTENT);
  totalCount++;

  await batch.commit();

  return {
    success: true,
    message: `Successfully seeded ${totalCount} records into Cloud Firestore.`,
    count: totalCount,
  };
}
