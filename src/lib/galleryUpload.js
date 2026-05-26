// =====================================================================
// Gallery image upload helper
//
// Takes a File (often a large phone photo), resizes + compresses it in
// the browser, uploads it to the public `gallery` Storage bucket, and
// returns the public URL to store in gallery_photos.image_url.
//
// Why resize client-side:
//   - Phone photos are often 5–12 MB and 4000px+ wide. Uploading those
//     raw wastes Storage and makes the gallery slow to load.
//   - Re-encoding through a canvas also normalizes EXIF orientation, so
//     photos don't show up sideways.
// =====================================================================
import { supabase } from './supabase.js';

const BUCKET = 'gallery';
const MAX_DIM = 2000; // longest edge, px — plenty sharp for web, much smaller than raw
const JPEG_QUALITY = 0.82;

/**
 * Load a File into an HTMLImageElement.
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file.'));
    };
    img.src = url;
  });
}

/**
 * Resize + compress to a JPEG Blob. Returns the original file unchanged
 * if it's already small and not an oversized type.
 */
async function compressImage(file) {
  // Non-bitmap types (e.g. SVG) or already-tiny files: skip processing.
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  const img = await loadImage(file);
  let { width, height } = img;

  if (width > MAX_DIM || height > MAX_DIM) {
    if (width >= height) {
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
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );

  // If compression somehow produced something bigger, keep the original.
  if (!blob || blob.size >= file.size) return file;
  return blob;
}

/**
 * Build a safe, unique object path for the upload.
 */
function makeObjectPath(originalName) {
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const ext =
    (originalName && originalName.includes('.')
      ? originalName.split('.').pop()
      : 'jpg'
    )
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 5) || 'jpg';
  return `photos/${stamp}-${rand}.${ext === 'jpg' ? 'jpg' : 'jpg'}`;
}

/**
 * Upload a gallery image. Returns { url, path }.
 * Throws on failure with a friendly message.
 */
export async function uploadGalleryImage(file) {
  if (!file) throw new Error('No file selected.');

  let body;
  try {
    body = await compressImage(file);
  } catch (e) {
    // If compression fails for any reason, fall back to the raw file.
    console.warn('[CITC] image compress failed, uploading original:', e);
    body = file;
  }

  // After compression the body is a JPEG blob; force a .jpg path/type.
  const path = makeObjectPath('image.jpg');

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (upErr) {
    throw new Error('Upload failed: ' + upErr.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Uploaded, but could not get a public URL.');
  }
  return { url: data.publicUrl, path };
}

/**
 * Delete an uploaded object by its public URL (best-effort).
 * Used when removing a photo so we don't leave orphaned files.
 */
export async function deleteGalleryImageByUrl(url) {
  try {
    const marker = `/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (e) {
    console.warn('[CITC] could not delete storage object:', e);
  }
}
