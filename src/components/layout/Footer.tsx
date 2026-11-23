import React from 'react';
import { ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();

  const linkClass =
    'inline-block py-1 text-stone-300 hover:text-white dark:hover:text-brand-400 transition-colors cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400';

  return (
    <footer className="bg-brand-950 dark:bg-[#080a0e] text-stone-200 text-xs border-t border-brand-900 dark:border-[#1a202c] mt-20 transition-colors">
      <h2 className="sr-only">CampusMart Footer</h2>

      {/* Value Pillars */}
      <div className="border-b border-brand-900/80 dark:border-[#1a202c] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-900/70 dark:bg-[#151a24] text-brand-400 shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Verified Student Marketplace</h3>
              <p className="mt-1 text-stone-300 leading-relaxed text-xs">
                Built for Ekiti State university students with verified student profiles and campus identity.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-900/70 dark:bg-[#151a24] text-brand-400 shrink-0">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Zero Shipping Fees</h3>
              <p className="mt-1 text-stone-300 leading-relaxed text-xs">
                Meet safely at familiar campus spots — faculty buildings, student centres, or hostel gates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brand-900/70 dark:bg-[#151a24] text-brand-400 shrink-0">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Student Entrepreneurship</h3>
              <p className="mt-1 text-stone-300 leading-relaxed text-xs">
                Build your own campus brand, list items in ₦, and grow your undergraduate business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <span className="text-sm font-bold text-white tracking-tight">CampusMart</span>
          <p className="mt-3 text-stone-300 leading-relaxed">
            Your Campus. Your Marketplace. Buy from peers, sell what you create, and support student businesses.
          </p>
          <div className="mt-4 text-[11px] text-stone-300">
            Serving EKSU, FUOYE, ABUAD, BOUESTI &amp; Venite University
          </div>
        </div>

        <nav aria-label="Marketplace links">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Marketplace</h3>
          <ul className="mt-3 space-y-1.5">
            <li>
              <button type="button" onClick={() => onNavigate('home')} className={linkClass}>
                All Products
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('stores')} className={linkClass}>
                Student Stores
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('blog')} className={linkClass}>
                Campus Stories
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate(currentRole === 'seller' ? 'seller-dashboard' : 'become-seller')}
                className="inline-block py-1 text-brand-300 hover:text-brand-200 font-medium transition-colors cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {currentRole === 'seller' ? 'My Store Dashboard' : 'Sell on Campus'}
              </button>
            </li>
          </ul>
        </nav>

        <nav aria-label="Account links">
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Your Account</h3>
          <ul className="mt-3 space-y-1.5">
            <li>
              <button type="button" onClick={() => onNavigate('customer-dashboard')} className={linkClass}>
                Buyer Portal &amp; Orders
              </button>
            </li>
            {currentRole === 'seller' && (
              <li>
                <button type="button" onClick={() => onNavigate('seller-dashboard')} className={linkClass}>
                  Seller &amp; Inventory Studio
                </button>
              </li>
            )}
            {currentRole === 'editor' && (
              <li>
                <button type="button" onClick={() => onNavigate('editor-dashboard')} className={linkClass}>
                  Moderator &amp; Editor Center
                </button>
              </li>
            )}
            {currentRole === 'author' && (
              <li>
                <button type="button" onClick={() => onNavigate('author-dashboard')} className={linkClass}>
                  Author Content Studio
                </button>
              </li>
            )}
            {currentRole === 'admin' && (
              <li>
                <button type="button" onClick={() => onNavigate('admin-dashboard')} className={linkClass}>
                  Platform Administrator
                </button>
              </li>
            )}
          </ul>
        </nav>

        <div>
          <h3 className="font-semibold text-white text-xs uppercase tracking-wider">Campus Safety</h3>
          <p className="mt-3 text-stone-300 leading-relaxed">
            Meet in open, well-lit campus zones and inspect your item before paying by cash or transfer at handoff.
          </p>
          <div className="mt-4 pt-3 border-t border-brand-900/80 dark:border-[#1a202c] text-[11px] text-stone-300">
            Student Support:{' '}
            <a
              href="mailto:support@campusmart.ng"
              className="text-white underline hover:text-brand-300 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              support@campusmart.ng
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-brand-900/80 dark:border-[#1a202c] py-6 text-center text-stone-300 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} CampusMart. Built for student entrepreneurs.</span>
          <span className="flex items-center gap-1">
            Student-founded with <Heart className="w-3 h-3 text-rose-400 inline fill-rose-400" aria-hidden="true" /> on campus
          </span>
        </div>
      </div>
    </footer>
  );
};
