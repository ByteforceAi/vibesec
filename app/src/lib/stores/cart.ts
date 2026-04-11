/**
 * Cart Store
 *
 * Manages shopping cart with localStorage persistence.
 * Aligned with CartItem from docs/arch/schema.md.
 */

import { writable, derived } from 'svelte/store';

export interface CartItem {
  packageId: string;
  quantity: number;
  addedAt: string;
  fromScanId: string | null;
}

// ---- Persistence ----

const CART_KEY = 'vibesec_cart';

function loadCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // Storage full
  }
}

// ---- Store ----

export const cartItems = writable<CartItem[]>(loadCart());

// Auto-save on changes
cartItems.subscribe(saveCart);

// Derived: count
export const cartCount = derived(cartItems, ($items) =>
  $items.reduce((sum, item) => sum + item.quantity, 0)
);

// ---- Actions ----

export function addToCart(packageId: string, scanId: string | null = null): void {
  cartItems.update((items) => {
    const existing = items.find((i) => i.packageId === packageId);
    if (existing) {
      return items.map((i) =>
        i.packageId === packageId ? { ...i, quantity: i.quantity + 1 } : i
      );
    }
    return [
      ...items,
      {
        packageId,
        quantity: 1,
        addedAt: new Date().toISOString(),
        fromScanId: scanId,
      },
    ];
  });
}

export function removeFromCart(packageId: string): void {
  cartItems.update((items) => items.filter((i) => i.packageId !== packageId));
}

export function clearCart(): void {
  cartItems.set([]);
}

export function isInCart(packageId: string): boolean {
  let found = false;
  cartItems.subscribe((items) => {
    found = items.some((i) => i.packageId === packageId);
  })();
  return found;
}

/**
 * Calculate total price from package list.
 * Caller must provide package data since cart only stores IDs.
 */
export function calculateTotal(
  items: CartItem[],
  packagePrices: Record<string, number>
): number {
  return items.reduce((sum, item) => {
    const price = packagePrices[item.packageId] ?? 0;
    return sum + price * item.quantity;
  }, 0);
}
