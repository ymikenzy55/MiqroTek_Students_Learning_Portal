<div align="center">

# Miqrotek Learning Portal

### A full-stack learning management system built with Next.js 16, React 19, Prisma & Neon Postgres

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech/)
[![Auth.js](https://img.shields.io/badge/Auth.js-5.0_beta-02BE8A)](https://authjs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Overview

Miqrotek is a production-grade learning management system (LMS) that connects **students** and **instructors** through a single, role-aware platform. Students browse and enroll in courses, track weekly progress, submit assignments, mark attendance, and message instructors. Instructors (super admins) create and manage courses, record attendance, manage students, configure bundles, and promote other instructors.

The application is built entirely on the **Next.js App Router** with **React Server Components**, **Server Actions**, and **edge middleware** for route protection — no separate backend service required.

**Live demo:** [https://miqrotek.vercel.app](https://miqrotek.vercel.app)

---

## Key Features

### Students
- **Course Catalog** — Browse active courses with cover images, pricing, and highlights
- **Course Enrollment** — Enroll via Moolre hosted checkout or manual instructor enrollment
- **Weekly Progress Tracking** — Syllabus broken into weekly topics; progress updates as instructor marks topics covered
- **Assessments** — View assignments, submit answers, and receive graded feedback
- **Attendance** — View attendance history across all enrolled courses
- **Realtime Messaging** — Direct messaging with instructors via Server-Sent Events
- **Bundles** — View assigned bundles and eligibility based on attendance thresholds
- **Profile & Settings** — Edit name, phone, avatar (click-to-upload), notification preferences, and password

### Instructors / Super Admins
- **Dashboard** — Metrics: total students, courses, revenue, and recent activity
- **Course Management** — Multi-step creation wizard (basics → details → cover → highlights → optional topics), full CRUD, weekly topic management
- **Student Management** — View all students, suspend, reactivate, delete, promote, or demote
- **Attendance Tracking** — Create sessions and mark students Present / Late / Absent
- **Assessments** — Create assignments and quizzes, review submissions, assign scores
- **Bundle Management** — Create bundles with attendance-based eligibility thresholds
- **Instructor Management** — Add, promote, or demote instructors
- **Realtime Messaging** — Message individual students or broadcast announcements
- **Profile & Security** — Update profile, change password with live strength meter

### Platform
- **Role-Aware Authentication** — Dual-portal login (Student / Instructor) with portal-role validation
- **Real-Time Notifications** — Live notification bell with unread badge, clickable navigation, mark-all-read
- **Password Reset via Email** — Brevo-powered transactional emails with 1-hour expiring tokens
- **Welcome Emails** — Automatic branded welcome email on registration
- **Route Protection** — Edge middleware enforces role-based access
- **Onboarding Tour** — Guided walkthrough for first-time students and instructors
- **PWA Support** — Install prompt, service worker with instant update propagation
- **Password Strength Meter** — Live evaluation with visual indicator and suggestions
- **Search & Pagination** — All list pages support client-side search and paginated results
- **Terms & Privacy** — Legal pages with mandatory consent on registration
- **Responsive Design** — Mobile-first with collapsible sidebar and bottom navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3.3 (App Router, Turbopack) |
| UI | React 19.2.8, Tailwind CSS v4 |
| Language | TypeScript 5.x (strict) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 7.10 with `@prisma/adapter-neon` |
| Authentication | Auth.js / NextAuth 5.0 (beta) — JWT, Credentials provider |
| Password Hashing | bcryptjs |
| Payments | Moolre hosted checkout |
| Email | Brevo transactional API |
| Realtime | Server-Sent Events (in-process pub/sub) |
| Deployment | Vercel |

---

## Architecture

```
Browser → Edge Middleware (proxy.ts)
           │
           ├─ Public route? → NextResponse.next()
           ├─ No session? → Redirect to /login
           ├─ Role mismatch? → Redirect to /login
           └─ Authorized → Server Component renders
                │
                ├─ Prisma query → Neon Postgres
                ├─ Server Action mutation → revalidatePath()
                └─ SSE connection → /api/realtime (live messages + notifications)
```

### Authentication Flow

```
User selects portal (Student / Instructor)
  → Credentials validated (bcrypt)
  → Account status checked (SUSPENDED = blocked)
  → Portal checked against user role
  → JWT created with { id, role, email }
  → Redirect to /student or /instructor
```

### Payment Flow (Moolre)

```
Student clicks "Enroll" on paid course
  → Payment Action creates PENDING payment record
  → Redirect to Moolre hosted checkout
  → Student completes payment on Moolre
  → Moolre redirects to /api/payment/moolre/callback
  → Server verifies transaction with Moolre API
  → Payment marked PAID, enrollment activated
  → Notifications sent to student + instructor
  → Redirect to /payment/success
```

---

## Database Schema

16 models covering the full domain:

```
User ─┬─ StudentProfile / InstructorProfile
      ├─ Course[] (as instructor)
      ├─ Enrollment[] ── Course ── WeeklyTopic[]
      ├─ Payment[] ── Course
      ├─ Submission[] ── Assessment ── Question
      ├─ AttendanceRecord[] ── AttendanceSession
      ├─ BundleAssignment[] ── Bundle ── BundleRequirement[]
      ├─ Message[] (sent / received)
      ├─ Notification[]
      └─ PasswordReset[]
```

---

## Getting Started

### Prerequisites
- Node.js 20.x or 22.x
- PostgreSQL database (recommended: [Neon](https://neon.tech))
- Brevo account for transactional email
- Moolre account for payment processing

### Installation

```bash
git clone https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal.git
cd MiqroTek_Students_Learning_Portal
npm install
npx prisma generate
```

### Environment Variables

Create a `.env.local` file (see `.env.example`):

```env
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
AUTH_SECRET="generate-with: node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
NEXTAUTH_URL="http://localhost:3000"
BREVO_API_KEY="..."
BREVO_FROM_EMAIL="no-reply@yourdomain.com"
BREVO_FROM_NAME="Miqrotek"
MOOLRE_API_USER="..."
MOOLRE_PUBLIC_KEY="..."
MOOLRE_PRIVATE_KEY="..."
MOOLRE_ACCOUNT_NUMBER="..."
MOOLRE_BASE_URL="https://api.moolre.com"
```

### Database Setup

```bash
npx prisma db push
npm run seed
```

### Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database |

---

## Deployment

The project is configured for Vercel via `vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in Project Settings
4. Set `NEXTAUTH_URL` to your production URL
5. Deploy

---

## License

Proprietary — maintained by Michael Yeboah for Miqrotek.
