import { useApp } from '../context/AppContext';
import { PRODUCT_CATEGORIES, type ProductCategory } from '../types';
import { useState } from 'react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { state, getFilteredProducts, addToCart } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [showAll, setShowAll] = useState(false);

  const displayedProducts = showAll
    ? getFilteredProducts(search, category)
    : getFilteredProducts(search, category).slice(0, 8);

  const { isAuthenticated, currentUser } = state;

  return (
    <div className="bg-[#0a0a1a] text-[#e8eaf6]">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-farm.jpg"
            alt="FreshKart PH - Local Farmers Market"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a1a] via-[#0a0a1a]/80 to-[#0a0a1a]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-transparent to-[#0a0a1a]/50" />
        </div>
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {['🌾', '🥬', '🍎', '🐟', '🌱', '🍅', '🥭', '🌿'].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-6xl md:text-8xl opacity-[0.04]"
              style={{
                top: `${10 + i * 12}%`,
                left: `${5 + i * 11}%`,
                transform: `rotate(${i * 45}deg)`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#00c853]/10 text-[#00e676] px-4 py-1.5 rounded-full text-sm font-medium border border-[#00c853]/20 glow-green">
                🇵🇭 Local Farmers Digital Market
              </span>
              <span className="bg-[#ffd600]/10 text-[#ffd600] px-4 py-1.5 rounded-full text-sm font-medium border border-[#ffd600]/20">
                Farm Fresh Daily
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              Fresh from the Farm,{' '}
              <span className="text-gradient glow-text">Straight to Your Table</span>
            </h1>
            <p className="text-lg md:text-xl text-[#a0a4b8] mb-10 max-w-2xl leading-relaxed">
              FreshKart PH connects you directly with local Filipino farmers. Get the freshest
              produce, support local agriculture, and know exactly where your food comes from.
            </p>
            <div className="flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => onNavigate('register')}
                    className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#00c853]/20 hover:shadow-[#00c853]/30 transition-all hover:-translate-y-0.5"
                  >
                    Get Started Free
                  </button>
                  <button
                    onClick={() => onNavigate('market')}
                    className="border border-[#00c853]/30 text-[#e8eaf6] px-8 py-4 rounded-xl font-semibold hover:bg-[#00c853]/10 hover:border-[#00c853]/50 transition-all"
                  >
                    Browse Market
                  </button>
                </>
              ) : currentUser?.role === 'farmer' ? (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#00c853]/20 transition-all hover:-translate-y-0.5"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('products')}
                    className="border border-[#00c853]/30 text-[#e8eaf6] px-8 py-4 rounded-xl font-semibold hover:bg-[#00c853]/10 transition-all"
                  >
                    Manage Products
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('shop')}
                    className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#00c853]/20 transition-all hover:-translate-y-0.5"
                  >
                    Start Shopping
                  </button>
                  <button
                    onClick={() => onNavigate('orders')}
                    className="border border-[#00c853]/30 text-[#e8eaf6] px-8 py-4 rounded-xl font-semibold hover:bg-[#00c853]/10 transition-all"
                  >
                    My Orders
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-[#1a1a2e] bg-[#0d0d24]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50+', label: 'Local Farmers', icon: '👨‍🌾' },
              { number: '200+', label: 'Fresh Products', icon: '🥦' },
              { number: '1,000+', label: 'Happy Customers', icon: '😊' },
              { number: '10+', label: 'Provinces Served', icon: '📍' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{stat.icon}</span>
                <div className="text-3xl font-bold text-[#00e676] glow-text">{stat.number}</div>
                <div className="text-sm text-[#6b708d] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#0a0a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-center text-[#6b708d] mb-10 max-w-lg mx-auto">Find exactly what you're looking for</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  onNavigate('market');
                }}
                className="bg-[#1a1a2e] hover:bg-[#282845] rounded-2xl p-5 text-center border border-[#2a2a4a] hover:border-[#00c853]/30 hover:-translate-y-1 transition-all group"
              >
                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-medium text-[#a0a4b8] group-hover:text-[#e8eaf6] transition-colors">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#0d0d24] border-t border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold">
                Fresh <span className="text-gradient">Produce</span>
              </h2>
              <p className="text-[#6b708d] text-sm mt-1">Directly from local farms</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b708d] text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl pl-9 pr-4 py-2.5 text-sm w-48 md:w-56 focus:outline-none focus:border-[#00c853] focus:ring-1 focus:ring-[#00c853]/30"
                />
              </div>
            </div>
          </div>

          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a]">
              <span className="text-6xl block mb-4">🔍</span>
              <p className="text-[#6b708d] text-lg">No products found</p>
              <button onClick={() => { setSearch(''); setCategory(''); }} className="mt-4 text-[#00c853] hover:text-[#00e676] text-sm">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-[#1a1a2e] rounded-2xl border border-[#2a2a4a] overflow-hidden shadow-lg shadow-black/20 hover:shadow-[#00c853]/5 hover:border-[#00c853]/20 hover:-translate-y-1.5 transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden bg-[#0d0d24]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
                      {product.organic && (
                        <span className="absolute top-3 right-3 bg-[#00c853]/90 text-[#0a0a1a] text-xs px-2.5 py-1 rounded-full font-semibold">
                          Organic 🌱
                        </span>
                      )}
                      {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 left-3 bg-[#ff9100]/90 text-[#0a0a1a] text-xs px-2.5 py-1 rounded-full font-semibold">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#00c853] font-medium bg-[#00c853]/10 px-2 py-0.5 rounded-full border border-[#00c853]/20">
                          {product.farmName}
                        </span>
                        <span className="text-xs text-[#6b708d]">{product.location}</span>
                      </div>
                      <h3 className="font-semibold text-[#e8eaf6] mb-1">{product.name}</h3>
                      <p className="text-sm text-[#6b708d] line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-[#00e676]">₱{product.price}</span>
                          <span className="text-sm text-[#6b708d]">/{product.unit}</span>
                        </div>
                        {isAuthenticated && currentUser?.role === 'resident' && product.stock > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                            className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#6b708d] mt-2">
                        {product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of stock'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {getFilteredProducts(search, category).length > 8 && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="bg-[#1a1a2e] hover:bg-[#282845] text-[#00c853] border border-[#00c853]/30 hover:border-[#00c853]/50 px-8 py-3 rounded-xl font-medium transition-all"
                  >
                    {showAll ? 'Show Less' : `View All Products (${getFilteredProducts(search, category).length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#0a0a1a] border-t border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-3">System <span className="text-gradient">Workflow</span></h2>
          <p className="text-center text-[#6b708d] mb-12 max-w-2xl mx-auto">
            FreshKart PH facilitates a direct farm-to-table supply chain through a structured digital workflow
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1', icon: '👨‍🌾', title: 'Farmers Onboard & List',
                items: ['Register Account (create farm profile)', 'List Products (add produce to inventory)', 'Manage Product Listings (edit/update/remove)', 'Receive Orders (get notified of purchases)', 'Monitor Sales Data (track revenue & performance)'],
                border: 'border-[#00c853]/30', glow: 'shadow-[#00c853]/5',
              },
              {
                step: '2', icon: '🔄', title: 'Order & Fulfillment Loop',
                items: ['Resident places order', 'Payment processed (GCash/Maya/COD/Bank)', 'Farmer notified → confirms order', 'Delivery assignment created', 'Real-time status: Confirm → Process → Ship → Deliver'],
                border: 'border-[#ffd600]/30', glow: 'shadow-[#ffd600]/5',
              },
              {
                step: '3', icon: '🏠', title: 'Residents Discover & Buy',
                items: ['Register Account (create profile)', 'Browse Products (view full catalog)', 'Search & Filter Products (by category/name)', 'Place Orders (with payment)', 'Track Orders (real-time delivery status)'],
                border: 'border-[#ff9100]/30', glow: 'shadow-[#ff9100]/5',
              },
            ].map((section) => (
              <div
                key={section.title}
                className={`bg-[#1a1a2e] rounded-2xl p-6 border ${section.border} ${section.glow} shadow-lg hover:-translate-y-1 transition-all`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <span className="text-xs text-[#6b708d] font-medium">Step {section.step}</span>
                    <h3 className="font-bold text-[#e8eaf6]">{section.title}</h3>
                  </div>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#a0a4b8]">
                      <span className="text-[#00c853] mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-gradient-to-r from-[#0a0a1a] via-[#0d0d24] to-[#0a0a1a] border-t border-[#1a1a2e] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/2 left-1/4 text-8xl">🌱</div>
          <div className="absolute top-1/3 right-1/4 text-7xl">🌾</div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Join the <span className="text-gradient">FreshKart PH</span> Community</h2>
          <p className="text-[#a0a4b8] mb-10 max-w-xl mx-auto leading-relaxed">
            Whether you're a farmer looking to expand your reach or a resident wanting fresh,
            local produce — FreshKart PH is here for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#00c853]/20 hover:shadow-[#00c853]/30 transition-all hover:-translate-y-0.5"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => onNavigate('market')}
                  className="border border-[#00c853]/30 text-[#e8eaf6] px-8 py-4 rounded-xl font-semibold hover:bg-[#00c853]/10 transition-all"
                >
                  Browse Products
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate(currentUser?.role === 'farmer' ? 'dashboard' : 'shop')}
                className="bg-[#00c853] hover:bg-[#00a844] text-[#0a0a1a] font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#00c853]/20 transition-all hover:-translate-y-0.5"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050812] border-t border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌱</span>
                <span className="text-xl font-bold text-[#e8eaf6]">FreshKart <span className="text-[#ff9100]">PH</span></span>
              </div>
              <p className="text-sm text-[#6b708d]">Connecting local farmers to Filipino households. Fresh produce, fair prices, direct from the farm.</p>
            </div>
            <div>
              <h4 className="font-semibold text-[#a0a4b8] mb-4">For Farmers</h4>
              <ul className="space-y-2 text-sm text-[#6b708d]">
                <li>Register your farm</li>
                <li>List your products</li>
                <li>Manage orders</li>
                <li>Track sales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#a0a4b8] mb-4">For Residents</h4>
              <ul className="space-y-2 text-sm text-[#6b708d]">
                <li>Browse fresh produce</li>
                <li>Support local farmers</li>
                <li>Place orders online</li>
                <li>Home delivery</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1a1a2e] mt-8 pt-8 text-center text-sm text-[#6b708d]">
            © 2026 FreshKart PH. All rights reserved. 🇵🇭
          </div>
        </div>
      </footer>
    </div>
  );
}
