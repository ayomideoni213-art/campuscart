import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { MarketplaceProvider, useMarketplace } from './context/MarketplaceContext';

import { RoleSwitcherBar } from './components/layout/RoleSwitcherBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CampusBar } from './components/layout/CampusBar';
import { isServedOnCampus, isPurchasable, shortCampus } from './lib/shopping';

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

import heroCampusImage from './assets/images/hero_campus_students.jpg';
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
  Bell,
  BookOpen
} from 'lucide-react';

function CampusMartApp() {
  const { currentUser, currentRole, selectedCampus, setSelectedCampus } = useAuth();
  const { products, productsStatus, reloadProducts, stores, categories, blogPosts, startConversation } = useMarketplace();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [failedStoreLogos, setFailedStoreLogos] = useState<Record<string, boolean>>({});
  const [failedStoryImages, setFailedStoryImages] = useState<Record<string, boolean>>({});

  // Navigation State
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Modals & Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const { isCartOpen, setIsCartOpen } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [activeConvId, setActiveConvId] = useState<string | undefined>(undefined);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Top banner dismiss state
  const [bannerVisible, setBannerVisible] = useState<boolean>(true);

  // Navigation Handler
  const handleNavigate = (view: string, param?: string) => {
    if (view === 'admin-dashboard' && currentRole !== 'admin') {
      setCurrentView('home');
      setViewParam(undefined);
      return;
    }

    setCurrentView(view);
    setViewParam(param);

    // Keep the address bar in sync so a store page can be shared or bookmarked.
    if (view === 'store-detail' && param) {
      const target = stores.find((s) => s.id === param || s.slug === param);
      window.history.replaceState(null, '', `#store-${encodeURIComponent(target?.slug || param)}`);
    } else if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open a shared store link such as /#store-ays-tech-hub (also on later hash changes).
  useEffect(() => {
    const openFromHash = () => {
      const match = window.location.hash.match(/^#store-(.+)$/);
      if (!match) return;
      setCurrentView('store-detail');
      setViewParam(decodeURIComponent(match[1]));
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

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
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      const haystack = [p.name, p.store_name, p.description, p.category_name, p.condition, p.campus_name]
        .join(' ')
        .toLowerCase();
      if (!terms.every((term) => haystack.includes(term))) return false;
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
    const productStore = stores.find((s) => s.id === p.store_id);
    if (!isServedOnCampus(p, productStore, selectedCampus)) {
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

    const buyableA = isPurchasable(a);
    const buyableB = isPurchasable(b);
    if (buyableA !== buyableB) return buyableA ? -1 : 1;

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

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCondition !== 'All' ? 1 : 0) +
    (maxPrice < 150000 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCondition('All');
    setMaxPrice(150000);
    setSortBy('featured');
    setSearchQuery('');
  };

  const scrollToDiscovery = () => {
    const el = document.getElementById('marketplace-discovery');
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const featuredStores = stores
    .filter(
      (s) =>
        selectedCampus === 'All' ||
        s.campus_location === selectedCampus ||
        (s.campuses_served ?? []).includes(selectedCampus)
    )
    .slice(0, 4);

  const publishedStories = blogPosts.filter((post) => post.status === 'published').slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-[#0c0e12] text-stone-900 dark:text-stone-100 transition-colors">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* 1. Fast Role Switcher Test Bar */}
      {import.meta.env.DEV && (
        <RoleSwitcherBar
          onOpenDashboard={(tab) => handleNavigate(`${currentRole}-dashboard`, tab)}
        />
      )}

      {/* 2. Top Promotional / Campus Notification Bar */}
      {bannerVisible && (
        <div className="bg-brand-400 dark:bg-brand-500 text-stone-950 text-xs py-1.5 px-4 border-b border-brand-500/30 dark:border-brand-600/30 flex items-center justify-between gap-2">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 text-center w-full justify-center font-medium">
            <span className="font-bold">Zero-fee campus handoffs:</span>
            <span>Meet-up points are active across EKSU, FUOYE, ABUAD, BOUESTI &amp; Venite University.</span>
            <button
              type="button"
              onClick={() => handleNavigate('blog')}
              className="underline font-bold hover:text-stone-800 ml-1 hidden sm:inline cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-950"
            >
              Read Campus Stories &rarr;
            </button>
          </div>
          <button
            type="button"
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss campus announcement"
            className="min-w-[32px] min-h-[32px] flex items-center justify-center rounded-md text-stone-950/80 hover:text-stone-950 hover:bg-stone-950/10 text-base font-bold shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-950"
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

      {(currentView === 'home' || currentView === 'stores' || currentView === 'store-detail') && <CampusBar />}

      {/* 4. Main Body Content Based on Active View */}
      <main id="main-content" className="flex-1">
        {/* VIEW: HOME MARKETPLACE */}
        {currentView === 'home' && (
          <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <section
              aria-labelledby="hero-heading"
              className="relative overflow-hidden bg-brand-950 text-white"
            >
              {/* Decorative campus backdrop (hidden from assistive tech) */}
              <div
                aria-hidden="true"
                className="absolute inset-0 z-0 bg-gradient-to-br from-brand-950 via-brand-900 to-stone-950"
              >
                {!heroImageFailed ? (
                  <img
                    src={heroCampusImage}
                    alt=""
                    role="presentation"
                    draggable={false}
                    onError={() => setHeroImageFailed(true)}
                    className="absolute inset-y-0 right-0 h-full w-full md:w-[75%] lg:w-[64%] object-cover object-[72%_center] opacity-35 sm:opacity-55 lg:opacity-75 select-none pointer-events-none [mask-image:linear-gradient(to_right,transparent_0%,transparent_26%,black_58%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,transparent_26%,black_58%)]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(74,222,128,0.22),transparent_55%)]" />
                )}
                {/* Blend into the dark-green background and protect text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-950/95 via-brand-950/80 to-brand-950/55 lg:via-brand-950/60 lg:to-brand-950/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/35 to-transparent" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 space-y-6">
                <div className="max-w-2xl space-y-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-300 bg-brand-400/15 px-3 py-1 rounded-full border border-brand-400/30">
                    <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                    Ekiti Student Marketplace &amp; Brands
                  </span>

                  <h1
                    id="hero-heading"
                    className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]"
                  >
                    Your Campus. <br />
                    <span className="text-brand-400">Your Marketplace.</span>
                  </h1>

                  <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-xl">
                    Shop directly from fellow students across Ekiti universities in ₦. Discover textbooks, fashion, gadgets, and campus-made goods — and meet safely between lectures with zero shipping fees.
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={scrollToDiscovery}
                      className="px-6 py-3 min-h-[44px] bg-brand-400 hover:bg-brand-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                    >
                      <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                      <span>Browse Campus Finds</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigate('stores')}
                      className="px-6 py-3 min-h-[44px] bg-white/12 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-sm border border-white/25 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      <Store className="w-4 h-4 text-brand-300" aria-hidden="true" />
                      <span>Explore Student Stores</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(currentRole === 'seller' ? 'seller-dashboard' : 'become-seller')
                      }
                      className="px-3 py-2 min-h-[44px] text-xs sm:text-sm font-semibold text-brand-300 hover:text-white underline underline-offset-4 transition-colors cursor-pointer rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      {currentRole === 'seller' ? 'Manage My Store →' : 'Sell on Campus →'}
                    </button>
                  </div>
                </div>

                {/* Campus Trust Indicators */}
                <div className="pt-8 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs text-stone-200 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" aria-hidden="true" />
                    <span>Verified Student Sellers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-brand-400 shrink-0" aria-hidden="true" />
                    <span>Free Campus &amp; Hostel Handoffs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400 shrink-0" aria-hidden="true" />
                    <span>Pay at Meetup in ₦ (0% Fee)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Popular Student Stores Spotlight */}
            <section
              aria-labelledby="featured-stores-heading"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                <div>
                  <h2
                    id="featured-stores-heading"
                    className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight"
                  >
                    Featured Student Stores
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    {selectedCampus === 'All'
                      ? 'Independent brands run by students across Ekiti campuses.'
                      : `Student brands serving ${shortCampus(selectedCampus)}.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('stores')}
                  className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline flex items-center gap-1 min-h-[36px] px-1 rounded cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span>View All Stores</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {featuredStores.length === 0 ? (
                <div className="bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-stone-900 dark:text-white">
                      {stores.length === 0
                        ? 'No student stores yet'
                        : `No stores currently listed for ${shortCampus(selectedCampus)}`}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      {stores.length === 0
                        ? 'Be the first student to launch a storefront on CampusMart.'
                        : 'Browse stores across all Ekiti campuses or open one on this campus.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedCampus !== 'All' && stores.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCampus('All')}
                        className="px-4 py-2 min-h-[40px] border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-100 dark:hover:bg-[#1c222e] cursor-pointer"
                      >
                        Show All Campuses
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(currentRole === 'seller' ? 'seller-dashboard' : 'become-seller')
                      }
                      className="px-4 py-2 min-h-[40px] bg-brand-600 hover:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      {currentRole === 'seller' ? 'My Store' : 'Open a Store'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredStores.map((store) => {
                    const showLogo = Boolean(store.logo_url) && !failedStoreLogos[store.id];
                    return (
                      <button
                        key={store.id}
                        type="button"
                        onClick={() => handleOpenStore(store.id)}
                        className="group text-left cursor-pointer bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] p-4 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-400/50 transition-all space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <div className="flex items-center gap-3">
                          {showLogo ? (
                            <img
                              src={store.logo_url}
                              alt=""
                              loading="lazy"
                              onError={() =>
                                setFailedStoreLogos((prev) => ({ ...prev, [store.id]: true }))
                              }
                              className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-[#262e3d] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60 flex items-center justify-center font-black text-base shrink-0"
                            >
                              {(store.name?.trim()?.[0] || 'S').toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1">
                              <h3 className="text-sm font-bold text-stone-900 dark:text-white truncate group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                                {store.name}
                              </h3>
                              {store.verified_student && (
                                <ShieldCheck
                                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                                  aria-label="Verified student store"
                                />
                              )}
                            </div>
                            <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate">
                              {store.tagline || shortCampus(store.campus_location)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 dark:border-[#262e3d] flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" aria-hidden="true" />
                            <span className="font-semibold text-stone-800 dark:text-stone-200">
                              {Number(store.rating ?? 0).toFixed(1)}
                            </span>
                            <span className="text-stone-500 dark:text-stone-400">({store.reviews_count ?? 0})</span>
                          </div>
                          <span className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0" aria-hidden="true" />
                            {shortCampus(store.campus_location)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Category Quick Selector Carousel */}
            <section aria-label="Product categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  aria-pressed={selectedCategory === 'all'}
                  className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    selectedCategory === 'all'
                      ? 'bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950 shadow-xs'
                      : 'bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c222e]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>All Categories ({products.filter((p) => p.status === 'published').length})</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={selectedCategory === cat.id}
                    className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                      selectedCategory === cat.id
                        ? 'bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950 shadow-xs'
                        : 'bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c222e]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`text-[10px] ${
                        selectedCategory === cat.id ? 'text-brand-100 dark:text-stone-900' : 'text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      ({cat.product_count})
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Main Product Discovery Section */}
            <section
              id="marketplace-discovery"
              aria-label="Browse campus listings"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24"
            >
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left: Filters Sidebar */}
                <div className="w-full lg:w-64 shrink-0">
                  <button
                    type="button"
                    onClick={() => setFiltersOpen((o) => !o)}
                    aria-expanded={filtersOpen}
                    aria-controls="product-filters-panel"
                    className="lg:hidden w-full mb-3 flex items-center justify-between px-4 py-3 min-h-[44px] bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-xl text-sm font-semibold text-stone-800 dark:text-stone-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span>Filters &amp; sorting{activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}</span>
                    <span aria-hidden="true">{filtersOpen ? '−' : '+'}</span>
                  </button>
                  <div id="product-filters-panel" className={filtersOpen ? 'block' : 'hidden lg:block'}>
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
                </div>

                {/* Right: Product Grid */}
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pb-2 border-b border-stone-200 dark:border-[#262e3d]">
                    <div aria-live="polite">
                      Showing <span className="font-bold text-stone-900 dark:text-white">{sortedProducts.length}</span> {sortedProducts.length === 1 ? 'listing' : 'listings'}{selectedCampus === 'All' ? '' : ` for ${shortCampus(selectedCampus)}`}
                      {searchQuery && (
                        <span> matching "<strong className="text-stone-800 dark:text-stone-200">{searchQuery}</strong>"</span>
                      )}
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="font-semibold text-brand-700 dark:text-brand-400 hover:underline cursor-pointer"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  {productsStatus === 'error' && (
                    <div role="alert" className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3">
                      <span>We could not load the latest listings. {products.length > 0 ? 'Showing the last saved items.' : 'Please check your connection.'}</span>
                      <button type="button" onClick={reloadProducts} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold cursor-pointer">
                        Try again
                      </button>
                    </div>
                  )}

                  {productsStatus === 'loading' && products.length === 0 ? (
                    <div role="status" aria-label="Loading listings" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-80 rounded-xl bg-stone-200/70 dark:bg-[#1c222e] animate-pulse" />
                      ))}
                    </div>
                  ) : sortedProducts.length === 0 ? (
                    <div className="py-20 text-center bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-8 space-y-3">
                      <div className="w-12 h-12 bg-stone-100 dark:bg-[#1c222e] rounded-full flex items-center justify-center mx-auto text-stone-400 dark:text-stone-500">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-white">
                        {products.filter((p) => p.status === 'published').length === 0
                          ? 'No listings yet'
                          : 'No matching listings'}
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                        {products.filter((p) => p.status === 'published').length === 0
                          ? 'Student sellers have not posted anything yet. Check back soon, or open your own store.'
                          : selectedCampus === 'All'
                          ? 'Try different keywords or clear your filters.'
                          : `Nothing matches for ${shortCampus(selectedCampus)}. Clear your filters or look across all campuses.`}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {activeFilterCount > 0 && (
                          <button
                            type="button"
                            onClick={resetFilters}
                            className="px-4 py-2 bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950 rounded-lg text-xs font-semibold hover:bg-brand-700 dark:hover:bg-brand-300 cursor-pointer"
                          >
                            Clear filters
                          </button>
                        )}
                        {selectedCampus !== 'All' && (
                          <button
                            type="button"
                            onClick={() => setSelectedCampus('All')}
                            className="px-4 py-2 border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-100 dark:hover:bg-[#1c222e] cursor-pointer"
                          >
                            Show all campuses
                          </button>
                        )}
                      </div>
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

            {/* Campus Stories Spotlight */}
            <section
              aria-labelledby="campus-stories-heading"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                <div>
                  <h2
                    id="campus-stories-heading"
                    className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight"
                  >
                    Campus Stories
                  </h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Safety guides, student founder features, and buying tips across Ekiti campuses.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigate('blog')}
                  className="text-xs font-semibold text-brand-700 dark:text-brand-400 hover:underline flex items-center gap-1 min-h-[36px] px-1 rounded cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <span>Read All Stories</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {publishedStories.length === 0 ? (
                <div className="bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-400 flex items-center justify-center shrink-0"
                    >
                      <BookOpen className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-white">No stories published yet</p>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        Check back soon for student guides and campus founder spotlights.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('blog')}
                    className="px-4 py-2 min-h-[40px] border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold hover:bg-stone-100 dark:hover:bg-[#1c222e] cursor-pointer"
                  >
                    Visit Campus Stories
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {publishedStories.map((post) => {
                    const showCover = Boolean(post.cover_image) && !failedStoryImages[post.id];
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => handleSelectBlogPost(post)}
                        className="group text-left bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] overflow-hidden hover:shadow-md hover:border-brand-300 dark:hover:border-brand-400/50 transition-all flex flex-col cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <div className="aspect-16/9 w-full bg-stone-100 dark:bg-[#1c222e] overflow-hidden relative">
                          {showCover ? (
                            <img
                              src={post.cover_image}
                              alt=""
                              loading="lazy"
                              onError={() =>
                                setFailedStoryImages((prev) => ({ ...prev, [post.id]: true }))
                              }
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 flex items-center justify-center text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40"
                            >
                              <BookOpen className="w-7 h-7" />
                            </span>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                            <span className="font-semibold text-brand-700 dark:text-brand-400">{post.category}</span>
                            <span>{post.read_time}</span>
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                            {post.summary}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* How CampusMart Works */}
            <section
              aria-labelledby="how-it-works-heading"
              className="bg-stone-100 dark:bg-[#13171f] py-16 border-y border-stone-200 dark:border-[#262e3d]"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                    Simple &amp; Safe
                  </span>
                  <h2
                    id="how-it-works-heading"
                    className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight"
                  >
                    How CampusMart Works
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                    Built around Ekiti campus life, student schedules, and face-to-face handoffs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
                  <div className="bg-white dark:bg-[#181e28] p-5 rounded-2xl border border-stone-200 dark:border-[#262e3d] space-y-2 shadow-2xs">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-brand-700 dark:bg-brand-500 text-white dark:text-stone-950 flex items-center justify-center font-bold text-xs"
                    >
                      1
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">Create Your Account</h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Sign up with your email, select your Ekiti campus, and add your student details.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#181e28] p-5 rounded-2xl border border-stone-200 dark:border-[#262e3d] space-y-2 shadow-2xs">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-brand-700 dark:bg-brand-500 text-white dark:text-stone-950 flex items-center justify-center font-bold text-xs"
                    >
                      2
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">Browse Campus Finds</h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Filter textbooks, gadgets, fashion, and handmade goods priced in ₦ for your campus.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#181e28] p-5 rounded-2xl border border-stone-200 dark:border-[#262e3d] space-y-2 shadow-2xs">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-brand-700 dark:bg-brand-500 text-white dark:text-stone-950 flex items-center justify-center font-bold text-xs"
                    >
                      3
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">Zero-Fee Campus Handoff</h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Message the seller to agree a meetup spot, inspect your item, and pay by cash or transfer.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-[#181e28] p-5 rounded-2xl border border-stone-200 dark:border-[#262e3d] space-y-2 shadow-2xs">
                    <span
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full bg-brand-400 text-stone-950 flex items-center justify-center font-bold text-xs"
                    >
                      4
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white">Build Your Brand</h3>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Open a student storefront, choose the campuses you serve, and sell directly to peers.
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
            onBecomeSeller={() => handleNavigate('become-seller')}
          />
        )}

        {/* VIEW: SELLER DASHBOARD */}
        {currentView === 'seller-dashboard' && <SellerDashboard onCreateStore={() => handleNavigate('become-seller')} />}

        {/* VIEW: EDITOR DASHBOARD */}
        {currentView === 'editor-dashboard' && <EditorDashboard />}

        {/* VIEW: AUTHOR DASHBOARD */}
        {currentView === 'author-dashboard' && <AuthorDashboard />}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin-dashboard' && currentRole === 'admin' && <AdminDashboard />}
      </main>

      {/* 5. Drawers & Modals */}
      {/* Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
            return;
          }
          setIsCheckoutOpen(true);
        }}
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CampusMart render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50 dark:bg-[#0d1117] text-stone-900 dark:text-stone-100 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl p-6 text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-lg font-bold">Something went wrong</h1>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              CampusMart encountered an unexpected issue while rendering. Please reload the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Refresh CampusMart
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <MarketplaceProvider>
              <CampusMartApp />
            </MarketplaceProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
