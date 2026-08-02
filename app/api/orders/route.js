import { connectDB } from "@/app/lib/mongodb";
import Order from "@/app/models/Order";
import Cart from "@/app/models/Cart";
import Store from "@/app/models/Store";
import User from "@/app/models/User";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";
import { createNotification } from "@/app/lib/notify";
import { getRazorpay, isRazorpayConfigured, buildSettlements, isSimulatedPaymentId, simulatedPayment } from "@/app/lib/razorpay";
import { computeCartTotals, findCoupon, couponError, computeCouponDiscount } from "@/app/lib/checkout";

export async function GET(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const sellerId = searchParams.get("sellerId");

    let orders;
    if (sellerId) {
      if (sellerId !== session.uid && session.role !== "admin") return forbidden();
      const stores = await Store.find({ ownerId: sellerId });
      const storeIds = stores.map((s) => s.uniqueStoreId);
      orders = await Order.find({ "items.storeId": { $in: storeIds } }).sort({ createdAt: -1 });
    } else if (userId) {
      if (userId !== session.uid && session.role !== "admin") return forbidden();
      orders = await Order.find({ userId }).sort({ createdAt: -1 });
    } else {
      if (session.role !== "admin") return forbidden();
      orders = await Order.find().sort({ createdAt: -1 });
    }
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const body = await req.json();
    const { userId, location, paymentMethodId, autoPay, razorpayOrderId, razorpayPaymentId, amountMinor, couponCode } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }

    const [user, cart] = await Promise.all([
      User.findOne({ uid: userId }),
      Cart.findOne({ userId }),
    ]);

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let razorpayVerified = null;
    if (razorpayPaymentId) {
      if (isSimulatedPaymentId(razorpayPaymentId)) {
        razorpayVerified = simulatedPayment(razorpayPaymentId, amountMinor);
      } else {
        if (!isRazorpayConfigured()) {
          return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
        }
        const rzp = getRazorpay();
        const payment = await rzp.payments.fetch(razorpayPaymentId);
        const orderOk = !razorpayOrderId || payment.order_id === razorpayOrderId;
        const amountOk = !amountMinor || Number(payment.amount) === Number(amountMinor);
        if (!orderOk || !amountOk || !["captured", "authorized"].includes(payment.status)) {
          return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
        }
        razorpayVerified = payment;
      }
    }

    let payment = null;
    if (paymentMethodId) {
      payment = user.paymentMethods.find((c) => String(c._id) === String(paymentMethodId));
      if (!payment) {
        return NextResponse.json({ error: "Selected payment method not found." }, { status: 400 });
      }
    } else if (user.defaultPaymentMethod) {
      payment = user.paymentMethods.find((c) => String(c._id) === String(user.defaultPaymentMethod));
    }
    if (!payment && !razorpayVerified) {
      return NextResponse.json(
        { error: "No payment method on file. Add a card or UPI ID in your profile first." },
        { status: 400 }
      );
    }

    const { items, subtotal, serviceTotal, deliveryFee } = await computeCartTotals(cart.items);

    let coupon = null;
    let discount = 0;
    if (couponCode) {
      coupon = await findCoupon(couponCode);
      const invalid = couponError(coupon, subtotal);
      if (invalid) {
        return NextResponse.json({ error: invalid }, { status: 400 });
      }
      discount = computeCouponDiscount(coupon, subtotal);
    }

    const total = Math.max(0, subtotal + serviceTotal - discount + deliveryFee);

    const order = await Order.create({
      orderId: crypto.randomBytes(4).toString("hex").toUpperCase(),
      userId,
      customerName: user.name || "",
      customerEmail: user.email || "",
      customerPhone: user.phone || "",
      items,
      subtotal,
      serviceTotal,
      discount,
      couponCode: coupon ? coupon.code : "",
      deliveryFee,
      total,
      currency: "USD",
      deliveryLocation: location || user.location || {},
      paymentMethod: razorpayVerified
        ? {
            type: "razorpay",
            brand: "Razorpay",
            last4: razorpayVerified.card?.last4 || "",
            holderName: user.name || "",
            expiry: "",
          }
        : {
            type: payment.type || "card",
            upiId: payment.upiId || "",
            brand: payment.brand || "",
            last4: payment.last4 || "",
            holderName: payment.holderName || "",
            expiry: payment.expiry || "",
          },
      paid: Boolean(razorpayVerified),
      razorpayOrderId: razorpayOrderId || "",
      razorpayPaymentId: razorpayPaymentId || "",
      autoPaid: Boolean(autoPay),
      status: razorpayVerified ? "confirmed" : "pending",
      confirmedAt: razorpayVerified ? new Date().toISOString() : "",
    });

    const nowIso = new Date().toISOString();
    const statsById = {};
    for (const it of items) {
      const productId = String(it.productId);
      if (!statsById[productId]) statsById[productId] = { qty: 0, amount: 0 };
      statsById[productId].qty += it.quantity;
      statsById[productId].amount += it.quantity * it.price;
    }
    const productIds = Object.keys(statsById);
    const productDocs = await Product.find({ uniqueProductId: { $in: productIds } });
    for (const doc of productDocs) {
      const s = statsById[doc.uniqueProductId];
      if (!s) continue;
      doc.unitsSold += s.qty;
      doc.orderCount += 1;
      doc.revenue += s.amount;
      doc.lastOrderAt = nowIso;
      const cartItem = (cart.items || []).find((i) => i.productId === doc.uniqueProductId);
      if (cartItem && cartItem.addedAt) {
        const dwellMs = Date.now() - new Date(cartItem.addedAt).getTime();
        doc.cartDwellMinutes += Math.max(0, Math.round(dwellMs / 60000));
        doc.cartDwellCount += 1;
      }
      await doc.save();
    }

    const storeIds = [...new Set(items.map((i) => i.storeId))];
    const stores = await Store.find({ uniqueStoreId: { $in: storeIds } });
    order.settlements = buildSettlements(
      order,
      new Map(stores.map((s) => [s.uniqueStoreId, s]))
    );
    await order.save();

    cart.items = [];
    await cart.save();
    const owners = {};
    for (const store of stores) {
      if (!owners[store.ownerId]) owners[store.ownerId] = [];
      owners[store.ownerId].push(store.name);
    }
    for (const [ownerId, storeNames] of Object.entries(owners)) {
      await createNotification({
        userId: ownerId,
        type: "order_new",
        title: "New order received",
        message: `Order #${order.orderId} includes items from ${storeNames.join(", ")}.`,
        link: "/dashboard/orders",
      });
    }
    await createNotification({
      userId,
      type: "order_new",
      title: "Order placed",
      message: `Your order #${order.orderId} was placed successfully.`,
      link: "/orders",
    });

    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}