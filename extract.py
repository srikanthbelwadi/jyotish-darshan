import sys

with open('index.html', 'r') as f:
    lines = f.readlines()

# CSS extraction (10 to 189)
css_lines = lines[9:189]
with open('src/index.css', 'w') as f:
    f.writelines(css_lines)

# JS extraction (198 to 3138)
js_lines = lines[198:3138]

# Inject Life Dimensions into TABS_DEF and switch case.
# TABS_DEF starts around line 2952
for i, line in enumerate(js_lines):
    if "id:'overview',label:'Overview'" in line:
        js_lines.insert(i + 1, "  {id:'dimensions',label:'Life Dimensions',icon:'🌟'},\n")
        break

for i, line in enumerate(js_lines):
    if "tab==='overview'" in line:
        js_lines.insert(i + 1, "        {tab==='dimensions'&&<LifeDimensionsCard kundali={K} />}\n")
        break

with open('src/App.jsx', 'w') as f:
    f.write("import React from 'react';\n")
    f.write("import './index.css';\n")
    f.write("import LifeDimensionsCard from './components/LifeDimensionsCard.jsx';\n")
    f.writelines(js_lines)
    f.write("\nexport default App;\n")

# Replace index.html with Vite boilerplate
with open('index.html', 'w') as f:
    f.write('''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jyotish Darshan — Vedic Birth Chart</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&family=Noto+Sans+Devanagari:wght@400;600&family=Noto+Sans+Kannada:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
</body>
</html>''')

