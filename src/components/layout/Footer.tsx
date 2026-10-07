import React from 'react';
import { ShieldCheck, Truck, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { currentRole } = useAuth();

  return (
    <footer className="bg-stone-900 dark:bg-[#080a0e] text-stone-400 text-xs border-t border-stone-800 dark:border-[#1a202c] mt-20 transition-colors">
      {/* Value Pillars */}
      <div className="border-b border-stone-800 dark:border-[#1a202c] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-800 dark:bg-[#151a24] text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Verified Student Marketplace</h4>
              <p className="mt-1 text-stone-400 leading-relaxed text-xs">
                Every seller is an active student with a verified .edu email and campus identification.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-800 dark:bg-[#151a24] text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Zero Shipping Fees</h4>
              <p className="mt-1 text-stone-400 leading-relaxed text-xs">
                Meet safely at designated Campus Hubs (Student Union, Quad tables, or dorm lounges).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-800 dark:bg-[#151a24] text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Student Entrepreneurship</h4>
              <p className="mt-1 text-stone-400 leading-relaxed text-xs">
                Build your own brand, test real products, and launch your undergraduate business.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <span className="text-sm font-bold text-white tracking-tight">CampusMart</span>
          <p className="mt-3 text-stone-400 leading-relaxed">
            Your Campus. Your Marketplace. Buy from peers, sell what you build, and grow student businesses.
          </p>
          <div className="mt-4 text-[11px] text-stone-500">
            Current Term: Fall 2026 Academic Year
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider">Marketplace</h5>
          <ul className="mt-3 space-y-2">
            <li>
              <button onClick={() => onNavigate('home')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                All Products
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('stores')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                Student Brand Directory
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('blog')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                Campus Stories & Articles
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('become-seller')} className="hover:text-amber-400 transition-colors">
                Open a Student Store
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider">Dashboards</h5>
          <ul className="mt-3 space-y-2">
            <li>
              <button onClick={() => onNavigate('customer-dashboard')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                Student Buyer Portal
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('seller-dashboard')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                Seller & Inventory Studio
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('editor-dashboard')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                Moderator & Editor Center
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('author-dashboard')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                Author Content Studio
              </button>
            </li>
            {currentRole === 'admin' && (
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white dark:hover:text-amber-400 transition-colors">
                  Platform Administrator
                </button>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider">Campus Safety</h5>
          <p className="mt-3 text-stone-400 leading-relaxed">
            Meet in well-lit campus zones. Verify item conditions before completing cash-on-pickup exchanges.
          </p>
          <div className="mt-4 pt-3 border-t border-stone-800 dark:border-[#1a202c] text-[11px] text-stone-500">
            Emergency Security Liaison: <span className="text-stone-300">security@campus.edu</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-stone-800 dark:border-[#1a202c] py-6 text-center text-stone-500 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 CampusMart. Built for undergraduate student entrepreneurs.</span>
          <span className="flex items-center gap-1">
            Student-founded with <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" /> on campus
          </span>
        </div>
      </div>
    </footer>
  );
};
