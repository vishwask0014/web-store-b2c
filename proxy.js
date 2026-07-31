import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "b2c_session";
const SELLER_ROLES = ["seller", "operator", "admin"];

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

async function getSessionPayload(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const payload = await getSessionPayload(request);
  const isApi = pathname.startsWith("/api/");

  if (!payload) {
    if (isApi) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const url = new URL("/auth", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/dashboard") && !SELLER_ROLES.includes(payload.role)) {
    if (isApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/shop/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile-settings/:path*",
    "/dashboard/:path*",
    "/api/cart/:path*",
    "/api/orders/:path*",
    "/api/users/:path*",
  ],
};
