import re

file_path = "src/components/tabs/MockDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ('🕉️ Personalized Drik Panchang', '🕉️ {t("pc.title", "Personalized Drik Panchang")}'),
    ("Track daily Tithi, major festivals, living birthdays, and your departed loved ones' Varshika Tithi automatically.", '{t("pc.subtitle", "Track daily Tithi, major festivals, living birthdays, and your departed loved ones\' Varshika Tithi automatically.")}'),
    ('Open Lunar Calendar ➔', '{t("pc.openCal", "Open Lunar Calendar ➔")}'),
]

for old_s, new_s in replacements:
    content = content.replace(old_s, new_s)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Finished patching strings in MockDashboard.jsx")
