import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { EKITI_CAMPUSES, DEFAULT_CAMPUS, sanitizeCampus } from '../../data/campuses';
import { uploadBrandImage } from '../../services/imageStorage';
import { normalizeWhatsAppUrl, normalizeInstagramUrl } from '../../lib/formatters';
import {
  Store,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  Phone,
  Instagram,
  Building,
  Upload,
  AlertCircle
} from 'lucide-react';

interface BecomeSellerViewProps {
  onSuccess: () => void;
  onOpenAuth: () => void;
}

export const BecomeSellerView: React.FC<BecomeSellerViewProps> = ({ onSuccess, onOpenAuth }) => {
  const { currentUser, updateProfile } = useAuth();
  const { createStore, stores } = useMarketplace();
  const existingStore = currentUser ? stores.find((s) => s.seller_id === currentUser.id) : undefined;
  const ownCampus = sanitizeCampus(currentUser?.campus_name);

  const [storeName, setStoreName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [pickupPoint, setPickupPoint] = useState('Student Union Building (SUB) Forecourt');
  const [campusLocation, setCampusLocation] = useState(ownCampus);
  const [campusesServed, setCampusesServed] = useState<string[]>(
    currentUser?.campuses_served && currentUser.campuses_served.length > 0
      ? Array.from(new Set([ownCampus, ...currentUser.campuses_served]))
      : [ownCampus]
  );
  const [whatsAppUrl, setWhatsAppUrl] = useState(currentUser?.phone ? `https://wa.me/${currentUser.phone.replace(/[^0-9]/g, '')}` : '');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=300&q=80'
  );
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
  );
  const [uploading, setUploading] = useState<'logo' | 'banner' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagePick = async (file: File | undefined, target: 'logo' | 'banner') => {
    if (!file) return;
    setUploading(target);
    setUploadProgress(0);
    setUploadError(null);
    const res = await uploadBrandImage(file, target === 'logo' ? 'logos' : 'banners', currentUser?.id, setUploadProgress);
    setUploading(null);
    if (res.success && res.url) {
      if (target === 'logo') setLogoUrl(res.url);
      else setBannerUrl(res.url);
    } else {
      setUploadError(res.error || 'Image upload failed. Please try again.');
    }
  };

  const handleToggleServedCampus = (campus: string) => {
    setCampusesServed((prev) => {
      if (prev.includes(campus)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== campus);
      } else {
        return [...prev, campus];
      }
    });
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Create store
      const normalizedWA = whatsAppUrl ? normalizeWhatsAppUrl(whatsAppUrl) : '';
      const normalizedIG = instagramUrl ? normalizeInstagramUrl(instagramUrl) : '';

      createStore({
        seller_id: currentUser.id,
        name: storeName.trim(),
        slug: storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tagline: tagline.trim(),
        description: description.trim(),
        logo_url: logoUrl,
        banner_url: bannerUrl,
        profile_thumbnail: currentUser.avatar_url,
        campus_location: campusLocation,
        campuses_served: campusesServed,
        pickup_point: pickupPoint.trim(),
        status: 'active',
        whatsapp_url: normalizedWA,
        instagram_url: normalizedIG,
        verified_student: true
      });

      // 2. Promote the signed-in user to seller (stays the same account; never swaps to a demo user)
      updateProfile({
        role: 'seller',
        campus_name: campusLocation,
        campuses_served: campusesServed,
        signup_intent: 'sell'
      });

      setIsSubmitting(false);
      onSuccess();
    }, 800);
  };

  if (existingStore) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-3">
        <h1 className="text-2xl font-black text-stone-900 dark:text-white">You already have a store</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300">
          <strong>{existingStore.name}</strong> is live on CampusMart. Manage its profile, images and products from Seller Studio.
        </p>
        <button
          type="button"
          onClick={onSuccess}
          className="mt-2 px-5 py-2.5 bg-brand-600 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl font-bold text-sm cursor-pointer"
        >
          Open Seller Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Pitch */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Ekiti Universities Entrepreneurship Program
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight">
          Launch Your Student Store on Campus
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Turn your skills, crafts, thrift curation, baking passion, or tech gear into a recognized brand across Ekiti universities. Zero setup fees, zero shipping logistics.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-5 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            0%
          </div>
          <h4 className="font-bold text-stone-900 dark:text-white text-sm">Zero Platform Fees</h4>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            Keep 100% of your earnings. CampusMart is built by students to foster undergraduate innovation in Nigeria.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-stone-900 dark:text-white text-sm">Direct Campus Handoffs</h4>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            No interstate delivery fees or waybill delays. Deliver directly to classmates at designated university hubs.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#151921] border border-stone-200 dark:border-[#262e3d] rounded-2xl space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-stone-900 dark:text-white text-sm">Verified Student Trust</h4>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            Buyers know you are an active student. Build real brand recognition and customer loyalty across Ekiti.
          </p>
        </div>
      </div>

      {/* Store Creation Form */}
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-6 sm:p-8 shadow-xs max-w-2xl mx-auto text-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-white">Set Up Your Store Identity</h3>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Choose a memorable brand name, select the universities you sell to, and add your WhatsApp link.
          </p>
        </div>

        <form onSubmit={handleCreateStore} className="space-y-4">
          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Store / Brand Name</label>
            <input
              type="text"
              placeholder="e.g. Ay's Tech Hub, Oye Treats, Ekiti Thrift"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Short Tagline</label>
            <input
              type="text"
              placeholder="e.g. Quality student gadgets & fast chargers in Ekiti"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Primary Campus</label>
              <select
                value={campusLocation}
                onChange={(e) => {
                  setCampusLocation(e.target.value);
                  if (!campusesServed.includes(e.target.value)) {
                    setCampusesServed((prev) => [...prev, e.target.value]);
                  }
                }}
                className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-400 cursor-pointer"
              >
                {EKITI_CAMPUSES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Designated Pickup Point</label>
              <input
                type="text"
                placeholder="e.g. SUB Walkway, Main Library Gate"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
                required
                className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          {/* Campuses I sell to */}
          <div className="p-3 bg-stone-50 dark:bg-[#181e28] rounded-xl border border-stone-200 dark:border-[#262e3d] space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800 dark:text-stone-200">
                Campuses I sell to
              </label>
              <button
                type="button"
                onClick={() => setCampusesServed(EKITI_CAMPUSES.map((c) => c.name))}
                className="text-brand-700 dark:text-brand-400 hover:underline font-semibold text-[11px]"
              >
                Select All (5)
              </button>
            </div>
            <div className="space-y-1.5 pt-1">
              {EKITI_CAMPUSES.map((c) => {
                const isSelected = campusesServed.includes(c.name);
                return (
                  <label
                    key={c.id}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-[#202838] border-brand-400 dark:border-brand-500 font-medium text-stone-900 dark:text-white'
                        : 'bg-stone-50/50 dark:bg-[#131720] border-stone-200 dark:border-[#262e3d] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleServedCampus(c.name)}
                      className="mt-0.5 accent-brand-500"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold">{c.name}</span>
                      <span className="block text-[10px] text-stone-400">{c.location}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">WhatsApp Link</label>
              <input
                type="text"
                placeholder="https://wa.me/234... or 080..."
                value={whatsAppUrl}
                onChange={(e) => setWhatsAppUrl(e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Instagram Link</label>
              <input
                type="text"
                placeholder="https://instagram.com/... or @handle"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Store Story & Mission</label>
            <textarea
              rows={3}
              placeholder="Tell fellow students what makes your products special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2.5 bg-stone-50 dark:bg-[#1c222e] border border-stone-300 dark:border-[#2a3445] rounded-lg text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-brand-400"
            />
          </div>

          {/* Brand images (optional - can be changed later from Seller Studio) */}
          <div className="p-3 bg-stone-50 dark:bg-[#181e28] rounded-xl border border-stone-200 dark:border-[#262e3d] space-y-3">
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              Brand images <span className="font-normal text-stone-500 dark:text-stone-400">(optional, JPEG/PNG/WebP/GIF up to 5MB)</span>
            </p>
            {uploadError && (
              <div role="alert" className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <img src={logoUrl} alt="Store logo preview" className="w-16 h-16 rounded-xl object-cover border border-stone-300 dark:border-[#2b3545]" />
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => logoInputRef.current?.click()}
                className="px-3 py-1.5 bg-white dark:bg-[#202738] hover:bg-stone-100 dark:hover:bg-[#2b3548] border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'logo' ? `Uploading ${uploadProgress}%` : 'Upload logo'}</span>
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; void handleImagePick(f, 'logo'); }}
              />
            </div>
            <div className="space-y-2">
              <img src={bannerUrl} alt="Store banner preview" className="w-full h-24 rounded-xl object-cover border border-stone-300 dark:border-[#2b3545]" />
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => bannerInputRef.current?.click()}
                className="px-3 py-1.5 bg-white dark:bg-[#202738] hover:bg-stone-100 dark:hover:bg-[#2b3548] border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading === 'banner' ? `Uploading ${uploadProgress}%` : 'Upload banner'}</span>
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; void handleImagePick(f, 'banner'); }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploading !== null}
            className="w-full py-3 bg-brand-600 dark:bg-brand-400 hover:bg-brand-700 dark:hover:bg-brand-300 text-white dark:text-stone-950 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>{isSubmitting ? 'Launching Store...' : 'Launch Student Storefront'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
