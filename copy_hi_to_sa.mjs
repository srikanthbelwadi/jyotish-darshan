import fs from 'fs';

// 1. Update dynamicTranslations.js
let dyn = fs.readFileSync('src/i18n/dynamicTranslations.js', 'utf-8');
const hiBlockMatch = dyn.match(/hi:\s*\{([\s\S]*?)\n  \},/);
const saBlockMatch = dyn.match(/sa:\s*\{([\s\S]*?)\n  \}/);

if (hiBlockMatch && saBlockMatch) {
    const hiText = hiBlockMatch[1];
    
    // Extract the nak_ keys from hi
    const nakRegex = /'nak_[^']+':\s*'[^']+',?/g;
    const hiNakMatches = hiText.match(nakRegex);
    
    if (hiNakMatches) {
        let saText = saBlockMatch[1];
        // replace the english ones with the hindi ones
        for (const hiNak of hiNakMatches) {
            const keyMatch = hiNak.match(/'(nak_[^']+)':/);
            if (keyMatch) {
                const key = keyMatch[1];
                saText = saText.replace(new RegExp(`'${key}':\\s*'[^']+',?`), hiNak.replace(/,$/, ''));
            }
        }
        dyn = dyn.replace(saBlockMatch[1], saText);
        fs.writeFileSync('src/i18n/dynamicTranslations.js', dyn);
        console.log("Updated sa in dynamicTranslations.js with hi fallback.");
    }
}

// 2. Update nakshatra_lore.js
let loreContent = fs.readFileSync('src/data/nakshatra_lore.js', 'utf-8');
const loreMatch = loreContent.match(/export const NAKSHATRA_LORE = (\{[\s\S]*?\});?\n?$/);
if (loreMatch) {
    const lore = eval("(" + loreMatch[1] + ")");
    const hiData = lore['hi'];
    
    if (!hiData) throw new Error("hi data missing");
    
    lore['sa'] = JSON.parse(JSON.stringify(hiData)); // Fallback sa entirely to hi
    
    const newContent = "export const NAKSHATRA_LORE = " + JSON.stringify(lore, null, 2) + ";\n";
    fs.writeFileSync('src/data/nakshatra_lore.js', newContent);
    console.log("Updated sa in nakshatra_lore.js with hi fallback.");
}
