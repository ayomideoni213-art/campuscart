import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { dropdownVariants, FAST_TRANSITION } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  ShoppingBag,
  Heart,
  Search,
  MessageSquare,
  Bell,
  LogOut,
  LayoutDashboard,
  Store,
  Menu,
  X
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenAuth: () => void;
  onOpenCart: () => void;
  onOpenMessages: () => void;
  onOpenNotifications: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenCart,
  onOpenMessages,
  onOpenNotifications,
  searchQuery,
  setSearchQuery
}) => {
  const { currentUser, currentRole, logout } = useAuth();
  const { cartCount, wishlist } = useCart();
  const { unreadNotificationsCount, conversations } = useMarketplace();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabletSearchOpen, setTabletSearchOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const tabletSearchRef = useRef<HTMLInputElement>(null);

  // Reset avatar fallback when the signed-in user changes.
  useEffect(() => {
    setAvatarFailed(false);
  }, [currentUser?.avatar_url]);

  // Close menus on Escape, outside clicks, or viewport breakpoint changes.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const wasMobileOpen = mobileMenuOpen;
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setTabletSearchOpen(false);
        if (wasMobileOpen) {
          mobileToggleRef.current?.focus();
        }
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(target)) {
        setMobileMenuOpen(false);
        setTabletSearchOpen(false);
      }
    };

    const mdQuery = window.matchMedia('(min-width: 768px)');
    const lgQuery = window.matchMedia('(min-width: 1024px)');
    const onViewportChange = () => {
      if (mdQuery.matches) setMobileMenuOpen(false);
      if (lgQuery.matches || !mdQuery.matches) setTabletSearchOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    mdQuery.addEventListener('change', onViewportChange);
    lgQuery.addEventListener('change', onViewportChange);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      mdQuery.removeEventListener('change', onViewportChange);
      lgQuery.removeEventListener('change', onViewportChange);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (tabletSearchOpen) {
      tabletSearchRef.current?.focus();
    }
  }, [tabletSearchOpen]);

  // Navigate and always close any open menu.
  const go = (view: string, param?: string) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setTabletSearchOpen(false);
    onNavigate(view, param);
  };

  const handleSearchSubmit = () => {
    if (currentView !== 'home') {
      go('home');
    } else {
      setMobileMenuOpen(false);
      setTabletSearchOpen(false);
    }
    requestAnimationFrame(() => {
      const el = document.getElementById('marketplace-discovery');
      if (el) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  };

  const navItems = [
    { key: 'home', label: 'Home', active: currentView === 'home', onSelect: () => go('home') },
    {
      key: 'stores',
      label: 'Student Stores',
      active: currentView === 'stores' || currentView === 'store-detail',
      onSelect: () => go('stores')
    },
    {
      key: 'blog',
      label: 'Campus Stories',
      active: currentView === 'blog' || currentView === 'blog-detail',
      onSelect: () => go('blog')
    },
    {
      key: 'sell',
      label: currentRole === 'seller' ? 'My Store' : 'Sell on Campus',
      active: currentView === 'become-seller' || currentView === 'seller-dashboard',
      onSelect: () => (currentRole === 'seller' ? go('seller-dashboard', 'products') : go('become-seller')),
      highlight: true
    }
  ];

  const unreadMessagesCount = conversations.reduce((acc, conv) => {
    if (!currentUser) return acc;
    const isBuyer = conv.buyer_id === currentUser.id;
    if (isBuyer && conv.unread_by_buyer) return acc + 1;
    if (!isBuyer && conv.unread_by_seller) return acc + 1;
    return acc;
  }, 0);

  const getDashboardLabel = () => {
    switch (currentRole) {
      case 'seller':
        return 'Seller Studio';
      case 'editor':
        return 'Editor Center';
      case 'author':
        return 'Author Studio';
      case 'admin':
        return 'Admin Panel';
      default:
        return 'My Account';
    }
  };

  const userInitial = (currentUser?.full_name?.trim()?.[0] || 'U').toUpperCase();

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 bg-white/95 dark:bg-[#0f131b]/95 backdrop-blur-md border-b border-stone-200 dark:border-[#222936] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => go('home')}
              className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-white flex items-center gap-1.5 min-h-[40px] pr-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 cursor-pointer"
              aria-label="CampusMart Home"
            >
              <span
                aria-hidden="true"
                className="w-8 h-8 rounded-lg bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950 flex items-center justify-center text-lg font-black shadow-sm transition-colors"
              >
                C
              </span>
              <span>CampusMart</span>
            </button>
          </div>

          {/* Zone 2: Primary navigation (tablet & desktop) */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onSelect}
                aria-current={item.active ? 'page' : undefined}
                className={`relative px-3 py-2 min-h-[40px] rounded-lg whitespace-nowrap transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  item.active
                    ? 'text-brand-700 dark:text-brand-400 font-semibold bg-brand-50/70 dark:bg-brand-950/30 after:absolute after:left-3 after:right-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-600 dark:after:bg-brand-400'
                    : item.highlight
                    ? 'text-brand-700 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/40'
                    : 'text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1c222e]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <label htmlFor="header-search" className="sr-only">
              Search products, textbooks, and campus gear
            </label>
            <Search className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute left-3 pointer-events-none" aria-hidden="true" />
            <input
              id="header-search"
              type="search"
              placeholder="Search products, textbooks, dorm gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-stone-100 dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-[#1a202c] text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center rounded text-sm text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Zone 3: Actions & User controls */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Tablet Search Toggle (bridges md -> lg gap) */}
            <button
              type="button"
              onClick={() => {
                setTabletSearchOpen((open) => !open);
                setUserMenuOpen(false);
              }}
              aria-expanded={tabletSearchOpen}
              aria-controls="tablet-search-bar"
              aria-label={tabletSearchOpen ? 'Close search' : 'Search products'}
              title="Search products"
              className="hidden md:inline-flex lg:hidden items-center justify-center min-w-[40px] min-h-[40px] p-2 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {tabletSearchOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Search className="w-5 h-5" aria-hidden="true" />}
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle variant="icon" />

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => go('customer-dashboard', 'wishlist')}
              className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              title="Saved Items"
              aria-label={wishlist.length > 0 ? `Saved items (${wishlist.length})` : 'Saved items'}
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
              {wishlist.length > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Messages Button */}
            {currentUser && (
              <button
                type="button"
                onClick={onOpenMessages}
                className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                title="Student Messages"
                aria-label={unreadMessagesCount > 0 ? `Messages (${unreadMessagesCount} unread)` : 'Messages'}
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                {unreadMessagesCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications Button */}
            {currentUser && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                title="Notifications"
                aria-label={
                  unreadNotificationsCount > 0
                    ? `Notifications (${unreadNotificationsCount} unread)`
                    : 'Notifications'
                }
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {unreadNotificationsCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] bg-brand-600 hover:bg-brand-700 active:scale-[0.97] text-white dark:bg-brand-400 dark:hover:bg-brand-300 dark:text-stone-950 font-bold rounded-lg text-xs shadow-sm transition-all whitespace-nowrap ml-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              aria-label={`Shopping bag (${cartCount} ${cartCount === 1 ? 'item' : 'items'})`}
            >
              <ShoppingBag className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Bag</span>
              <motion.span
                key={cartCount}
                initial={{ scale: 0.85, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={FAST_TRANSITION}
                aria-hidden="true"
                className="bg-white/20 text-white dark:bg-stone-900 dark:text-brand-300 font-bold px-1.5 py-0.5 rounded text-[11px] leading-none tabular-nums"
              >
                {cartCount}
              </motion.span>
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => {
                    setUserMenuOpen((open) => !open);
                    setMobileMenuOpen(false);
                    setTabletSearchOpen(false);
                  }}
                  className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label="User account menu"
                >
                  {currentUser.avatar_url && !avatarFailed ? (
                    <img
                      src={currentUser.avatar_url}
                      alt=""
                      onError={() => setAvatarFailed(true)}
                      className="w-8 h-8 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-200 border border-brand-200 dark:border-brand-700 text-xs font-bold flex items-center justify-center"
                    >
                      {userInitial}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    role="menu"
                    aria-label="Account options"
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#171d27] border border-stone-200 dark:border-[#262e3d] rounded-xl shadow-xl py-2 z-50 origin-top-right"
                  >
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-[#222936]">
                      <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                        {currentUser.full_name}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-stone-600 dark:text-stone-300">
                        <span className="capitalize px-1.5 py-0.5 bg-stone-100 dark:bg-[#202736] rounded text-stone-700 dark:text-stone-300">
                          {currentUser.role}
                        </span>
                        {currentUser.student_id && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{currentUser.student_id}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => go(`${currentRole}-dashboard`)}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#1f2735] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-stone-500 dark:text-stone-400" aria-hidden="true" />
                      {getDashboardLabel()}
                    </button>

                    {currentRole === 'customer' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => go('become-seller')}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                        Open a Student Store
                      </button>
                    )}

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => go('customer-dashboard', 'orders')}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#1f2735] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-500 dark:text-stone-400" aria-hidden="true" />
                      My Orders
                    </button>

                    <div className="border-t border-stone-100 dark:border-[#222936] my-1" role="separator" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" aria-hidden="true" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors whitespace-nowrap ml-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              ref={mobileToggleRef}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => {
                setMobileMenuOpen((open) => !open);
                setUserMenuOpen(false);
              }}
              className="md:hidden inline-flex items-center justify-center min-w-[40px] min-h-[40px] p-2 text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tablet Search Bar (md to lg) */}
      <AnimatePresence>
      {tabletSearchOpen && (
        <motion.div
          id="tablet-search-bar"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="hidden md:block lg:hidden border-t border-stone-200 dark:border-[#222936] bg-white dark:bg-[#0f131b] px-6 py-2.5"
        >
          <div className="max-w-xl mx-auto relative flex items-center">
            <label htmlFor="tablet-search-input" className="sr-only">
              Search products, textbooks, and campus gear
            </label>
            <Search className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute left-3 pointer-events-none" aria-hidden="true" />
            <input
              ref={tabletSearchRef}
              id="tablet-search-input"
              type="search"
              placeholder="Search products, textbooks, dorm gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100 dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 min-w-[28px] min-h-[28px] flex items-center justify-center text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          id="mobile-menu"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="md:hidden border-t border-stone-200 dark:border-[#222936] bg-white dark:bg-[#0f131b] px-4 pt-2 pb-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg origin-top"
        >
          <div className="pt-2 pb-1 relative">
            <label htmlFor="mobile-search" className="sr-only">
              Search products
            </label>
            <Search className="w-4 h-4 text-stone-500 dark:text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="mobile-search"
              type="search"
              placeholder="Search products, textbooks, dorm gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              className="w-full pl-9 pr-3 py-2.5 min-h-[44px] text-sm bg-stone-100 dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] text-stone-900 dark:text-stone-100 placeholder:text-stone-500 dark:placeholder:text-stone-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <nav aria-label="Mobile" className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onSelect}
                aria-current={item.active ? 'page' : undefined}
                className={`w-full text-left px-3 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  item.active
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 font-semibold border-l-2 border-brand-600 dark:border-brand-400'
                    : item.highlight
                    ? 'text-brand-700 dark:text-brand-400 font-semibold hover:bg-brand-50 dark:hover:bg-brand-950/40'
                    : 'text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1c222e]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Theme switcher integrated naturally into mobile menu */}
          <div className="pt-1 border-t border-stone-100 dark:border-[#222936]">
            <ThemeToggle variant="mobile" />
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
};
