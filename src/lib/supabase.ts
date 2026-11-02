import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when real Supabase credentials are present in the environment. */
export const isSupabaseConfigured = Boolean(url && key);

export const SUPABASE_URL = url || '';

if (!isSupabaseConfigured) {
  // Only the public anon key is ever read here; the service-role key must never be exposed to the browser.
  console.warn(
    'Supabase environment variables are missing. CampusMart is running in local demo mode ' +
      '(set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign-in, shared stores and image uploads).'
  );
}

// A placeholder client keeps the app usable offline; its requests simply fail and are handled by callers.
export const supabase = createClient(
  url || 'http://localhost:54321',
  key || 'public-anon-key-not-configured'
);
