import { SignJWT, jwtVerify, decodeProtectedHeader, importX509 } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFirebaseAuth } from "@/app/lib/firebaseAdmin";

export const SESSION_COOKIE = "b2c_session";
export const SESSION_DURATION_SECONDS = Number(
  process.env.SESSION_DURATION_SECONDS || 3600
);

const FIREBASE_CERTS_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CERTS_TTL_MS = 60 * 60 * 1000;

let cachedCerts = null;
let cachedCertsAt = 0;

async function getFirebaseCerts() {
  const now = Date.now();
  if (cachedCerts && now - cachedCertsAt < CERTS_TTL_MS) return cachedCerts;
  const res = await fetch(FIREBASE_CERTS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Unable to fetch Firebase signing keys");
  cachedCerts = await res.json();
  cachedCertsAt = now;
  return cachedCerts;
}

async function verifyWithFirebaseCerts(idToken) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const { kid } = decodeProtectedHeader(idToken);
  const certs = await getFirebaseCerts();
  const pem = certs[kid];
  if (!pem) throw new Error("Firebase signing key not found");

  const key = await importX509(pem, "RS256");
  const { payload } = await jwtVerify(idToken, key, {
    algorithms: ["RS256"],
  });

  if (payload.aud !== projectId) throw new Error("Invalid token audience");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("Invalid token issuer");
  }

  return {
    uid: payload.uid || payload.sub,
    phone: payload.phone_number || "",
    email: payload.email || "",
    name: payload.name || "",
  };
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in environment");
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(user) {
  const iat = Math.floor(Date.now() / 1000);
  return new SignJWT({
    uid: user.uid,
    role: user.role || "customer",
    name: user.name || "",
    phone: user.phone || "",
    email: user.email || "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(iat + SESSION_DURATION_SECONDS)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionPayload() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function getRequestUser(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export function requireAuth(request) {
  return getRequestUser(request);
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function verifyIdToken(idToken) {
  if (!idToken) return null;

  const fbAuth = getFirebaseAuth();
  if (fbAuth) {
    try {
      const decoded = await fbAuth.verifyIdToken(idToken);
      return {
        uid: decoded.uid,
        phone: decoded.phone_number || "",
        email: decoded.email || "",
        name: decoded.name || "",
      };
    } catch {
      // fall through to direct signature verification
    }
  }

  return verifyWithFirebaseCerts(idToken);
}

export function unauthorized(message = "Not authenticated") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = "You don't have permission to do this") {
  return NextResponse.json({ error: message }, { status: 403 });
}
