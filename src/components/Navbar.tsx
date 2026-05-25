import { useApp } from '../context/AppContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { state, logout } = useApp();
  const { currentUser, isAuthenticated, cart } = state;

  const navItems = isAuthenticated
    ? currentUser?.role === 'admin'
      ? [
          { id: 'monitor', label: '📊 Platform Monitor' },
        ]
      : currentUser?.role === 'farmer'
      ? [
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'products', label: '📦 Products' },
          { id: 'orders', label: '📋 Orders' },
          { id: 'sales', label: '💰 Sales' },
          { id: 'profile', label: '⚙️ Profile' },
          { id: 'market', label: '🌾 Market' },
        ]
      : [
          { id: 'shop', label: '🛒 Shop' },
          { id: 'orders', label: '📋 My Orders' },
          { id: 'cart', label: `🛒 Cart (${cart.reduce((s, c) => s + c.quantity, 0)})` },
        ]
    : [
        { id: 'home', label: '🏠 Home' },
        { id: 'market', label: '🌾 Market' },
        { id: 'login', label: '🔑 Login' },
        { id: 'register', label: '📝 Register' },
      ];

  return (
    <nav className="bg-[#0d0d24] border-b border-[#1a1a2e] shadow-lg shadow-black/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-[#e8eaf6] group-hover:text-gradient transition-all">
              FreshKart <span className="text-[#ff9100]">PH</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                currentPage === item.id ||
                (item.id === 'shop' && currentPage === 'shop') ||
                (item.id === 'cart' && (currentPage === 'cart' || currentPage === 'shop'));
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00c853]/15 text-[#00e676] border border-[#00c853]/20'
                      : 'text-[#a0a4b8] hover:text-[#e8eaf6] hover:bg-[#1a1a2e]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {isAuthenticated && (
              <>
                <div className="w-px h-8 bg-[#1a1a2e] mx-2" />
                <span className="text-sm text-[#6b708d] px-2">
                  {currentUser?.role === 'farmer' ? '👨‍🌾' : currentUser?.role === 'admin' ? '⚙️' : '🏠'}{' '}
                  {currentUser?.name}
                </span>
                <button
                  onClick={() => { logout(); onNavigate('home'); }}
                  className="px-3 py-2 text-sm text-[#ff5252] hover:bg-[#ff5252]/10 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          <details className="md:hidden relative">
            <summary className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a2e] text-[#00c853] cursor-pointer list-none border border-[#2a2a4a]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="text-sm font-medium">Menu</span>
            </summary>
            <div className="absolute right-0 mt-2 w-56 bg-[#0d0d24] rounded-xl shadow-xl border border-[#1a1a2e] py-2 z-50">
              {navItems.map((item) => {
                const isActive =
                  currentPage === item.id ||
                  (item.id === 'shop' && currentPage === 'shop') ||
                  (item.id === 'cart' && (currentPage === 'cart' || currentPage === 'shop'));
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#00c853]/10 text-[#00e676] font-medium'
                        : 'text-[#a0a4b8] hover:bg-[#1a1a2e]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              {isAuthenticated && (
                <>
                  <div className="border-t border-[#1a1a2e] my-1" />
                  <div className="px-4 py-2 text-sm text-[#6b708d]">
                    {currentUser?.role === 'farmer' ? '👨‍🌾' : currentUser?.role === 'admin' ? '⚙️' : '🏠'}{' '}
                    {currentUser?.name}
                  </div>
                  <button
                    onClick={() => { logout(); onNavigate('home'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#ff5252] hover:bg-[#ff5252]/10"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
