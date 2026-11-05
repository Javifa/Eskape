-- ============================================================================
-- MIGRACIÓN 001: ESQUEMA, STORAGE Y POLÍTICAS RLS — ESKAPE CARTA DIGITAL
-- ============================================================================
-- Proyecto exclusivo para: ESKAPE (Completamente independiente de FACENIA).
-- Ejecutar en el SQL Editor del nuevo proyecto Supabase de ESKAPE.
-- ============================================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. FUNCIÓN TRIGGER PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. TABLA DE PERFILES ADMINISTRATIVOS AUTORIZADOS (admin_profiles)
-- ----------------------------------------------------------------------------
-- Solo los usuarios presentes en esta tabla con is_active = true tienen
-- permisos de escritura/administración sobre la carta de ESKAPE.
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Administrador ESKAPE',
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor')),
  establishment_slug TEXT NOT NULL DEFAULT 'eskape' CHECK (establishment_slug = 'eskape'),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_profiles_active
  ON public.admin_profiles(id, is_active);

DROP TRIGGER IF EXISTS trg_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER trg_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 3. FUNCIÓN DE VERIFICACIÓN DE ADMINISTRADOR AUTORIZADO
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = (SELECT auth.uid())
      AND is_active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. TABLA DE CATEGORÍAS DE LA CARTA (categories)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY CHECK (char_length(trim(id)) > 0),
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '/images/hero-breakfast.jpg',
  highlight_tag TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_active_sort
  ON public.categories(is_active, sort_order ASC);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 5. TABLA DE PRODUCTOS DE LA CARTA (products)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (char_length(trim(name)) > 0),
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  image_url TEXT NOT NULL DEFAULT '/images/hero-breakfast.jpg',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  badge TEXT NOT NULL DEFAULT '',
  allergens TEXT[] NOT NULL DEFAULT '{}',
  dietary TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products(category_id);

CREATE INDEX IF NOT EXISTS idx_products_active_sort
  ON public.products(is_active, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_products_featured
  ON public.products(is_featured) WHERE is_featured = true;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 6. TABLA DE CONFIGURACIÓN DEL ESTABLECIMIENTO (establishment_settings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.establishment_settings (
  id TEXT PRIMARY KEY DEFAULT 'eskape' CHECK (id = 'eskape'),
  name TEXT NOT NULL DEFAULT 'ESKAPE',
  tagline TEXT NOT NULL DEFAULT 'Desayunos & Cafetería',
  welcome_title TEXT NOT NULL DEFAULT 'Empieza el día con buen sabor',
  welcome_subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  provisional_notice TEXT NOT NULL DEFAULT '',
  is_provisional BOOLEAN NOT NULL DEFAULT true,
  logo_url TEXT NOT NULL DEFAULT '/logo-eskape.jpg',
  hero_image_url TEXT NOT NULL DEFAULT '/images/hero-breakfast.jpg',
  ambiance_image_url TEXT NOT NULL DEFAULT '/images/ambiente-eskape.jpg',
  hero_suggestion_label TEXT NOT NULL DEFAULT 'Sugerencia Matinal',
  hero_suggestion_title TEXT NOT NULL DEFAULT 'Desayuno Eskape Especial',
  hero_suggestion_meta TEXT NOT NULL DEFAULT 'Café + Zumo natural + Tostada de aguacate y huevo poché · 7,90 €',
  address_street TEXT NOT NULL DEFAULT '',
  address_city TEXT NOT NULL DEFAULT '',
  address_reference TEXT NOT NULL DEFAULT '',
  maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com',
  phone_display TEXT NOT NULL DEFAULT '',
  phone_href TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  whatsapp_message TEXT NOT NULL DEFAULT '',
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  socials JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_notes JSONB NOT NULL DEFAULT '[]'::jsonb,
  theme_colors JSONB NOT NULL DEFAULT '{
    "bgCream": "#F2EBD8",
    "forestPrimary": "#1D2F21",
    "goldAccent": "#B58B42"
  }'::jsonb,
  visibility_config JSONB NOT NULL DEFAULT '{
    "showProvisionalBanner": true,
    "showFeaturedSection": true,
    "showAllergenFilter": true,
    "showAmbianceSection": true,
    "showWhatsAppButton": true,
    "showSocials": true
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_establishment_settings_updated_at ON public.establishment_settings;
CREATE TRIGGER trg_establishment_settings_updated_at
  BEFORE UPDATE ON public.establishment_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. SEGURIDAD ROW-LEVEL SECURITY (RLS) GRANULAR POR OPERACIÓN
-- ============================================================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishment_settings ENABLE ROW LEVEL SECURITY;

-- 7.1 Políticas para admin_profiles
DROP POLICY IF EXISTS "admin_profiles_select_own_or_admin" ON public.admin_profiles;
CREATE POLICY "admin_profiles_select_own_or_admin"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- Trigger automático para autorizar como 'owner' al primer usuario creado en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles) THEN
    INSERT INTO public.admin_profiles (id, email, full_name, role, establishment_slug, is_active)
    VALUES (NEW.id, COALESCE(NEW.email, 'owner@eskape.es'), 'Propietario ESKAPE', 'owner', 'eskape', true)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created_first_owner ON auth.users;
CREATE TRIGGER trg_on_auth_user_created_first_owner
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user_owner();

DROP POLICY IF EXISTS "admin_profiles_insert_only_admin" ON public.admin_profiles;
CREATE POLICY "admin_profiles_insert_only_admin"
  ON public.admin_profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "admin_profiles_update_only_admin" ON public.admin_profiles;
CREATE POLICY "admin_profiles_update_only_admin"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()))
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "admin_profiles_delete_only_admin" ON public.admin_profiles;
CREATE POLICY "admin_profiles_delete_only_admin"
  ON public.admin_profiles FOR DELETE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()));

