const fs = require('fs');

let content = fs.readFileSync('src/components/tabs/MockDashboard.jsx', 'utf-8');

const startStr = 'const PILLAR_DATA = {';
const endStr = '};\n\n// ==========================================';
const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find PILLAR_DATA bounds.");
    process.exit(1);
}

const pillarDataStr = content.substring(startIdx + startStr.length - 1, endIdx + 1);

let PILLAR_DATA;
eval('PILLAR_DATA = ' + pillarDataStr);

const newOptions = {
  'dharma': [
    { id: 'dh5', icon: '⚡', label: 'Guru’s Curse', pred: 'Jupiter is heavily afflicted by Rahu (Guru Chandala Yoga), bringing profound spiritual obstacles and loss of faith.', rem: 'Serve an authentic spiritual master unconditionally.' },
    { id: 'dh6', icon: '🛕', label: 'Restoring the Temple', pred: 'An exalted Jupiter empowers the 9th house, calling you to financially or physically reconstruct a decayed place of worship.', rem: 'Donate pure gold or labor to a historic temple.' }
  ],
  'vivaha': [
    { id: 'v5', icon: '🤫', label: 'Secret Union', pred: 'Venus and Rahu conspire in the 12th house, indicating a passionate, highly secretive romance hidden from society.', rem: 'Maintain absolute discretion. Public exposure will bring ruin.' },
    { id: 'v6', icon: '👴', label: 'Arranged by Elders', pred: 'Jupiter powerfully aspects the 7th. A highly auspicious, long-lasting union will be arranged by respected elders of the community.', rem: 'Trust the wisdom of the patriarchs in this matter.' }
  ],
  'dhana': [
    { id: 'd5', icon: '⚖️', label: 'Unexpected Penalty', pred: 'The Sun and Saturn clash in the 2nd house. Royal authorities or the state will extract a heavy, unavoidable financial penalty.', rem: 'Pay the fine immediately without dispute to halt the karma.' },
    { id: 'd6', icon: '📿', label: 'Jewelry Acquisition', pred: 'Venus is exalted in the house of wealth. You will soon acquire flawlessly crafted, ancestral gem-studded jewelry.', rem: 'Keep the most valuable piece in a vault facing the North.' }
  ],
  'arogya': [
    { id: 'a5', icon: '🩸', label: 'Blood Toxins', pred: 'Mars and Rahu corrupt the 6th house. Impure blood and sudden, severe skin eruptions will manifest rapidly.', rem: 'Consume neem leaves daily and strictly avoid all fermented foods.' },
    { id: 'a6', icon: '✨', label: 'Rapid Healing', pred: 'Exalted Jupiter casts a divine glance on the 6th house, ensuring a miraculous, abnormally fast recovery from a recent ailment.', rem: 'No remedy needed. The planetary shield is fully active.' }
  ],
  'muhurta': [
    { id: 'm5', icon: '🌑', label: 'Eclipsed Window', pred: 'A severe Grahana Dosha obscures the current timeframe. Any new venture initiated now will be swallowed by darkness and fail.', rem: 'Suspend all critical worldly actions until the lunar cycle renews.' },
    { id: 'm6', icon: '☀️', label: 'Abhijit Muhurta', pred: 'A perfect solar alignment at noon creates an unstoppable Abhijit Muhurta. Whatever is launched today cannot be defeated.', rem: 'Strike precisely at the zenith of the sun.' }
  ],
  'shanti': [
    { id: 'sh5', icon: '🔔', label: 'Temple Bell Offering', pred: 'Venus is agitated. Offering a massive bronze bell to a goddess temple will instantly shatter the negative acoustic frequencies around you.', rem: 'Ring the bell yourself with absolute devotion.' },
    { id: 'sh6', icon: '🪔', label: 'Lighting Ghee Lamps', pred: 'The Sun and Mars lack fire. Lighting 108 pure cow-ghee lamps at dusk will invoke the protective deities of the 10th direction.', rem: 'Use only cotton wicks and face the East.' }
  ],
  'santhana': [
    { id: 'sa5', icon: '🍼', label: 'Adoption of a Child', pred: 'Saturn and Mercury influence the 5th house strongly. Your karmic lineage will expand not through blood, but through adopting an orphaned soul.', rem: 'Welcome the child as your absolute own; the karma is identical.' },
    { id: 'sa6', icon: '🌑', label: 'Loss of Heir', pred: 'A severe Pitra Dosha acts upon the 5th house, indicating a tragic interruption in the bloodline if the ancestors are not appeased.', rem: 'Perform the Narayan Bali ritual perfectly with a qualified priest.' }
  ],
  'yatra': [
    { id: 'y5', icon: '🏜️', label: 'Lost in Transit', pred: 'Ketu in the 12th scatters your sense of direction. You will likely face severe disorientation or misdirection during a foreign journey.', rem: 'Do not travel alone. Rely entirely on a local guide.' },
    { id: 'y6', icon: '🚢', label: 'Profitable Voyage', pred: 'Mercury in the 9th indicates a highly systematic, well-planned long-distance journey that will secure a major trade route.', rem: 'Maintain meticulous ledgers during the expedition.' }
  ],
  'vyavahara': [
    { id: 'vy5', icon: '🕊️', label: 'Mediation & Truce', pred: 'Jupiter’s aspect on the 6th house forces both sides into a state of exhaustion. A peaceful, highly favorable mediation is now possible.', rem: 'Send an impartial elder as an emissary to offer terms.' },
    { id: 'vy6', icon: '⛓️', label: 'Imprisonment', pred: 'The 12th Lord occupies the 6th with Rahu. There is an extreme, imminent risk of physical confinement or severe legal detention.', rem: 'Flee the jurisdiction or submit entirely to the mercy of the magistrate.' }
  ],
  'vidya': [
    { id: 'vi5', icon: '🚫', label: 'Interrupted Studies', pred: 'Saturn aspects the 4th and 5th houses, causing a brutal, multi-year blockage in your formal education due to family responsibilities.', rem: 'Accept the delay. The worldly tragedy will be your true education.' },
    { id: 'vi6', icon: '🗣️', label: 'Foreign Tongues', pred: 'Rahu in the 2nd rapidly accelerates your ability to master alien languages and bizarre, unfamiliar dialects.', rem: 'Use this linguistic power to negotiate with foreign merchants.' }
  ],
  'bhumi': [
    { id: 'bh5', icon: '🏺', label: 'Unearthed Relics', pred: 'Ketu in the 4th suggests the land you recently purchased contains ancient, spiritually volatile artifacts buried beneath the soil.', rem: 'If found, do not bring them inside the house. Surrender them to a museum or temple.' },
    { id: 'bh6', icon: '🏛️', label: 'Loss to State', pred: 'The Sun severely afflicts the 4th house. The ruling government or king will invoke eminent domain and seize your ancestral land.', rem: 'Do not fight the royal decree. Seek compensation in a different province.' }
  ],
  'moksha': [
    { id: 'mo5', icon: '🐍', label: 'False Guru', pred: 'Rahu in the 9th creates a powerful mirage of enlightenment. The spiritual master you currently follow is an absolute fraud harvesting your energy.', rem: 'Abandon the ashram in the dead of night. Seek truth in standard scriptures.' },
    { id: 'mo6', icon: '🛕', label: 'Pilgrimage to Kashi', pred: 'Jupiter and the Moon align in the 12th. The final liberation coordinates are set. A journey to Varanasi or a coastal holy city is mathematically required.', rem: 'Bathe in the sacred river precisely at dawn.' }
  ],
  'pitru': [
    { id: 'pi5', icon: '🌑', label: 'Forgotten Vows', pred: 'Saturn opposes the Sun. A vow made by your grandfather was left incomplete, and the karmic debt is currently paralyzing your career.', rem: 'Identify the unfulfilled promise and execute it yourself.' },
    { id: 'pi6', icon: '💰', label: 'Ancestral Wealth', pred: 'The 8th Lord in the 2nd house unlocks a massive, hidden vault of wealth accumulated by a forgotten patriarch.', rem: 'Use precisely half of this wealth to build an institution in their name.' }
  ],
  'gupta_dhana': [
    { id: 'gu5', icon: '⛏️', label: 'Finding Buried Coin', pred: 'Mars aspects the 8th house strongly. Physical excavation on your property will reveal a small cache of ancient, untraceable gold.', rem: 'Purify the gold with milk before bringing it into the primary dwelling.' },
    { id: 'gu6', icon: '🥷', label: 'Stolen Inheritance', pred: 'Rahu in the 8th ensures that a legitimate inheritance will be entirely embezzled by a deceitful relative manipulating the legal system.', rem: 'Do not waste years in court. The wealth is poisoned. Let it go.' }
  ],
  'bhratru': [
    { id: 'br5', icon: '🏳️', label: 'Cowardice in Battle', pred: 'Mars is deeply debilitated. In the coming conflict, a younger sibling or close ally will abandon you completely out of sheer terror.', rem: 'Do not rely on anyone else’s courage right now. Stand alone.' },
    { id: 'br6', icon: '🩸', label: 'Sacrifice for Brother', pred: 'Jupiter in the 3rd signifies you will willingly and joyfully sacrifice a massive personal opportunity to elevate your sibling.', rem: 'Make the sacrifice silently. The cosmos will repay you tenfold.' }
  ],
  'mata_pita': [
    { id: 'mp5', icon: '🚶', label: 'Father’s Exile', pred: 'The Sun occupies the 12th house. Your father faces severe public humiliation or forced professional exile from his homeland.', rem: 'Provide him sanctuary in your home without asking questions.' },
    { id: 'mp6', icon: '✨', label: 'Mother’s Benediction', pred: 'An exalted Moon in the 4th signifies that your mother’s explicit, spoken blessing right now is acting as an invincible metaphysical shield.', rem: 'Touch her feet daily before initiating any financial maneuvers.' }
  ],
  'sukha': [
    { id: 'su5', icon: '🐜', label: 'Infestation', pred: 'Rahu transits the 4th house. The physical structure of your home will be overrun by subterranean pests or toxic mold, destroying your peace.', rem: 'Evacuate the dwelling temporarily and heavily fumigate with camphor and sulfur.' },
    { id: 'su6', icon: '🎊', label: 'Celebration at Home', pred: 'Venus enters the 4th. The household will host a magnificent, joyous celebration involving music, flowers, and extended family.', rem: 'Decorate the entrance with fresh mango leaves and turmeric.' }
  ],
  'diksha': [
    { id: 'di5', icon: '💔', label: 'Broken Vows', pred: 'Ketu is violently afflicted by Mars. You are on the verge of shattering a sacred mantra-diksha vow out of sheer frustration.', rem: 'Fast for 24 hours. The breaking of this vow carries horrific karmic penalties.' },
    { id: 'di6', icon: '🤫', label: 'Silent Meditation', pred: 'Saturn in the 12th demands Mauna Vrata. Taking a vow of absolute silence for 3 days will generate massive, concentrated spiritual power.', rem: 'Do not even communicate through writing. Absolute internal stillness is required.' }
  ],
  'swapna': [
    { id: 'sw5', icon: '💀', label: 'Message from Dead', pred: 'The Moon and Ketu align in the 8th. A recently deceased relative will attempt to transmit critical, urgent information through your dreams.', rem: 'Keep a journal by your bed. Record the symbols immediately upon waking.' },
    { id: 'sw6', icon: '🌌', label: 'Lucid Astral Travel', pred: 'An exalted Moon in the 12th grants the rare ability to maintain full conscious awareness while the physical body sleeps.', rem: 'Use this state to visit sacred astral realms; avoid lower dimensions.' }
  ],
  'kirti': [
    { id: 'k5', icon: '📉', label: 'Infamy & Scandal', pred: 'Rahu dominates the 10th Lord. A fabricated, highly defamatory scandal will erupt out of nowhere, severely damaging your public standing.', rem: 'Do not issue fiery denials. The truth will quietly emerge in 6 months.' },
    { id: 'k6', icon: '🏛️', label: 'Posthumous Glory', pred: 'Saturn in the 10th ensures that your greatest worldly achievements will only be truly recognized and immortalized long after your passing.', rem: 'Build for eternity. Do not seek contemporary applause.' }
  ],
  'mrityu': [
    { id: 'mr5', icon: '🌊', label: 'Water Hazard', pred: 'An afflicted Moon in the 8th creates a severe, immediate physiological vulnerability to drowning or waterborne pathogens.', rem: 'Strictly avoid oceans, rivers, and unboiled water for the next 40 days.' },
    { id: 'mr6', icon: '🧗', label: 'Fall from Height', pred: 'Saturn is afflicted by Mars. A catastrophic failure of balance or structural collapse while at a high elevation is mathematically probable.', rem: 'Do not climb ladders, mountains, or tall structures under any circumstances.' }
  ],
  'dinacharya': [
    { id: 'dc5', icon: '🥱', label: 'Missed Rituals', pred: 'Rahu induces a heavy, tamasic laziness, causing you to skip your non-negotiable daily rites and leaving your aura completely exposed.', rem: 'Force yourself through the motions even without feeling devotion. Discipline is armor.' },
    { id: 'dc6', icon: '☀️', label: 'Perfect Austerity', pred: 'A strongly placed Sun provides the iron willpower needed to execute your daily morning rituals with flawless, military precision.', rem: 'Increase the complexity of your mantras; you can handle the higher frequency.' }
  ],
  'sangha': [
    { id: 'sg5', icon: '🚪', label: 'Excommunication', pred: 'Saturn opposes the 11th. You will be formally cast out of your professional guild or social community for defying a rigid orthodox rule.', rem: 'Accept the exile. A far superior network awaits you in isolation.' },
    { id: 'sg6', icon: '📜', label: 'Forming a Guild', pred: 'Mercury in the 11th gives you the administrative genius to gather disparate, skilled individuals and form a highly profitable new syndicate.', rem: 'Draft the bylaws clearly. Ensure intellectual property is protected.' }
  ],
  'tantra': [
    { id: 't5', icon: '🏺', label: 'Cursed Object', pred: 'Saturn and Rahu indicate you have blindly brought an object into your home that carries a severe, multi-generational curse.', rem: 'Identify the antique or gifted item immediately and submerge it in seawater.' },
    { id: 't6', icon: '🛡️', label: 'Protective Yantra', pred: 'Favorable Sun and Mars allow the successful establishment of a geometric Yantra that will brutally repel all directed occult attacks.', rem: 'Draw it meticulously on copper and install it facing the East.' }
  ],
  'vritti': [
    { id: 'vri5', icon: '👑', label: 'Royal Patronage', pred: 'The Sun sits powerfully in the 10th house. A monarch or massive government entity will commission your services directly, bypassing all middlemen.', rem: 'Execute the task flawlessly. This is the pinnacle of your career.' },
    { id: 'vri6', icon: '📉', label: 'Public Disgrace', pred: 'Rahu in the 10th warns of a massive, public professional failure due to overpromising and utilizing untested, chaotic methods.', rem: 'Under-promise drastically. Stick to agonizingly safe protocols right now.' }
  ],
  'mitratva': [
    { id: 'mit5', icon: '🔗', label: 'Lifelong Pact', pred: 'Jupiter and Saturn align perfectly. A friendship formed this week will calcify into an unbreakable, blood-brother pact that lasts till death.', rem: 'Seal the bond with a shared meal and a mutual vow of loyalty.' },
    { id: 'mit6', icon: '🐍', label: 'Jealousy of Peers', pred: 'Venus is intensely afflicted by Mars. Your recent success has triggered virulent, barely concealed envy among your closest professional peers.', rem: 'Downplay your victories. Conceal your newly acquired wealth.' }
  ],
  'poshana': [
    { id: 'pos5', icon: '🏜️', label: 'Famine & Scarcity', pred: 'Saturn in the 2nd constricts the food supply. You will enter a grim period where finding even basic, nourishing calories becomes a brutal logistical challenge.', rem: 'Ration the stored grains meticulously. The supply lines are freezing.' },
    { id: 'pos6', icon: '🌿', label: 'Healing Herbs', pred: 'The Sun and Moon form a flawless trine. You will instinctively discover a specific medicinal herb or root that permanently cures a chronic physical ailment.', rem: 'Consume it precisely at dawn while facing the sun.' }
  ],
  'pratibha': [
    { id: 'pra5', icon: '🕵️', label: 'Stolen Ideas', pred: 'Mercury is eclipsed by Rahu. A rival will perfectly copy and patent your brilliant creative concept before you have the chance to launch it.', rem: 'Keep the blueprints under absolute lock and key. Speak to no one.' },
    { id: 'pra6', icon: '✨', label: 'Masterpiece Created', pred: 'An exalted Venus in the 5th guarantees that the physical art or code you are writing right now will be your defining magnum opus.', rem: 'Do not sleep. Work frantically while the celestial gate is open.' }
  ],
  'sanskriti': [
    { id: 'san5', icon: '📜', label: 'Reviving Ancients', pred: 'A retrograde Jupiter pushes the mind backward. You will successfully resurrect a completely forgotten, highly potent ancient cultural ritual.', rem: 'Perform the rite exactly as described in the oldest available manuscript.' },
    { id: 'san6', icon: '⚡', label: 'Blasphemy', pred: 'Rahu in the 9th triggers a reckless, arrogant urge to publicly mock the sacred traditions of your ancestors. The karmic blowback will be immediate.', rem: 'Bite your tongue. Do not mistake edgy rebellion for profound intellect.' }
  ],
  'vahana': [
    { id: 'vah5', icon: '🐎', label: 'Acquiring Beasts', pred: 'Venus in the 4th ensures the swift, highly profitable acquisition of strong, beautiful horses or elite modern vehicles.', rem: 'Purchase the asset on a Friday during an auspicious planetary hour.' },
    { id: 'vah6', icon: '💥', label: 'Injury from Fall', pred: 'Mars in the 4th signifies a violent, bone-breaking fall from a moving chariot, vehicle, or beast of burden.', rem: 'Ensure the reins are tight. Do not travel at high speeds under any circumstances.' }
  ],
  'vysana': [
    { id: 'vys5', icon: '⛓️', label: 'Debt to Criminals', pred: 'Rahu in the 6th indicates you have foolishly borrowed resources from dangerous, unscrupulous men to fund a rapidly escalating vice.', rem: 'Liquidate legitimate assets to pay them off today. They will break you otherwise.' },
    { id: 'vys6', icon: '💧', label: 'Purity Restored', pred: 'Jupiter’s aspect on the Ascendant suddenly washes away all desire for the intoxicant or vice that has plagued you for years.', rem: 'The chains are broken. Never look backward at the poison again.' }
  ],
  'shrama': [
    { id: 'shr5', icon: '⚒️', label: 'Skilled Craftsmen', pred: 'Mercury in the 6th brings technically brilliant, highly articulate subordinates into your employ who will optimize your entire operation.', rem: 'Give them the autonomy they demand. Do not micromanage genius.' },
    { id: 'shr6', icon: '🐀', label: 'Thieves in the Ranks', pred: 'Ketu in the 6th reveals that unseen, quiet employees are systematically siphoning resources from the lower levels of your enterprise.', rem: 'Audit the inventory immediately. The leak is coming from the bottom.' }
  ],
  'pashu': [
    { id: 'pas5', icon: '🦠', label: 'Sickness in Herd', pred: 'Saturn in the 6th brings a cold, creeping plague into your livestock, pets, or dependent biological assets, threatening massive loss.', rem: 'Isolate the sick instantly. Burn sulfur in the stables.' },
    { id: 'pas6', icon: '🐕', label: 'Loyal Guard Dog', pred: 'Mars in the 6th signifies the acquisition of a fierce, utterly loyal animal that will physically save your life from an intruder.', rem: 'Feed it premium meat and treat it as a trusted warrior.' }
  ],
  'vishrama': [
    { id: 'vis5', icon: '👁️', label: 'Disturbed Sleep', pred: 'Rahu blocks the 12th house. Paranoia and racing, horrifying thoughts will completely shatter your ability to enter deep REM sleep.', rem: 'Sleep with a heavy iron object under the mattress to ground the chaotic ether.' },
    { id: 'vis6', icon: '🌊', label: 'Healing Springs', pred: 'The Moon in a watery 4th house directs you to seek physical restoration in natural hot springs or mineral-rich coastal waters.', rem: 'Submerge yourself fully. The water will extract the deep fatigue.' }
  ],
  'danam': [
    { id: 'dan5', icon: '🥷', label: 'Secret Philanthropy', pred: 'The Sun in the 12th demands Gupt Danam (secret charity). A massive anonymous donation will instantly burn three lifetimes of terrible karma.', rem: 'If anyone discovers it was you who gave the wealth, the spiritual merit is voided.' },
    { id: 'dan6', icon: '🐉', label: 'Misused Funds', pred: 'Rahu in the 9th warns that the charitable foundation you recently trusted is run by charlatans embezzling the divine funds.', rem: 'Halt all donations. Re-direct your wealth to direct, physical feeding of the poor.' }
  ],
  'runa': [
    { id: 'run5', icon: '🕊️', label: 'Debt Forgiveness', pred: 'Jupiter sitting in the 6th house softens the heart of your harshest creditor. They will inexplicably wipe the slate clean if approached humbly.', rem: 'Beg for forgiveness today. The window of their mercy is very short.' },
    { id: 'run6', icon: '⛓️', label: 'Lifelong Bondage', pred: 'Saturn retrograde in the 6th ensures that a contract signed this week will financially indenture you and your immediate heirs for 40 years.', rem: 'Do not sign the ledger. The terms are mathematically designed to enslave you.' }
  ]
};

