# -*- coding: utf-8 -*-
"""Generate all thesis figures as high-resolution PNGs (accurate to the real system)."""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Polygon, Ellipse
import matplotlib.lines as mlines

OUT = os.path.join(os.path.dirname(__file__), "figs")
os.makedirs(OUT, exist_ok=True)

FONT = "DejaVu Sans"
plt.rcParams["font.family"] = FONT

# ---------- helpers ----------
def box(ax, x, y, w, h, text, fc="#EFF6FF", ec="#1E3A5F", fs=8.5, bold=False, rounded=True, tc="#111827"):
    style = "round,pad=0.02,rounding_size=0.06" if rounded else "square,pad=0.02"
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=style, fc=fc, ec=ec, lw=1.2))
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs,
            fontweight="bold" if bold else "normal", color=tc, wrap=True)
    return (x, y, w, h)

def diamond(ax, cx, cy, w, h, text, fc="#FEF3C7", ec="#92400E", fs=8.5):
    ax.add_patch(Polygon([(cx, cy + h/2), (cx + w/2, cy), (cx, cy - h/2), (cx - w/2, cy)],
                         closed=True, fc=fc, ec=ec, lw=1.2))
    ax.text(cx, cy, text, ha="center", va="center", fontsize=fs, color="#111827")

def arrow(ax, x1, y1, x2, y2, label=None, fs=8, color="#374151", ls="-", lw=1.3, lx=0.0, ly=0.0):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="-|>", mutation_scale=13,
                                 color=color, lw=lw, linestyle=ls, shrinkA=2, shrinkB=2))
    if label:
        ax.text((x1 + x2) / 2 + lx, (y1 + y2) / 2 + ly, label, fontsize=fs, ha="center",
                va="center", color=color, bbox=dict(fc="white", ec="none", pad=1))

def canvas(w, h, ymin=0):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, 100); ax.set_ylim(ymin, 100)
    ax.axis("off")
    return fig, ax

def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=200, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print("saved", name)

# =====================================================================
# FIG 1 : Three-tier system architecture (accurate)
# =====================================================================
def fig_architecture():
    fig, ax = canvas(11, 8.6)
    ax.text(50, 98.5, "System Architecture — Timetabling and Invigilator Verification System",
            ha="center", fontsize=12, fontweight="bold")

    # Presentation tier
    ax.add_patch(FancyBboxPatch((2, 68), 96, 26, boxstyle="round,pad=0.02", fc="#F0F9FF", ec="#0369A1", lw=1.6))
    ax.text(4, 91.5, "PRESENTATION TIER — React 18 SPA (Progressive Web App, Vercel)", fontsize=10, fontweight="bold", color="#0369A1")
    box(ax, 4, 70, 21, 17, "Exam Officer Dashboard\n\n• Timetable generation\n• Course approvals\n• QR code management\n• Attendance monitor", fc="#E0F2FE", ec="#0369A1", fs=8)
    box(ax, 27, 70, 21, 17, "Department Head\nInterface\n\n• Course submission\n• Course levels\n• Timetable view", fc="#E0F2FE", ec="#0369A1", fs=8)
    box(ax, 50, 70, 21, 17, "Invigilator Portal\n\n• My assignments\n• QR scanner\n  (html5-qrcode)\n• Attendance history", fc="#E0F2FE", ec="#0369A1", fs=8)
    box(ax, 73, 70, 23, 17, "Shared Infrastructure\n\n• AuthContext + JWT\n• TanStack Query cache\n• Socket.IO client\n• Service worker (PWA)", fc="#E0F2FE", ec="#0369A1", fs=8)

    arrow(ax, 30, 68, 30, 61.5, "HTTPS REST (Axios + JWT)", fs=8.5, lx=-14)
    arrow(ax, 70, 61.5, 70, 68, "WebSocket events (Socket.IO)", fs=8.5, lx=16)

    # Application tier
    ax.add_patch(FancyBboxPatch((2, 26), 96, 35, boxstyle="round,pad=0.02", fc="#F5F3FF", ec="#5B21B6", lw=1.6))
    ax.text(4, 58.2, "APPLICATION TIER — Node.js 20 / Express 4 REST API (Render)", fontsize=10, fontweight="bold", color="#5B21B6")
    box(ax, 4, 50, 92, 6,
        "Middleware pipeline:  Helmet → CORS allow-list → compression → rate limiting → JWT auth → RBAC → Zod validation",
        fc="#EDE9FE", ec="#5B21B6", fs=8.5)
    box(ax, 4, 29, 26, 18, "Feature Modules (16)\nroutes → controller → service\n\nauth · users · courses ·\ntimetable · venues ·\nvenueAssignments ·\nattendance · notifications …", fc="#EDE9FE", ec="#5B21B6", fs=8)
    box(ax, 32, 29, 22, 18, "Core Services\n\n• Greedy timetable\n  scheduler (3-pass,\n  20 retries)\n• Round-robin invigilator\n  assignment\n• evaluateVenueScan()", fc="#EDE9FE", ec="#5B21B6", fs=8)
    box(ax, 56, 29, 20, 18, "Background & Real-time\n\n• Auto-absent checker\n  (5-min interval)\n• Socket.IO server\n  (role/user rooms)\n• Audit logger", fc="#EDE9FE", ec="#5B21B6", fs=8)
    box(ax, 78, 29, 18, 18, "Integrations\n\n• Nodemailer / SMTP\n  (Brevo)\n• QR generation\n  (qrcode lib)\n• Optional SMS", fc="#EDE9FE", ec="#5B21B6", fs=8)

    arrow(ax, 50, 26, 50, 19.5, "Prisma ORM 5 (parameterised queries)", fs=8.5, lx=22)

    # Data tier
    ax.add_patch(FancyBboxPatch((2, 2), 96, 17.5, boxstyle="round,pad=0.02", fc="#F0FDF4", ec="#166534", lw=1.6))
    ax.text(4, 16.6, "DATA TIER — PostgreSQL 16 (Neon)", fontsize=10, fontweight="bold", color="#166534")
    box(ax, 5, 4, 28, 10, "Identity & Academic\n\nUser · RegistrationWindow ·\nDepartment · AcademicYear ·\nSemester · CourseLevel · Course", fc="#DCFCE7", ec="#166534", fs=8)
    box(ax, 36, 4, 28, 10, "Examinations & Attendance\n\nExaminationSession · Venue ·\nInvigilation · VenueAssignment ·\nVenueScan · Attendance", fc="#DCFCE7", ec="#166534", fs=8)
    box(ax, 67, 4, 28, 10, "Platform\n\nAuditLog (immutable) ·\nNotification · Setting ·\nPasswordReset · EmailVerification", fc="#DCFCE7", ec="#166534", fs=8)
    save(fig, "fig_architecture.png")

