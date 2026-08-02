import { connectDB } from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import Product from "@/app/models/Product";
import Order from "@/app/models/Order";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized } from "@/app/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ reviews: [] });

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json({ reviews });
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
    const { userId, productId, orderId, rating, comment } = body;

    if (!userId || userId !== session.uid) {
      return NextResponse.json({ error: "Invalid user." }, { status: 403 });
    }
    if (!productId) {
      return NextResponse.json({ error: "productId is required." }, { status: 400 });
    }
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const product = await Product.findOne({ uniqueProductId: productId });
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    let verified = false;
    if (orderId) {
      const order = await Order.findOne({ orderId, userId, paid: true, status: "delivered" });
      verified = Boolean(order && order.items.some((i) => i.productId === productId));
      if (!verified) {
        return NextResponse.json(
          { error: "Only verified buyers who received this product can review it." },
          { status: 403 }
        );
      }
    } else {
      const delivered = await Order.findOne({
        userId,
        paid: true,
        status: "delivered",
        "items.productId": productId,
      });
      verified = Boolean(delivered);
      if (!verified) {
        return NextResponse.json(
          { error: "Only verified buyers who received this product can review it." },
          { status: 403 }
        );
      }
    }

    const review = await Review.findOneAndUpdate(
      { productId, userId },
      {
        $set: {
          orderId: orderId || "",
          customerName: session.name || "Customer",
          rating: r,
          comment: String(comment || "").trim(),
        },
      },
      { new: true, upsert: true }
    );

    const stats = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    product.ratingAvg = Math.round((stats[0]?.avg || r) * 10) / 10;
    product.ratingCount = stats[0]?.count || 1;
    await product.save();

    return NextResponse.json({ review, ratingAvg: product.ratingAvg, ratingCount: product.ratingCount });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
