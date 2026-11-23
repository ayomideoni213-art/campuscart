# CampusMart — Supabase Database & Storage Runbook

This document records the exact migration order, Row Level Security (RLS) model, Storage setup, and local/demo fallback behavior for CampusMart.

## 1. Migration Order

### Fresh Supabase Project
Run these SQL files in order inside the **Supabase SQL Editor**:

1. `supabase_schema.sql` — Base tables (`profiles`, `stores`, `categories`, `products`, `orders`, `order_items`, `reviews`, `conversations`, `messages`, `notifications`, `reports`, `blog_posts`) and initial RLS.
2. `supabase_admin_security.sql` — `admin_users` table, `public.is_admin()` helper, and role-guard trigger.
3. `supabase_migration_v2.sql` — Ekiti defaults, entrepreneur store/profile fields, initial `brand-images` bucket.
4. `supabase_migration_v3.sql` — Profile auto-provisioning trigger (`handle_new_user`), private-by-default profile RLS, store protected-fields guard, owner-scoped storage RLS.
5. `supabase_migration_v4.sql` — Full Stage 4 reconciliation: product campus/condition constraints, `orders.payment_status` default `'pending'`, `is_suspended`/product/order protected-field triggers, missing RLS policies (`categories`, `order_items` insert, `orders` update, `reviews`, `blog_posts`, `conversations`, `messages` participant check, `notifications`, `reports`), and strict `brand-images/<uid>/<folder>/` storage policies.
6. `supabase_admin_owner_setup.sql` — Edit the email in the SQL Editor (do **not** commit personal emails) and run once to grant admin membership in `public.admin_users`.

### Already-Populated Project (v3 already applied)
Run **`supabase_migration_v4.sql`** only. It is idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`, `NOT VALID` constraints) and preserves all existing users, stores, products, and orders.

## 2. Manual Supabase Dashboard Steps
These cannot be automated via SQL alone:
- **Environment variables (Vercel / `.env.local`)**:
  - `VITE_SUPABASE_URL` — Project URL
  - `VITE_SUPABASE_ANON_KEY` — Public `anon` key only
  - **Never** expose `service_role` in browser code or `VITE_*` variables.
- **Auth → URL Configuration**:
  - Set **Site URL** to your deployed Vercel URL (e.g. `https://campuscart-inky-iota.vercel.app`).
  - Add your Vercel URL and `http://localhost:5173` to **Redirect URLs** so password reset and email confirmation links work.
- **Storage**:
  - Verify the `brand-images` bucket appears as **Public** with a **5 MB** file limit and allowed MIME types `image/jpeg`, `image/png`, `image/webp`, `image/gif`.

## 3. Storage Path Contract
`src/services/imageStorage.ts` uploads to:
```text
brand-images/<auth.uid()>/<logos|banners|thumbnails|products>/<timestamp>-<rand>.<ext>
```
- **Read**: Public (`SELECT` allowed on `brand-images`).
- **Upload / Update**: Authenticated users only, restricted to their own `<auth.uid()>` prefix and one of the 4 allowed subfolders.
- **Delete**: Authenticated users only, restricted to their own `<auth.uid()>` prefix (via `deleteBrandImage()`).

## 4. Intentional Local / Demo Fallback Differences
When `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent (or when using a local demo account in `DEV`):
- **Data source**: Seeded in `localStorage` via `src/services/storage.ts` instead of PostgreSQL. In production with Supabase configured, active stores and published products are loaded from Supabase (`src/services/supabasecatalog.ts`) so fake demo stores do not leak to real shoppers.
- **Images**: Stored as downscaled data URLs in `localStorage` instead of Supabase Storage; for signed-in Supabase users, upload errors are surfaced directly rather than silently falling back to base64.
- **Orders, chat, reviews, notifications**: Currently saved locally in `MarketplaceContext` with helper functions in `supabasecatalog.ts` prepared for full cloud order/product sync as the next step.
