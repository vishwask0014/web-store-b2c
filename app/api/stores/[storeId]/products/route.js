import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Service from "@/app/models/Service";
import Store from "@/app/models/Store";
import { getSellerUser, sellerDenied } from "@/app/lib/roles";
import { NextResponse } from "next/server";
import crypto from "crypto";

const MAX_SERVICES_PER_PRODUCT = 7;

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { storeId } = await params;
    const products = await Product.find({ storeId }).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { storeId } = await params;
    const store = await Store.findOne({ uniqueStoreId: storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    if (store.disabled) {
      return NextResponse.json(
        { error: `This store is disabled: ${store.disabledReason}` },
        { status: 400 }
      );
    }

    const seller = await getSellerUser(store.ownerId);
    if (!seller) {
      return sellerDenied("create products");
    }

    const body = await req.json();

    let services = [];
    if (body.services && body.services.length > 0) {
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
      services = serviceDocs.map((s) => ({
        serviceId: String(s._id),
        name: s.name,
        charges: s.charges,
      }));
    }

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
          { uniqueStoreId: storeId },
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
      services,
      isServiceAvailable: services.length > 0 || body.isServiceAvailable,
      storeId,
      uniqueProductId: crypto.randomBytes(4).toString("hex").toUpperCase(),
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}