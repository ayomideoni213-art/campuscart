-- =========================================================================
-- CAMPUSMART — SUPABASE MIGRATION V3  (safe to re-run; preserves data)
-- Reconciles schema drift, adds profile auto-provisioning, owner-scoped
-- store/product/storage RLS, and protects sensitive columns.
--
-- Run order for a fresh project:
--   1. supabase_schema.sql
--   2. supabase_admin_security.sql
--   3. supabase_migration_v2.sql
--   4. supabase_migration_v3.sql   (this file)
--   5. supabase_admin_owner_setup.sql (edit the email first)
-- For an already-populated project just run this file in the SQL editor.
-- No service-role key is needed by the browser app; never put it in VITE_* vars.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. CAMPUS DEFAULTS & NORMALISATION
-- The app stores the full campus names from src/data/campuses.ts.
-- -------------------------------------------------------------------------
ALTER TABLE public.profiles
  ALTER COLUMN campus_name SET DEFAULT 'Ekiti State University (EKSU)';
ALTER TABLE public.stores
  ALTER COLUMN campus_location SET DEFAULT 'Ekiti State University (EKSU)';

-- Only rewrite the two known legacy placeholder values; any other data is kept.
UPDATE public.profiles
   SET campus_name = 'Ekiti State University (EKSU)'
 WHERE campus_name IN ('Metropolitan Central University', 'Ekiti State University');

UPDATE public.stores
   SET campus_location = 'Ekiti State University (EKSU)'
 WHERE campus_location IN ('Metropolitan Central University', 'Ekiti State University');

UPDATE public.products
   SET campus_name = 'Ekiti State University (EKSU)'
 WHERE campus_name IN ('Metropolitan Central University', 'Ekiti State University');

-- Back-fill empty campuses_served arrays from the primary campus.
UPDATE public.profiles
   SET campuses_served = ARRAY[campus_name]
 WHERE campuses_served IS NULL OR cardinality(campuses_served) = 0;

UPDATE public.stores
   SET campuses_served = ARRAY[campus_location]
 WHERE campuses_served IS NULL OR cardinality(campuses_served) = 0;

-- Make sure every column the app reads exists.
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS campuses_served text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_thumbnail text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_intent text DEFAULT 'shop',
  ADD COLUMN IF NOT EXISTS campuses_served text[] DEFAULT '{}';

-- Keep campus values inside the supported Ekiti list for NEW/CHANGED rows.
-- NOT VALID => existing legacy rows are not rejected; re-validate later if wanted.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_campus_name_ekiti') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_campus_name_ekiti
      CHECK (campus_name IN (
        'Ekiti State University (EKSU)',
        'Federal University Oye-Ekiti (FUOYE)',
        'Afe Babalola University (ABUAD)',
        'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
        'Venite University'
      )) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'stores_campus_location_ekiti') THEN
    ALTER TABLE public.stores ADD CONSTRAINT stores_campus_location_ekiti
      CHECK (campus_location IN (
        'Ekiti State University (EKSU)',
        'Federal University Oye-Ekiti (FUOYE)',
        'Afe Babalola University (ABUAD)',
        'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
        'Venite University'
      )) NOT VALID;
  END IF;
END $$;

-- -------------------------------------------------------------------------
-- 2. PROFILE AUTO-PROVISIONING ON SIGN-UP
-- The browser can only read its own profile, so the row must be created
-- server-side from the sign-up metadata. Roles are limited to customer/seller.
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  valid_campuses constant text[] := ARRAY[
    'Ekiti State University (EKSU)',
    'Federal University Oye-Ekiti (FUOYE)',
    'Afe Babalola University (ABUAD)',
    'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
    'Venite University'
  ];
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_campus text;
  v_served text[];
  v_intent text;
BEGIN
  v_campus := CASE WHEN meta->>'campus_name' = ANY (valid_campuses)
                   THEN meta->>'campus_name' ELSE valid_campuses[1] END;

  SELECT coalesce(array_agg(DISTINCT c), ARRAY[]::text[]) INTO v_served
    FROM jsonb_array_elements_text(
           CASE WHEN jsonb_typeof(meta->'campuses_served') = 'array'
                THEN meta->'campuses_served' ELSE '[]'::jsonb END) AS c
   WHERE c = ANY (valid_campuses);
  IF cardinality(v_served) = 0 THEN v_served := ARRAY[v_campus]; END IF;

  v_intent := CASE WHEN meta->>'signup_intent' = 'sell' THEN 'sell' ELSE 'shop' END;

  INSERT INTO public.profiles (id, email, full_name, role, campus_name, student_id,
                               phone, bio, signup_intent, campuses_served)
  VALUES (
    new.id,
    new.email,
    coalesce(nullif(trim(meta->>'full_name'), ''), split_part(new.email, '@', 1)),
    CASE WHEN v_intent = 'sell' THEN 'seller' ELSE 'customer' END,
    v_campus,
    nullif(trim(meta->>'student_id'), ''),
    nullif(trim(meta->>'phone'), ''),
    nullif(trim(meta->>'bio'), ''),
    v_intent,
    v_served
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Back-fill profiles for any auth users that signed up before this trigger existed.
INSERT INTO public.profiles (id, email, full_name, role, campus_name)
SELECT u.id, u.email,
       coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), split_part(u.email, '@', 1)),
       'customer',
       'Ekiti State University (EKSU)'
  FROM auth.users u
 WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------------
