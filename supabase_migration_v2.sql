-- =========================================================================
-- CAMPUSMART — SUPABASE MIGRATION V2
-- Ekiti State Universities, Entrepreneur Profile Fields, Storage, and RLS
-- =========================================================================

-- 1. PROFILES ENHANCEMENT
-- Add signup_intent and campuses_served to user profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_intent text DEFAULT 'shop' CHECK (signup_intent IN ('shop', 'sell')),
  ADD COLUMN IF NOT EXISTS campuses_served text[] DEFAULT '{}';

-- Update default campus on profiles to Ekiti State University
ALTER TABLE public.profiles 
  ALTER COLUMN campus_name SET DEFAULT 'Ekiti State University';

-- 2. STORES ENHANCEMENT
-- Add WhatsApp, Instagram, campuses served, and profile thumbnail
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS campuses_served text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_thumbnail text;

-- Update default campus location on stores
ALTER TABLE public.stores
  ALTER COLUMN campus_location SET DEFAULT 'Ekiti State University';

-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR STORES
-- Ensure sellers can update their own store profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stores' AND policyname = 'Sellers can update their own store'
  ) THEN
    CREATE POLICY "Sellers can update their own store"
      ON public.stores
      FOR UPDATE
      USING (auth.uid() = seller_id)
      WITH CHECK (auth.uid() = seller_id);
  END IF;
END $$;

-- Ensure public can read all active stores
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stores' AND policyname = 'Public can view active stores'
  ) THEN
    CREATE POLICY "Public can view active stores"
      ON public.stores
      FOR SELECT
      USING (status = 'active');
  END IF;
END $$;

-- 4. STORAGE BUCKET FOR BRAND IMAGES
-- Create 'brand-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-images', 'brand-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public read brand images'
  ) THEN
    CREATE POLICY "Public read brand images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'brand-images');
  END IF;
END $$;

-- Storage RLS: Authenticated user upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated upload brand images'
  ) THEN
    CREATE POLICY "Authenticated upload brand images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'brand-images');
  END IF;
END $$;

-- Storage RLS: Owner update and delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Owner can update brand images'
  ) THEN
    CREATE POLICY "Owner can update brand images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'brand-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Owner can delete brand images'
  ) THEN
    CREATE POLICY "Owner can delete brand images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'brand-images');
  END IF;
END $$;
