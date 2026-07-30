import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: "customer", enum: ["customer", "seller", "operator", "admin"] },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);