import json
import re
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
    content = f.read()

# For each lang, parse, merge, serialize
for lang in langs:
    print(f"Translating for {lang}...")
    # Find block
    pattern = rf"'{lang}':\s*{{(.*?)}}"
    match = re.search(pattern, content, re.DOTALL)
    if not match: continue
    
    inner = match.group(1)
    
    added = []
    for s in strings:
        escaped_s = s.replace('"', '\\"')
        escaped_s_single = s.replace("'", "\\'")
        if f"'{escaped_s_single}'" not in inner and f'"{escaped_s}"' not in inner:
            t = translate(s, lang)
            # Remove trailing dots if accidentally localized weirdly
            if t == text: t = s
            added.append(f"      '{s}':'{t}'")
            
    if added:
        new_inner = inner.rstrip()
        if new_inner and not new_inner.endswith(','):
            new_inner += ','
        new_inner += '\n' + ',\n'.join(added) + '\n    '
        content = content.replace(match.group(0), f"'{lang}': {{{new_inner}}}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done translating!")
