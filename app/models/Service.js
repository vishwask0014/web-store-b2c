import mongoose, { Schema } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    charges: { type: Number, required: true, min: 0 },
    chargeType: { type: String, default: "fixed", enum: ["fixed", "hourly"] },
    durationMinutes: { type: Number, default: 60, min: 1 },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    productId: { type: String, default: "", index: true },
    storeId: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: true },
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ServiceSchema.index({ storeId: 1, name: 1 }, { unique: true });

export default mongoose.models.Service ||
  mongoose.model("Service", ServiceSchema);