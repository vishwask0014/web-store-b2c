import { connectDB } from "@/app/lib/mongodb";
import Service from "@/app/models/Service";
import Store from "@/app/models/Store";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const service = await Service.findOne({ _id: params.serviceId });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const existing = await Service.findById(params.serviceId);
    if (!existing) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    if (body.name && body.name.toLowerCase() !== existing.name.toLowerCase()) {
      const store = await Store.findOne({ uniqueStoreId: existing.storeId });
      if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

      const ownerStores = await Store.find({ ownerId: store.ownerId });
      const ownerStoreIds = ownerStores.map((s) => s.uniqueStoreId);

      const duplicate = await Service.findOne({
        storeId: { $in: ownerStoreIds },
        _id: { $ne: params.serviceId },
        name: { $regex: `^${body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
      });

      if (duplicate) {
        const disabledCount = ownerStores.filter((s) => s.disabled).length;
        if (disabledCount < ownerStores.length - 1) {
          await Store.findOneAndUpdate(
            { uniqueStoreId: existing.storeId },
            {
              disabled: true,
              disabledReason: `Duplicate service "${body.name}" — same service cannot be offered across multiple stores.`,
            }
          );
        }
        return NextResponse.json(
          { error: `Service "${body.name}" already exists in another store. This store has been disabled.` },
          { status: 400 }
        );
      }
    }

    const service = await Service.findByIdAndUpdate(params.serviceId, body, {
      new: true,
      runValidators: true,
    });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json(service);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const service = await Service.findByIdAndDelete(params.serviceId);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ message: "Service deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}