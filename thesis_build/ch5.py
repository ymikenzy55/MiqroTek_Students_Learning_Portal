# -*- coding: utf-8 -*-
from helpers import h1, h2, p, bullets, table


def add(doc):
    h1(doc, "CHAPTER FIVE: CONCLUSION, RECOMMENDATIONS AND FUTURE WORK")

    h2(doc, "5.1 Conclusion")
    p(doc, "This project set out to design, build and evaluate an integrated, web-based examination "
           "timetabling and invigilator verification system for the University of Energy and Natural "
           "Resources. The motivation was simple: the existing manual process was slow, error-prone "
           "and open to fraud, and none of the systems reviewed in the literature covered the full "
           "lifecycle in one place. The work followed a design science approach [17], [18] and "
           "produced a deployed artefact — a React 18 progressive web application [16], [27] over a "
           "Node.js/Express REST API with a PostgreSQL database accessed through Prisma ORM — that "
           "digitises the entire examination lifecycle from structured course submission to "
           "QR-code-based verification of invigilator presence and real-time attendance monitoring.")
    p(doc, "All six specific objectives were achieved and verified against explicit criteria. A "
           "structured course submission and approval workflow replaced e-mail-based collection with "
           "a server-enforced state machine, locking of approved courses and full audit logging. A "
           "constraint-based greedy first-fit-decreasing timetable generator, with three-pass "
           "constraint relaxation and up to twenty randomised retries, produced clash-free "
           "timetables with venue splitting for large cohorts and an actionable unscheduled report — "
           "results consistent with the constructive-heuristic findings in the recent literature "
           "[6], [8]. A venue-bound QR-code verification mechanism, executed through a two-stage "
           "preview-then-confirm protocol over a single shared validation function, closed every "
           "fraud vector of paper-based attendance while persisting all outcomes for forensic "
           "audit — extending the fraud-mitigation principles of Nwabuwe et al. [12] to invigilator "
           "verification without a native app. A round-robin invigilator assignment algorithm, "
           "following the sequential approach recommended by Cimen et al. [9], enforced no "
           "double-booking and no same-department invigilation, preferring visible understaffing to "
           "an unexecutable roster. A Socket.IO real-time layer [24] with role-scoped rooms "
           "delivered check-in, course and pending-account events without page refreshes, "
           "complemented by a five-minute background job that automatically marked missed scans as "
           "absent and notified examination officers. Finally, JWT authentication, RBAC middleware "
           "and an immutable audit log established end-to-end accountability across all privileged "
           "actions, aligned with OWASP guidance [19], [23].")
    p(doc, "The evaluation confirms that integrating constraint-based scheduling, venue-bound QR "
           "verification and real-time monitoring in a single application is feasible and yields "
           "measurable improvements in efficiency, integrity and accountability over the manual "
           "baseline. The work also shows that strong physical-presence verification is achievable "
           "without biometric hardware by inverting the trust model of conventional QR attendance "
           "systems — making the code public and venue-bound, and adjudicating every attempt "
           "server-side.")

    h2(doc, "5.2 Recommendations")
    p(doc, "Based on the findings, the following recommendations are made to the University of Energy "
           "and Natural Resources and to the examination office in particular:")
    bullets(doc, [
        "Deploy the system for a pilot examination period at UENR to evaluate its effectiveness "
        "under live operational load and to gather structured feedback from examination officers, "
        "heads of department and invigilators.",
        "Implement the in-application audit log viewer so that examination officers can review the "
        "trail of privileged actions through the interface rather than requiring direct database "
        "access.",
        "Conduct formal user-acceptance testing with actual UENR staff to validate that the system "
        "meets operational requirements and to surface usability improvements before full rollout.",
        "Enforce GPS location verification rather than offering it optionally, in order to further "
        "strengthen the anti-fraud guarantees of the QR verification subsystem, drawing on the "
        "geofencing approach of Nwabuwe et al. [12].",
        "Establish an automated test suite (unit, integration and end-to-end) to safeguard the "
        "system against regression as features evolve and to support future maintenance.",
        "Provision a deployment region closer to Ghana to reduce network latency for end users and "
        "to improve the responsiveness of the real-time layer.",
    ], numbered=True)

    h2(doc, "5.3 Future Work")
    p(doc, "Several extensions of the present system are identified for future work, ordered by "
           "anticipated impact:")
    bullets(doc, [
        "Invigilator swap and replacement workflow: allow invigilators to request replacements or "
        "swaps through the system, with Super Admin approval. The Invigilation model already "
        "carries a replacementId field in anticipation of this feature.",
        "Metaheuristic scheduling: replace or augment the greedy generator with simulated "
        "annealing, a genetic algorithm or a tabu search post-processor to improve "
        "soft-constraint satisfaction and to handle larger, more constrained instances, as "
        "surveyed by Siew et al. [1] and Al-Betar et al. [4].",
        "Bulk course import: support ingestion of courses from Excel or CSV files to reduce "
        "manual data entry for large departments, with the same Zod validation [26] applied to "
        "each row.",
        "Analytics dashboard: visualise attendance trends, no-show rates, invigilator workload "
        "distribution and timetable utilisation to support evidence-based administration.",
        "Web push notifications: implement service-worker-based push so that examination officers "
        "receive alerts even when the application is not open in a browser tab.",
        "Native mobile applications: provide iOS and Android applications for invigilators with "
        "native camera integration and offline scan queuing for venues with poor connectivity.",
        "Multi-institution support: extend the data model and configuration to support several "
        "universities with institution-specific rules and data isolation from a single deployment.",
        "Student-facing portal: allow students to view their personal examination timetables and "
        "to receive notifications of venue or schedule changes, closing the loop on the "
        "cohort-level scheduling approximation.",
        "Precise indoor location: explore indoor positioning systems [14], [15] to verify "
        "presence at the level of the examination hall rather than the campus bounding box, "
        "further tightening the verification guarantee.",
    ], numbered=True)

    h2(doc, "5.4 Closing Remarks")
    p(doc, "Examination integrity underwrites the credibility of every academic qualification a "
           "university awards. The manual processes that prevail at many institutions, including "
           "UENR, leave that integrity exposed to scheduling error, undetected absenteeism and "
           "unaccountable administrative decisions. This project has shown that a single, "
           "well-scoped web application — built from mature, freely available technologies and "
           "operating on hardware that staff already carry — can close those exposures end to end. "
           "The artefact is deployed, the objectives are met, and the path to a production rollout "
           "at UENR is clear.")