-- 3. ROLE GUARD: allow the owner to upgrade customer -> seller, nothing else.
-- (Replaces the guard from supabase_admin_security.sql; admins remain unrestricted.)
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = new.id)
       AND new.role NOT IN ('customer', 'seller') THEN
      new.role := 'customer';
    END IF;
  ELSIF new.role IS DISTINCT FROM old.role AND NOT public.is_admin() THEN
    IF NOT (old.role = 'customer' AND new.role = 'seller' AND auth.uid() = new.id) THEN
      RAISE EXCEPTION 'Only the project administrator can change account roles';
    END IF;
  END IF;
  RETURN new;
END;
$$;

-- -------------------------------------------------------------------------
-- 4. PROFILES RLS — private by default
-- The previous "select using (true)" exposed every user's email, phone and
-- student ID to anonymous visitors. The app only reads the signed-in profile.
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 5. STORES RLS + PROTECTED COLUMNS
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Sellers can insert own store" ON public.stores;
CREATE POLICY "Sellers can insert own store" ON public.stores
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);

-- Replace the two earlier update policies with one that also has WITH CHECK.
DROP POLICY IF EXISTS "Sellers can update own store" ON public.stores;
DROP POLICY IF EXISTS "Sellers can update their own store" ON public.stores;
CREATE POLICY "Sellers can update own store" ON public.stores
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Sellers can delete own store" ON public.stores;
CREATE POLICY "Sellers can delete own store" ON public.stores
  FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- Owners edit their brand fields; moderation/metrics fields are server-controlled.
CREATE OR REPLACE FUNCTION public.guard_store_protected_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN RETURN new; END IF;
  IF tg_op = 'INSERT' THEN
    new.rating := 5.00;
    new.reviews_count := 0;
    new.total_sales := 0;
    new.status := 'active';
  ELSE
    new.seller_id := old.seller_id;
    new.rating := old.rating;
    new.reviews_count := old.reviews_count;
    new.total_sales := old.total_sales;
    new.status := old.status;
    new.verified_student := old.verified_student;
    new.created_at := old.created_at;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS stores_guard_protected_fields ON public.stores;
CREATE TRIGGER stores_guard_protected_fields
  BEFORE INSERT OR UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.guard_store_protected_fields();

-- -------------------------------------------------------------------------
-- 6. PRODUCTS RLS — sellers may only list into stores they own
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
CREATE POLICY "Sellers can insert their own products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.seller_id = auth.uid())
  );

DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products" ON public.products
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- -------------------------------------------------------------------------
-- 7. ORDERS — let sellers read order lines that belong to their stores
-- -------------------------------------------------------------------------
DROP POLICY IF EXISTS "Customers can view own order items" ON public.order_items;
CREATE POLICY "Customers can view own order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Sellers can view their store order items" ON public.order_items;
CREATE POLICY "Sellers can view their store order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.seller_id = auth.uid())
  );

DROP POLICY IF EXISTS "Sellers can view orders containing their items" ON public.orders;
CREATE POLICY "Sellers can view orders containing their items" ON public.orders
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.stores s ON s.id = oi.store_id
      WHERE oi.order_id = orders.id AND s.seller_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- 8. STORAGE — 'brand-images' bucket (public read, owner-scoped write)
-- Object path convention:  <auth.uid()>/<logos|banners|thumbnails|products>/<file>
-- The first folder MUST equal the uploader's user id.
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-images', 'brand-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
   SET public = true,
       file_size_limit = 5242880,
       allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Remove the permissive v2 policies (any signed-in user could overwrite/delete anyone's files).
DROP POLICY IF EXISTS "Authenticated upload brand images" ON storage.objects;
DROP POLICY IF EXISTS "Owner can update brand images" ON storage.objects;
DROP POLICY IF EXISTS "Owner can delete brand images" ON storage.objects;

DROP POLICY IF EXISTS "Public read brand images" ON storage.objects;
CREATE POLICY "Public read brand images" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-images');

DROP POLICY IF EXISTS "Owners upload brand images" ON storage.objects;
CREATE POLICY "Owners upload brand images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owners update brand images" ON storage.objects;
CREATE POLICY "Owners update brand images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'brand-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'brand-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owners delete brand images" ON storage.objects;
CREATE POLICY "Owners delete brand images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'brand-images' AND (storage.foldername(name))[1] = auth.uid()::text);

