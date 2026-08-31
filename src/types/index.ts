export type Role = "STUDENT" | "INSTRUCTOR" | "SUPER_ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  image?: string | null;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: { label: string; href: string }[];
}

export const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: "home" },
  {
    label: "Learning",
    href: "/student/courses",
    icon: "book",
    children: [
      { label: "My Courses", href: "/student/courses" },
      { label: "Assessments", href: "/student/assessments" },
      { label: "Bundles", href: "/student/bundles" },
    ],
  },
  { label: "Attendance", href: "/student/attendance", icon: "calendar" },
  { label: "Profile", href: "/student/profile", icon: "user" },
];

export const INSTRUCTOR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/instructor", icon: "home" },
  {
    label: "Teaching",
    href: "/instructor/courses",
    icon: "book",
    children: [
      { label: "Courses", href: "/instructor/courses" },
      { label: "Assessments", href: "/instructor/assessments" },
      { label: "Bundles", href: "/instructor/bundles" },
    ],
  },
  { label: "Students", href: "/instructor/students", icon: "users" },
  { label: "Attendance", href: "/instructor/attendance", icon: "calendar" },
  { label: "Profile", href: "/instructor/profile", icon: "user" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "home" },
  {
    label: "People",
    href: "/admin/users",
    icon: "users",
    children: [
      { label: "All Users", href: "/admin/users" },
      { label: "Students", href: "/admin/students" },
      { label: "Instructors", href: "/admin/instructors" },
    ],
  },
  {
    label: "Academics",
    href: "/admin/courses",
    icon: "book",
    children: [
      { label: "Courses", href: "/admin/courses" },
      { label: "Assessments", href: "/admin/assessments" },
      { label: "Bundles", href: "/admin/bundles" },
      { label: "Attendance", href: "/admin/attendance" },
    ],
  },
  { label: "Payments", href: "/admin/payments", icon: "credit-card" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];
