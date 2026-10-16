import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, Store, OrderStatus } from '../../types';
import { EKITI_CAMPUSES, DEFAULT_CAMPUS } from '../../data/campuses';
import { formatNaira, normalizeWhatsAppUrl, normalizeInstagramUrl, normalizeNigerianPhone } from '../../lib/formatters';
import { uploadBrandImage } from '../../services/imageStorage';
import {
  Plus,
  Star,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  Instagram,
  Building,
  MapPin,
  ExternalLink,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const {
    stores,
    products,
    orders,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStore,
    updateOrderStatus
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'store'>('overview');

  // Add / Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Product Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('15000');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('cat-tech');
  const [stock, setStock] = useState('5');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/product_tech_gadgets_1791134311823.jpg');
  const [condition, setCondition] = useState<Product['condition']>('Brand New');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<Product['status']>('published');

  // Find seller's store (or fallback to first store in list)
  const myStore = stores.find((s) => s.seller_id === currentUser?.id) || stores[0];

  // Seller's products
  const myProducts = products.filter(
    (p) => p.seller_id === currentUser?.id || p.store_id === myStore.id
  );

  // Seller's orders (orders containing items from this store)
  const myOrders = orders.filter((o) =>
    o.items.some((item) => item.store_id === myStore.id)
  );

  // KPIs
  const totalRevenue = myOrders.reduce((sum, ord) => {
    const storeItemsTotal = ord.items
      .filter((i) => i.store_id === myStore.id)
      .reduce((iSum, i) => iSum + i.price * i.quantity, 0);
    return sum + storeItemsTotal;
  }, 0);

  const pendingOrdersCount = myOrders.filter(
    (o) => o.order_status === 'pending' || o.order_status === 'confirmed' || o.order_status === 'processing'
  ).length;

  const outOfStockCount = myProducts.filter((p) => p.stock <= 0).length;

  // ==========================================
  // Store Settings & Editable Profile State
  // ==========================================
  const [storeName, setStoreName] = useState(myStore.name);
  const [storeTagline, setStoreTagline] = useState(myStore.tagline || '');
  const [storeDescription, setStoreDescription] = useState(myStore.description || '');
  const [campusLocation, setCampusLocation] = useState(myStore.campus_location || DEFAULT_CAMPUS);
  const [campusesServed, setCampusesServed] = useState<string[]>(
    myStore.campuses_served && myStore.campuses_served.length > 0
      ? myStore.campuses_served
      : [myStore.campus_location || DEFAULT_CAMPUS]
  );
  const [pickupPoint, setPickupPoint] = useState(myStore.pickup_point || '');
  const [storeLogo, setStoreLogo] = useState(myStore.logo_url || '');
  const [storeBanner, setStoreBanner] = useState(myStore.banner_url || '');
  const [profileThumbnail, setProfileThumbnail] = useState(myStore.profile_thumbnail || currentUser?.avatar_url || '');
  const [whatsAppUrl, setWhatsAppUrl] = useState(myStore.whatsapp_url || '');
  const [instagramUrl, setInstagramUrl] = useState(myStore.instagram_url || myStore.instagram_handle || '');

  // Owner Profile fields
  const [sellerFullName, setSellerFullName] = useState(currentUser?.full_name || '');
  const [sellerBio, setSellerBio] = useState(currentUser?.bio || '');

  const [storeSaved, setStoreSaved] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File Input References
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setPrice('15000');
    setDiscountPrice('');
    setStock('5');
    setImageUrl('/src/assets/images/product_tech_gadgets_1791134311823.jpg');
    setCondition('Brand New');
    setIsFeatured(false);
    setStatus('published');
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setDiscountPrice(prod.discount_price ? prod.discount_price.toString() : '');
    setStock(prod.stock.toString());
    setImageUrl(prod.images[0] || '');
    setCondition(prod.condition);
    setIsFeatured(prod.is_featured);
    setStatus(prod.status);
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find((c) => c.id === categoryId);

    if (editingProductId) {
      updateProduct(editingProductId, {
        name,
        description,
        price: parseFloat(price) || 1000,
        discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
        category_id: categoryId,
        category_name: category ? category.name : 'Tech & Gadgets',
        stock: parseInt(stock, 10) || 1,
        images: [imageUrl],
        condition,
        is_featured: isFeatured,
        status
      });
    } else {
      addProduct({
        seller_id: currentUser?.id || myStore.seller_id,
        store_id: myStore.id,
        store_name: myStore.name,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        price: parseFloat(price) || 1000,
        discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
        category_id: categoryId,
        category_name: category ? category.name : 'Tech & Gadgets',
        stock: parseInt(stock, 10) || 1,
        images: [imageUrl],
        condition,
        is_featured: isFeatured,
        status,
        campus_name: campusLocation
      });
    }

    setProductModalOpen(false);
  };

  const handleFileUpload = async (
    file: File,
    target: 'logo' | 'banner' | 'thumbnail' | 'product'
  ) => {
    setUploadLoading(target);
    setUploadError(null);

    const folderMap = {
      logo: 'logos',
      banner: 'banners',
      thumbnail: 'thumbnails',
      product: 'products'
    } as const;

    const res = await uploadBrandImage(file, folderMap[target], currentUser?.id);
    setUploadLoading(null);

    if (res.success && res.url) {
      if (target === 'logo') setStoreLogo(res.url);
      else if (target === 'banner') setStoreBanner(res.url);
      else if (target === 'thumbnail') setProfileThumbnail(res.url);
      else if (target === 'product') setImageUrl(res.url);
    } else {
      setUploadError(res.error || 'Failed to upload image. Please try again.');
    }
  };

  const handleToggleServedCampus = (campus: string) => {
    setCampusesServed((prev) => {
      if (prev.includes(campus)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== campus);
      } else {
        return [...prev, campus];
      }
    });
  };

  const handleGenerateWhatsAppFromPhone = () => {
    if (currentUser?.phone) {
      const generated = normalizeWhatsAppUrl(currentUser.phone, `Hi ${storeName}, I saw your store on CampusMart!`);
      setWhatsAppUrl(generated);
    } else {
      alert('Please save your Nigerian phone number in your account settings first.');
    }
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    const normalizedWA = whatsAppUrl ? normalizeWhatsAppUrl(whatsAppUrl) : '';
    const normalizedIG = instagramUrl ? normalizeInstagramUrl(instagramUrl) : '';

    updateStore(myStore.id, {
      name: storeName.trim(),
      tagline: storeTagline.trim(),
      description: storeDescription.trim(),
      campus_location: campusLocation,
      campuses_served: campusesServed,
      pickup_point: pickupPoint.trim(),
      logo_url: storeLogo,
      banner_url: storeBanner,
      profile_thumbnail: profileThumbnail,
      whatsapp_url: normalizedWA,
      instagram_url: normalizedIG
    });

    if (currentUser) {
      updateProfile({
        full_name: sellerFullName.trim(),
        bio: sellerBio.trim(),
        avatar_url: profileThumbnail || currentUser.avatar_url,
        campus_name: campusLocation,
        campuses_served: campusesServed
      });
    }

    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <img
            src={myStore.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
            alt={myStore.name}
            className="w-16 h-16 rounded-2xl object-cover border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-[#1c222e]"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">{myStore.name}</h1>
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold rounded border border-transparent dark:border-amber-800/40">
                Seller Studio
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Campus: <span className="text-stone-700 dark:text-stone-300 font-medium">{myStore.campus_location}</span> · Handoff: <span className="text-stone-700 dark:text-stone-300 font-medium">{myStore.pickup_point}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddProduct}
          className="px-4 py-2 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-[#222936] text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-stone-900 text-stone-900 dark:border-amber-400 dark:text-amber-400 font-bold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'border-stone-900 text-stone-900 dark:border-amber-400 dark:text-amber-400 font-bold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Inventory & Products ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'border-stone-900 text-stone-900 dark:border-amber-400 dark:text-amber-400 font-bold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Orders Fulfillment ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 px-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'store'
              ? 'border-stone-900 text-stone-900 dark:border-amber-400 dark:text-amber-400 font-bold'
              : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          Store Brand & Profile Settings
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] shadow-2xs">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold uppercase">Total Revenue</span>
              <p className="text-xl font-bold text-stone-900 dark:text-amber-400 font-mono mt-1">
                {formatNaira(totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ekiti peer sales</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] shadow-2xs">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold uppercase">Pending Orders</span>
              <p className="text-xl font-bold text-stone-900 dark:text-white font-mono mt-1">{pendingOrdersCount}</p>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Handoffs pending</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] shadow-2xs">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold uppercase">Active Listings</span>
              <p className="text-xl font-bold text-stone-900 dark:text-white font-mono mt-1">{myProducts.length}</p>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">In student catalog</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] shadow-2xs">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold uppercase">Store Rating</span>
              <p className="text-xl font-bold text-stone-900 dark:text-white font-mono mt-1 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
                <span>{myStore.rating.toFixed(1)}</span>
              </p>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">({myStore.reviews_count} reviews)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory & Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white">Store Catalog Listings</h3>
            <button
              onClick={handleOpenAddProduct}
              className="px-3 py-1.5 bg-stone-900 dark:bg-amber-400 text-white dark:text-stone-950 font-semibold rounded-lg text-xs"
            >
              + Add Product
            </button>
          </div>

          <div className="bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-stone-50 dark:bg-[#1c222e] border-b border-stone-200 dark:border-[#262e3d] text-stone-500 dark:text-stone-400 font-semibold">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-[#262e3d]">
                {myProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-[#181f2a]">
                    <td className="p-3 flex items-center gap-2">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100 dark:bg-[#1c222e]" />
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500">{p.category_name} · {p.condition}</p>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-stone-900 dark:text-amber-400">
                      {formatNaira(p.discount_price ?? p.price)}
                    </td>
                    <td className="p-3 font-mono">{p.stock} units</td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-[#202736] text-stone-700 dark:text-stone-300">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1 hover:text-amber-600 dark:hover:text-amber-400"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white">Customer Orders</h3>
          {myOrders.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] text-stone-500 text-xs">
              No orders placed for your store yet.
            </div>
          ) : (
            myOrders.map((ord) => (
              <div key={ord.id} className="p-4 bg-white dark:bg-[#151921] rounded-xl border border-stone-200 dark:border-[#262e3d] text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-[#262e3d] pb-2">
                  <div>
                    <span className="font-bold text-stone-900 dark:text-white font-mono">{ord.order_number}</span>
                    <span className="text-stone-400 ml-2">by {ord.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                      {ord.order_status}
                    </span>
                    <select
                      value={ord.order_status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="bg-stone-50 dark:bg-[#1a202c] border border-stone-200 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded p-1 text-[11px]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  {ord.items
                    .filter((item) => item.store_id === myStore.id)
                    .map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-stone-700 dark:text-stone-300">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-mono font-bold text-stone-900 dark:text-amber-400">
                          {formatNaira(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="p-2.5 bg-stone-50 dark:bg-[#11151c] rounded-lg text-[11px] text-stone-600 dark:text-stone-400 flex flex-wrap justify-between items-center gap-2">
                  <span>Handoff: {ord.delivery_info.campus} ({ord.delivery_info.location_detail})</span>
                  <span>Contact: {ord.delivery_info.phone}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Store Brand & Profile Settings (Full Requirements 7 & 8) */}
      {activeTab === 'store' && (
        <div className="bg-white dark:bg-[#151921] rounded-2xl border border-stone-200 dark:border-[#262e3d] p-6 max-w-3xl text-xs transition-colors space-y-6">
          <div className="border-b border-stone-100 dark:border-[#222936] pb-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Entrepreneur & Store Brand Profile Settings
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              Customize your brand images, university coverage, WhatsApp link, and social profiles.
            </p>
          </div>

          {storeSaved && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Store profile and brand settings saved successfully!</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <form onSubmit={handleSaveStore} className="space-y-6">
            {/* 1. BRAND IMAGES & PROFILE THUMBNAIL */}
            <div className="space-y-4 p-4 bg-stone-50 dark:bg-[#181e2a] rounded-xl border border-stone-200 dark:border-[#262e3d]">
              <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" />
                <span>Brand Images & Profile Avatars</span>
              </h4>

              {/* Cover Banner */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Brand Banner / Cover Picture
                </label>
                <div className="relative h-32 rounded-xl overflow-hidden border border-stone-300 dark:border-[#2b3545] bg-stone-200 dark:bg-[#131720]">
                  {storeBanner ? (
                    <img src={storeBanner} alt="Store Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-stone-400">No banner uploaded</div>
                  )}
                  <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3 py-1.5 bg-stone-900/85 hover:bg-stone-900 text-white rounded-lg text-xs font-semibold backdrop-blur-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadLoading === 'banner' ? 'Uploading...' : 'Upload Banner'}</span>
                    </button>
                    {storeBanner && (
                      <button
                        type="button"
                        onClick={() => setStoreBanner('')}
                        className="p-1.5 bg-rose-600/85 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                        title="Remove banner"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'banner');
                    }}
                  />
                </div>
              </div>

              {/* Logo and Profile Thumbnail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Brand Logo */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Brand Logo
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={storeLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                      alt="Brand Logo"
                      className="w-16 h-16 rounded-xl object-cover border border-stone-300 dark:border-[#2b3545] bg-white dark:bg-[#131720]"
                    />
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-[#202738] hover:bg-stone-200 dark:hover:bg-[#2b3548] border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{uploadLoading === 'logo' ? 'Uploading...' : 'Change Logo'}</span>
                      </button>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'logo');
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Thumbnail */}
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Profile Thumbnail / Avatar
                  </label>
                  <div className="flex items-center gap-3">
                    <img
                      src={profileThumbnail || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
                      alt="Profile Avatar"
                      className="w-16 h-16 rounded-full object-cover border border-stone-300 dark:border-[#2b3545] bg-white dark:bg-[#131720]"
                    />
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="px-3 py-1.5 bg-stone-100 dark:bg-[#202738] hover:bg-stone-200 dark:hover:bg-[#2b3548] border border-stone-300 dark:border-[#2b3545] text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>{uploadLoading === 'thumbnail' ? 'Uploading...' : 'Change Thumbnail'}</span>
                      </button>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'thumbnail');
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. STORE BRAND DETAILS */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider">
                Brand Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Store / Brand Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={storeTagline}
                    onChange={(e) => setStoreTagline(e.target.value)}
                    placeholder="Short memorable motto"
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Brand Description / Story
                </label>
                <textarea
                  rows={3}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Share what makes your campus store unique..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>
            </div>

            {/* 3. CAMPUS LOCATIONS & SERVED UNIVERSITIES */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-500" />
                <span>Campus Location & Universities Served</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Your Primary Campus
                  </label>
                  <select
                    value={campusLocation}
                    onChange={(e) => {
                      setCampusLocation(e.target.value);
                      if (!campusesServed.includes(e.target.value)) {
                        setCampusesServed((prev) => [...prev, e.target.value]);
                      }
                    }}
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 cursor-pointer"
                  >
                    {EKITI_CAMPUSES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Designated Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupPoint}
                    onChange={(e) => setPickupPoint(e.target.value)}
                    placeholder="e.g. Student Union Building (SUB) Walkway"
                    required
                    className="w-full p-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Multi-select Campuses Served */}
              <div className="p-3 bg-stone-50 dark:bg-[#181e2a] rounded-xl border border-stone-200 dark:border-[#262e3d] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-stone-800 dark:text-stone-200">
                    Campuses I sell to
                  </label>
                  <button
                    type="button"
                    onClick={() => setCampusesServed(EKITI_CAMPUSES.map((c) => c.name))}
                    className="text-amber-700 dark:text-amber-400 hover:underline font-semibold text-[11px]"
                  >
                    Select All (5)
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {EKITI_CAMPUSES.map((c) => {
                    const isChecked = campusesServed.includes(c.name);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-white dark:bg-[#202838] border-amber-400 dark:border-amber-500 font-medium text-stone-900 dark:text-white'
                            : 'bg-stone-50/50 dark:bg-[#131720] border-stone-200 dark:border-[#262e3d] text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleServedCampus(c.name)}
                          className="mt-0.5 accent-amber-500"
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. WHATSAPP & INSTAGRAM INTEGRATION (Requirements 10 & 11) */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-stone-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Contact & Social Media Integrations</span>
              </h4>

              {/* WhatsApp Link Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    WhatsApp Link
                  </label>
                  {currentUser?.phone && (
                    <button
                      type="button"
                      onClick={handleGenerateWhatsAppFromPhone}
                      className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Suggest from my phone</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={whatsAppUrl}
                    onChange={(e) => setWhatsAppUrl(e.target.value)}
                    placeholder="https://wa.me/2348012345678 or 08012345678"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                  Supports Nigerian numbers with +234 or direct wa.me link. Buyers can message you directly on WhatsApp.
                </p>
              </div>

              {/* Instagram Link Field */}
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Instagram Link
                </label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/your_brand or @your_brand"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-[#222936]">
              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Save Brand & Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#151921] rounded-2xl max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl border border-stone-200 dark:border-[#262e3d] text-xs transition-colors">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              {editingProductId ? 'Edit Product Listing' : 'List New Campus Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Product Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 65W GaN Fast Charger"
                  required
                  className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    step="100"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Discount Price (₦, Optional)</label>
                  <input
                    type="number"
                    step="100"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as Product['condition'])}
                    className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Gently Used">Gently Used</option>
                    <option value="Handmade / Custom">Handmade / Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Product['status'])}
                    className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Product Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => productImgInputRef.current?.click()}
                    className="px-3 py-2 bg-stone-100 dark:bg-[#202738] border border-stone-300 dark:border-[#2b3545] rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 inline mr-1" />
                    Upload
                  </button>
                  <input
                    ref={productImgInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], 'product');
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail condition, specifications, and what is included..."
                  required
                  className="w-full p-2 bg-stone-50 dark:bg-[#181e2a] border border-stone-300 dark:border-[#2b3545] text-stone-900 dark:text-stone-100 rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-[#222936]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 dark:bg-amber-400 hover:bg-stone-800 dark:hover:bg-amber-300 text-white dark:text-stone-950 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {editingProductId ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
