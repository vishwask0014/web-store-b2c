import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/Product";
import Service from "@/app/models/Service";
import Store from "@/app/models/Store";
import { getSellerUser, sellerDenied } from "@/app/lib/roles";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { serviceId } = await params;

    const service = await Service.findById(serviceId);
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const store = await Store.findOne({ uniqueStoreId: service.storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const seller = await getSellerUser(store.ownerId);
    if (!seller) return sellerDenied("view linked products");

    const products = await Product.find({
      "services.serviceId": serviceId,
    }).sort({ createdAt: -1 });

    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
