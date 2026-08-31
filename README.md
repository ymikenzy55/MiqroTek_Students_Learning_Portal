# Miqrotek Student Learning Portal

**Miqrotek Student Learning Portal** is a role-based educational platform built with Next.js. It provides dedicated portals for students, instructors, and admins. Students access courses, submit assessments, and track attendance. Instructors manage courses, grade assignments, and monitor performance. Admins oversee users, payments, and system settings.

## 🚀 Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Prisma ORM** with PostgreSQL (Neon)
- **NextAuth v5** (Authentication)
- **Tailwind CSS 4**
- **PWA Support** (Offline capabilities)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (we recommend [Neon](https://neon.tech))

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal.git
cd MiqroTek_Students_Learning_Portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
DATABASE_URL="your-postgresql-connection-string"
DATABASE_URL_UNPOOLED="your-postgresql-unpooled-connection-string"
AUTH_SECRET="your-generated-secret-key"
```

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👥 Default Login Credentials

After seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@miqrotek.com | password123 |
| Instructor | instructor@miqrotek.com | password123 |
| Student | student@miqrotek.com | password123 |

**⚠️ Change these in production!**

## 🌲 Git Workflow

We follow **Git Flow** branching strategy. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Quick Start:

```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push -u origin feature/your-feature-name
```

**Important:** Never push directly to `main` or `develop`. Always create a Pull Request.

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin portal
│   ├── instructor/     # Instructor portal
│   ├── student/        # Student portal
│   ├── api/            # API routes
│   └── login/          # Authentication
├── components/         # React components
│   ├── auth/          # Auth components
│   ├── layout/        # Layout components
│   └── ui/            # UI components
├── lib/               # Utility functions
├── types/             # TypeScript types
└── actions/           # Server actions

prisma/
├── schema.prisma      # Database schema
└── seed.ts           # Seed data
```

## 🎯 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run seed        # Seed database
```

## 📚 Features

### For Students:
- ✅ Course enrollment and access
- ✅ View course materials and resources
- ✅ Complete assessments and quizzes
- ✅ Submit assignments
- ✅ Track attendance
- ✅ View grades and feedback

### For Instructors:
- ✅ Create and manage courses
- ✅ Upload learning materials
- ✅ Create assessments
- ✅ Grade submissions
- ✅ Track student attendance
- ✅ Manage course bundles
- ✅ View student analytics

### For Admins:
- ✅ User management (students, instructors, admins)
- ✅ Course administration
- ✅ Payment tracking
- ✅ System settings
- ✅ Comprehensive reporting

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:

- Branch naming conventions
- Commit message format
- Pull request process
- Code review guidelines
- Development best practices

## 📄 License

This project is private and proprietary to Miqrotek.

## 📞 Support

For questions or issues:
- Create a GitHub issue
- Contact the development team
- Check existing documentation

---

Built with ❤️ by the Miqrotek Team
