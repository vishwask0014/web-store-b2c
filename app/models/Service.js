import mongoose, { Schema } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    charges: { type: Number, required: true, min: 0 },
    productId: { type: String, required: true, index: true },
    storeId: { type: String, required: true, index: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);