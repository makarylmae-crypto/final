import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, UNITS, STATUS_COLORS, STATUS_LABELS, type Product, type ProductCategory } from '../types';

export default function FarmerDashboard() {
  const {
    state, getFarmerProducts, getFarmerOrders, getSalesData,
    addProduct, updateProduct, removeProduct, toggleAvailability,
    updateOrderStatus, getAssignedDeliveries,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'sales' | 'deliveries'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const products = getFarmerProducts();
  const orders = getFarmerOrders();
  const salesData = getSalesData();
  const deliveries = getAssignedDeliveries();

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const totalRevenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.isAvailable).length;

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="bg-[#0d0d24] border-b border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👨‍🌾</span>
              <div>
                <h1 className="text-2xl font-bold text-[#e8eaf6]">
                  {state.currentUser?.farmName || 'Farmer Dashboard'}
                </h1>
                <p className="text-[#6b708d] text-sm mt-1">Welcome back, {state.currentUser?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Products', value: activeProducts, icon: '📦', color: 'border-l-[#00c853]' },
            { label: 'Total Orders', value: totalOrders, icon: '📋', color: 'border-l-[#448aff]' },
            { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: 'border-l-[#ff9100]' },
            { label: 'Total Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: '💰', color: 'border-l-[#00e676]' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-[#1a1a2e] rounded-xl p-4 border border-[#2a2a4a] border-l-4 ${stat.color} shadow-lg`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#00c853]/10 text-[#00e676] border border-[#00c853]/20">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-[#e8eaf6]">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 bg-[#0d0d24] rounded-xl p-1 border border-[#1a1a2e] shadow-lg mb-6">
          {[
            { id: 'products', label: 'My Products', icon: '📦' },
            { id: 'orders', label: `Orders ${pendingOrders > 0 ? `(${pendingOrders})` : ''}`, icon: '📋' },
            { id: 'deliveries', label: `Deliveries ${deliveries.length > 0 ? `(${deliveries.length})` : ''}`, icon: '🚚' },
            { id: 'sales', label: 'Sales Data', icon: '📊' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00c853] text-[#0a0a1a] shadow-sm'
                  : 'text-[#6b708d] hover:text-[#a0a4b8] hover:bg-[#1a1a2e]'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#e8eaf6]">Your Products ({products.length})</h2>
              <button
                onClick={() => { setShowForm(true); setEditingProduct(null); }}
                className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#00c853]/20"
              >
                + Add New Product
              </button>
            </div>

            {showForm && (
              <ProductForm
                product={editingProduct}
                onSave={(productData) => {
                  if (editingProduct) updateProduct({ ...editingProduct, ...productData });
                  else addProduct(productData);
                  setShowForm(false); setEditingProduct(null);
                }}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              />
            )}

            {products.length === 0 ? (
              <div className="bg-[#1a1a2e] rounded-xl p-12 text-center border border-[#2a2a4a]">
                <span className="text-5xl block mb-4">🌱</span>
                <p className="text-[#6b708d]">You haven't listed any products yet.</p>
                <button onClick={() => { setShowForm(true); }} className="mt-4 bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-6 py-2 rounded-lg text-sm font-semibold transition-all">
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className={`bg-[#1a1a2e] rounded-xl border p-4 shadow-lg ${
                    product.isAvailable ? 'border-[#2a2a4a]' : 'border-[#ff5252]/30 bg-[#ff5252]/5'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0d0d24] flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#e8eaf6]">{product.name}</h3>
                          <p className="text-xs text-[#6b708d]">{product.farmName}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        product.isAvailable ? 'bg-[#00c853]/10 text-[#00e676] border border-[#00c853]/20' : 'bg-[#ff5252]/10 text-[#ff5252] border border-[#ff5252]/20'
                      }`}>
                        {product.isAvailable ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b708d] mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div><span className="text-lg font-bold text-[#00e676]">₱{product.price}</span><span className="text-sm text-[#6b708d]">/{product.unit}</span></div>
                      <span className="text-sm text-[#6b708d]">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleAvailability(product.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        product.isAvailable ? 'bg-[#ff9100]/10 text-[#ff9100] hover:bg-[#ff9100]/20 border border-[#ff9100]/20' : 'bg-[#00c853]/10 text-[#00e676] hover:bg-[#00c853]/20 border border-[#00c853]/20'
                      }`}>
                        {product.isAvailable ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => { setEditingProduct(product); setShowForm(true); }} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-[#448aff]/10 text-[#448aff] hover:bg-[#448aff]/20 border border-[#448aff]/20 transition-colors">Edit</button>
                      <button onClick={() => { if (confirm('Remove this product?')) removeProduct(product.id); }} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-[#ff5252]/10 text-[#ff5252] hover:bg-[#ff5252]/20 border border-[#ff5252]/20 transition-colors">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold text-[#e8eaf6] mb-4">Orders Received ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="bg-[#1a1a2e] rounded-xl p-12 text-center border border-[#2a2a4a]">
                <span className="text-5xl block mb-4">📭</span>
                <p className="text-[#6b708d]">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...orders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                  <div key={order.id} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-4 shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#e8eaf6]">Order #{order.id.slice(-8)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="text-sm text-[#6b708d] mt-1">{order.residentName} • {new Date(order.createdAt).toLocaleDateString('en-PH')}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#00e676]">₱{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="border-t border-[#1a1a2e] pt-3">
                      <p className="text-sm font-medium text-[#a0a4b8] mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-sm text-[#6b708d] flex justify-between">
                            <span>{item.productName} x{item.quantity}</span>
                            <span>₱{(item.unitPrice * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {order.notes && <div className="mt-2 text-sm text-[#6b708d] bg-[#0d0d24] rounded-lg p-2">📝 {order.notes}</div>}
                    <div className="border-t border-[#1a1a2e] mt-3 pt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-[#6b708d]">📍 {order.deliveryAddress}</span>
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="bg-[#448aff] hover:bg-[#448aff]/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Confirm Order</button>
                          <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="bg-[#ff5252]/10 hover:bg-[#ff5252]/20 text-[#ff5252] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-[#ff5252]/20">Cancel</button>
                        </>
                      )}
                      {order.status === 'confirmed' && <button onClick={() => updateOrderStatus(order.id, 'processing')} className="bg-[#7c4dff] hover:bg-[#7c4dff]/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Start Processing</button>}
                      {order.status === 'processing' && <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-[#ff9100] hover:bg-[#ff9100]/80 text-[#0a0a1a] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Mark as Shipped</button>}
                      {order.status === 'shipped' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">Mark as Delivered</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div>
            <h2 className="text-lg font-semibold text-[#e8eaf6] mb-4">Assigned Deliveries ({deliveries.length})</h2>
            {deliveries.length === 0 ? (
              <div className="bg-[#1a1a2e] rounded-xl p-12 text-center border border-[#2a2a4a]">
                <span className="text-5xl block mb-4">🚚</span>
                <p className="text-[#6b708d]">No assigned deliveries yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveries.map((order) => (
                  <div key={order.id} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-4 shadow-lg border-l-4 border-l-[#7c4dff]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#e8eaf6]">Order #{order.id.slice(-8)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                        </div>
                        <p className="text-sm text-[#6b708d] mt-1">{order.residentName} • {order.deliveryAddress}</p>
                      </div>
                      <span className="text-lg font-bold text-[#00e676]">₱{order.totalAmount.toLocaleString()}</span>
                    </div>
                    {order.deliveryAssignment && (
                      <div className="bg-[#7c4dff]/10 rounded-lg p-3 mb-3 border border-[#7c4dff]/20">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-xs text-[#6b708d]">Driver</span><p className="font-medium text-[#b388ff]">{order.deliveryAssignment.driverName}</p></div>
                          <div><span className="text-xs text-[#6b708d]">Phone</span><p className="font-medium text-[#b388ff]">{order.deliveryAssignment.driverPhone}</p></div>
                          {order.deliveryAssignment.estimatedDelivery && (
                            <div className="col-span-2"><span className="text-xs text-[#6b708d]">ETA</span><p className="font-medium text-[#b388ff]">{new Date(order.deliveryAssignment.estimatedDelivery).toLocaleString('en-PH')}</p></div>
                          )}
                        </div>
                      </div>
                    )}
                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-4 py-2 rounded-lg text-sm font-semibold transition-all">✅ Mark as Delivered</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div>
            <h2 className="text-lg font-semibold text-[#e8eaf6] mb-4">Sales Overview</h2>
            {orders.length === 0 ? (
              <div className="bg-[#1a1a2e] rounded-xl p-12 text-center border border-[#2a2a4a]">
                <span className="text-5xl block mb-4">📊</span>
                <p className="text-[#6b708d]">No sales data yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
                  <h3 className="font-semibold text-[#a0a4b8] mb-4">Revenue</h3>
                  {salesData.labels.length > 0 ? (
                    <div className="space-y-3">
                      {salesData.labels.map((label, i) => {
                        const maxAmount = Math.max(...salesData.amounts, 1);
                        const widthPct = (salesData.amounts[i] / maxAmount) * 100;
                        return (
                          <div key={label}>
                            <div className="flex justify-between text-sm text-[#6b708d] mb-1">
                              <span>{label}</span>
                              <span className="font-medium text-[#00e676]">₱{salesData.amounts[i].toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-[#0d0d24] rounded-full h-3">
                              <div className="bg-gradient-to-r from-[#00c853] to-[#00e676] rounded-full h-3 transition-all duration-500" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-[#6b708d] text-sm">No revenue data</p>}
                </div>

                <div className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
                  <h3 className="font-semibold text-[#a0a4b8] mb-4">Orders Over Time</h3>
                  {salesData.labels.length > 0 ? (
                    <div className="space-y-3">
                      {salesData.labels.map((label, i) => {
                        const maxOrders = Math.max(...salesData.orders, 1);
                        const widthPct = (salesData.orders[i] / maxOrders) * 100;
                        return (
                          <div key={label}>
                            <div className="flex justify-between text-sm text-[#6b708d] mb-1">
                              <span>{label}</span>
                              <span className="font-medium text-[#448aff]">{salesData.orders[i]} orders</span>
                            </div>
                            <div className="w-full bg-[#0d0d24] rounded-full h-3">
                              <div className="bg-gradient-to-r from-[#448aff] to-[#7c4dff] rounded-full h-3 transition-all" style={{ width: `${widthPct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-[#6b708d] text-sm">No order data</p>}
                </div>

                <div className="lg:col-span-2 bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg">
                  <h3 className="font-semibold text-[#a0a4b8] mb-4">Sales Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#00c853]/10 rounded-lg p-4 text-center border border-[#00c853]/20">
                      <div className="text-3xl font-bold text-[#00e676]">₱{totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-[#6b708d]">Total Revenue</div>
                    </div>
                    <div className="bg-[#448aff]/10 rounded-lg p-4 text-center border border-[#448aff]/20">
                      <div className="text-3xl font-bold text-[#448aff]">{totalOrders}</div>
                      <div className="text-sm text-[#6b708d]">Total Orders</div>
                    </div>
                    <div className="bg-[#ff9100]/10 rounded-lg p-4 text-center border border-[#ff9100]/20">
                      <div className="text-3xl font-bold text-[#ff9100]">{pendingOrders}</div>
                      <div className="text-sm text-[#6b708d]">Pending Orders</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Product Form ---
type ProductFormData = Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'farmName' | 'createdAt'>;

function ProductForm({
  product, onSave, onCancel,
}: {
  product: Product | null;
  onSave: (product: ProductFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    unit: product?.unit || 'kg',
    category: product?.category || 'vegetables' as ProductCategory,
    image: product?.image || '',
    stock: product?.stock || 10,
    isAvailable: product?.isAvailable ?? true,
    organic: product?.organic || false,
    location: product?.location || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (form.price <= 0) { setError('Price must be greater than 0'); return; }
    if (form.stock < 0) { setError('Stock cannot be negative'); return; }
    onSave({ ...form });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] p-6 shadow-lg mb-6">
      <h3 className="font-semibold text-[#e8eaf6] mb-4">{product ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
      {error && <div className="bg-[#ff5252]/10 border border-[#ff5252]/30 text-[#ff5252] px-4 py-2 rounded-lg text-sm mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Product Name *</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]" placeholder="e.g., Fresh Baguio Beans" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]">
            {PRODUCT_CATEGORIES.map((cat) => (<option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Price (₱) *</label>
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]" min="1" step="0.5" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Unit</label>
          <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]">
            {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Stock Quantity</label>
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]" min="0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Location</label>
          <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]" placeholder="e.g., Benguet" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]" rows={3} placeholder="Describe your product..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a4b8] mb-1">Image URL</label>
          <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full bg-[#0d0d24] border border-[#2a2a4a] rounded-lg px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]" placeholder="Paste image URL or keep default" />
        </div>
        <div className="flex items-center gap-4 pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.organic} onChange={(e) => setForm({ ...form, organic: e.target.checked })} className="w-4 h-4 text-[#00c853] rounded border-[#2a2a4a] bg-[#0d0d24] focus:ring-[#00c853]" />
            <span className="text-sm text-[#a0a4b8]">Organic Product 🌱</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button type="submit" className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-[#00c853]/20">{product ? 'Update Product' : 'Add Product'}</button>
        <button type="button" onClick={onCancel} className="bg-[#1a1a2e] hover:bg-[#282845] text-[#a0a4b8] px-6 py-2.5 rounded-lg text-sm font-medium border border-[#2a2a4a] transition-colors">Cancel</button>
      </div>
    </form>
  );
}
