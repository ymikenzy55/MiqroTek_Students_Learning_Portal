import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@miqrotek.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@miqrotek.com",
      phone: "+233 000 000 001",
      passwordHash,
      role: "SUPER_ADMIN",
      instructorProfile: {
        create: {
          title: "Administrator",
          bio: "Platform super administrator with instructor capabilities.",
        },
      },
    },
  });

  // Instructor
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@miqrotek.com" },
    update: {},
    create: {
      name: "John Instructor",
      email: "instructor@miqrotek.com",
      phone: "+233 000 000 002",
      passwordHash,
      role: "INSTRUCTOR",
      instructorProfile: {
        create: {
          title: "Senior Instructor",
          bio: "Experienced software development instructor.",
        },
      },
    },
  });

  // Student
  const student = await prisma.user.upsert({
    where: { email: "student@miqrotek.com" },
    update: {},
    create: {
      name: "Jane Student",
      email: "student@miqrotek.com",
      phone: "+233 000 000 003",
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {},
      },
    },
  });

  // Sample courses created by instructors
  const courseData = [
    {
      title: "Introduction to Web Development",
      description:
        "Learn the fundamentals of HTML, CSS and JavaScript to build responsive, modern websites from scratch.",
      price: 450,
      duration: "8 weeks",
      instructorId: instructor.id,
      topics: ["HTML Foundations", "CSS Layouts & Flexbox", "JavaScript Basics", "DOM Manipulation"],
    },
    {
      title: "Python for Data Analysis",
      description:
        "Master Python, Pandas and NumPy to clean, analyse and visualise real-world datasets with confidence.",
      price: 600,
      duration: "10 weeks",
      instructorId: instructor.id,
      topics: ["Python Essentials", "Working with Pandas", "Data Visualisation", "Statistical Analysis"],
    },
    {
      title: "UI/UX Design Fundamentals",
      description:
        "Understand design thinking, wireframing and prototyping to craft interfaces users genuinely enjoy.",
      price: 0,
      duration: "6 weeks",
      instructorId: admin.id,
      topics: ["Design Thinking", "Wireframing", "Prototyping in Figma"],
    },
  ];

  for (const course of courseData) {
    const existing = await prisma.course.findFirst({
      where: { title: course.title, instructorId: course.instructorId },
    });
    if (existing) continue;

    await prisma.course.create({
      data: {
        title: course.title,
        description: course.description,
        price: course.price,
        currency: "GHS",
        status: "ACTIVE",
        duration: course.duration,
        instructorId: course.instructorId,
        weeklyTopics: {
          create: course.topics.map((title, i) => ({
            weekNumber: i + 1,
            title,
          })),
        },
      },
    });
  }

  console.log("Seed data created:");
  console.log(`  Super Admin: ${admin.email} (password: password123)`);
  console.log(`  Instructor:  ${instructor.email} (password: password123)`);
  console.log(`  Student:     ${student.email} (password: password123)`);
  console.log(`  Courses:     ${courseData.length} sample courses`);
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
