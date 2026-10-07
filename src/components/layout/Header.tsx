import React, { useState } from 'react';
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
  User,
  LogOut,
  LayoutDashboard,
  Store,
  Compass,
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

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0f131b]/95 backdrop-blur-md border-b border-stone-200 dark:border-[#222936] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-black tracking-tight text-stone-900 dark:text-white flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-lg"
              aria-label="CampusMart Home"
            >
              <span className="w-8 h-8 rounded-lg bg-stone-900 dark:bg-amber-400 text-amber-400 dark:text-stone-950 flex items-center justify-center text-lg font-black shadow-sm transition-colors">
                C
              </span>
              <span>CampusMart</span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
            <button
              onClick={() => onNavigate('home')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                currentView === 'home' ? 'text-stone-900 dark:text-white font-semibold' : ''
              }`}
            >
              Marketplace
            </button>
            <button
              onClick={() => onNavigate('stores')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                currentView === 'stores' ? 'text-stone-900 dark:text-white font-semibold' : ''
              }`}
            >
              Student Stores
            </button>
            <button
              onClick={() => onNavigate('blog')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                currentView === 'blog' ? 'text-stone-900 dark:text-white font-semibold' : ''
              }`}
            >
              Campus Stories
            </button>
            <button
              onClick={() => {
                if (currentRole === 'seller') {
                  onNavigate('seller-dashboard', 'products');
                } else {
                  onNavigate('become-seller');
                }
              }}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap text-stone-700 dark:text-stone-300 font-medium"
            >
              {currentRole === 'seller' ? 'My Store' : 'Sell on Campus'}
            </button>
          </nav>

          {/* Search Bar (Mid/Action area) */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, textbooks, dorm gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-100 dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 focus:bg-white dark:focus:bg-[#1a202c] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Zone 3: Actions & User controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme Toggle Button */}
            <ThemeToggle variant="icon" />

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('customer-dashboard', 'wishlist')}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors relative"
              title="Saved Items"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Messages Button */}
            {currentUser && (
              <button
                onClick={onOpenMessages}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors relative"
                title="Student Messages"
                aria-label="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}

            {/* Notifications Button */}
            {currentUser && (
              <button
                onClick={onOpenNotifications}
                className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors relative"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 font-bold rounded-lg text-xs shadow-sm transition-all whitespace-nowrap ml-1"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="bg-amber-400 text-stone-950 dark:bg-stone-900 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded text-[11px]">
                {cartCount}
              </span>
            </button>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                  aria-label="User Account Menu"
                >
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                    referrerPolicy="no-referrer"
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#171d27] border border-stone-200 dark:border-[#262e3d] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setUserMenuOpen(false)}
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
                        <span>·</span>
                        <span className="truncate">{currentUser.student_id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate(`${currentRole}-dashboard`)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#1f2735] flex items-center gap-2 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                      {getDashboardLabel()}
                    </button>

                    {currentRole === 'customer' && (
                      <button
                        onClick={() => onNavigate('become-seller')}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#232015] flex items-center gap-2 transition-colors"
                      >
                        <Store className="w-4 h-4 text-amber-500" />
                        Open a Student Store
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate('customer-dashboard', 'orders')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-[#1f2735] flex items-center gap-2 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                      My Orders
                    </button>

                    <div className="border-t border-stone-100 dark:border-[#222936] my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors whitespace-nowrap ml-1"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-[#1c222e] transition-colors ml-1"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-[#222936] bg-white dark:bg-[#0f131b] px-4 pt-2 pb-4 space-y-2">
          <div className="pt-2 pb-2">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-100 dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white"
          >
            Marketplace
          </button>
          <button
            onClick={() => {
              onNavigate('stores');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white"
          >
            Student Stores
          </button>
          <button
            onClick={() => {
              onNavigate('blog');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-medium text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white"
          >
            Campus Stories
          </button>
          <button
            onClick={() => {
              onNavigate(currentRole === 'seller' ? 'seller-dashboard' : 'become-seller');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm font-medium text-amber-700 dark:text-amber-400"
          >
            {currentRole === 'seller' ? 'Seller Studio' : 'Open a Store'}
          </button>

          {/* Theme switcher integrated naturally into mobile menu */}
          <ThemeToggle variant="mobile" />
        </div>
      )}
    </header>
  );
};
