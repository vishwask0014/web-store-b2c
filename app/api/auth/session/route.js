import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { verifyIdToken, signSessionToken, setSessionCookie } from "@/app/lib/auth";

export async function POST(req) {
  try {
    const { idToken, name } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing authentication token" }, { status: 400 });
    }

    const claims = await verifyIdToken(idToken);
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    await connectDB();

    let user = await User.findOne({ uid: claims.uid });

    if (!user) {
      if (claims.phone) {
        const taken = await User.findOne({ phone: claims.phone });
        if (taken) {
          return NextResponse.json(
            { error: "This phone number is already registered to another account." },
            { status: 409 }
          );
        }
      }
      if (claims.email) {
        const taken = await User.findOne({ email: claims.email });
        if (taken) {
          return NextResponse.json(
            { error: "This email is already registered to another account." },
            { status: 409 }
          );
        }
      }

      try {
        user = await User.create({
          uid: claims.uid,
          name: name || claims.name || "User",
          email: claims.email || undefined,
          phone: claims.phone || undefined,
          role: "customer",
        });
      } catch (err) {
        if (err.code === 11000) {
          return NextResponse.json(
            { error: "This email or phone number is already registered to another account." },
            { status: 409 }
          );
        }
        throw err;
      }
    } else {
      let dirty = false;

      if (name && name !== "User" && user.name !== name) {
        user.name = name;
        dirty = true;
      } else if (claims.name && user.name === "User") {
        user.name = claims.name;
        dirty = true;
      }

      if (claims.phone && user.phone !== claims.phone) {
        const taken = await User.findOne({ phone: claims.phone, uid: { $ne: user.uid } });
        if (taken) {
          return NextResponse.json(
            { error: "This phone number is already registered to another account." },
            { status: 409 }
          );
        }
        user.phone = claims.phone;
        dirty = true;
      }

      if (claims.email && user.email !== claims.email) {
        const taken = await User.findOne({ email: claims.email, uid: { $ne: user.uid } });
        if (!taken) {
          user.email = claims.email;
          dirty = true;
        }
      }

      if (dirty) {
        try {
          await user.save();
        } catch (err) {
          if (err.code === 11000) {
            return NextResponse.json(
              { error: "This email or phone number is already registered to another account." },
              { status: 409 }
            );
          }
          throw err;
        }
      }
    }

    console.log('[/api/auth/session] Creating session for user:', user.email || user.uid);
    const token = await signSessionToken(user);
    const response = NextResponse.json({ user });
    console.log('[/api/auth/session] Session token created, setting cookie');
    return setSessionCookie(response, token);
  } catch (err) {
    console.error("[/api/auth/session] ERROR:", err.stack || err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
