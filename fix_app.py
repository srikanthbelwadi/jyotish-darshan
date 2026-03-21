import re
import sys

with open('src/App.jsx', 'r') as f:
    content = f.read()

# 1. Add import
if "PrintLayout" not in content:
    content = content.replace(
        "import CompatibilityInputForm from './components/CompatibilityInputForm.jsx';",
        "import CompatibilityInputForm from './components/CompatibilityInputForm.jsx';\nimport PrintLayout from './components/pdf/PrintLayout.jsx';"
    )

# 2. Delete function downloadPDF(K,lang){ ... }
# We can find it and remove it regex-wise
download_pdf_start = content.find('function downloadPDF')
if download_pdf_start != -1:
    download_pdf_end = content.find('// ════════════════════════════════════════════════════════════════\n// ROOT APP', download_pdf_start)
    if download_pdf_end != -1:
        content = content[:download_pdf_start] + content[download_pdf_end:]

# 3. Add isPrinting state in ResultsPage
if "isPrinting" not in content:
    content = content.replace(
        "const[showPartnerForm, setShowPartnerForm]=React.useState(false);",
        "const[showPartnerForm, setShowPartnerForm]=React.useState(false);\n  const[isPrinting, setIsPrinting]=React.useState(false);\n\n  const handleDownloadPDF = () => {\n    setIsPrinting(true);\n    setTimeout(() => {\n      window.print();\n      setIsPrinting(false);\n    }, 500);\n  };\n"
    )

# 4. Replace the old downloadPDF button
old_btn = "onClick={()=>downloadPDF(K,lang)}"
new_btn = "onClick={handleDownloadPDF} disabled={isPrinting}"
content = content.replace(old_btn, new_btn)

old_text = "↓ {t('download',lang)}"
new_text = "{isPrinting ? '⏳ ...' : `↓ ${t('download',lang)}`}"
if new_text not in content:
    content = content.replace(old_text, new_text)

# 5. Inject <PrintLayout>
if "PrintLayout" not in content.split("<!-- Hidden Print View -->")[-1]:
    footer_idx = content.find('</footer>\n    </div>\n  );\n}')
    if footer_idx != -1:
        injection = """</footer>
      
      {/* ── Hidden Print View ── */}
      {isPrinting && (
        <div id="print-root-container">
          <PrintLayout K={K} partnerKundali={partnerKundali} />
        </div>
      )}
    </div>
  );
}"""
        content = content[:footer_idx] + injection

with open('src/App.jsx', 'w') as f:
    f.write(content)

print('Patched src/App.jsx')
