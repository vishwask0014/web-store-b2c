import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Notification from "@/app/models/Notification";
import { getRequestUser, unauthorized, forbidden } from "@/app/lib/auth";

export async function PUT(req, { params }) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { notificationId } = await params;
    const body = await req.json();
    const notification = await Notification.findOne({ _id: notificationId });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    if (notification.userId !== session.uid && session.role !== "admin") {
      return forbidden();
    }

    if (typeof body.read === "boolean") {
      notification.read = body.read;
    }
    await notification.save();
    return NextResponse.json(notification);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getRequestUser(req);
    if (!session) return unauthorized();

    await connectDB();
    const { notificationId } = await params;
    const notification = await Notification.findOne({ _id: notificationId });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    if (notification.userId !== session.uid && session.role !== "admin") {
      return forbidden();
    }

    await notification.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
