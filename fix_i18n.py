import sys

filepath = 'src/i18n/dynamicTranslations.js'

with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("\\n  },", "\n  },")
text = text.replace("\\n  hi:", "\n  hi:")
text = text.replace("\\n  ml:", "\n  ml:")
text = text.replace("\\n  kn:", "\n  kn:")
text = text.replace("\\n  te:", "\n  te:")
text = text.replace("\\n  ta:", "\n  ta:")
text = text.replace("\\n};", "\n};")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed literal newline escapes in dynamicTranslations.js")
