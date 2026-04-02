import re

file_path = "src/components/profile/MemorialSettings.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject Imports
imports = """import React, { useState, useEffect } from 'react';
import { usePreferences } from '../../contexts/PreferencesContext';
import { DYNAMIC_STRINGS } from '../../i18n/dynamicTranslations';"""

content = content.replace("import React, { useState, useEffect } from 'react';", imports)

# 2. Inject `t` and `lang`
hook = """export default function MemorialSettings({ isOpen, onClose }) {
  const { lang } = usePreferences();
  const t = (key, defaultText) => {
    return (DYNAMIC_STRINGS[lang] || DYNAMIC_STRINGS.en)[key] || DYNAMIC_STRINGS.en[key] || defaultText;
  };"""

content = content.replace("export default function MemorialSettings({ isOpen, onClose }) {", hook)

# 3. Replace Strings
replacements = [
    ('>Ancestors & Memorials</h2>', '>{t("pc.mem.title", "Ancestors & Memorials")}</h2>'),
    ('Track the annual ceremonial dates (Varshika Tithi) for departed souls. The Panchang calendar will automatically identify these sacred dates based on the precise Lunar Month and Tithi of their passing.', '{t("pc.mem.desc", "Track the annual ceremonial dates (Varshika Tithi) for departed souls. The Panchang calendar will automatically identify these sacred dates based on the precise Lunar Month and Tithi of their passing.")}'),
    ('>Loading...</p>', '>{t("pc.mem.loading", "Loading...")}</p>'),
    ('No memorial dates added.', '{t("pc.mem.noDates", "No memorial dates added.")}'),
    ('>Remove</button>', '>{t("pc.mem.remove", "Remove")}</button>'),
    ('+ Add Departed Soul', '{t("pc.mem.addBtn", "+ Add Departed Soul")}'),
    ('Maximum limit of 5 entries reached.', '{t("pc.mem.maxLimit", "Maximum limit of 5 entries reached.")}'),
    ('>New Memorial Entry</h3>', '>{t("pc.mem.newEntry", "New Memorial Entry")}</h3>'),
    ('>Name</label>', '>{t("pc.mem.nameLbl", "Name")}</label>'),
    ('placeholder="Name of the departed..."', 'placeholder={t("pc.mem.namePh", "Name of the departed...")}'),
    ('>Date of Passing</label>', '>{t("pc.mem.dateLbl", "Date of Passing")}</label>'),
    ('>Time (Optional)</label>', '>{t("pc.mem.timeLbl", "Time (Optional)")}</label>'),
    ('>Place (Optional)</label>', '>{t("pc.mem.placeLbl", "Place (Optional)")}</label>'),
    ('placeholder="Location of passing..."', 'placeholder={t("pc.mem.placePh", "Location of passing...")}'),
    ('>Cancel</button>', '>{t("pc.mem.cancel", "Cancel")}</button>'),
    ('>Save Entry</button>', '>{t("pc.mem.saveEntry", "Save Entry")}</button>'),
    ('>Discard Changes</button>', '>{t("pc.mem.discard", "Discard Changes")}</button>'),
    ("{loading ? 'Saving...' : 'Save Memorials'}", "{loading ? t('pc.mem.saving', 'Saving...') : t('pc.mem.saveMem', 'Save Memorials')}"),
]

for old_s, new_s in replacements:
    content = content.replace(old_s, new_s)

# Also fix the weird padding issue where Remove was floating poorly in Kannada if text is too long.
content = content.replace("padding: '6px 12px'", "padding: '6px 12px', minWidth: 'max-content'")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Finished patching strings in MemorialSettings.jsx")
