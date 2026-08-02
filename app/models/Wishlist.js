import mongoose, { Schema } from "mongoose";

const WishlistSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    items: [
      {
        productId: { type: String, required: true },
        storeId: { type: String, default: "" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

WishlistSchema.index({ userId: 1, "items.productId": 1 });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);
