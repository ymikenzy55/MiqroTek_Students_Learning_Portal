import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isLoginPage = pathname === "/login";
  const isForgotPasswordPage = pathname === "/forgot-password" || pathname === "/reset-password";
  const isPublicPage = pathname === "/" || isLoginPage || isForgotPasswordPage || pathname.startsWith("/api/auth") || pathname.startsWith("/api/forgot-password") || pathname.startsWith("/api/reset-password");

  if (isPublicPage) {
    if (isLoginPage && session?.user) {
      const role = session.user.role;
      if (role === "STUDENT") return NextResponse.redirect(new URL("/student", req.url));
      if (role === "INSTRUCTOR") return NextResponse.redirect(new URL("/instructor", req.url));
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
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

  if (instructorRoutes && role !== "INSTRUCTOR" && role !== "SUPER_ADMIN") {
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
