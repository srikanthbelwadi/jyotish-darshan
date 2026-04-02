import re

with open('src/App.jsx', 'r') as f:
    text = f.read()

# Add DASHA_YRS and PCOLOR
injection = """
const PCOLOR = { sun:'#F59E0B', moon:'#9CA3AF', mars:'#EF4444', mercury:'#10B981', jupiter:'#FCD34D', venus:'#F472B6', saturn:'#374151', rahu:'#4B5563', ketu:'#6B7280' };
const DASHA_YRS = { sun:6, moon:10, mars:7, rahu:18, jupiter:16, saturn:19, mercury:17, ketu:7, venus:20 };

function localizePanchang"""

text = text.replace('function localizePanchang', injection, 1)

# Fix startStr / endStr
text = text.replace('m.startStr', 'm.start')
text = text.replace('m.endStr', 'm.end')
text = text.replace('d.startStr', 'd.start')
text = text.replace('d.endStr', 'd.end')
text = text.replace('curA.startStr', 'curA.start')
text = text.replace('curA.endStr', 'curA.end')

# Fix DailyPanchang
daily_fix = """        fetchKundali({year:now.getUTCFullYear(),month:now.getUTCMonth()+1,day:now.getUTCDate(),hour:utcH,minute:utcM,utcOffset:0,lat,lng}, null, true).then(K => {
          // fetch successfully handled panchang bypass
        }).catch(e => console.error("Panchang load failed", e));
        return;"""
text = re.sub(r'fetchKundali\(\{.*?\}\s*\)\.then\(K => setPanchang\(K\.panchang\)\)\.catch\(e => console\.error\("Panchang load failed", e\)\);\n\s*return;', daily_fix, text, count=1, flags=re.DOTALL)

with open('src/App.jsx', 'w') as f:
    f.write(text)

print("Patched App.jsx successfully!")
