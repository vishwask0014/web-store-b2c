import mongoose, { Schema } from "mongoose";

const CartItemSchema = new Schema(
  {
    storeId: { type: String, required: true },
    storeName: { type: String, default: "" },
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    serviceId: { type: String, default: "" },
    serviceName: { type: String, default: "" },
    serviceCharge: { type: Number, default: 0, min: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);