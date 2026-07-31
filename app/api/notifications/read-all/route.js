import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Notification from "@/app/models/Notification";
import { getRequestUser, unauthorized } from "@/app/lib/auth";

export async function PUT() {
  try {
    const session = await getRequestUser();
    if (!session) return unauthorized();

    await connectDB();
    const result = await Notification.updateMany(
      { userId: session.uid, read: false },
      { read: true }
    );

    return NextResponse.json({ ok: true, updated: result.modifiedCount });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
