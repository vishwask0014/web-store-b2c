import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { getSessionPayload, unauthorized } from "@/app/lib/auth";

export async function GET() {
  try {
    const payload = await getSessionPayload();
    if (!payload) return unauthorized();

    await connectDB();
    const user = await User.findOne({ uid: payload.uid });

    if (!user) {
      return NextResponse.json(
        { error: "Account no longer exists. Please sign in again." },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
