import { connectDB } from "@/app/lib/mongodb";
import Store from "@/app/models/Store";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";
import { deliveryEtaMinutes } from "@/app/lib/geo";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { storeId } = await params;
    const store = await Store.findOne({ uniqueStoreId: storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    const session = await getRequestUser(req);
    let userLoc = null;
    if (session) {
      const viewer = await User.findOne({ uid: session.uid }).lean();
      userLoc = viewer?.location || null;
    }

    return NextResponse.json({
      ...store.toObject(),
      etaMinutes: deliveryEtaMinutes(store, userLoc),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { storeId } = await params;
    const body = await req.json();
    const existing = await Store.findOne({ uniqueStoreId: storeId });
    if (!existing) return NextResponse.json({ error: "Store not found" }, { status: 404 });

    if (session.role !== "admin" && String(existing.ownerId) !== session.uid) {
      return forbidden("You can only edit your own stores.");
    }

    if (existing.disabled && body.disabled === false) {
      return NextResponse.json(
        { error: "Cannot re-enable a disabled store. Contact support at b2cstore.support@gmail.com." },
        { status: 400 }
      );
    }

    if (body.category && body.category.toLowerCase() !== existing.category.toLowerCase()) {
      const sameCategory = await Store.findOne({
        ownerId: existing.ownerId,
        uniqueStoreId: { $ne: storeId },
        category: { $regex: `^${body.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: "i" },
      });
      if (sameCategory) {
        return NextResponse.json(
          { error: `You already have a store in "${body.category}" category.` },
          { status: 400 }
        );
      }
    }

    const store = await Store.findOneAndUpdate(
      { uniqueStoreId: storeId },
      body,
      { new: true, runValidators: true }
    );
    return NextResponse.json(store);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { storeId } = await params;
    const store = await Store.findOneAndDelete({ uniqueStoreId: storeId });
    if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });
    return NextResponse.json({ message: "Store deleted" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}