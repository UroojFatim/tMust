import crypto from "crypto";
import { NextRequest } from "next/server";

const SESSION_COOKIE = "inventory_session";

function getSecret() {
  return process.env.INVENTORY_SESSION_SECRET || "dev-inventory-secret";
}

export function getAdminCredentials() {
  return {
    username: process.env.INVENTORY_ADMIN_USERNAME || "admin",
    password: process.env.INVENTORY_ADMIN_PASSWORD || "admin123",
  };
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function encode(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decode<T>(value: string): T {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as T;
}

export function createSessionToken(payload: Record<string, unknown>) {
  const data = encode(payload);
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  const expected = sign(data);
  if (signature.length !== expected.length) return null;
  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
  if (!valid) return null;
  return decode<Record<string, unknown>>(data);
}

export function getInventorySession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
