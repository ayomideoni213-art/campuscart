import { supabase } from '../lib/supabase';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates an image file before upload.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image (JPEG, PNG, WebP, or GIF).'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image file size must be less than 5MB.'
    };
  }

  return { valid: true };
}

/**
 * Reads a File into a Data URL (base64 string) for immediate preview and reliable fallback storage.
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
 * Uploads an image to Supabase Storage (bucket 'brand-images') if available,
 * with graceful fallback to base64 Data URL.
 */
export async function uploadBrandImage(
  file: File,
  folder: 'logos' | 'banners' | 'thumbnails' | 'products' = 'logos',
  userId?: string
): Promise<ImageUploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // Attempt Supabase storage upload if client is configured
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${userId || 'guest'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('brand-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('brand-images')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        return { success: true, url: publicUrlData.publicUrl };
      }
    }
  } catch (err) {
    console.warn('Supabase storage upload failed or not configured, using data URL fallback:', err);
  }

  // Fallback: Read as Data URL
  try {
    const dataUrl = await readFileAsDataUrl(file);
    return { success: true, url: dataUrl };
  } catch (readErr) {
    return {
      success: false,
      error: 'Failed to read image file. Please try another image.'
    };
  }
}
