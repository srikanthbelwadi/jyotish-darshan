import json
import re

with open('src/i18n/dynamicTranslations.js', 'r', encoding='utf-8') as f:
    text = f.read()

# We need to extract the dictionary parts, doing a simple regex print.
matches = re.finditer(r'([a-z]{2}): \{[\s\S]*?\'Cancer\': \'(.*?)\'[\s\S]*?\'Sat\': \'(.*?)\'', text)
for m in matches:
    print(f"{m.group(1)}: Cancer={m.group(2)}, Sat={m.group(3)}")
