import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { createNotification } from "@/actions/notification-actions";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "STUDENT",
        studentProfile: {
          create: {},
        },
      },
    });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    sendWelcomeEmail(email, name).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

    // Notify all super admins about the new student
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });
    for (const admin of superAdmins) {
      createNotification({
        userId: admin.id,
        type: "student_new",
        title: "New Student Registered",
        body: `${name} (${email}) just joined Miqrotek.`,
        href: "/instructor/students",
      }).catch((err) => console.error("Failed to create notification:", err));
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
