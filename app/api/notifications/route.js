import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Notification from "@/app/models/Notification";
import User from "@/app/models/User";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";

export async function GET(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    const query = { userId: session.uid };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    const unreadCount = await Notification.countDocuments({
      userId: session.uid,
      read: false,
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();
    if (session.role !== "admin") {
      return forbidden("Only admins can send notifications");
    }

    await connectDB();
    const body = await req.json();
    const { userId, allSellers, title, message, link = "", type = "admin" } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "title and message are required" },
        { status: 400 }
      );
    }

    let recipients = [];
    if (allSellers) {
      const sellers = await User.find({ role: { $in: ["seller", "operator"] } });
      recipients = sellers.map((s) => s.uid);
    } else if (userId) {
      recipients = [userId];
    } else {
      return NextResponse.json(
        { error: "userId or allSellers is required" },
        { status: 400 }
      );
    }

    const docs = recipients.map((uid) => ({
      userId: uid,
      type,
      title,
      message,
      link,
      read: false,
    }));
    const created = await Notification.insertMany(docs);

    return NextResponse.json({ created: created.length }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
