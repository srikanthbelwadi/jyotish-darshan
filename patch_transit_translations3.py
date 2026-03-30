import json
import urllib.request
import urllib.parse
import os

langs = ['hi', 'ml', 'kn', 'te', 'ta']
strings = [
    "Select Life Event..",
    "Expand Results",
    "Minimize Results",
    "Oracle Insights Minimized",
    "Muhurat Scan Minimized",
    "Consult again (Override cache)"
]

def translate(text, lang):
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={lang}&dt=t&q={urllib.parse.quote(text)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req).read().decode('utf-8')
        d = json.loads(res)
        return d[0][0][0].replace("'", "\\'")
    except Exception as e:
        print(f"Error {lang}: {e}")
        return text

filepath = 'src/i18n/dynamicTranslations.js'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
current_lang = None

for i, line in enumerate(lines):
    # Detect start of a lang block like   en: {
    if line.strip() in ['en: {', 'hi: {', 'ml: {', 'kn: {', 'te: {', 'ta: {']:
        current_lang = line.strip().split(':')[0]
        new_lines.append(line)
        continue

    # Detect end of a lang block: "  }," or "  }"
    if current_lang and line.strip() in ['},', '}']:
        # We hit the end of current_lang block, append new strings here
        target_lang = current_lang
        print(f"Adding to {target_lang}")
        added = []
        for s in strings:
            # Check if it already exists (very roughly)
            exists = False
            for prev_line in reversed(new_lines[-20:]): # check last 20 appended lines for safety
                if f"'{s}'" in prev_line or f'"{s}"' in prev_line:
                    exists = True
                    break
            if not exists:
                t = s if target_lang == 'en' else translate(s, target_lang)
                added.append(f"    '{s}': '{t}'")
        
        if added:
            # Add comma to the previous line if it doesn't have one
            if not new_lines[-1].strip().endswith(','):
                new_lines[-1] = new_lines[-1].rstrip('\n') + ',\n'
            
            for k, add_line in enumerate(added):
                if k < len(added) - 1:
                    new_lines.append(add_line + ',\n')
                else:
                    new_lines.append(add_line + '\n')
            
        new_lines.append(line)
        current_lang = None
        continue

    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done translating!")
