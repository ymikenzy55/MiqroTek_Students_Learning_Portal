# -*- coding: utf-8 -*-
from helpers import h1, h2, p, bullets, table


def add(doc):
    h1(doc, "CHAPTER ONE: INTRODUCTION")

    h2(doc, "1.1 Background of the Study")
    p(doc, "Every semester, universities across the world go through the same demanding ritual: "
           "organising end-of-semester examinations. It sounds straightforward on paper, but in practice "
           "it is one of the most logistically heavy tasks in academic administration. At the University "
           "of Energy and Natural Resources (UENR), a single examination period can involve several "
           "departments, dozens of venues, hundreds of courses spread across different levels, and a "
           "pool of invigilators — all squeezed into a few weeks. The examination office has to make "
           "sure every approved course gets a slot and a venue without clashing with other papers the "
           "same students will write, that each venue has enough invigilators, and that those invigilators "
           "actually show up where they are supposed to, when they are supposed to.")
    p(doc, "For the most part, this has been handled manually. Heads of department e-mail their course "
           "lists to the examination office, often in formats that differ from one department to the "
           "next. Someone then types these lists into a spreadsheet, checks for duplicates by eye, and "
           "builds the timetable by hand — moving courses around cells until nothing obviously clashes. "
           "Invigilators get printed notices telling them where to go, and on the day of the exam they "
           "sign a paper sheet at the venue. It works, but only just, and it breaks down quickly as the "
           "number of courses and venues grows.")
    p(doc, "The research community has long known that examination timetabling is an NP-hard problem [1], "
           "[2]. What this means in plain terms is that no algorithm can guarantee a perfect timetable "
           "for a realistic-sized university in a reasonable time, and doing it by hand is even less "
           "practical. Over the past few years, researchers have continued to explore heuristics, "
           "metaheuristics and hybrid approaches to close that gap [3], [4], [5]. On the attendance side, "
           "paper sign-in sheets have well-documented weaknesses: they can be forged, signed on someone's "
           "behalf, or filled in after the fact [12]. QR-code-based attendance systems have gained "
           "traction as a lighter alternative, since most staff already carry a smartphone capable of "
           "scanning a code [10], [11].")
    p(doc, "What has changed recently is that the building blocks for a fully integrated solution — "
           "responsive single-page web applications, progressive web app (PWA) installation [16], "
           "real-time push communication [24], and mature server-side frameworks — are now reliable "
           "enough to combine into one system. This project brings those pieces together to digitise the "
           "entire examination lifecycle at UENR, from course submission through timetable generation "
           "to QR-code-based verification of invigilator presence, with real-time monitoring throughout.")

    h2(doc, "1.2 Problem Statement")
    p(doc, "At UENR the examination office runs the whole lifecycle manually. Heads of department "
           "e-mail course lists; the officer transcribes them, checks for duplicates, and tracks "
           "approval status through back-and-forth messages. Once courses are approved, the officer "
           "constructs the timetable by hand, visually scanning for clashes. Invigilators are assigned "
           "through printed schedules, and they confirm attendance by signing a paper sheet at the venue.")
    p(doc, "This setup has several problems that keep recurring:")
    bullets(doc, [
        "Paper sign-in sheets can be forged or signed for an absent colleague. Nothing in the "
        "current process actually proves the invigilator was at the right venue at the right time.",
        "Invigilator no-shows are discovered too late — usually only when students complain about "
        "an unsupervised hall, or when the sheets are collected days later.",
        "There is no audit trail. Decisions about course approvals, timetable changes and "
        "invigilator assignments are not formally logged, so accountability is hard to establish "
        "after the fact.",
        "Communication is slow. Invigilators may get their assignment details late, and the "
        "examination office has no live picture of what is happening across venues.",
    ], numbered=True)
    p(doc, "Taken together, these gaps expose the university to scheduling clashes, undetected "
           "absenteeism and examination malpractice, while piling administrative work onto the "
           "examination office. A systematic, automated and verifiable approach is needed.")

    h2(doc, "1.3 Aim of the Study")
    p(doc, "The aim of this project is to design and implement a web-based examination timetabling and "
           "invigilator verification system that automates constraint-based examination scheduling, uses "
           "QR codes to verify that invigilators are physically present at their assigned venues, and "
           "gives examination officers real-time visibility of attendance at the University of Energy "
           "and Natural Resources.")

    h2(doc, "1.4 Specific Objectives")
    p(doc, "To achieve this aim, the study pursues six specific objectives:")
    bullets(doc, [
        "Develop a structured course submission and approval workflow that replaces e-mail-based "
        "collection with a validated, auditable digital process.",
        "Implement a constraint-based automatic timetable generation algorithm that schedules "
        "approved courses into slots and venues while preventing clashes and respecting venue "
        "capacities.",
        "Design and implement a QR-code-based verification mechanism that confirms an invigilator's "
        "physical presence at the correct venue during the assigned time window.",
        "Implement automatic invigilator-to-venue assignment with conflict-avoidance rules that "
        "prevent double-booking and same-department invigilation.",
        "Develop a real-time notification subsystem that instantly informs examination officers of "
        "check-ins, automatically detected absences and pending account approvals.",
        "Enforce role-based access control and immutable audit logging across all system operations "
        "to preserve examination integrity and accountability.",
    ], numbered=True)

    h2(doc, "1.5 Research Questions")
    p(doc, "Each objective maps to a research question that guides the study:")
    bullets(doc, [
        "How can a structured digital workflow replace e-mail-based course collection to ensure "
        "validated, auditable course submission and approval?",
        "What constraint-based scheduling algorithm can automatically generate clash-free "
        "examination timetables with venue allocation at the scale of a mid-sized university?",
        "How can QR-code technology be used to reliably confirm an invigilator's physical presence "
        "at the correct venue during the assigned time window?",
        "What rules and algorithms can automatically assign invigilators to venues while avoiding "
        "scheduling conflicts and same-department bias?",
        "How can real-time communication improve the examination office's ability to monitor "
        "invigilator attendance and respond promptly to absences?",
        "What access control and audit mechanisms are needed to maintain examination integrity and "
        "accountability in a multi-role administrative system?",
    ], numbered=True)

    h2(doc, "1.6 Significance of the Study")
    p(doc, "The significance of the study can be looked at from the perspective of each group of "
           "stakeholders involved, as summarised in Table 2.")
    table(doc, ["Stakeholder", "Role in the Examination Process", "Benefit Derived from the System"], [
        ["Examination Officer (Super Admin)", "Manages the entire examination lifecycle",
         "Automated timetabling, real-time visibility of invigilator attendance, immutable audit trail, reduced administrative burden"],
        ["Head of Department", "Submits and manages departmental courses",
         "Structured, validated course submission with immediate approval feedback and status tracking"],
        ["Invigilator", "Supervises examinations at assigned venues",
         "Clear and timely assignment notifications, transparent and tamper-proof attendance verification"],
        ["Students (indirect)", "Sit the examinations",
         "Clash-free schedules and adequately supervised examination halls"],
        ["University administration (indirect)", "Accountable for academic integrity",
         "Reduced malpractice risk and demonstrable accountability for administrative actions"],
        ["Future researchers", "Study examination management systems",
         "A documented reference implementation combining constraint-based scheduling with venue-bound QR verification"],
    ], caption="Stakeholders and the significance of the system to each",
        col_widths=[2, 2.4, 3.6])
    p(doc, "Beyond the immediate stakeholders, the study makes a practical contribution to the "
           "literature by showing that venue-bound (rather than user-bound) QR tokens, combined with "
           "server-side validation and a background absence detector, can close the fraud vectors "
           "inherent in paper-based invigilator attendance — and they can do it without biometric "
           "hardware.")

    h2(doc, "1.7 Scope of the Study")
    p(doc, "The study covers the design, implementation and functional evaluation of a multi-user web "
           "application for UENR. It includes:")
    bullets(doc, [
        "Users: three roles — Super Admin (examination officer), Head of Department and Invigilator "
        "— with self-registration, e-mail verification and administrative approval.",
        "Processes: academic structure management; course submission and approval; examination "
        "session and venue management; constraint-based timetable generation; automatic and manual "
        "invigilator assignment; venue QR-code generation; two-stage attendance scanning; "
        "real-time notification; automatic absence detection; and audit logging.",
        "Technologies: React 18 single-page application delivered as a progressive web application; "
        "Node.js/Express REST API; PostgreSQL database accessed through Prisma ORM; and Socket.IO "
        "for real-time communication.",
    ])
    p(doc, "The study does not cover student-facing functionality (students do not log in), invigilator "
           "swap and replacement workflows, bulk course import, analytics dashboards, native mobile "
           "apps, or web push notifications. These are revisited as future work in Chapter Five.")

    h2(doc, "1.8 Limitations of the Study")
    p(doc, "The following limitations should be kept in mind when reading the results in this report:")
    bullets(doc, [
        "Verification of the system was done manually through the deployed application; no "
        "automated unit, integration or end-to-end test suite was developed.",
        "The greedy scheduling heuristic guarantees feasibility with respect to the hard "
        "constraints but does not guarantee an optimal timetable.",
        "Audit log entries are recorded in the database, but a dedicated in-application viewer for "
        "the audit trail was not completed.",
        "Offline capability of the progressive web application is limited to caching of the "
        "application shell; scans cannot be queued offline.",
        "GPS-based location verification is optional — invigilators may decline the browser "
        "location permission, in which case off-campus scanning is logged with a warning rather "
        "than blocked.",
        "The system is deployed in a single cloud region, which adds avoidable network latency "
        "for users in Ghana.",
        "Formal user-acceptance testing with UENR examination office staff had not been conducted "
        "at the time of writing.",
    ], numbered=True)

    h2(doc, "1.9 Organisation of the Study")
    p(doc, "The rest of this report is organised as follows. Chapter Two reviews the literature on "
           "examination timetabling, scheduling algorithms, invigilator allocation, attendance "
           "verification, QR-code technology, real-time web communication and the security concepts "
           "behind multi-role web systems, and identifies the research gap this work addresses. "
           "Chapter Three presents the research design, development methodology, requirements "
           "analysis, system architecture, database design, algorithm design, technology selection "
           "and evaluation criteria. Chapter Four describes the implementation, presents the results "
           "of evaluating each objective, and discusses the findings. Chapter Five concludes the "
           "study, offers recommendations to the university, and outlines directions for future work.")
