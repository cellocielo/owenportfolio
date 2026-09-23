/**
 * Persistent Image Storage Utility
 * Allows users to input/upload images for any project in any racket zone,
 * persisting them permanently with automatic high-quality compression,
 * HEIC/HEIF conversion, video support, and IndexedDB + localStorage backing.
 */

const STORAGE_KEY = 'portfolio_custom_zone_images';
const DB_NAME = 'portfolio_images_db';
const STORE_NAME = 'custom_images';

// In-memory cache for synchronous instant access
const memoryCache: Record<string, string> = {};

// Initialize memory cache from localStorage
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(memoryCache, parsed);
    }
  }
} catch (err) {
  console.warn('Failed to initialize image cache from localStorage', err);
}

// IndexedDB setup for virtually unlimited storage (prevents LocalStorage 5MB quota errors)
function openImagesDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(key: string, value: string): Promise<void> {
  try {
    const db = await openImagesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save image to IndexedDB', err);
  }
}

async function removeFromIndexedDB(key: string): Promise<void> {
  try {
    const db = await openImagesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to remove image from IndexedDB', err);
  }
}

async function loadAllFromIndexedDB(): Promise<Record<string, string>> {
  try {
    const db = await openImagesDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const all: Record<string, string> = {};
      const cursorReq = store.openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          all[cursor.key as string] = cursor.value as string;
          cursor.continue();
        } else {
          resolve(all);
        }
      };
      cursorReq.onerror = () => reject(cursorReq.error);
    });
  } catch {
    return {};
  }
}

