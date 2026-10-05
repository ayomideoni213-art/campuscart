import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';

import { RoleSwitcherBar } from './components/layout/RoleSwitcherBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

import { ProductCard } from './components/product/ProductCard';
import { ProductFilters } from './components/product/ProductFilters';
import { ProductDetailModal } from './components/product/ProductDetailModal';

import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { AuthModal } from './components/auth/AuthModal';

import { StoresDirectory } from './components/store/StoresDirectory';
import { StorefrontView } from './components/store/StorefrontView';
import { BecomeSellerView } from './components/store/BecomeSellerView';

import { BlogView } from './components/blog/BlogView';
import { BlogPostDetail } from './components/blog/BlogPostDetail';

import { CustomerDashboard } from './components/dashboards/CustomerDashboard';
import { SellerDashboard } from './components/dashboards/SellerDashboard';
import { EditorDashboard } from './components/dashboards/EditorDashboard';
import { AuthorDashboard } from './components/dashboards/AuthorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';

import { Product, BlogPost } from './types';
import {
  Sparkles,
  ShoppingBag,
  Store,
  ShieldCheck,
  Truck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Star,
  Layers,
  CheckCircle2,
  Bell
} from 'lucide-react';

function CampusMartApp() {
  const { currentUser, currentRole, selectedCampus, setSelectedCampus } = useAuth();
  const { products, stores, categories, startConversation } = useMarketplace();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Top banner dismiss state
  const [bannerVisible, setBannerVisible] = useState<boolean>(true);

  // Navigation Handler
  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStore = (storeId: string) => {
    handleNavigate('store-detail', storeId);
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleOpenMessage = (sellerId: string, storeId: string, productId?: string) => {
    const conv = startConversation(sellerId, storeId, productId);
    setActiveConvId(conv.id);
    setIsChatOpen(true);
  };

  const handleSelectBlogPost = (post: BlogPost) => {
    setSelectedBlogPost(post);
    handleNavigate('blog-detail', post.id);
  };

  // Filtered Products for Marketplace Discovery
  const filteredProducts = products.filter((p) => {
    // Only published listings visible on public marketplace
    if (p.status !== 'published') return false;

    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchStore = p.store_name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCategory = p.category_name.toLowerCase().includes(q);
      if (!matchName && !matchStore && !matchDesc && !matchCategory) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && p.category_id !== selectedCategory) {
      return false;
    }

    // Condition filter
    if (selectedCondition !== 'All' && p.condition !== selectedCondition) {
      return false;
    }

    // Campus filter (if not "All")
    if (selectedCampus !== 'All' && p.campus_name !== selectedCampus) {
      return false;
    }

    // Max Price
    const effectivePrice = p.discount_price ?? p.price;
    if (effectivePrice > maxPrice) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount_price ?? a.price;
    const priceB = b.discount_price ?? b.price;

    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'featured':
      default:
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return b.reviews_count - a.reviews_count;
    }
  });

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('All');
    setMaxPrice(200);
    setSortBy('featured');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* 1. Fast Role Switcher Test Bar */}
      <RoleSwitcherBar
        onOpenDashboard={(tab) => handleNavigate(`${currentRole}-dashboard`, tab)}
      />

      {/* 2. Top Promotional / Campus Notification Bar */}
      {bannerVisible && (
        <div className="bg-amber-400 text-stone-950 text-xs py-2 px-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-center w-full justify-center font-medium">
            <span className="font-bold">🎒 Fall 2026 Semester Hub:</span>
            <span>Free zero-fee physical handoff points active at Student Union & Quad tables.</span>
            <button
              onClick={() => handleNavigate('blog')}
              className="underline font-bold hover:text-stone-800 ml-1 hidden sm:inline"
            >
              Learn how handoffs work &rarr;
            </button>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="text-stone-900/60 hover:text-stone-900 text-sm font-bold pl-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* 3. Header Component (adhering to Top Bar Contract) */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMessages={() => setIsChatOpen(true)}
        onOpenNotifications={() => setIsNotifOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 4. Main Body Content Based on Active View */}
      <main className="flex-1">
        {/* VIEW: HOME MARKETPLACE */}
        {currentView === 'home' && (
          <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-stone-900 text-white">
              <div className="absolute inset-0 z-0">
                <img
                  src="/src/assets/images/hero_campus_marketplace_1791134300857.jpg"
                  alt="Vibrant Campus Quad"
                  className="w-full h-full object-cover opacity-25 filter brightness-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-6">
                <div className="max-w-3xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    Verified Student Marketplace & Entrepreneurship
                  </span>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                    Your Campus. <br />
                    <span className="text-amber-400">Your Marketplace.</span>
                  </h1>

                  <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
                    Buy directly from undergraduate peers. Sell products you build, bake, or curate. Meet safely between classes with zero shipping delays.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        const el = document.getElementById('marketplace-discovery');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Explore Campus Finds</span>
                    </button>

                    <button
                      onClick={() => {
                        if (currentRole === 'seller') {
                          handleNavigate('seller-dashboard');
                        } else {
                          handleNavigate('become-seller');
                        }
                      }}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-sm border border-white/20 transition-all flex items-center gap-2"
                    >
                      <Store className="w-4 h-4 text-amber-300" />
                      <span>{currentRole === 'seller' ? 'Open Seller Studio' : 'Open a Student Store'}</span>
                    </button>
                  </div>
                </div>

                {/* Campus Trust Indicators */}
                <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-300 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Active .edu Student Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Free Campus Quad Handoffs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>0% Platform Commission</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Student Stores Spotlight */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    Featured Student Stores
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Independent brands founded and operated by current undergraduate students.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('stores')}
                  className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 group"
                >
                  <span>View All Stores</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleOpenStore(store.id)}
                    className="group cursor-pointer bg-white rounded-xl border border-stone-200 p-4 hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={store.logo_url}
                        alt={store.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="text-sm font-bold text-stone-900 truncate group-hover:text-amber-800 transition-colors">
                            {store.name}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">{store.tagline}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-stone-800">{store.rating.toFixed(1)}</span>
                        <span className="text-stone-400">({store.reviews_count})</span>
                      </div>
                      <span className="font-mono text-[11px] text-stone-600">
                        {store.total_sales} sales
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Category Quick Selector Carousel */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                    selectedCategory === 'all'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>All Categories ({products.filter((p) => p.status === 'published').length})</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] ${
                        selectedCategory === cat.id ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      ({cat.product_count})
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Main Product Discovery Section */}
            <section id="marketplace-discovery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left: Filters Sidebar */}
                <div className="w-full lg:w-64 shrink-0">
                  <ProductFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    selectedCondition={selectedCondition}
                    onSelectCondition={setSelectedCondition}
                    selectedCampus={selectedCampus}
                    onSelectCampus={setSelectedCampus}
                    sortBy={sortBy}
                    onSelectSort={setSortBy}
                    maxPrice={maxPrice}
                    onPriceChange={setMaxPrice}
                    onResetFilters={resetFilters}
                  />
                </div>

                {/* Right: Product Grid */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
                    <div>
                      Showing <span className="font-bold text-stone-900">{sortedProducts.length}</span> campus listings
                      {searchQuery && (
                        <span> matching "<strong className="text-stone-800">{searchQuery}</strong>"</span>
                      )}
                    </div>
                    {sortedProducts.length > 0 && (
                      <span className="font-mono text-stone-400">
                        {selectedCampus.split(' ')[0]} Hub
                      </span>
                    )}
                  </div>

                  {sortedProducts.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-stone-200 p-8 space-y-3">
                      <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-stone-900">No matching campus products</h3>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Try adjusting your filters, selecting a different category, or resetting your price range.
                      </p>
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {sortedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={handleOpenProduct}
                          onSelectStore={handleOpenStore}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* How CampusMart Works */}
            <section className="bg-stone-100 py-16 border-y border-stone-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Simple & Safe
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                    How CampusMart Works
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Designed around physical campus density, student schedules, and verified identity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 shadow-2xs">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">Sign Up with .EDU</h3>
                    <p className="text-stone-500 leading-relaxed">
                      Register with your university email and campus student ID for verified badge access.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 shadow-2xs">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">Discover Peer Finds</h3>
                    <p className="text-stone-500 leading-relaxed">
                      Browse tech gadgets, textbooks, vintage apparel, and dorm-baked treats sold by classmates.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 shadow-2xs">
                    <span className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">Zero-Fee Quad Handoff</h3>
                    <p className="text-stone-500 leading-relaxed">
                      Order through secure escrow or cash-on-pickup and meet right at library or quad tables.
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 shadow-2xs">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <h3 className="text-sm font-bold text-stone-900">Build Your Brand</h3>
                    <p className="text-stone-500 leading-relaxed">
                      Transition from buyer to business owner in 2 minutes and launch your student storefront.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW: STORES DIRECTORY */}
        {currentView === 'stores' && (
          <StoresDirectory
            onSelectStore={handleOpenStore}
            onOpenCreateStore={() => handleNavigate('become-seller')}
          />
        )}

        {/* VIEW: DEDICATED STOREFRONT PAGE */}
        {currentView === 'store-detail' && viewParam && (
          <StorefrontView
            storeId={viewParam}
            onBack={() => handleNavigate('home')}
            onSelectProduct={handleOpenProduct}
            onOpenMessage={handleOpenMessage}
          />
        )}

        {/* VIEW: BECOME A SELLER */}
        {currentView === 'become-seller' && (
          <BecomeSellerView
            onSuccess={() => handleNavigate('seller-dashboard')}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* VIEW: BLOG LISTING */}
        {currentView === 'blog' && (
          <BlogView
            onSelectPost={handleSelectBlogPost}
            onOpenAuthorStudio={() => handleNavigate('author-dashboard')}
          />
        )}

        {/* VIEW: BLOG POST DETAIL */}
        {currentView === 'blog-detail' && selectedBlogPost && (
          <BlogPostDetail
            post={selectedBlogPost}
            onBack={() => handleNavigate('blog')}
            onSelectOtherPost={handleSelectBlogPost}
          />
        )}

        {/* VIEW: CUSTOMER DASHBOARD */}
        {currentView === 'customer-dashboard' && (
          <CustomerDashboard
            initialTab={viewParam || 'orders'}
            onSelectProduct={(pId) => {
              const p = products.find((prod) => prod.id === pId);
              if (p) handleOpenProduct(p);
            }}
            onOpenStore={handleOpenStore}
          />
        )}

        {/* VIEW: SELLER DASHBOARD */}
        {currentView === 'seller-dashboard' && <SellerDashboard />}

        {/* VIEW: EDITOR DASHBOARD */}
        {currentView === 'editor-dashboard' && <EditorDashboard />}

        {/* VIEW: AUTHOR DASHBOARD */}
        {currentView === 'author-dashboard' && <AuthorDashboard />}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* 5. Drawers & Modals */}
      {/* Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Multi-Step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={(orderNumber) => {
          handleNavigate('customer-dashboard', 'orders');
        }}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onVisitStore={handleOpenStore}
          onOpenMessage={handleOpenMessage}
        />
      )}

      {/* Real-Time Peer Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeConversationId={activeConvId}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigateToTab={(tab) => handleNavigate(`${currentRole}-dashboard`, tab)}
      />

      {/* Auth Modal (Login / Register / Demo Switch) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* 6. Footer Component */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MarketplaceProvider>
          <CampusMartApp />
        </MarketplaceProvider>
      </CartProvider>
    </AuthProvider>
  );
}
