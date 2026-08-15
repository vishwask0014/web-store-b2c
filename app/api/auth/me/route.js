import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { getSessionPayload, unauthorized } from "@/app/lib/auth";

export async function GET() {
  try {
    console.log('[/api/auth/me] Checking session...');
    const payload = await getSessionPayload();
    
    if (!payload) {
      console.log('[/api/auth/me] No session payload found');
      return unauthorized();
    }

    console.log('[/api/auth/me] Session payload found for uid:', payload.uid);
    
    await connectDB();
    const user = await User.findOne({ uid: payload.uid });

    if (!user) {
      console.log('[/api/auth/me] User not found in database');
      return NextResponse.json(
        { error: "Account no longer exists. Please sign in again." },
        { status: 401 }
      );
    }

    console.log('[/api/auth/me] User found:', user.email || user.uid);
    return NextResponse.json({ user });
  } catch (err) {
    console.error('[/api/auth/me] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
