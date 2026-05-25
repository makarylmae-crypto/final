export type UserRole = 'farmer' | 'resident' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  address?: string;
  phone?: string;
  farmName?: string;
  farmDescription?: string;
  farmAvatar?: string;
  avatar?: string;
  createdAt: string;
}

export type ProductCategory =
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'poultry'
  | 'fish'
  | 'rice-grains'
  | 'herbs'
  | 'organic'
  | 'other';

export interface Product {
  id: string;
  farmerId: string;
  farmerName: string;
  farmName: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: ProductCategory;
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt: string;
  organic?: boolean;
  location?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod' | 'gcash' | 'maya';

export interface Payment {
  method: PaymentMethod;
  status: 'unpaid' | 'paid' | 'refunded';
  reference?: string;
  receiptUrl?: string;
  paidAt?: string;
}

export interface DeliveryAssignment {
  driverName: string;
  driverPhone: string;
  assignedAt: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface Order {
  id: string;
  residentId: string;
  residentName: string;
  residentAddress: string;
  residentPhone: string;
  farmerId: string;
  items: { productId: string; productName: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
  deliveryAddress: string;
  notes?: string;
  payment: Payment;
  deliveryAssignment?: DeliveryAssignment;
}

export interface SalesData {
  date: string;
  amount: number;
  orders: number;
}

export interface PlatformMetrics {
  totalFarmers: number;
  totalResidents: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  topFarmers: { name: string; revenue: number; orders: number }[];
  categoryDistribution: { category: string; count: number }[];
  dailyRevenue: { date: string; amount: number }[];
}

export interface AppState {
  users: User[];
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  currentUser: User | null;
  isAuthenticated: boolean;
  loading?: boolean;
  error?: string | null;
}

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string; icon: string }[] = [
  { value: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { value: 'fruits', label: 'Fruits', icon: '🍎' },
  { value: 'dairy', label: 'Dairy', icon: '🥛' },
  { value: 'meat', label: 'Meat', icon: '🥩' },
  { value: 'poultry', label: 'Poultry', icon: '🍗' },
  { value: 'fish', label: 'Fish & Seafood', icon: '🐟' },
  { value: 'rice-grains', label: 'Rice & Grains', icon: '🌾' },
  { value: 'herbs', label: 'Herbs & Spices', icon: '🌿' },
  { value: 'organic', label: 'Organic', icon: '🌱' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export const UNITS = ['kg', 'g', 'piece', 'bundle', 'sack', 'liter', 'dozen', 'basket'];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-900/30 text-yellow-300 border-yellow-600/30',
  confirmed: 'bg-blue-900/30 text-blue-300 border-blue-600/30',
  processing: 'bg-indigo-900/30 text-indigo-300 border-indigo-600/30',
  shipped: 'bg-purple-900/30 text-purple-300 border-purple-600/30',
  delivered: 'bg-green-900/30 text-green-300 border-green-600/30',
  cancelled: 'bg-red-900/30 text-red-300 border-red-600/30',
};

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string; description: string }[] = [
  { value: 'cod', label: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive your order' },
  { value: 'gcash', label: 'GCash', icon: '📱', description: 'Pay via GCash — upload receipt' },
  { value: 'maya', label: 'Maya', icon: '💳', description: 'Pay via Maya — upload receipt' },
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
