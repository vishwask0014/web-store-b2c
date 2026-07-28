import mongoose, { Schema } from "mongoose";

const StoreSchema = new Schema(
  {
    name: { type: String, required: true },
    uniqueStoreId: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    category: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    serviceLimit: { type: Number, default: 10 },
    disabled: { type: Boolean, default: false },
    disabledReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", StoreSchema);