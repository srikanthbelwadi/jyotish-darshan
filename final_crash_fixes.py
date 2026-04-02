import re

with open('src/App.jsx', 'r') as f:
    text = f.read()

# 1. Add RASHI_LORD
rashi_lord = "export const RASHI_LORD = ['mars','venus','mercury','moon','sun','mercury','venus','mars','jupiter','saturn','saturn','jupiter'];\n"
text = text.replace("export const DASHA_YRS", rashi_lord + "export const DASHA_YRS")

# 2. Fix divCharts.D9 vs divisionalCharts.D9
text = text.replace("K.divCharts.D9", "(K.divCharts?.D9 || K.divisionalCharts?.D9)")

with open('src/App.jsx', 'w') as f:
    f.write(text)

# Fix in pdf PrintLayout too if it has it
with open('src/components/pdf/PrintLayout.jsx', 'r') as f:
    pdf_text = f.read()

pdf_text = pdf_text.replace("divCharts?.D9", "(divCharts?.D9 || divisionalCharts?.D9)")

with open('src/components/pdf/PrintLayout.jsx', 'w') as f:
    f.write(pdf_text)

print("Final crash constraints fixed!")
