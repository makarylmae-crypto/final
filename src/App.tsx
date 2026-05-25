import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import FarmerDashboard from './components/FarmerDashboard';
import ShopPage from './components/ShopPage';
import CartPage from './components/CartPage';
import OrdersPage from './components/OrdersPage';
import PlatformMonitor from './components/PlatformMonitor';
import FarmerProfile from './components/FarmerProfile';

type Page =
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'sales'
  | 'profile'
  | 'market'
  | 'shop'
  | 'cart'
  | 'monitor';

function AppContent() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const { isAuthenticated, currentUser } = state;

  if (state.loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-[#e8eaf6] font-semibold">Loading FreshKart PH data...</p>
          <p className="text-[#6b708d] text-sm mt-2">Connecting to Aiven database</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
        <div className="max-w-lg bg-[#1a1a2e] border border-[#ff5252]/30 rounded-2xl p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-[#e8eaf6] mb-2">Database connection problem</h1>
          <p className="text-[#ff8a80] text-sm">{state.error}</p>
          <p className="text-[#6b708d] text-xs mt-4">Check your Render environment variables for MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE.</p>
        </div>
      </div>
    );
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    // ---- NOT AUTHENTICATED ----
    if (!isAuthenticated) {
      if (currentPage === 'login') return <AuthPage mode="login" />;
      if (currentPage === 'register') return <AuthPage mode="register" />;
      if (currentPage === 'market' || currentPage === 'home') {
        return <LandingPage onNavigate={handleNavigate} />;
      }
      // Protected pages redirect to login
      if (['dashboard', 'products', 'orders', 'sales', 'shop', 'cart', 'monitor'].includes(currentPage)) {
        return <AuthPage mode="login" />;
      }
      return <LandingPage onNavigate={handleNavigate} />;
    }

    // ---- ADMIN ----
    if (currentUser?.role === 'admin') {
      switch (currentPage) {
        case 'monitor':
          return <PlatformMonitor />;
        default:
          return <PlatformMonitor />;
      }
    }

    // ---- FARMER ----
    if (currentUser?.role === 'farmer') {
      switch (currentPage) {
        case 'dashboard':
        case 'products':
        case 'sales':
          return <FarmerDashboard />;
        case 'orders':
          return <OrdersPage role="farmer" />;
        case 'profile':
          return <FarmerProfile />;
        case 'market':
        case 'home':
          return <LandingPage onNavigate={handleNavigate} />;
        case 'cart':
          return <CartPage onNavigate={handleNavigate} />;
        default:
          return <FarmerDashboard />;
      }
    }

    // ---- RESIDENT ----
    switch (currentPage) {
      case 'shop':
        return <ShopPage />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'orders':
        return <OrdersPage role="resident" />;
      case 'market':
      case 'home':
        return <LandingPage onNavigate={handleNavigate} />;
      default:
        return <ShopPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
