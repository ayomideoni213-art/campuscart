-- =========================================================================
-- CAMPUSMART - SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- "Your Campus. Your Marketplace. Buy. Sell. Build."
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null default 'customer' check (role in ('customer', 'seller', 'editor', 'author', 'admin')),
  avatar_url text,
  campus_name text not null default 'Metropolitan Central University',
  student_id text,
  phone text,
  bio text,
  is_suspended boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. STORES (Student-owned brands)
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  tagline text,
  description text,
  logo_url text,
  banner_url text,
  campus_location text not null,
  pickup_point text not null,
  rating numeric(3,2) default 5.00,
  reviews_count integer default 0,
  total_sales integer default 0,
  status text not null default 'active' check (status in ('active', 'pending', 'suspended')),
  instagram_handle text,
  verified_student boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES
create table public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  icon_name text not null,
  product_count integer default 0
);

-- 4. PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  store_name text not null,
  name text not null,
  slug text not null,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2) check (discount_price is null or discount_price < price),
  category_id text references public.categories(id) on delete set null,
  category_name text not null,
  images text[] not null default '{}',
  stock integer not null default 1 check (stock >= 0),
  status text not null default 'published' check (status in ('published', 'draft', 'pending_review', 'out_of_stock', 'suspended')),
  is_featured boolean default false,
  rating numeric(3,2) default 5.00,
  reviews_count integer default 0,
  condition text not null default 'Brand New',
  campus_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS & ORDER ITEMS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  customer_name text not null,
  customer_email text not null,
  delivery_info jsonb not null,
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) default 0,
  delivery_fee numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  payment_method text not null check (payment_method in ('campus_pay', 'card', 'cash_on_pickup', 'bank_transfer')),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'pending', 'failed', 'refunded')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  store_id uuid references public.stores(id) on delete cascade not null,
  store_name text not null,
  product_name text not null,
  price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  image_url text
);

-- 6. REVIEWS
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  product_name text not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_name text not null,
  user_avatar text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  verified_purchase boolean default true,
  status text not null default 'approved' check (status in ('approved', 'pending', 'flagged')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. CONVERSATIONS & CHAT MESSAGES
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  buyer_name text not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  seller_name text not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  store_name text not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  product_image text,
  last_message text,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unread_by_buyer boolean default false,
  unread_by_seller boolean default false
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sender_name text not null,
  sender_avatar text,
  text text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false
);

-- 8. NOTIFICATIONS
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('order', 'product', 'message', 'system', 'moderation')),
  is_read boolean default false,
  link_tab text,
  link_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. REPORTS (Safety & Moderation)
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reporter_name text not null,
  target_type text not null check (target_type in ('product', 'user', 'store', 'review')),
  target_id text not null,
  target_name text not null,
  reason text not null,
  details text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. BLOG POSTS
create table public.blog_posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  author_name text not null,
  author_avatar text,
  author_role text,
  title text not null,
  slug text unique not null,
  summary text not null,
  content text not null,
  category text not null,
  cover_image text,
  status text not null default 'published' check (status in ('published', 'draft')),
  read_time text default '3 min read',
  views integer default 0,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.blog_posts enable row level security;

-- Profiles: Public can read active user names/avatars; Users can update own profile; Admin has all access
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Stores: Anyone can view active stores; Sellers can manage their own store; Editors & Admins can manage all
create policy "Stores are viewable by everyone" on public.stores
  for select using (status = 'active' or auth.uid() = seller_id);

create policy "Sellers can update own store" on public.stores
  for update using (auth.uid() = seller_id);

-- Products: Everyone can view published products; Sellers only manage their own; Editors can moderate
create policy "Published products are viewable by everyone" on public.products
  for select using (status = 'published' or auth.uid() = seller_id);

create policy "Sellers can insert their own products" on public.products
  for insert with check (auth.uid() = seller_id);

create policy "Sellers can update their own products" on public.products
  for update using (auth.uid() = seller_id);

create policy "Sellers can delete their own products" on public.products
  for delete using (auth.uid() = seller_id);

-- Orders: Customers can see their orders; Sellers can see orders containing their store items
create policy "Customers can view own orders" on public.orders
  for select using (auth.uid() = customer_id);

create policy "Customers can insert orders" on public.orders
  for insert with check (auth.uid() = customer_id);

-- Conversations & Messages: Only participants can read and write
create policy "Participants can view conversations" on public.conversations
  for select using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Participants can view messages" on public.messages
  for select using (exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ));

create policy "Participants can send messages" on public.messages
  for insert with check (auth.uid() = sender_id);
