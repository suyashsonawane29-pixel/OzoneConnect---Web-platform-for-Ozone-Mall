import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../config';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/avif',
];

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Please upload JPG, PNG, WebP, or SVG.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true };
}

export async function uploadImage(
  file: File,
  folder: 'stores' | 'offers' | 'events' | 'dining' | 'entertainment' | 'gallery' | 'general' = 'general'
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `ozone-mall/${folder}/${timestamp}_${safeName}`;

  if (isFirebaseConfigured && storage) {
    try {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);

      return {
        url: downloadUrl,
        path: storagePath,
        name: file.name,
        size: file.size,
      };
    } catch (err) {
      console.error('Firebase Storage upload error, falling back to local object URL', err);
    }
  }

  // Fallback to local Data URL for instant preview and offline development
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        path: storagePath,
        name: file.name,
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read image file locally.'));
    reader.readAsDataURL(file);
  });
}

export async function deleteImage(storagePath: string): Promise<void> {
  if (isFirebaseConfigured && storage && storagePath.startsWith('ozone-mall/')) {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Failed to delete file from Firebase Storage', err);
    }
  }
}
