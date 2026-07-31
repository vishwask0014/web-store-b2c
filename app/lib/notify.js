import { connectDB } from "@/app/lib/mongodb";
import Notification from "@/app/models/Notification";

export async function createNotification({ userId, type = "system", title, message, link = "" }) {
  if (!userId || !title || !message) return null;
  try {
    await connectDB();
    return Notification.create({ userId, type, title, message, link, read: false });
  } catch {
    return null;
  }
}
