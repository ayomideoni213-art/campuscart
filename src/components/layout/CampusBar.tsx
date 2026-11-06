import React from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EKITI_CAMPUSES } from '../../data/campuses';

/**
 * Always-visible campus context for browsing. Changing it only re-filters the current page,
 * so shoppers keep their place (scroll position, search text, filters).
 */
export const CampusBar: React.FC = () => {
  const { selectedCampus, setSelectedCampus } = useAuth();

  return (
    <div className="bg-white dark:bg-[#0f131b] border-b border-stone-200 dark:border-[#222936]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2 text-xs">
        <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" aria-hidden="true" />
        <label htmlFor="campus-bar-select" className="font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
          Shopping on
        </label>
        <select
          id="campus-bar-select"
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          className="min-w-0 flex-1 sm:flex-none sm:w-80 py-1.5 px-2 bg-stone-50 dark:bg-[#151921] border border-stone-300 dark:border-[#2b3545] rounded-lg text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          <option value="All">All Ekiti campuses</option>
          {EKITI_CAMPUSES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="hidden md:inline text-stone-500 dark:text-stone-400">
          {selectedCampus === 'All'
            ? 'Showing listings from every campus'
            : 'Showing items you can collect on this campus'}
        </span>
      </div>
    </div>
  );
};
