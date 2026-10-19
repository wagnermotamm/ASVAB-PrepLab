import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  locale: string;
};

const COOKIE = "preplab_session";
const GUEST_COOKIE = "preplab_guest";

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSession(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function readSessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  return payload as unknown as SessionUser;
}

export async function setSessionCookie(user: SessionUser) {
  const token = await signSession(user);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const session = await readSessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, role: true, locale: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSession();
  if (!user) {
    const error = new Error("UNAUTHENTICATED");
    throw error;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// Guest credentials have a separate signing key and cannot authenticate account APIs.
export async function requireStudyUser(create = false) {
  const account = await getSession();
  if (account) return { ...account, guest: false };
  const jar = await cookies();
  const token = jar.get(GUEST_COOKIE)?.value;
  const key = new Uint8Array([...secret(), ...new TextEncoder().encode(":guest-study")]);
  if (token) {
    try {
      const { payload } = await jwtVerify(token, key, { audience: "guest-study" });
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (user && (user.preferences as { guest?: boolean }).guest === true) {
        return { id: user.id, guest: true, locale: "en" };
      }
    } catch { /* Expired guest sessions can start again. */ }
  }
  if (!create) throw new Error("UNAUTHENTICATED");
  const user = await prisma.user.create({
    data: { name: "Guest", email: `${crypto.randomUUID()}@guest.invalid`, passwordHash: "!", preferences: { guest: true } },
  });
  const signed = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(user.id)
    .setAudience("guest-study").setIssuedAt().setExpirationTime("1d").sign(key);
  jar.set(GUEST_COOKIE, signed, { httpOnly: true, sameSite: "lax", secure: process.env.COOKIE_SECURE === "true", path: "/", maxAge: 86400 });
  return { id: user.id, guest: true, locale: "en" };
}
