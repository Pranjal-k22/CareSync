import os
import subprocess
import sys
from pathlib import Path
import markdown

def convert_md_to_pdf(md_path: Path, pdf_path: Path):
    if not md_path.exists():
        print(f"Error: Markdown file {md_path} does not exist.")
        sys.exit(1)

    print(f"Reading {md_path}...")
    md_content = md_path.read_text(encoding="utf-8")

    # Convert Markdown to HTML
    print("Converting Markdown to HTML...")
    html_body = markdown.markdown(
        md_content,
        extensions=[
            'extra',
            'tables',
            'fenced_code',
            'toc',
            'nl2br',
            'sane_lists'
        ]
    )

    # Professional Academic CSS Stylesheet
    css_styles = """
    @page {
        size: A4;
        margin: 20mm 15mm 20mm 15mm;
        @bottom-right {
            content: "Page " counter(page);
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 9pt;
            color: #666;
        }
    }

    body {
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 10.5pt;
        line-height: 1.6;
        color: #1a1a1a;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }

    /* Page Breaks for Major Chapters */
    h1 {
        font-size: 20pt;
        color: #0f2b48;
        border-bottom: 2.5px solid #0056b3;
        padding-bottom: 6px;
        margin-top: 25pt;
        margin-bottom: 15pt;
        page-break-before: always;
    }

    /* First h1 shouldn't trigger page break */
    h1:first-of-type {
        page-break-before: avoid;
        font-size: 24pt;
        text-align: center;
        border-bottom: 3px solid #0056b3;
        margin-top: 10pt;
        margin-bottom: 25pt;
    }

    h2 {
        font-size: 14pt;
        color: #1a4971;
        border-bottom: 1.5px solid #e1e4e8;
        padding-bottom: 4px;
        margin-top: 18pt;
        margin-bottom: 10pt;
        page-break-after: avoid;
    }

    h3 {
        font-size: 12pt;
        color: #2c3e50;
        margin-top: 14pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
    }

    h4 {
        font-size: 11pt;
        color: #34495e;
        margin-top: 10pt;
        margin-bottom: 4pt;
        page-break-after: avoid;
    }

    p {
        margin-top: 0;
        margin-bottom: 10pt;
        text-align: justify;
    }

    /* Academic Tables */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12pt;
        margin-bottom: 16pt;
        font-size: 9.5pt;
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
        page-break-after: auto;
    }

    th {
        background-color: #f0f4f8;
        color: #0f2b48;
        font-weight: 600;
        text-align: left;
        padding: 8px 10px;
        border: 1px solid #cbd5e1;
        border-bottom: 2px solid #0f2b48;
    }

    td {
        padding: 7px 10px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }

    tbody tr:nth-child(even) {
        background-color: #f8fafc;
    }

    /* Code & Blockquotes */
    code {
        font-family: 'Consolas', 'Courier New', Courier, monospace;
        font-size: 9pt;
        background-color: #f1f5f9;
        color: #0f172a;
        padding: 2px 5px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
    }

    pre {
        background-color: #0f172a;
        color: #f8fafc;
        padding: 12px 15px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 8.5pt;
        line-height: 1.45;
        margin-top: 10pt;
        margin-bottom: 14pt;
        page-break-inside: avoid;
    }

    pre code {
        background-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
    }

    blockquote {
        margin: 12pt 0;
        padding: 10pt 15px;
        background-color: #eff6ff;
        border-left: 4px solid #2563eb;
        color: #1e3a8a;
        font-style: italic;
    }

    /* Lists */
    ul, ol {
        margin-top: 0;
        margin-bottom: 10pt;
        padding-left: 22px;
    }

    li {
        margin-bottom: 4pt;
    }

    /* Horizontal Rules */
    hr {
        border: none;
        border-top: 1px solid #cbd5e1;
        margin: 20pt 0;
    }

    /* Strong emphasis */
    strong {
        color: #0f172a;
    }

    /* Links */
    a {
        color: #2563eb;
        text-decoration: none;
    }
    """

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HealConnect — Comprehensive Project Report</title>
    <style>
        {css_styles}
    </style>
</head>
<body>
    {html_body}
</body>
</html>
"""

    temp_html_path = md_path.parent / "report_temp.html"
    print(f"Writing temporary HTML file to {temp_html_path}...")
    temp_html_path.write_text(full_html, encoding="utf-8")

    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_exe):
        edge_exe = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

    if not os.path.exists(edge_exe):
        print("Error: Microsoft Edge executable not found.")
        sys.exit(1)

    print(f"Running Microsoft Edge Headless PDF Generation...")
    cmd = [
        edge_exe,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path.resolve()}",
        str(temp_html_path.resolve())
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Cleanup temporary HTML file
    if temp_html_path.exists():
        temp_html_path.unlink()

    if pdf_path.exists() and pdf_path.stat().st_size > 0:
        print(f"SUCCESS: PDF generated cleanly at {pdf_path} (Size: {pdf_path.stat().st_size / 1024 / 1024:.2f} MB)")
    else:
        print(f"Error generating PDF. Edge output: {result.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    repo_root = Path(r"c:\Users\pc\Desktop\capstone\Heal_connectmain2.0")
    md_file = repo_root / "PROJECT REPORT" / "HealConnect_Comprehensive_Project_Report.md"
    pdf_file = repo_root / "PROJECT REPORT" / "HealConnect_Comprehensive_Project_Report.pdf"
    
    convert_md_to_pdf(md_file, pdf_file)
