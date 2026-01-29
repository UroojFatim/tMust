import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminCredentials,
  getSessionCookieName,
} from "@/lib/inventoryAuth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const admin = getAdminCredentials();

  if (username !== admin.username || password !== admin.password) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = createSessionToken({ username, iat: Date.now() });
  const response = NextResponse.json({ ok: true, username });
  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return response;
}
