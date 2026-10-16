import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { OrderStatus } from '../../types';
import { EKITI_CAMPUSES } from '../../data/campuses';
import { formatNaira } from '../../lib/formatters';
import {
  Package,
  Heart,
  Star,
  Settings,
  ShoppingBag,
  Truck,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CustomerDashboardProps {
  initialTab?: string;
  onSelectProduct: (productId: string) => void;
  onOpenStore: (storeId: string) => void;
  onBecomeSeller?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = 'orders',
  onSelectProduct,
  onOpenStore,
  onBecomeSeller
}) => {
  const { currentUser, updateProfile } = useAuth();
  const { wishlist, moveToCartFromWishlist } = useCart();
  const { orders, products, reviews } = useMarketplace();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Settings form
  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [campusName, setCampusName] = useState(currentUser?.campus_name || EKITI_CAMPUSES[0].name);
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!currentUser) return null;

  // Filter orders for this customer
  const customerOrders = orders.filter((o) => o.customer_id === currentUser.id);
  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total_amount, 0);

  // Wishlist products
  const wishlistedProducts = products.filter((p) =>
    wishlist.some((w) => w.product_id === p.id)
  );

  // User reviews
  const userReviews = reviews.filter((r) => r.user_id === currentUser.id);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: name, phone, bio, campus_name: campusName });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40">Delivered</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-transparent dark:border-blue-800/40">In Transit</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800/40">Preparing</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-stone-100 dark:bg-[#1a2230] text-stone-700 dark:text-stone-300 capitalize">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Student Identity */}
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={currentUser.full_name}
            className="w-16 h-16 rounded-2xl object-cover border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-[#1c222e]"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">{currentUser.full_name}</h1>
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded border border-transparent dark:border-emerald-800/40">
                Verified Student
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {currentUser.student_id} · {currentUser.campus_name}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="p-3 bg-stone-50 dark:bg-[#181e2a] rounded-xl border border-stone-200 dark:border-[#262e3d] text-center min-w-[80px]">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Orders</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white font-mono">{customerOrders.length}</p>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-[#181e2a] rounded-xl border border-stone-200 dark:border-[#262e3d] text-center min-w-[80px]">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Saved Items</p>
            <p className="text-sm font-bold text-stone-900 dark:text-white font-mono">{wishlist.length}</p>
          </div>
          <div className="p-3 bg-stone-50 dark:bg-[#181e2a] rounded-xl border border-stone-200 dark:border-[#262e3d] text-center min-w-[90px]">
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Total Spent</p>
            <p className="text-sm font-bold text-stone-900 dark:text-amber-400 font-mono">
              {formatNaira(totalSpent)}
            </p>
          </div>
        </div>
      </div>

      {/* "Start Selling" / "Open a Store" pathway for shoppers */}
      {currentUser.role === 'customer' && onBecomeSeller && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/30 dark:border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Turn your passion into a campus brand
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                You can start selling to students across Ekiti universities without creating a new account.
              </p>
            </div>
          </div>
          <button
            onClick={onBecomeSeller}
            className="px-4 py-2 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>Start Selling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 dark:border-[#222936] text-xs font-semibold gap-2 overflow-x-auto">
        {[
          { id: 'orders', label: `My Orders (${customerOrders.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'wishlist', label: `Saved Wishlist (${wishlist.length})`, icon: <Heart className="w-4 h-4" /> },
          { id: 'reviews', label: `Reviews Written (${userReviews.length})`, icon: <Star className="w-4 h-4" /> },
          { id: 'settings', label: 'Account & Preferences', icon: <Settings className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-3 transition-colors flex items-center gap-1.5 whitespace-nowrap border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-stone-900 text-stone-900 dark:border-amber-400 dark:text-amber-400 font-bold'
                : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] text-xs text-stone-500 dark:text-stone-400">
              No orders placed yet. Support a fellow student entrepreneur in Ekiti!
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] overflow-hidden text-xs shadow-2xs transition-colors"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-stone-50 dark:bg-[#11151c] border-b border-stone-200 dark:border-[#222936] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 dark:text-white font-mono">{ord.order_number}</span>
                    <span className="text-stone-400 dark:text-stone-600">·</span>
                    <span className="text-stone-500 dark:text-stone-400">
                      {new Date(ord.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ord.order_status)}
                    <span className="font-bold font-mono text-stone-900 dark:text-amber-400">
                      {formatNaira(ord.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 divide-y divide-stone-100 dark:divide-[#222936]">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 dark:bg-[#1c222e]"
                        />
                        <div>
                          <p className="font-semibold text-stone-900 dark:text-stone-100">{item.product_name}</p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            Store: <span className="font-medium text-stone-700 dark:text-stone-300">{item.store_name}</span> · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                        {formatNaira(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery Information Footer */}
                <div className="p-3 bg-stone-50/70 dark:bg-[#11151c]/70 border-t border-stone-100 dark:border-[#222936] flex flex-wrap items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-stone-400" />
                    <span>Handoff: {ord.delivery_info.campus} ({ord.delivery_info.location_detail})</span>
                  </div>
                  <div>
                    Payment: <span className="font-medium text-stone-700 dark:text-stone-300 uppercase">{ord.payment_method.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] text-xs text-stone-500 dark:text-stone-400">
              No saved items in your wishlist yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {wishlistedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p.id)}
                  className="p-3 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] flex gap-3 cursor-pointer hover:shadow-xs transition-shadow"
                >
                  <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="font-semibold text-xs text-stone-900 dark:text-white truncate">{p.name}</h4>
                    <p className="text-[11px] font-mono font-bold text-stone-900 dark:text-amber-400">
                      {formatNaira(p.discount_price ?? p.price)}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">{p.campus_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {userReviews.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] text-xs text-stone-500 dark:text-stone-400">
              You haven't written any reviews yet.
            </div>
          ) : (
            userReviews.map((r) => (
              <div key={r.id} className="p-4 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-900 dark:text-white">{r.product_name}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-stone-600 dark:text-stone-300">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Account & Preferences */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] p-6 transition-colors">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-4">Edit Profile & Campus Details</h3>

            {savedNotice && (
              <div className="mb-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Campus</label>
                <select
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 cursor-pointer"
                >
                  {EKITI_CAMPUSES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Mobile Phone (For Handoff Texts)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 08012345678 or +234..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Student Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell campus peers about your studies and interests..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
