import { connectDB } from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Store from "@/app/models/Store";
import { getSellerUser, sellerDenied } from "@/app/lib/roles";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";
import { createNotification } from "@/app/lib/notify";
import { processDeliveredPayouts } from "@/app/lib/razorpay";

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

    if (body.action === "cancel") {
      if (session.uid !== String(order.userId) && session.role !== "admin") return forbidden();
      if (!["pending", "confirmed"].includes(order.status)) {
        return NextResponse.json(
          { error: "This order can no longer be cancelled — it is already in transit." },
          { status: 400 }
        );
      }
      order.status = "cancelled";
      order.cancellation = {
        reason: String(body.reason || "No reason provided").trim(),
        by: session.uid === String(order.userId) ? "customer" : "admin",
        at: new Date().toISOString(),
        refundNote: order.paid ? "Refund initiated for the paid amount." : "No payment was captured.",
      };
      await order.save();

      const stores = await Store.find({ uniqueStoreId: { $in: order.items.map((i) => i.storeId) } });
      const owners = [...new Set(stores.map((s) => s.ownerId))];
      for (const ownerId of owners) {
        await createNotification({
          userId: ownerId,
          type: "order_status",
          title: "Order cancelled",
          message: `Order #${order.orderId} was cancelled${order.cancellation.reason ? ` — ${order.cancellation.reason}` : ""}.`,
          link: "/dashboard/orders",
        });
      }
      await createNotification({
        userId: String(order.userId),
        type: "order_status",
        title: "Order cancelled",
        message: `Order #${order.orderId} has been cancelled.${order.paid ? " Your refund has been initiated." : ""}`,
        link: "/orders",
      });
      return NextResponse.json(order);
    }

    const isSellerUpdate = Boolean(
      body.status || (body.shipping && (body.shipping.courier || body.shipping.trackingNumber))
    );

    if (!isSellerUpdate) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    if (body.sellerId !== session.uid && session.role !== "admin") {
      return forbidden();
    }
    const sellerId = body.sellerId;
    if (!sellerId) {
      return NextResponse.json({ error: "sellerId is required to update." }, { status: 400 });
    }
    const seller = await getSellerUser(sellerId);
    if (!seller) {
      return sellerDenied("update order status");
    }
    const stores = await Store.find({ ownerId: sellerId });
    const storeIds = stores.map((s) => s.uniqueStoreId);
    const myItemIndexes = order.items
      .map((item, idx) => (storeIds.includes(item.storeId) ? idx : -1))
      .filter((idx) => idx >= 0);
    if (!myItemIndexes.length) {
      return NextResponse.json(
        { error: "This order does not contain any items from your stores." },
        { status: 403 }
      );
    }

    if (body.shipping && (body.shipping.courier || body.shipping.trackingNumber)) {
      const tracking = {
        courier: body.shipping.courier || order.shipping?.courier || "",
        trackingNumber: body.shipping.trackingNumber || order.shipping?.trackingNumber || "",
        estimatedDelivery: body.shipping.estimatedDelivery || order.shipping?.estimatedDelivery || "",
      };
      order.shipping = tracking;
      for (const idx of myItemIndexes) {
        order.items[idx].tracking = { ...tracking };
      }
    }

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
      }
      order.status = body.status;

      if (body.status === "shipped") {
        if (!order.shippedAt) order.shippedAt = new Date().toISOString();
        for (const idx of myItemIndexes) {
          if (!order.items[idx].shippedAt) order.items[idx].shippedAt = new Date().toISOString();
        }
      }
      if (body.status === "delivered") {
        if (!order.deliveredAt) order.deliveredAt = new Date().toISOString();
        for (const idx of myItemIndexes) {
          if (!order.items[idx].deliveredAt) order.items[idx].deliveredAt = new Date().toISOString();
        }
      }

      if (body.status === "delivered" && order.settlements?.length) {
        const results = await processDeliveredPayouts(order);
        const byOwner = new Map(results.map((r) => [r.ownerId, r]));
        for (const settlement of order.settlements) {
          const result = byOwner.get(settlement.ownerId);
          if (!result) continue;
          settlement.status = result.status;
          settlement.payoutId = result.payoutId || settlement.payoutId;
          settlement.note = result.note || settlement.note;
          if (result.status === "initiated") settlement.paidAt = new Date().toISOString();
        }
      }

      await order.save();

      const notifyMessage =
        body.status === "shipped" && order.shipping?.trackingNumber
          ? `Your order #${order.orderId} is on the way via ${order.shipping.courier || "courier"} — tracking ${order.shipping.trackingNumber}.`
          : `Your order #${order.orderId} is now ${body.status}.`;
      await createNotification({
        userId: String(order.userId),
        type: "order_status",
        title: "Order updated",
        message: notifyMessage,
        link: "/orders",
      });
    } else {
      await order.save();

      await createNotification({
        userId: String(order.userId),
        type: "order_status",
        title: "Tracking added",
        message: `Tracking details added for order #${order.orderId} — ${order.shipping.courier || "courier"} ${order.shipping.trackingNumber}.`,
        link: "/orders",
      });
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}