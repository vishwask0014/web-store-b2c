import { connectDB } from "@/app/lib/mongodb";
import Service from "@/app/models/Service";
import Store from "@/app/models/Store";
import { getSellerUser, sellerDenied } from "@/app/lib/roles";
import { NextResponse } from "next/server";

const MAX_SERVICES_PER_STORE = 7;

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { storeId } = await params;
    const services = await Service.find({ storeId }).sort({ createdAt: -1 });
    return NextResponse.json(services);
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
      return sellerDenied("create services");
    }

    const body = await req.json();

    const serviceCount = await Service.countDocuments({ storeId });
    if (serviceCount >= MAX_SERVICES_PER_STORE) {
      return NextResponse.json(
        { error: `You can have at most ${MAX_SERVICES_PER_STORE} services per store.` },
        { status: 400 }
      );
    }

    const duplicateService = await Service.findOne({
      storeId,
      name: { $regex: `^${(body.name || "").replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
    });

    if (duplicateService) {
      return NextResponse.json(
        { error: `Service "${body.name}" already exists in this store.` },
        { status: 400 }
      );
    }

    const service = await Service.create({
      name: body.name,
      charges: Number(body.charges) || 0,
      chargeType: body.chargeType || "fixed",
      durationMinutes: Number(body.durationMinutes) || 60,
      description: body.description || "",
      storeId,
    });
    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}