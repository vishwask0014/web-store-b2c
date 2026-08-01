import { connectDB } from "@/app/lib/mongodb";
import Cart from "@/app/models/Cart";
import Product from "@/app/models/Product";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized } from "@/app/lib/auth";
import { getRazorpay, isRazorpayConfigured, CURRENCY } from "@/app/lib/razorpay";

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." },
        { status: 503 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { userId } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }

    const [user, cart] = await Promise.all([User.findOne({ uid: userId }), Cart.findOne({ userId })]);

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    let total = 0;
    for (const item of cart.items) {
      const product = await Product.findOne({ uniqueProductId: item.productId });
      if (!product || product.isActive === false) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available.` },
          { status: 400 }
        );
      }
      const qty = Math.min(item.quantity, product.quantity);
      if (qty <= 0) {
        return NextResponse.json({ error: `Product "${item.name}" is out of stock.` }, { status: 400 });
      }
      total += product.price * qty + (item.serviceCharge || 0) * qty;
    }

    const amountMinor = Math.round(total * 100);
    const receipt = `order_${Date.now()}`;
    const rzp = getRazorpay();
    const razorpayOrder = await rzp.orders.create({
      amount: amountMinor,
      currency: CURRENCY,
      receipt,
      notes: { userId, name: user?.name || "" },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amountMinor,
      currency: CURRENCY,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      receipt,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
