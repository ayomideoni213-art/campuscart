import { supabase } from '../lib/supabase';
import { sanitizeCampus } from '../data/campuses';
import type { Order, Product, Store } from '../types';

/** Fills nullable database columns with safe defaults so the UI never crashes on missing values. */
function toProduct(row: Record<string, unknown>): Product {
  const images = Array.isArray(row.images)
    ? (row.images as unknown[]).filter((u): u is string => typeof u === 'string' && u.length > 0)
    : [];
  const discount = row.discount_price == null ? undefined : Number(row.discount_price);
  return {
    ...(row as unknown as Product),
    name: (row.name as string) ?? 'Untitled listing',
    description: (row.description as string) ?? '',
    store_name: (row.store_name as string) ?? 'Campus Store',
    category_name: (row.category_name as string) ?? 'General',
    campus_name: sanitizeCampus(row.campus_name as string | undefined),
    condition: (row.condition as Product['condition']) ?? 'Gently Used',
    images,
    price: Number(row.price ?? 0),
    discount_price: discount != null && Number.isFinite(discount) ? discount : undefined,
    stock: Number(row.stock ?? 0),
    rating: Number(row.rating ?? 0),
    reviews_count: Number(row.reviews_count ?? 0),
    is_featured: Boolean(row.is_featured)
  };
}

export async function getPublishedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => toProduct(row as Record<string, unknown>));
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

const STORE_WRITE_FIELDS = [
  'seller_id',
  'name',
  'slug',
  'tagline',
  'description',
  'logo_url',
  'banner_url',
  'profile_thumbnail',
  'campus_location',
  'campuses_served',
  'pickup_point',
  'instagram_handle',
  'instagram_url',
  'whatsapp_url'
] as const;

function toStore(row: Record<string, unknown>): Store {
  const campus = sanitizeCampus(row.campus_location as string | undefined);
  const rawServed = (row.campuses_served as string[] | null) ?? [];
  return {
    ...(row as unknown as Store),
    tagline: (row.tagline as string) ?? '',
    description: (row.description as string) ?? '',
    logo_url: (row.logo_url as string) ?? '',
    banner_url: (row.banner_url as string) ?? '',
    campus_location: campus,
    campuses_served: rawServed.length ? rawServed.map((c) => sanitizeCampus(c)) : [campus],
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

function pickWritableStore(store: Partial<Store>): Record<string, unknown> {
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
    .insert({ id: store.id, ...pickWritableStore(store) })
    .select()
    .single();

  if (error) throw error;
  return toStore(data as Record<string, unknown>);
}

/** Updates brand fields of a store; RLS only matches rows owned by the signed-in seller. */
export async function updateStoreRow(id: string, patch: Partial<Store>): Promise<Store> {
  const { data, error } = await supabase
    .from('stores')
    .update(pickWritableStore(patch))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Store not found or you do not own it.');
  return toStore(data as Record<string, unknown>);
}

const PRODUCT_WRITE_FIELDS = [
  'seller_id',
  'store_id',
  'store_name',
  'name',
  'slug',
  'description',
  'price',
  'discount_price',
  'category_id',
  'category_name',
  'images',
  'stock',
  'status',
  'condition',
  'campus_name'
] as const;

function pickWritableProduct(product: Partial<Product>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of PRODUCT_WRITE_FIELDS) {
    if (field in product && product[field as keyof Product] !== undefined) {
      out[field] = product[field as keyof Product];
    }
  }
  if (typeof out.campus_name === 'string') {
    out.campus_name = sanitizeCampus(out.campus_name);
  }
  return out;
}

/** Inserts a product listing owned by the signed-in seller into their own store (enforced by RLS). */
export async function insertProduct(product: Product): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ id: product.id, ...pickWritableProduct(product) })
    .select()
    .single();

  if (error) throw error;
  return toProduct(data as Record<string, unknown>);
}

/** Updates editable fields of a seller's product listing (RLS + trigger protect rating/reviews/seller_id). */
export async function updateProductRow(id: string, patch: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(pickWritableProduct(patch))
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Listing not found or you do not own it.');
  return toProduct(data as Record<string, unknown>);
}

/** Deletes a seller's product listing (RLS enforces seller_id = auth.uid()). */
export async function deleteProductRow(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

/** Persists a buyer's order and its line items (RLS enforces customer_id = auth.uid(); trigger forces payment_status = 'pending'). */
export async function insertOrderWithItems(order: Order): Promise<void> {
  const { data: createdOrder, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      delivery_info: order.delivery_info,
      subtotal: Number(order.subtotal),
      discount_amount: Number(order.discount_amount),
      delivery_fee: Number(order.delivery_fee),
      total_amount: Number(order.total_amount),
      payment_method: order.payment_method,
      payment_status: 'pending',
      order_status: order.order_status
    })
    .select('id')
    .single();

  if (orderError) throw orderError;

  const itemRows = order.items.map((item) => ({
    order_id: createdOrder.id,
    product_id: item.product_id,
    store_id: item.store_id,
    store_name: item.store_name,
    product_name: item.product_name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    image_url: item.image_url || null
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
  if (itemsError) throw itemsError;
}
