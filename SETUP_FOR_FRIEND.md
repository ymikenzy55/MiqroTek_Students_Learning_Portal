# 🚀 Setup Guide for New Team Member

Hey! Welcome to the Miqrotek project. Follow these steps to get started.

## ✅ Prerequisites
- Node.js 18+ installed
- Git installed
- GitHub account (already added as collaborator)

---

## 📥 Step 1: Accept Invitation

1. Check your email for GitHub invitation
2. Click "Accept invitation"
3. Or visit: https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal/invitations

---

## 💻 Step 2: Clone Repository

Open your terminal and run:

```bash
# Clone the project
git clone https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal.git

# Navigate to project folder
cd MiqroTek_Students_Learning_Portal
```

---

## 📦 Step 3: Install Dependencies

```bash
npm install
```

This will take a few minutes...

---

## 🔐 Step 4: Setup Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Now open `.env.local` in your editor and ask your teammate for:
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `AUTH_SECRET`

**For development, you can share the same database.**

---

## 🗄️ Step 5: Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push database schema (if new database)
npx prisma db push

# Seed with test data
npm run seed
```

---

## 🎉 Step 6: Run the Project

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

### Test Login Credentials:
- **Admin:** admin@miqrotek.com / password123
- **Instructor:** instructor@miqrotek.com / password123
- **Student:** student@miqrotek.com / password123

---

## 🌲 Step 7: Understand the Workflow

We use **Git Flow**. Read these files:
- `README.md` - Project overview
- `CONTRIBUTING.md` - Detailed workflow
- `QUICK_START.md` - Quick reference

### Quick Summary:

**Never push to `main` or `develop` directly!**

Always:
1. Create feature branch
2. Make changes
3. Push branch
4. Create Pull Request
5. Get review
6. Merge

---

## 🚀 Step 8: Create Your First Feature

```bash
# Make sure you're on develop
git checkout develop

# Pull latest changes
git pull origin develop

# Create your feature branch
git checkout -b feature/my-first-feature

# Make some changes to files...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add my first feature"

# Push to GitHub
git push -u origin feature/my-first-feature
```

Then go to GitHub and create a **Pull Request** targeting `develop` branch.

---

## 📁 Project Structure

```
src/
├── app/              # Pages (Next.js App Router)
│   ├── admin/       # Admin dashboard
│   ├── instructor/  # Instructor dashboard
│   ├── student/     # Student dashboard
│   └── api/         # API routes
├── components/      # React components
├── lib/            # Utilities
└── types/          # TypeScript types

prisma/
├── schema.prisma   # Database schema
└── seed.ts        # Seed data
```

---

## 🛠️ Useful Commands

```bash
# Start development server
npm run dev

# Run linter
npm run lint

# Build for production
npm run build

# Seed database
npm run seed
```

---

## 💡 Tips

1. **Pull before starting work each day:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Commit frequently** with clear messages

3. **Test your changes** before pushing

4. **Ask questions** - better to ask than guess!

5. **Review the code** - learn from existing patterns

---

## 🆘 Common Issues

### Port 3000 already in use:
```bash
# Kill the process
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Prisma client not found:
```bash
npx prisma generate
```

### Database connection error:
- Check your `.env.local` file
- Verify DATABASE_URL is correct
- Ask teammate to share credentials

---

## 📞 Need Help?

- Check `CONTRIBUTING.md` for detailed guidelines
- Check `QUICK_START.md` for quick reference  
- Ask your teammate
- Create a GitHub issue

---

## 🎯 You're Ready!

You can now:
✅ Run the project locally
✅ Make changes
✅ Create branches
✅ Submit Pull Requests
✅ Collaborate with the team

Happy coding! 🚀
