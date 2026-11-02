import { supabase, isSupabaseConfigured, SUPABASE_URL } from '../lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  /** 'supabase' = stored in the public brand-images bucket, 'local' = resized data URL (demo / signed-out). */
  storage?: 'supabase' | 'local';
}

export type UploadProgressHandler = (percent: number) => void;

export const BRAND_IMAGE_BUCKET = 'brand-images';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (matches bucket limit in supabase_migration_v3.sql)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};

/** Longest edge (px) for locally stored fallback images, so localStorage stays small. */
const LOCAL_MAX_EDGE: Record<string, number> = { logos: 400, thumbnails: 300, banners: 1200, products: 900 };

/**
 * Validates an image file before upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: 'That file is empty. Please choose another image.' };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image (JPEG, PNG, WebP, or GIF).'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please choose one under 5MB.`
    };
  }

  return { valid: true };
}

/**
 * Reads a File into a Data URL (base64 string) for immediate preview.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Downscales an image to a compact data URL for the local/demo fallback.
 * Falls back to the raw data URL if the browser cannot decode it.
 */
export async function createCompactDataUrl(file: File, maxEdge: number): Promise<string> {
  const original = await readFileAsDataUrl(file);
  if (file.type === 'image/gif') return original; // keep animation; size already capped at 5MB

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = original;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return original;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const keepsAlpha = file.type === 'image/png' || file.type === 'image/webp';
    return canvas.toDataURL(keepsAlpha ? 'image/webp' : 'image/jpeg', 0.82);
  } catch {
    return original;
  }
}

function uploadWithProgress(
  objectPath: string,
  file: File,
  accessToken: string,
  onProgress?: UploadProgressHandler
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BRAND_IMAGE_BUCKET}/${encodedPath}`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY as string);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Cache-Control', 'max-age=3600');
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) onProgress(Math.round((evt.loaded / evt.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }
      let message = `Upload failed (${xhr.status}).`;
      try {
        const body = JSON.parse(xhr.responseText);
        message = body.message || body.error || message;
      } catch {
        /* ignore non-JSON body */
      }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error('Network error while uploading. Check your connection and try again.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));
    xhr.send(file);
  });
}

/**
 * Uploads a brand image.
 *
 * - Signed in with Supabase: uploads to `brand-images/<userId>/<folder>/<file>` (owner-scoped by RLS)
 *   and returns the public URL. Failures are reported, never silently swapped for huge base64 strings.
 * - Demo user / signed out / Supabase not configured: returns a small resized data URL so the
 *   local demo keeps working without bloating localStorage.
 */
export async function uploadBrandImage(
  file: File,
  folder: 'logos' | 'banners' | 'thumbnails' | 'products' = 'logos',
  userId?: string,
  onProgress?: UploadProgressHandler
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  let accessToken: string | null = null;
  if (isSupabaseConfigured && userId) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session && data.session.user.id === userId) accessToken = data.session.access_token;
    } catch {
      accessToken = null;
    }
  }

  if (accessToken && userId) {
    const ext = EXT_BY_MIME[file.type] || 'jpg';
    const objectPath = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    try {
      onProgress?.(0);
      await uploadWithProgress(objectPath, file, accessToken, onProgress);
      const { data } = supabase.storage.from(BRAND_IMAGE_BUCKET).getPublicUrl(objectPath);
      if (!data?.publicUrl) {
        return { success: false, error: 'Upload finished but the public image link could not be created.' };
      }
      return { success: true, url: data.publicUrl, storage: 'supabase' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      return {
        success: false,
        error: /bucket not found/i.test(message)
          ? 'Image storage is not set up yet (missing "brand-images" bucket). Ask the site admin to run supabase_migration_v3.sql.'
          : /row-level security|policy|unauthori[sz]ed|forbidden/i.test(message)
          ? 'You do not have permission to upload this image. Please sign in again and retry.'
          : message
      };
    }
  }

  try {
    onProgress?.(30);
    const dataUrl = await createCompactDataUrl(file, LOCAL_MAX_EDGE[folder] ?? 900);
    onProgress?.(100);
    return { success: true, url: dataUrl, storage: 'local' };
  } catch {
    return { success: false, error: 'Failed to read image file. Please try another image.' };
  }
}
