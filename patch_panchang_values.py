import re

file_path = "src/components/tabs/PanchangTab.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    # Top Grid Cell Abbreviated Line
    ('{MASAS[(panchang.solarMonth - 1) % 12]} • {NAKSHATRAS[panchang.nakshatraIndex % 27] || \'\'}',
     '{t("pc.mas." + MASAS[(panchang.solarMonth - 1) % 12], MASAS[(panchang.solarMonth - 1) % 12])} • {NAKSHATRAS[panchang.nakshatraIndex % 27] ? t("pc.nak." + NAKSHATRAS[panchang.nakshatraIndex % 27], NAKSHATRAS[panchang.nakshatraIndex % 27]) : \'\'}'),
    
    # Detail Panel
    ('{NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27] || \'Unknown\'}',
     '{NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27] ? t("pc.nak." + NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27], NAKSHATRAS[selectedDay.panchang.nakshatraIndex % 27]) : \'Unknown\'}'),
    
    ('{YOGAS[selectedDay.panchang.yogaIndex % 27] || \'Unknown\'}',
     '{YOGAS[selectedDay.panchang.yogaIndex % 27] ? t("pc.yog." + YOGAS[selectedDay.panchang.yogaIndex % 27], YOGAS[selectedDay.panchang.yogaIndex % 27]) : \'Unknown\'}'),
    
    ('{getKaranaName(selectedDay.panchang.karana1)} & {getKaranaName(selectedDay.panchang.karana2)}',
     '{t("pc.kar." + getKaranaName(selectedDay.panchang.karana1), getKaranaName(selectedDay.panchang.karana1))} & {t("pc.kar." + getKaranaName(selectedDay.panchang.karana2), getKaranaName(selectedDay.panchang.karana2))}'),
    
    ('{RASHIS[selectedDay.panchang.sunSign % 12]}',
     '{t("pc.rsh." + RASHIS[selectedDay.panchang.sunSign % 12], RASHIS[selectedDay.panchang.sunSign % 12])}'),

    ('{RASHIS[selectedDay.panchang.moonSign % 12]}',
     '{t("pc.rsh." + RASHIS[selectedDay.panchang.moonSign % 12], RASHIS[selectedDay.panchang.moonSign % 12])}'),
     
    ('{getSamvatsara(year)}',
     '{t("pc.samv." + getSamvatsara(year), getSamvatsara(year))}'),

    ('{MASAS[(selectedDay.panchang.solarMonth - 1) % 12]}',
     '{t("pc.mas." + MASAS[(selectedDay.panchang.solarMonth - 1) % 12], MASAS[(selectedDay.panchang.solarMonth - 1) % 12])}'),
]

for old_s, new_s in replacements:
    content = content.replace(old_s, new_s)

# Also fix the `pc.vaar` to be localized correctly if possible (Optional, but let's just let it fall back or use browser locale)
# Currently it is: `{selectedDay.dateObj.toLocaleDateString('default', { weekday: 'long' })}`
# Let's change 'default' to `lang === 'en' ? 'en-US' : lang+'-IN'`
content = content.replace(
    "{selectedDay.dateObj.toLocaleDateString('default', { weekday: 'long' })}",
    "{selectedDay.dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : `${lang}-IN`, { weekday: 'long' })}"
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Finished patching array variables in PanchangTab.jsx")
