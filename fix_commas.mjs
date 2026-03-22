import fs from 'fs';

let content = fs.readFileSync('src/i18n/dynamicTranslations.js', 'utf-8');
const lines = content.split('\n');

for (let i = 0; i < lines.length - 1; i++) {
  const line = lines[i].trimEnd();
  const nextLine = lines[i+1].trimStart();
  
  // If current line ends with a string quote (single or double) 
  // and it's NOT followed by a comma, AND the next line starts with a string key or similar
  if (line.match(/['"]$/) && nextLine.match(/^['"]/)) {
    lines[i] = line + ',';
  }
}

fs.writeFileSync('src/i18n/dynamicTranslations.js', lines.join('\n'));
console.log("Fixed missing commas in dynamicTranslations.js");
