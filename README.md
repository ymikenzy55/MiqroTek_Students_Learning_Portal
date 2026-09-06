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

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## Key Features

### Students
| Feature | Description |
|---------|-------------|
| **Course Catalog** | Browse all active courses with cover images, pricing, and "what's included" highlights |
| **Course Enrollment** | Enroll via Moolre hosted checkout (GHS payments) or manual instructor enrollment |
| **Weekly Progress Tracking** | Course syllabus broken into weekly topics; progress updates as the instructor marks topics covered |
| **Assessments** | View assignments, submit answers, and receive graded feedback |
| **Attendance** | View attendance history across all enrolled courses |
| **Messaging** | Real-time direct messaging with instructors via Server-Sent Events (SSE) |
| **Bundles** | View assigned bundles and eligibility status based on attendance thresholds |
| **Profile & Settings** | Edit name, phone, avatar, notification preferences, and password |

### Instructors / Super Admins
| Feature | Description |
|---------|-------------|
| **Dashboard** | At-a-glance metrics: total students, courses, revenue, and recent activity |
| **Course Management** | Full CRUD — create, edit, delete courses with cover images (presets, URL, or upload), highlights, and weekly topics |
| **Student Management** | View all students (super admin sees everyone), suspend, reactivate, or permanently delete accounts |
| **Attendance Tracking** | Create attendance sessions and mark students Present / Late / Absent |
| **Assessments** | Create assignments and quizzes, review submissions, and assign scores with feedback |
| **Bundle Management** | Create bundles, set minimum attendance thresholds, and view per-student eligibility |
| **Instructor Management** | Add new instructors, promote students to super admin, or demote instructors back to students |
| **Messaging** | Real-time messaging with any student; unread badge in sidebar |
| **Profile & Security** | Update profile, change password, toggle message notifications |