# =====================================================================
# FIG 2 : End-to-end examination lifecycle (8 phases)
# =====================================================================
def fig_workflow():
    fig, ax = canvas(11, 8.2)
    ax.text(50, 98, "End-to-End Examination Lifecycle Workflow", ha="center", fontsize=12, fontweight="bold")
    phases = [
        ("1. INITIAL DATA SETUP\n(Exam Officer)",
         "• Seed departments, academic\n  years, semesters\n• Register venues + capacities\n• Open registration windows", "#DBEAFE", "#1D4ED8"),
        ("2. USER REGISTRATION\n& APPROVAL",
         "• Dept. Heads / Invigilators\n  self-register\n• 6-digit e-mail verification\n• Officer approves accounts\n  (PENDING → ACTIVE)", "#DCFCE7", "#15803D"),
        ("3. COURSE SUBMISSION\n(Dept. Heads)",
         "• Create courses (code, title,\n  level, student count, duration)\n• DRAFT → SUBMITTED\n• Zod validation, unique\n  [code, semester]", "#FEF9C3", "#A16207"),
        ("4. REVIEW & APPROVAL\n(Exam Officer)",
         "• Approve / reject with comment\n• APPROVED courses locked\n• Rejected returns to DRAFT\n• Audit-logged", "#FFE4E6", "#BE123C"),
        ("5. TIMETABLE GENERATION",
         "• Greedy first-fit-decreasing\n• 3-pass fallback, ≤20 retries\n• Hard constraints + venue\n  splitting\n• Unscheduled report", "#EDE9FE", "#6D28D9"),
        ("6. INVIGILATOR\nASSIGNMENT",
         "• Round-robin, conflict-free\n• 1 per 50 students, max 4/venue\n• No double-booking / same dept.\n• E-mail + in-app notifications", "#CFFAFE", "#0E7490"),
        ("7. EXAM DAY — QR\nVERIFICATION",
         "• Venue-bound QR posted at hall\n• Two-stage scan:\n  preview → confirm\n• Window: −15 min to +30 min\n• Rejections persisted for audit", "#FFEDD5", "#C2410C"),
        ("8. MONITORING &\nPOST-EXAMINATION",
         "• Real-time check-in events\n• Auto-absent job (5 min)\n• Attendance records &\n  audit trail retained", "#F3E8FF", "#7E22CE"),
    ]
    # 2 rows x 4 columns; row1 left->right, row2 right->left (snake)
    coords = [(3 + i * 24.25, 55) for i in range(4)] + [(3 + (3 - i) * 24.25, 12) for i in range(4)]
    W, Hh, Hb = 22.5, 8, 26
    for (title, body, fc, ec), (x, y) in zip(phases, coords):
        box(ax, x, y + Hb, W, Hh, title, fc=ec, ec=ec, fs=8.6, bold=True, tc="white")
        box(ax, x, y, W, Hb, body, fc=fc, ec=ec, fs=7.6)
    # arrows row 1
    for i in range(3):
        arrow(ax, 3 + i * 24.25 + W, 72, 3 + (i + 1) * 24.25, 72)
    # down arrow from phase 4 to phase 5 (right side down)
    arrow(ax, 3 + 3 * 24.25 + W / 2, 55, 3 + 3 * 24.25 + W / 2, 46)
    # arrows row 2 (right -> left)
    for i in range(3):
        x_from = 3 + (3 - i) * 24.25
        arrow(ax, x_from, 29, x_from - 1.75, 29)
    save(fig, "fig_workflow.png")

