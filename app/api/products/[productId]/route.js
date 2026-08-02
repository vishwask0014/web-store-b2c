import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Store from "@/app/models/Store";
import Review from "@/app/models/Review";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { productId } = await params;
    if (!productId) return NextResponse.json({ error: "Product id is required." }, { status: 400 });

    const product = await Product.findOne({
      uniqueProductId: productId.toUpperCase(),
      isActive: { $ne: false },
    });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    const store = await Store.findOne({ uniqueStoreId: product.storeId });

    const relatedRaw = await Product.find({
      category: product.category || "__none__",
      uniqueProductId: { $ne: product.uniqueProductId },
      isActive: { $ne: false },
    })
      .sort({ createdAt: -1 })
      .limit(8);

    const relatedStores = await Store.find({ uniqueStoreId: { $in: relatedRaw.map((r) => r.storeId) } });
    const relatedStoreMap = new Map(relatedStores.map((s) => [s.uniqueStoreId, s]));
    const related = relatedRaw.map((r) => ({
      ...r.toObject(),
      storeName: relatedStoreMap.get(r.storeId)?.name || "",
      deliveryMinutes: relatedStoreMap.get(r.storeId)?.deliveryMinutes || 20,
      deliveryFee: relatedStoreMap.get(r.storeId)?.deliveryFee || 0,
      freeDeliveryAbove: relatedStoreMap.get(r.storeId)?.freeDeliveryAbove || 0,
    }));

    const reviews = await Review.find({ productId: product.uniqueProductId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      product: {
        ...product.toObject(),
        storeName: store?.name || "",
        storeCategory: store?.category || "",
        deliveryMinutes: store?.deliveryMinutes || 20,
        deliveryFee: store?.deliveryFee || 0,
        freeDeliveryAbove: store?.freeDeliveryAbove || 0,
      },
      store: store || null,
      related,
      reviews,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