Object.keys(newOptions).forEach(key => {
  if (PILLAR_DATA[key]) {
    PILLAR_DATA[key].options.push(...newOptions[key]);
  }
});

let outputStr = 'const PILLAR_DATA = {\n';
Object.keys(PILLAR_DATA).forEach((key, index, arr) => {
  const p = PILLAR_DATA[key];
  outputStr += `  '${key}': {\n`;
  outputStr += `    title: '${p.title}', icon: '${p.icon}', desc: '${p.desc}',\n`;
  outputStr += `    prompt: '${p.prompt.replace(/'/g, "\\'")}',\n`;
  outputStr += `    options: [\n`;
  p.options.forEach((opt, optIndex, optArr) => {
    outputStr += `      { id: '${opt.id}', icon: '${opt.icon}', label: '${opt.label}', pred: '${opt.pred.replace(/'/g, "\\'")}', rem: '${opt.rem.replace(/'/g, "\\'")}' }${optIndex === optArr.length - 1 ? '' : ','}\n`;
  });
  outputStr += `    ]\n`;
  outputStr += `  }${index === arr.length - 1 ? '' : ','}\n`;
});
outputStr += '};';

fs.writeFileSync('src/components/tabs/MockDashboard.jsx', content.substring(0, startIdx) + outputStr + content.substring(endIdx));
console.log("Successfully appended 72 options to the 36 pillars!");
