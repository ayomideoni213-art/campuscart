import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, Store, OrderStatus } from '../../types';
import {
  Store as StoreIcon,
  Package,
  Plus,
  TrendingUp,
  DollarSign,
  Star,
  Edit,
  Trash2,
  CheckCircle,
  Truck,
  Eye,
  Sliders,
  Image as ImageIcon,
  Clock
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
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

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('19.99');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('cat-tech');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/product_tech_gadgets_1791134311823.jpg');
  const [condition, setCondition] = useState<Product['condition']>('Brand New');
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<Product['status']>('published');

  // Find seller's store (or default to Ay's Tech Store if currentUser is Ayomide)
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

  // Store Settings Form
  const [storeName, setStoreName] = useState(myStore.name);
  const [storeTagline, setStoreTagline] = useState(myStore.tagline);
  const [storeDescription, setStoreDescription] = useState(myStore.description);
  const [pickupPoint, setPickupPoint] = useState(myStore.pickup_point);
  const [storeLogo, setStoreLogo] = useState(myStore.logo_url);
  const [storeBanner, setStoreBanner] = useState(myStore.banner_url);
  const [storeSaved, setStoreSaved] = useState(false);

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setPrice('15.00');
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
        price: parseFloat(price) || 10,
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
        seller_id: currentUser?.id || 'user-seller-1',
        store_id: myStore.id,
        store_name: myStore.name,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        price: parseFloat(price) || 10,
        discount_price: discountPrice ? parseFloat(discountPrice) : undefined,
        category_id: categoryId,
        category_name: category ? category.name : 'Tech & Gadgets',
        stock: parseInt(stock, 10) || 1,
        images: [imageUrl],
        condition,
        is_featured: isFeatured,
        status,
        campus_name: currentUser?.campus_name || 'Metropolitan Central University'
      });
    }

    setProductModalOpen(false);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore(myStore.id, {
      name: storeName,
      tagline: storeTagline,
      description: storeDescription,
      pickup_point: pickupPoint,
      logo_url: storeLogo,
      banner_url: storeBanner
    });
    setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={myStore.logo_url}
            alt={myStore.name}
            className="w-16 h-16 rounded-2xl object-cover border border-stone-300"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-stone-900">{myStore.name}</h1>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded">
                Seller Studio
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Pickup Point: <span className="text-stone-700 font-medium">{myStore.pickup_point}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddProduct}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'products'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Inventory & Products ({myProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'orders'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Orders Fulfillment ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'store'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Store Brand Settings
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 font-semibold uppercase">Total Revenue</span>
              <p className="text-xl font-bold text-stone-900 font-mono mt-1">${totalRevenue.toFixed(2)}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Campus peer sales</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 font-semibold uppercase">Total Orders</span>
              <p className="text-xl font-bold text-stone-900 font-mono mt-1">{myOrders.length}</p>
              <span className="text-[10px] text-stone-400">{pendingOrdersCount} pending handoffs</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 font-semibold uppercase">Store Rating</span>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-xl font-bold text-stone-900 font-mono">{myStore.rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-stone-400">{myStore.reviews_count} reviews</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[11px] text-stone-500 font-semibold uppercase">Active Listings</span>
              <p className="text-xl font-bold text-stone-900 font-mono mt-1">{myProducts.length}</p>
              <span className="text-[10px] text-amber-600 font-medium">{outOfStockCount} out of stock</span>
            </div>
          </div>

          {/* Quick Handoff Tasks */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Campus Handoff Instructions</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              When orders arrive, message the buyer via Student Messages to agree on an exact 10-minute window between lectures at your designated pickup table. Once the student inspects the product in person, tap "Mark Delivered" to complete the transaction.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-stone-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900">All Products in Your Store</h3>
            <button
              onClick={handleOpenAddProduct}
              className="px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800"
            >
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-3 flex items-center gap-2.5">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                      />
                      <span className="font-semibold text-stone-900 max-w-xs truncate">{p.name}</span>
                    </td>
                    <td className="p-3 text-stone-600">{p.category_name}</td>
                    <td className="p-3 font-mono font-semibold text-stone-900 tabular-nums">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          p.stock <= 0 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1 text-stone-500 hover:text-stone-900"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this product?')) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1 text-stone-400 hover:text-rose-600"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-stone-200 text-xs text-stone-500">
              No orders received yet. Once students place an order for your items, they will appear here.
            </div>
          ) : (
            myOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-xl border border-stone-200 p-5 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="font-bold text-stone-900 font-mono text-sm">{ord.order_number}</span>
                    <span className="text-stone-400 mx-2">·</span>
                    <span className="text-stone-600">Buyer: {ord.customer_name} ({ord.delivery_info.student_id})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">Status:</span>
                    <select
                      value={ord.order_status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="p-1 bg-stone-100 border border-stone-300 rounded font-semibold text-stone-900 capitalize focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing / Packing</option>
                      <option value="shipped">On the Way to Pickup Point</option>
                      <option value="delivered">Delivered (Completed)</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.items
                    .filter((item) => item.store_id === myStore.id)
                    .map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-stone-700">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span className="font-mono font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg text-[11px] text-stone-600 flex justify-between items-center">
                  <span>Handoff: {ord.delivery_info.campus} ({ord.delivery_info.location_detail})</span>
                  <span>Contact: {ord.delivery_info.phone}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Store Brand Settings */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-stone-900 mb-4">Brand Profile & Campus Pickup</h3>

          {storeSaved && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
              Store branding updated!
            </div>
          )}

          <form onSubmit={handleSaveStore} className="space-y-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tagline</label>
              <input
                type="text"
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Description / Story</label>
              <textarea
                rows={4}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Primary Campus Pickup Location</label>
              <input
                type="text"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800"
            >
              Update Store Information
            </button>
          </form>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 my-8 shadow-2xl border border-stone-200 text-xs">
            <h3 className="text-base font-bold text-stone-900">
              {editingProductId ? 'Edit Product Listing' : 'List New Campus Product'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 60W USB-C Fast Charger"
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Product['condition'])}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                >
                  <option value="Brand New">Brand New</option>
                  <option value="Like New">Like New</option>
                  <option value="Gently Used">Gently Used</option>
                  <option value="Handmade / Custom">Handmade / Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL / Preset</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail condition, specifications, and what is included..."
                  required
                  className="w-full p-2 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl font-semibold hover:bg-stone-800"
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
