-- =========================================================================
-- CAMPUSMART — SUPABASE MIGRATION V4  (idempotent; preserves existing data)
-- Stage 4 reconciliation: schema drift, campus & numeric NGN constraints,
-- complete RLS across all shopping/community tables, privilege-escalation
-- guards, and owner-scoped Storage policies for 'brand-images'.
--
-- Run order for a FRESH Supabase project:
--   1. supabase_schema.sql
--   2. supabase_admin_security.sql
--   3. supabase_migration_v2.sql
--   4. supabase_migration_v3.sql
--   5. supabase_migration_v4.sql   (this file)
--   6. supabase_admin_owner_setup.sql (edit the owner email in SQL Editor only)
--
-- For an ALREADY-POPULATED project (after v3): run only this file.
-- Never place the Supabase service_role key in browser code or VITE_* vars.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. SCHEMA DRIFT, DEFAULTS, BACKFILLS & CONSTRAINTS (non-destructive)
-- -------------------------------------------------------------------------

-- Align products.campus_name default & legacy placeholder rows with Ekiti list
ALTER TABLE public.products
  ALTER COLUMN campus_name SET DEFAULT 'Ekiti State University (EKSU)';

UPDATE public.products
   SET campus_name = 'Ekiti State University (EKSU)'
 WHERE campus_name IS NULL
    OR trim(campus_name) = ''
    OR campus_name IN ('Metropolitan Central University', 'Ekiti State University');

-- Ensure profiles & stores defaults remain aligned with src/data/campuses.ts
ALTER TABLE public.profiles
  ALTER COLUMN campus_name SET DEFAULT 'Ekiti State University (EKSU)';
ALTER TABLE public.stores
  ALTER COLUMN campus_location SET DEFAULT 'Ekiti State University (EKSU)';

-- CampusMart does not process online payments; new orders default to 'pending'
-- (cash or bank transfer at campus handoff in NGN/₦). Existing rows untouched.
ALTER TABLE public.orders
  ALTER COLUMN payment_status SET DEFAULT 'pending';

