import { connectDB } from "@/app/lib/mongodb";
import Store from "@/app/models/Store";
import { getSellerUser, sellerDenied } from "@/app/lib/roles";
import { NextResponse } from "next/server";
import crypto from "crypto";

function generateId() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const filter = ownerId ? { ownerId } : {};
    const stores = await Store.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(stores);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { ownerId, category } = body;

    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID is required." }, { status: 400 });
    }

    const seller = await getSellerUser(ownerId);
    if (!seller) {
      return sellerDenied("create stores");
    }

    const existingStores = await Store.find({ ownerId });

    if (existingStores.length >= 2) {
      return NextResponse.json(
        { error: "You can only create up to 2 stores per account." },
        { status: 400 }
      );
    }

    const sameCategory = existingStores.find(
      (s) => s.category.toLowerCase() === category.toLowerCase()
    );
    if (sameCategory) {
      return NextResponse.json(
        { error: `You already have a store in "${category}" category. Each store must have a different category.` },
        { status: 400 }
      );
    }

    const store = await Store.create({
      ...body,
      uniqueStoreId: generateId(),
    });
    return NextResponse.json(store, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}