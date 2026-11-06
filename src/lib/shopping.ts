import { CartItem, Product, Store } from '../types';

/** Campuses a listing can be handed off on: the listing's campus plus every campus its store serves. */
export function getServedCampuses(product: Product, store?: Store): string[] {
  const served = new Set<string>();
  if (product.campus_name) served.add(product.campus_name);
  if (store) {
    if (store.campus_location) served.add(store.campus_location);
    (store.campuses_served ?? []).forEach((c) => served.add(c));
  }
  return Array.from(served);
}

/** True when the listing can be handed off on the given campus ('All' always matches). */
export function isServedOnCampus(product: Product, store: Store | undefined, campus: string): boolean {
  if (!campus || campus === 'All') return true;
  return getServedCampuses(product, store).includes(campus);
}

export type Availability = 'available' | 'low_stock' | 'out_of_stock' | 'unavailable';

export const LOW_STOCK_THRESHOLD = 3;

/** Only published listings with stock can be bought. */
export function getAvailability(product: Product): Availability {
  if (product.status !== 'published') return 'unavailable';
  if (product.stock <= 0) return 'out_of_stock';
  if (product.stock <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'available';
}

export function isPurchasable(product: Product): boolean {
  const a = getAvailability(product);
  return a === 'available' || a === 'low_stock';
}

export function availabilityLabel(product: Product): string {
  switch (getAvailability(product)) {
    case 'unavailable':
      return 'No longer available';
    case 'out_of_stock':
      return 'Out of stock';
    case 'low_stock':
      return `Only ${product.stock} left`;
    default:
      return 'In stock';
  }
}

export function effectivePrice(product: Product): number {
  return product.discount_price ?? product.price;
}

export type CartIssueKind = 'unavailable' | 'out_of_stock' | 'insufficient_stock' | 'campus_mismatch';

export interface CartIssue {
  productId: string;
  productName: string;
  kind: CartIssueKind;
  message: string;
  /** Quantity that can still be ordered (0 when the item must be removed). */
  maxQuantity: number;
}

/**
 * Checks every bag line against the live catalogue (not the snapshot saved in the bag).
 * `campus` is the campus where the buyer wants the handoff; pass 'All' to skip the campus check.
 */
export function getCartIssues(
  cart: CartItem[],
  products: Product[],
  stores: Store[],
  campus: string
): CartIssue[] {
  const issues: CartIssue[] = [];
  for (const item of cart) {
    const live = products.find((p) => p.id === item.product_id);
    const name = item.product.name;

    if (!live || live.status !== 'published') {
      issues.push({
        productId: item.product_id,
        productName: name,
        kind: 'unavailable',
        message: `${name} is no longer available.`,
        maxQuantity: 0
      });
      continue;
    }
    if (live.stock <= 0) {
      issues.push({
        productId: item.product_id,
        productName: name,
        kind: 'out_of_stock',
        message: `${name} is out of stock.`,
        maxQuantity: 0
      });
      continue;
    }
    if (item.quantity > live.stock) {
      issues.push({
        productId: item.product_id,
        productName: name,
        kind: 'insufficient_stock',
        message: `Only ${live.stock} of ${name} left (you have ${item.quantity} in your bag).`,
        maxQuantity: live.stock
      });
    }
    const store = stores.find((s) => s.id === live.store_id);
    if (!isServedOnCampus(live, store, campus)) {
      issues.push({
        productId: item.product_id,
        productName: name,
        kind: 'campus_mismatch',
        message: `${live.store_name} does not serve ${campus} for ${name}.`,
        maxQuantity: 0
      });
    }
  }
  return issues;
}

/** Short campus code (e.g. "EKSU") for compact labels. */
export function shortCampus(campus: string): string {
  const match = campus.match(/\(([^)]+)\)\s*$/);
  return match ? match[1] : campus.split(' ')[0];
}
