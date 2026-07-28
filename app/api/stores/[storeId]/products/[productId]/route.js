import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const product = await Product.findOne({
      uniqueProductId: params.productId,
      storeId: params.storeId,
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const existing = await Product.findOne({
      uniqueProductId: params.productId,
      storeId: params.storeId,
    });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (body.name && body.name.toLowerCase() !== existing.name.toLowerCase()) {
      const store = await Store.findOne({ uniqueStoreId: params.storeId });
      if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

      const ownerStores = await Store.find({ ownerId: store.ownerId });
      const ownerStoreIds = ownerStores.map((s) => s.uniqueStoreId);

      const duplicate = await Product.findOne({
        storeId: { $in: ownerStoreIds },
        uniqueProductId: { $ne: params.productId },
        name: { $regex: `^${body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
      });

      if (duplicate) {
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
          { error: `Product "${body.name}" already exists in another store. This store has been disabled.` },
          { status: 400 }
        );
      }
    }

    const product = await Product.findOneAndUpdate(
      { uniqueProductId: params.productId, storeId: params.storeId },
      body,
      { new: true, runValidators: true }
    );
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const product = await Product.findOneAndDelete({
      uniqueProductId: params.productId,
      storeId: params.storeId,
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}