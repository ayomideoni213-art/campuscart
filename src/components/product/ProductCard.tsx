import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Heart, ShoppingBag, Star, ShieldCheck, MapPin, ImageOff } from 'lucide-react';
import { formatNaira } from '../../lib/formatters';
import {
  getAvailability,
  getServedCampuses,
  isPurchasable,
  isServedOnCampus,
  availabilityLabel,
  effectivePrice,
  shortCampus
} from '../../lib/shopping';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onSelectStore?: (storeId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onSelectStore }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { selectedCampus } = useAuth();
  const { stores } = useMarketplace();
  const [imageFailed, setImageFailed] = useState(false);

  const store = stores.find((s) => s.id === product.store_id);
  const wishlisted = isInWishlist(product.id);
  const availability = getAvailability(product);
  const purchasable = isPurchasable(product);
  const onSelectedCampus = isServedOnCampus(product, store, selectedCampus);
  const canAdd = purchasable && onSelectedCampus;
  const served = getServedCampuses(product, store).map(shortCampus);
  const image = product.images?.[0];
  const showImage = Boolean(image) && !imageFailed;

  const addLabel = !purchasable
    ? availability === 'out_of_stock'
      ? 'Sold out'
      : 'Unavailable'
    : !onSelectedCampus
    ? `Not on ${shortCampus(selectedCampus)}`
    : 'Add';

  return (
    <article
      aria-label={product.name}
      className="group relative flex flex-col bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] hover:border-stone-300 dark:hover:border-[#384358] overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <button
        type="button"
        onClick={() => onSelect(product)}
        aria-label={`View details for ${product.name}`}
        className="relative block aspect-4/3 w-full bg-stone-100 dark:bg-[#1c222e] overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        {showImage ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ${
              purchasable ? '' : 'opacity-60 grayscale'
            }`}
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-stone-400 dark:text-stone-500 text-xs">
            <ImageOff className="w-6 h-6" aria-hidden="true" />
            <span>{product.category_name}</span>
          </span>
        )}

        {/* One quiet status tag */}
        {availability === 'out_of_stock' || availability === 'unavailable' ? (
          <span className="absolute top-2.5 left-2.5 bg-stone-900/90 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
            {availability === 'out_of_stock' ? 'Out of stock' : 'Unavailable'}
          </span>
        ) : availability === 'low_stock' ? (
          <span className="absolute top-2.5 left-2.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            {availabilityLabel(product)}
          </span>
        ) : product.discount_price ? (
          <span className="absolute top-2.5 left-2.5 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            Sale
          </span>
        ) : null}
      </button>

      {/* Wishlist */}
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={wishlisted}
        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-[#151921]/90 backdrop-blur-sm text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        aria-label={wishlisted ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-600 dark:text-stone-400'}`} />
      </button>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1.5">
          <span className="truncate">{product.category_name}</span>
          <span className="shrink-0 font-medium text-stone-700 dark:text-stone-300">{product.condition}</span>
        </div>

        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 min-h-[2.5rem]">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="text-left hover:text-brand-700 dark:hover:text-brand-400 cursor-pointer transition-colors focus:outline-none focus-visible:underline"
          >
            {product.name}
          </button>
        </h3>

        {/* Seller */}
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400 min-w-0">
          <span className="shrink-0">Sold by</span>
          <button
            type="button"
            onClick={() => onSelectStore?.(product.store_id)}
            className="hover:underline truncate text-stone-800 dark:text-stone-200 font-medium cursor-pointer focus:outline-none focus-visible:underline"
          >
            {product.store_name}
          </button>
          {store?.verified_student && (
            <span title="Verified student store" className="inline-flex shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-label="Verified student store" />
            </span>
          )}
        </div>

        {/* Campus hand-off + availability */}
        <div className="mt-2 space-y-1 text-[11px]">
          <p className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span className="truncate">Hand-off: {served.join(', ')}</span>
          </p>
          <p className="flex items-center justify-between gap-2">
            <span
              className={`font-medium ${
                availability === 'available'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : availability === 'low_stock'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {availabilityLabel(product)}
            </span>
            <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
              <Star className="w-3 h-3 fill-brand-400 text-brand-400" aria-hidden="true" />
              {product.rating.toFixed(1)} ({product.reviews_count})
            </span>
          </p>
        </div>

        {/* Price & action */}
        <div className="mt-auto pt-3 border-t border-stone-100 dark:border-[#222936] flex items-center justify-between gap-2">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
              {formatNaira(effectivePrice(product))}
            </span>
            {product.discount_price != null && (
              <span className="text-xs text-stone-500 dark:text-stone-400 line-through font-mono tabular-nums">
                <span className="sr-only">Was </span>
                {formatNaira(product.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!canAdd}
            onClick={() => addToCart(product, 1)}
            aria-label={canAdd ? `Add ${product.name} to bag` : `${product.name}: ${addLabel}`}
            className={`flex items-center gap-1 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              canAdd
                ? 'bg-brand-600 hover:bg-brand-700 text-white dark:bg-brand-400 dark:hover:bg-brand-300 dark:text-stone-950 font-bold shadow-xs cursor-pointer'
                : 'bg-stone-100 dark:bg-[#1c222e] text-stone-500 dark:text-stone-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{addLabel}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
