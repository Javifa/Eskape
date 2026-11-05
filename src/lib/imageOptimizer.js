import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabaseClient';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_ORIGINAL_SIZE_MB = 12;

/**
 * Optimiza automáticamente una imagen en el navegador mediante Canvas
 * reduciendo dimensiones máximas y comprimiendo a WebP/JPEG ligero para carga rápida en QR.
 */
export async function optimizeImageForWeb(file, { maxDimension = 1000, quality = 0.84 } = {}) {
  if (!file) throw new Error('No se ha seleccionado ningún archivo.');

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Usa imágenes JPG, PNG, WebP o SVG.');
  }

  if (file.size > MAX_ORIGINAL_SIZE_MB * 1024 * 1024) {
    throw new Error(`El archivo supera el tamaño máximo de ${MAX_ORIGINAL_SIZE_MB} MB.`);
  }

  // Los archivos SVG vectoriales no necesitan rasterización
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const targetWidth = Math.max(1, Math.round(img.width * scale));
      const targetHeight = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Preferir WebP o conservar JPEG
      const outputType = file.type === 'image/png' ? 'image/webp' : 'image/jpeg';
      const ext = outputType === 'image/webp' ? 'webp' : 'jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const cleanBaseName = file.name
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-')
            .slice(0, 40);

          const optimizedFile = new File([blob], `${cleanBaseName || 'imagen'}.${ext}`, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo procesar la imagen seleccionada.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Sube una imagen optimizada al bucket 'eskape-media' de Supabase Storage
 * o devuelve una URL de previsualización local si se está en modo demostración sin Supabase.
 */
export async function uploadEstablishmentMedia(file, folder = 'products', options = {}) {
  const optimized = await optimizeImageForWeb(file, options);

  if (!isSupabaseConfigured || !supabase) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          url: reader.result,
          storagePath: null,
          isLocalPreview: true,
          originalSizeKB: Math.round(file.size / 1024),
          optimizedSizeKB: Math.round(optimized.size / 1024),
        });
      reader.onerror = () => reject(new Error('Error al leer la imagen localmente.'));
      reader.readAsDataURL(optimized);
    });
  }

  const ext = optimized.name.split('.').pop() || 'jpg';
  const uniqueName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(uniqueName, optimized, {
      cacheControl: '31536000',
      upsert: false,
      contentType: optimized.type,
    });

  if (uploadError) {
    throw new Error(`Error al subir imagen a Supabase Storage: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(uniqueName);

  return {
    url: publicUrlData.publicUrl,
    storagePath: uniqueName,
    isLocalPreview: false,
    originalSizeKB: Math.round(file.size / 1024),
    optimizedSizeKB: Math.round(optimized.size / 1024),
  };
}

/**
 * Elimina un archivo alojado en el bucket 'eskape-media' de Supabase Storage
 * a partir de su URL pública. Ignora rutas estáticas locales (/images/...).
 */
export async function deleteEstablishmentMediaByUrl(publicUrl) {
  if (!isSupabaseConfigured || !supabase || !publicUrl) return false;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return false;

  const objectPath = decodeURIComponent(publicUrl.slice(idx + marker.length));
  if (!objectPath) return false;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new Error(`Error al eliminar imagen de Storage: ${error.message}`);
  }
  return true;
}
