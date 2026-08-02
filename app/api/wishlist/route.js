import { connectDB } from "@/app/lib/mongodb";
import Wishlist from "@/app/models/Wishlist";
import Product from "@/app/models/Product";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId || userId !== session.uid) return forbidden("You can only view your own wishlist");

    const wishlist = await Wishlist.findOne({ userId });
    const productIds = (wishlist?.items || []).map((i) => i.productId);

    let items = [];
    if (productIds.length) {
      const products = await Product.find({ uniqueProductId: { $in: productIds } });
      const storeIds = [...new Set(products.map((p) => p.storeId))];
      const stores = await Store.find({ uniqueStoreId: { $in: storeIds } });
      const storeMap = new Map(stores.map((s) => [s.uniqueStoreId, s]));
      const ordered = new Map(products.map((p) => [p.uniqueProductId, p]));
      items = productIds
        .map((id) => ordered.get(id))
        .filter(Boolean)
        .map((p) => ({
          ...p.toObject(),
          storeName: storeMap.get(p.storeId)?.name || "",
          storeCategory: storeMap.get(p.storeId)?.category || "",
        }));
    }

    return NextResponse.json({ items, productIds });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const body = await req.json();
    const { userId, productId } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }
    if (!productId) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }

    const product = await Product.findOne({ uniqueProductId: productId });
    if (!product || product.isActive === false) {
      return NextResponse.json({ error: "Product not found or unavailable." }, { status: 404 });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = await Wishlist.create({ userId, items: [] });

    const existing = wishlist.items.find((i) => i.productId === productId);
    let wishlisted;
    if (existing) {
      wishlist.items = wishlist.items.filter((i) => i.productId !== productId);
      wishlisted = false;
    } else {
      wishlist.items.push({ productId, storeId: product.storeId });
      wishlisted = true;
    }

    await wishlist.save();
    return NextResponse.json({
      wishlisted,
      productIds: wishlist.items.map((i) => i.productId),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }
    if (!productId) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter((i) => i.productId !== productId);
      await wishlist.save();
    }
    return NextResponse.json({ wishlisted: false });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
