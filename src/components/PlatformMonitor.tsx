import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, STATUS_LABELS } from '../types';

type TabType = 'analytics' | 'farmers' | 'residents';

interface EditUserForm {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'resident';
  farmName: string;
  address: string;
  phone: string;
}

export default function PlatformMonitor() {
  const { state, getPlatformMetrics, updateUser, deleteUser, registerByAdmin } = useApp();
  const metrics = getPlatformMetrics();
  const farmers = state.users.filter((u) => u.role === 'farmer');
  const residents = state.users.filter((u) => u.role === 'resident');

  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [editingUser, setEditingUser] = useState<EditUserForm | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'farmer' as 'farmer' | 'resident', farmName: '', address: 'Hinunangan, Southern Leyte', phone: '' });
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [editForm, setEditForm] = useState<EditUserForm>({ id: '', name: '', email: '', role: 'farmer', farmName: '', address: '', phone: '' });
  const [editError, setEditError] = useState('');

  const handleStartEdit = (u: typeof state.users[0]) => {
    setEditingUser({
      id: u.id, name: u.name, email: u.email, role: u.role as 'farmer' | 'resident',
      farmName: u.farmName || '', address: u.address || '', phone: u.phone || '',
    });
    setEditForm({
      id: u.id, name: u.name, email: u.email, role: u.role as 'farmer' | 'resident',
      farmName: u.farmName || '', address: u.address || '', phone: u.phone || '',
    });
    setEditError('');
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) { setEditError('Name is required'); return; }
    const user = state.users.find((u) => u.id === editForm.id);
    if (!user) return;
    await updateUser({
      id: editForm.id,
      name: editForm.name,
      email: editForm.email,
      role: editForm.role,
      password: user.password,
      farmName: editForm.farmName,
      address: editForm.address,
      phone: editForm.phone,
      createdAt: user.createdAt,
    });
    setEditingUser(null);
  };

  const handleDelete = async (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This will also remove all their products.`)) {
      await deleteUser(userId);
    }
  };

  const handleAddAccount = async () => {
    setAddError(''); setAddSuccess('');
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      setAddError('Name, email, and password are required'); return;
    }
    if (addForm.password.length < 6) { setAddError('Password must be at least 6 characters'); return; }
    const extra: Record<string, string> = {};
    if (addForm.role === 'farmer') {
      if (!addForm.farmName.trim()) { setAddError('Farm name is required for farmers'); return; }
      extra.farmName = addForm.farmName;
    }
    extra.address = addForm.address;
    extra.phone = addForm.phone;
    const err = await registerByAdmin(addForm.name, addForm.email, addForm.password, addForm.role, extra);
    if (err) setAddError(err);
    else {
      setAddSuccess(`✅ ${addForm.role === 'farmer' ? 'Farmer' : 'Resident'} "${addForm.name}" created successfully!`);
      setAddForm({ name: '', email: '', password: '', role: 'farmer', farmName: '', address: 'Hinunangan, Southern Leyte', phone: '' });
      setTimeout(() => setAddSuccess(''), 3000);
    }
  };

  const countAccounts = farmers.length + residents.length;

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="bg-[#0d0d24] border-b border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <h1 className="text-2xl font-bold text-[#e8eaf6]">Platform Monitor</h1>
                <p className="text-sm text-[#6b708d]">FreshKart PH — Hinunangan, Southern Leyte</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#00c853]/20"
            >
              + Add Account
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Farmers', value: metrics.totalFarmers, icon: '👨‍🌾', color: 'border-l-[#00c853]' },
            { label: 'Residents', value: metrics.totalResidents, icon: '🏠', color: 'border-l-[#448aff]' },
            { label: 'Total Accounts', value: countAccounts, icon: '👥', color: 'border-l-[#7c4dff]' },
            { label: 'Products', value: metrics.totalProducts, icon: '📦', color: 'border-l-[#ff9100]' },
            { label: 'Total Orders', value: metrics.totalOrders, icon: '📋', color: 'border-l-[#7c4dff]' },
            { label: 'Revenue', value: `₱${metrics.totalRevenue.toLocaleString()}`, icon: '💰', color: 'border-l-[#00e676]' },
            { label: 'Pending', value: metrics.pendingOrders, icon: '⏳', color: 'border-l-[#ff5252]' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4a] border-l-4 ${stat.color} shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{stat.icon}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#00c853]/10 text-[#00e676] border border-[#00c853]/20">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-[#e8eaf6]">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 bg-[#0d0d24] rounded-xl p-1 border border-[#1a1a2e] shadow-lg mb-6">
          {[
            { id: 'analytics' as TabType, label: '📈 Sales & Analytics', count: '' },
            { id: 'farmers' as TabType, label: '👨‍🌾 Farmers', count: `(${farmers.length})` },
            { id: 'residents' as TabType, label: '🏠 Residents', count: `(${residents.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[#00c853] text-[#0a0a1a] shadow-sm' : 'text-[#6b708d] hover:text-[#a0a4b8] hover:bg-[#1a1a2e]'}`}
            >
              {tab.label} {tab.count}
            </button>
          ))}
        </div>

        {/* ===== ANALYTICS ===== */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
              <h3 className="font-semibold text-[#a0a4b8] mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {Object.entries(metrics.ordersByStatus).map(([status, count]) => {
                  const total = metrics.totalOrders || 1;
                  const pct = (count / total) * 100;
                  const colors: Record<string, string> = {
                    pending: 'bg-[#ff9100]', confirmed: 'bg-[#448aff]', processing: 'bg-[#7c4dff]',
                    shipped: 'bg-[#b388ff]', delivered: 'bg-[#00c853]', cancelled: 'bg-[#ff5252]',
                  };
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm text-[#6b708d] mb-1">
                        <span className="capitalize">{STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status}</span>
                        <span className="font-medium text-[#e8eaf6]">{count}</span>
                      </div>
                      <div className="w-full bg-[#0d0d24] rounded-full h-2.5">
                        <div className={`${colors[status] || 'bg-gray-400'} rounded-full h-2.5 transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
              <h3 className="font-semibold text-[#a0a4b8] mb-4">Daily Revenue</h3>
              {metrics.dailyRevenue.length > 0 ? (
                <div className="space-y-3">
                  {metrics.dailyRevenue.map((d) => {
                    const maxAmt = Math.max(...metrics.dailyRevenue.map((r) => r.amount), 1);
                    const widthPct = (d.amount / maxAmt) * 100;
                    return (
                      <div key={d.date}>
                        <div className="flex justify-between text-sm text-[#6b708d] mb-1">
                          <span>{d.date}</span>
                          <span className="font-medium text-[#00e676]">₱{d.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[#0d0d24] rounded-full h-3">
                          <div className="bg-gradient-to-r from-[#00c853] to-[#00e676] rounded-full h-3 transition-all" style={{ width: `${widthPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-[#6b708d] text-sm">No revenue data yet</p>}
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
              <h3 className="font-semibold text-[#a0a4b8] mb-4">Product Categories</h3>
              <div className="flex flex-wrap gap-2">
                {metrics.categoryDistribution.map((cat) => {
                  const info = PRODUCT_CATEGORIES.find((c) => c.value === cat.category);
                  return (
                    <div key={cat.category} className="bg-[#0d0d24] rounded-lg px-3 py-2 text-sm flex items-center gap-2 border border-[#1a1a2e]">
                      <span>{info?.icon || '📦'}</span>
                      <span className="text-[#a0a4b8]">{info?.label || cat.category}</span>
                      <span className="bg-[#00c853]/10 text-[#00e676] text-xs px-2 py-0.5 rounded-full font-medium border border-[#00c853]/20">{cat.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
              <h3 className="font-semibold text-[#a0a4b8] mb-4">Top Farmers</h3>
              {metrics.topFarmers.length > 0 ? (
                <div className="space-y-3">
                  {metrics.topFarmers.map((farmer, i) => (
                    <div key={farmer.name} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#00c853]/10 flex items-center justify-center text-sm font-bold text-[#00e676] border border-[#00c853]/20">{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#e8eaf6]">{farmer.name}</p>
                        <p className="text-xs text-[#6b708d]">{farmer.orders} orders</p>
                      </div>
                      <span className="text-sm font-bold text-[#00e676]">₱{farmer.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-[#6b708d] text-sm">No farmer data yet</p>}
            </div>
          </div>
        )}

        {/* ===== FARMERS ===== */}
        {activeTab === 'farmers' && (
          <div className="pb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e8eaf6]">Registered Farmers ({farmers.length})</h2>
              <button
                onClick={() => { setShowAddForm(true); setAddForm({ ...addForm, role: 'farmer' }); }}
                className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                + Add Farmer
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmers.map((farmer) => {
                const farmerOrders = state.orders.filter((o) => o.farmerId === farmer.id);
                const farmerRevenue = farmerOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
                const farmerProducts = state.products.filter((p) => p.farmerId === farmer.id);
                return (
                  <div key={farmer.id} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-4 shadow-lg hover:border-[#00c853]/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">👨‍🌾</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#e8eaf6]">{farmer.farmName || farmer.name}</h3>
                        <p className="text-xs text-[#6b708d]">{farmer.name}</p>
                        <p className="text-xs text-[#448aff]">{farmer.email}</p>
                        <p className="text-xs text-[#6b708d]">📍 {farmer.address}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                      <div className="bg-[#00c853]/10 rounded-lg p-2 border border-[#00c853]/20">
                        <div className="font-bold text-[#00e676]">{farmerProducts.length}</div>
                        <div className="text-xs text-[#6b708d]">Products</div>
                      </div>
                      <div className="bg-[#448aff]/10 rounded-lg p-2 border border-[#448aff]/20">
                        <div className="font-bold text-[#448aff]">{farmerOrders.length}</div>
                        <div className="text-xs text-[#6b708d]">Orders</div>
                      </div>
                      <div className="bg-[#ff9100]/10 rounded-lg p-2 border border-[#ff9100]/20">
                        <div className="font-bold text-[#ff9100]">₱{farmerRevenue.toLocaleString()}</div>
                        <div className="text-xs text-[#6b708d]">Revenue</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(farmer)}
                        className="flex-1 bg-[#448aff]/10 hover:bg-[#448aff]/20 text-[#448aff] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#448aff]/20 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(farmer.id, farmer.farmName || farmer.name)}
                        className="flex-1 bg-[#ff5252]/10 hover:bg-[#ff5252]/20 text-[#ff5252] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ff5252]/20 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {farmers.length === 0 && (
                <div className="col-span-full bg-[#1a1a2e] rounded-xl p-12 text-center border border-[#2a2a4a]">
                  <span className="text-5xl block mb-4">👨‍🌾</span>
                  <p className="text-[#6b708d]">No farmers registered yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RESIDENTS ===== */}
        {activeTab === 'residents' && (
          <div className="pb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e8eaf6]">Registered Residents ({residents.length})</h2>
              <button
                onClick={() => { setShowAddForm(true); setAddForm({ ...addForm, role: 'resident' }); }}
                className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                + Add Resident
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {residents.map((resident) => {
                const residentOrders = state.orders.filter((o) => o.residentId === resident.id);
                const totalSpent = residentOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
                return (
                  <div key={resident.id} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-4 shadow-lg hover:border-[#448aff]/30 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🏠</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#e8eaf6]">{resident.name}</h3>
                        <p className="text-xs text-[#448aff]">{resident.email}</p>
                        <p className="text-xs text-[#6b708d]">📍 {resident.address}</p>
                        {resident.phone && <p className="text-xs text-[#6b708d]">📞 {resident.phone}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-sm mb-3">
                      <div className="bg-[#448aff]/10 rounded-lg p-2 border border-[#448aff]/20">
                        <div className="font-bold text-[#448aff]">{residentOrders.length}</div>
                        <div className="text-xs text-[#6b708d]">Orders</div>
                      </div>
                      <div className="bg-[#ff9100]/10 rounded-lg p-2 border border-[#ff9100]/20">
                        <div className="font-bold text-[#ff9100]">₱{totalSpent.toLocaleString()}</div>
                        <div className="text-xs text-[#6b708d]">Total Spent</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartEdit(resident)}
                        className="flex-1 bg-[#448aff]/10 hover:bg-[#448aff]/20 text-[#448aff] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#448aff]/20 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resident.id, resident.name)}
                        className="flex-1 bg-[#ff5252]/10 hover:bg-[#ff5252]/20 text-[#ff5252] px-3 py-1.5 rounded-lg text-xs font-medium border border-[#ff5252]/20 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {residents.length === 0 && (
                <div className="col-span-full bg-[#1a1a2e] rounded-xl p-12 text-center border border-[#2a2a4a]">
                  <span className="text-5xl block mb-4">🏠</span>
                  <p className="text-[#6b708d]">No residents registered yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== EDIT USER MODAL ===== */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full shadow-xl border border-[#2a2a4a]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">✏️</span>
              <h3 className="text-lg font-semibold text-[#e8eaf6]">Edit Account</h3>
            </div>
            {editError && <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 text-[#ff5252] px-4 py-2 rounded-lg text-sm mb-4">{editError}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" />
              </div>
              {editForm.role === 'farmer' && (
                <div>
                  <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Farm Name</label>
                  <input type="text" value={editForm.farmName} onChange={(e) => setEditForm({ ...editForm, farmName: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Address</label>
                <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Phone</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEdit} className="flex-1 bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#00c853]/20">💾 Save Changes</button>
              <button onClick={() => setEditingUser(null)} className="flex-1 bg-[#1a1a2e] hover:bg-[#282845] text-[#a0a4b8] py-2.5 rounded-lg text-sm font-medium border border-[#2a2a4a] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD ACCOUNT MODAL ===== */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full shadow-xl border border-[#2a2a4a]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">➕</span>
              <h3 className="text-lg font-semibold text-[#e8eaf6]">Create New Account</h3>
            </div>
            {addError && <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 text-[#ff5252] px-4 py-2 rounded-lg text-sm mb-4">{addError}</div>}
            {addSuccess && <div className="bg-[#00c853]/10 border border-[#00c853]/30 text-[#00e676] px-4 py-2 rounded-lg text-sm mb-4">{addSuccess}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'farmer' })}
                    className={`p-2 rounded-lg text-sm text-center border-2 transition-all ${addForm.role === 'farmer' ? 'border-[#00c853] bg-[#00c853]/10 text-[#00e676]' : 'border-[#2a2a4a] text-[#6b708d]'}`}
                  >
                    👨‍🌾 Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'resident' })}
                    className={`p-2 rounded-lg text-sm text-center border-2 transition-all ${addForm.role === 'resident' ? 'border-[#00c853] bg-[#00c853]/10 text-[#00e676]' : 'border-[#2a2a4a] text-[#6b708d]'}`}
                  >
                    🏠 Resident
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Full Name *</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" placeholder="Enter full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Email *</label>
                <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Password *</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" placeholder="At least 6 characters" />
              </div>
              {addForm.role === 'farmer' && (
                <div>
                  <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Farm Name *</label>
                  <input type="text" value={addForm.farmName} onChange={(e) => setAddForm({ ...addForm, farmName: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" placeholder="Farm name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Address</label>
                <input type="text" value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Phone</label>
                <input type="text" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] placeholder:text-[#6b708d]" placeholder="+63 XXX XXX XXXX" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddAccount} className="flex-1 bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#00c853]/20">➕ Create Account</button>
              <button onClick={() => { setShowAddForm(false); setAddError(''); setAddSuccess(''); }} className="flex-1 bg-[#1a1a2e] hover:bg-[#282845] text-[#a0a4b8] py-2.5 rounded-lg text-sm font-medium border border-[#2a2a4a] transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
