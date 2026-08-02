import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Store from "@/app/models/Store";
import Service from "@/app/models/Service";
import Wishlist from "@/app/models/Wishlist";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getRequestUser } from "@/app/lib/auth";
import { deliveryEtaMinutes } from "@/app/lib/geo";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const category = (searchParams.get("category") || "").trim();
    const sort = searchParams.get("sort") || "newest";
    const storeId = (searchParams.get("storeId") || "").trim();

    const filter = { isActive: { $ne: false } };
    if (category) filter.category = category;
    if (storeId) filter.storeId = storeId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sort === "price_asc") sortQuery = { price: 1 };
    else if (sort === "price_desc") sortQuery = { price: -1 };
    else if (sort === "rating") sortQuery = { ratingAvg: -1 };
    else if (sort === "popular") sortQuery = { ratingCount: -1 };

    const products = await Product.find(filter).sort(sortQuery).lean();

    const storeIds = [...new Set(products.map((p) => p.storeId))];
    const stores = storeIds.length
      ? await Store.find({ uniqueStoreId: { $in: storeIds } }).lean()
      : [];
    const storeMap = new Map(stores.map((s) => [s.uniqueStoreId, s]));

    const session = await getRequestUser(req);
    let userLoc = null;
    let wishlistIds = new Set();
    if (session) {
      const viewer = await User.findOne({ uid: session.uid }).lean();
      userLoc = viewer?.location || null;
      const wl = await Wishlist.findOne({ userId: session.uid }).lean();
      wishlistIds = new Set((wl?.items || []).map((i) => i.productId));
    }

    const svcIds = [...new Set(products.flatMap((p) => (p.services || []).map((s) => s.serviceId)))];
    const svcDocs = svcIds.length ? await Service.find({ _id: { $in: svcIds } }).lean() : [];
    const svcMap = new Map(svcDocs.map((s) => [String(s._id), s]));

    const result = products.map((p) => {
      const store = storeMap.get(p.storeId);
      const serviceDetails = (p.services || [])
        .map((s) => {
          const d = svcMap.get(s.serviceId);
          return {
            serviceId: s.serviceId,
            name: s.name || d?.name || "",
            charges: s.charges || d?.charges || 0,
            chargeType: d?.chargeType || "fixed",
            durationMinutes: d?.durationMinutes || null,
            description: d?.description || "",
            image: d?.image || "",
          };
        })
        .filter((s) => s.name);
      return {
        ...p,
        storeName: store?.name || "",
        storeCategory: store?.category || "",
        deliveryEtaMinutes: deliveryEtaMinutes(store, userLoc),
        deliveryFee: store?.deliveryFee || 0,
        serviceDetails,
        wishlisted: wishlistIds.has(p.uniqueProductId),
      };
    });

    return NextResponse.json({ products: result, total: result.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
