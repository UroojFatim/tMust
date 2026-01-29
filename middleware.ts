import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect all inventory routes
  if (pathname.startsWith("/inventory")) {
    // Check for inventory session cookie
    const sessionCookie = request.cookies.get("inventory_session");

    if (!sessionCookie) {
      // Redirect to inventory login page
      return NextResponse.redirect(new URL("/inventory", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/inventory/:path*"],
};