# =====================================================================
# FIG 3 : Timetable generation algorithm flowchart (greedy, accurate)
# =====================================================================
def fig_timetable_algo():
    fig, ax = canvas(9.5, 13.2, ymin=-10)
    ax.text(50, 99.3, "Constraint-Based Timetable Generation — Algorithm Flow", ha="center", fontsize=12, fontweight="bold")
    cx, W, H = 36, 46, 4.6
    steps = [
        ("Exam Officer requests timetable generation\n(session, date range, options)", "#DBEAFE"),
        ("Precondition checks: no pending course\nsubmissions; ≥ 3 active venues", "#DBEAFE"),
        ("Generate candidate slots: 3 daily periods\n(08:00, 11:00, 14:00) × weekdays in range", "#EFF6FF"),
        ("Group service courses (same code + title)\ninto atomic groups", "#EFF6FF"),
        ("Sort groups: practical first → lower level\nfirst → largest student count first", "#EFF6FF"),
        ("Shuffle slots; sort venues by\ncapacity ascending (best-fit)", "#EFF6FF"),
        ("PASS 1: place groups with full hard constraints\n+ random rest-gap soft constraint (1–3 days)", "#EDE9FE"),
        ("PASS 2: retry unplaced groups\nwithout the gap constraint", "#EDE9FE"),
        ("PASS 3: relaxed — allow same dept+level on same\nday in different periods (never same slot)", "#EDE9FE"),
        ("Allocate venues: smallest fitting venue;\nsplit large courses across venues (ranges)", "#EFF6FF"),
        ("Post-placement clash safety net:\nremove conflicting entries", "#FFE4E6"),
    ]
    ys = []
    y = 93.2
    for text, fc in steps:
        box(ax, cx - W / 2, y - H, W, H, text, fc=fc, fs=8)
        ys.append(y)
        y -= H + 2.2
    for i in range(len(steps) - 1):
        arrow(ax, cx, ys[i] - H, cx, ys[i + 1])
    # decision
    dy = y - 4.4
    diamond(ax, cx, dy, 34, 9.5, "All courses placed OR\n20 attempts reached?")
    arrow(ax, cx, ys[-1] - H, cx, dy + 4.75)
    # No branch: loop back with new randomisation
    arrow(ax, cx - 17, dy, 6, dy, "No", fs=8.5)
    ax.add_patch(FancyArrowPatch((6, dy), (6, ys[5] - H / 2), arrowstyle="-", color="#374151", lw=1.3))
    arrow(ax, 6, ys[5] - H / 2, cx - W / 2, ys[5] - H / 2, "retry with new randomisation\n(keep best result)", fs=7.6, lx=0, ly=3.2)
    # Yes branch
    ey = dy - 9.6
    arrow(ax, cx, dy - 4.75, cx, ey, "Yes", fs=8.5, lx=3)
    box(ax, cx - W / 2, ey - H, W, H, "Persist best result as Invigilation records\n(windowOpensAt / windowClosesAt)", fc="#DCFCE7")
    arrow(ax, cx, ey - H, cx, ey - H - 2.2)
    box(ax, cx - W / 2, ey - 2 * H - 2.2, W, H, "Report scheduled entries +\nunscheduled courses with reasons", fc="#DCFCE7")
    # side note: hard constraints
    box(ax, 74, 52, 24, 26, "HARD CONSTRAINTS\n\n• Venue capacity not\n  exceeded per slot\n• No same dept + level\n  in one slot\n• One exam per day per\n  dept + level (P1, P2)\n• Each course scheduled\n  exactly once\n\nSOFT CONSTRAINT\n\n• Random rest gap of\n  1–3 days between exams\n  of same dept + level", fc="#FFFBEB", ec="#92400E", fs=7.8)
    save(fig, "fig_timetable_algo.png")

