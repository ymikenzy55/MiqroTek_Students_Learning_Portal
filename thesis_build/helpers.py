# -*- coding: utf-8 -*-
"""python-docx helpers for the thesis builder."""
import os
from docx import Document
from docx.shared import Pt, Cm, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

FIGS = os.path.join(os.path.dirname(__file__), "figs")
BODY_FONT = "Times New Roman"

_fig_no = [0]
_tab_no = [0]
fig_list = []   # (number, caption)
tab_list = []


def _set_font(style, name=BODY_FONT, size=12, bold=False, color=None):
    style.font.name = name
    style.font.size = Pt(size)
    style.font.bold = bold
    if color:
        style.font.color.rgb = RGBColor(*color)
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), name)
    rFonts.set(qn("w:hAnsi"), name)
    rFonts.set(qn("w:cs"), name)


def new_document():
    doc = Document()
    # page setup: A4, margins
    for sec in doc.sections:
        sec.page_width = Cm(21.0)
        sec.page_height = Cm(29.7)
        sec.top_margin = Cm(2.54)
        sec.bottom_margin = Cm(2.54)
        sec.left_margin = Cm(3.17)
        sec.right_margin = Cm(2.54)
    # Normal style
    st = doc.styles["Normal"]
    _set_font(st, size=12)
    st.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    st.paragraph_format.space_after = Pt(6)
    st.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    # Headings
    _set_font(doc.styles["Heading 1"], size=15, bold=True, color=(0, 0, 0))
    _set_font(doc.styles["Heading 2"], size=13, bold=True, color=(0, 0, 0))
    _set_font(doc.styles["Heading 3"], size=12, bold=True, color=(0, 0, 0))
    for h in ("Heading 1", "Heading 2", "Heading 3"):
        doc.styles[h].paragraph_format.space_before = Pt(14)
        doc.styles[h].paragraph_format.space_after = Pt(8)
        doc.styles[h].paragraph_format.keep_with_next = True
    # Caption style
    try:
        cap = doc.styles["Caption"]
    except KeyError:
        cap = doc.styles.add_style("Caption", 1)
    _set_font(cap, size=10.5, bold=True)
    cap.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(12)
    # footer page number
    _add_page_number(doc.sections[0])
    return doc


def _add_page_number(section):
    footer_p = section.footer.paragraphs[0]
    footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = footer_p.add_run()
    for tag, attr, text in (("w:fldChar", "w:fldCharType", "begin"),
                            ("w:instrText", None, "PAGE"),
                            ("w:fldChar", "w:fldCharType", "end")):
        el = OxmlElement(tag)
        if attr:
            el.set(qn(attr), text)
        else:
            el.set(qn("xml:space"), "preserve")
            el.text = " PAGE "
        run._r.append(el)
    run.font.name = BODY_FONT
    run.font.size = Pt(10)


def page_break(doc):
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def h1(doc, text, pagebreak=True):
    if pagebreak:
        page_break(doc)
    return doc.add_heading(text, level=1)


def h2(doc, text):
    return doc.add_heading(text, level=2)


def h3(doc, text):
    return doc.add_heading(text, level=3)


def p(doc, text, bold=False, italic=False, align=None, size=None, space_after=None):
    para = doc.add_paragraph()
    run = para.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = BODY_FONT
    if size:
        run.font.size = Pt(size)
    if align is not None:
        para.alignment = align
    if space_after is not None:
        para.paragraph_format.space_after = Pt(space_after)
    return para


def bullets(doc, items, numbered=False):
    style = "List Number" if numbered else "List Bullet"
    for it in items:
        para = doc.add_paragraph(it, style=style)
        para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
        for run in para.runs:
            run.font.name = BODY_FONT
            run.font.size = Pt(12)


def code_block(doc, text):
    para = doc.add_paragraph()
    run = para.add_run(text)
    run.font.name = "Consolas"
    run.font.size = Pt(9.5)
    para.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
    para.paragraph_format.left_indent = Cm(0.8)
    para.paragraph_format.space_after = Pt(10)
    pPr = para._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:fill"), "F3F4F6")
    pPr.append(shd)
    return para


