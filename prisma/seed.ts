import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Clearing existing database data...");

  // Wipe database tables in reverse dependency order
  await prisma.attendanceRecord.deleteMany();
  await prisma.attendanceSession.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.weeklyTopic.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.bundleAssignment.deleteMany();
  await prisma.bundleRequirement.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.course.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.instructorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Database cleared successfully. Seeding initial data...");

  // Super Admin Instructor Credentials requested by user
  const instructorPasswordHash = await bcrypt.hash("!@Firatata45", 10);
  const studentPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Create Super Admin Instructor
  const superAdmin = await prisma.user.create({
    data: {
      name: "Michael Yeboah",
      email: "yeboahmichael977@gmail.com",
      phone: "+233 24 000 0000",
      passwordHash: instructorPasswordHash,
      role: "SUPER_ADMIN",
      instructorProfile: {
        create: {
          title: "Lead Technical Instructor & Super Admin",
          bio: "Super Admin and Lead Instructor specializing in Full-Stack Web Development, Software Architecture, and Cloud Systems.",
        },
      },
      studentProfile: {
        create: {
          bio: "Super Admin account",
        },
      },
    },
  });

  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 2. Create Sample Student registered under instructor
  const student = await prisma.user.create({
    data: {
      name: "Kwame Mensah",
      email: "student@miqrotek.com",
      phone: "+233 55 123 4567",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          bio: "Passionate web development student learning modern technologies.",
        },
      },
    },
  });

  console.log(`✅ Demo Student created: ${student.email}`);

  // 3. Create Courses with images, durations, prices, and weekly topics
  const courseData = [
    {
      title: "Full-Stack Web Development Bootcamp",
      description: "Comprehensive bootcamp covering modern HTML5, CSS3, React 19, Next.js 16, TypeScript, Node.js, and PostgreSQL Prisma ORM.",
      price: 850,
      currency: "GHS",
      duration: "12 Weeks",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      instructorId: superAdmin.id,
      topics: [
        { weekNumber: 1, title: "HTML5 & Modern Semantic Web", description: "Semantic markup, accessibility standards, and SEO fundamentals." },
        { weekNumber: 2, title: "CSS3 Grid, Flexbox & Responsive Layouts", description: "Mastering layout systems, CSS variables, and modern styling." },
        { weekNumber: 3, title: "JavaScript ES6+ & Async Programming", description: "Promises, async/await, DOM manipulation, and closure concepts." },
        { weekNumber: 4, title: "React 19 Fundamentals & Hooks", description: "Components, state management, useEffect, and custom hooks." },
        { weekNumber: 5, title: "Next.js App Router & Server Components", description: "Routing, layout architecture, and Server Actions." },
        { weekNumber: 6, title: "Database Systems & PostgreSQL Prisma ORM", description: "Schema design, migrations, indexing, and Prisma queries." },
        { weekNumber: 7, title: "Building RESTful APIs & Auth", description: "NextAuth integration, JWT tokens, and secure API design." },
        { weekNumber: 8, title: "Full-Stack Project Integration", description: "Connecting frontend and backend with state management." },
      ],
    },
    {
      title: "Data Science & AI with Python",
      description: "Master data analysis, statistical modeling, machine learning with Pandas, NumPy, Scikit-Learn, and AI fundamentals.",
      price: 950,
      currency: "GHS",
      duration: "8 Weeks",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      instructorId: superAdmin.id,
      topics: [
        { weekNumber: 1, title: "Python Core Foundations & Data Structures", description: "Variables, lists, dicts, functions, and OOP in Python." },
        { weekNumber: 2, title: "Numerical Computing with NumPy & Pandas", description: "Data manipulation, cleaning, filtering, and aggregation." },
        { weekNumber: 3, title: "Data Visualization with Matplotlib & Seaborn", description: "Plots, charts, dashboards, and visual insights." },
        { weekNumber: 4, title: "Exploratory Data Analysis & Statistics", description: "Hypothesis testing, distributions, and data trends." },
        { weekNumber: 5, title: "Machine Learning Fundamentals", description: "Regression, classification, and model evaluations with Scikit-Learn." },
        { weekNumber: 6, title: "Deep Learning Intro & AI Models", description: "Neural network architecture and practical AI application." },
      ],
    },
    {
      title: "UI/UX Design & Prototyping",
      description: "Learn human-centered design principles, wireframing, component design systems, and interactive prototyping in Figma.",
      price: 500,
      currency: "GHS",
      duration: "6 Weeks",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
      instructorId: superAdmin.id,
      topics: [
        { weekNumber: 1, title: "Design Principles & User Research", description: "User personas, empathy maps, and problem framing." },
        { weekNumber: 2, title: "Wireframing & Low-Fidelity Layouts", description: "Structuring content, navigation, and user flows." },
        { weekNumber: 3, title: "Design Systems & Component Libraries", description: "Color palettes, typography scales, and auto-layout." },
        { weekNumber: 4, title: "Interactive Prototyping in Figma", description: "Micro-interactions, screen transitions, and testing." },
      ],
    },
  ];

  const createdCourses = [];

  for (const c of courseData) {
    const course = await prisma.course.create({
      data: {
        title: c.title,
        description: c.description,
        price: c.price,
        currency: c.currency,
        duration: c.duration,
        image: c.image,
        status: "ACTIVE",
        instructorId: c.instructorId,
        weeklyTopics: {
          create: c.topics.map((t) => ({
            weekNumber: t.weekNumber,
            title: t.title,
            description: t.description,
          })),
        },
      },
      include: {
        weeklyTopics: true,
      },
    });
    createdCourses.push(course);
    console.log(`📚 Course created: "${course.title}" (${course.weeklyTopics.length} topics)`);
  }

  const primaryCourse = createdCourses[0];

  // 4. Enroll student in primary course
  const enrollment = await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: primaryCourse.id,
      status: "ACTIVE",
    },
  });

  // Create payment record for enrollment
  await prisma.payment.create({
    data: {
      userId: student.id,
      courseId: primaryCourse.id,
      enrollmentId: enrollment.id,
      amount: primaryCourse.price,
      currency: "GHS",
      reference: `PAY-SEED-${Date.now()}`,
      status: "PAID",
      paystackRef: `PS-${Date.now()}`,
    },
  });

  console.log(`🎓 Enrolled student in "${primaryCourse.title}" with PAID status`);

  // 5. Create Assessment / Assignment for the course
  const assessment = await prisma.assessment.create({
    data: {
      courseId: primaryCourse.id,
      weeklyTopicId: primaryCourse.weeklyTopics[1]?.id,
      title: "Assignment 1: Responsive Layout Implementation",
      instructions: "Build a responsive landing page header and grid using CSS Flexbox and Grid. Submit your GitHub URL or live demo link.",
      totalMarks: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      type: "ASSIGNMENT",
      questions: {
        create: [
          {
            text: "Submit your solution URL (GitHub repo or Live Vercel Link)",
            type: "TEXT",
            marks: 100,
          },
        ],
      },
    },
  });

  // 6. Create Student Submission
  const submission = await prisma.submission.create({
    data: {
      userId: student.id,
      assessmentId: assessment.id,
      status: "REVIEWED",
      score: 92,
      feedback: "Excellent work! Responsive breakpoints and semantic structure look clean.",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reviewedAt: new Date(),
    },
  });

  console.log(`📝 Created sample assignment and student submission (Score: ${submission.score}/100)`);

  // 7. Create Attendance Session & Records
  const attendanceSession = await prisma.attendanceSession.create({
    data: {
      courseId: primaryCourse.id,
      instructorId: superAdmin.id,
      date: new Date(),
      records: {
        create: [
          {
            userId: student.id,
            status: "PRESENT",
          },
        ],
      },
    },
  });

  console.log(`📌 Created attendance session with student marked PRESENT`);

  console.log("\n=======================================================");
  console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=======================================================");
  console.log(`👑 Super Admin Instructor Credentials:`);
  console.log(`   Email:    yeboahmichael977@gmail.com`);
  console.log(`   Password: !@Firatata45`);
  console.log(`   Role:     SUPER_ADMIN`);
  console.log("-------------------------------------------------------");
  console.log(`🎓 Demo Student Credentials:`);
  console.log(`   Email:    student@miqrotek.com`);
  console.log(`   Password: password123`);
  console.log(`   Role:     STUDENT`);
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