# =====================================================================
# FIG 4 : Use case diagram
# =====================================================================
def fig_usecase():
    fig, ax = canvas(10.5, 8)
    ax.text(50, 98, "Use Case Diagram — Timetabling and Invigilator Verification System", ha="center", fontsize=12, fontweight="bold")
    # system boundary
    ax.add_patch(FancyBboxPatch((22, 4), 60, 88, boxstyle="round,pad=0.02", fc="#FAFAFA", ec="#374151", lw=1.4))
    ax.text(50, 89.5, "System Boundary", ha="center", fontsize=9, style="italic", color="#6B7280")

    def actor(x, y, name):
        ax.add_patch(Ellipse((x, y + 7), 3.2, 4, fc="white", ec="#111827", lw=1.2))
        ax.add_line(mlines.Line2D([x, x], [y + 5, y + 0.5], color="#111827", lw=1.2))
        ax.add_line(mlines.Line2D([x - 2.4, x + 2.4], [y + 3.6, y + 3.6], color="#111827", lw=1.2))
        ax.add_line(mlines.Line2D([x, x - 2], [y + 0.5, y - 2.5], color="#111827", lw=1.2))
        ax.add_line(mlines.Line2D([x, x + 2], [y + 0.5, y - 2.5], color="#111827", lw=1.2))
        ax.text(x, y - 5.5, name, ha="center", fontsize=9, fontweight="bold")

    def uc(x, y, text, w=22, h=7, fs=7.8):
        ax.add_patch(Ellipse((x, y), w, h, fc="#EFF6FF", ec="#1E3A5F", lw=1.1))
        ax.text(x, y, text, ha="center", va="center", fontsize=fs)

    actor(9, 72, "Super Admin\n(Exam Officer)")
    actor(9, 34, "Department\nHead")
    actor(92, 55, "Invigilator")

    sa = [(43, 86, "Approve / reject accounts"), (43, 77.5, "Manage academic structure\n& venues"),
          (43, 69, "Approve / reject courses"), (43, 60.5, "Generate timetable"),
          (43, 52, "Assign invigilators"), (43, 43.5, "Generate venue QR codes"),
          (43, 35, "Monitor attendance\n(real-time)")]
    dh = [(43, 26.5, "Create / edit / submit courses"), (43, 18, "Configure course levels"),
          (43, 9.5, "View examination timetable")]
    inv = [(69, 82, "View my assignments"), (69, 72, "Scan venue QR code\n(preview → confirm)"),
           (69, 62, "View attendance history"), (69, 20, "Receive notifications")]
    for x, y, t in sa: uc(x, y, t)
    for x, y, t in dh: uc(x, y, t)
    for x, y, t in inv: uc(x, y, t)
    for x, y, t in sa:
        arrow(ax, 13, 76, x - 12, y, color="#9CA3AF", lw=0.9)
    for x, y, t in dh:
        arrow(ax, 13, 32, x - 12, y, color="#9CA3AF", lw=0.9)
    for x, y, t in inv:
        arrow(ax, 88, 57, x + 12, y, color="#9CA3AF", lw=0.9)
    # shared: dept head + timetable view also for invigilator? keep simple
    save(fig, "fig_usecase.png")

