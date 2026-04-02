import re

# 1. Update ExpertReadingTab.jsx
with open('src/components/tabs/ExpertReadingTab.jsx', 'r', encoding='utf-8') as f:
    text_jsx = f.read()

text_jsx = text_jsx.replace(
    "{reading.deepDive.maha.start} {t('er.to') || 'to'} {reading.deepDive.maha.end}",
    "{t('er.dateRange') ? t('er.dateRange').replace('{start}', reading.deepDive.maha.start).replace('{end}', reading.deepDive.maha.end) : `${reading.deepDive.maha.start} to ${reading.deepDive.maha.end}`}"
)

text_jsx = text_jsx.replace(
    "{reading.deepDive.antar.start} {t('er.to') || 'to'} {reading.deepDive.antar.end}",
    "{t('er.dateRange') ? t('er.dateRange').replace('{start}', reading.deepDive.antar.start).replace('{end}', reading.deepDive.antar.end) : `${reading.deepDive.antar.start} to ${reading.deepDive.antar.end}`}"
)

with open('src/components/tabs/ExpertReadingTab.jsx', 'w', encoding='utf-8') as f:
    f.write(text_jsx)


# 2. Update expertTranslations.js
with open('src/i18n/expertTranslations.js', 'r', encoding='utf-8') as f:
    text_js = f.read()

date_ranges = {
    'en': '"er.dateRange": "{start} to {end}"',
    'hi': '"er.dateRange": "{start} से {end} तक"',
    'kn': '"er.dateRange": "{start} ರಿಂದ {end} ವರೆಗೆ"',
    'te': '"er.dateRange": "{start} నుండి {end} వరకు"',
    'ta': '"er.dateRange": "{start} முதல் {end} வரை"',
    'gu': '"er.dateRange": "{start} થી {end} સુધી"',
    'mr': '"er.dateRange": "{start} ते {end}"',
    'bn': '"er.dateRange": "{start} থেকে {end} পর্যন্ত"',
    'ml': '"er.dateRange": "{start} മുതൽ {end} വരെ"',
    'sa': '"er.dateRange": "{start} तः {end} पर्यन्तम्"'
}

for lang, range_str in date_ranges.items():
    # We will insert it right after "er.to": "..." or similar.
    # To be extremely safe, we look for "er.to": "..." within the lang block
    import re
    # find block for lang
    pattern = f"({lang}: \\{{[\\s\\S]*?)(\"er\\.to\": \"[^\"]*\")(,?)"
    
    # We use a replacement function to insert er.dateRange
    def repl(m):
        return f"{m.group(1)}{m.group(2)},\n    {range_str}{m.group(3)}"
        
    text_js = re.sub(pattern, repl, text_js, count=1)

with open('src/i18n/expertTranslations.js', 'w', encoding='utf-8') as f:
    f.write(text_js)

print("Patch applied to both files.")
