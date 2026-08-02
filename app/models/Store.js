import mongoose, { Schema } from "mongoose";

const StoreSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    uniqueStoreId: { type: String, required: true, unique: true, uppercase: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, default: "" },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    ownerId: { type: String, required: true, index: true },
    serviceLimit: { type: Number, default: 10, min: 0 },
    deliveryMinutes: { type: Number, default: 20, min: 5, max: 120 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    freeDeliveryAbove: { type: Number, default: 0, min: 0 },
    disabled: { type: Boolean, default: false },
    disabledReason: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StoreSchema.index({ ownerId: 1, category: 1 }, { unique: true });

export default mongoose.models.Store || mongoose.model("Store", StoreSchema);