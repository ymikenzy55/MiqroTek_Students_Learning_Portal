# -*- coding: utf-8 -*-
"""Build the final thesis .docx."""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from helpers import (new_document, page_break, p, toc_field,
                     toc_caption_field, table)
from docx.enum.text import WD_ALIGN_PARAGRAPH

import front, ch1, ch2, ch3, ch4, ch5, refs


def build():
    doc = new_document()

    # ---- Front matter ----
    front.add_title_page(doc)
    front.add_declaration(doc)
    front.add_abstract(doc)

    # Table of Contents (headings 1-3)
    page_break(doc)
    p(doc, "TABLE OF CONTENTS", bold=True,
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=12)
    toc_field(doc, "1-3")

    # List of Figures (auto-generated from SEQ "Figure" fields)
    page_break(doc)
    p(doc, "LIST OF FIGURES", bold=True,
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=12)
    toc_caption_field(doc, "Figure",
        "Right-click and choose 'Update Field' to generate the List of Figures.")

    # List of Tables (auto-generated from SEQ "Table" fields)
    page_break(doc)
    p(doc, "LIST OF TABLES", bold=True,
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=12)
    toc_caption_field(doc, "Table",
        "Right-click and choose 'Update Field' to generate the List of Tables.")

    # List of Abbreviations
    page_break(doc)
    p(doc, "LIST OF ABBREVIATIONS", bold=True,
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=12)
    table(doc, ["Abbreviation", "Meaning"], [
        ["API", "Application Programming Interface"],
        ["CORS", "Cross-Origin Resource Sharing"],
        ["CRUD", "Create, Read, Update, Delete"],
        ["ERD", "Entity-Relationship Diagram"],
        ["GPS", "Global Positioning System"],
        ["HTTPS", "Hypertext Transfer Protocol Secure"],
        ["JWT", "JSON Web Token"],
        ["NP-hard", "Non-deterministic Polynomial-time hard"],
        ["ORM", "Object-Relational Mapping"],
        ["PWA", "Progressive Web Application"],
        ["QR", "Quick Response (code)"],
        ["RBAC", "Role-Based Access Control"],
        ["REST", "Representational State Transfer"],
        ["SPA", "Single-Page Application"],
        ["SQL", "Structured Query Language"],
        ["TLS", "Transport Layer Security"],
        ["UENR", "University of Energy and Natural Resources"],
        ["UI", "User Interface"],
    ], col_widths=[1, 3], font_size=11)

    # ---- Chapters ----
    ch1.add(doc)
    ch2.add(doc)
    ch3.add(doc)
    ch4.add(doc)
    ch5.add(doc)

    # ---- References ----
    refs.add(doc)

    # ---- Appendices ----
    page_break(doc)
    p(doc, "APPENDIX A: SYSTEM DEPLOYMENT AND ACCESS", bold=True,
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=12)
    p(doc, "The production deployment of the system is publicly reachable at the following endpoint:")
    p(doc, "    https://unertimetable.vercel.app", bold=True)
    p(doc, "The application programming interface is hosted at:")
    p(doc, "    https://uenr-timetable-api.onrender.com/api/v1", bold=True)
    p(doc, "Three demonstration accounts are provisioned for evaluation, one per role. Credentials are "
           "available from the project supervisor on request. New accounts may self-register only while "
           "an examination officer has opened a registration window; accounts remain in the "
           "PENDING_APPROVAL state until an officer approves them.")

    page_break(doc)
    p(doc, "APPENDIX B: SAMPLE VENUE QR TOKEN FORMAT", bold=True,
      align=WD_ALIGN_PARAGRAPH.CENTER, size=14, space_after=12)
    p(doc, "Venue QR codes encode a plain-text token of the form:")
    p(doc, "    VENUE:{venueId}:{examinationSessionId}", bold=True)
    p(doc, "where {venueId} is the database identifier of the venue and {examinationSessionId} is the "
           "identifier of the examination session to which the code applies. The token is human-readable "
           "for ease of debugging, but its security does not depend on secrecy: possession of a token "
           "is useless without a valid assignment, an open scan window and no prior successful scan, all "
           "of which are adjudicated server-side by the shared evaluateVenueScan function.")

    out = os.path.join(os.path.dirname(__file__),
                       "Timetabling_and_Invigilator_Verification_System_Thesis.docx")
    doc.save(out)

    from helpers import fig_list, tab_list
    print("Saved:", out)
    print("Figures:", len(fig_list), "Tables:", len(tab_list))


if __name__ == "__main__":
    build()