def _add_seq_caption(doc, label, caption_text, seq_name):
    """Add a caption paragraph using Word SEQ fields so Word can auto-generate
    List of Figures / List of Tables via TOC \\c fields."""
    cap = doc.add_paragraph(style="Caption")
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # "Figure " or "Table " prefix text
    r1 = cap.add_run(f"{label} ")
    r1.font.name = BODY_FONT
    r1.font.size = Pt(10.5)
    r1.bold = True
    # SEQ field: { SEQ Figure \* ARABIC } or { SEQ Table \* ARABIC }
    run = cap.add_run()
    run.font.name = BODY_FONT
    run.font.size = Pt(10.5)
    run.bold = True
    fld_begin = OxmlElement("w:fldChar"); fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve")
    instr.text = f' SEQ {seq_name} \\* ARABIC '
    fld_sep = OxmlElement("w:fldChar"); fld_sep.set(qn("w:fldCharType"), "separate")
    fld_text = OxmlElement("w:t"); fld_text.text = "?"
    fld_end = OxmlElement("w:fldChar"); fld_end.set(qn("w:fldCharType"), "end")
    for el in (fld_begin, instr, fld_sep, fld_text, fld_end):
        run._r.append(el)
    # ": caption text"
    r2 = cap.add_run(f": {caption_text}")
    r2.font.name = BODY_FONT
    r2.font.size = Pt(10.5)
    r2.bold = True
    return cap


def figure(doc, filename, caption, width_cm=15.5):
    _fig_no[0] += 1
    n = _fig_no[0]
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    para.paragraph_format.keep_with_next = True
    run = para.add_run()
    run.add_picture(os.path.join(FIGS, filename), width=Cm(width_cm))
    _add_seq_caption(doc, "Figure", caption, "Figure")
    fig_list.append((n, caption))
    return n


def _shade_cell(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def table(doc, headers, rows, caption=None, col_widths=None, font_size=10, header_fill="1F3A5F"):
    if caption:
        _tab_no[0] += 1
        n = _tab_no[0]
        _add_seq_caption(doc, "Table", caption, "Table")
        tab_list.append((n, caption))
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, htxt in enumerate(headers):
        hdr[i].text = ""
        run = hdr[i].paragraphs[0].add_run(htxt)
        run.bold = True
        run.font.size = Pt(font_size)
        run.font.name = BODY_FONT
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        _shade_cell(hdr[i], header_fill)
    for r_i, row in enumerate(rows):
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            run = cells[i].paragraphs[0].add_run(str(val))
            run.font.size = Pt(font_size)
            run.font.name = BODY_FONT
            if r_i % 2 == 1:
                _shade_cell(cells[i], "EFF3F8")
    if col_widths:
        total = sum(col_widths)
        usable = 15.5
        for row in t.rows:
            for i, c in enumerate(row.cells):
                c.width = Cm(usable * col_widths[i] / total)
    doc.add_paragraph("", style="Normal").paragraph_format.space_after = Pt(2)
    return t


def toc_field(doc, levels="1-3"):
    para = doc.add_paragraph()
    run = para.add_run()
    begin = OxmlElement("w:fldChar"); begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve")
    instr.text = f' TOC \\o "{levels}" \\h \\z \\u '
    sep = OxmlElement("w:fldChar"); sep.set(qn("w:fldCharType"), "separate")
    hint = OxmlElement("w:t")
    hint.text = "Right-click and choose 'Update Field' to generate the Table of Contents."
    end = OxmlElement("w:fldChar"); end.set(qn("w:fldCharType"), "end")
    for el in (begin, instr, sep, hint, end):
        run._r.append(el)


def toc_caption_field(doc, seq_name, hint_text):
    """Insert a TOC field that collects all captions with the given SEQ name
    (e.g. 'Figure' or 'Table'). In Word, right-click > Update Field to populate."""
    para = doc.add_paragraph()
    run = para.add_run()
    begin = OxmlElement("w:fldChar"); begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve")
    instr.text = f' TOC \\c "{seq_name}" \\h \\z \\u '
    sep = OxmlElement("w:fldChar"); sep.set(qn("w:fldCharType"), "separate")
    hint = OxmlElement("w:t")
    hint.text = hint_text
    end = OxmlElement("w:fldChar"); end.set(qn("w:fldCharType"), "end")
    for el in (begin, instr, sep, hint, end):
        run._r.append(el)
