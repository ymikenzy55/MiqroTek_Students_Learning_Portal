import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 Authentication attempt for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.warn("⚠️ Missing credentials");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            console.warn(`⚠️ User not found or no password set: ${email}`);
            return null;
          }

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            console.warn(`⚠️ Invalid password for: ${email}`);
            return null;
          }

          console.log(`✅ Authentication successful for: ${email} (Role: ${user.role})`);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
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
