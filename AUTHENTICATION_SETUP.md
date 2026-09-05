# Authentication & Role-Based Access Control

## ✅ Implementation Summary

This document describes the authentication and role-based access control (RBAC) system implemented in the Miqrotek Student Learning Portal.

---

## 🔐 Role-Based Access Control

### Roles:
- **STUDENT** - Can only access student portal
- **INSTRUCTOR** - Can access instructor portal
- **SUPER_ADMIN** - Can access both admin and instructor portals

### Protection Levels:

#### 1. Login Page Protection
**File:** `src/app/login/page.tsx`

The login page has two tabs:
- **Student Tab** - Only allows `STUDENT` role
- **Instructor Tab** - Allows `INSTRUCTOR` and `SUPER_ADMIN` roles

**How it works:**
- User selects their portal type (Student or Instructor)
- After successful authentication, the system checks if their role matches the selected portal
- If roles don't match, the user is signed out immediately with a clear error message
- User is redirected to the appropriate dashboard based on their actual role

#### 2. Layout Level Protection
**Files:**
- `src/app/student/layout.tsx` - Protects all student routes
- `src/app/instructor/layout.tsx` - Protects all instructor routes  
- `src/app/admin/layout.tsx` - Protects all admin routes

**How it works:**
- Every protected section has a layout that checks authentication
- If no session exists, redirect to `/login`
- If role doesn't match, redirect to `/login`
- All child pages automatically inherit this protection

#### 3. Server-Side Auth Guards
**File:** `src/lib/auth-guard.ts`

Provides helper functions for additional protection:
```typescript
requireAuth()           // Requires any authenticated user
requireRole([roles])    // Requires specific role(s)
requireStudent()        // Requires STUDENT role
requireInstructor()     // Requires INSTRUCTOR or SUPER_ADMIN
requireSuperAdmin()     // Requires SUPER_ADMIN only
```

---

## 📊 Database Connection Logging

### Implementation
**File:** `src/lib/prisma.ts`

Added comprehensive connection logging:
- ✅ Connection attempt notification
- ✅ Environment variable validation
- ✅ Adapter creation confirmation
- ✅ Connection success/failure logging
- ✅ Detailed error messages

### Console Output:
```
🔌 Attempting to connect to database...
✅ Database adapter created successfully
✅ Database connected successfully
```

---

## 🔍 Authentication Flow Logging

### Login Process
**File:** `src/lib/auth.ts`

Logs at every step:
```
🔐 Authentication attempt for: user@example.com
⚠️ Missing credentials
⚠️ User not found or no password set: user@example.com
⚠️ Invalid password for: user@example.com
✅ Authentication successful for: user@example.com (Role: STUDENT)
```

### Login Form
**File:** `src/components/auth/LoginForm.tsx`

Logs user actions:
```
🔐 Login attempt: user@example.com (Portal: student)
❌ Login failed: Invalid credentials
✅ Session retrieved - Role: STUDENT, Name: John Doe
⚠️ Role mismatch - User role: STUDENT, Allowed roles: INSTRUCTOR
✅ Redirecting to dashboard: STUDENT
```

### Layout Guards
**Files:** `src/app/*/layout.tsx`

Logs access control:
```
⚠️ Student layout - No session found, redirecting to login
⚠️ Student layout - Invalid role: INSTRUCTOR, redirecting to login
✅ Student layout - Access granted for: student@example.com
```

---

## 🚫 Security Scenarios

### Scenario 1: Student tries to access Instructor portal
1. Student clicks "Instructor" tab on login page
2. Enters student credentials
3. Authentication succeeds
4. System detects role mismatch
5. User is signed out immediately
6. Error message: "You are signed in as a student. Please use the correct sign-in tab."
7. User must use Student tab to proceed

### Scenario 2: Instructor tries to access Student portal  
1. Instructor clicks "Student" tab
2. Enters instructor credentials
3. Authentication succeeds
4. System detects role mismatch
5. User is signed out immediately
6. Error message: "You are signed in as an instructor. Please use the correct sign-in tab."
7. User must use Instructor tab to proceed

### Scenario 3: Direct URL access
1. Student tries to visit `/instructor` directly
2. Layout checks session and role
3. Role mismatch detected
4. Redirected to `/login`
5. Must authenticate with correct portal

### Scenario 4: API access attempts
1. Student tries to call instructor-only API
2. Auth guard checks role
3. Access denied
4. Returns 401 Unauthorized

