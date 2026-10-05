import React, { useState } from 'react';
import { Store, Product } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ProductCard } from '../product/ProductCard';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Package,
  ShoppingBag,
  MessageSquare,
  Instagram,
  ArrowLeft,
  Share2
} from 'lucide-react';

interface StorefrontViewProps {
  storeId: string;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenMessage: (sellerId: string, storeId: string) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  storeId,
  onBack,
  onSelectProduct,
  onOpenMessage
}) => {
  const { stores, products, reviews } = useMarketplace();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const store = stores.find((s) => s.id === storeId);

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900">Store Not Found</h2>
        <p className="text-xs text-stone-500 mt-2">The requested student store does not exist.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  const storeProducts = products.filter(
    (p) => p.store_id === store.id && p.status === 'published'
  );

  const storeReviews = reviews.filter((r) => r.store_id === store.id);

  const filteredProducts =
    activeCategory === 'all'
      ? storeProducts
      : storeProducts.filter((p) => p.category_id === activeCategory);

  const uniqueCategories = Array.from(
    new Set(storeProducts.map((p) => JSON.stringify({ id: p.category_id, name: p.category_name })))
  ).map((str) => JSON.parse(str));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </button>

      {/* Brand Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900">
        <div className="h-48 sm:h-64 w-full overflow-hidden">
          <img
            src={store.banner_url}
            alt={store.name}
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Store Profile Info Overlay */}
        <div className="bg-white px-6 py-6 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900">{store.name}</h1>
                  {store.verified_student && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Student Brand
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 font-medium">{store.tagline}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {store.campus_location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-stone-800">{store.rating.toFixed(1)}</span>
                    <span>({store.reviews_count} reviews)</span>
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{store.total_sales} total orders</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                onClick={() => onOpenMessage(store.seller_id, store.id)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message Seller</span>
              </button>

              {store.instagram_handle && (
                <a
                  href={`https://instagram.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 border border-stone-300 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors"
                  title={store.instagram_handle}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Description & Campus Pickup Hub */}
          <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                Brand Story & Mission
              </h4>
              <p className="leading-relaxed whitespace-pre-line">{store.description}</p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Standard Pickup Location</span>
              </h4>
              <p className="text-stone-700 font-medium">{store.pickup_point}</p>
              <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                Operating since {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-lg font-black text-stone-900">Available Products</h2>
            <p className="text-xs text-stone-500">
              Showing {filteredProducts.length} items curated by {store.name}
            </p>
          </div>

          {/* Store Categories Filter */}
          {uniqueCategories.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Items ({storeProducts.length})
              </button>
              {uniqueCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    activeCategory === c.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-500">
            No products found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews for this Store */}
      {storeReviews.length > 0 && (
        <div className="pt-8 border-t border-stone-200 space-y-4">
          <h3 className="text-base font-bold text-stone-900">Student Reviews for {store.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.user_avatar}
                      alt={rev.user_name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900">{rev.user_name}</p>
                      <p className="text-[10px] text-stone-400">{rev.product_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
