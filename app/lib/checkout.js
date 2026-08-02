import Product from "@/app/models/Product";
import Coupon from "@/app/models/Coupon";
import Store from "@/app/models/Store";

export function computeCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  let discount = 0;
  if (coupon.type === "percent") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  return Math.max(0, Math.min(discount, subtotal));
}

export function couponError(coupon, subtotal, now = new Date()) {
  if (!coupon) return "Invalid coupon code.";
  if (!coupon.isActive) return "This coupon is no longer active.";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return "This coupon has expired.";
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return "This coupon has reached its usage limit.";
  if (subtotal < coupon.minOrder) {
    return `Add ${formatMoney(coupon.minOrder - subtotal)} more to use this coupon (min order ${formatMoney(coupon.minOrder)}).`;
  }
  return null;
}

export async function findCoupon(code) {
  if (!code) return null;
  return Coupon.findOne({ code: String(code).trim().toUpperCase() });
}

export async function getStoreMap(storeIds) {
  const unique = [...new Set(storeIds.filter(Boolean))];
  if (!unique.length) return new Map();
  const stores = await Store.find({ uniqueStoreId: { $in: unique } });
  return new Map(stores.map((s) => [s.uniqueStoreId, s]));
}

export async function computeDeliveryFee(items, storeMap) {
  const byStore = {};
  for (const item of items) {
    if (!item.storeId) continue;
    if (!byStore[item.storeId]) byStore[item.storeId] = 0;
    byStore[item.storeId] += item.price * item.quantity;
  }
  let fee = 0;
  for (const [storeId, storeSubtotal] of Object.entries(byStore)) {
    const store = storeMap.get(storeId);
    if (!store) continue;
    const feeThreshold = store.freeDeliveryAbove || 0;
    if (store.deliveryFee > 0 && storeSubtotal < feeThreshold) fee += store.deliveryFee;
  }
  return fee;
}

export function formatMoney(amount) {
  return `$${Number(amount || 0).toFixed(2)}`;
}

export async function computeCartTotals(cartItems) {
  const items = [];
  let subtotal = 0;
  let serviceTotal = 0;

  for (const item of cartItems) {
    const product = await Product.findOne({ uniqueProductId: item.productId });
    if (!product || product.isActive === false) {
      const error = new Error(`Product "${item.name}" is no longer available.`);
      error.status = 400;
      throw error;
    }
    const qty = Math.min(item.quantity, product.quantity);
    if (qty <= 0) {
      const error = new Error(`Product "${item.name}" is out of stock.`);
      error.status = 400;
      throw error;
    }
    items.push({
      storeId: product.storeId,
      storeName: item.storeName || product.storeId,
      productId: product.uniqueProductId,
      name: product.name,
      price: product.price,
      quantity: qty,
      serviceId: item.serviceId || "",
      serviceName: item.serviceName || "",
      serviceCharge: item.serviceCharge || 0,
    });
    subtotal += product.price * qty;
    serviceTotal += (item.serviceCharge || 0) * qty;
  }

  const storeMap = await getStoreMap(items.map((i) => i.storeId));
  const deliveryFee = await computeDeliveryFee(items, storeMap);
  return { items, storeMap, subtotal, serviceTotal, deliveryFee };
}
