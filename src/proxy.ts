import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password" || pathname === "/reset-password";
  const isPaymentPage = pathname.startsWith("/payment/");
  const isLegalPage = pathname === "/privacy" || pathname === "/terms";
  const isApiRoute = pathname.startsWith("/api/") && !pathname.startsWith("/api/auth");
  const isPublicPage = pathname === "/" || isLoginPage || isForgotPasswordPage || isPaymentPage || isLegalPage || pathname.startsWith("/api/auth") || pathname.startsWith("/api/forgot-password") || pathname.startsWith("/api/reset-password");

  // API routes (other than auth) handle their own auth/401 — don't redirect
  // them to the login HTML page, which would break SSE/EventSource clients.
  if (isApiRoute) {
    return NextResponse.next();
  }

  if (isPublicPage) {
    if (isLoginPage && session?.user) {
      const role = session.user.role;
      if (role === "STUDENT") return NextResponse.redirect(new URL("/student", req.url));
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/instructor", req.url));
    }
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.user.role;

  const studentRoutes = pathname.startsWith("/student");
  const instructorRoutes = pathname.startsWith("/instructor");
  const adminRoutes = pathname.startsWith("/admin");

  if (studentRoutes && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (instructorRoutes && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (adminRoutes && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons).*)"],
};
