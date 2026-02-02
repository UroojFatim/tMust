import { NextRequest, NextResponse } from "next/server";
import { getInventorySession } from "@/lib/inventoryAuth";

export async function GET(request: NextRequest) {
  const session = getInventorySession(request);
  if (!session || typeof session.username !== "string") {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, username: session.username });
}
