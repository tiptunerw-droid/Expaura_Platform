import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip API routes, Next.js static assets, and images
  if (
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.match(/\.(png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await decryptSession(token).catch(() => null) : null;
  const response = NextResponse.next();

  // STRICT ADMIN RULE:
  // If the user is a SUPER_ADMIN and navigates to ANY page outside of the admin portals (/admin, /dashboard, etc)
  // their session is instantly destroyed for security reasons.
  if (session?.platformRole === "SUPER_ADMIN") {
    if (!pathname.startsWith("/admin") && !pathname.startsWith("/dashboard")) {
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && pathname !== "/admin/register") {
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.platformRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    if (session.platformRole === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
