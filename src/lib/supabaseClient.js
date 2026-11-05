import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Salvaguarda explícita de independencia: impedir uso accidental del proyecto FACENIA
const FORBIDDEN_PROJECT_REFS = ['zkxyvhrqxetxomrwbajm'];

function validateSupabaseEnv(url, key) {
  if (!url || !key) {
    return {
      valid: false,
      reason:
        'Variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY pendientes de configurar en el archivo .env.',
    };
  }
  if (
    url.includes('TU_PROYECTO_EXCLUSIVO_ESKAPE') ||
    key.includes('tu_clave_anon_publica_de_eskape')
  ) {
    return {
      valid: false,
      reason:
        'El archivo .env contiene los valores de ejemplo sin reemplazar por las credenciales reales del proyecto Supabase de ESKAPE.',
    };
  }
  for (const forbiddenRef of FORBIDDEN_PROJECT_REFS) {
    if (url.toLowerCase().includes(forbiddenRef)) {
      return {
        valid: false,
        reason:
          'Bloqueo de seguridad: La URL configurada pertenece a otro proyecto (FACENIA). ESKAPE requiere un proyecto Supabase exclusivo e independiente.',
      };
    }
  }
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) {
      return { valid: false, reason: 'VITE_SUPABASE_URL no es una URL HTTP/HTTPS válida.' };
    }
  } catch {
    return { valid: false, reason: 'VITE_SUPABASE_URL no tiene un formato de URL válido.' };
  }
  return { valid: true, reason: null };
}

const validation = validateSupabaseEnv(rawUrl, rawAnonKey);

export const isSupabaseConfigured = validation.valid;
export const supabaseConfigReason = validation.reason;

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'eskape_admin_auth_session',
      },
    })
  : null;

export const STORAGE_BUCKET = 'eskape-media';
