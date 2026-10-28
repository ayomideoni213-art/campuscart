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
  Share2,
  Check,
  Phone,
  Building,
  ExternalLink
} from 'lucide-react';
import { normalizeWhatsAppUrl, normalizeInstagramUrl, getInstagramHandle } from '../../lib/formatters';

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
  const [copiedLink, setCopiedLink] = useState(false);

  // Find store by id or slug
  const store = stores.find((s) => s.id === storeId || s.slug === storeId);

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">Store Not Found</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-2">The requested student store does not exist.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950 font-bold rounded-lg text-xs cursor-pointer"
        >
          Return to Home
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

  // WhatsApp click-to-chat url
  const whatsAppUrl = store.whatsapp_url ? normalizeWhatsAppUrl(store.whatsapp_url) : '';
  const instagramUrl = store.instagram_url
    ? normalizeInstagramUrl(store.instagram_url)
    : store.instagram_handle
    ? normalizeInstagramUrl(store.instagram_handle)
    : '';

  // Share profile handler with native share + clipboard fallback
  const handleShareProfile = async () => {
    const shareUrl = window.location.origin ? `${window.location.origin}/#store-${store.slug || store.id}` : window.location.href;
    const shareData = {
      title: `${store.name} on CampusMart`,
      text: `Check out ${store.name} on CampusMart! ${store.tagline || ''}`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or share not supported, proceed to clipboard copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      // Fallback
      alert(`Store Profile Link: ${shareUrl}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Brand Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-[#262e3d] bg-stone-900 shadow-sm">
        <div className="h-48 sm:h-64 w-full overflow-hidden bg-stone-800">
          <img
            src={store.banner_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'}
            alt={store.name}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Store Profile Info Overlay */}
        <div className="bg-white dark:bg-[#151921] px-6 py-6 border-t border-stone-200 dark:border-[#262e3d]">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={store.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                  alt={store.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-[#151921] shadow-md bg-white dark:bg-[#151921]"
                  referrerPolicy="no-referrer"
                />
                {store.profile_thumbnail && (
                  <img
                    src={store.profile_thumbnail}
                    alt="Seller thumbnail"
                    title="Student Store Owner"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#151921] shadow-sm absolute -bottom-1 -right-1"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white">{store.name}</h1>
                  {store.verified_student && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Verified Student Brand
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">{store.tagline}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 pt-1">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    {store.campus_location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{store.rating.toFixed(1)}</span>
                    <span className="text-stone-400 dark:text-stone-500">({store.reviews_count} reviews)</span>
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{store.total_sales} orders</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Message, WhatsApp, Instagram, Share */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              {/* Internal Message */}
              <button
                onClick={() => onOpenMessage(store.seller_id, store.id)}
                className="px-3.5 py-2 bg-brand-600 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>

              {/* WhatsApp Click-to-Chat Button */}
              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  title="Contact via WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Instagram Button */}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-stone-300 dark:border-[#2a3445] rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1c222e] transition-colors"
                  title={getInstagramHandle(store.instagram_url || store.instagram_handle || '')}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {/* Share Profile Button */}
              <button
                onClick={handleShareProfile}
                className="px-3 py-2 border border-stone-300 dark:border-[#2a3445] rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#1c222e] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Share Store Profile"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Description & Campuses Served & Campus Pickup Hub */}
          <div className="mt-6 pt-6 border-t border-stone-100 dark:border-[#262e3d] grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600 dark:text-stone-300">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">
                  Brand Story & Mission
                </h4>
                <p className="leading-relaxed whitespace-pre-line text-stone-700 dark:text-stone-300">
                  {store.description}
                </p>
              </div>

              {/* Campuses Served Section */}
              {store.campuses_served && store.campuses_served.length > 0 && (
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    <span>Universities Served in Ekiti State</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {store.campuses_served.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 border border-brand-200 dark:border-brand-800/40 rounded-lg text-xs font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 dark:bg-[#1c222e] rounded-xl border border-stone-200/80 dark:border-[#262e3d] space-y-2.5 self-start">
              <h4 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Primary Pickup Point</span>
              </h4>
              <p className="text-stone-800 dark:text-stone-200 font-semibold">{store.pickup_point}</p>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-[#262e3d]">
                Active since {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-[#262e3d] pb-4">
          <div>
            <h2 className="text-lg font-black text-stone-900 dark:text-white">Products by {store.name}</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Showing {filteredProducts.length} items available on campus
            </p>
          </div>

          {/* Store Categories Filter */}
          {uniqueCategories.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950'
                    : 'bg-stone-100 dark:bg-[#1c222e] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#252c3b]'
                }`}
              >
                All Items ({storeProducts.length})
              </button>
              {uniqueCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-brand-600 dark:bg-brand-400 text-white dark:text-stone-950'
                      : 'bg-stone-100 dark:bg-[#1c222e] text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#252c3b]'
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
          <div className="py-12 text-center text-xs text-stone-500 dark:text-stone-400 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d]">
            No products currently listed in this category.
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
        <div className="pt-8 border-t border-stone-200 dark:border-[#262e3d] space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Student Reviews for {store.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.user_avatar}
                      alt={rev.user_name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">{rev.user_name}</p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500">{rev.product_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? 'fill-brand-400 text-brand-400' : 'text-stone-200 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
