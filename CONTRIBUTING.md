# Contributing to Miqrotek Student Learning Portal

## 🌲 Branch Strategy (Git Flow)

### Branch Structure
- **`main`** - Production-ready code only. Protected branch.
- **`develop`** - Integration branch. All features merge here first.
- **`feature/*`** - New features (e.g., `feature/student-dashboard`)
- **`bugfix/*`** - Bug fixes (e.g., `bugfix/login-error`)
- **`hotfix/*`** - Urgent production fixes (e.g., `hotfix/security-patch`)

---

## 🚀 Development Workflow

### 1️⃣ Starting New Work

```bash
# Always start from develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2️⃣ Working on Your Feature

```bash
# Make your changes, then stage them
git add .

# Commit with descriptive message
git commit -m "feat: add student attendance tracking"

# Push to remote
git push -u origin feature/your-feature-name
```

### 3️⃣ Creating a Pull Request

1. Go to GitHub repository
2. Click **"Compare & pull request"**
3. Set base branch to `develop` (not `main`)
4. Add description of changes
5. Request review from team member
6. Wait for approval before merging

### 4️⃣ After PR is Merged

```bash
# Switch back to develop
git checkout develop

# Pull latest changes
git pull origin develop

# Delete your local feature branch
git branch -d feature/your-feature-name
```

---

## 📝 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Examples:
```bash
git commit -m "feat: implement course enrollment system"
git commit -m "fix: resolve login redirect issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize database queries"
```

---

## 🔄 Keeping Your Branch Updated

```bash
# While on your feature branch
git checkout feature/your-feature-name

# Fetch latest from develop
git fetch origin develop

# Merge or rebase (prefer rebase for cleaner history)
git rebase origin/develop

# If conflicts occur, resolve them, then:
git add .
git rebase --continue

# Force push if you rebased
git push --force-with-lease origin feature/your-feature-name
```

---

## 🚫 Important Rules

### ❌ NEVER DO THIS:
- Push directly to `main` or `develop`
- Commit sensitive data (.env files, API keys, passwords)
- Work directly on `main` or `develop`
- Force push to shared branches without team knowledge

### ✅ ALWAYS DO THIS:
- Create a new branch for every feature/fix
- Pull latest changes before starting work
- Write clear commit messages
- Test your code before pushing
- Request code reviews
- Keep branches short-lived (merge within 2-3 days)

---

## 👥 Team Collaboration

### Before Starting Work:
1. Check existing PRs to avoid duplicate work
2. Communicate with team about what you're working on
3. Assign yourself to relevant GitHub issues

### During Development:
1. Push your branch daily (even if incomplete)
2. Update your PR description as scope changes
3. Respond to code review comments promptly

### Code Review Guidelines:
- Review within 24 hours
- Be constructive and respectful
- Test the changes locally if possible
- Approve only if you'd be comfortable deploying it

---

## 🆘 Common Scenarios

### Scenario 1: You Accidentally Committed to Main
```bash
# Don't panic! Create a branch from current state
git branch feature/accidental-work

# Reset main to match remote
git checkout main
git reset --hard origin/main

# Continue work on feature branch
git checkout feature/accidental-work
```

### Scenario 2: Merge Conflicts
```bash
# Pull latest develop
git checkout develop
git pull origin develop

# Try to merge into your feature branch
git checkout feature/your-feature
git merge develop

# Conflicts will be marked in files
# Open conflicted files and resolve manually
# Look for <<<<<<, =======, >>>>>> markers

# After resolving
git add .
git commit -m "merge: resolve conflicts with develop"
git push origin feature/your-feature
```

### Scenario 3: Need to Update PR After Review
```bash
# Make requested changes
git add .
git commit -m "fix: address PR review comments"
git push origin feature/your-feature
# PR updates automatically
```

---

## 📦 Release Process (Main Branch)

Only team leads perform releases:

```bash
# Ensure develop is tested and ready
git checkout develop
git pull origin develop

# Merge develop into main
git checkout main
git pull origin main
git merge develop --no-ff -m "release: version X.X.X"

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push to remote
git push origin main
git push origin --tags
```

---

## 🛠️ Setup for New Team Members

```bash
# Clone repository
git clone https://github.com/ymikenzy55/MiqroTek_Students_Learning_Portal.git
cd MiqroTek_Students_Learning_Portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Setup database
npx prisma generate
npx prisma db push
npm run seed

# Start development server
npm run dev
```

---

## 📊 Branch Naming Convention

```
feature/description       → feature/student-enrollment
bugfix/issue-number      → bugfix/fix-login-redirect
hotfix/critical-issue    → hotfix/payment-security
docs/description         → docs/api-documentation
refactor/description     → refactor/auth-service
```

---

## 🎯 Best Practices

1. **Keep branches small** - One feature per branch
2. **Commit often** - Small, logical commits
3. **Pull frequently** - Stay in sync with team
4. **Write tests** - Test your features
5. **Document changes** - Update README/docs as needed
6. **Clean code** - Run linter before committing
7. **No console.logs** - Remove debug code before PR

---

## 📞 Questions?

- Check existing issues and PRs first
- Ask in team chat for quick questions
- Create a GitHub issue for bugs/features
- Tag team members in PR for specific feedback

Happy coding! 🚀
