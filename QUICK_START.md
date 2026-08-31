# 🚀 Quick Start Guide for Team

## Why I Pushed to Main First

**Answer:** The initial push to `main` was a one-time setup to establish the base repository. From now on, **NEVER push directly to `main` again!** We now follow industry-standard Git Flow.

---

## ✅ Repository Setup (Complete!)

✓ `main` branch - Production code (protected)  
✓ `develop` branch - Integration branch (current work here)  
✓ Contributing guidelines added  
✓ Environment example created  
✓ Comprehensive README  

---

## 👥 Give Your Friend Access

### On GitHub:
1. Go to: https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal
2. Click **Settings** → **Collaborators**
3. Click **Add people**
4. Enter their GitHub username/email
5. Send invitation

### Protect Main Branch:
1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name: `main`
4. Check:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Include administrators
5. Save changes

---

## 📝 Daily Workflow (Both of You)

### Morning (Start of Day):
```bash
# Get latest changes
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### During Work:
```bash
# Save your work frequently
git add .
git commit -m "feat: what you did"
git push origin feature/your-feature-name
```

### End of Feature:
```bash
# Push final changes
git push origin feature/your-feature-name

# Go to GitHub and create Pull Request
# Target: develop (NOT main)
# Get team review
# Merge after approval
```

### After PR Merged:
```bash
# Clean up
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

---

## 🔥 Common Commands Reference

```bash
# See what branch you're on
git branch

# See your changes
git status

# Switch branches
git checkout branch-name

# Create new branch
git checkout -b feature/new-feature

# Pull latest changes
git pull origin develop

# Push your branch
git push origin your-branch-name

# Delete local branch (after merged)
git branch -d branch-name
```

---

## 📋 Commit Message Format

Use these prefixes:

```bash
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructure
test: adding tests
chore: maintenance

# Examples:
git commit -m "feat: add student profile page"
git commit -m "fix: resolve login redirect bug"
git commit -m "docs: update API documentation"
```

---

## 🚫 Golden Rules

### NEVER:
- ❌ Push directly to `main`
- ❌ Push directly to `develop`
- ❌ Commit `.env` files
- ❌ Commit passwords or API keys
- ❌ Force push without team knowledge

### ALWAYS:
- ✅ Work on feature branches
- ✅ Create Pull Requests
- ✅ Get code reviews
- ✅ Pull before starting work
- ✅ Test before pushing

---

## 🆘 Common Issues & Solutions

### "My branch is behind develop"
```bash
git checkout develop
git pull origin develop
git checkout your-feature-branch
git merge develop
# Resolve conflicts if any
git push origin your-feature-branch
```

### "I committed to develop by accident"
```bash
# Create a branch from current state
git branch feature/my-work

# Reset develop
git checkout develop
git reset --hard origin/develop

# Continue on feature branch
git checkout feature/my-work
```

### "I have merge conflicts"
```bash
# Conflicts are marked with <<<<<<, =======, >>>>>>>
# Open the files and manually fix them
# After fixing:
git add .
git commit -m "merge: resolve conflicts"
git push origin your-branch
```

### "I need to undo my last commit"
```bash
# Undo but keep changes
git reset --soft HEAD~1

# Undo and discard changes (careful!)
git reset --hard HEAD~1
```

---

## 👥 Team Coordination

### Before You Start:
1. Check GitHub issues
2. Check open PRs
3. Communicate what you're working on
4. Pull latest develop

### During Work:
1. Push daily (even incomplete work)
2. Update PR descriptions
3. Respond to review comments

### Code Review:
1. Review PRs within 24 hours
2. Test changes locally
3. Be constructive in feedback
4. Approve only if ready for production

---

## 🎯 Your Friend's Setup

Send them this:

```bash
# 1. Clone repository
git clone https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal.git
cd MiqroTek_Students_Learning_Portal

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Then edit .env.local with credentials

# 4. Setup database
npx prisma generate
npx prisma db push
npm run seed

# 5. Start dev server
npm run dev

# 6. Create first feature branch
git checkout develop
git checkout -b feature/my-first-task
```

---

## 📚 Documentation Files

- **README.md** - Project overview and setup
- **CONTRIBUTING.md** - Detailed workflow and conventions
- **QUICK_START.md** - This file (quick reference)

---

## 🎉 You're Ready!

Both of you can now:
- Work on separate features simultaneously
- Review each other's code
- Safely integrate changes
- Never lose work
- Maintain clean history

Happy coding! 🚀