---

## 🔧 Testing the Implementation

### Test User Credentials (from seed data):
```
STUDENT:
Email: student@miqrotek.com
Password: password123
Access: /student only

INSTRUCTOR:
Email: instructor@miqrotek.com  
Password: password123
Access: /instructor only

SUPER_ADMIN:
Email: admin@miqrotek.com
Password: password123
Access: /admin and /instructor
```

### Test Cases:

#### ✅ Test 1: Student Login (Correct Portal)
1. Click "Student" tab
2. Enter student@miqrotek.com / password123
3. Should redirect to `/student`
4. Check console: `✅ Redirecting to dashboard: STUDENT`

#### ✅ Test 2: Student Login (Wrong Portal)
1. Click "Instructor" tab
2. Enter student@miqrotek.com / password123
3. Should see error message
4. Should be signed out
5. Check console: `⚠️ Role mismatch`

#### ✅ Test 3: Instructor Login (Correct Portal)
1. Click "Instructor" tab
2. Enter instructor@miqrotek.com / password123
3. Should redirect to `/instructor`
4. Check console: `✅ Redirecting to dashboard: INSTRUCTOR`

#### ✅ Test 4: Instructor Login (Wrong Portal)
1. Click "Student" tab
2. Enter instructor@miqrotek.com / password123
3. Should see error message
4. Should be signed out
5. Check console: `⚠️ Role mismatch`

#### ✅ Test 5: Direct URL Access
1. Login as student
2. Manually type `/instructor` in URL
3. Should redirect to `/login`
4. Check console: `⚠️ Student layout - Invalid role`

---

## 📝 Logs Location

### Development Server Logs:
- **Terminal output** - Real-time console logs
- **File:** `.next/dev/logs/next-development.log` - Persistent logs

### Important Log Messages:

**Database:**
- `🔌 Attempting to connect to database...`
- `✅ Database connected successfully`
- `❌ Database connection failed: [error]`

**Authentication:**
- `🔐 Authentication attempt for: [email]`
- `✅ Authentication successful for: [email] (Role: [role])`
- `⚠️ Invalid password for: [email]`

**Authorization:**
- `✅ Session retrieved - Role: [role]`
- `⚠️ Role mismatch - User role: [role], Allowed roles: [roles]`
- `✅ Redirecting to dashboard: [role]`

**Access Control:**
- `✅ [Portal] layout - Access granted for: [email]`
- `⚠️ [Portal] layout - Invalid role: [role], redirecting to login`

---

## 🛡️ Security Best Practices Implemented

1. ✅ **Multi-Layer Protection**
   - Login form validation
   - Session verification
   - Layout guards
   - Server-side guards

2. ✅ **Immediate Sign-Out on Role Mismatch**
   - Prevents session hijacking
   - Forces correct portal usage

3. ✅ **Comprehensive Logging**
   - Track all authentication attempts
   - Monitor access patterns
   - Debug issues quickly

4. ✅ **Clear Error Messages**
   - User-friendly messages
   - No technical jargon
   - Guidance on next steps

5. ✅ **Server-Side Validation**
   - All checks happen on server
   - Client-side cannot bypass
   - Session-based authentication

---

## 🚀 Running the Application

```bash
# Start development server
npm run dev

# Open browser
http://localhost:3000

# Check console for logs
# Look for:
# - Database connection status
# - Authentication attempts
# - Role validations
# - Access control decisions
```

---

## 📞 Troubleshooting

### Issue: "Database connection failed"
- Check `.env.local` has correct `DATABASE_URL`
- Verify database is accessible
- Check console for specific error message

### Issue: "Can't sign in"
- Verify user exists in database
- Check password is correct
- Run `npm run seed` to create test users
- Check console: `⚠️ User not found` or `⚠️ Invalid password`

### Issue: "Redirected to login after signing in"
- Check you're using correct portal tab
- Verify your role matches portal
- Check console: `⚠️ Role mismatch`

### Issue: "No logs appearing"
- Check terminal where `npm run dev` is running
- Check `.next/dev/logs/next-development.log`
- Ensure you're in development mode

---

## 🎯 Summary

The authentication system now has:
- ✅ Role-based access control at login
- ✅ Multi-layer protection
- ✅ Comprehensive logging
- ✅ Database connection monitoring
- ✅ Clear error messages
- ✅ Immediate sign-out on violations

**All scenarios tested and working correctly! 🎉**
