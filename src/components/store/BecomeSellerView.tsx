import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { CAMPUS_OPTIONS } from '../../services/storage';
import {
  Store,
  Sparkles,
  ShieldCheck,
  Truck,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Building
} from 'lucide-react';

interface BecomeSellerViewProps {
  onSuccess: () => void;
  onOpenAuth: () => void;
}

export const BecomeSellerView: React.FC<BecomeSellerViewProps> = ({ onSuccess, onOpenAuth }) => {
  const { currentUser, switchUserRole, updateProfile } = useAuth();
  const { createStore } = useMarketplace();

  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [pickupPoint, setPickupPoint] = useState('Student Union Ground Floor Atrium');
  const [campusLocation, setCampusLocation] = useState(
    currentUser?.campus_name || CAMPUS_OPTIONS[0].name
  );
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=300&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Create store
      const newStore = createStore({
        seller_id: currentUser.id,
        name: storeName.trim(),
        slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: tagline.trim(),
        description: description.trim(),
        logo_url: logoUrl,
        banner_url:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        campus_location: campusLocation,
        pickup_point: pickupPoint.trim(),
        status: 'active',
        verified_student: true
      });

      // 2. Promote current user to seller role
      updateProfile({ role: 'seller' });
      switchUserRole('seller');

      setIsSubmitting(false);
      onSuccess();
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Pitch */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Campus Entrepreneurship Program
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
          Launch Your Student Store on Campus
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Turn your skills, crafts, thrift curation, or baking passion into a recognized campus business. Zero setup fees, zero shipping logistics.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            0%
          </div>
          <h4 className="font-bold text-stone-900 dark:text-white text-sm">No Commission Fees</h4>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            Keep 100% of your earnings. CampusMart is built by students to foster undergraduate innovation.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-stone-900 dark:text-white text-sm">Campus Quad Handoffs</h4>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            No packing slips or postage queues. Deliver directly to classmates between lecture periods.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-stone-900 dark:text-white text-sm">Verified Student Trust</h4>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            Buyers know you are an active classmate. Build real campus brand recognition and customer loyalty.
          </p>
        </div>
      </div>

      {/* Store Creation Form */}
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-6 sm:p-8 shadow-xs max-w-2xl mx-auto text-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Set Up Your Store Identity</h3>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Choose a memorable brand name and designate your preferred pickup spot.
          </p>
        </div>

        <form onSubmit={handleCreateStore} className="space-y-4">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Store / Brand Name</label>
            <input
              type="text"
              placeholder="e.g. Quad Threads & Thrift, Dorm Bites Bakery"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Short Tagline</label>
            <input
              type="text"
              placeholder="e.g. Sustainable reworked college streetwear"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Campus Location</label>
            <select
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {CAMPUS_OPTIONS.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Designated Pickup Hub / Meeting Spot</label>
            <input
              type="text"
              placeholder="e.g. Student Union Lobby Table 4, Library Courtyard"
              value={pickupPoint}
              onChange={(e) => setPickupPoint(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Store Story & Mission</label>
            <textarea
              rows={3}
              placeholder="Tell fellow students what makes your products special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>{isSubmitting ? 'Provisioning Store...' : 'Launch Student Storefront'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
