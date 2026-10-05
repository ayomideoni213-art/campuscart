import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Product, ReportItem, Review } from '../../types';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Flag,
  Star,
  Sparkles,
  Layers,
  Filter,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const EditorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    products,
    reports,
    reviews,
    categories,
    moderateProduct,
    resolveReport,
    moderateReview,
    updateProduct
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'featured' | 'reviews'>('moderation');

  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">CampusMart Editor Center</h1>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded">
              Content & Listing Moderation
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Reviewing student listings, resolving peer safety reports, and curating featured items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center min-w-[90px]">
            <p className="text-[10px] text-stone-500 font-semibold uppercase">Pending Reports</p>
            <p className="text-sm font-bold text-rose-600 font-mono">{pendingReports.length}</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center min-w-[90px]">
            <p className="text-[10px] text-stone-500 font-semibold uppercase">Total Listings</p>
            <p className="text-sm font-bold text-stone-900 font-mono">{products.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'moderation'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Listing Moderation ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Safety Reports</span>
          {pendingReports.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingReports.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('featured')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'featured'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Featured Curation ({products.filter((p) => p.is_featured).length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-3 transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-stone-900 text-stone-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Reviews Moderation ({reviews.length})
        </button>
      </div>

      {/* Tab 1: Listing Moderation */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Product Title</th>
                  <th className="p-3">Student Store</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="p-3 flex items-center gap-2">
                      <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                      <span className="font-semibold text-stone-900 truncate max-w-xs">{p.name}</span>
                    </td>
                    <td className="p-3 text-stone-600">{p.store_name}</td>
                    <td className="p-3 text-stone-500">{p.category_name}</td>
                    <td className="p-3 font-mono tabular-nums">${p.price.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`capitalize px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'suspended'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      {p.status !== 'published' && (
                        <button
                          onClick={() => moderateProduct(p.id, 'published')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {p.status !== 'suspended' && (
                        <button
                          onClick={() => moderateProduct(p.id, 'suspended')}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-semibold hover:bg-rose-700"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-stone-200 text-xs text-stone-500">
              No reports filed. Marketplace is running smoothly.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 bg-white border border-stone-200 rounded-xl text-xs space-y-2 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-rose-100 text-rose-700">
                      <Flag className="w-3.5 h-3.5" />
                    </span>
                    <span className="font-bold text-stone-900">{rep.reason}</span>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-600">Target: <strong className="text-stone-900">{rep.target_name}</strong> ({rep.target_type})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rep.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : rep.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>

                <p className="text-stone-600 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  "{rep.details}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Reported by: {rep.reporter_name} · {new Date(rep.created_at).toLocaleDateString()}</span>
                  {rep.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveReport(rep.id, 'dismissed')}
                        className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded hover:bg-stone-200"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => resolveReport(rep.id, 'resolved')}
                        className="px-2.5 py-1 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
                      >
                        Take Down / Resolve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Featured Listings */}
      {activeTab === 'featured' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4 text-xs">
          <p className="text-stone-600">
            Select items to spotlight on the homepage Hero and Featured Products banner.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className={`p-3 border rounded-xl flex items-center justify-between gap-3 ${
                  p.is_featured ? 'border-amber-400 bg-amber-50/40' : 'border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-500">{p.store_name}</p>
                  </div>
                </div>

                <button
                  onClick={() => updateProduct(p.id, { is_featured: !p.is_featured })}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors shrink-0 ${
                    p.is_featured
                      ? 'bg-amber-500 text-stone-950 hover:bg-amber-600'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {p.is_featured ? 'Featured ★' : 'Promote'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-3 text-xs">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-1.5 shadow-2xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-900">
                  {rev.user_name} on <span className="text-amber-800">{rev.product_name}</span>
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed">{rev.comment}</p>
              <div className="flex justify-between items-center pt-1 text-[11px] text-stone-400">
                <span>Status: <strong className="capitalize text-stone-700">{rev.status}</strong></span>
                <div className="space-x-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => moderateReview(rev.id, 'approved')}
                      className="text-emerald-700 hover:underline font-semibold"
                    >
                      Approve
                    </button>
                  )}
                  {rev.status !== 'flagged' && (
                    <button
                      onClick={() => moderateReview(rev.id, 'flagged')}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Flag / Hide
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
