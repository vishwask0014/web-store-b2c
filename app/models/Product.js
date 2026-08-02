import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    uniqueProductId: { type: String, required: true, unique: true, uppercase: true },
    storeId: { type: String, required: true, index: true },
    category: { type: String, default: "" },
    brand: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    currency: { type: String, default: "USD", uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    minOrderQuantity: { type: Number, default: 1, min: 1 },
    unit: { type: String, default: "piece" },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isServiceAvailable: { type: Boolean, default: false },
    services: {
      type: [
        {
          serviceId: { type: String, default: "" },
          name: { type: String, default: "" },
          charges: { type: Number, default: 0, min: 0 },
        },
      ],
      default: [],
      validate: {
        validator: (v) => v.length <= 7,
        message: "A product can have at most 7 services.",
      },
    },
    isActive: { type: Boolean, default: true },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    cartAdds: { type: Number, default: 0, min: 0 },
    cartRemoves: { type: Number, default: 0, min: 0 },
    cartDwellMinutes: { type: Number, default: 0, min: 0 },
    cartDwellCount: { type: Number, default: 0, min: 0 },
    unitsSold: { type: Number, default: 0, min: 0 },
    orderCount: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    lastOrderAt: { type: String, default: "" },
  },
  { timestamps: true }
);

ProductSchema.index({ storeId: 1, name: 1 }, { unique: true });

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);