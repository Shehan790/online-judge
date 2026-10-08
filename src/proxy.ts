import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based protection for admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function above
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
