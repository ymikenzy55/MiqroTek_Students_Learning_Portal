# -*- coding: utf-8 -*-
from helpers import h1, h2, p, bullets, table


def add(doc):
    h1(doc, "CHAPTER TWO: LITERATURE REVIEW")

    h2(doc, "2.1 Introduction")
    p(doc, "This chapter looks at the body of work relevant to the six areas this project touches on: "
           "the examination timetabling problem and how hard it is; the algorithms people have used to "
           "tackle it; the constraints involved; how invigilators get allocated; how attendance is "
           "verified and where QR codes fit in; real-time web communication; and the authentication, "
           "authorisation and audit ideas that underpin multi-role systems. After reviewing existing "
           "systems, the chapter identifies the gap that motivates this project.")

    h2(doc, "2.2 The Examination Timetabling Problem")
    p(doc, "Examination timetabling is the task of assigning a set of exams to a limited number of time "
           "slots and rooms while satisfying a set of constraints. It has been studied for decades and "
           "is well established as an NP-hard problem [1], [2]. In practical terms, this means there is "
           "no known algorithm that can guarantee the best possible timetable for a realistic-sized "
           "university in a reasonable amount of time, so researchers and practitioners rely on "
           "heuristics and metaheuristics instead.")
    p(doc, "Recent surveys have kept the picture up to date. Siew et al. reviewed solution methodologies "
           "for exam timetabling from 2012 to 2023, covering mathematical optimisation, heuristics, "
           "metaheuristics, hyper-heuristics and hybrid approaches [1]. Ceschia et al. surveyed "
           "educational timetabling formulations and benchmarks, noting that real-world instances "
           "routinely involve room capacities, room splitting for large cohorts and "
           "institution-specific rules that simplified academic benchmarks leave out [2]. Both "
           "observations matter directly to this project, where large service courses must be split "
           "across several venues and where UENR's own rules (for example, a cohort writing at most "
           "one exam per day) must be honoured.")

    h2(doc, "2.3 Automated Timetable Generation Approaches")
    p(doc, "A wide range of techniques has been applied to examination timetabling. At one end are "
           "constructive greedy heuristics — first-fit and first-fit-decreasing orderings — where exams "
           "are sorted by some measure of difficulty (usually enrolment size or constraint density) "
           "and placed one at a time into the first feasible slot. These are simple, fast, and produce "
           "workable solutions quickly, especially when combined with randomised restarts and "
           "multi-pass constraint relaxation [6], [7]. At the other end are metaheuristics — simulated "
           "annealing, tabu search, genetic algorithms — which iteratively improve an initial solution "
           "and generally achieve better quality at the cost of more computation and complexity [3], "
           "[4].")
    p(doc, "Abdullah and Hassan compared a constructive heuristic against a genetic algorithm on a "
           "real-world dataset and found that the constructive heuristic actually outperformed the "
           "genetic algorithm in resolving all student conflicts, while producing feasible schedules in "
           "seconds [8]. Al-Betar et al. reviewed optimisation techniques in university timetabling and "
           "noted that metaheuristics dominate the recent literature, but that greedy constructive "
           "methods remain widely used in practice for their speed and simplicity [4]. Table 3 "
           "summarises the trade-offs.")
    table(doc, ["Approach", "Representative work", "Strengths", "Weaknesses"], [
        ["Greedy / first-fit-decreasing with restarts", "Muklason et al. [6]; Abdullah & Hassan [8]",
         "Very fast; simple; predictable; easy to extend with institution-specific rules",
         "No optimality guarantee; quality depends on ordering and randomisation"],
        ["Constraint programming (CP)", "Carlsson et al. [3]",
         "Declarative constraints; can prove infeasibility",
         "Modelling effort; solver runtime grows sharply with instance size"],
        ["Metaheuristics (SA, tabu, GA)", "Muklason et al. [7]; Al-Betar et al. [4]",
         "High solution quality; good soft-constraint satisfaction",
         "Long runtimes; many parameters to tune; complex implementation"],
        ["Hybrid / matheuristic", "Siew et al. [1]",
         "Combines speed of heuristics with quality of metaheuristics",
         "More complex to design and maintain"],
    ], caption="Comparison of automated examination timetabling approaches",
        col_widths=[2.2, 1.8, 2.6, 2.6])
    p(doc, "The system implemented in this project uses a greedy first-fit-decreasing constructor with "
           "three fallback passes of progressively relaxed constraints and up to twenty randomised "
           "retries, keeping the best result found. This sits squarely in the practical tradition: for "
           "the scale of UENR's course portfolio (tens to low hundreds of courses per semester), the "
           "heuristic finishes in seconds while satisfying all hard constraints, and the retry "
           "mechanism recovers much of the quality that more expensive search techniques would "
           "provide.")

    h2(doc, "2.4 Scheduling Constraints")
    p(doc, "Constraints in examination timetabling are usually split into hard constraints (which must "
           "be satisfied for a timetable to be valid) and soft constraints (whose violation degrades "
           "quality but not validity) [1], [2]. Common hard constraints include: no student sits two "
           "exams at the same time; room capacity is not exceeded; every exam is scheduled exactly "
           "once. Common soft constraints include spreading a cohort's exams across the period, "
           "avoiding consecutive exams for the same cohort, and scheduling large exams early to allow "
           "marking time [2].")
    p(doc, "Because UENR does not maintain individual student enrolment data within the examination "
           "office, the system approximates the student-clash constraint at the cohort level: no two "
           "exams for the same department and academic level may share a slot, and a department-level "
           "cohort may write at most one exam per day. This cohort-level approximation is a recognised "
           "strategy where individual enrolment data is not available [2].")

    h2(doc, "2.5 Invigilator Allocation")
    p(doc, "Invigilator (proctor) allocation is a related but separate scheduling problem: given a "
           "fixed timetable, assign invigilators to venue sessions subject to availability, "
           "workload-fairness and conflict constraints. Cimen et al. addressed the invigilator "
           "assignment problem using a mixed-integer linear programming model and a heuristic "
           "algorithm, considering real-life concerns such as fair distribution of workload, reduction "
           "of successive duties and prioritisation based on invigilators' profession [9]. Their work "
           "confirms that the problem is usually solved sequentially after the timetable is fixed, "
           "which mirrors administrative practice.")
    p(doc, "This project follows the sequential approach: the timetable is generated first, and "
           "invigilators are then assigned by a round-robin algorithm with conflict avoidance. Two "
           "constraints distinguish the present formulation: an invigilator may never be assigned to "
           "two venues in the same slot (no double-booking), and an invigilator may not supervise an "
           "exam offered by their own department — a fairness rule intended to reduce the opportunity "
           "for partiality that is seldom made explicit in the literature.")

    h2(doc, "2.6 Attendance Verification and Its Fraud Vectors")
    p(doc, "Verifying that staff actually show up at examinations is operationally important but does "
           "not get much research attention. Paper-based sign-in sheets, the most common mechanism, are "
           "open to at least four kinds of fraud: forged signatures; proxy signing by colleagues; "
           "remote signing (signing without attending); and retrospective completion after the session "
           "has ended [12]. Biometric systems — fingerprint or face recognition — have been proposed "
           "for attendance tracking, but they need dedicated hardware at every venue, raise privacy "
           "concerns, and have been aimed almost entirely at student rather than staff attendance.")

    h2(doc, "2.7 QR-Code Technology and Verification Applications")
    p(doc, "The Quick Response (QR) code is a two-dimensional matrix barcode with high data density, "
           "error correction and the ability to be decoded by standard smartphone cameras. In "
           "education, QR codes have been applied mostly to student attendance: a per-session code is "
           "displayed and students scan it to register presence [10], [11], [13]. The reported "
           "weaknesses of these schemes include code sharing (a student forwards the code image to "
           "absent peers) and the lack of any binding between the code and a physical location [12].")
    p(doc, "Nwabuwe et al. tackled these weaknesses directly by combining dynamic QR codes, geofencing "
           "and IMEI verification to mitigate proxy attendance, buddy-punching and early departure "
           "[12]. Their work shows that binding the QR code to a physical location — through "
           "geofencing — is one of the most effective ways to prevent attendance fraud. The system in "
           "this project takes a similar philosophical position but applies it to invigilator "
           "verification rather than student attendance, and does so without requiring a native mobile "
           "app.")
    p(doc, "The key design decision here is that QR codes are venue-bound rather than user-bound. "
           "Each code encodes the tuple (venue identifier, examination session identifier); it is "
           "printed and physically posted at the venue it names. An invigilator must therefore be "
           "physically present at the correct venue to scan the correct code, and scanning any other "
           "venue's code is detected server-side and rejected. Table 4 contrasts the two binding "
           "strategies.")
    table(doc, ["Property", "User-bound QR code", "Venue-bound QR code (this project)"], [
        ["What the code identifies", "The individual user (or session ticket)", "The physical venue and examination session"],
        ["Where the code lives", "On the user's device; trivially forwarded", "Printed and posted at the venue"],
        ["Proof of physical presence", "None — can be scanned from anywhere", "Strong — scanning requires presence at the venue poster"],
        ["Wrong-venue detection", "Not possible", "Automatic (server compares assignment with scanned venue)"],
        ["Fraud vector: code sharing", "High risk", "Ineffective — the code is public but useless without a valid assignment and time window"],
        ["Server-side validation required", "Optional", "Mandatory — assignment, duplicate and window checks"],
    ], caption="User-bound versus venue-bound QR verification strategies",
        col_widths=[2.4, 2.8, 3.2])

    h2(doc, "2.8 Real-Time Web Communication")
    p(doc, "Traditional HTTP request-response interaction requires the client to poll for new "
           "information, which wastes bandwidth and delays notification. The WebSocket protocol "
           "establishes a persistent, full-duplex channel over which a server can push events to "
           "connected clients with very low latency. Socket.IO is a widely used library layered above "
           "WebSocket that adds automatic reconnection, room-based broadcast semantics and a graceful "
           "fallback to HTTP long-polling where WebSocket connections cannot be established [24]. In "
           "examination management, real-time push is valuable for notifying the examination office of "
           "invigilator check-ins the moment they occur, alerting officers to detected absences, and "
           "propagating course-approval events to the affected department heads without a page refresh.")

    h2(doc, "2.9 Authentication, Authorisation and Audit Concepts")
    p(doc, "Multi-role administrative systems need solid identity and access management. JSON Web "
           "Tokens (JWT) provide a compact, signed representation of authentication claims that allows "
           "stateless session validation on every request. Role-Based Access Control (RBAC) assigns "
           "permissions to roles rather than individuals, simplifying administration and supporting "
           "the principle of least privilege. For credential storage, the bcrypt algorithm applies an "
           "adaptive, deliberately expensive key-derivation function that resists brute-force attack "
           "even as hardware improves; it remains a recommended choice, with a work factor of 10 or "
           "higher, alongside newer alternatives like Argon2id [20], [21]. Input validation, "
           "parameterised database queries and hardened HTTP response headers address the injection "
           "and configuration risks catalogued by the OWASP Top Ten [19]. An immutable audit log — an "
           "append-only record of who did what, to which object, when and from where — is a standard "
           "control for establishing accountability in administrative systems [19], [23].")

    h2(doc, "2.10 Review of Existing Systems")
    p(doc, "Four categories of existing systems overlap with the scope of this project. Table 5 "
           "summarises their coverage against the capabilities the UENR problem context requires.")
    table(doc, ["System category", "Timetable generation", "Invigilator assignment", "Physical presence verification", "Real-time monitoring", "Audit trail"], [
        ["Commercial timetabling suites", "Yes", "Partial", "No", "No", "Partial"],
        ["QR student-attendance systems [10], [11]", "No", "No", "Weak (user/session-bound codes)", "No", "Partial"],
        ["Fraud-resistant QR + geofencing [12]", "No", "No", "Strong (location-bound)", "No", "Partial"],
        ["Learning management systems", "No", "No", "No", "No", "Yes"],
        ["This project", "Yes (constraint-based)", "Yes (conflict-free round-robin)", "Strong (venue-bound QR, no extra hardware)", "Yes (Socket.IO push + auto-absent)", "Yes (immutable log)"],
    ], caption="Capability comparison of existing system categories and the present work",
        col_widths=[3.0, 1.5, 1.5, 2.0, 1.5, 1.2], font_size=9)
    p(doc, "Commercial scheduling suites focus on timetable construction and, in some cases, invigilator "
           "rostering, but none verifies that a rostered invigilator physically attended. QR attendance "
           "systems verify presence only weakly, because their codes are not bound to a location. "
           "Fraud-resistant systems like Nwabuwe et al.'s [12] verify presence strongly but focus on "
           "student attendance and do not integrate with timetabling. Many universities run bespoke "
           "in-house systems, but these are rarely published, which limits comparison [2].")

    h2(doc, "2.11 Research Gap")
    p(doc, "The review shows that while the individual pieces — timetabling, invigilator allocation and "
           "attendance verification — have each been studied, no published system integrates the full "
           "examination lifecycle in a single cohesive application. Specifically:")
    bullets(doc, [
        "Existing QR attendance research addresses student attendance with user- or session-bound "
        "codes; applying venue-bound QR codes to invigilator verification has not been explored.",
        "Existing timetabling systems do not integrate with attendance verification, so a mismatch "
        "between the published roster and actual attendance goes undetected.",
        "No reviewed system combines instantaneous check-in notification with automatic absence "
        "detection, leaving examination offices to discover absences reactively.",
        "The accountability chain — from course approval through timetable change to venue scan — "
        "is not captured end-to-end in any reviewed system.",
    ], numbered=True)
    p(doc, "This project addresses the gap by building an integrated system that combines "
           "constraint-based timetable generation, conflict-free invigilator assignment, venue-bound "
           "QR-code verification with a two-stage scan protocol, real-time push notification and "
           "immutable audit logging, evaluated in the specific operational context of UENR.")

    h2(doc, "2.12 Chapter Summary")
    p(doc, "This chapter placed the project within the literature on examination timetabling and "
           "attendance verification. The NP-hard nature of the scheduling problem justifies a "
           "heuristic approach; the fraud vectors of paper-based attendance justify a server-validated, "
           "venue-bound QR mechanism; and the absence of any integrated published system justifies "
           "the design developed in the next chapter.")
