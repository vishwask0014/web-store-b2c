import type {
  AiInsights,
  ChartSlice,
  DashboardData,
  KpiValue,
  OrderSummary,
  RangeKey,
  RevenuePoint,
  SellerRow,
  StoreSummary,
  WalletTotals,
} from "@/types/dashboard";

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  shipped: "#06B6D4",
  delivered: "#22C55E",
  cancelled: "#EF4444",
};

export const RANGE_DAYS: Record<RangeKey, number> = { "7": 7, "30": 30, "90": 90, "365": 365 };

export const RANGE_LABELS: Record<RangeKey, string> = {
  "7": "7 Days",
  "30": "30 Days",
  "90": "90 Days",
  "365": "1 Year",
};

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function maskPayment(method: OrderSummary["paymentMethod"]): string {
  if (!method) return "—";
  if (method.type === "upi") return method.upiId || "UPI";
  return `${method.brand || "Card"} •••• ${method.last4 || "----"}`;
}

export function growthPct(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

const startOfDay = (ts: number) => new Date(ts).setHours(0, 0, 0, 0);
const inDays = (ts: number, days: number) => ts >= startOfDay(Date.now() - (days - 1) * 86_400_000);

export function buildRevenueSeries(orders: OrderSummary[], days: number): RevenuePoint[] {
  const start = startOfDay(Date.now() - (days - 1) * 86_400_000);
  const buckets = new Map<number, RevenuePoint>();
  for (let d = 0; d < days; d++) {
    const key = start + d * 86_400_000;
    const dt = new Date(key);
    buckets.set(key, {
      label: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      date: dt.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      revenue: 0,
      orders: 0,
      profit: 0,
    });
  }
  for (const order of orders) {
    const key = startOfDay(new Date(order.createdAt).getTime());
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const total = Number(order.total) || 0;
    bucket.revenue += total;
    bucket.orders += 1;
    bucket.profit += total * 0.6;
  }
  return [...buckets.values()];
}

export function countUniqueCustomers(orders: OrderSummary[], days?: number): number {
  const start = days ? startOfDay(Date.now() - (days - 1) * 86_400_000) : 0;
  return new Set(
    orders
      .filter((o) => new Date(o.createdAt).getTime() >= start)
      .map((o) => o.customerName)
      .filter(Boolean)
  ).size;
}

export function previousWindow(orders: OrderSummary[], days: number): OrderSummary[] {
  const end = startOfDay(Date.now() - days * 86_400_000);
  const start = end - days * 86_400_000;
  return orders.filter((o) => {
    const ts = new Date(o.createdAt).getTime();
    return ts >= start && ts < end;
  });
}

export function kpiForWindow(orders: OrderSummary[], days: number, lowStockCount: number): KpiValue[] {
  const revenue = orders.filter((o) => inDays(new Date(o.createdAt).getTime(), days)).reduce((s, o) => s + (Number(o.total) || 0), 0);
  const orderCount = orders.filter((o) => inDays(new Date(o.createdAt).getTime(), days)).length;
  const prev = previousWindow(orders, days);
  const prevRevenue = prev.reduce((s, o) => s + (Number(o.total) || 0), 0);
  return [
    { value: revenue, growth: growthPct(revenue, prevRevenue) },
    { value: orderCount, growth: growthPct(orderCount, prev.length) },
  ];
}

export function buildOrderBreakdown(orders: OrderSummary[]): ChartSlice[] {
  const count = (statuses: string[]) => orders.filter((o) => statuses.includes(o.status)).length;
  return [
    { label: "Completed", value: count(["delivered"]), color: "#22C55E" },
    { label: "Pending", value: count(["pending"]), color: "#F59E0B" },
    { label: "Cancelled", value: count(["cancelled"]), color: "#EF4444" },
    { label: "Refunded", value: 0, color: "#8B5CF6" },
  ];
}

export function buildCustomerSegments(orders: OrderSummary[]): ChartSlice[] {
  const perCustomer = new Map<string, { orders: number; spend: number }>();
  for (const o of orders) {
    const key = o.customerName || "Guest";
    const cur = perCustomer.get(key) || { orders: 0, spend: 0 };
    cur.orders += 1;
    cur.spend += Number(o.total) || 0;
    perCustomer.set(key, cur);
  }
  let newC = 0;
  let returning = 0;
  let vip = 0;
  let guest = 0;
  for (const [name, stats] of perCustomer) {
    if (!name || name === "Guest") {
      guest += 1;
    } else if (stats.spend >= 500) {
      vip += 1;
    } else if (stats.orders >= 2) {
      returning += 1;
    } else {
      newC += 1;
    }
  }
  return [
    { label: "New", value: newC, color: "#3B82F6" },
    { label: "Returning", value: returning, color: "#22C55E" },
    { label: "Guest", value: guest, color: "#71717A" },
    { label: "VIP", value: vip, color: "#8B5CF6" },
  ];
}

export function buildInventoryByCategory(stores: StoreSummary[], productsByStore: Record<string, number>): ChartSlice[] {
  const byCategory = new Map<string, number>();
  for (const store of stores) {
    const count = productsByStore[store.uniqueStoreId] || 0;
    if (count === 0) continue;
    const cat = store.category || "Other";
    byCategory.set(cat, (byCategory.get(cat) || 0) + count);
  }
  const colors = ["#3B82F6", "#8B5CF6", "#F59E0B", "#22C55E", "#EF4444", "#06B6D4"];
  return [...byCategory.entries()].map(([label, value], i) => ({
    label,
    value,
    color: colors[i % colors.length],
  }));
}

export function buildSellerPerformance(stores: StoreSummary[], orders: OrderSummary[]): SellerRow[] {
  return stores
    .map((store) => {
      const storeOrders = orders.filter((o) => o.items.some((i) => i.storeId === store.uniqueStoreId));
      return {
        id: store.uniqueStoreId,
        name: store.name,
        orders: storeOrders.length,
        revenue: storeOrders.reduce((s, o) => s + (Number(o.total) || 0), 0),
        rating: store.rating || 4.5,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export function buildWallet(orders: OrderSummary[]): WalletTotals {
  const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const delivered = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + (Number(o.total) || 0), 0);
  const pendingPayout = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).reduce((s, o) => s + (Number(o.total) || 0), 0);
  return {
    revenue,
    commission: delivered * 0.06,
    pendingPayout,
    withdrawals: 0,
  };
}

export function buildInsights(data: DashboardData): AiInsights {
  const { stores, products, orders } = data;
  const today = startOfDay(Date.now());
  const todayRevenue = orders.filter((o) => startOfDay(new Date(o.createdAt).getTime()) === today).reduce((s, o) => s + (Number(o.total) || 0), 0);

  const byStore = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items) {
      byStore.set(item.storeId, (byStore.get(item.storeId) || 0) + (Number(item.price) || 0) * item.quantity);
    }
  }
  const topStoreEntry = [...byStore.entries()].sort((a, b) => b[1] - a[1])[0];
  const topStore = stores.find((s) => s.uniqueStoreId === topStoreEntry?.[0])?.name || topStoreEntry?.[0] || "—";

  const byProduct = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items) {
      byProduct.set(item.name, (byProduct.get(item.name) || 0) + item.quantity);
    }
  }
  const bestProduct = [...byProduct.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return {
    todayRevenue,
    topStore,
    bestProduct,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    pendingRefunds: 0,
    lowStock: products.filter((p) => (p.quantity || 0) <= 5).length,
  };
}

export function ordersToCsv(orders: OrderSummary[]): string {
  const header = ["Order ID", "Customer", "Store", "Amount", "Payment", "Status", "Date"];
  const rows = orders.map((o) => [
    o.orderId,
    o.customerName || "",
    [...new Set(o.items.map((i) => i.storeName))].join("; "),
    (Number(o.total) || 0).toFixed(2),
    maskPayment(o.paymentMethod),
    o.status,
    new Date(o.createdAt).toISOString(),
  ]);
  return [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}
