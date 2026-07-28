import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    uniqueProductId: { type: String, required: true, unique: true },
    storeId: { type: String, required: true, index: true },
    isServiceAvailable: { type: Boolean, default: false },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);