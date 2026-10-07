import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { StorageService } from '../../services/storage';
import { UserProfile, UserRole, OrderStatus } from '../../types';
import {
  ShieldCheck,
  Users,
  Store,
  Package,
  ShoppingBag,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Ban,
  UserCheck,
  Search,
  DollarSign
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    products,
    stores,
    orders,
    categories,
    updateUserRole,
    toggleUserSuspension,
    moderateProduct
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'stores' | 'orders' | 'settings'>('overview');
  const [usersList, setUsersList] = useState<UserProfile[]>(() => StorageService.getUsers());
  const [userSearch, setUserSearch] = useState('');

  if (currentUser?.role !== 'admin') return null;

  // Total GMV & Platform stats
  const totalGMV = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalCompletedOrders = orders.filter((o) => o.order_status === 'delivered').length;

  const filteredUsers = usersList.filter(
    (u) =>
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.student_id.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserRole(userId, newRole);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleToggleSuspend = (userId: string) => {
    toggleUserSuspension(userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Platform Governance & Administration</h1>
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[11px] font-bold rounded border border-purple-500/30">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Global marketplace oversight, role delegation, escrow tracking, and student account safety.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 bg-stone-800 rounded-xl text-right">
            <p className="text-[10px] text-stone-400 uppercase font-bold">Platform GMV</p>
            <p className="text-sm font-bold text-amber-400 font-mono">${totalGMV.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 text-xs font-semibold gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Platform Overview', icon: <Sliders className="w-4 h-4" /> },
          { id: 'users', label: `Users & Roles (${usersList.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'stores', label: `Student Stores (${stores.length})`, icon: <Store className="w-4 h-4" /> },
          { id: 'orders', label: `All Orders (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'settings', label: 'Platform Controls', icon: <ShieldCheck className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase">Total Users</span>
              <p className="text-2xl font-bold text-stone-900 font-mono mt-1">{usersList.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium">Verified .edu students</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase">Active Stores</span>
              <p className="text-2xl font-bold text-stone-900 font-mono mt-1">{stores.length}</p>
              <span className="text-[10px] text-stone-400">Campus brands</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase">Live Products</span>
              <p className="text-2xl font-bold text-stone-900 font-mono mt-1">{products.length}</p>
              <span className="text-[10px] text-stone-400">In catalog</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <span className="text-[10px] text-stone-500 font-bold uppercase">Total Orders</span>
              <p className="text-2xl font-bold text-stone-900 font-mono mt-1">{orders.length}</p>
              <span className="text-[10px] text-emerald-600 font-medium">{totalCompletedOrders} completed</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-stone-900">System Health & Verification Policy</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              CampusMart requires every student seller to possess an active verified university email address and campus identification. Transactions are held in escrow until peer physical meetup is finalized.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs text-xs">
          <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-bold text-stone-900">Registered Student Accounts</h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user, email, ID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50">
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={u.avatar_url} alt={u.full_name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div>
                        <p className="font-semibold text-stone-900">{u.full_name}</p>
                        <p className="text-[11px] text-stone-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-3 font-mono">{u.student_id}</td>
                    <td className="p-3 text-stone-600 truncate max-w-xs">{u.campus_name}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="p-1 bg-stone-100 border border-stone-300 rounded text-[11px] font-semibold text-stone-800 capitalize"
                      >
                        <option value="customer">Customer</option>
                        <option value="seller">Seller</option>
                        <option value="editor">Editor</option>
                        <option value="author">Author</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.is_suspended ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleSuspend(u.id)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                          u.is_suspended
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        }`}
                      >
                        {u.is_suspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Stores */}
      {activeTab === 'stores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {stores.map((s) => (
            <div key={s.id} className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <img src={s.logo_url} alt={s.name} className="w-12 h-12 rounded-xl object-cover border border-stone-200" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-stone-900 truncate">{s.name}</h4>
                    <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">{s.campus_location}</p>
                </div>
              </div>
              <p className="text-stone-600 line-clamp-2">{s.description}</p>
              <div className="pt-2 border-t border-stone-100 flex justify-between text-stone-500">
                <span>Rating: <strong className="text-stone-900">{s.rating}★</strong></span>
                <span>Total Orders: <strong className="text-stone-900">{s.total_sales}</strong></span>
                <span>Status: <strong className="capitalize text-emerald-700">{s.status}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: All Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs text-xs">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Campus Handoff</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/50">
                  <td className="p-3 font-mono font-bold text-stone-900">{ord.order_number}</td>
                  <td className="p-3 text-stone-700">{ord.customer_name}</td>
                  <td className="p-3 text-stone-500 truncate max-w-xs">{ord.delivery_info.campus}</td>
                  <td className="p-3 font-mono font-bold text-stone-900">${ord.total_amount.toFixed(2)}</td>
                  <td className="p-3">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800">
                      {ord.order_status}
                    </span>
                  </td>
                  <td className="p-3 text-stone-400 font-mono text-[11px]">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Controls */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 max-w-xl text-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900">CampusMart Platform Settings</h3>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Platform Commission Fee</label>
            <input
              type="text"
              defaultValue="0% (Subsidized for University Students)"
              disabled
              className="w-full p-2.5 bg-stone-100 border border-stone-300 rounded-lg text-stone-600 font-semibold cursor-not-allowed"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Zero commission structure encourages undergraduate entrepreneurship.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Security & Escrow Support Email</label>
            <input
              type="email"
              defaultValue="support@campusmart.edu"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Active Multi-Campus Federation</label>
            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
              <p className="font-semibold text-stone-800">Metropolitan Central University (MCU)</p>
              <p className="font-semibold text-stone-800">State Institute of Technology (SIT)</p>
              <p className="font-semibold text-stone-800">Coastal University Campus (CUC)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
