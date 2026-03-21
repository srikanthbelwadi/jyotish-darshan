const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// The regex targets the duplicated block which starts with 'pdf.years' and ends with 'shadbala.weak':'...', 
// followed by a comma. We remove the second occurrence which does NOT have 'ashtakavarga.total' before it.
// Actually, it's safer to just remove the specific block:
// 'pdf.years':'.*?','pdf.start':'.*?','pdf.end':'.*?','pdf.antardasha':'.*?','pdf.yogaDosha':'.*?','pdf.type':'.*?','pdf.effect':'.*?','pdf.planet':'.*?','pdf.totalStrength':'.*?','pdf.classification':'.*?','pdf.printBtn':'.*?','pdf.closeBtn':'.*?','pdf.ayanamsa':'.*?','pdf.pada':'.*?','shadbala.strong':'.*?','shadbala.moderate':'.*?','shadbala.weak':'.*?',

const regex = /'pdf\.years':'[^']+','pdf\.start':'[^']+','pdf\.end':'[^']+','pdf\.antardasha':'[^']+','pdf\.yogaDosha':'[^']+','pdf\.type':'[^']+','pdf\.effect':'[^']+','pdf\.planet':'[^']+','pdf\.totalStrength':'[^']+','pdf\.classification':'[^']+','pdf\.printBtn':'[^']+','pdf\.closeBtn':'[^']+','pdf\.ayanamsa':'[^']+','pdf\.pada':'[^']+','shadbala\.strong':'[^']+','shadbala\.moderate':'[^']+','shadbala\.weak':'[^']+',/g;

let matchCount = 0;
// We will simply deduplicate by keeping only the first occurrence for each language line
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('pdf.years') && Object.keys({en:1,hi:1,kn:1,te:1,ta:1,sa:1,mr:1,gu:1,bn:1,ml:1}).some(lang => lines[i].startsWith(lang + ':'))) {
    // It's a language line containing duplicates.
    // Let's replace the regex matched blocks, BUT only keep the first one. Wait, in the string, 'ashtakavarga.total' is in the MIDDLE of the first block's properties.
    // Actually, the pattern in the file is:
    // ... 'pdf.pada':'...', 'ashtakavarga.total':'...', 'shadbala.strong':'...'
    // Then second block:
    // ... 'pdf.pada':'...', 'shadbala.strong':'...'
    // Let's just remove the second block.
    const secondBlockRegex = /'pdf\.years':'[^']+','pdf\.start':'[^']+','pdf\.end':'[^']+','pdf\.antardasha':'[^']+','pdf\.yogaDosha':'[^']+','pdf\.type':'[^']+','pdf\.effect':'[^']+','pdf\.planet':'[^']+','pdf\.totalStrength':'[^']+','pdf\.classification':'[^']+','pdf\.printBtn':'[^']+','pdf\.closeBtn':'[^']+','pdf\.ayanamsa':'[^']+','pdf\.pada':'[^']+','shadbala\.strong':'[^']+','shadbala\.moderate':'[^']+','shadbala\.weak':'[^']+',/;
    
    if(secondBlockRegex.test(lines[i])) {
      lines[i] = lines[i].replace(secondBlockRegex, '');
      matchCount++;
    }
  }
}

fs.writeFileSync(appPath, lines.join('\n'));
console.log('Fixed lines:', matchCount);
