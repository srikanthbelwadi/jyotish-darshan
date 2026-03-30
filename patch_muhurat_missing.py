import json
import urllib.request
import urllib.parse
import os

langs = ['hi', 'ml', 'kn', 'te', 'ta']
strings = [
    "Auspicious Muhurat",
    "Failed to fetch LLM analysis.",
    "Astrologer analyzing alignment...",
    "Auspicious Hours for",
    "Highly Auspicious",
    "Favorable",
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", 
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", 
    "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", 
    "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya", "Purnima", " (Shukla)", " (Krishna)",
    "Purnima (Shukla)", "Amavasya (Krishna)",
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    "Transit Nakshatra:", "Transit Tithi:", "Hourly Ascendant:"
]

# Additional combinations since engine might construct them:
for t in ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi"]:
    strings.append(f"{t} (Shukla)")
    strings.append(f"{t} (Krishna)")

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
    orig_content = f.read()

# We will just parse the file, and insert right before the closing bracket of each lang object
# Assuming clean structure like `hi: { ... },`
import re

for l in langs:
    # Find the block for this language: e.g., "\n  hi: {"
    # We will find the end of this block by matching the dictionary structure
    pattern = rf'\n  {l}: {{(.*?)\n  }},'
    # Wait, 'ta' might end with `\n  }\n};`
    if l == 'ta':
        pattern = rf'\n  {l}: {{(.*?)\n  }}\n}};'
    
    match = re.search(pattern, orig_content, re.DOTALL)
    if not match:
        print(f"COULD NOT FIND BLOCK FOR {l}")
        continue
    
    dict_body = match.group(1)
    
    # We add any missing strings to this dict body
    added = []
    for s in strings:
        if f"'{s}'" not in dict_body and f'"{s}"' not in dict_body:
            t = translate(s, l)
            added.append(f"    '{s}': '{t}'")
            
    if added:
        new_body = dict_body
        if not new_body.strip().endswith(','):
            new_body += ','
        new_body += "\n" + ",\n".join(added)
        
        if l == 'ta':
            new_block = f"\n  {l}: {{{new_body}\n  }}\n}};"
        else:
            new_block = f"\n  {l}: {{{new_body}\n  }},"
        orig_content = orig_content.replace(match.group(0), new_block)

# Add for 'en' as well
en_match = re.search(r'\n  en: \{(.*?)\n  \},', orig_content, re.DOTALL)
if en_match:
    dict_body = en_match.group(1)
    added = []
    for s in strings:
        if f"'{s}'" not in dict_body and f'"{s}"' not in dict_body:
            added.append(f"    '{s}': '{s}'")
    if added:
        new_body = dict_body
        if not new_body.strip().endswith(','):
            new_body += ','
        new_body += "\n" + ",\n".join(added)
        new_block = f"\n  en: {{{new_body}\n  }},"
        orig_content = orig_content.replace(en_match.group(0), new_block)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(orig_content)

print("Injected all missing words successfully!")
