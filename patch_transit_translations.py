import json
import re

with open('house_translations.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

# Read App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# For each language, find "lang:{" and insert transit fields
for lang, texts in translations.items():
    if lang == 'sa' and texts['H1'] == 'Happiness & Comfort':
        # Default sa wasn't translated. Map manually.
        texts = {
            "H1": "सुखम् (Happiness)",
            "H2": "धनहानिः (Wealth Loss)",
            "H3": "सफलता (Success)",
            "H4": "मानसिककष्टम् (Mental Stress)",
            "H5": "चिन्ता (Worry)",
            "H6": "विजयः (Victory)",
            "H7": "आनन्दः (Joy)",
            "H8": "कष्टम् (Trouble)",
            "H9": "श्रमः (Fatigue)",
            "H10": "सम्मानः (Honor)",
            "H11": "लाभः (Gains)",
            "H12": "व्ययः (Expense)"
        }
    
    # Format the replacement string
    # E.g. 'transit.H1': 'Happiness & Comfort', ...
    parts = []
    for k, v in texts.items():
        # Escape quotes just in case
        v = v.replace("'", "\\'")
        parts.append(f"'transit.{k}':'{v}'")
    
    transit_str = ",".join(parts) + ","
    
    # Find block like 'en: {' or 'en:{'
    # Actually looking at the prev grep, it looks like '    en:{' or '  en: {'
    pattern = re.compile(rf'({lang}:{{\s*)', re.MULTILINE)
    
    # If the language doesn't have a space, it will match.
    # What if it's already there? Replace it if exists, or just prepend.
    if re.search(pattern, content):
        content = re.sub(pattern, rf'\g<1>{transit_str}', content, count=1)
    else:
        print(f"Warning: Could not find block for lang {lang}")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to App.jsx.")