// Hydrate from IndexedDB on startup to merge any images that exceeded LocalStorage quota
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      let modified = false;
      for (const k of Object.keys(parsed)) {
        if (k.includes('music') && (parsed[k] === '/IMG_0904.MOV' || parsed[k]?.includes('.MOV') || parsed[k]?.includes('.mp4'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stored image or video for nature-based slide so prototype video plays reliably
        if (k.includes('nature') || k.includes('recreation') || k.includes('friction') || k.includes('cpm') || (parsed[k]?.includes('IMG_0904') && !k.includes('hero'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stale coaching images so IMG_1586.jpg is used permanently
        if (k.includes('coaching') && (parsed[k]?.includes('IMG_3371') || parsed[k]?.startsWith('data:image/'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stale TFT sweetspot images so the configured portfolioData images are used permanently
        if (
          k.includes('sweetspot') &&
          (k.includes('tft') || k.includes('tomorrow') || k.includes('scaling') || k.includes('teaching') || k.includes('starter'))
        ) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stale unity simulation images so unity_livingfootprints_ss.png is used permanently
        if ((k.includes('unity') || k.includes('simulation')) && (parsed[k]?.startsWith('data:image/') || !parsed[k]?.includes('unity'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stale spritz images so spritz_ss.png is used permanently
        if (k.includes('spritz') && (parsed[k]?.startsWith('data:image/') || !parsed[k]?.includes('spritz'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stale strike system images so IMG_9961.jpg is used permanently
        if (k.includes('strike') && (parsed[k]?.startsWith('data:image/') || !parsed[k]?.includes('9961'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
        // Purge any stale TFT grip operations images so t4t_starter_guide_ss.png is used permanently
        if (((k.includes('grip') && k.includes('tft')) || k.includes('tft_operations')) && (parsed[k]?.startsWith('data:image/') || !parsed[k]?.includes('starter'))) {
          delete parsed[k];
          delete memoryCache[k];
          removeFromIndexedDB(k);
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
    }
  } catch {}

  loadAllFromIndexedDB().then((idbImages) => {
    let updated = false;
    for (const [k, v] of Object.entries(idbImages)) {
      if (k.includes('nature') || k.includes('recreation') || k.includes('friction') || k.includes('cpm') || (v.includes('IMG_0904') && !k.includes('hero'))) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if (k.includes('coaching') && (v.includes('IMG_3371') || v.startsWith('data:image/'))) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if (
        k.includes('sweetspot') &&
        (k.includes('tft') || k.includes('tomorrow') || k.includes('scaling') || k.includes('teaching') || k.includes('starter'))
      ) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if ((k.includes('unity') || k.includes('simulation')) && (v.startsWith('data:image/') || !v.includes('unity'))) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if (k.includes('spritz') && (v.startsWith('data:image/') || !v.includes('spritz'))) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if (k.includes('strike') && (v.startsWith('data:image/') || !v.includes('9961'))) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if (((k.includes('grip') && k.includes('tft')) || k.includes('tft_operations')) && (v.startsWith('data:image/') || !v.includes('starter'))) {
        removeFromIndexedDB(k);
        delete memoryCache[k];
        continue;
      }
      if (!memoryCache[k]) {
        memoryCache[k] = v;
        updated = true;
      }
    }
    if (updated) {
      window.dispatchEvent(new CustomEvent('custom-images-updated', { detail: { hydrated: true } }));
    }
  });
}

// Helper to get all saved images
export function getAllCustomImages(): Record<string, string> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const fromStorage = raw ? JSON.parse(raw) : {};
    return { ...fromStorage, ...memoryCache };
  } catch (err) {
    console.warn('Failed to load custom images from localStorage', err);
    return { ...memoryCache };
  }
}

// Generate unique key for a project in a zone
export function getProjectImageKey(
  zone: string,
  projectName: string,
  projectBadge?: string,
  projectId?: string
): string {
  const zoneKey = zone.trim().toLowerCase();

  // 1. If explicit projectId is provided, prioritize it
  if (projectId) {
    return `${zoneKey}_${projectId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`;
  }

  // 2. If projectBadge is provided, use name + badge to keep different slides with same name unique
  const nameKey = projectName.trim().toLowerCase().replace(/\s+/g, '_');
  if (projectBadge) {
    const badgeKey = projectBadge.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return `${zoneKey}_${nameKey}_${badgeKey}`;
  }

  // 3. Fallback to zone + name
  return `${zoneKey}_${nameKey}`;
}

// Get saved image for a specific project
export function getCustomImage(
  zone: string,
  projectName: string,
  projectBadge?: string,
  projectId?: string
): string | null {
  // Nature-Based slide must strictly play its official prototype video asset
  if (
    (projectName && (projectName.toLowerCase().includes('nature') || projectName.toLowerCase().includes('recreation'))) ||
    (projectId && (projectId.includes('nature') || projectId.includes('cpm'))) ||
    (projectBadge && (projectBadge.toLowerCase().includes('friction') || projectBadge.toLowerCase().includes('eco')))
  ) {
    return null;
  }

  const specificKey = getProjectImageKey(zone, projectName, projectBadge, projectId);
  if (memoryCache[specificKey]) return memoryCache[specificKey];

  const all = getAllCustomImages();
  if (all[specificKey]) return all[specificKey];

  // If called with projectId, also check name+badge fallback
  if (projectId && projectBadge) {
    const badgeKey = getProjectImageKey(zone, projectName, projectBadge);
    if (memoryCache[badgeKey]) return memoryCache[badgeKey];
    if (all[badgeKey]) return all[badgeKey];
  }

  // Handle legacy keys:
  // For 'Tech For Tomorrow', there are two different slides (Scaling Stats & Teaching/Literacy)
  // We strictly prevent both slides from sharing a single ambiguous legacy key.
  const isTft = projectName.trim().toLowerCase() === 'tech for tomorrow';
  if (!isTft) {
    const legacyKey = `${zone.trim().toLowerCase()}_${projectName.trim().toLowerCase().replace(/\s+/g, '_')}`;
    if (memoryCache[legacyKey]) return memoryCache[legacyKey];
    if (all[legacyKey]) return all[legacyKey];
  } else if (projectId === 'tft-scaling' || projectBadge === 'Scaling Stats') {
    // If tft-scaling has no specific image yet, check if there was an image under the legacy key
    const legacyKey = `${zone.trim().toLowerCase()}_${projectName.trim().toLowerCase().replace(/\s+/g, '_')}`;
    if (memoryCache[legacyKey]) return memoryCache[legacyKey];
    if (all[legacyKey]) return all[legacyKey];
  }

  return null;
}

// Save image URL or dataUrl for a specific project
export function saveCustomImage(
  zone: string,
  projectName: string,
  imageSrc: string,
  projectBadge?: string,
  projectId?: string
): void {
  const specificKey = getProjectImageKey(zone, projectName, projectBadge, projectId);
  memoryCache[specificKey] = imageSrc;

  // Persist in IndexedDB (virtually unlimited quota)
  saveToIndexedDB(specificKey, imageSrc);

  // Also persist in LocalStorage for fast synchronous bootstrap
  try {
    const all = getAllCustomImages();
    all[specificKey] = imageSrc;

    // If saving for Tech For Tomorrow, remove ambiguous legacy key so both slides are fully independent
    if (projectName.trim().toLowerCase() === 'tech for tomorrow') {
      const legacyKey = `${zone.trim().toLowerCase()}_${projectName.trim().toLowerCase().replace(/\s+/g, '_')}`;
      delete all[legacyKey];
      delete memoryCache[legacyKey];
      removeFromIndexedDB(legacyKey);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.warn('LocalStorage quota reached, image safely retained in IndexedDB and memory cache', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-images-updated', { detail: { key: specificKey, imageSrc } }));
  }
}

// Remove custom image for a project (resets to default)
export function removeCustomImage(
  zone: string,
  projectName: string,
  projectBadge?: string,
  projectId?: string
): void {
  const specificKey = getProjectImageKey(zone, projectName, projectBadge, projectId);
  delete memoryCache[specificKey];
  removeFromIndexedDB(specificKey);

  const legacyKey = `${zone.trim().toLowerCase()}_${projectName.trim().toLowerCase().replace(/\s+/g, '_')}`;
  delete memoryCache[legacyKey];
  removeFromIndexedDB(legacyKey);

  let badgeKey = '';
  if (projectBadge) {
    badgeKey = getProjectImageKey(zone, projectName, projectBadge);
    delete memoryCache[badgeKey];
    removeFromIndexedDB(badgeKey);
  }

  try {
    const all = getAllCustomImages();
    delete all[specificKey];
    delete all[legacyKey];
    if (badgeKey) delete all[badgeKey];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to remove custom image from localStorage', err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('custom-images-updated', { detail: { key: specificKey, imageSrc: null } }));
  }
}

// Read File/Blob as Data URL safely
function readFileAsDataURL(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as Data URL'));
    reader.readAsDataURL(file);
  });
}

// Convert HEIC/HEIF blob to standard JPEG blob using heic2any
async function convertHeicToJpeg(file: Blob): Promise<Blob> {
  try {
    const heic2anyModule = await import('heic2any');
    const heic2anyFn = (heic2anyModule.default || heic2anyModule) as (options: {
      blob: Blob;
      toType?: string;
      quality?: number;
    }) => Promise<Blob | Blob[]>;

    const converted = await heic2anyFn({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    if (Array.isArray(converted)) {
      return converted[0];
    }
    return converted;
  } catch (err) {
    console.warn('heic2any conversion fallback', err);
    return file;
  }
}

// Resize and compress an image file to high-res, storage-safe DataURL (~250KB)
export async function processImageFile(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  // 1. If it is a video or animated GIF, read directly as DataURL without decoding through canvas
  const isVideo = fileType.startsWith('video/') || /\.(mov|mp4|webm|m4v|ogv|mkv)$/i.test(fileName);
  const isGif = fileType.includes('gif') || /\.gif$/i.test(fileName);
  if (isVideo) {
    if (file.size > 80 * 1024 * 1024) {
      throw new Error('Video file exceeds 80MB. Please use a compressed clip or enter a video URL/path.');
    }
    return await readFileAsDataURL(file);
  }
  if (isGif) {
    return await readFileAsDataURL(file);
  }

  // 2. Handle HEIC / HEIF from Apple iPhones & Macs
  let workingBlob: Blob = file;
  const isHeic = fileType.includes('heic') || fileType.includes('heif') || /\.(heic|heif)$/i.test(fileName);
  if (isHeic) {
    try {
      workingBlob = await convertHeicToJpeg(file);
    } catch (err) {
      console.warn('Could not convert HEIC, attempting standard decode', err);
    }
  }

  const MAX_DIM = 1920;

  // 3. Attempt decoding with createImageBitmap (modern, off-thread, hardware accelerated)
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(workingBlob);
      let { width, height } = bitmap;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', 0.88);
      }
      bitmap.close();
    } catch (bitmapErr) {
      console.warn('createImageBitmap failed, trying HTMLImageElement fallback', bitmapErr);
    }
  }

  // 4. Fallback to HTMLImageElement with createObjectURL
  let objectUrl = '';
  try {
    objectUrl = URL.createObjectURL(workingBlob);
    const compressedDataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readFileAsDataURL(workingBlob));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.88));
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };
      img.onerror = () => reject(new Error('Failed to decode image into canvas'));
      img.src = objectUrl;
    });

    URL.revokeObjectURL(objectUrl);
    return compressedDataUrl;
  } catch (imgErr) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    console.warn('Canvas decode failed, safely falling back to raw Data URL', imgErr);
    // 5. Ultimate safe fallback: Return the raw file as Data URL so the upload never fails!
    return await readFileAsDataURL(file);
  }
}
