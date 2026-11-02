import { supabase } from '../lib/supabase';
import type { Store } from '../types';

export async function getPublishedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}
import type { Store } from '../types';

const STORE_WRITE_FIELDS = [
  'seller_id', 'name', 'slug', 'tagline', 'description', 'logo_url', 'banner_url',
  'profile_thumbnail', 'campus_location', 'campuses_served', 'pickup_point',
  'instagram_handle', 'instagram_url', 'whatsapp_url'
] as const;

function toStore(row: Record<string, unknown>): Store {
  return {
    ...(row as unknown as Store),
    tagline: (row.tagline as string) ?? '',
    description: (row.description as string) ?? '',
    logo_url: (row.logo_url as string) ?? '',
    banner_url: (row.banner_url as string) ?? '',
    campuses_served: ((row.campuses_served as string[] | null) ?? []).length
      ? (row.campuses_served as string[])
      : [row.campus_location as string],
    rating: Number(row.rating ?? 5),
    reviews_count: Number(row.reviews_count ?? 0),
    total_sales: Number(row.total_sales ?? 0),
    verified_student: Boolean(row.verified_student ?? true)
  };
}

/** Active stores visible to everyone (RLS: status = 'active' or own store). */
export async function getActiveStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => toStore(row as Record<string, unknown>));
}

function pickWritable(store: Partial<Store>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of STORE_WRITE_FIELDS) {
    if (field in store && store[field as keyof Store] !== undefined) out[field] = store[field as keyof Store];
  }
  // Empty strings are stored as NULL so optional links stay clean.
  for (const optional of ['instagram_handle', 'instagram_url', 'whatsapp_url', 'profile_thumbnail']) {
    if (out[optional] === '') out[optional] = null;
  }
  return out;
}

/** Inserts a store owned by the signed-in seller (RLS enforces seller_id = auth.uid()). */
export async function insertStore(store: Store): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .insert({ id: store.id, ...pickWritable(store) })
    .select()
    .single();

  if (error) throw error;
  return toStore(data as Record<string, unknown>);
}

/** Updates brand fields of a store; RLS only matches rows owned by the signed-in seller. */
export async function updateStoreRow(id: string, patch: Partial<Store>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update(pickWritable(patch))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Store not found or you do not own it.');
  return toStore(data as Record<string, unknown>);
}