# =====================================================================
# FIG 5 : Entity-relationship diagram (simplified, 15 models)
# =====================================================================
def fig_erd():
    fig, ax = canvas(11.5, 8.6)
    ax.text(50, 98.5, "Entity-Relationship Diagram (Simplified) — 15 Prisma Models", ha="center", fontsize=12, fontweight="bold")

    def ent(x, y, w, h, name, fields, fc="#EFF6FF", ec="#1E3A5F", hh=4):
        box(ax, x, y + h - hh, w, hh, name, fc=ec, ec=ec, fs=7.8, bold=True, tc="white", rounded=False)
        box(ax, x, y, w, h - hh, fields, fc=fc, ec=ec, fs=7.2, rounded=False)
        return (x, y, w, h)

    ent(3, 74, 20, 20, "User", "id PK\nname, email UQ\nrole (enum)\nstatus (enum)\ndepartmentId FK", "#DBEAFE", "#1D4ED8")
    ent(3, 50, 20, 18, "Department", "id PK\nname UQ\ncode UQ", "#DBEAFE", "#1D4ED8")
    ent(3, 28, 20, 16, "AcademicYear", "id PK\nlabel UQ\nisActive", "#DBEAFE", "#1D4ED8")
    ent(3, 6, 20, 16, "Semester", "id PK\nname, academicYearId FK\nisActive", "#DBEAFE", "#1D4ED8")

    ent(28, 74, 22, 20, "Course", "id PK\ncode, title, level\nstudentCount, duration\nstatus (enum), locked\ndepartmentId FK\nsemesterId FK", "#FEF9C3", "#A16207")
    ent(28, 50, 22, 18, "CourseLevel", "id PK\ndepartmentId FK\nlevel, isActive", "#FEF9C3", "#A16207")
    ent(28, 6, 22, 16, "ExaminationSession", "id PK\nname, startDate, endDate\nsemesterId FK", "#DCFCE7", "#15803D")

    ent(55, 74, 22, 20, "Invigilation\n(timetable entry)", "id PK\ncourseId FK, venueId FK\nexaminationSessionId FK\nslotAt, studentRange\nwindowOpensAt/ClosesAt", "#DCFCE7", "#15803D")
    ent(55, 50, 22, 18, "Venue", "id PK\nname UQ, capacity\nisActive", "#DCFCE7", "#15803D")
    ent(55, 26, 22, 18, "VenueAssignment", "id PK\nexaminationSessionId FK\nvenueId FK, slotAt\ninvigilatorId FK\nUQ [session,venue,slot,inv]", "#FFEDD5", "#C2410C")
    ent(55, 4, 22, 16, "VenueScan", "id PK\nvenueId FK, invigilatorId FK\nexaminationSessionId FK\nresult (enum), scannedAt\nip, userAgent, lat/lng", "#FFEDD5", "#C2410C")

    ent(82, 74, 16, 20, "AuditLog", "id PK\nactorId FK (SetNull)\naction, targetType\nresult, metadata\nip, userAgent", "#F3E8FF", "#7E22CE")
    ent(82, 50, 16, 18, "Notification", "id PK\nuserId FK\ntype, title, body\nreadAt", "#F3E8FF", "#7E22CE")
    ent(82, 28, 16, 17, "RegistrationWindow\nPasswordReset\nEmailVerification", "supporting identity\nmodels", "#F3E8FF", "#7E22CE", hh=9)
    ent(82, 8, 16, 15, "Setting /\nAttendance", "platform + legacy\nattendance models", "#F3E8FF", "#7E22CE", hh=7)

    def rel(x1, y1, x2, y2, label):
        arrow(ax, x1, y1, x2, y2, label, fs=7.4, color="#6B7280", lw=1.0)

    rel(13, 74, 13, 68, "1..*")                       # Dept -> User
    rel(23, 59, 28, 59, "1..*")                       # Dept -> CourseLevel
    rel(23, 66, 28, 78, "1..*")                       # Dept -> Course
    rel(13, 28, 13, 22, "1..*")                       # AcademicYear -> Semester
    rel(23, 14, 28, 14, "1..*")                       # Semester -> ExamSession
    rel(50, 84, 55, 84, "1..*")                       # Course -> Invigilation
    rel(66, 68, 66, 74, "1..*")                       # Venue -> Invigilation
    rel(66, 44, 66, 50, "1..*")                       # VenueAssignment -> Venue
    rel(66, 26, 66, 20, "")                           # assignment ~ scan
    rel(77, 84, 82, 84, "actor")                      # -> AuditLog
    rel(77, 59, 82, 59, "user 1..*")                  # -> Notification
    save(fig, "fig_erd.png")

