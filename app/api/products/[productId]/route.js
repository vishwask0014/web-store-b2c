import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Store from "@/app/models/Store";
import Service from "@/app/models/Service";
import Review from "@/app/models/Review";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getRequestUser } from "@/app/lib/auth";
import { deliveryEtaMinutes } from "@/app/lib/geo";

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

    const session = await getRequestUser(req);
    let userLoc = null;
    if (session) {
      const viewer = await User.findOne({ uid: session.uid }).lean();
      userLoc = viewer?.location || null;
    }

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
      deliveryEtaMinutes: deliveryEtaMinutes(relatedStoreMap.get(r.storeId), userLoc),
      deliveryFee: relatedStoreMap.get(r.storeId)?.deliveryFee || 0,
      freeDeliveryAbove: relatedStoreMap.get(r.storeId)?.freeDeliveryAbove || 0,
    }));

    const reviews = await Review.find({ productId: product.uniqueProductId })
      .sort({ createdAt: -1 })
      .limit(20);

    const serviceDocs = await Service.find({
      _id: { $in: product.services.map((s) => s.serviceId) },
    });
    const serviceMap = new Map(serviceDocs.map((s) => [String(s._id), s]));
    const services = product.services.map((s) => ({
      ...(s.toObject ? s.toObject() : s),
      image: serviceMap.get(String(s.serviceId))?.image || "",
      description: serviceMap.get(String(s.serviceId))?.description || "",
    }));

    return NextResponse.json({
      product: {
        ...product.toObject(),
        services,
        storeName: store?.name || "",
        storeCategory: store?.category || "",
        deliveryEtaMinutes: deliveryEtaMinutes(store, userLoc),
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

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { productId } = await params;
    const body = await req.json().catch(() => ({}));
    if (!productId) return NextResponse.json({ error: "Product id is required." }, { status: 400 });

    if (body.action === "view") {
      await Product.updateOne(
        { uniqueProductId: productId.toUpperCase() },
        { $inc: { views: 1 } }
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
