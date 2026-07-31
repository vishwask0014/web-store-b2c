import { connectDB } from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Store from "@/app/models/Store";
import { getSellerUser, sellerDenied } from "@/app/lib/roles";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function GET(req, { params }) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { orderId } = await params;
    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isOwner = String(order.userId) === session.uid;
    if (!isOwner && session.role !== "admin") {
      const stores = await Store.find({ ownerId: session.uid });
      const storeIds = stores.map((s) => s.uniqueStoreId);
      const ownsAnyItem = order.items.some((i) => storeIds.includes(i.storeId));
      if (!ownsAnyItem) return forbidden();
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { orderId } = await params;
    const body = await req.json();
    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
      }
      if (body.sellerId !== session.uid && session.role !== "admin") {
        return forbidden();
      }
      const sellerId = body.sellerId;
      if (!sellerId) {
        return NextResponse.json({ error: "sellerId is required to update status." }, { status: 400 });
      }
      const seller = await getSellerUser(sellerId);
      if (!seller) {
        return sellerDenied("update order status");
      }
      const stores = await Store.find({ ownerId: sellerId });
      const storeIds = stores.map((s) => s.uniqueStoreId);
      const ownsAnyItem = order.items.some((i) => storeIds.includes(i.storeId));
      if (!ownsAnyItem) {
        return NextResponse.json(
          { error: "This order does not contain any items from your stores." },
          { status: 403 }
        );
      }
      order.status = body.status;
      await order.save();
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}