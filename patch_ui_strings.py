import json
import re

with open('nak_ui_translations.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

with open('src/i18n/dynamicTranslations.js', 'r', encoding='utf-8') as f:
    content = f.read()

for lang, texts in translations.items():
    parts = []
    for k, v in texts.items():
        v = v.replace("'", "\\'")
        parts.append(f"'{k}': '{v}'")
    
    inject_str = ",\n    " + ",\n    ".join(parts) + "\n  },\n"
    
    # In dynamicTranslations.js, languages blocks typically look like:
    #   en: { ... \n  },
    # or
    #   hi: { ... \n  },
    # So we look for \n  }, or \n  } after the lang key
    
    # We will find the correct block for the lang, and insert just before its closing `  },`
    
    pattern = re.compile(rf"([\s\S]*?{lang}:\s*{{[\s\S]*?)(\n\s*}},?)", re.MULTILINE)
    
    match = pattern.search(content)
    if match:
        content = content[:match.start(2)] + ",\n    " + ",\n    ".join(parts) + content[match.start(2):]
    else:
        print(f"Could not find block for {lang}")

with open('src/i18n/dynamicTranslations.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Injected UI strings into dynamicTranslations.js")
