import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, WishlistItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  /** Refresh saved bag lines (price, stock, name, images) from the live catalogue. */
  syncCartProducts: (liveProducts: Product[]) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCartFromWishlist: (product: Product) => void;
  subtotal: number;
  discount: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  total: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'campusmart_cart_v1';
const WISHLIST_STORAGE_KEY = 'campusmart_wishlist_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock <= 0 || product.status !== 'published') return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map((item) =>
          item.product_id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product_id: product.id, product, quantity: Math.min(quantity, product.stock) }];
    });
    setIsCartOpen(true);
  };

  const syncCartProducts = (liveProducts: Product[]) => {
    setCart((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        const live = liveProducts.find((p) => p.id === item.product_id);
        if (!live) return item;
        const same =
          live.price === item.product.price &&
          live.discount_price === item.product.discount_price &&
          live.stock === item.product.stock &&
          live.status === item.product.status &&
          live.name === item.product.name &&
          live.store_name === item.product.store_name &&
          live.images[0] === item.product.images[0];
        if (same) return item;
        changed = true;
        return { ...item, product: live };
      });
      return changed ? next : prev;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setDiscountPercent(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.product_id === productId);
      if (exists) {
        return prev.filter((item) => item.product_id !== productId);
      } else {
        return [...prev, { product_id: productId, added_at: new Date().toISOString() }];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.product_id === productId);
  };

  const moveToCartFromWishlist = (product: Product) => {
    addToCart(product, 1);
    toggleWishlist(product.id);
  };

  const applyPromoCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === 'CAMPUS10' || formatted === 'STUDENT10') {
      setPromoCode(formatted);
      setDiscountPercent(0.1);
      return { success: true, message: 'Campus 10% discount applied!' };
    }
    if (formatted === 'FRESHMAN20') {
      setPromoCode(formatted);
      setDiscountPercent(0.2);
      return { success: true, message: '20% Freshman Welcome discount applied!' };
    }
    return { success: false, message: 'That promo code is not valid.' };
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
  };

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = item.product.discount_price ?? item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  const discount = subtotal * discountPercent;
  const total = Math.max(0, subtotal - discount);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        syncCartProducts,
        toggleWishlist,
        isInWishlist,
        moveToCartFromWishlist,
        subtotal,
        discount,
        promoCode,
        applyPromoCode,
        removePromoCode,
        total,
        cartCount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
