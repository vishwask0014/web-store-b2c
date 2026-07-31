import User from "@/app/models/User";
import { NextResponse } from "next/server";

const SELLER_ROLES = ["seller", "operator", "admin"];

export async function getSellerUser(uid) {
  if (!uid) return null;
  const user = await User.findOne({ uid });
  if (user && SELLER_ROLES.includes(user.role)) return user;
  return null;
}

export function sellerDenied(action = "perform this action") {
  return NextResponse.json(
    { error: `Only seller accounts can ${action}.` },
    { status: 403 }
  );
}