-- 7.2 Políticas para categories
-- Público (QR): solo lee categorías activas; Admin autorizado: lee todas
DROP POLICY IF EXISTS "categories_select_public_or_admin" ON public.categories;
CREATE POLICY "categories_select_public_or_admin"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
CREATE POLICY "categories_insert_admin"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "categories_update_admin" ON public.categories;
CREATE POLICY "categories_update_admin"
  ON public.categories FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()))
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "categories_delete_admin" ON public.categories;
CREATE POLICY "categories_delete_admin"
  ON public.categories FOR DELETE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()));

-- 7.3 Políticas para products
-- Público (QR): solo lee productos activos (incluidos los agotados temporalmente);
-- Admin autorizado: lee todos los productos (incluidos los ocultos/inactivos)
DROP POLICY IF EXISTS "products_select_public_or_admin" ON public.products;
CREATE POLICY "products_select_public_or_admin"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR (SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()))
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()));

-- 7.4 Políticas para establishment_settings
DROP POLICY IF EXISTS "settings_select_public" ON public.establishment_settings;
CREATE POLICY "settings_select_public"
  ON public.establishment_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "settings_insert_admin" ON public.establishment_settings;
CREATE POLICY "settings_insert_admin"
  ON public.establishment_settings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "settings_update_admin" ON public.establishment_settings;
CREATE POLICY "settings_update_admin"
  ON public.establishment_settings FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()))
  WITH CHECK ((SELECT public.is_authorized_admin()));

DROP POLICY IF EXISTS "settings_delete_admin" ON public.establishment_settings;
CREATE POLICY "settings_delete_admin"
  ON public.establishment_settings FOR DELETE
  TO authenticated
  USING ((SELECT public.is_authorized_admin()));

-- ============================================================================
-- 8. SUPABASE STORAGE: BUCKET EXCLUSIVO "eskape-media" Y POLÍTICAS RLS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'eskape-media',
  'eskape-media',
  true,
  5242880, -- Límite de 5 MB por imagen
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lectura pública de imágenes de la carta
DROP POLICY IF EXISTS "eskape_media_public_read" ON storage.objects;
CREATE POLICY "eskape_media_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'eskape-media');

-- Subida exclusiva para administradores autorizados de ESKAPE
DROP POLICY IF EXISTS "eskape_media_admin_insert" ON storage.objects;
CREATE POLICY "eskape_media_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'eskape-media'
    AND (SELECT public.is_authorized_admin())
  );

-- Actualización exclusiva para administradores autorizados de ESKAPE
DROP POLICY IF EXISTS "eskape_media_admin_update" ON storage.objects;
CREATE POLICY "eskape_media_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'eskape-media'
    AND (SELECT public.is_authorized_admin())
  )
  WITH CHECK (
    bucket_id = 'eskape-media'
    AND (SELECT public.is_authorized_admin())
  );

-- Eliminación exclusiva para administradores autorizados de ESKAPE
DROP POLICY IF EXISTS "eskape_media_admin_delete" ON storage.objects;
CREATE POLICY "eskape_media_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'eskape-media'
    AND (SELECT public.is_authorized_admin())
  );
