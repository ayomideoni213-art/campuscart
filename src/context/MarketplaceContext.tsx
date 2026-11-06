import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Store,
  Category,
  Order,
  Review,
  Conversation,
  NotificationItem,
  ReportItem,
  BlogPost,
  OrderItem,
  DeliveryDetails,
  PaymentMethod,
  OrderStatus,
  UserRole
} from '../types';
import { StorageService } from '../services/storage';
import { getPublishedProducts, getActiveStores, insertStore, updateStoreRow } from '../services/supabasecatalog';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { getCartIssues } from '../lib/shopping';

export type CatalogStatus = 'loading' | 'ready' | 'error';

/** Result of saving a store: always saved locally; `synced` is true once Supabase has it too. */
export interface StoreSaveResult {
  success: boolean;
  synced: boolean;
  error?: string;
}

/** Returns the Supabase user id when a real (non-demo) session exists. */
async function getCloudUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
  } catch {
    return null;
  }
}

function newStoreId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `store-${Date.now()}`;
}

function ensureUniqueSlug(base: string, existing: Store[], ownId?: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'store';
  let slug = clean;
  let n = 2;
  while (existing.some((s) => s.slug === slug && s.id !== ownId)) slug = `${clean}-${n++}`;
  return slug;
}

interface MarketplaceContextType {
  products: Product[];
  /** Loading state of the product catalogue (Supabase when configured). */
  productsStatus: CatalogStatus;
  reloadProducts: () => void;
  stores: Store[];
  categories: Category[];
  orders: Order[];
  reviews: Review[];
  conversations: Conversation[];
  notifications: NotificationItem[];
  reports: ReportItem[];
  blogPosts: BlogPost[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews_count'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  moderateProduct: (id: string, status: Product['status']) => void;

  // Store actions
  updateStore: (id: string, data: Partial<Store>) => Promise<StoreSaveResult>;
  createStore: (storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'reviews_count' | 'total_sales'>) => Store;

  // Order actions
  /** Throws an Error with a user-readable message when the order cannot be placed. */
  placeOrder: (
    items: OrderItem[],
    deliveryInfo: DeliveryDetails,
    paymentMethod: PaymentMethod,
    subtotal: number,
    discountAmount: number
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Review actions
  addReview: (productId: string, rating: number, comment: string) => Review;
  moderateReview: (reviewId: string, status: Review['status']) => void;

  // Messaging actions
  startConversation: (sellerId: string, storeId: string, productId?: string) => Conversation;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationAsRead: (conversationId: string) => void;

  // Reports
  submitReport: (targetType: ReportItem['target_type'], targetId: string, targetName: string, reason: string, details: string) => void;
  resolveReport: (reportId: string, status: ReportItem['status']) => void;

  // Blog posts
  createBlogPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'views' | 'likes'>) => BlogPost;
  updateBlogPost: (id: string, data: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;

  // User management (Admin)
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserSuspension: (userId: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { cart, syncCartProducts } = useCart();

  const [productsStatus, setProductsStatus] = useState<CatalogStatus>(isSupabaseConfigured ? 'loading' : 'ready');
  const [productsReloadKey, setProductsReloadKey] = useState(0);
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [stores, setStores] = useState<Store[]>(() => StorageService.getStores());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [reviews, setReviews] = useState<Review[]>(() => StorageService.getReviews());
  const [conversations, setConversations] = useState<Conversation[]>(() => StorageService.getConversations());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications());
  const [reports, setReports] = useState<ReportItem[]>(() => StorageService.getReports());
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => StorageService.getBlogPosts());

  // Save to persistent storage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProductsStatus('ready');
      return;
    }
    let cancelled = false;
    setProductsStatus('loading');
    getPublishedProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(data);
        setProductsStatus('ready');
      })
      .catch((error) => {
        console.error('Could not load products from Supabase:', error);
        if (!cancelled) setProductsStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [productsReloadKey]);

  // Keep saved bag lines in step with the live catalogue so prices, stock and totals stay accurate.
  useEffect(() => {
    if (productsStatus === 'ready') syncCartProducts(products);
  }, [products, productsStatus]);

  // Load shared stores from Supabase. In production the database is the source of truth
  // (so fake local demo stores never show to real users); in dev they are merged with the demo data.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    getActiveStores()
      .then((remote) => {
        if (cancelled) return;
        setStores((prev) => {
          if (!import.meta.env.DEV) return remote;
          const remoteIds = new Set(remote.map((s) => s.id));
          return [...remote, ...prev.filter((s) => !remoteIds.has(s.id))];
        });
      })
      .catch((error) => {
        console.error('Could not load stores from Supabase:', error);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    StorageService.setProducts(products);
  }, [products]);

  useEffect(() => {
    StorageService.setStores(stores);
  }, [stores]);

  useEffect(() => {
    StorageService.setOrders(orders);
  }, [orders]);

  useEffect(() => {
    StorageService.setReviews(reviews);
  }, [reviews]);

  useEffect(() => {
    StorageService.setConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    StorageService.setNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.setReports(reports);
  }, [reports]);

  useEffect(() => {
    StorageService.setBlogPosts(blogPosts);
  }, [blogPosts]);

  // Product Methods
  const addProduct = (productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating' | 'reviews_count'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviews_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Send notification to seller
    addNotification({
      user_id: productData.seller_id,
      title: 'Product Listed Successfully! 🚀',
      message: `"${productData.name}" has been listed in your store.`,
      type: 'product',
      link_tab: 'products'
    });

    return newProduct;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const moderateProduct = (id: string, status: Product['status']) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, status, updated_at: new Date().toISOString() };
          addNotification({
            user_id: item.seller_id,
            title: `Product Status Updated: ${status.toUpperCase()}`,
            message: `Your listing "${item.name}" is now marked as ${status}.`,
            type: 'moderation',
            link_tab: 'products'
          });
          return updated;
        }
        return item;
      })
    );
  };

  // Store Methods
  const updateStore = async (id: string, data: Partial<Store>): Promise<StoreSaveResult> => {
    const existing = stores.find((s) => s.id === id);
    if (!existing) return { success: false, synced: false, error: 'Store not found.' };

    // Authorization: a signed-in user may only edit their own store (admins aside).
    if (currentUser && existing.seller_id !== currentUser.id && currentUser.role !== 'admin') {
      return { success: false, synced: false, error: 'You can only edit your own store.' };
    }

    const patch: Partial<Store> = { ...data };
    if (patch.name !== undefined && patch.name !== existing.name) {
      patch.slug = ensureUniqueSlug(patch.name, stores, id);
    }
    // Rating, sales and verification are server-controlled and never edited from the client.
    delete patch.rating;
    delete patch.reviews_count;
    delete patch.total_sales;
    delete patch.verified_student;
    delete patch.seller_id;

    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

    const cloudUser = await getCloudUserId();
    if (!cloudUser || cloudUser !== existing.seller_id) return { success: true, synced: false };

    try {
      const saved = await updateStoreRow(id, patch);
      setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...saved } : s)));
      return { success: true, synced: true };
    } catch (error) {
      console.error('Could not save the store to Supabase:', error);
      return {
        success: false,
        synced: false,
        error:
          error instanceof Error
            ? `Saved on this device only. ${error.message}`
            : 'Saved on this device only. Please try again.'
      };
    }
  };

  const createStore = (storeData: Omit<Store, 'id' | 'created_at' | 'rating' | 'reviews_count' | 'total_sales'>): Store => {
    const newStore: Store = {
      ...storeData,
      slug: ensureUniqueSlug(storeData.slug || storeData.name, stores),
      id: newStoreId(),
      rating: 5.0,
      reviews_count: 0,
      total_sales: 0,
      created_at: new Date().toISOString()
    };
    setStores((prev) => [newStore, ...prev]);

    void (async () => {
      const cloudUser = await getCloudUserId();
      if (!cloudUser || cloudUser !== newStore.seller_id) return;
      try {
        const saved = await insertStore(newStore);
        setStores((prev) => prev.map((s) => (s.id === newStore.id ? { ...s, ...saved } : s)));
      } catch (error) {
        console.error('Could not save the new store to Supabase:', error);
      }
    })();

    return newStore;
  };

  // Order Methods
  const placeOrder = (
    items: OrderItem[],
    deliveryInfo: DeliveryDetails,
    paymentMethod: PaymentMethod,
    subtotal: number,
    discountAmount: number
  ): Order => {
    if (!currentUser) throw new Error('Please sign in to place an order.');
    if (items.length === 0) throw new Error('Your bag is empty.');

    // Re-check the live catalogue so stale bags can never oversell a listing.
    const stale = getCartIssues(
      items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
        product: products.find((p) => p.id === i.product_id) ?? ({ name: i.product_name } as Product)
      })),
      products,
      stores,
      deliveryInfo.campus
    );
    if (stale.length > 0) throw new Error(stale[0].message);

    const orderNumber = `CM-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      customer_id: currentUser.id,
      customer_name: deliveryInfo.student_name,
      customer_email: deliveryInfo.student_email,
      delivery_info: deliveryInfo,
      items,
      subtotal,
      discount_amount: discountAmount,
      delivery_fee: 0,
      total_amount: Math.max(0, subtotal - discountAmount),
      payment_method: paymentMethod,
      // No online payment is processed: the buyer pays the seller directly at handoff.
      payment_status: 'pending',
      order_status: 'confirmed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update product stock and store sales
    items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.product_id) {
            const newStock = Math.max(0, p.stock - item.quantity);
            return {
              ...p,
              stock: newStock,
              status: newStock === 0 ? 'out_of_stock' : p.status
            };
          }
          return p;
        })
      );

      setStores((prev) =>
        prev.map((s) => {
          if (s.id === item.store_id) {
            return {
              ...s,
              total_sales: s.total_sales + item.quantity
            };
          }
          return s;
        })
      );

      // Notify seller
      const store = stores.find((s) => s.id === item.store_id);
      if (store) {
        addNotification({
          user_id: store.seller_id,
          title: `New Order Received! 🛍️`,
          message: `${deliveryInfo.student_name} ordered ${item.product_name} (${orderNumber}).`,
          type: 'order',
          link_tab: 'orders'
        });
      }
    });

    // Notify buyer
    if (currentUser) {
      addNotification({
        user_id: currentUser.id,
        title: `Order ${orderNumber} Confirmed! 🎉`,
        message: `Your order of ${items.length} item(s) has been placed and sent to student sellers.`,
        type: 'order',
        link_tab: 'orders'
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated = { ...ord, order_status: status, updated_at: new Date().toISOString() };
          addNotification({
            user_id: ord.customer_id,
            title: `Order ${ord.order_number} Status: ${status.toUpperCase()}`,
            message: `Your order is now marked as ${status}.`,
            type: 'order',
            link_tab: 'orders'
          });
          return updated;
        }
        return ord;
      })
    );
  };

  // Review Methods
  const addReview = (productId: string, rating: number, comment: string): Review => {
    const product = products.find((p) => p.id === productId);
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      product_id: productId,
      product_name: product ? product.name : 'Campus Product',
      store_id: product ? product.store_id : 'store-unknown',
      user_id: currentUser?.id || 'anon',
      user_name: currentUser?.full_name || 'Anonymous Student',
      user_avatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating,
      comment,
      verified_purchase: true,
      created_at: new Date().toISOString(),
      status: 'approved'
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate product rating
    if (product) {
      const existingProductReviews = reviews.filter((r) => r.product_id === productId);
      const totalRating = existingProductReviews.reduce((sum, r) => sum + r.rating, rating);
      const newCount = existingProductReviews.length + 1;
      const avg = Number((totalRating / newCount).toFixed(1));

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, rating: avg, reviews_count: newCount } : p))
      );
    }

    return newRev;
  };

  const moderateReview = (reviewId: string, status: Review['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
  };

  // Messaging Methods
  const startConversation = (sellerId: string, storeId: string, productId?: string): Conversation => {
    const store = stores.find((s) => s.id === storeId);
    const product = productId ? products.find((p) => p.id === productId) : undefined;
    const buyerId = currentUser?.id || 'guest';
    const buyerName = currentUser?.full_name || 'Campus Student';

    // Check if conversation already exists
    const existing = conversations.find(
      (c) => c.buyer_id === buyerId && c.seller_id === sellerId && (!productId || c.product_id === productId)
    );

    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      buyer_id: buyerId,
      buyer_name: buyerName,
      seller_id: sellerId,
      seller_name: store ? store.name : 'Student Seller',
      store_id: storeId,
      store_name: store ? store.name : 'Campus Store',
      product_id: productId,
      product_name: product?.name,
      product_image: product?.images[0],
      last_message: 'Conversation started',
      last_updated: new Date().toISOString(),
      messages: [],
      unread_by_buyer: false,
      unread_by_seller: true
    };

    setConversations((prev) => [newConv, ...prev]);
    return newConv;
  };

  const sendMessage = (conversationId: string, text: string) => {
    if (!currentUser || !text.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_avatar: currentUser.avatar_url,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      is_read: false
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const isBuyer = conv.buyer_id === currentUser.id;
          return {
            ...conv,
            last_message: text.trim(),
            last_updated: new Date().toISOString(),
            unread_by_buyer: !isBuyer,
            unread_by_seller: isBuyer,
            messages: [...conv.messages, newMessage]
          };
        }
        return conv;
      })
    );
  };

  const markConversationAsRead = (conversationId: string) => {
    if (!currentUser) return;
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const isBuyer = conv.buyer_id === currentUser.id;
          return {
            ...conv,
            unread_by_buyer: isBuyer ? false : conv.unread_by_buyer,
            unread_by_seller: !isBuyer ? false : conv.unread_by_seller,
            messages: conv.messages.map((m) =>
              m.sender_id !== currentUser.id ? { ...m, is_read: true } : m
            )
          };
        }
        return conv;
      })
    );
  };

  // Reports
  const submitReport = (
    targetType: ReportItem['target_type'],
    targetId: string,
    targetName: string,
    reason: string,
    details: string
  ) => {
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      reporter_id: currentUser?.id || 'anon',
      reporter_name: currentUser?.full_name || 'Anonymous Student',
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      reason,
      details,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, status: ReportItem['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  };

  // Blog Posts
  const createBlogPost = (postData: Omit<BlogPost, 'id' | 'created_at' | 'views' | 'likes'>): BlogPost => {
    const newPost: BlogPost = {
      ...postData,
      id: `post-${Date.now()}`,
      views: 1,
      likes: 0,
      created_at: new Date().toISOString()
    };
    setBlogPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updateBlogPost = (id: string, data: Partial<BlogPost>) => {
    setBlogPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  };

  // Notifications
  const addNotification = (item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === currentUser.id ? { ...n, is_read: true } : n))
    );
  };

  const unreadNotificationsCount = currentUser
    ? notifications.filter((n) => n.user_id === currentUser.id && !n.is_read).length
    : 0;

  // User Management
  const updateUserRole = (userId: string, newRole: UserRole) => {
    const allUsers = StorageService.getUsers().map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    StorageService.setUsers(allUsers);
  };

  const toggleUserSuspension = (userId: string) => {
    const allUsers = StorageService.getUsers().map((u) =>
      u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u
    );
    StorageService.setUsers(allUsers);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        productsStatus,
        reloadProducts: () => setProductsReloadKey((k) => k + 1),
        stores,
        categories,
        orders,
        reviews,
        conversations,
        notifications,
        reports,
        blogPosts,
        addProduct,
        updateProduct,
        deleteProduct,
        moderateProduct,
        updateStore,
        createStore,
        placeOrder,
        updateOrderStatus,
        addReview,
        moderateReview,
        startConversation,
        sendMessage,
        markConversationAsRead,
        submitReport,
        resolveReport,
        createBlogPost,
        updateBlogPost,
        deleteBlogPost,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        updateUserRole,
        toggleUserSuspension
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
