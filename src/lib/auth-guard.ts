import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/types";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    console.warn("⚠️ Unauthorized access attempt - redirecting to login");
    redirect("/login");
  }
  console.log(`✅ Auth check passed for user: ${session.user.email}`);
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  const userRole = session.user.role as Role;
  
  if (!allowedRoles.includes(userRole)) {
    console.warn(`⚠️ Role mismatch - User: ${userRole}, Required: ${allowedRoles.join(", ")} - redirecting to login`);
    redirect("/login");
  }
  
  console.log(`✅ Role check passed - User: ${userRole}, Allowed: ${allowedRoles.join(", ")}`);
  return session;
}

export async function requireStudent() {
  console.log("🔒 Checking STUDENT access...");
  return requireRole(["STUDENT"]);
}

export async function requireInstructor() {
  console.log("🔒 Checking INSTRUCTOR access...");
  return requireRole(["INSTRUCTOR", "SUPER_ADMIN"]);
}

export async function requireSuperAdmin() {
  console.log("🔒 Checking SUPER_ADMIN access...");
  return requireRole(["SUPER_ADMIN"]);
}
