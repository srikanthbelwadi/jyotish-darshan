import re

# The 60 Samvatsaras
samvatsaras = [
    "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapathi", "Angirasa", "Shrimukha", "Bhava", "Yuva", "Dhatri",
    "Ishvara", "Bahudhanya", "Pramathi", "Vikrama", "Vrushapraja", "Chitrabhanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
    "Sarvajit", "Sarvadhari", "Virodhi", "Vikruti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
    "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrut", "Shobhakrut", "Krodhi", "Vishvavasu", "Parabhava",
    "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhikrut", "Paridhavi", "Pramadi", "Ananda", "Rakshasa", "Nala",
    "Pingala", "Kalayukti", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktaksha", "Krodhana", "Akshaya"
]

festivals = {
    "Sankashti Chaturthi": "Sankashti Chaturthi",
    "Diwali": "Diwali",
    "Navaratri": "Navaratri",
    "Maha Shivaratri": "Maha Shivaratri",
    "Varshika Tithi": "Varshika Tithi",
    "Ganesha Chaturthi": "Ganesha Chaturthi",
    "Krishna Janmashtami": "Krishna Janmashtami",
    "Rama Navami": "Rama Navami",
    "Living Birthday": "Living Birthday",
    "Departed Soul": "Departed Soul",
    "Memorials / Ancestors": "Memorials / Ancestors",
    "Name": "Name",
    "Date of Passing": "Date of Passing",
    "Place": "Place",
    "Add Entry": "Add Entry",
    "Save": "Save",
    "Cancel": "Cancel",
    "Delete": "Delete"
}

file_path = "/Users/belwadisrikanthpersonal/Astrology Game/jyotish-darshan/src/i18n/dynamicTranslations.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

def build_insert_string():
    lines = []
    for sam in samvatsaras:
        lines.append(f"    'sam.{sam}': '{sam}'")
    for key, val in festivals.items():
        lines.append(f"    '{key}': '{val}'")
    return ",\n" + ",\n".join(lines)

insert_str = build_insert_string()

# The regex matches exactly \n  },
new_content = re.sub(r'\n  \},', insert_str + r'\n  },', content)
# And the very last object closing bracket:
new_content = re.sub(r'\n  \}\n\}', insert_str + r'\n  }\n}', new_content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Panchang translations patched successfully.")
