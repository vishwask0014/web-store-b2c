import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Service from "@/app/models/Service";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";

const MAX_SERVICES_PER_PRODUCT = 7;

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { storeId, productId } = await params;
    const product = await Product.findOne({
      uniqueProductId: productId,
      storeId,
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
    const { storeId, productId } = await params;
    const body = await req.json();
    const existing = await Product.findOne({
      uniqueProductId: productId,
      storeId,
    });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (body.name && body.name.toLowerCase() !== existing.name.toLowerCase()) {
      const store = await Store.findOne({ uniqueStoreId: storeId });
      if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

      const ownerStores = await Store.find({ ownerId: store.ownerId });
      const ownerStoreIds = ownerStores.map((s) => s.uniqueStoreId);

      const duplicate = await Product.findOne({
        storeId: { $in: ownerStoreIds },
        uniqueProductId: { $ne: productId },
        name: { $regex: `^${body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
      });

      if (duplicate) {
        const disabledCount = ownerStores.filter((s) => s.disabled).length;
        if (disabledCount < ownerStores.length - 1) {
          await Store.findOneAndUpdate(
            { uniqueStoreId: storeId },
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

    if (body.services) {
      if (body.services.length > MAX_SERVICES_PER_PRODUCT) {
        return NextResponse.json(
          { error: `A product can have at most ${MAX_SERVICES_PER_PRODUCT} services.` },
          { status: 400 }
        );
      }
      const serviceDocs = await Service.find({
        storeId,
        _id: { $in: body.services },
      });
      if (serviceDocs.length !== body.services.length) {
        return NextResponse.json(
          { error: "One or more selected services do not belong to this store." },
          { status: 400 }
        );
      }
      body.services = serviceDocs.map((s) => ({
        serviceId: String(s._id),
        name: s.name,
        charges: s.charges,
      }));
      body.isServiceAvailable = body.services.length > 0 || body.isServiceAvailable;
    }

    const product = await Product.findOneAndUpdate(
      { uniqueProductId: productId, storeId },
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
    const { storeId, productId } = await params;
    const product = await Product.findOneAndDelete({
      uniqueProductId: productId,
      storeId,
    });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json({ message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}