import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Store as StoreIcon, ShieldCheck, Star, MapPin, ArrowRight, Building2 } from 'lucide-react';

interface StoresDirectoryProps {
  onSelectStore: (storeId: string) => void;
  onOpenCreateStore: () => void;
}

export const StoresDirectory: React.FC<StoresDirectoryProps> = ({
  onSelectStore,
  onOpenCreateStore
}) => {
  const { stores } = useMarketplace();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-[#262e3d] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Campus Brands & Student Ventures
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
            Student Store Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
            Discover student-founded businesses across Ekiti universities—from tech hubs and bakery treats to curated thrift and campus gear.
          </p>
        </div>

        <button
          onClick={onOpenCreateStore}
          className="px-4 py-2 bg-brand-600 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          Open Your Store
        </button>
      </div>

      {/* Stores Grid / Empty State */}
      {stores.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-8 space-y-4 max-w-md mx-auto">
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center mx-auto">
            <StoreIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-white">No stores yet</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Be the first student to create a store on CampusMart.
            </p>
          </div>
          <button
            onClick={onOpenCreateStore}
            className="px-5 py-2.5 bg-brand-600 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Start Selling
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              onClick={() => onSelectStore(store.id)}
              className="group cursor-pointer bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] overflow-hidden hover:shadow-md dark:hover:border-brand-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Cover Banner */}
                <div className="h-32 w-full bg-stone-100 dark:bg-[#1c222e] overflow-hidden relative">
                  <img
                    src={store.banner_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Logo & Info */}
                <div className="p-5 pt-0 relative space-y-3">
                  <div className="flex items-end justify-between -mt-8 mb-2">
                    <img
                      src={store.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                      alt={store.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white dark:border-[#151921] shadow-xs bg-white dark:bg-[#151921]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 font-semibold">
                      {store.total_sales} campus orders
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-stone-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                        {store.name}
                      </h3>
                      {store.verified_student && (
                        <span title="Verified Student Founder" className="inline-flex shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-stone-700 dark:text-stone-300 mt-0.5">{store.tagline}</p>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>

                  {/* Campuses served chips */}
                  {store.campuses_served && store.campuses_served.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">Delivers to:</span>
                      {store.campuses_served.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-stone-100 dark:bg-[#1d2432] text-stone-700 dark:text-stone-300 rounded text-[10px] font-medium"
                        >
                          {c.replace(/ \([^)]*\)/, '')}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-[#262e3d]">
                    <div className="flex items-center gap-1 text-brand-700 dark:text-brand-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-brand-400 text-brand-400" />
                      <span>{store.rating.toFixed(1)}</span>
                      <span className="text-stone-400 dark:text-stone-500 font-normal">({store.reviews_count})</span>
                    </div>
                    <span>·</span>
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                      <span className="truncate">{store.campus_location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-stone-50 dark:bg-[#11141b] border-t border-stone-100 dark:border-[#262e3d] flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 font-semibold group-hover:bg-brand-50/50 dark:group-hover:bg-[#1c222e] transition-colors">
                <span>View Store Catalog & Handoff Info</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
