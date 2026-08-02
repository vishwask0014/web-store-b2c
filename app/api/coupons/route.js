import { connectDB } from "@/app/lib/mongodb";
import Coupon from "@/app/models/Coupon";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";
import { findCoupon, couponError, computeCouponDiscount } from "@/app/lib/checkout";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const subtotalParam = searchParams.get("subtotal");

    if (code) {
      const coupon = await findCoupon(code);
      if (!coupon) return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
      const subtotal = Number(subtotalParam) || 0;
      const invalid = couponError(coupon, subtotal);
      if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });
      return NextResponse.json({
        coupon: {
          code: coupon.code,
          title: coupon.title,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          maxDiscount: coupon.maxDiscount,
          minOrder: coupon.minOrder,
          discount: computeCouponDiscount(coupon, subtotal),
        },
      });
    }

    const session = await getRequestUser(req);
    if (!session) return unauthorized();
    if (session.role !== "admin") return forbidden("Only admins can list coupons.");
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();
    if (session.role !== "admin") return forbidden("Only admins can create coupons.");

    await connectDB();
    const body = await req.json();
    const { code, title, description, type, value, minOrder, maxDiscount, maxUses, expiresAt } = body;

    if (!code || !String(code).trim()) {
      return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
    }
    if (!["percent", "flat"].includes(type)) {
      return NextResponse.json({ error: "Type must be percent or flat." }, { status: 400 });
    }
    const val = Number(value);
    if (!val || val <= 0 || (type === "percent" && val > 100)) {
      return NextResponse.json({ error: "Invalid coupon value." }, { status: 400 });
    }

    const exists = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
    if (exists) return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });

    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      title: String(title || "").trim(),
      description: String(description || "").trim(),
      type,
      value: val,
      minOrder: Math.max(0, Number(minOrder) || 0),
      maxDiscount: Math.max(0, Number(maxDiscount) || 0),
      maxUses: Math.max(0, Number(maxUses) || 0),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: session.uid,
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();
    if (session.role !== "admin") return forbidden("Only admins can update coupons.");

    await connectDB();
    const body = await req.json();
    const { code } = body;
    if (!code) return NextResponse.json({ error: "code is required." }, { status: 400 });

    const updates = {};
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (body.expiresAt) updates.expiresAt = new Date(body.expiresAt);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const coupon = await Coupon.findOneAndUpdate(
      { code: String(code).trim().toUpperCase() },
      { $set: updates },
      { new: true }
    );
    if (!coupon) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    return NextResponse.json(coupon);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();
    if (session.role !== "admin") return forbidden("Only admins can delete coupons.");

    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "code is required." }, { status: 400 });

    const deleted = await Coupon.findOneAndDelete({ code: String(code).trim().toUpperCase() });
    if (!deleted) return NextResponse.json({ error: "Coupon not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
