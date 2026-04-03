import re
import urllib.request
import urllib.parse
import json
import time

filepath = "src/data/pillarData.js"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# Extract all desc and prompt values
desc_matches = set(re.findall(r"desc:\s*'(.*?)'", text))
prompt_matches = set(re.findall(r"prompt:\s*'(.*?)'", text))

all_strings = sorted(list(desc_matches | prompt_matches))

LANGS = ['hi','kn','te','ta','ml','mr','gu','bn','sa']

def translate(text, target):
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target}&dt=t&q={urllib.parse.quote(text)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        data = urllib.request.urlopen(req).read().decode('utf-8')
        res = json.loads(data)
        # Handle multiple sentences mapped together
        result_str = "".join([part[0] for part in res[0]])
        return result_str
    except Exception as e:
        print(f"Error translating '{text}' to {target}: {e}")
        return text

# We will dump to a javascript patch script directly
payload = {}
for lang in LANGS:
    payload[lang] = {}

print("Translating...", len(all_strings), "strings")
for i, txt in enumerate(all_strings):
    for lang in LANGS:
        translated = translate(txt, lang)
        payload[lang][txt] = translated
        time.sleep(0.05)
    if i % 5 == 0:
        print(f"Progress: {i}/{len(all_strings)}")

out_script = """import fs from 'fs';

const UI_TEXT = """ + json.dumps(payload, ensure_ascii=False, indent=4) + """;

const filePath = 'src/i18n/dynamicTranslations.js';
let content = fs.readFileSync(filePath, 'utf8');

for (const [lang, dict] of Object.entries(UI_TEXT)) {
    const langMarkerFull = `  ${lang}: {\\n`;
    const langMarkerAlt = `${lang}: {`;
    
    let idx = content.indexOf(langMarkerFull);
    let markerLength = langMarkerFull.length;
    
    if (idx === -1) {
        idx = content.indexOf(langMarkerAlt);
        markerLength = langMarkerAlt.length;
    }

    if (idx !== -1) {
        let insertStr = '';
        for (const [k, v] of Object.entries(dict)) {
            if (!content.slice(idx, idx + 60000).includes(`"${k}"`)) {
                insertStr += `    "${k}": "${v.replace(/"/g, '\\\\"')}",\\n`;
            }
        }
        
        if (insertStr) {
            content = content.slice(0, idx + markerLength) + insertStr + content.slice(idx + markerLength);
        }
    }
}
fs.writeFileSync(filePath, content);
console.log("Successfully injected translated descriptions into dynamicTranslations.js via auto-translate node.");
"""

with open("auto_translate_desc.mjs", "w", encoding="utf-8") as f:
    f.write(out_script)

print("Generated patch script!")
