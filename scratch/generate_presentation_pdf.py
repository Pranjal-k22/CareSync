import os
import subprocess
import sys
from pathlib import Path
import markdown

def convert_presentation_md_to_pdf(md_path: Path, pdf_path: Path):
    if not md_path.exists():
        print(f"Error: Markdown file {md_path} does not exist.")
        sys.exit(1)

    print(f"Reading {md_path}...")
    md_content = md_path.read_text(encoding="utf-8")

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
        font-size: 10pt;
        line-height: 1.55;
        color: #1e293b;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }

    h1 {
        font-size: 20pt;
        color: #0f172a;
        border-bottom: 2.5px solid #2563eb;
        padding-bottom: 6px;
        margin-top: 22pt;
        margin-bottom: 14pt;
        page-break-before: always;
    }

    h1:first-of-type {
        page-break-before: avoid;
        font-size: 22pt;
        text-align: center;
        border-bottom: 3px solid #2563eb;
        margin-top: 5pt;
        margin-bottom: 20pt;
    }

    h2 {
        font-size: 13.5pt;
        color: #1e40af;
        border-bottom: 1.5px solid #cbd5e1;
        padding-bottom: 4px;
        margin-top: 16pt;
        margin-bottom: 8pt;
        page-break-after: avoid;
    }

    h3 {
        font-size: 11.5pt;
        color: #334155;
        margin-top: 12pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
    }

    p {
        margin-top: 0;
        margin-bottom: 8pt;
        text-align: justify;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10pt;
        margin-bottom: 14pt;
        font-size: 9pt;
    }

    tr {
        page-break-inside: avoid;
    }

    th {
        background-color: #f1f5f9;
        color: #0f172a;
        font-weight: 600;
        text-align: left;
        padding: 7px 9px;
        border: 1px solid #cbd5e1;
        border-bottom: 2px solid #0f172a;
    }

    td {
        padding: 6px 9px;
        border: 1px solid #cbd5e1;
        vertical-align: top;
    }

    tbody tr:nth-child(even) {
        background-color: #f8fafc;
    }

    code {
        font-family: 'Consolas', 'Courier New', Courier, monospace;
        font-size: 8.5pt;
        background-color: #f1f5f9;
        color: #0f172a;
        padding: 2px 4px;
        border-radius: 3px;
        border: 1px solid #e2e8f0;
    }

    pre {
        background-color: #0f172a;
        color: #f8fafc;
        padding: 10px 14px;
        border-radius: 5px;
        overflow-x: auto;
        font-size: 8.5pt;
        line-height: 1.4;
        margin-top: 8pt;
        margin-bottom: 12pt;
        page-break-inside: avoid;
    }

    pre code {
        background-color: transparent;
        color: inherit;
        padding: 0;
        border: none;
    }

    blockquote {
        margin: 10pt 0;
        padding: 8pt 12px;
        background-color: #eff6ff;
        border-left: 4px solid #2563eb;
        color: #1e3a8a;
    }

    ul, ol {
        margin-top: 0;
        margin-bottom: 8pt;
        padding-left: 20px;
    }

    li {
        margin-bottom: 3pt;
    }

    hr {
        border: none;
        border-top: 1px solid #cbd5e1;
        margin: 16pt 0;
    }
    """

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HealConnect — Review-I Presentation Detail Reference Manual</title>
    <style>
        {css_styles}
    </style>
</head>
<body>
    {html_body}
</body>
</html>
"""

    temp_html_path = md_path.parent / "temp_presentation.html"
    print(f"Writing temporary HTML file to {temp_html_path}...")
    temp_html_path.write_text(full_html, encoding="utf-8")

    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_exe):
        edge_exe = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

    if not os.path.exists(edge_exe):
        print("Error: Microsoft Edge executable not found.")
        sys.exit(1)

    print("Running Microsoft Edge Headless PDF Generation...")
    cmd = [
        edge_exe,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path.resolve()}",
        str(temp_html_path.resolve())
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if temp_html_path.exists():
        temp_html_path.unlink()

    if pdf_path.exists() and pdf_path.stat().st_size > 0:
        print(f"SUCCESS: PDF generated cleanly at {pdf_path} (Size: {pdf_path.stat().st_size / 1024:.2f} KB)")
    else:
        print(f"Error generating PDF. Edge output: {result.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    repo_root = Path(r"c:\Users\pc\Desktop\capstone\Heal_connectmain2.0")
    md_file = repo_root / "exp_project" / "presentation detail.md"
    pdf_file = repo_root / "exp_project" / "presentation detail.pdf"
    
    convert_presentation_md_to_pdf(md_file, pdf_file)