# =====================================================================
# FIG 6 : Two-stage QR verification sequence
# =====================================================================
def fig_qr_flow():
    fig, ax = canvas(10, 11.5)
    ax.text(50, 99.2, "Two-Stage QR-Code Verification Flow", ha="center", fontsize=12, fontweight="bold")
    cx, W, H = 38, 52, 5.2
    steps = [
        ("Invigilator opens Scan page during exam window\n(camera via html5-qrcode / getUserMedia)", "#DBEAFE"),
        ("Scan venue QR poster → decode token\nformat: VENUE:{venueId}:{sessionId}", "#DBEAFE"),
        ("STAGE 1 — POST /attendance/scan-venue/preview\n(server runs evaluateVenueScan(); no DB write)", "#EDE9FE"),
    ]
    y = 93
    ys = []
    for t, fc in steps:
        box(ax, cx - W / 2, y - H, W, H, t, fc=fc, fs=8.4)
        ys.append(y); y -= H + 2.4
    for i in range(2):
        arrow(ax, cx, ys[i] - H, cx, ys[i + 1])

    checks = ("VALIDATION PIPELINE (server-side)\n\n"
              "1. QR format valid?          → REJECTED_INVALID_QR\n"
              "2. Active INVIGILATOR?      → REJECTED_UNASSIGNED\n"
              "3. Venue & session exist?    → REJECTED_INVALID_QR\n"
              "4. Within exam period?       → REJECTED_WINDOW\n"
              "5. Assigned to this venue?   → REJECTED_VENUE_MISMATCH\n"
              "6. Not already scanned?      → REJECTED_DUPLICATE\n"
              "7. Within time window\n    (−15 min … +30 min)?     → REJECTED_WINDOW\n\n"
              "All pass → RECORDED")
    arrow(ax, cx, ys[2] - H, cx, ys[2] - H - 2.4)
    box(ax, cx - W / 2, ys[2] - H - 2.4 - 21, W, 21, checks, fc="#FFFBEB", ec="#92400E", fs=8)
    dy = ys[2] - H - 2.4 - 21 - 7.4
    diamond(ax, cx, dy, 30, 8.6, "Preview result\n= RECORDED?")
    arrow(ax, cx, ys[2] - H - 2.4 - 21, cx, dy + 4.3)
    # No
    arrow(ax, cx + 15, dy, 74, dy, "No", fs=8.5)
    box(ax, 74, dy - 3.4, 24, 6.8, "Show rejection reason +\nguidance (e.g. actual\nassigned venue)", fc="#FFE4E6", ec="#BE123C", fs=7.8)
    # Yes
    y2 = dy - 8.8
    arrow(ax, cx, dy - 4.3, cx, y2, "Yes — user confirms", fs=8.2, lx=13)
    box(ax, cx - W / 2, y2 - H, W, H, "STAGE 2 — POST /attendance/scan-venue\n(evaluateVenueScan() re-run; VenueScan persisted)", fc="#EDE9FE")
    arrow(ax, cx, y2 - H, cx, y2 - H - 2.4)
    box(ax, cx - W / 2, y2 - 2 * H - 2.4, W, H, "If RECORDED: broadcast 'invigilator-checkin' to\nSUPER_ADMIN room; capture IP, user agent, GPS", fc="#DCFCE7", ec="#15803D")
    save(fig, "fig_qr_flow.png")

