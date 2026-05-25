import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type {
  AppState,
  User,
  Product,
  Order,
  CartItem,
  OrderStatus,
  UserRole,
  ProductCategory,
  PaymentMethod,
  Payment,
  DeliveryAssignment,
  PlatformMetrics,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const initialState: AppState = {
  users: [],
  products: [],
  orders: [],
  cart: [],
  currentUser: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

type ServerData = Pick<AppState, 'users' | 'products' | 'orders'>;

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_DATA'; payload: ServerData }
  | { type: 'REGISTER'; payload: User }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'LOAD_CART'; payload: CartItem[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'LOAD_DATA': {
      const refreshedCurrentUser = state.currentUser
        ? action.payload.users.find((u) => u.id === state.currentUser?.id) || null
        : null;
      return {
        ...state,
        users: action.payload.users,
        products: action.payload.products,
        orders: action.payload.orders,
        currentUser: refreshedCurrentUser,
        isAuthenticated: Boolean(refreshedCurrentUser),
        loading: false,
        error: null,
      };
    }

    case 'REGISTER':
      return {
        ...state,
        users: [...state.users.filter((u) => u.id !== action.payload.id), action.payload],
        currentUser: action.payload,
        isAuthenticated: true,
      };

    case 'LOGIN':
      return { ...state, currentUser: action.payload, isAuthenticated: true };

    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, cart: [] };

    case 'ADD_PRODUCT':
      return { ...state, products: [action.payload, ...state.products.filter((p) => p.id !== action.payload.id)] };

    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)) };

    case 'REMOVE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };

    case 'ADD_TO_CART': {
      const existing = state.cart.find((c) => c.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.productId === action.payload.productId
              ? { ...c, quantity: c.quantity + action.payload.quantity }
              : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((c) => c.productId !== action.payload) };

    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.productId === action.payload.productId ? { ...c, quantity: action.payload.quantity } : c
        ),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'PLACE_ORDER':
      return { ...state, orders: [action.payload, ...state.orders], cart: [] };

    case 'UPDATE_ORDER':
      return { ...state, orders: state.orders.map((o) => (o.id === action.payload.id ? action.payload : o)) };

    case 'UPDATE_USER': {
      const userExists = state.users.some((u) => u.id === action.payload.id);
      return {
        ...state,
        users: userExists
          ? state.users.map((u) => (u.id === action.payload.id ? action.payload : u))
          : [...state.users, action.payload],
        currentUser: action.payload.id === state.currentUser?.id ? action.payload : state.currentUser,
      };
    }

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        products: state.products.filter((p) => p.farmerId !== action.payload),
        currentUser: action.payload === state.currentUser?.id ? null : state.currentUser,
        isAuthenticated: action.payload === state.currentUser?.id ? false : state.isAuthenticated,
      };

    case 'LOAD_CART':
      return { ...state, cart: action.payload };

    default:
      return state;
  }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  reloadData: () => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, extra?: Partial<User>) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  addProduct: (product: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'farmName' | 'createdAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  placeOrder: (notes: string | undefined, paymentMethod: PaymentMethod, receiptUrl?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  assignDelivery: (orderId: string, assignment: DeliveryAssignment) => Promise<void>;
  updatePaymentStatus: (orderId: string, payment: Payment) => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  registerByAdmin: (name: string, email: string, password: string, role: 'farmer' | 'resident', extra?: Partial<User>) => Promise<string | null>;
  getFarmerOrders: () => Order[];
  getResidentOrders: () => Order[];
  getAllOrders: () => Order[];
  getFarmerProducts: () => Product[];
  getFilteredProducts: (search: string, category: ProductCategory | '', farmerId?: string) => Product[];
  getSalesData: () => { labels: string[]; amounts: number[]; orders: number[] };
  getPlatformMetrics: () => PlatformMetrics;
  getAssignedDeliveries: () => Order[];
}

const AppContext = createContext<AppContextType | null>(null);

function getStoredCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('freshkart_cart') || '[]');
  } catch {
    return [];
  }
}

function getStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem('freshkart_current_user') || 'null');
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => ({
    ...initialState,
    cart: getStoredCart(),
    currentUser: getStoredUser(),
    isAuthenticated: Boolean(getStoredUser()),
  }));

  const reloadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await apiRequest<ServerData>('/api/state');
      dispatch({ type: 'LOAD_DATA', payload: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load data from Aiven database.';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('freshkart_cart', JSON.stringify(state.cart));
  }, [state.cart]);

  useEffect(() => {
    if (state.currentUser) localStorage.setItem('freshkart_current_user', JSON.stringify(state.currentUser));
    else localStorage.removeItem('freshkart_current_user');
  }, [state.currentUser]);

  const register = async (name: string, email: string, password: string, role: UserRole, extra?: Partial<User>) => {
    try {
      const { user } = await apiRequest<{ user: User }>('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, ...extra }),
      });
      dispatch({ type: 'REGISTER', payload: user });
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Registration failed';
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user } = await apiRequest<{ user: User }>('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      dispatch({ type: 'LOGIN', payload: user });
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Login failed';
    }
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const addProduct = async (productData: Omit<Product, 'id' | 'farmerId' | 'farmerName' | 'farmName' | 'createdAt'>) => {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return;
    try {
      const { product } = await apiRequest<{ product: Product }>('/api/products', {
        method: 'POST',
        body: JSON.stringify({ ...productData, farmerId: state.currentUser.id }),
      });
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to add product');
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { product: updated } = await apiRequest<{ product: Product }>(`/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      });
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update product');
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await apiRequest<{ ok: boolean }>(`/api/products/${id}`, { method: 'DELETE' });
      dispatch({ type: 'REMOVE_PRODUCT', payload: id });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to remove product');
    }
  };

  const toggleAvailability = async (id: string) => {
    try {
      const { product } = await apiRequest<{ product: Product }>(`/api/products/${id}/toggle`, { method: 'PATCH' });
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update product availability');
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id, product, quantity } });
  };

  const removeFromCart = (productId: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  const updateCartQuantity = (productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  };

  const placeOrder = async (notes: string | undefined, paymentMethod: PaymentMethod, receiptUrl?: string) => {
    if (!state.currentUser || state.currentUser.role !== 'resident' || state.cart.length === 0) return;
    try {
      const data = await apiRequest<ServerData & { order: Order }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ residentId: state.currentUser.id, cart: state.cart, notes, paymentMethod, receiptUrl }),
      });
      dispatch({ type: 'LOAD_DATA', payload: data });
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to place order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      const { order } = await apiRequest<{ order: Order }>(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      dispatch({ type: 'UPDATE_ORDER', payload: order });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update order status');
    }
  };

  const assignDelivery = async (orderId: string, assignment: DeliveryAssignment) => {
    try {
      const { order } = await apiRequest<{ order: Order }>(`/api/orders/${orderId}/delivery`, {
        method: 'PATCH',
        body: JSON.stringify(assignment),
      });
      dispatch({ type: 'UPDATE_ORDER', payload: order });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to assign delivery');
    }
  };

  const updatePaymentStatus = async (orderId: string, payment: Payment) => {
    try {
      const { order } = await apiRequest<{ order: Order }>(`/api/orders/${orderId}/payment`, {
        method: 'PATCH',
        body: JSON.stringify(payment),
      });
      dispatch({ type: 'UPDATE_ORDER', payload: order });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update payment');
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    const targetId = updates.id || state.currentUser?.id;
    if (!targetId) return;
    try {
      const { user } = await apiRequest<{ user: User }>(`/api/users/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update account');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await apiRequest<{ ok: boolean }>(`/api/users/${userId}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_USER', payload: userId });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to delete account');
    }
  };

  const registerByAdmin = async (name: string, email: string, password: string, role: 'farmer' | 'resident', extra?: Partial<User>) => {
    try {
      const { user } = await apiRequest<{ user: User }>('/api/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, ...extra }),
      });
      dispatch({ type: 'UPDATE_USER', payload: user });
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Unable to create account';
    }
  };

  const getFarmerOrders = () => {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return [];
    return state.orders.filter((o) => o.farmerId === state.currentUser!.id);
  };

  const getResidentOrders = () => {
    if (!state.currentUser || state.currentUser.role !== 'resident') return [];
    return state.orders.filter((o) => o.residentId === state.currentUser!.id);
  };

  const getAllOrders = () => state.orders;

  const getFarmerProducts = () => {
    if (!state.currentUser || state.currentUser.role !== 'farmer') return [];
    return state.products.filter((p) => p.farmerId === state.currentUser!.id);
  };

  const getFilteredProducts = (search: string, category: ProductCategory | '', farmerId?: string) => {
    let filtered = state.products.filter((p) => p.isAvailable);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.farmName.toLowerCase().includes(s) ||
          p.farmerName.toLowerCase().includes(s)
      );
    }
    if (category) filtered = filtered.filter((p) => p.category === category);
    if (farmerId) filtered = filtered.filter((p) => p.farmerId === farmerId);
    return filtered;
  };

  const getSalesData = () => {
    const farmerOrders = getFarmerOrders().filter((o) => o.status !== 'cancelled');
    const grouped: Record<string, { amount: number; orders: number }> = {};
    farmerOrders.forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = { amount: 0, orders: 0 };
      grouped[date].amount += o.totalAmount;
      grouped[date].orders += 1;
    });
    const labels = Object.keys(grouped);
    return { labels, amounts: labels.map((l) => grouped[l].amount), orders: labels.map((l) => grouped[l].orders) };
  };

  const getPlatformMetrics = (): PlatformMetrics => {
    const allUsers = state.users;
    const allProducts = state.products;
    const allOrders = state.orders;

    const totalFarmers = allUsers.filter((u) => u.role === 'farmer').length;
    const totalResidents = allUsers.filter((u) => u.role === 'resident').length;
    const totalProducts = allProducts.length;
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
    const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;

    const ordersByStatus: Record<OrderStatus, number> = {
      pending: allOrders.filter((o) => o.status === 'pending').length,
      confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
      processing: allOrders.filter((o) => o.status === 'processing').length,
      shipped: allOrders.filter((o) => o.status === 'shipped').length,
      delivered: allOrders.filter((o) => o.status === 'delivered').length,
      cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
    };

    const farmerRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    allOrders.filter((o) => o.status !== 'cancelled').forEach((o) => {
      const farmer = allUsers.find((u) => u.id === o.farmerId);
      const name = farmer?.farmName || farmer?.name || 'Unknown';
      if (!farmerRevenue[o.farmerId]) farmerRevenue[o.farmerId] = { name, revenue: 0, orders: 0 };
      farmerRevenue[o.farmerId].revenue += o.totalAmount;
      farmerRevenue[o.farmerId].orders += 1;
    });

    const catCount: Record<string, number> = {};
    allProducts.forEach((p) => {
      catCount[p.category] = (catCount[p.category] || 0) + 1;
    });

    const dailyRev: Record<string, number> = {};
    allOrders.filter((o) => o.status !== 'cancelled').forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
      dailyRev[date] = (dailyRev[date] || 0) + o.totalAmount;
    });

    return {
      totalFarmers,
      totalResidents,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      ordersByStatus,
      topFarmers: Object.values(farmerRevenue).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      categoryDistribution: Object.entries(catCount).map(([category, count]) => ({ category, count })),
      dailyRevenue: Object.entries(dailyRev).map(([date, amount]) => ({ date, amount })),
    };
  };

  const getAssignedDeliveries = () => {
    if (!state.currentUser) return [];
    if (state.currentUser.role === 'farmer') {
      return state.orders.filter((o) => o.farmerId === state.currentUser!.id && o.status === 'shipped' && o.deliveryAssignment);
    }
    if (state.currentUser.role === 'resident') {
      return state.orders.filter((o) => o.residentId === state.currentUser!.id && o.deliveryAssignment);
    }
    return state.orders.filter((o) => o.deliveryAssignment);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        reloadData,
        register,
        login,
        logout,
        addProduct,
        updateProduct,
        removeProduct,
        toggleAvailability,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        placeOrder,
        updateOrderStatus,
        assignDelivery,
        updatePaymentStatus,
        getFarmerOrders,
        getResidentOrders,
        getAllOrders,
        getFarmerProducts,
        getFilteredProducts,
        getSalesData,
        getPlatformMetrics,
        getAssignedDeliveries,
        updateUser,
        deleteUser,
        registerByAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export default AppContext;
