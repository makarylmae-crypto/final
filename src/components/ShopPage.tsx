import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, type ProductCategory } from '../types';

export default function ShopPage() {
  const { getFilteredProducts, addToCart } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');
  const [addedMsg, setAddedMsg] = useState<string | null>(null);

  let products = getFilteredProducts(search, category);

  switch (sortBy) {
    case 'name': products = [...products].sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'price-asc': products = [...products].sort((a, b) => a.price - b.price); break;
    case 'price-desc': products = [...products].sort((a, b) => b.price - a.price); break;
    case 'newest': products = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
  }

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product, 1);
    setAddedMsg(product.id);
    setTimeout(() => setAddedMsg(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <div className="bg-[#0d0d24] border-b border-[#1a1a2e] shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🛒</span>
            <h1 className="text-2xl font-bold text-[#e8eaf6]">Fresh Market</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b708d]">🔍</span>
                <input
                  type="text"
                  placeholder="Search products, farms, farmers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl pl-10 pr-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30 placeholder:text-[#6b708d]"
                />
              </div>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory | '')}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]"
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl px-4 py-2.5 text-[#e8eaf6] focus:outline-none focus:border-[#00c853]"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-sm text-[#6b708d] mb-4">
          {products.length} product{products.length !== 1 ? 's' : ''} found
          {category && ` in ${PRODUCT_CATEGORIES.find(c => c.value === category)?.label}`}
          {search && ` for "${search}"`}
        </p>

        {products.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-2xl p-16 text-center border border-[#2a2a4a]">
            <span className="text-6xl block mb-4">🔍</span>
            <h3 className="text-lg font-semibold text-[#e8eaf6] mb-2">No products found</h3>
            <p className="text-[#6b708d]">Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-4 text-[#00c853] hover:text-[#00e676] text-sm">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] overflow-hidden shadow-lg shadow-black/20 hover:shadow-[#00c853]/5 hover:border-[#00c853]/20 hover:-translate-y-1.5 transition-all group">
                <div className="relative h-48 overflow-hidden bg-[#0d0d24]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                  {product.organic && <span className="absolute top-3 right-3 bg-[#00c853]/90 text-[#0a0a1a] text-xs px-2.5 py-1 rounded-full font-semibold">Organic 🌱</span>}
                  {product.stock <= 5 && product.stock > 0 && <span className="absolute top-3 left-3 bg-[#ff9100]/90 text-[#0a0a1a] text-xs px-2.5 py-1 rounded-full font-semibold">Low Stock</span>}
                  {product.stock === 0 && <div className="absolute inset-0 bg-black/60 rounded-t-xl flex items-center justify-center"><span className="bg-[#ff5252] text-white px-4 py-2 rounded-lg font-bold text-sm">Out of Stock</span></div>}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#00c853] font-medium bg-[#00c853]/10 px-2 py-0.5 rounded-full border border-[#00c853]/20">{product.farmName}</span>
                    <span className="text-xs text-[#6b708d]">👨‍🌾 {product.farmerName}</span>
                  </div>
                  <h3 className="font-semibold text-[#e8eaf6] mb-1">{product.name}</h3>
                  <p className="text-sm text-[#6b708d] line-clamp-2 mb-3">{product.description}</p>
                  {product.location && <p className="text-xs text-[#6b708d] mb-2">📍 {product.location}</p>}
                  <div className="flex items-center justify-between">
                    <div><span className="text-lg font-bold text-[#00e676]">₱{product.price}</span><span className="text-sm text-[#6b708d]">/{product.unit}</span></div>
                    {product.stock > 0 && (
                      <button onClick={() => handleAddToCart(product)} disabled={addedMsg === product.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${addedMsg === product.id ? 'bg-[#00c853]/20 text-[#00e676]' : 'bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-semibold'}`}>
                        {addedMsg === product.id ? '✓ Added' : '+ Add to Cart'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#6b708d] mt-2">{product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of stock'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
