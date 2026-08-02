import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema(
  {
    storeId: { type: String, required: true, index: true },
    storeName: { type: String, default: "" },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    serviceId: { type: String, default: "" },
    serviceName: { type: String, default: "" },
    serviceCharge: { type: Number, default: 0, min: 0 },
    tracking: {
      courier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      estimatedDelivery: { type: String, default: "" },
    },
    shippedAt: { type: String, default: "" },
    deliveredAt: { type: String, default: "" },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zip: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  { _id: false }
);

const SettlementSchema = new Schema(
  {
    ownerId: { type: String, required: true },
    storeIds: { type: [String], default: [] },
    amount: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    share: { type: Number, default: 0 },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "initiated", "blocked", "failed", "paid"],
    },
    payoutId: { type: String, default: "" },
    paidAt: { type: String, default: "" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, uppercase: true },
    userId: { type: String, required: true, index: true },
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0, min: 0 },
    serviceTotal: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "" },
    deliveryFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD", uppercase: true },
    deliveryLocation: { type: LocationSchema, default: () => ({}) },
    paymentMethod: {
      type: { type: String, default: "card", enum: ["card", "upi", "razorpay"] },
      upiId: { type: String, default: "" },
      brand: { type: String, default: "" },
      last4: { type: String, default: "" },
      holderName: { type: String, default: "" },
      expiry: { type: String, default: "" },
    },
    paid: { type: Boolean, default: false },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    shipping: {
      courier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      estimatedDelivery: { type: String, default: "" },
    },
    shippedAt: { type: String, default: "" },
    deliveredAt: { type: String, default: "" },
    cancellation: {
      reason: { type: String, default: "" },
      by: { type: String, default: "" },
      at: { type: String, default: "" },
      refundNote: { type: String, default: "" },
    },
    settlements: { type: [SettlementSchema], default: [] },
    autoPaid: { type: Boolean, default: false },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ "items.storeId": 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);