-- Ensure numeric NGN amounts are non-negative and product campus/condition
-- values stay within supported app values for new/updated rows (NOT VALID
-- keeps any legacy rows intact without failing the migration).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_campus_name_ekiti') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_campus_name_ekiti
      CHECK (campus_name IN (
        'Ekiti State University (EKSU)',
        'Federal University Oye-Ekiti (FUOYE)',
        'Afe Babalola University (ABUAD)',
        'Bamidele Olumilua University of Education, Science and Technology (BOUESTI)',
        'Venite University'
      )) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_condition_valid') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_condition_valid
      CHECK (condition IN (
        'Brand New',
        'Like New',
        'Gently Used',
        'Handmade / Custom'
      )) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_amounts_non_negative') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_amounts_non_negative
      CHECK (
        subtotal >= 0
        AND coalesce(discount_amount, 0) >= 0
        AND coalesce(delivery_fee, 0) >= 0
        AND total_amount >= 0
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_items_price_non_negative') THEN
    ALTER TABLE public.order_items ADD CONSTRAINT order_items_price_non_negative
      CHECK (price >= 0) NOT VALID;
  END IF;
END $$;

-- Helpful indexes for marketplace browsing, seller studio, orders, and chat
CREATE INDEX IF NOT EXISTS idx_stores_seller_id ON public.stores (seller_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products (store_id);
CREATE INDEX IF NOT EXISTS idx_products_status_created ON public.products (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON public.orders (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_store_id ON public.order_items (store_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations (buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations (seller_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_ts ON public.messages (conversation_id, timestamp);

-- Generic updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at := timezone('utc'::text, now());
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------------------
-- 2. PRIVILEGE-ESCALATION & PROTECTED-FIELD GUARDS
-- -------------------------------------------------------------------------

-- Profiles: protect role, is_suspended, email, and created_at from client tampering.
-- Allows only the user's own customer -> seller upgrade; admins remain unrestricted.
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF tg_op = 'INSERT' THEN
    IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = new.id) THEN
      IF new.role NOT IN ('customer', 'seller') THEN
        new.role := 'customer';
      END IF;
      new.is_suspended := false;
    END IF;
    RETURN new;
  END IF;

  -- UPDATE
  IF NOT public.is_admin() THEN
    IF new.role IS DISTINCT FROM old.role THEN
      IF NOT (old.role = 'customer' AND new.role = 'seller' AND auth.uid() = new.id) THEN
        RAISE EXCEPTION 'Only the project administrator can change account roles';
      END IF;
    END IF;
    -- Prevent self-unsuspension or identity tampering
    new.is_suspended := old.is_suspended;
    new.email := old.email;
    new.created_at := old.created_at;
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role_update ON public.profiles;
CREATE TRIGGER profiles_guard_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- Products: prevent non-admin sellers from spoofing rating/reviews/featured/seller_id
CREATE OR REPLACE FUNCTION public.guard_product_protected_fields()
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
    new.is_featured := false;
  ELSE
    new.seller_id := old.seller_id;
    new.rating := old.rating;
    new.reviews_count := old.reviews_count;
    new.is_featured := old.is_featured;
    new.created_at := old.created_at;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS products_guard_protected_fields ON public.products;
CREATE TRIGGER products_guard_protected_fields
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.guard_product_protected_fields();

-- Orders: prevent clients from forging paid/delivered status or altering totals
CREATE OR REPLACE FUNCTION public.guard_order_protected_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF public.is_admin() THEN RETURN new; END IF;
  IF tg_op = 'INSERT' THEN
    -- No online payment gateway is active; all new orders start as payment pending.
    new.payment_status := 'pending';
    IF new.order_status NOT IN ('pending', 'confirmed') THEN
      new.order_status := 'confirmed';
    END IF;
  ELSE
    new.order_number := old.order_number;
    new.customer_id := old.customer_id;
    new.subtotal := old.subtotal;
    new.discount_amount := old.discount_amount;
    new.delivery_fee := old.delivery_fee;
    new.total_amount := old.total_amount;
    new.created_at := old.created_at;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS orders_guard_protected_fields ON public.orders;
CREATE TRIGGER orders_guard_protected_fields
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.guard_order_protected_fields();

-- -------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) RECONCILIATION
-- -------------------------------------------------------------------------

-- CATEGORIES: public storefront read; admin-only writes
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- STORES: single clean public-read policy (removes duplicate from v2)
DROP POLICY IF EXISTS "Public can view active stores" ON public.stores;
DROP POLICY IF EXISTS "Stores are viewable by everyone" ON public.stores;
CREATE POLICY "Stores are viewable by everyone" ON public.stores
  FOR SELECT USING (status = 'active' OR auth.uid() = seller_id OR public.is_admin());

-- PRODUCTS: ensure sellers cannot move a listing into another seller's store
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON public.products;
CREATE POLICY "Published products are viewable by everyone" ON public.products
  FOR SELECT USING (status = 'published' OR auth.uid() = seller_id OR public.is_admin());

DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
CREATE POLICY "Sellers can update their own products" ON public.products
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = seller_id
      AND EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.seller_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;
CREATE POLICY "Sellers can delete their own products" ON public.products
  FOR DELETE TO authenticated
  USING (auth.uid() = seller_id OR public.is_admin());

-- ORDERS & ORDER ITEMS: complete buyer create/view + seller view/fulfill policies
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT TO authenticated
  USING (auth.uid() = customer_id OR public.is_admin());

DROP POLICY IF EXISTS "Customers can insert orders" ON public.orders;
CREATE POLICY "Customers can insert orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers and sellers can update order status" ON public.orders;
CREATE POLICY "Customers and sellers can update order status" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = customer_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.stores s ON s.id = oi.store_id
      WHERE oi.order_id = orders.id AND s.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = customer_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.stores s ON s.id = oi.store_id
      WHERE oi.order_id = orders.id AND s.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can insert own order items" ON public.order_items;
CREATE POLICY "Customers can insert own order items" ON public.order_items
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid())
  );

-- REVIEWS: public read approved; authenticated users submit their own
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Approved reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create own reviews" ON public.reviews;
CREATE POLICY "Users can create own reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users and admins can delete reviews" ON public.reviews;
CREATE POLICY "Users and admins can delete reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- BLOG POSTS (Campus Stories): public read published; authors/admins manage
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors and admins can insert blog posts" ON public.blog_posts;
CREATE POLICY "Authors and admins can insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors and admins can update blog posts" ON public.blog_posts;
CREATE POLICY "Authors and admins can update blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR public.is_admin())
  WITH CHECK (auth.uid() = author_id OR public.is_admin());

-- CONVERSATIONS & MESSAGES: strictly participant-scoped read & write
DROP POLICY IF EXISTS "Participants can insert conversations" ON public.conversations;
CREATE POLICY "Participants can insert conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- NOTIFICATIONS: users read/update only their own
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- REPORTS: authenticated users file reports; reporter or admin can read; admin moderates
DROP POLICY IF EXISTS "Users can submit reports" ON public.reports;
CREATE POLICY "Users can submit reports" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Reporters and admins can view reports" ON public.reports;
CREATE POLICY "Reporters and admins can view reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -------------------------------------------------------------------------
-- 4. STORAGE — 'brand-images' BUCKET & PATH-SCOPED POLICIES
-- Path contract (matches src/services/imageStorage.ts):
--   brand-images/<auth.uid()>/<logos|banners|thumbnails|products>/<file>
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-images',
  'brand-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
   SET public = true,
       file_size_limit = 5242880,
       allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Public read brand images" ON storage.objects;
CREATE POLICY "Public read brand images" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-images');

DROP POLICY IF EXISTS "Owners upload brand images" ON storage.objects;
CREATE POLICY "Owners upload brand images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'brand-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] IN ('logos', 'banners', 'thumbnails', 'products')
  );

DROP POLICY IF EXISTS "Owners update brand images" ON storage.objects;
CREATE POLICY "Owners update brand images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'brand-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'brand-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (storage.foldername(name))[2] IN ('logos', 'banners', 'thumbnails', 'products')
  );

DROP POLICY IF EXISTS "Owners delete brand images" ON storage.objects;
CREATE POLICY "Owners delete brand images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'brand-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