# =====================================================================
# FIG 7 : Invigilator assignment flowchart
# =====================================================================
def fig_assignment_algo():
    fig, ax = canvas(9, 10.5)
    ax.text(50, 99.2, "Automatic Invigilator Assignment — Round-Robin with Conflict Avoidance", ha="center", fontsize=11.5, fontweight="bold")
    cx, W, H = 40, 52, 5.4
    steps = [
        ("Fetch all ACTIVE invigilators and all timetable\nentries (venue, slot, student count)", "#DBEAFE"),
        ("Group timetable entries by (venue, slot)", "#EFF6FF"),
        ("For each venue-slot group compute demand:\nneeded = min(4, max(1, ceil(students / 50)))", "#EFF6FF"),
        ("Advance round-robin cursor over invigilator pool", "#EDE9FE"),
    ]
    y = 93; ys = []
    for t, fc in steps:
        box(ax, cx - W / 2, y - H, W, H, t, fc=fc, fs=8.6)
        ys.append(y); y -= H + 2.6
    for i in range(3):
        arrow(ax, cx, ys[i] - H, cx, ys[i + 1])
    d1y = y - 5.4
    diamond(ax, cx, d1y, 36, 10, "Candidate already booked in\nthis slot, or from same dept.\nas examined course?")
    arrow(ax, cx, ys[3] - H, cx, d1y + 5)
    # Yes -> skip candidate, next cursor
    arrow(ax, cx + 18, d1y, 78, d1y, "Yes", fs=8.5)
    box(ax, 78, d1y - 3, 19, 6, "Skip candidate;\ntry next in pool", fc="#FFE4E6", ec="#BE123C", fs=8)
    ax.add_patch(FancyArrowPatch((87.5, d1y + 3), (87.5, ys[3] - H / 2), arrowstyle="-", color="#374151", lw=1.2))
    arrow(ax, 87.5, ys[3] - H / 2, cx + W / 2, ys[3] - H / 2)
    # No -> assign
    y3 = d1y - 5 - 3
    arrow(ax, cx, d1y - 5, cx, y3, "No", fs=8.5, lx=3)
    box(ax, cx - W / 2, y3 - H, W, H, "Assign invigilator; persist VenueAssignment\nUQ [session, venue, slot, invigilator]", fc="#DCFCE7", ec="#15803D", fs=8.6)
    d2y = y3 - H - 8
    diamond(ax, cx, d2y, 34, 9, "Demand met for this\nvenue-slot group?")
    arrow(ax, cx, y3 - H, cx, d2y + 4.5)
    arrow(ax, cx - 17, d2y, 8, d2y, "No", fs=8.5)
    ax.add_patch(FancyArrowPatch((8, d2y), (8, ys[3] - H / 2), arrowstyle="-", color="#374151", lw=1.2))
    arrow(ax, 8, ys[3] - H / 2, cx - W / 2, ys[3] - H / 2)
    y4 = d2y - 4.5 - 3
    arrow(ax, cx, d2y - 4.5, cx, y4, "Yes", fs=8.5, lx=3)
    box(ax, cx - W / 2, y4 - H, W, H, "If no conflict-free candidate exists: leave slot\nunassigned (never double-book)", fc="#FFFBEB", ec="#92400E", fs=8.4)
    arrow(ax, cx, y4 - H, cx, y4 - H - 2.6)
    box(ax, cx - W / 2, y4 - 2 * H - 2.6, W, H, "Notify each assigned invigilator (in-app + e-mail)\nand emit 'venue-assignment-updated' socket event", fc="#DCFCE7", ec="#15803D", fs=8.4)
    save(fig, "fig_assignment_algo.png")

# =====================================================================
# FIG 8 : Real-time notification architecture
# =====================================================================
def fig_realtime():
    fig, ax = canvas(10.5, 7.2)
    ax.text(50, 97.5, "Real-Time Notification Architecture (Socket.IO)", ha="center", fontsize=12, fontweight="bold")
    box(ax, 4, 62, 26, 24, "Event Sources (services)\n\n• attendance.service\n  (invigilator-checkin)\n• courses.service\n  (course-submitted/approved/\n   rejected)\n• users.service (pending-account)\n• venueAssignments.service\n• autoAbsent.service (ABSENT)", fc="#EDE9FE", ec="#5B21B6", fs=8)
    box(ax, 38, 66, 26, 16, "Socket.IO Server\n\nJWT handshake auth →\nload user → join rooms:\nuser:{userId}\nrole:{userRole}", fc="#DBEAFE", ec="#1D4ED8", fs=8.4)
    box(ax, 38, 44, 26, 12, "broadcast utility\n\ntoRoles(roles, event, data)\ntoUser(userId, event, data)", fc="#DBEAFE", ec="#1D4ED8", fs=8.4)
    arrow(ax, 30, 74, 38, 74)
    arrow(ax, 51, 66, 51, 56)
    box(ax, 72, 72, 25, 16, "role:SUPER_ADMIN room\n\ncheck-ins, pending accounts,\ncourse events, absences", fc="#DCFCE7", ec="#15803D", fs=8.2)
    box(ax, 72, 50, 25, 14, "user:{id} rooms\n\nnotification.created,\nvenue-assignment-updated", fc="#DCFCE7", ec="#15803D", fs=8.2)
    arrow(ax, 64, 52, 72, 57)
    arrow(ax, 64, 52, 72, 78)
    box(ax, 10, 8, 80, 24, "Client (Topbar component)\n\n• Registers role-filtered listeners (exam-officer events only for SUPER_ADMIN)\n• Shows toast notification  •  Invalidates TanStack Query caches  →  UI re-renders instantly\n• Transports: WebSocket with HTTP long-polling fallback", fc="#F0F9FF", ec="#0369A1", fs=9)
    arrow(ax, 84.5, 50, 60, 32, "push events", fs=8.4, lx=8)
    box(ax, 4, 38, 26, 14, "Auto-Absent Job\n(every 5 minutes)\n\nmissed scan → ABSENT\nVenueScan + notify officers", fc="#FFE4E6", ec="#BE123C", fs=8.2)
    arrow(ax, 30, 45, 38, 50)
    save(fig, "fig_realtime.png")

