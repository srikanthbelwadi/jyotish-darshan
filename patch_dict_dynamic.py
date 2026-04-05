import re

file_path = "/Users/belwadisrikanthpersonal/Astrology Game/jyotish-darshan/src/i18n/dynamicTranslations.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    r"'revealKundaliTitle':\s*'Reveal Kundali'": r"'revealKundaliTitle': 'Reveal Cosmic Blueprint'",
    r"'A partner Kundali is required\. Please add a partner':\s*'A partner Kundali is required\. Please add a partner'": r"'A partner Cosmic Blueprint is required. Please add a partner': 'A partner Cosmic Blueprint is required. Please add a partner'",
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
