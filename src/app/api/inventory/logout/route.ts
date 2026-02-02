import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/inventoryAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
}