# =====================================================================
# FIG 9 : Request lifecycle / middleware pipeline
# =====================================================================
def fig_dataflow():
    fig, ax = canvas(11, 4.6)
    ax.text(50, 95, "API Request Lifecycle — Security Middleware Pipeline", ha="center", fontsize=12, fontweight="bold")
    stages = [
        ("Client\n(Axios + JWT)", "#DBEAFE", "#1D4ED8"),
        ("Helmet\nheaders", "#EDE9FE", "#5B21B6"),
        ("CORS\nallow-list", "#EDE9FE", "#5B21B6"),
        ("Rate\nlimiter", "#EDE9FE", "#5B21B6"),
        ("JWT auth\n(requireAuth)", "#FEF9C3", "#A16207"),
        ("RBAC\n(requireRole)", "#FEF9C3", "#A16207"),
        ("Zod\nvalidation", "#FEF9C3", "#A16207"),
        ("Controller\n→ Service", "#DCFCE7", "#15803D"),
        ("Prisma →\nPostgreSQL", "#DCFCE7", "#15803D"),
    ]
    n = len(stages); W = 9.4; gap = (100 - 4 - n * W) / (n - 1)
    x = 2
    for i, (t, fc, ec) in enumerate(stages):
        box(ax, x, 40, W, 26, t, fc=fc, ec=ec, fs=8.2)
        if i < n - 1:
            arrow(ax, x + W, 53, x + W + gap, 53)
        x += W + gap
    ax.text(50, 22, "Side effects on privileged actions:  AuditLog entry (actor, action, target, IP, user agent)  +  Notification  +  Socket.IO broadcast",
            ha="center", fontsize=9.5, style="italic", color="#374151",
            bbox=dict(fc="#F9FAFB", ec="#9CA3AF", boxstyle="round,pad=0.4"))
    save(fig, "fig_dataflow.png")

# =====================================================================
# FIG 10 : Course state machine
# =====================================================================
def fig_course_states():
    fig, ax = canvas(9.5, 4.4)
    ax.text(50, 94, "Course Approval Workflow — State Machine", ha="center", fontsize=12, fontweight="bold")
    box(ax, 6, 45, 16, 18, "DRAFT\n(editable)", fc="#E5E7EB", ec="#374151", fs=9.5, bold=True)
    box(ax, 42, 45, 16, 18, "SUBMITTED\n(read-only)", fc="#FEF9C3", ec="#A16207", fs=9.5, bold=True)
    box(ax, 78, 61, 16, 18, "APPROVED\nlocked = true", fc="#DCFCE7", ec="#15803D", fs=9.5, bold=True)
    box(ax, 78, 22, 16, 18, "REJECTED\n(+ comment)", fc="#FFE4E6", ec="#BE123C", fs=9.5, bold=True)
    arrow(ax, 22, 54, 42, 54, "Dept. Head submits", fs=8.4, ly=4)
    arrow(ax, 58, 58, 78, 68, "Officer approves", fs=8.4, ly=4, lx=-2)
    arrow(ax, 58, 50, 78, 33, "Officer rejects", fs=8.4, ly=-4, lx=-2)
    ax.add_patch(FancyArrowPatch((78, 27), (14, 27), arrowstyle="-", color="#6B7280", lw=1.2, linestyle="--"))
    arrow(ax, 14, 27, 14, 45, "returned to DRAFT for revision", fs=8.2, color="#6B7280", ls="--", lx=22, ly=-6)
    ax.text(86, 84, "immutable to Dept. Head;\nevery transition audit-logged", fontsize=8, ha="center", style="italic", color="#374151")
    save(fig, "fig_course_states.png")

if __name__ == "__main__":
    fig_architecture()
    fig_workflow()
    fig_timetable_algo()
    fig_usecase()
    fig_erd()
    fig_qr_flow()
    fig_assignment_algo()
    fig_realtime()
    fig_dataflow()
    fig_course_states()
    print("All figures generated in", OUT)
