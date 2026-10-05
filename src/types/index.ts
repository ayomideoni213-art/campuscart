export type UserRole = 'customer' | 'seller' | 'editor' | 'author' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string;
  campus_name: string;
  student_id: string;
  phone: string;
  bio?: string;
  created_at: string;
  is_suspended?: boolean;
}

export interface Store {
  id: string;
  seller_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo_url: string;
  banner_url: string;
  campus_location: string;
  pickup_point: string;
  rating: number;
  reviews_count: number;
  total_sales: number;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  instagram_handle?: string;
  verified_student: boolean;
}

export type ProductStatus = 'published' | 'draft' | 'pending_review' | 'out_of_stock' | 'suspended';

export interface Product {
  id: string;
  seller_id: string;
  store_id: string;
  store_name: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  category_id: string;
  category_name: string;
  images: string[];
  stock: number;
  status: ProductStatus;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  condition: 'Brand New' | 'Like New' | 'Gently Used' | 'Handmade / Custom';
  campus_name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  product_count: number;
}

export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  selected_condition?: string;
}

export interface WishlistItem {
  product_id: string;
  added_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'campus_pay' | 'card' | 'cash_on_pickup' | 'bank_transfer';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface OrderItem {
  product_id: string;
  store_id: string;
  store_name: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface DeliveryDetails {
  student_name: string;
  student_email: string;
  student_id: string;
  phone: string;
  campus: string;
  delivery_type: 'campus_dorm' | 'student_union' | 'library_desk' | 'off_campus';
  location_detail: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  delivery_info: DeliveryDetails;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  product_name: string;
  store_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
  status: 'approved' | 'pending' | 'flagged';
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  text: string;
  timestamp: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  store_id: string;
  store_name: string;
  product_id?: string;
  product_name?: string;
  product_image?: string;
  last_message: string;
  last_updated: string;
  messages: ChatMessage[];
  unread_by_buyer: boolean;
  unread_by_seller: boolean;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'message' | 'system' | 'moderation';
  is_read: boolean;
  link_tab?: string;
  link_id?: string;
  created_at: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reporter_name: string;
  target_type: 'product' | 'user' | 'store' | 'review';
  target_id: string;
  target_name: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface BlogPost {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  author_role: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  cover_image: string;
  status: 'published' | 'draft';
  read_time: string;
  views: number;
  likes: number;
  created_at: string;
}

export interface CampusOption {
  id: string;
  name: string;
  short_code: string;
  pickup_hubs: string[];
}
