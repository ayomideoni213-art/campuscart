import React from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag, Star, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onSelectStore?: (storeId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onSelectStore }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] hover:border-stone-300 dark:hover:border-[#384358] overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Image Container with Fallback */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-4/3 w-full bg-stone-100 dark:bg-[#1c222e] overflow-hidden cursor-pointer"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Styled fallback container if image fails
            const target = e.target as HTMLElement;
            target.style.display = 'none';
          }}
        />

        {/* Fallback pattern behind if image hidden */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center bg-stone-100 dark:bg-[#1c222e] text-stone-400 dark:text-stone-500 text-xs">
          {product.category_name}
        </div>

        {/* Stock / Condition tag (quiet, max 1) */}
        {isOutOfStock ? (
          <div className="absolute top-2.5 left-2.5 bg-stone-900/90 dark:bg-stone-950/90 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
            Out of Stock
          </div>
        ) : product.discount_price ? (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            Sale
          </div>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-[#151921]/90 backdrop-blur-sm text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 shadow-xs transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${
              wishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-600 dark:text-stone-400'
            }`}
          />
        </button>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4">
        {/* Unboxed Metadata with Typographic Separator */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
          <span className="truncate">{product.category_name}</span>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
          <span className="shrink-0">{product.condition}</span>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onSelect(product)}
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors"
        >
          {product.name}
        </h3>

        {/* Student Store Link */}
        <div className="mt-1 flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectStore) onSelectStore(product.store_id);
            }}
            className="hover:underline truncate text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-medium"
          >
            {product.store_name}
          </button>
          <span title="Verified Campus Student Store" className="inline-flex shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </span>
        </div>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-stone-800 dark:text-stone-200">{product.rating.toFixed(1)}</span>
          <span className="text-stone-400 dark:text-stone-500">({product.reviews_count})</span>
          <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{product.campus_name.split(' ')[0]}</span>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#222936] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-stone-900 dark:text-stone-100 font-mono tabular-nums">
              ${(product.discount_price ?? product.price).toFixed(2)}
            </span>
            {product.discount_price && (
              <span className="text-xs text-stone-400 dark:text-stone-500 line-through font-mono tabular-nums">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isOutOfStock
                ? 'bg-stone-100 dark:bg-[#1c222e] text-stone-400 dark:text-stone-500 cursor-not-allowed'
                : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 font-bold shadow-xs'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