### Platform
| Feature | Description |
|---------|-------------|
| **Role-Aware Authentication** | Dual-portal login (Student / Instructor) — credentials are validated, then the selected portal is checked against the database role to prevent cross-portal access |
| **Suspended Account Blocking** | Suspended users receive a clear error at the authentication layer |
| **Password Reset via Email** | Brevo-powered transactional emails with branded HTML templates and 1-hour expiring tokens |
| **Welcome Emails** | Automatic branded welcome email on successful registration |
| **Route Protection** | Edge middleware (`proxy.ts`) redirects unauthenticated users and enforces role-based route access |
| **Realtime Messaging** | SSE-based pub/sub for live message delivery and unread badge updates |
| **Terms & Privacy** | `/terms` and `/privacy` pages with mandatory consent checkboxes on registration |
| **Responsive Design** | Mobile-first layout with collapsible sidebar and bottom navigation |
| **Skeleton Loading** | Per-route loading skeletons for perceived performance |
| **PWA Support** | Service worker registered for offline shell caching |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.3.3 (App Router, Turbopack) |
| **UI** | React 19.2.8, Tailwind CSS v4 |
| **Language** | TypeScript 5.x (strict) |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 7.10 with `@prisma/adapter-neon` |
| **Authentication** | Auth.js / NextAuth 5.0 (beta) — JWT strategy, Credentials provider |
| **Password Hashing** | bcryptjs (10 rounds) |
| **Payments** | Moolre hosted checkout API |
| **Email** | Brevo (Sendinblue) SMTP API |
| **Realtime** | Server-Sent Events (in-process pub/sub) |
| **Deployment** | Vercel (serverless functions) |
| **Linting** | ESLint 9 with `eslint-config-next` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
│  React 19 · Tailwind CSS v4 · SSE EventSource · Service Worker   │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
               │  HTTP / SSE                  │  OAuth redirects
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                          │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  Middleware  │  │  Server      │  │  API Routes             │ │
│  │  (proxy.ts)  │  │  Components  │  │  /api/auth/*            │ │
│  │  Route guard │  │  Data fetch  │  │  /api/register          │ │
│  │  Role check  │  │  via Prisma  │  │  /api/forgot-password   │ │
│  └──────┬───────┘  └──────┬───────┘  │  /api/reset-password     │ │
│         │                 │           │  /api/upload             │ │
│         │                 │           │  /api/realtime (SSE)     │ │
│         │                 │           │  /api/payment/moolre/*   │ │
│         ▼                 ▼           └───────────┬─────────────┘ │
│  ┌──────────────────────────────────────────────────┐            │
│  │              Server Actions (src/actions)         │            │
│  │  course · attendance · assessment · bundle        │            │
│  │  message · payment · profile · student-mgmt       │            │
│  │  instructor-mgmt · auth                           │            │
│  └──────────────────────┬───────────────────────────┘            │
│                         │                                         │
│  ┌──────────────────────▼───────────────────────────┐            │
│  │              Library (src/lib)                    │            │
│  │  auth.ts · prisma.ts · email.ts · moolre.ts       │            │
│  │  realtime.ts · messages.ts · cache.ts · utils.ts  │            │
│  └──────────────────────┬───────────────────────────┘            │
└─────────────────────────┼────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  Neon DB   │  │  Brevo API │  │  Moolre API│
   │ (Postgres) │  │  (Email)   │  │ (Payments) │
   └────────────┘  └────────────┘  └────────────┘
```

### Request Flow

```
Browser → Edge Middleware (proxy.ts)
           │
           ├─ Public route? → NextResponse.next()
           │
           ├─ No session? → Redirect to /login
           │
           ├─ Role mismatch? → Redirect to /login
           │    (e.g. STUDENT accessing /instructor/*)
           │
           └─ Authorized → Server Component renders
                │
                ├─ Prisma query → Neon Postgres
                │
                ├─ Server Action mutation → revalidatePath()
                │
                └─ SSE connection → /api/realtime (live messages)
```

### Authentication Flow

```
User selects portal (Student / Instructor)
         │
         ▼
  LoginForm submits credentials
         │
         ▼
  Auth.js Credentials provider
         │
         ├─ Look up user by email
         ├─ Check status === "SUSPENDED" → reject
         ├─ bcrypt.compare(password, hash)
         ├─ Check portal matches role
         │    ├─ STUDENT → student portal
         │    └─ SUPER_ADMIN → instructor portal
         ├─ Generate JWT with { id, role, email }
         └─ Redirect to /student or /instructor
```

### Payment Flow (Moolre)

```
Student clicks "Enroll" on paid course
         │
         ▼
  Payment Action creates PENDING payment record
         │
         ▼
  Redirect to Moolre hosted checkout
         │
         ├─ Student completes payment on Moolre
         │
         ▼
  Moolre redirects to /api/payment/moolre/callback
         │
         ├─ Server verifies transaction with Moolre API
         ├─ Marks payment as PAID
         ├─ Activates enrollment
         └─ Redirects to /payment/success
```

---

## Database Schema

The Prisma schema defines 16 models covering the full domain:

```
User ─┬─ StudentProfile
      ├─ InstructorProfile
      ├─ Course[] (as instructor)
      ├─ Enrollment[] ── Course
      ├─ Payment[] ── Course
      ├─ Submission[] ── Assessment ── Question ── Answer
      ├─ AttendanceRecord[] ── AttendanceSession ── Course
      ├─ BundleAssignment[] ── Bundle ── BundleRequirement[]
      ├─ Message[] (sent / received)
      └─ PasswordReset[]

Course ─┬─ WeeklyTopic[] ── Resource[]
        ├─ Assessment[]
        ├─ Enrollment[]
        ├─ AttendanceSession[]
        └─ Resource[]
```

| Model | Purpose |
|-------|---------|
| `User` | Base account — role (`STUDENT` / `SUPER_ADMIN`), status (`ACTIVE` / `SUSPENDED`) |
| `StudentProfile` | Student-specific bio and avatar |
| `InstructorProfile` | Instructor title, bio, and avatar |
| `Course` | Course catalog entry with price, image, highlights, and weekly topics |
| `WeeklyTopic` | Syllabus week — instructor marks `covered` to update student progress |
| `Resource` | Downloadable / linkable resources attached to a course or topic |
| `Assessment` | Assignment or quiz tied to a course and optionally a weekly topic |
| `Question` | Individual questions within an assessment |
| `Enrollment` | Many-to-many join between User and Course with status |
| `Payment` | Payment record linked to enrollment — tracks Moolre reference |
| `Submission` | Student's submitted assessment with score and feedback |
| `Answer` | Individual answers within a submission |
| `AttendanceSession` | A single class session created by the instructor |
| `AttendanceRecord` | Per-student attendance status for a session |
| `Bundle` | Group of requirements with an attendance-based eligibility threshold |
| `BundleRequirement` | Individual requirement within a bundle |
| `BundleAssignment` | Student assigned to a bundle with status |
| `Message` | Direct message between two users (supports broadcast fan-out) |
| `PasswordReset` | Secure token with 1-hour expiry for password reset emails |

---

## Authentication & Authorization

### Dual-Portal Login

The login page presents two tabs — **Student** and **Instructor**. When a user submits credentials:

1. The email and password are validated against the database (bcrypt).
2. The selected portal is checked against the user's `role`:
   - Student portal → only `STUDENT` accounts can sign in
   - Instructor portal → only `SUPER_ADMIN` accounts can sign in
3. If the portal doesn't match, a `PortalMismatchError` is thrown with a user-friendly message telling them which tab to use.

### Session Management

- **Strategy**: JWT (stateless, no server-side session store)
- **Token contents**: `id`, `email`, `name`, `role`, `image`
- **Role sync**: Every 5 minutes, the JWT role is re-validated against the database to catch role changes, suspensions, or account deletions without requiring a re-login.

### Route Protection

Edge middleware (`src/proxy.ts`) runs on every matched request:

| Route | Access |
|-------|--------|
| `/`, `/login`, `/forgot-password`, `/reset-password` | Public |
| `/privacy`, `/terms` | Public |
| `/payment/*` | Public (callback verification happens server-side) |
| `/api/auth/*`, `/api/forgot-password`, `/api/reset-password` | Public |
| `/student/*` | Authenticated `STUDENT` only |
| `/instructor/*` | Authenticated `SUPER_ADMIN` only |
| `/admin/*` | Authenticated `SUPER_ADMIN` only |

### Account Suspension

Users with `status === "SUSPENDED"` are blocked at the `authorize()` layer with the message: *"Your account has been suspended. Please contact support."*

---

## Project Structure

```
miqrotek/
├── prisma/
│   ├── schema.prisma          # 16-model Prisma schema
│   └── seed.ts                # Database seeder (super admin + courses)
├── src/
│   ├── actions/               # Server Actions (mutations)
│   │   ├── assessment-actions.ts
│   │   ├── attendance-actions.ts
│   │   ├── auth-actions.ts
│   │   ├── bundle-actions.ts
│   │   ├── course-actions.ts
│   │   ├── instructor-actions.ts
│   │   ├── instructor-management-actions.ts
│   │   ├── message-actions.ts
│   │   ├── payment-actions.ts
│   │   ├── profile-actions.ts
│   │   └── student-management-actions.ts
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, providers)
│   │   ├── page.tsx           # Landing page → redirects to /login
│   │   ├── login/             # Dual-portal login page
│   │   ├── forgot-password/   # Password reset request
│   │   ├── reset-password/    # Password reset form (token-based)
│   │   ├── privacy/           # Privacy Policy page
│   │   ├── terms/             # Terms of Service page
│   │   ├── payment/success/   # Post-checkout success page
│   │   ├── student/           # Student dashboard routes
│   │   │   ├── page.tsx       # Dashboard overview
│   │   │   ├── courses/       # Course catalog + detail pages
│   │   │   ├── assessments/   # Assignments & quizzes
│   │   │   ├── attendance/    # Attendance history
│   │   │   ├── bundles/       # Assigned bundles
│   │   │   ├── messages/      # Realtime messaging
│   │   │   └── profile/       # Profile & settings
│   │   ├── instructor/        # Instructor dashboard routes
│   │   │   ├── page.tsx       # Dashboard with metrics
│   │   │   ├── courses/       # Course CRUD + weekly topics
│   │   │   ├── students/      # Student list + detail pages
│   │   │   ├── instructors/   # Instructor management
│   │   │   ├── attendance/    # Attendance sessions
│   │   │   ├── assessments/   # Assessment management
│   │   │   ├── bundles/       # Bundle management
│   │   │   ├── messages/      # Realtime messaging
│   │   │   └── profile/       # Profile & settings
│   │   ├── admin/             # Super admin overview routes
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts   # Auth.js handler
│   │       ├── register/route.ts             # Student registration
│   │       ├── forgot-password/route.ts      # Reset email trigger
│   │       ├── reset-password/route.ts       # Reset token verification
│   │       ├── upload/route.ts               # Image upload (local/Vercel Blob)
│   │       ├── realtime/route.ts             # SSE endpoint for live messages
│   │       └── payment/moolre/callback/      # Moolre payment verification
│   ├── components/
│   │   ├── auth/              # LoginForm, RegisterForm (with consent)
│   │   ├── courses/           # CourseCard, CourseModal, EditCourseModal, ImageUploader
│   │   ├── instructors/       # InstructorModal
│   │   ├── layout/            # DashboardShell, Sidebar, Topbar, MobileNav
│   │   ├── messages/          # MessageCenter (realtime)
│   │   ├── payments/          # PaymentModal
│   │   ├── profile/           # ProfileSettings
│   │   ├── providers/         # SessionProvider, RealtimeProvider, ServiceWorkerRegister
│   │   └── ui/                # Button, Input, Modal, Toast, Card, Badge, etc.
│   ├── lib/
│   │   ├── auth.ts            # Auth.js config (Credentials, JWT, callbacks)
│   │   ├── auth-guard.ts      # Server-side guard helper
│   │   ├── prisma.ts          # Prisma client singleton (Neon adapter)
│   │   ├── email.ts           # Brevo transactional email (reset + welcome)
│   │   ├── moolre.ts          # Moolre payment API client
│   │   ├── realtime.ts        # In-process SSE pub/sub
│   │   ├── messages.ts        # Message query helpers
│   │   ├── cache.ts           # Lightweight request-level cache
│   │   ├── performance.ts     # Performance timing utilities
│   │   └── utils.ts           # Shared utilities (cn, formatters)
│   ├── types/
│   │   ├── index.ts           # Role, Portal, NavItem types + nav config
│   │   └── next-auth.d.ts     # Session type augmentation
│   └── proxy.ts               # Edge middleware (route protection)
├── public/
│   ├── sw.js                  # Service worker
│   └── icons/                 # PWA icons
├── prisma.config.ts           # Prisma config (Vercel-compatible env handling)
├── next.config.ts             # Next.js config
├── vercel.json                # Vercel build config (prisma generate && next build)
├── tailwind.config.ts         # Tailwind v4 config
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 20.x or 22.x
- **PostgreSQL** database (recommended: [Neon](https://neon.tech) free tier)
- A **Brevo** account for transactional email
- A **Moolre** account for payment processing

### Installation

```bash
# Clone the repository
git clone https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal.git
cd MiqroTek_Students_Learning_Portal

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### Environment Setup

Create a `.env.local` file in the project root (see `.env.example` for reference):

```env
# Database (Neon or any PostgreSQL provider)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:password@host:5432/database?sslmode=require"

# Auth.js
AUTH_SECRET="generate-with-node -e console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_URL="http://localhost:3000"

# Brevo (transactional email)
BREVO_API_KEY="xkeysib-your-api-key"
BREVO_FROM_EMAIL="no-reply@yourdomain.com"
BREVO_FROM_NAME="Miqrotek"

# Moolre (payments)
MOOLRE_API_USER="your-username"
MOOLRE_PUBLIC_KEY="your-public-key"
MOOLRE_PRIVATE_KEY="your-private-key"
MOOLRE_ACCOUNT_NUMBER="your-account-number"
MOOLRE_BASE_URL="https://api.moolre.com"
```

### Database Setup

```bash
# Push schema to your database
npx prisma db push

# Seed initial data (creates super admin + sample courses)
npm run seed
```

### Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Super Admin / Instructor | `yeboahmichael977@gmail.com` | `!@Firatata45` |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Pooled PostgreSQL connection string (Neon pooler) |
| `DATABASE_URL_UNPOOLED` | Optional | Direct PostgreSQL connection (for migrations) |
| `AUTH_SECRET` | Yes | JWT signing secret (32+ random bytes, base64) |
| `NEXTAUTH_URL` | Yes | App base URL (`http://localhost:3000` or production URL) |
| `BREVO_API_KEY` | Yes | Brevo API key for transactional email |
| `BREVO_FROM_EMAIL` | Yes | Verified sender email in Brevo |
| `BREVO_FROM_NAME` | No | Sender display name (default: "Miqrotek") |
| `MOOLRE_API_USER` | Yes | Moolre API username |
| `MOOLRE_PUBLIC_KEY` | Yes | Moolre public API key |
| `MOOLRE_PRIVATE_KEY` | Yes | Moolre private API key |
| `MOOLRE_ACCOUNT_NUMBER` | Yes | Moolre account number for receiving payments |
| `MOOLRE_BASE_URL` | Yes | Moolre API base URL (`https://api.moolre.com`) |

---

## Deployment

### Vercel (Recommended)

The project is configured for Vercel deployment via `vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

**Steps:**

1. Push your code to GitHub
2. Import the repository at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in **Project → Settings → Environment Variables**
4. Set `NEXTAUTH_URL` to your production URL (e.g., `https://miqrotek.vercel.app`)
5. Deploy

**Live demo:** [https://miqrotek.vercel.app](https://miqrotek.vercel.app)

### Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Turbopack dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed database with initial data |

### Known Production Considerations

- **File uploads**: The `/api/upload` route writes to `public/uploads` using `fs/promises`. On Vercel serverless, the filesystem is ephemeral. For persistent uploads, integrate [Vercel Blob](https://vercel.com/storage/blob) or Cloudinary. Preset images and external URLs work without changes.
- **Realtime messaging**: The SSE pub/sub (`src/lib/realtime.ts`) uses in-process memory. It works on a single instance but does not broadcast across multiple serverless instances. For multi-instance realtime, integrate Upstash Redis, Ably, or Pusher.

---

## Screenshots

> The app is live at [https://miqrotek.vercel.app](https://miqrotek.vercel.app) — sign in with the credentials above to explore.

---

## License

This project is proprietary and maintained by Michael Yeboah for Miqrotek.

---

<div align="center">

**Built with Next.js 16 · React 19 · Prisma · Neon · Auth.js · Tailwind CSS v4**

</div>
