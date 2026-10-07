import React from 'react';
import { Category, CampusOption } from '../../types';
import { CAMPUS_OPTIONS } from '../../services/storage';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  sortBy: string;
  onSelectSort: (sort: string) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  selectedCampus,
  onSelectCampus,
  sortBy,
  onSelectSort,
  maxPrice,
  onPriceChange,
  onResetFilters
}) => {
  const conditions = ['All', 'Brand New', 'Like New', 'Gently Used', 'Handmade / Custom'];

  return (
    <div className="bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] p-4 space-y-6 transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#222936]">
        <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Filter Products</span>
        </div>
        <button
          onClick={onResetFilters}
          className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs flex items-center gap-1 transition-colors"
          title="Reset Filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Campus Filter */}
      <div>
        <label className="block text-xs font-semibold text-stone-900 dark:text-stone-200 mb-2">Campus Hub</label>
        <select
          value={selectedCampus}
          onChange={(e) => onSelectCampus(e.target.value)}
          className="w-full text-xs bg-stone-50 dark:bg-[#1a202c] border border-stone-200 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
        >
          <option value="All">All University Campuses</option>
          {CAMPUS_OPTIONS.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category List */}
      <div>
        <label className="block text-xs font-semibold text-stone-900 dark:text-stone-200 mb-2">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c222e]'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white dark:bg-amber-400 dark:text-stone-950 font-bold shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1c222e]'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className={`text-[11px] ${selectedCategory === cat.id ? 'text-stone-300 dark:text-stone-900' : 'text-stone-400 dark:text-stone-500'}`}>
                {cat.product_count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Condition Segmented Selection */}
      <div>
        <label className="block text-xs font-semibold text-stone-900 dark:text-stone-200 mb-2">Item Condition</label>
        <div className="flex flex-col gap-1">
          {conditions.map((cond) => (
            <button
              key={cond}
              onClick={() => onSelectCondition(cond)}
              className={`text-left px-2.5 py-1 rounded text-xs transition-colors ${
                selectedCondition === cond
                  ? 'font-semibold text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-[#1c222e]'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Price Ceiling Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-200 mb-1">
          <span>Max Price</span>
          <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full accent-stone-900 dark:accent-amber-400 h-1.5 bg-stone-200 dark:bg-[#262e3d] rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 mt-1 font-mono">
          <span>$10</span>
          <span>$100</span>
          <span>$200+</span>
        </div>
      </div>

      {/* Sort By */}
      <div className="pt-2 border-t border-stone-100 dark:border-[#222936]">
        <label className="block text-xs font-semibold text-stone-900 dark:text-stone-200 mb-2">Sort By</label>
        <select
          value={sortBy}
          onChange={(e) => onSelectSort(e.target.value)}
          className="w-full text-xs bg-stone-50 dark:bg-[#1a202c] border border-stone-200 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
        >
          <option value="featured">Featured First</option>
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
};
