import fs from 'fs';
import path from 'path';

const iconMap = {
    "sheetala_ashtami": "❄️",
    "papmochani_ekadashi": "🌺",
    "gudi_padwa_ugadi": "🌾",
    "cheti_chand": "🌙",
    "gangaur_matsya_jayanti": "👸 🐟",
    "yamuna_chhath": "🌊",
    "rama_navami": "🏹",
    "kamada_ekadashi": "🌺",
    "hanuman_jayanti": "🐒",
    "varuthini_ekadashi": "🌺",
    "parashurama_jayanti_akshaya_tritiya": "🪓 💰",
    "shankaracharya_jayanti": "📜",
    "ganga_saptami": "💧",
    "sita_navami": "👑",
    "mohini_ekadashi": "🌺",
    "narasimha_jayanti": "🦁",
    "buddha_purnima": "☸️",
    "narada_jayanti": "🪕",
    "apara_ekadashi": "🌺",
    "shani_jayanti_vat_savitri_vrat": "🪐 🌳",
    "ganga_dussehra": "🌊",
    "nirjala_ekadashi": "🚫💧",
    "vat_purnima_vrat": "🌳",
    "yogini_ekadashi": "🌺",
    "jagannath_rath_yatra": "🛕",
    "devshayani_ekadashi": "🛏️",
    "guru_purnima": "🕉️",
    "kamika_ekadashi": "🌺",
    "hariyali_teej": "🌿",
    "nag_panchami": "🐍",
    "kalki_jayanti": "🐎",
    "tulsidas_jayanti": "📜",
    "shravana_putrada_ekadashi": "👶",
    "raksha_bandhan_gayathri_jayanti": "🧵 🪔",
    "kajari_teej": "🌧️",
    "bahula_chaturthi": "🐄",
    "balarama_jayanti": "🪓",
    "krishna_janmashtami": "🦚",
    "aja_ekadashi": "🌺",
    "hartalika_teej": "🍃",
    "ganesh_chaturthi": "🐘",
    "rishi_panchami": "🧘",
    "radha_ashtami": "🌸",
    "parsva_ekadashi": "🌺",
    "vamana_jayanti": "☔",
    "anant_chaturdashi": "♾️",
    "pitru_paksha_begins": "🕊️",
    "indira_ekadashi": "🌺",
    "mahalaya_amavasya": "🌑",
    "sharad_navratri_begins": "🔱",
    "lalita_panchami": "✨",
    "saraswati_avahan": "🪕",
    "durga_ashtami": "🗡️",
    "maha_navami": "🌺",
    "dussehra_vijayadashami": "🏹",
    "papankusha_ekadashi": "🌺",
    "sharad_purnima_valmiki_jayanti": "🌕 📜",
    "karwa_chauth": "🌕",
    "ahoi_ashtami": "👩‍👧‍👦",
    "rama_ekadashi": "🌺",
    "dhanteras": "🪙",
    "narak_chaturdashi": "🪔",
    "diwali_deepavali": "🎇",
    "govardhan_puja": "⛰️",
    "bhai_dooj": "👫",
    "chhath_puja": "🌞",
    "gopashtami": "🐄",
    "akshaya_navami": "🌳",
    "devutthana_ekadashi": "🌅",
    "tulsi_vivah": "🌿",
    "dev_deepawali": "🪔",
    "utpanna_ekadashi": "🌺",
    "vivah_panchami": "💍",
    "gita_jayanti_mokshada_ekadashi": "📖 🌺",
    "dattatreya_jayanti": "🕉️",
    "saphala_ekadashi": "🌺",
    "pausha_putrada_ekadashi": "👶",
    "shattila_ekadashi": "🌾",
    "mauni_amavasya": "🤫",
    "vasant_panchami": "🌼",
    "ratha_saptami": "🌞",
    "bhishma_ashtami": "🏹",
    "maha_shivaratri": "🔱",
    "holika_dahan_holi": "🎨"
};

const calcPath = path.resolve('src/engine/PanchangCalculator.js');
let content = fs.readFileSync(calcPath, 'utf8');

// Find the festMap object
const festMapRegex = /const festMap = \{([\s\S]*?)\};/m;
const match = content.match(festMapRegex);

if (match) {
    let block = match[1];
    
    // Process each line to replace icon
    let newBlock = block.split('\n').map(line => {
        let m = line.match(/id:\s*"([^"]+)",\s*icon:\s*"([^"]+)"/);
        if (m) {
            let id = m[1];
            let newIcon = iconMap[id] || '🌺';
            return line.replace(/icon:\s*"[^"]+"/, `icon: "${newIcon}"`);
        }
        return line;
    }).join('\n');
    
    content = content.replace(festMapRegex, `const festMap = {${newBlock}};`);
    fs.writeFileSync(calcPath, content, 'utf8');
    console.log("✅ Icons successfully updated in PanchangCalculator.js");
} else {
    console.log("❌ Could not find festMap block");
}
