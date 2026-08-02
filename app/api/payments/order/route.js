import { connectDB } from "@/app/lib/mongodb";
import Cart from "@/app/models/Cart";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized } from "@/app/lib/auth";
import { getRazorpay, isRazorpayConfigured, CURRENCY } from "@/app/lib/razorpay";
import { computeCartTotals, findCoupon, couponError, computeCouponDiscount } from "@/app/lib/checkout";

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
    const { userId, couponCode } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }

    const [user, cart] = await Promise.all([User.findOne({ uid: userId }), Cart.findOne({ userId })]);

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const { subtotal, serviceTotal, deliveryFee } = await computeCartTotals(cart.items);

    let discount = 0;
    if (couponCode) {
      const coupon = await findCoupon(couponCode);
      const invalid = couponError(coupon, subtotal);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      discount = computeCouponDiscount(coupon, subtotal);
    }

    const total = Math.max(0, subtotal + serviceTotal - discount + deliveryFee);
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
