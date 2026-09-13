# -*- coding: utf-8 -*-
from helpers import h1, h2, h3, p, bullets, table, figure, code_block


def add(doc):
    h1(doc, "CHAPTER THREE: METHODOLOGY AND SYSTEM DESIGN")

    h2(doc, "3.1 Research Design")
    p(doc, "This project takes an applied research approach, carried out through the design science "
           "research methodology. Design science research is about creating and evaluating artefacts — "
           "constructs, models, methods and working systems — that address real organisational "
           "problems [17]. Storey et al. showed that design science is a well-suited lens for "
           "presenting and assessing software engineering contributions, even though it is "
           "underused in the field [17]. Baskerville et al. demonstrated its application to a specific "
           "information systems problem and offered practical guidance for researchers adopting the "
           "paradigm [18].")
    p(doc, "The present study follows the standard design science process: the problem was identified "
           "through observation of UENR's manual examination administration (Chapter One); solution "
           "objectives were derived as six specific objectives; the artefact — a full-stack web "
           "application — was designed and developed (this chapter and Chapter Four); it was "
           "demonstrated on live infrastructure; evaluated against explicit criteria for each "
           "objective (Section 3.10 and Chapter Four); and is communicated through this report.")

    h2(doc, "3.2 Development Methodology")
    p(doc, "The system was built using an iterative and incremental approach. Development went through "
           "eight phases, each delivering a self-contained, testable increment that was exercised "
           "through the deployed application before the next phase began. Table 6 lists the phases and "
           "what each one delivered. This phasing is reflected directly in the modular structure of "
           "the backend codebase, where route modules are annotated with the phase that introduced "
           "them.")
    table(doc, ["Phase", "Increment delivered", "Principal modules"], [
        ["1", "Project scaffolding, database provisioning, deployment pipeline", "server bootstrap, Prisma schema, CI deployment"],
        ["2", "Authentication, registration windows, e-mail verification, account approval", "auth, users, registrationWindows"],
        ["3", "Academic structure management", "departments, academicYears, semesters"],
        ["4", "Course submission and approval workflow", "courses, courseLevels"],
        ["5", "Examination sessions and invigilation records", "examinationSessions, invigilations"],
        ["6", "Attendance scanning and venue assignments", "attendance, venueAssignments"],
        ["7", "Audit logging and settings", "auditLogs, settings"],
        ["8", "Venue management and timetable generation", "venues, timetable"],
    ], caption="Iterative development phases and their deliverables", col_widths=[0.8, 4.2, 3.0])

    h2(doc, "3.3 Requirements Gathering")
    p(doc, "System requirements were gathered from four sources: (i) direct observation of the existing "
           "manual process at the UENR examination office, including the artefacts it produces "
           "(e-mailed course lists, spreadsheet timetables and paper sign-in sheets); (ii) analysis of "
           "the failure modes of that process, as catalogued in the problem statement; (iii) domain "
           "knowledge of university examination administration practice; and (iv) the literature "
           "reviewed in Chapter Two, which supplied established constraint formulations and "
           "verification requirements.")

    h2(doc, "3.4 Requirements Analysis")
    h3(doc, "3.4.1 Functional Requirements")
    table(doc, ["ID", "Functional requirement"], [
        ["FR1", "Heads of Department shall create, edit and submit courses for approval."],
        ["FR2", "Super Admins shall approve or reject submitted courses, optionally with comments."],
        ["FR3", "Approved courses shall be locked against modification by Heads of Department."],
        ["FR4", "Super Admins shall create examination sessions and manage venues and capacities."],
        ["FR5", "The system shall automatically generate examination timetables using a constraint-based algorithm and report any unscheduled courses with reasons."],
        ["FR6", "The system shall automatically assign invigilators to venues with conflict avoidance; manual assignment with equivalent checks shall also be supported."],
        ["FR7", "Super Admins shall generate venue-specific QR codes, individually or in bulk per session."],
        ["FR8", "Invigilators shall scan venue QR codes with their device camera to verify attendance."],
        ["FR9", "The system shall validate every scan against QR format, invigilator status, venue assignment, duplicates and the permitted time window."],
        ["FR10", "A two-stage scan protocol (preview, then confirm) shall prevent spurious database writes."],
        ["FR11", "Real-time notifications shall be delivered to Super Admins for check-ins, absences, pending accounts and course submissions."],
        ["FR12", "The system shall automatically mark invigilators absent when no valid scan occurs within the examination window."],
        ["FR13", "Role-based access control shall be enforced on every operation."],
        ["FR14", "All privileged actions shall be recorded in an immutable audit log."],
        ["FR15", "Users shall self-register during time-boxed registration windows with 6-digit e-mail verification."],
        ["FR16", "Newly registered accounts shall require Super Admin approval before first sign-in."],
        ["FR17", "Password reset shall be supported through e-mailed tokens."],
        ["FR18", "The client shall be installable as a progressive web application."],
    ], caption="Functional requirements of the system", col_widths=[0.8, 7.2], font_size=10)

    h3(doc, "3.4.2 Non-Functional Requirements")
    table(doc, ["ID", "Non-functional requirement", "Category"], [
        ["NFR1", "The interface shall be responsive and usable on desktop and mobile devices.", "Usability"],
        ["NFR2", "All production communication shall use HTTPS.", "Security"],
        ["NFR3", "All database access shall use parameterised queries to prevent SQL injection.", "Security"],
        ["NFR4", "Passwords shall be hashed with bcrypt at a configurable cost factor.", "Security"],
        ["NFR5", "All inputs shall be validated against declared schemas (Zod) before processing.", "Security / reliability"],
        ["NFR6", "Authentication endpoints shall be rate-limited to resist brute-force attacks.", "Security"],
        ["NFR7", "HTTP responses shall carry hardened security headers (Helmet).", "Security"],
        ["NFR8", "State changes shall propagate to connected clients without page refreshes.", "Performance / usability"],
        ["NFR9", "The system shall be deployable on managed cloud platforms (Vercel, Render, Neon).", "Portability"],
        ["NFR10", "Timetable generation shall complete within seconds for typical UENR loads.", "Performance"],
    ], caption="Non-functional requirements of the system", col_widths=[0.9, 5.6, 1.9], font_size=10)

    h2(doc, "3.5 System Analysis")
    h3(doc, "3.5.1 Analysis of the Existing System")
    p(doc, "The existing examination administration process at UENR is entirely manual. Table 8 "
           "contrasts each of its stages with the corresponding stage of the proposed system.")
    table(doc, ["Lifecycle stage", "Existing (manual) system", "Proposed system"], [
        ["Course collection", "E-mailed lists in inconsistent formats; manual re-entry", "Structured forms with validation; unique [code, semester] enforcement"],
        ["Approval tracking", "Informal correspondence; no state model", "Explicit DRAFT -> SUBMITTED -> APPROVED/REJECTED state machine with locking"],
        ["Timetable construction", "Hand-placed in spreadsheets; clashes checked visually", "Greedy constraint-based generator; clash-free by construction; unscheduled report"],
        ["Invigilator assignment", "Printed notices; double-booking possible", "Round-robin with conflict avoidance; e-mail and in-app notification"],
        ["Attendance verification", "Paper sign-in sheets; forgeable", "Venue-bound QR scan with server-side validation and time windows"],
        ["Absence detection", "Reactive; discovered days later", "Automatic within five minutes of the missed window"],
        ["Accountability", "None", "Immutable audit log of all privileged actions"],
    ], caption="Comparison of the existing manual process with the proposed system", col_widths=[1.8, 3.0, 3.2], font_size=10)

    h3(doc, "3.5.2 Actors and Use Cases")
    p(doc, "The system serves three actors. The Super Admin (examination officer) runs the whole "
           "lifecycle: account approval, academic structure, course approval, venues, sessions, "
           "timetable generation, invigilator assignment, QR-code management and attendance monitoring. "
           "The Head of Department manages the course portfolio of one department: creating, editing "
           "and submitting courses, configuring course levels and viewing the published timetable. The "
           "Invigilator views personal venue assignments, performs QR scans at examination time and "
           "reviews their own attendance history. Figure 3 presents the use case model.")
    figure(doc, "fig_usecase.png", "Use case diagram of the Timetabling and Invigilator Verification System", 15.0)

    h2(doc, "3.6 System Architecture")
    p(doc, "The system uses a three-tier client-server architecture, shown in Figure 1. The "
           "presentation tier is a React 18 single-page application [27], delivered as an installable "
           "progressive web application [16] and hosted on Vercel. The application tier is a "
           "Node.js 20 / Express 4 REST API hosted on Render, organised into sixteen feature modules "
           "that each follow a routes -> controller -> service layering; controllers are deliberately "
           "thin, translating HTTP requests into calls on services that hold all the business rules, "
           "so the same services can be reused by the Socket.IO layer and background jobs. The data "
           "tier is a PostgreSQL 16 database hosted on Neon and accessed exclusively through Prisma "
           "ORM.")
    figure(doc, "fig_architecture.png", "Three-tier system architecture", 16.0)
    p(doc, "Every API request passes through a fixed middleware pipeline before reaching business "
           "logic, as shown in Figure 2: Helmet applies hardened response headers [23]; the CORS "
           "layer admits only the configured client origin; the rate limiter throttles abusive "
           "clients; requireAuth verifies the JWT and loads the requesting user (with a sixty-second "
           "cache) while rejecting non-active accounts; requireRole enforces the role list declared "
           "for the route; and a Zod schema [26] validates the request body, parameters and query "
           "string. Privileged operations then produce three side effects in addition to their primary "
           "result: an audit log entry, a persisted notification, and a Socket.IO broadcast to the "
           "affected rooms.")
    figure(doc, "fig_dataflow.png", "API request lifecycle through the security middleware pipeline", 16.5)

    h2(doc, "3.7 Database Design")
    p(doc, "The relational schema has fifteen models organised into six functional groups, with four "
           "enumerated types. Figure 4 presents the simplified entity-relationship diagram, and Table "
           "9 summarises the grouping. Referential integrity follows two policies: children owned by a "
           "parent (for example, a department's courses) cascade on delete, whereas the audit log's "
           "actor reference is set to null on user deletion so that historical accountability survives "
           "account removal. Composite indexes are defined on the hot query paths, notably "
           "[examinationSessionId, venueId, slotAt] for assignment and scan lookups, and a unique "
           "constraint on [examinationSessionId, venueId, slotAt, invigilatorId] structurally prevents "
           "duplicate assignments.")
    table(doc, ["Group", "Models", "Purpose"], [
        ["Identity & access", "User, RegistrationWindow, PasswordReset, EmailVerification",
         "Accounts, roles, statuses, self-registration windows and credential recovery"],
        ["Academic structure", "Department, AcademicYear, Semester, CourseLevel",
         "The institutional hierarchy into which courses are organised"],
        ["Curriculum", "Course",
         "Courses with approval state, enrolment count, duration and locking"],
        ["Examinations", "ExaminationSession, Venue, Invigilation",
         "Sessions, physical venues with capacities, and generated timetable entries"],
        ["Attendance", "VenueAssignment, VenueScan, Attendance",
         "Invigilator-to-venue rosters and every scan outcome, including rejections"],
        ["Platform", "AuditLog, Notification, Setting",
         "Immutable audit trail, user notifications and system configuration"],
    ], caption="Database models by functional group", col_widths=[1.6, 3.2, 3.2], font_size=10)
    figure(doc, "fig_erd.png", "Simplified entity-relationship diagram of the fifteen Prisma models", 16.5)
    p(doc, "Four enumerated types constrain state values at the database level. Role distinguishes "
           "SUPER_ADMIN, DEPARTMENT_HEAD and INVIGILATOR. UserStatus models the account lifecycle "
           "(PENDING_APPROVAL, ACTIVE, SUSPENDED, DISABLED, REJECTED). CourseStatus models the "
           "approval workflow (DRAFT, SUBMITTED, APPROVED, REJECTED). AttendanceResult records the "
           "outcome of every scan attempt: RECORDED for a successful check-in; REJECTED_WINDOW, "
           "REJECTED_DUPLICATE, REJECTED_UNASSIGNED, REJECTED_INVALID_QR and REJECTED_VENUE_MISMATCH "
           "for the five rejection classes; and ABSENT for records created by the automatic absence "
           "detector.")

    h2(doc, "3.8 Algorithm Design")
    h3(doc, "3.8.1 Timetable Generation")
    p(doc, "The generator is a greedy first-fit-decreasing constructor with multi-pass constraint "
           "relaxation and randomised restarts — an approach in the practical tradition identified "
           "by Muklason et al. [6] and Abdullah and Hassan [8]. Its pseudo-code is given below; the "
           "full flow appears in Chapter Four (Figure 6).")
    code_block(doc,
        "procedure GENERATE_TIMETABLE(session, dateRange, maxRetries = 20)\n"
        "  require: no SUBMITTED courses pending; at least 3 active venues\n"
        "  slots  <- {08:00, 11:00, 14:00} x weekdays(dateRange)\n"
        "  groups <- group APPROVED courses by (code, title)          // service courses\n"
        "  sort groups: practical first, lower level first, larger enrolment first\n"
        "  best <- empty\n"
        "  for attempt in 1..maxRetries:\n"
        "     shuffle(slots); sort venues by capacity ascending\n"
        "     placement <- {}\n"
        "     for pass in [FULL+GAP, FULL, RELAXED]:\n"
        "        for each unplaced group g:\n"
        "           for each slot s in slots:\n"
        "              if HARD_OK(g, s, placement, pass) and VENUES_FIT(g, s):\n"
        "                 place g in s; allocate smallest fitting venues; split if needed\n"
        "                 break\n"
        "     remove any entries violating clash constraints          // safety net\n"
        "     if |placement| > |best|: best <- placement\n"
        "     if all groups placed: break\n"
        "  persist best as Invigilation records; report unscheduled with reasons")
    p(doc, "HARD_OK enforces, in every pass, that venue capacity is respected, that no two exams of "
           "the same department and level share a slot, and that each course is scheduled exactly "
           "once. In passes one and two it additionally forbids more than one exam per day for a "
           "department-level cohort, and pass one further imposes a randomised rest gap (55% one day, "
           "25% two days, 10% three days) between that cohort's consecutive exams. VENUES_FIT "
           "allocates the smallest venue whose capacity accommodates the course; where no single "
           "venue suffices, the course is split across several venues with sequential student ranges "
           "(for example, 1-150 and 151-300), and grouped service courses are placed in distinct "
           "venues of the same slot wherever possible.")

    h3(doc, "3.8.2 Invigilator Assignment")
    p(doc, "The invigilator assignment follows the sequential approach recommended by Cimen et al. "
           "[9], with a round-robin heuristic for conflict avoidance:")
    code_block(doc,
        "procedure ASSIGN_INVIGILATORS(session)\n"
        "  pool <- all ACTIVE invigilators; cursor <- 0\n"
        "  for each (venue, slot) group in timetable(session):\n"
        "     needed <- min(4, max(1, ceil(students / 50)))\n"
        "     while assigned < needed:\n"
        "        candidate <- pool[cursor mod |pool|]; advance cursor\n"
        "        if candidate booked in slot         -> skip\n"
        "        if candidate.department in group's course departments -> skip\n"
        "        if all candidates exhausted          -> leave remainder unassigned; break\n"
        "        persist VenueAssignment(session, venue, slot, candidate)\n"
        "  notify each assigned invigilator (in-app + e-mail); emit socket events")
    p(doc, "The staffing ratio of one invigilator per fifty students, capped at four per venue and "
           "slot, reflects UENR practice. The algorithm deliberately prefers leaving a slot "
           "understaffed — which is surfaced to the officer for manual resolution — over ever "
           "double-booking an invigilator. Manual assignment through the interface passes through the "
           "same constraint checks, with two additions: an invigilator may hold only one time frame "
           "per day, and the per-venue maximum may not be exceeded.")

    h3(doc, "3.8.3 Scan Evaluation")
    p(doc, "Both stages of the scan protocol call a single shared function, evaluateVenueScan, which "
           "runs the seven-step validation pipeline (QR format; invigilator role and status; venue "
           "and session existence; examination period; venue assignment for the current slot; "
           "duplicate detection; and the time window from fifteen minutes before slot start to thirty "
           "minutes after slot end). Centralising the pipeline in one function guarantees that the "
           "preview stage and the confirm stage can never diverge in their verdicts. The full flow is "
           "presented in Chapter Four (Figure 7).")

    h2(doc, "3.9 Technology Selection")
    table(doc, ["Technology", "Version", "Justification"], [
        ["React", "18", "Component-based SPA framework with concurrent features and mature ecosystem [27]; enables the PWA delivery model"],
        ["Vite", "5", "Fast development server and optimised production builds using native ES modules"],
        ["TailwindCSS", "3", "Utility-first styling yielding consistent, responsive design without bespoke CSS"],
        ["TanStack Query", "5", "Declarative server-state caching, retries and cache invalidation on socket events [25]"],
        ["React Hook Form + Zod", "7 / 3", "Performant form handling with schema validation shared conceptually with the backend [26]"],
        ["html5-qrcode / qrcode", "-", "Browser-native camera scanning via getUserMedia and server-side QR image generation, avoiding any native app"],
        ["Node.js / Express", "20 / 4", "Single-language full stack; event-driven model well suited to I/O-bound API workloads"],
        ["Prisma ORM", "5", "Type-safe data access, generated migrations and parameterised queries eliminating SQL injection"],
        ["PostgreSQL", "16", "Mature relational engine with strong ACID guarantees, enums and composite constraints"],
        ["Socket.IO", "4", "Room-based real-time broadcast with automatic WebSocket/long-polling fallback [24]"],
        ["JWT (jsonwebtoken)", "-", "Stateless authentication suited to horizontally scalable APIs"],
        ["bcryptjs", "-", "Adaptive password hashing resistant to brute force [20], [21]"],
        ["Helmet, CORS, express-rate-limit", "-", "Defence-in-depth HTTP hardening aligned with OWASP guidance [19], [23]"],
        ["Vercel / Render / Neon / Brevo", "-", "Managed hosting for client, API, database and transactional e-mail respectively"],
    ], caption="Technology stack and selection rationale", col_widths=[2.2, 1.0, 4.8], font_size=9.5)

    h2(doc, "3.10 Testing and Evaluation Methodology")
    p(doc, "Verification of the system was done manually against the deployed application, using four "
           "complementary strategies: functional testing of every feature through the interface; "
           "negative testing of role boundaries by attempting operations as unauthorised roles, both "
           "through the interface and directly against the API; scenario testing of the scan pipeline "
           "covering every rejection class; and real-time testing with multiple concurrently "
           "connected browsers to confirm event delivery without refresh. Table 11 defines the "
           "evaluation criterion and method for each objective; the results are reported in Chapter "
           "Four.")
    table(doc, ["Objective", "Evaluation criteria", "Method"], [
        ["1. Course workflow", "All state transitions enforced server-side; locked courses immutable; audit entries created",
         "Exercise each transition; attempt to edit locked course; inspect audit records"],
        ["2. Timetable generation", "No clashes in output; venue capacity respected; unscheduled courses reported with reasons",
         "Generate timetables over seeded data; systematically inspect all entries"],
        ["3. QR verification", "Every fraudulent scenario rejected with the correct code; valid scans recorded with metadata",
         "Perform valid, wrong-venue, duplicate, out-of-window and malformed scans"],
        ["4. Invigilator assignment", "No double-booking; no same-department invigilation; staffing ratio respected",
         "Run automatic assignment; inspect all resulting assignments"],
        ["5. Real-time notification", "Events received by connected officers without refresh; ABSENT records created within 5 minutes",
         "Concurrent-browser observation; allow a scan window to lapse"],
        ["6. RBAC and audit", "Unauthorised requests rejected with 403; every privileged action logged",
         "Cross-role API probing; audit table inspection"],
    ], caption="Evaluation criteria and methods per objective", col_widths=[1.8, 3.4, 2.8], font_size=10)
