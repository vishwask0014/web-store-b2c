import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const email = searchParams.get("email");

    if (uid) {
      const user = await User.findOne({ uid });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json(user);
    }

    if (email) {
      const user = await User.findOne({ email });
      return NextResponse.json(user);
    }

    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { uid, name, email, role } = body;

    if (!uid || !name || !email) {
      return NextResponse.json({ error: "uid, name, and email are required" }, { status: 400 });
    }

    const existing = await User.findOne({ uid });
    if (existing) {
      const updated = await User.findOneAndUpdate({ uid }, { name, email, role: role || "customer" }, { new: true });
      return NextResponse.json(updated);
    }

    const user = await User.create({
      uid,
      name,
      email,
      role: role || "customer",
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { uid, ...updates } = body;

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate({ uid }, updates, { new: true, runValidators: true });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}