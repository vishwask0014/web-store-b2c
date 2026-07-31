import { connectDB } from "@/app/lib/mongodb";
import Service from "@/app/models/Service";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { storeId, productId } = await params;
    const services = await Service.find({
      productId,
      storeId,
    }).sort({ createdAt: -1 });
    return NextResponse.json(services);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { storeId, productId } = await params;
    const store = await Store.findOne({ uniqueStoreId: storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    if (store.disabled) {
      return NextResponse.json(
        { error: `This store is disabled: ${store.disabledReason}` },
        { status: 400 }
      );
    }

    const serviceCount = await Service.countDocuments({ storeId });
    if (serviceCount >= store.serviceLimit) {
      return NextResponse.json(
        {
          error: `Service limit reached (max ${store.serviceLimit}). Contact b2cstore.support@gmail.com to increase your limit.`,
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    const ownerStores = await Store.find({ ownerId: store.ownerId });
    const ownerStoreIds = ownerStores.map((s) => s.uniqueStoreId);

    const duplicateService = await Service.findOne({
      storeId: { $in: ownerStoreIds },
      name: { $regex: `^${body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
    });

    if (duplicateService) {
      const dupStore = ownerStores.find((s) => s.uniqueStoreId === duplicateService.storeId);
      const disabledCount = ownerStores.filter((s) => s.disabled).length;
      if (disabledCount < ownerStores.length - 1) {
        await Store.findOneAndUpdate(
          { uniqueStoreId: storeId },
          {
            disabled: true,
            disabledReason: `Duplicate service "${body.name}" — same service cannot be offered across multiple stores.`,
          }
        );
      }
      return NextResponse.json(
        {
          error: `Service "${body.name}" already exists in your store "${dupStore?.name}". Each service must be unique across all your stores. This store has been disabled.`,
        },
        { status: 400 }
      );
    }

    const service = await Service.create({
      ...body,
      productId,
      storeId,
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}