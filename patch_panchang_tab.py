import re

file_path = "src/components/tabs/PanchangTab.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ('<span>Personalized Drik Panchang</span>', '<span>{t("pc.title", "Personalized Drik Panchang")}</span>'),
    ("Track daily Tithi, major festivals, living birthdays, and your departed loved ones' Varshika Tithi automatically.", '{t("pc.subtitle", "Track daily Tithi, major festivals, living birthdays, and your departed loved ones\' Varshika Tithi automatically.")}'),
    ('🕊️ Ancestors & Memorials', '🕊️ {t("pc.ancestors", "Ancestors & Memorials")}'),
    ("['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']", "[t('pc.Sun', 'Sun'), t('pc.Mon', 'Mon'), t('pc.Tue', 'Tue'), t('pc.Wed', 'Wed'), t('pc.Thu', 'Thu'), t('pc.Fri', 'Fri'), t('pc.Sat', 'Sat')]"),
    ('Using Default Location (Delhi). Enable GPS for local timings.', '{t("pc.defaultLocation", "Using Default Location (Delhi). Enable GPS for local timings.")}'),
    
    ('The Five Core Elements', '{t("pc.sec1", "The Five Core Elements")}'),
    ('Time & Planetary Positions', '{t("pc.sec2", "Time & Planetary Positions")}'),
    ('Calendar Identifiers', '{t("pc.sec3", "Calendar Identifiers")}'),
    ('Auspicious Timings', '{t("pc.sec4", "Auspicious Timings")}'),
    ('Inauspicious Timings', '{t("pc.sec5", "Inauspicious Timings")}'),
    ('Daily Guidelines & Festivals', '{t("pc.sec6", "Daily Guidelines & Festivals")}'),

    ('>Vaar:</strong>', '>{t("pc.vaar", "Vaar:")}</strong>'),
    ('>Tithi:</strong>', '>{t("pc.tithi", "Tithi:")}</strong>'),
    ('>Nakshatra:</strong>', '>{t("pc.nakshatra", "Nakshatra:")}</strong>'),
    ('>Yoga:</strong>', '>{t("pc.yoga", "Yoga:")}</strong>'),
    ('>Karanas:</strong>', '>{t("pc.karanas", "Karanas:")}</strong>'),

    ('>Sunrise:</strong>', '>{t("pc.sunrise", "Sunrise:")}</strong>'),
    ('>Sunset:</strong>', '>{t("pc.sunset", "Sunset:")}</strong>'),
    ('>Sun Sign:</strong>', '>{t("pc.sunSign", "Sun Sign:")}</strong>'),
    ('>Moon Sign:</strong>', '>{t("pc.moonSign", "Moon Sign:")}</strong>'),

    ('>Samvat:</strong>', '>{t("pc.samvat", "Samvat:")}</strong>'),
    ('>Masa:</strong>', '>{t("pc.masa", "Masa:")}</strong>'),
    ('>Paksha:</strong>', '>{t("pc.paksha", "Paksha:")}</strong>'),
    ('>Ritu:</strong>', '>{t("pc.ritu", "Ritu:")}</strong>'),
    ('>Ayana:</strong>', '>{t("pc.ayana", "Ayana:")}</strong>'),

    ('>Brahma Muhurat:</strong>', '>{t("pc.brahma", "Brahma Muhurat:")}</strong>'),
    ('>Abhijit Muhurat:</strong>', '>{t("pc.abhijit", "Abhijit Muhurat:")}</strong>'),
    ('>Amrit Kaal:</strong>', '>{t("pc.amrit", "Amrit Kaal:")}</strong>'),
    ('Approx 1/8th of day active', '{t("pc.amritDesc", "Approx 1/8th of day active")}'),
    ('>Vijay Muhurat:</strong>', '>{t("pc.vijay", "Vijay Muhurat:")}</strong>'),

    ('>Rahu Kaal:</strong>', '>{t("pc.rahu", "Rahu Kaal:")}</strong>'),
    ('>Yamaganda:</strong>', '>{t("pc.yama", "Yamaganda:")}</strong>'),
    ('>Gulikai Kaal:</strong>', '>{t("pc.guli", "Gulikai Kaal:")}</strong>'),

    ('No major festivals or personalized events today.', '{t("pc.noEvents", "No major festivals or personalized events today.")}'),
    
    ('🌕 Purnima', '🌕 {t("pc.purnima", "Purnima")}'),
    ('The auspicious day of the full moon.', '{t("pc.purnimaDesc", "The auspicious day of the full moon.")}'),
    ('🌑 Amavasya', '🌑 {t("pc.amavasya", "Amavasya")}'),
    ('The new moon day, suitable for honoring ancestors.', '{t("pc.amavasyaDesc", "The new moon day, suitable for honoring ancestors.")}'),
    ('🌿 Ekadashi', '🌿 {t("pc.ekadashi", "Ekadashi")}'),
    ('Auspicious day for fasting and spiritual progress.', '{t("pc.ekadashiDesc", "Auspicious day for fasting and spiritual progress.")}'),
    ('🐘 Sankashti Chaturthi', '🐘 {t("pc.sankashti", "Sankashti Chaturthi")}'),
    ('Auspicious day dedicated to Lord Ganesha for obstacle removal.', '{t("pc.sankashtiDesc", "Auspicious day dedicated to Lord Ganesha for obstacle removal.")}'),
    ('🎂 Living Birthday (Tithi)', '🎂 {t("pc.livingBirthday", "Living Birthday (Tithi)")}'),
    ('🕊️ Varshika Tithi (Memorial)', '🕊️ {t("pc.varshikaTithi", "Varshika Tithi (Memorial)")}'),

    ('panchang.paksha', 't("pc.paksha." + panchang.paksha, panchang.paksha)'),
    ('panchang.ritu', 't("pc.ritu." + panchang.ritu, panchang.ritu)'),
    ('panchang.ayana', 't("pc.ayana." + panchang.ayana, panchang.ayana)'),
    
    ('{selectedDay.panchang.festivalIcon || \'🪔\'} {selectedDay.panchang.festival}', '{selectedDay.panchang.festivalIcon || \'🪔\'} {t("pc.fest." + selectedDay.panchang.festivalId + ".n", selectedDay.panchang.festival)}'),
    ('{selectedDay.panchang.festivalDesc}', '{t("pc.fest." + selectedDay.panchang.festivalId + ".d", selectedDay.panchang.festivalDesc)}'),
    ('title={panchang.festival}', 'title={t("pc.fest." + panchang.festivalId + ".n", panchang.festival)}')
]

for old_s, new_s in replacements:
    content = content.replace(old_s, new_s)

# Also need to fix the t() definitions
content = content.replace('{panchang.festival}', '{t("pc.fest." + panchang.festivalId + ".n", panchang.festival)}')

# Also format time to pass `lang` correctly inside formatTime
content = content.replace('export function formatTime', 'export function formatTime') # Ignored as formatTime is in PanchangCalculator

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Finished patching strings in PanchangTab.jsx")
