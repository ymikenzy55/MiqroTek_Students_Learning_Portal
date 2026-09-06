import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PORTAL_ROLES, type Portal, type Role } from "@/types";

/**
 * Surfaced to the client as `signIn(...).code` so the login form can tell the
 * user which tab their account actually belongs to.
 */
export class PortalMismatchError extends CredentialsSignin {
  code: string;

  constructor(actualRole: Role) {
    super(`Account role ${actualRole} does not match the selected portal`);
    this.code = actualRole === "STUDENT" ? "student_account" : "staff_account";
  }
}

/**
 * How long a JWT may keep serving a cached role before it is re-checked against
 * the database. Keeps role changes and account deletions from lingering for the
 * full session lifetime without querying on every single request.
 */
const ROLE_SYNC_INTERVAL_MS = 5 * 60 * 1000;

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  logger: {
    // A rejected sign-in is an expected outcome, not a server fault — log it as
    // a warning so real errors stay visible in the noise.
    error(error) {
      if (error instanceof CredentialsSignin) {
        console.warn(`⚠️ Sign-in rejected (${error.code})`);
        return;
      }
      console.error(error);
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        console.log("🔐 Authentication attempt for:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.warn("⚠️ Missing credentials");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const portal = credentials.portal as Portal | undefined;

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.passwordHash) {
            console.warn(`⚠️ User not found or no password set: ${email}`);
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            console.warn(`⚠️ Invalid password for: ${email}`);
            return null;
          }
        } catch (error) {
          console.error("❌ Authentication error:", error);
          return null;
        }

        // Credentials are valid — now make sure the account matches the portal
        // the user picked, so a student cannot sign in through the instructor
        // tab (and vice versa).
        const role = user.role as Role;
        if (portal && PORTAL_ROLES[portal] !== role) {
          console.warn(`⚠️ Portal mismatch - ${email} is ${role}, portal "${portal}"`);
          throw new PortalMismatchError(role);
        }

        console.log(`✅ Authentication successful for: ${email} (Role: ${role})`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
        token.roleSyncedAt = Date.now();
        return token;
      }

      if (!token.id || Date.now() - (token.roleSyncedAt ?? 0) < ROLE_SYNC_INTERVAL_MS) {
        return token;
      }

      try {
        const current = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, name: true, email: true },
        });

        // The account is gone — drop the session instead of trusting the token.
        if (!current) {
          console.warn(`⚠️ Session user no longer exists: ${token.id}`);
          return null;
        }

        if (current.role !== token.role) {
          console.log(`🔄 Role changed for ${current.email}: ${token.role} → ${current.role}`);
        }

        token.role = current.role as Role;
        token.name = current.name;
        token.email = current.email;
        token.roleSyncedAt = Date.now();
      } catch (error) {
        // A transient database problem should not sign everybody out; keep the
        // cached role and retry on the next request.
        console.error("❌ Failed to refresh session role:", error);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});
