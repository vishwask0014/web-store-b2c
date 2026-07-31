import mongoose, { Schema } from "mongoose";

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

const PaymentMethodSchema = new Schema(
  {
    brand: { type: String, default: "" },
    last4: { type: String, default: "" },
    holderName: { type: String, default: "" },
    expiry: { type: String, default: "" },
  },
  { timestamps: true }
);

const UserSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, index: { unique: true, partialFilterExpression: { email: { $ne: "" } } } },
    role: { type: String, default: "customer", enum: ["customer", "seller", "operator", "admin"] },
    phone: { type: String, index: { unique: true, partialFilterExpression: { phone: { $ne: "" } } } },
    location: { type: LocationSchema, default: () => ({}) },
    paymentMethods: { type: [PaymentMethodSchema], default: [] },
    defaultPaymentMethod: { type: String, default: "" },
    autoPay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);