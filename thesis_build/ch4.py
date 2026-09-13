# -*- coding: utf-8 -*-
from helpers import h1, h2, h3, p, bullets, table, figure


def add(doc):
    h1(doc, "CHAPTER FOUR: SYSTEM IMPLEMENTATION, RESULTS AND DISCUSSION")

    h2(doc, "4.1 Implementation Overview")
    p(doc, "The system was built as a monorepo with two directories: a client folder holding the React "
           "18 progressive web application [16], [27], built with Vite and deployed on Vercel, and a "
           "server folder holding the Node.js/Express API, deployed on Render, with the PostgreSQL "
           "database hosted on Neon. The production deployment is publicly reachable at "
           "https://unertimetable.vercel.app. The backend consists of sixteen feature modules, each "
           "contributing routes, a controller, a service and a Zod validation schema [26]; the "
           "frontend has more than thirty route screens organised by domain, guarded by a "
           "ProtectedRoute component and served through role-filtered navigation. Figure 5 shows "
           "where the system's features sit within the end-to-end examination lifecycle it automates.")
    figure(doc, "fig_workflow.png", "End-to-end examination lifecycle supported by the system", 16.5)

    h2(doc, "4.2 User Roles and Access Control")
    p(doc, "Three roles partition the system's capabilities, enforced independently at the API layer "
           "(requireAuth and requireRole middleware) and the interface layer (ProtectedRoute and "
           "role-filtered navigation). Table 12 summarises the permission matrix.")
    table(doc, ["Capability", "Super Admin", "Dept. Head", "Invigilator"], [
        ["Approve or reject user accounts", "Yes", "No", "No"],
        ["Manage departments, years, semesters, venues", "Yes", "No", "No"],
        ["Create, edit and submit courses", "No", "Yes (own department)", "No"],
        ["Approve or reject courses", "Yes", "No", "No"],
        ["Create examination sessions", "Yes", "No", "No"],
        ["Generate and edit timetable", "Yes", "View only", "View own"],
        ["Assign invigilators (auto and manual)", "Yes", "No", "No"],
        ["Generate venue QR codes", "Yes", "No", "No"],
        ["Scan venue QR code", "No", "No", "Yes (own assignment)"],
        ["View attendance records", "Yes (all)", "No", "Yes (own history)"],
        ["Receive real-time operational events", "Yes", "Course events only", "Own assignments only"],
    ], caption="Role-permission matrix", col_widths=[3.4, 1.6, 1.7, 1.8], font_size=10)

    h2(doc, "4.3 Objective 1: Course Submission and Approval Workflow")
    h3(doc, "4.3.1 Implementation")
    p(doc, "The courses module implements a server-enforced state machine, shown in Figure 8. Heads of "
           "Department create courses with code, title, level, credit hours, student count, "
           "examination duration, special requirements, instructor and a practical-course flag; each "
           "course is scoped to the head's department and a selected semester, and uniqueness of the "
           "pair [code, semesterId] is enforced by the database. Courses begin in the DRAFT state, in "
           "which they are freely editable. Submission moves a course to SUBMITTED and notifies all "
           "Super Admins in real time. Approval sets APPROVED, records the approver and timestamp, and "
           "sets locked = true, after which the course is immutable to the department; rejection "
           "records an optional comment and returns the course to DRAFT for revision. Every "
           "transition writes an audit entry capturing actor, action, target, result and request "
           "metadata.")
    figure(doc, "fig_course_states.png", "Course approval workflow state machine", 14.5)
    h3(doc, "4.3.2 Results")
    p(doc, "Functional evaluation confirmed that all transitions are enforced server-side and cannot "
           "be bypassed by direct API calls: attempts to edit a locked course as a Head of "
           "Department were rejected, attempts to approve a course as a non-admin returned 403 "
           "Forbidden, and audit entries were present for every submit, approve and reject action "
           "performed during testing. The workflow therefore fully replaces e-mail-based collection "
           "with a validated, auditable process, satisfying Objective 1.")

    h2(doc, "4.4 Objective 2: Constraint-Based Timetable Generation")
    h3(doc, "4.4.1 Implementation")
    p(doc, "The timetable service implements the algorithm designed in Section 3.8.1, following the "
           "greedy constructive tradition validated by Muklason et al. [6] and Abdullah and Hassan "
           "[8]. Figure 6 shows the complete flow. Generation is refused until every submitted course "
           "has been resolved and at least three active venues exist — preconditions that surface "
           "data-completeness problems before scheduling rather than after. Candidate slots comprise "
           "three daily periods (08:00, 11:00 and 14:00) across the weekdays of the selected range, "
           "with weekends skipped by default. Service courses sharing a code and title across "
           "departments are grouped and placed atomically in a single slot, normally in different "
           "venues, so that a common paper is written simultaneously by all cohorts. The three-pass "
           "relaxation strategy, randomised restarts (up to twenty, retaining the best placement "
           "found), best-fit venue allocation with course splitting, and a post-placement clash "
           "safety net complete the pipeline. Persisted entries carry the scan window boundaries "
           "(windowOpensAt at slot start; windowClosesAt thirty minutes after slot end) later "
           "consumed by the attendance subsystem.")
    figure(doc, "fig_timetable_algo.png", "Constraint-based timetable generation algorithm flow", 15.0)
    h3(doc, "4.4.2 Results")
    p(doc, "Table 13 summarises the constraint verification performed on generated timetables over "
           "the seeded UENR-scale data set. In every generation run the hard constraints held for all "
           "placed entries; where the period was deliberately made too short, the generator degraded "
           "gracefully, reporting the unplaced courses with actionable reasons such as 'student "
           "count exceeds every venue capacity' or 'no conflict-free slot available in the selected "
           "period'. Generation completed in seconds for course loads in the low hundreds. The greedy "
           "approach does not guarantee optimal spread — an accepted trade-off discussed in Section "
           "4.10 — but the randomised retry strategy consistently recovered complete placements where "
           "feasible ones existed, consistent with the findings of Abdullah and Hassan [8].")
    table(doc, ["Constraint verified", "Type", "Outcome"], [
        ["No two exams of the same department and level in one slot", "Hard", "Held in all runs"],
        ["At most one exam per day per department-level cohort (passes 1-2)", "Hard", "Held; relaxed only in pass 3, never within a slot"],
        ["Student count within allocated venue capacity", "Hard", "Held in all runs; large courses split with sequential ranges"],
        ["Each approved course scheduled exactly once", "Hard", "Held; duplicates prevented"],
        ["Service course groups placed atomically in one slot", "Hard", "Held in all runs"],
        ["Rest gap of 1-3 days between a cohort's exams", "Soft", "Satisfied where period length permitted"],
        ["Unscheduled courses reported with reasons", "Reporting", "Confirmed under artificially constrained periods"],
    ], caption="Timetable generation constraint verification results", col_widths=[4.6, 1.2, 3.0], font_size=10)

    h2(doc, "4.5 Objective 3: QR-Code-Based Presence Verification")
    h3(doc, "4.5.1 Implementation")
    p(doc, "Venue QR codes encode the plain token VENUE:{venueId}:{examinationSessionId}; they are "
           "generated server-side with the qrcode library — individually or in bulk per session — and "
           "printed for posting at each venue. Invigilators scan with the device camera through the "
           "html5-qrcode library. Verification is a two-stage protocol built on the single shared "
           "evaluateVenueScan function (Figure 7): the preview endpoint runs the full validation "
           "pipeline and returns the verdict without writing to the database, allowing the "
           "invigilator to see the outcome of an accidental or exploratory scan safely; the confirm "
           "endpoint re-runs the same pipeline and persists a VenueScan record with the result, the "
           "request IP address, the user agent and, where permitted, GPS coordinates checked against "
           "the UENR campus bounding box. This venue-bound approach draws on the fraud-mitigation "
           "principles identified by Nwabuwe et al. [12], but applies them to invigilator verification "
           "without requiring a native mobile app. Crucially, rejected outcomes are persisted as "
           "well, so the scan table forms a complete forensic record of every attempt.")
    figure(doc, "fig_qr_flow.png", "Two-stage QR-code verification flow with the server-side validation pipeline", 15.0)
    h3(doc, "4.5.2 Results")
    p(doc, "Table 14 reports the scenario tests executed against the deployed system. Each fraud "
           "vector of the paper-based process is closed: remote signing is impossible because the "
           "venue's poster must be physically scanned; wrong-venue scans are rejected with guidance "
           "naming the invigilator's actual assigned venue; duplicates and out-of-window attempts are "
           "rejected and recorded; and post-hoc signing is precluded by the hard close of the window "
           "thirty minutes after the slot ends.")
    table(doc, ["Scan scenario", "Expected result", "Observed result"], [
        ["Valid scan at assigned venue within window", "RECORDED; real-time check-in event to officers", "As expected; IP, user agent and GPS captured"],
        ["Scan of a different venue's code", "REJECTED_VENUE_MISMATCH with guidance", "As expected; rejection persisted"],
        ["Second scan after a successful one", "REJECTED_DUPLICATE", "As expected"],
        ["Scan before window opens (>15 min early)", "REJECTED_WINDOW", "As expected"],
        ["Scan after window closes (>30 min after end)", "REJECTED_WINDOW", "As expected"],
        ["Malformed or foreign QR content", "REJECTED_INVALID_QR", "As expected"],
        ["Scan by a non-invigilator account", "REJECTED_UNASSIGNED", "As expected (403 at role layer for other roles)"],
        ["No scan during entire window", "ABSENT record created automatically", "Created by background job within 5 minutes"],
    ], caption="QR verification scenario test results", col_widths=[3.2, 2.8, 3.0], font_size=10)

    h2(doc, "4.6 Objective 4: Automatic Invigilator Assignment")
    h3(doc, "4.6.1 Implementation")
    p(doc, "The venue assignment service implements the round-robin algorithm of Section 3.8.2, shown "
           "in Figure 9, following the sequential approach recommended by Cimen et al. [9]. Demand per "
           "venue and slot is one invigilator per fifty students, bounded between one and four. The "
           "round-robin cursor distributes workload evenly across the active pool while two conflict "
           "rules are enforced for every candidate: no invigilator may hold two assignments in the "
           "same slot, and no invigilator may supervise a course offered by their own department. "
           "Where no conflict-free candidate remains, the slot is left visibly understaffed for "
           "manual resolution rather than ever double-booking. Manual assignment through the "
           "interface passes the same checks plus a one-time-frame-per-day rule and the per-venue "
           "maximum. Assigned invigilators receive an in-app notification, an e-mail, and a "
           "venue-assignment-updated socket event.")
    figure(doc, "fig_assignment_algo.png", "Automatic invigilator assignment algorithm", 14.5)
    h3(doc, "4.6.2 Results")
    p(doc, "Inspection of assignments generated over the seeded data confirmed the absence of "
           "double-bookings and same-department assignments across all venue-slot groups, with "
           "workload spread evenly by the cursor. The database-level unique constraint provides a "
           "structural second line of defence against duplicates. Objective 4 is therefore "
           "satisfied, with the understaffing report providing the examination officer a clear "
           "signal when the invigilator pool is insufficient.")

    h2(doc, "4.7 Objective 5: Real-Time Notification and Automatic Absence Detection")
    h3(doc, "4.7.1 Implementation")
    p(doc, "The real-time layer (Figure 10) authenticates every Socket.IO connection by verifying the "
           "JWT presented in the handshake, loading the user and rejecting non-active accounts; each "
           "socket then joins a per-user room and a per-role room. Services publish through a small "
           "broadcast utility offering toRoles and toUser primitives. The client registers listeners "
           "in the Topbar component, filtered by role so that operational events are handled only by "
           "examination officers; handlers raise a toast and invalidate the relevant TanStack Query "
           "caches [25], causing affected screens to refetch and re-render immediately. Table 15 "
           "lists the event catalogue. Complementing the push path, a background job runs every five "
           "minutes, examines venue assignments of the preceding twenty-four hours whose windows "
           "have closed, and, for any assignment without a RECORDED scan, creates an ABSENT "
           "VenueScan and notifies all Super Admins.")
    table(doc, ["Event", "Recipients", "Trigger"], [
        ["notification.created", "The affected user", "Any persisted notification"],
        ["invigilator-checkin", "role:SUPER_ADMIN", "Successful (RECORDED) venue scan"],
        ["pending-account", "role:SUPER_ADMIN", "New self-registration completing e-mail verification"],
        ["course-submitted", "role:SUPER_ADMIN and the submitting user", "Course submitted for approval"],
        ["course-approved / course-rejected", "role:SUPER_ADMIN (and notification to the department)", "Approval decision on a course"],
        ["venue-assignment-updated", "The affected invigilator", "Assignment created or removed"],
    ], caption="Real-time event catalogue", col_widths=[2.6, 3.0, 3.4], font_size=10)
    figure(doc, "fig_realtime.png", "Real-time notification architecture with role-scoped rooms and the auto-absent job", 15.5)
    h3(doc, "4.7.2 Results")
    p(doc, "With two browsers connected as different roles, every event in Table 15 was observed to "
           "arrive at the correct recipients without a page refresh, and only at those recipients — "
           "officers received operational events that department heads and invigilators did not. "
           "When a scan window was allowed to lapse, the ABSENT record and the corresponding officer "
           "notification appeared within the five-minute job interval. Objective 5 is satisfied: the "
           "examination office learns of a no-show within minutes of the window closing rather than "
           "days later.")

    h2(doc, "4.8 Objective 6: Role-Based Access Control and Audit Logging")
    h3(doc, "4.8.1 Implementation")
    p(doc, "Authentication issues a JWT with a one-day expiry on login; the client attaches it as a "
           "bearer token to every request and the Axios interceptor redirects to login on any 401 "
           "response. The requireAuth middleware verifies the signature, loads the user through a "
           "sixty-second cache, and rejects accounts that are not ACTIVE, so that suspension takes "
           "effect within a minute even for holders of valid tokens. Authorisation is declared per "
           "route through requireRole. A timing-attack mitigation performs a dummy bcrypt comparison "
           "for sign-in attempts against non-existent accounts, equalising response times [20], "
           "[21]. The audit subsystem exposes a single logAudit utility invoked by every privileged "
           "service action, recording actor, action, target type and identifier, result, JSON "
           "metadata, IP address, user agent and timestamp; no update or delete path exists for audit "
           "rows, and the actor foreign key is set to null on user deletion so history survives "
           "account removal. Nineteen action types are logged, spanning user lifecycle (login, "
           "register, approve, reject, update, delete, password change), course workflow (submit, "
           "approve, reject), timetable operations (generate, entry update, entry delete, delete), "
           "venue assignment (generate, manual assign, remove) and registration windows (set, "
           "close).")
    h3(doc, "4.8.2 Results")
    p(doc, "Cross-role probing of the API — for example, a department head calling the "
           "course-approval endpoint or an invigilator calling timetable generation — consistently "
           "returned 403 Forbidden, and unauthenticated requests returned 401. Inspection of the "
           "audit table after the evaluation sessions showed a complete, chronologically ordered "
           "record of every privileged action performed, including the rejected attempts' "
           "authentication context. Objective 6 is satisfied at both enforcement layers.")

    h2(doc, "4.9 Security Implementation Summary")
    table(doc, ["Layer", "Measure implemented"], [
        ["Transport", "HTTPS termination on all production endpoints (Vercel/Render TLS)"],
        ["HTTP headers", "Helmet-hardened responses; x-powered-by disabled [23]"],
        ["Cross-origin policy", "Strict CORS allow-list bound to the configured client origin"],
        ["Abuse resistance", "express-rate-limit on the API; timing-equalised login comparisons"],
        ["Credentials", "bcrypt hashing with configurable cost [20], [21]; e-mailed reset tokens; 6-digit e-mail verification"],
        ["Sessions", "JWT with one-day expiry; server-side status gate on every request; 401 interception on the client"],
        ["Authorisation", "RBAC middleware on every route; ProtectedRoute and filtered navigation on the client"],
        ["Input handling", "Zod schema validation of body, params and query on all endpoints [26]"],
        ["Data access", "Prisma parameterised queries throughout (no string-built SQL)"],
        ["Scan integrity", "Venue-bound QR tokens validated exclusively server-side; all outcomes persisted"],
        ["Account lifecycle", "PENDING_APPROVAL gate; SUSPENDED/DISABLED/REJECTED states enforced within 60 s"],
        ["Location", "Optional GPS capture checked against the UENR campus bounding box"],
        ["Accountability", "Immutable AuditLog with actor, action, target, result, IP and user agent"],
    ], caption="Security measures by layer", col_widths=[2.2, 5.8], font_size=10)

    h2(doc, "4.10 Discussion")
    p(doc, "The evaluation shows that all six objectives were met and that the integrated design "
           "delivers benefits its parts could not achieve in isolation. Because the timetable "
           "generator writes the scan windows that the attendance subsystem later enforces, and "
           "because the assignment service feeds both the invigilator's interface and the auto-absent "
           "detector, a single chain of custody runs from course approval to the forensic record of "
           "each venue scan — exactly the end-to-end accountability that was found missing in the "
           "reviewed literature [1], [12].")
    p(doc, "Three design decisions deserve particular comment. First, binding QR codes to venues "
           "rather than users inverts the trust model of prior QR attendance work [10], [11]: the "
           "code may be public precisely because possession proves nothing without a valid "
           "assignment, an open window and no prior scan, all adjudicated server-side. This aligns "
           "with the fraud-mitigation principles of Nwabuwe et al. [12] but extends them to "
           "invigilator verification without a native app. Second, the two-stage scan protocol "
           "resolves the tension between usability and data hygiene — invigilators can scan "
           "exploratively without polluting the record, yet the confirm stage re-validates "
           "atomically through the same shared function, so the preview can never promise what the "
           "confirmation would refuse. Third, preferring visible understaffing to double-booking in "
           "the assignment algorithm accepts a small manual burden in exchange for a guarantee that "
           "the published roster is always physically executable.")
    p(doc, "The principal trade-off accepted is the greedy scheduler's lack of optimality. For "
           "UENR's scale the randomised-restart strategy consistently found complete placements, "
           "consistent with the constructive-heuristic results of Abdullah and Hassan [8], but the "
           "approach may leave courses unscheduled on substantially larger or more constrained "
           "instances where a metaheuristic would succeed [3], [4]; this is mitigated operationally "
           "by the actionable unscheduled report and architecturally by the service isolation of the "
           "generator, which permits a drop-in replacement. Remaining weaknesses — the absence of an "
           "automated test suite, the unimplemented audit viewer, optional rather than enforced GPS, "
           "and the lack of formal user-acceptance testing — are honest limitations addressed in the "
           "recommendations of Chapter Five.")
