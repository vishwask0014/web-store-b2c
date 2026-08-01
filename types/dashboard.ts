export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  storeId: string;
  storeName: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  serviceName?: string;
  serviceCharge?: number;
}

export interface PaymentSnapshot {
  type: "card" | "upi";
  upiId?: string;
  brand?: string;
  last4?: string;
  holderName?: string;
  expiry?: string;
}

export interface OrderSummary {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: PaymentSnapshot | null;
  autoPaid?: boolean;
  status: OrderStatus;
  createdAt: string;
}

export interface StoreSummary {
  _id: string;
  uniqueStoreId: string;
  name: string;
  category: string;
  rating?: number;
  disabled?: boolean;
}

export interface ProductSummary {
  _id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface RevenuePoint {
  label: string;
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

export interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

export interface SellerRow {
  id: string;
  name: string;
  orders: number;
  revenue: number;
  rating: number;
}

export interface WalletTotals {
  revenue: number;
  commission: number;
  pendingPayout: number;
  withdrawals: number;
}

export interface KpiValue {
  value: number;
  growth: number;
}

export interface AiInsights {
  todayRevenue: number;
  topStore: string;
  bestProduct: string;
  pendingOrders: number;
  pendingRefunds: number;
  lowStock: number;
}

export interface DashboardData {
  stores: StoreSummary[];
  products: ProductSummary[];
  orders: OrderSummary[];
  productsByStore: Record<string, number>;
}

export type RangeKey = "7" | "30" | "90" | "365";
