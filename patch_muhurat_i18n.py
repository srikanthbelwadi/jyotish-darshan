import json
import urllib.request
import urllib.parse
import os

langs = ['hi', 'ml', 'kn', 'te', 'ta']
strings = [
  "Simantonnayana (Baby Shower / Godh Bharai)",
  "Namakarana (Naming Ceremony)",
  "Annaprashana (First Solid Food)",
  "Mundan / Chudakarana (First Haircut)",
  "Karnavedha (Ear Piercing)",
  "Vidyarambha / Aksharabhyasam (Start of Education)",
  "Upanayana (Sacred Thread Ceremony)",
  "Vivaha (Marriage)",
  "Sagai / Mangni (Engagement)",
  "Bhoomi Puja (Foundation Stone Laying)",
  "Griha Pravesh (Housewarming)",
  "Deva Pratishtha (Idol Installation)",
  "Shanti Puja (Pacification Rituals)",
  "Vyapar Arambh (Starting a Business)",
  "Sampatti Kharidi (Property Purchase)",
  "Vahana Puja (Buying a Vehicle)",
  "Swarna / Abhushan Kharidi (Buying Gold)",
  "Yatra (Significant Journeys)",
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
  "Suggestions for favorable timings based on classical planetary transits.",
  "Select an Event to cast electional chart:",
  "Go",
  "A partner Kundali is required. Please add a partner",
  "Consulting Ephemeris Transits for",
  "No auspicious alignments found for this event in the next 365 days.",
  "Try a different event or adjust the planetary context.",
  "Highly Auspicious",
  "Favorable",
  "Auspicious Hours for",
  "Recommended Window:",
  "Transit Nakshatra:",
  "Transit Tithi:",
  "Hourly Ascendant:",
  "Astrologer analyzing alignment..."
]

def translate(text, lang):
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={lang}&dt=t&q={urllib.parse.quote(text)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req).read().decode('utf-8')
        d = json.loads(res)
        res_text = ""
        for sentence in d[0]:
            if sentence[0]:
                res_text += sentence[0]
        return res_text.replace("'", "\\'")
    except Exception as e:
        print(f"Error {lang}: {e}")
        return text

filepath = 'src/i18n/dynamicTranslations.js'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
current_lang = None

for i, line in enumerate(lines):
    if line.strip() in ['en: {', 'hi: {', 'ml: {', 'kn: {', 'te: {', 'ta: {']:
        current_lang = line.strip().split(':')[0]
        new_lines.append(line)
        continue

    if current_lang and line.strip() in ['},', '}']:
        target_lang = current_lang
        added = []
        for s in strings:
            exists = False
            for prev_line in reversed(new_lines[-200:]): # Lookback further
                if f"'{s}'" in prev_line or f'"{s}"' in prev_line:
                    exists = True
                    break
            if not exists:
                t = s if target_lang == 'en' else translate(s, target_lang)
                added.append(f"    '{s}': '{t}'")
        
        if added:
            if not new_lines[-1].strip().endswith(','):
                new_lines[-1] = new_lines[-1].rstrip('\\n') + ',\\n'
            
            for k, add_line in enumerate(added):
                if k < len(added) - 1:
                    new_lines.append(add_line + ',\\n')
                else:
                    new_lines.append(add_line + '\\n')
            
        new_lines.append(line)
        current_lang = None
        continue

    new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Translated all Muhurat Planner strings successfully!")
