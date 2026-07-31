import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { NextResponse } from "next/server";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";

function getCardBrand(cardNumber) {
  const n = (cardNumber || "").replace(/\s+/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6(?:011|5)/.test(n)) return "Discover";
  return "Card";
}

export async function GET(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    const email = searchParams.get("email");

    if (uid) {
      if (uid !== session.uid && session.role !== "admin") return forbidden();
      const user = await User.findOne({ uid });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json(user);
    }

    if (email) {
      if (email !== session.email && session.role !== "admin") return forbidden();
      const user = await User.findOne({ email });
      return NextResponse.json(user);
    }

    if (session.role !== "admin") {
      return forbidden("Only admins can list users");
    }

    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();
    if (session.role !== "admin") return forbidden();

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
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const body = await req.json();
    const { uid, ...updates } = body;

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 });
    }

    if (uid !== session.uid && session.role !== "admin") {
      return forbidden("You can only update your own profile");
    }

    const user = await User.findOne({ uid });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (updates.addCard) {
      const { cardNumber, holderName, expiry } = updates.addCard;
      const digits = (cardNumber || "").replace(/\s+/g, "");
      if (!/^\d{13,19}$/.test(digits)) {
        return NextResponse.json({ error: "Enter a valid card number (13–19 digits)." }, { status: 400 });
      }
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(expiry || "")) {
        return NextResponse.json({ error: "Enter a valid expiry (MM/YY)." }, { status: 400 });
      }
      const card = {
        brand: getCardBrand(digits),
        last4: digits.slice(-4),
        holderName: holderName || "",
        expiry: expiry.replace(/\s+/g, ""),
      };
      user.paymentMethods.push(card);
      if (!user.defaultPaymentMethod) {
        user.defaultPaymentMethod = String(card._id);
      }
      delete updates.addCard;
    }

    if (updates.removeCard) {
      const removedId = String(updates.removeCard);
      const wasDefault = user.defaultPaymentMethod === removedId;
      user.paymentMethods = user.paymentMethods.filter((c) => String(c._id) !== removedId);
      if (wasDefault) {
        user.defaultPaymentMethod = user.paymentMethods.length
          ? String(user.paymentMethods[0]._id)
          : "";
      }
      delete updates.removeCard;
    }

    if (updates.defaultPaymentMethod) {
      const exists = user.paymentMethods.some((c) => String(c._id) === String(updates.defaultPaymentMethod));
      if (!exists) {
        return NextResponse.json({ error: "Payment method not found." }, { status: 400 });
      }
      user.defaultPaymentMethod = String(updates.defaultPaymentMethod);
      delete updates.defaultPaymentMethod;
    }

    if (updates.autoPay !== undefined) {
      user.autoPay = Boolean(updates.autoPay);
      delete updates.autoPay;
    }

    if (updates.location) {
      user.location = { ...(user.location || {}), ...updates.location };
      delete updates.location;
    }

    const allowed = ["name", "phone", "email"];
    Object.keys(updates).forEach((key) => {
      if (allowed.includes(key)) user[key] = updates[key];
    });

    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        return NextResponse.json(
          { error: "That email or phone number is already in use." },
          { status: 409 }
        );
      }
      throw err;
    }
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}