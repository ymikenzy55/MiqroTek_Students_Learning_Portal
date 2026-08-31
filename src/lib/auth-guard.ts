import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Role } from "@/types";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role as Role)) {
    redirect("/login");
  }
  return session;
}

export async function requireStudent() {
  return requireRole(["STUDENT"]);
}

export async function requireInstructor() {
  return requireRole(["INSTRUCTOR", "SUPER_ADMIN"]);
}

export async function requireSuperAdmin() {
  return requireRole(["SUPER_ADMIN"]);
}
