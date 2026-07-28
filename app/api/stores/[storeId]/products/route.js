import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const products = await Product.find({ storeId: params.storeId }).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const store = await Store.findOne({ uniqueStoreId: params.storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    if (store.disabled) {
      return NextResponse.json(
        { error: `This store is disabled: ${store.disabledReason}` },
        { status: 400 }
      );
    }

    const body = await req.json();

    const ownerStores = await Store.find({ ownerId: store.ownerId });
    const ownerStoreIds = ownerStores.map((s) => s.uniqueStoreId);

    const duplicateProduct = await Product.findOne({
      storeId: { $in: ownerStoreIds },
      name: { $regex: `^${body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
    });

    if (duplicateProduct) {
      const dupStore = ownerStores.find((s) => s.uniqueStoreId === duplicateProduct.storeId);
      const disabledCount = ownerStores.filter((s) => s.disabled).length;
      if (disabledCount < ownerStores.length - 1) {
        await Store.findOneAndUpdate(
          { uniqueStoreId: params.storeId },
          {
            disabled: true,
            disabledReason: `Duplicate product "${body.name}" — same product cannot be sold across multiple stores.`,
          }
        );
      }
      return NextResponse.json(
        {
          error: `Product "${body.name}" already exists in your store "${dupStore?.name}". Each product must be unique across all your stores. This store has been disabled.`,
        },
        { status: 400 }
      );
    }

    const product = await Product.create({
      ...body,
      storeId: params.storeId,
      uniqueProductId: crypto.randomBytes(4).toString("hex").toUpperCase(),
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}