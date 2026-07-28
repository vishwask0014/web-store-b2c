import { connectDB } from "@/app/lib/mongodb";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const store = await Store.findOne({ uniqueStoreId: params.storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    return NextResponse.json(store);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const existing = await Store.findOne({ uniqueStoreId: params.storeId });
    if (!existing) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    if (existing.disabled && body.disabled === false) {
      return NextResponse.json(
        { error: "Cannot re-enable a disabled store. Contact support at b2cstore.support@gmail.com." },
        { status: 400 }
      );
    }

    if (body.category && body.category.toLowerCase() !== existing.category.toLowerCase()) {
      const sameCategory = await Store.findOne({
        ownerId: existing.ownerId,
        uniqueStoreId: { $ne: params.storeId },
        category: { $regex: `^${body.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
      });
      if (sameCategory) {
        return NextResponse.json(
          { error: `You already have a store in "${body.category}" category.` },
          { status: 400 }
        );
      }
    }

    const store = await Store.findOneAndUpdate(
      { uniqueStoreId: params.storeId },
      body,
      { new: true, runValidators: true }
    );
    return NextResponse.json(store);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const store = await Store.findOneAndDelete({ uniqueStoreId: params.storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    return NextResponse.json({ message: "Store deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}