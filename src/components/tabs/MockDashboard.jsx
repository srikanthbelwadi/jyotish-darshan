import React, { useState } from 'react';

// ==========================================
// 1. TRADITIONAL TRUTH: 24 PILLARS & 96+ OPTIONS
// ==========================================
const PILLAR_DATA = {
  'dharma': {
    title: 'Dharma & Duty', icon: '🪷', desc: 'D9 & 9th House Rectitude',
    prompt: 'The foundation of life rests upon Righteousness (Dharma). Which aspect of duty seeks clarity?',
    options: [
      { id: 'dh1', icon: '📜', label: 'Vedic Study', pred: 'Jupiter’s aspect on the 9th house initiates a pristine window for mastering ancient texts.', rem: 'Recite the Gayatri Mantra 108 times daily at Brahma Muhurta.' },
      { id: 'dh2', icon: '🙏', label: 'Elder Reverence', pred: 'Saturn transits your 9th house, demanding strict adherence to familial traditions and respect for gurus.', rem: 'Offer unbroken rice (Akshata) and water at the roots of a Banyan tree.' },
      { id: 'dh3', icon: '⚖️', label: 'Moral Conflict', pred: 'Rahu’s shadow on the Dharma axis causes temporary confusion in ethical judgments.', rem: 'Perform a pure ghee homam on Thursday to clear the intellectual ether.' },
      { id: 'dh4', icon: '🕊️', label: 'Taking Vows', pred: 'The exalted Sun encourages the taking of absolute vows (Sankalpa). Any spiritual oath taken now is unbreakable.', rem: 'Fast on Sundays and offer water to Surya at dawn.' },
      { id: 'dh5', icon: '⚡', label: 'Guru’s Curse', pred: 'Jupiter is heavily afflicted by Rahu (Guru Chandala Yoga), bringing profound spiritual obstacles and loss of faith.', rem: 'Serve an authentic spiritual master unconditionally.' },
      { id: 'dh6', icon: '🛕', label: 'Restoring the Temple', pred: 'An exalted Jupiter empowers the 9th house, calling you to financially or physically reconstruct a decayed place of worship.', rem: 'Donate pure gold or labor to a historic temple.' }
    ]
  },
  'vivaha': {
    title: 'Marriage & Unions', icon: '🕉️', desc: 'D9 Navamsa Harmony',
    prompt: 'The sacred union of Vivaha binds two souls karmically. What is your inquiry regarding marital bonds?',
    options: [
      { id: 'v1', icon: '💍', label: 'Timing of Union', pred: 'Venus enters the 7th house in 14 months, opening the supreme cosmic window for permanent sacred union.', rem: 'Fast on Fridays to accelerate the vibrational alignment of Shukra.' },
      { id: 'v2', icon: '🔥', label: 'Koota Matching', pred: 'The Gana and Nadi Kootas align perfectly, but a slight Bhakoot dosha advises caution in ego clashes.', rem: 'Worship Shiva and Parvati together to harmonize the lunar energies.' },
      { id: 'v3', icon: '🌪️', label: 'Household Friction', pred: 'Mars afflicts the 7th house heavily. Expect sudden spikes of anger and discord in the domestic sphere.', rem: 'Light a sesame oil lamp facing south to pacify the Mangalik influence.' },
      { id: 'v4', icon: '🥀', label: 'Severing Ties', pred: 'Saturn transiting over natal Venus confirms a karmic structural breakdown of the alliance.', rem: 'Do not hold onto shattered karma. Perform Shanti homam and release.' },
      { id: 'v5', icon: '🤫', label: 'Secret Union', pred: 'Venus and Rahu conspire in the 12th house, indicating a passionate, highly secretive romance hidden from society.', rem: 'Maintain absolute discretion. Public exposure will bring ruin.' },
      { id: 'v6', icon: '👴', label: 'Arranged by Elders', pred: 'Jupiter powerfully aspects the 7th. A highly auspicious, long-lasting union will be arranged by respected elders of the community.', rem: 'Trust the wisdom of the patriarchs in this matter.' }
    ]
  },
  'dhana': {
    title: 'Wealth & Treasury', icon: '🏺', desc: 'D2 Hora Liquidity',
    prompt: 'The 2nd house and D2 chart govern accumulated treasures, gold, and grains. What is your material focus?',
    options: [
      { id: 'd1', icon: '🌾', label: 'Agricultural Wealth', pred: 'Sun Hora indicates a 3-year cycle of immense yield from land and earthly resources.', rem: 'Donate a portion of your harvest to the local temple.' },
      { id: 'd2', icon: '🟡', label: 'Gold & Ornaments', pred: 'Jupiter’s favorable position guarantees the accumulation of heavy gold ornaments and permanent wealth.', rem: 'Wear a pure yellow sapphire set in gold on your index finger.' },
      { id: 'd3', icon: '📉', label: 'Loss of Treasury', pred: 'The 12th Lord debilitates the 2nd house. Hidden expenses and karmic debts are draining the treasury.', rem: 'Fast on Ekadashi to seal the spiritual and financial leaks.' },
      { id: 'd4', icon: '🤝', label: 'Trade Agreements', pred: 'Mercury’s exaltation ensures that mercantile agreements struck during the next fortnight will yield sustained profit.', rem: 'Offer green fodder to cows on Wednesdays.' },
      { id: 'd5', icon: '⚖️', label: 'Unexpected Penalty', pred: 'The Sun and Saturn clash in the 2nd house. Royal authorities or the state will extract a heavy, unavoidable financial penalty.', rem: 'Pay the fine immediately without dispute to halt the karma.' },
      { id: 'd6', icon: '📿', label: 'Jewelry Acquisition', pred: 'Venus is exalted in the house of wealth. You will soon acquire flawlessly crafted, ancestral gem-studded jewelry.', rem: 'Keep the most valuable piece in a vault facing the North.' }
    ]
  },
  'arogya': {
    title: 'Health & Ayurveda', icon: '🌿', desc: 'D6 Bodily Humors',
    prompt: 'The D6 map exposes imbalances in the Vata, Pitta, and Kapha doshas. What anomaly requires attention?',
    options: [
      { id: 'a1', icon: '🔥', label: 'Pitta (Fire) Spikes', pred: 'Mars transits the 6th house, excessively aggravating Pitta. High internal heat and digestive fire imbalance.', rem: 'Consume cooling herbs like Brahmi and alkaline juice daily at sunrise.' },
      { id: 'a2', icon: '🌬️', label: 'Vata (Wind) Anxiety', pred: 'Saturn aspects the Moon, spiking Vata. Sleep architecture will fragment due to excess etheric movement.', rem: 'Daily oil massage (Abhyanga) with warm sesame oil is mandatory.' },
      { id: 'a3', icon: '💧', label: 'Kapha (Water) Sluggishness', pred: 'Jupiter’s combustion lowers the metabolic fire, leading to lethargy and heavy Kapha accumulation.', rem: 'Engage in vigorous morning exercise and consume dried ginger.' },
      { id: 'a4', icon: '🦴', label: 'Skeletal Fortitude', pred: 'Sun entering Capricorn stabilizes bone density and skeletal structure.', rem: 'Fortify the solar energy by consuming calcium-rich seeds.' },
      { id: 'a5', icon: '🩸', label: 'Blood Toxins', pred: 'Mars and Rahu corrupt the 6th house. Impure blood and sudden, severe skin eruptions will manifest rapidly.', rem: 'Consume neem leaves daily and strictly avoid all fermented foods.' },
      { id: 'a6', icon: '✨', label: 'Rapid Healing', pred: 'Exalted Jupiter casts a divine glance on the 6th house, ensuring a miraculous, abnormally fast recovery from a recent ailment.', rem: 'No remedy needed. The planetary shield is fully active.' }
    ]
  },
  'muhurta': {
    title: 'Auspicious Timing', icon: '⏳', desc: 'Panchanga Engine',
    prompt: 'Muhurta aligns human action with divine time. What auspicious event are you planning?',
    options: [
      { id: 'm1', icon: '🧱', label: 'Laying Foundations', pred: 'A flawless Pushya Nakshatra window opens in 12 days. Structures built now will stand for generations.', rem: 'Ensure the first brick is laid during the Jupiter Hora.' },
      { id: 'm2', icon: '🌾', label: 'Sowing Seeds', pred: 'The upcoming Shukla Paksha Tritiya offers perfect fertility. Seeds sown will yield a magnificent harvest.', rem: 'Chant the Bhumi Suktam before breaking the earth.' },
      { id: 'm3', icon: '🐘', label: 'Royal Audience', pred: 'The Sun is strong this week. Any petition presented to a king, ruler, or authority will find profound favor.', rem: 'Approach authority figures wearing a garment with a red border.' },
      { id: 'm4', icon: '⚔️', label: 'Initiating Battle', pred: 'Mars is weak for the next fortnight. Do not initiate any conflict or legal warfare; defeat is highly probable.', rem: 'Hold your position and chant the Aditya Hrudayam.' },
      { id: 'm5', icon: '🌑', label: 'Eclipsed Window', pred: 'A severe Grahana Dosha obscures the current timeframe. Any new venture initiated now will be swallowed by darkness and fail.', rem: 'Suspend all critical worldly actions until the lunar cycle renews.' },
      { id: 'm6', icon: '☀️', label: 'Abhijit Muhurta', pred: 'A perfect solar alignment at noon creates an unstoppable Abhijit Muhurta. Whatever is launched today cannot be defeated.', rem: 'Strike precisely at the zenith of the sun.' }
    ]
  },
  'shanti': {
    title: 'Cosmic Remedies', icon: '🕯️', desc: 'Dosha Mitigation',
    prompt: 'Afflictions demand propitiation. Which traditional remedial measure do you seek to enact?',
    options: [
      { id: 'sh1', icon: '📿', label: 'Mantra Japa', pred: 'The mind is heavily afflicted by Rahu. Only rigorous, disciplined repetition of sacred syllables can break the illusion.', rem: 'Chant the Mahamrityunjaya Mantra 108 times daily.' },
      { id: 'sh2', icon: '💎', label: 'Gemstone Dispensation', pred: 'Your Lagna Lord is functionally weak. The physical vessel lacks the vibratory armor to repel malefic forces.', rem: 'Wear a flawless Emerald in gold on the right little finger.' },
      { id: 'sh3', icon: '🔥', label: 'Havan / Yajna', pred: 'A severe dosha requires the invocation of Agni. Offerings into the sacred fire will transmute the negative karma instantly.', rem: 'Organize a Navagraha Shanti Homa during the next Amavasya.' },
      { id: 'sh4', icon: '🍚', label: 'Anna Danam (Charity)', pred: 'Saturn restricts your wealth due to past-life hoarding. Feeding the hungry is the only key to unlocking the treasury.', rem: 'Donate black grains and sesame to the impoverished on Saturdays.' },
      { id: 'sh5', icon: '🔔', label: 'Temple Bell Offering', pred: 'Venus is agitated. Offering a massive bronze bell to a goddess temple will instantly shatter the negative acoustic frequencies around you.', rem: 'Ring the bell yourself with absolute devotion.' },
      { id: 'sh6', icon: '🪔', label: 'Lighting Ghee Lamps', pred: 'The Sun and Mars lack fire. Lighting 108 pure cow-ghee lamps at dusk will invoke the protective deities of the 10th direction.', rem: 'Use only cotton wicks and face the East.' }
    ]
  },
  'santhana': {
    title: 'Progeny & Lineage', icon: '👶', desc: 'D7 Saptamsa Matrix',
    prompt: 'The expansion of the bloodline is governed by the 5th house. What concerns the legacy of your lineage?',
    options: [
      { id: 'sa1', icon: '🌱', label: 'Time of Conception', pred: 'Jupiter favorably aspects the 5th house. The upcoming fortnight provides an exceptional biological window for conception.', rem: 'Track the Beejani and Kshetra Sphuta points carefully.' },
      { id: 'sa2', icon: '🛡️', label: 'Protecting the Unborn', pred: 'Ketu in the 5th house signifies unseen spiritual obstacles during the gestation period.', rem: 'Chant the Santan Gopal Mantra daily and avoid desolate places.' },
      { id: 'sa3', icon: '📚', label: 'Child’s Education', pred: 'The 5th Lord of intellect enters exaltation. The child will demonstrate prodigious memorization of classical texts.', rem: 'Initiate Vidyarambham on the day of Vijayadashami.' },
      { id: 'sa4', icon: '⛓️', label: 'Rebellious Progeny', pred: 'Rahu afflicts the 5th house, indicating the child may temporarily reject ancestral traditions and dharma.', rem: 'Maintain endless patience. Do not curse the child; karma will realign them.' },
      { id: 'sa5', icon: '🍼', label: 'Adoption of a Child', pred: 'Saturn and Mercury influence the 5th house strongly. Your karmic lineage will expand not through blood, but through adopting an orphaned soul.', rem: 'Welcome the child as your absolute own; the karma is identical.' },
      { id: 'sa6', icon: '🌑', label: 'Loss of Heir', pred: 'A severe Pitra Dosha acts upon the 5th house, indicating a tragic interruption in the bloodline if the ancestors are not appeased.', rem: 'Perform the Narayan Bali ritual perfectly with a qualified priest.' }
    ]
  },
  'yatra': {
    title: 'Pilgrimage & Travel', icon: '🐂', desc: '12th/9th House Vectors',
    prompt: 'Travel for spiritual merit or foreign expansion requires alignment. What is the nature of the journey?',
    options: [
      { id: 'y1', icon: '🛕', label: 'Teertha Yatra', pred: 'The 9th Lord aligns with the 12th. A profound pilgrimage to a sacred river or mountain temple is energetically mandated.', rem: 'Travel exclusively avoiding the southern direction during this transit.' },
      { id: 'y2', icon: '🌊', label: 'Crossing the Ocean', pred: 'Rahu dictates a long journey across the sea. Settlement in a foreign, non-Vedic land is highly indicated for acquiring wealth.', rem: 'Perform a small puja to Varuna before embarking by water.' },
      { id: 'y3', icon: '🐎', label: 'Short Expedition', pred: 'The 3rd house is active, suggesting a rapid, short-distance journey for trade or visiting nearby relatives.', rem: 'Ensure the Tara Bala is favorable on the day of departure.' },
      { id: 'y4', icon: '⛔', label: 'Danger in Transit', pred: 'Mars and Ketu conjunct in the 8th from the travel lagna. A severe threat of injury exists on the road.', rem: 'Cancel the journey immediately. The omens are universally hostile.' },
      { id: 'y5', icon: '🏜️', label: 'Lost in Transit', pred: 'Ketu in the 12th scatters your sense of direction. You will likely face severe disorientation or misdirection during a foreign journey.', rem: 'Do not travel alone. Rely entirely on a local guide.' },
      { id: 'y6', icon: '🚢', label: 'Profitable Voyage', pred: 'Mercury in the 9th indicates a highly systematic, well-planned long-distance journey that will secure a major trade route.', rem: 'Maintain meticulous ledgers during the expedition.' }
    ]
  },
  'vyavahara': {
    title: 'Disputes & Courts', icon: '⚔️', desc: 'D30 Trimsamsa',
    prompt: 'The 6th house governs open enemies, disputes, and royal punishments. What conflict plagues you?',
    options: [
      { id: 'vy1', icon: '🏛️', label: 'Legal Council', pred: 'The 6th Lord is debilitated. The opponents lack the strength to sustain the dispute. Victory is assured if you delay.', rem: 'Allow time to pass; the opposing faction will defeat themselves.' },
      { id: 'vy2', icon: '🐍', label: 'Hidden Foes', pred: 'Mars in the 12th indicates covert sabotage from jealous relatives or rival merchants.', rem: 'Do not trust anyone outside of your immediate household for the next 2 months.' },
      { id: 'vy3', icon: '💰', label: 'Debt Recovery', pred: 'Saturn restricts the return of loaned wealth. The debtor cannot pay. Aggression will yield nothing.', rem: 'Write off the debt mentally to sever the karmic cord connecting you.' },
      { id: 'vy4', icon: '👑', label: 'Royal Wrath', pred: 'The Sun is afflicted by Rahu. You are currently under intense, unfavorable scrutiny from governmental authorities.', rem: 'Maintain absolute humility. Do not speak against the King or the State.' },
      { id: 'vy5', icon: '🕊️', label: 'Mediation & Truce', pred: 'Jupiter’s aspect on the 6th house forces both sides into a state of exhaustion. A peaceful, highly favorable mediation is now possible.', rem: 'Send an impartial elder as an emissary to offer terms.' },
      { id: 'vy6', icon: '⛓️', label: 'Imprisonment', pred: 'The 12th Lord occupies the 6th with Rahu. There is an extreme, imminent risk of physical confinement or severe legal detention.', rem: 'Flee the jurisdiction or submit entirely to the mercy of the magistrate.' }
    ]
  },
  'vidya': {
    title: 'Education & Wisdom', icon: '📜', desc: 'D24 Chaturvimsamsa',
    prompt: 'The pursuit of Vidya removes darkness. What intellectual or spiritual knowledge do you seek?',
    options: [
      { id: 'vi1', icon: '🕉️', label: 'Vedic Memorization', pred: 'Mercury enters true exaltation. Your capacity to retain complex Sanskrit meter and Shruti is at its absolute peak.', rem: 'Focus entirely on root memorization; analytical debate comes later.' },
      { id: 'vi2', icon: '🧘', label: 'Guru’s Grace', pred: 'Jupiter aligns with your Ascendant. A highly orthodox, traditional Guru will accept you as a disciple.', rem: 'Approach the Guru with dry wood and a heart devoid of arrogance.' },
      { id: 'vi3', icon: '🎨', label: 'Fine Arts (Kala)', pred: 'Venus is temporarily combust. Your pursuit of music, poetry, or sculpture will feel utterly blocked for 40 days.', rem: 'Practice the absolute basics. Do not attempt masterpieces right now.' },
      { id: 'vi4', icon: '👁️', label: 'Astrological Study', pred: 'The D24 indicates a massive aptitude for Jyotisha. You have an ancient, inherited karmic right to this knowledge.', rem: 'Begin a rigorous study of the Brihat Parashara Hora Shastra at once.' },
      { id: 'vi5', icon: '🚫', label: 'Interrupted Studies', pred: 'Saturn aspects the 4th and 5th houses, causing a brutal, multi-year blockage in your formal education due to family responsibilities.', rem: 'Accept the delay. The worldly tragedy will be your true education.' },
      { id: 'vi6', icon: '🗣️', label: 'Foreign Tongues', pred: 'Rahu in the 2nd rapidly accelerates your ability to master alien languages and bizarre, unfamiliar dialects.', rem: 'Use this linguistic power to negotiate with foreign merchants.' }
    ]
  },
  'bhumi': {
    title: 'Land & Properties', icon: '🧱', desc: 'D4 Chaturthamsa',
    prompt: 'The 4th house governs fixed assets, land, and the comfort of the home. What earthly matter arises?',
    options: [
      { id: 'bh1', icon: '🏡', label: 'Building a Home', pred: 'Mars is exalted. The Vaastu of the land currently selected is flawless. Building now brings immense prosperity.', rem: 'Ensure the main entrance faces squarely East or North.' },
      { id: 'bh2', icon: '🚜', label: 'Agricultural Purchase', pred: 'Saturn strongly supports the acquisition of dark, fertile agricultural land. It will yield profit for generations.', rem: 'Perform a Vastu Shanti homam before signing the deed.' },
      { id: 'bh3', icon: '⚒️', label: 'Digging a Well', pred: 'The Moon and Venus in the 4th house indicate abundant, sweet groundwater just beneath the surface.', rem: 'Dig only in the North-East corner of the property.' },
      { id: 'bh4', icon: '⚖️', label: 'Property Dispute', pred: 'The 4th Lord is in the 6th house. A bitter, protracted legal battle over ancestral land is unavoidable.', rem: 'Seek mediation through village elders rather than royal courts.' },
      { id: 'bh5', icon: '🏺', label: 'Unearthed Relics', pred: 'Ketu in the 4th suggests the land you recently purchased contains ancient, spiritually volatile artifacts buried beneath the soil.', rem: 'If found, do not bring them inside the house. Surrender them to a museum or temple.' },
      { id: 'bh6', icon: '🏛️', label: 'Loss to State', pred: 'The Sun severely afflicts the 4th house. The ruling government or king will invoke eminent domain and seize your ancestral land.', rem: 'Do not fight the royal decree. Seek compensation in a different province.' }
    ]
  },
  'moksha': {
    title: 'Spiritual Liberation', icon: '🌌', desc: 'D60 Shashtiamsa',
    prompt: 'The ultimate aim is liberation from the cycle of birth and death. What blocks your spiritual ascent?',
    options: [
      { id: 'mo1', icon: '🧘', label: 'Ishta Devata', pred: 'The Navamsa indicates your Ishta Devata is a fierce form of the Divine Mother. Worshiping her will severe your attachments.', rem: 'Chant the Chandi Path during the bright half of the lunar month.' },
      { id: 'mo2', icon: '🚶', label: 'Path of Sannyasa', pred: 'Ketu in the 12th house reveals a massive, undeniable urge to renounce all worldly wealth and attachments instantly.', rem: 'Fulfill your worldly duties (Dharma) first; premature renunciation builds bad karma.' },
      { id: 'mo3', icon: '🔥', label: 'Karma Yoga', pred: 'Your path to liberation does not lie in meditation, but in selfless, exhausting action dedicated entirely to God.', rem: 'Perform all daily duties without a shadow of attachment to the outcome.' },
      { id: 'mo4', icon: '💀', label: 'Fear of Death', pred: 'Saturn in the 8th house grants extreme physical longevity, making your fear of early transition completely illogical.', rem: 'Study the Bhagavad Gita to dismantle the illusion of terminal ego-death.' },
      { id: 'mo5', icon: '🐍', label: 'False Guru', pred: 'Rahu in the 9th creates a powerful mirage of enlightenment. The spiritual master you currently follow is an absolute fraud harvesting your energy.', rem: 'Abandon the ashram in the dead of night. Seek truth in standard scriptures.' },
      { id: 'mo6', icon: '🛕', label: 'Pilgrimage to Kashi', pred: 'Jupiter and the Moon align in the 12th. The final liberation coordinates are set. A journey to Varanasi or a coastal holy city is mathematically required.', rem: 'Bathe in the sacred river precisely at dawn.' }
    ]
  },
  'pitru': {
    title: 'Ancestral Karma', icon: '🌳', desc: 'D40 Khavedamsa',
    prompt: 'We carry the unsolved debts of our forefathers. What ancestral affliction requires propitiation?',
    options: [
      { id: 'pi1', icon: '🌑', label: 'Pitra Dosha', pred: 'A severe Pitra Dosha is blocking your wealth and causing unrest in the household. The ancestors are suffering.', rem: 'Perform Narayana Bali and strictly offer Tarpanam on every Amavasya.' },
      { id: 'pi2', icon: '👵', label: 'Matru Shaapa', pred: 'An affliction to the Moon indicates a lingering curse from a maternal figure in a past life causing emotional sorrow.', rem: 'Serve elderly women and offer raw milk to the Shiva Lingam on Mondays.' },
      { id: 'pi3', icon: '👴', label: 'Pitru Karaka Strong', pred: 'The Sun is exalted in your ancestral chart. The righteous deeds of your grandfather act as an impenetrable shield around you.', rem: 'No remedy needed. Honor his memory and maintain his righteous standards.' },
      { id: 'pi4', icon: '🩸', label: 'Generational Debt', pred: 'Saturn indicates a physical debt owed by your lineage to a laborer class. Your wealth leaks until this is balanced.', rem: 'Employ and generously compensate workers; donate land or shelter if possible.' },
      { id: 'pi5', icon: '🌑', label: 'Forgotten Vows', pred: 'Saturn opposes the Sun. A vow made by your grandfather was left incomplete, and the karmic debt is currently paralyzing your career.', rem: 'Identify the unfulfilled promise and execute it yourself.' },
      { id: 'pi6', icon: '💰', label: 'Ancestral Wealth', pred: 'The 8th Lord in the 2nd house unlocks a massive, hidden vault of wealth accumulated by a forgotten patriarch.', rem: 'Use precisely half of this wealth to build an institution in their name.' }
    ]
  },
  'gupta_dhana': {
    title: 'Sudden Gains', icon: '⛏️', desc: '8th House Mysteries',
    prompt: 'The 8th house rules unearned wealth, buried treasures, and sudden reversals. What hidden matter stirs?',
    options: [
      { id: 'gu1', icon: '🏺', label: 'Hidden Treasure', pred: 'Jupiter aspects the 8th house. A startling, unexpected discovery of wealth or ancestral gold is highly probable soon.', rem: 'Do not speak of this wealth to outsiders to prevent the evil eye (Drishti).' },
      { id: 'gu2', icon: '📜', label: 'Unexpected Inheritance', pred: 'A distant relative’s passing will soon legally transfer a significant portion of structured assets to your name.', rem: 'Accept the wealth gracefully and donate exactly one-tenth to a temple.' },
      { id: 'gu3', icon: '💍', label: 'Spouse’s Fortune', pred: 'Your partner’s chart is entering a Raj Yoga. Their sudden elevation in status will completely alter your shared lifestyle.', rem: 'Support their ascent; their destiny is currently pulling yours upward.' },
      { id: 'gu4', icon: '📉', label: 'Sudden Destruction', pred: 'Rahu transits the 8th. You face an immediate threat of absolute financial ruin due to reckless speculation or fraud.', rem: 'Withdraw all investments. Guard the treasury. Do not trust lucrative promises.' },
      { id: 'gu5', icon: '⛏️', label: 'Finding Buried Coin', pred: 'Mars aspects the 8th house strongly. Physical excavation on your property will reveal a small cache of ancient, untraceable gold.', rem: 'Purify the gold with milk before bringing it into the primary dwelling.' },
      { id: 'gu6', icon: '🥷', label: 'Stolen Inheritance', pred: 'Rahu in the 8th ensures that a legitimate inheritance will be entirely embezzled by a deceitful relative manipulating the legal system.', rem: 'Do not waste years in court. The wealth is poisoned. Let it go.' }
    ]
  },
  'bhratru': {
    title: 'Siblings & Courage', icon: '🏹', desc: 'D3 Drekkana',
    prompt: 'The 3rd house rules valor (Parakrama), siblings, and the right arm. Where is your courage directed?',
    options: [
      { id: 'br1', icon: '🔥', label: 'Act of Valor', pred: 'Mars gives immense strength to the 3rd house. This is the moment for decisive, courageous action. Boldness is favored by the gods.', rem: 'Do not hesitate. Strike decisively and victory will naturally follow.' },
      { id: 'br2', icon: '👥', label: 'Sibling Rivalry', pred: 'Saturn freezes the 3rd house. A bitter, deeply entrenched dispute with a younger sibling will not thaw for years.', rem: 'Separate your households completely to prevent further accumulation of bad karma.' },
      { id: 'br3', icon: '🤝', label: 'Brotherly Support', pred: 'Jupiter bounds the 3rd Lord. Your siblings will act as divine messengers, arriving to support you precisely when needed.', rem: 'Maintain the bond. Their counsel is divinely inspired right now.' },
      { id: 'br4', icon: '✍️', label: 'Written Word', pred: 'Mercury is exalted. Documents or treaties authored by you now will hold immense persuasive power over rivals.', rem: 'Draft your terms clearly. The pen is currently your most lethal weapon.' },
      { id: 'br5', icon: '🏳️', label: 'Cowardice in Battle', pred: 'Mars is deeply debilitated. In the coming conflict, a younger sibling or close ally will abandon you completely out of sheer terror.', rem: 'Do not rely on anyone else’s courage right now. Stand alone.' },
      { id: 'br6', icon: '🩸', label: 'Sacrifice for Brother', pred: 'Jupiter in the 3rd signifies you will willingly and joyfully sacrifice a massive personal opportunity to elevate your sibling.', rem: 'Make the sacrifice silently. The cosmos will repay you tenfold.' }
    ]
  },
  'mata_pita': {
    title: 'Parents & Elders', icon: '☀️', desc: 'D12 Dwadasamsa',
    prompt: 'The D12 chart reveals the absolute karmic ties to the mother and father. What is the inquiry?',
    options: [
      { id: 'mp1', icon: '❤️', label: 'Mother’s Health', pred: 'The Moon is caught in a Paap Kartari yoga (hemmed by malefics). The mother’s health will experience sudden fragility.', rem: 'Ensure she rests during the eclipse and performs Mrityunjaya Japa.' },
      { id: 'mp2', icon: '👑', label: 'Father’s Reputation', pred: 'The Sun gains immense directional strength. The father’s name will be honored by the ruling authorities, elevating the whole family.', rem: 'Publicly honor him; his structural energy is shielding you.' },
      { id: 'mp3', icon: '⛓️', label: 'Karmic Separation', pred: 'Rahu indicates severe toxicity from the parental lineage. Your own prosperity is mathematically locked until physical distance is achieved.', rem: 'Move away before the Saturn return. It is an astrological necessity.' },
      { id: 'mp4', icon: '🏡', label: 'Duty of Care', pred: 'Jupiter transits the 4th house. Serving your parents in their twilight will generate enough positive karma to completely wipe your debts.', rem: 'Expand the household to accommodate them in maximum comfort.' },
      { id: 'mp5', icon: '🚶', label: 'Father’s Exile', pred: 'The Sun occupies the 12th house. Your father faces severe public humiliation or forced professional exile from his homeland.', rem: 'Provide him sanctuary in your home without asking questions.' },
      { id: 'mp6', icon: '✨', label: 'Mother’s Benediction', pred: 'An exalted Moon in the 4th signifies that your mother’s explicit, spoken blessing right now is acting as an invincible metaphysical shield.', rem: 'Touch her feet daily before initiating any financial maneuvers.' }
    ]
  },
  'sukha': {
    title: 'Mental Peace & Home', icon: '🌊', desc: '4th House Tranquility',
    prompt: 'True wealth is internal peace (Sukha) and a harmonious home. What disturbs the waters of the mind?',
    options: [
      { id: 'su1', icon: '🌪️', label: 'Phantom Dread', pred: 'Rahu eclipses the 4th house. You will experience persistent, illogical paranoia and unease within your own home for months.', rem: 'Burn camphor daily at dusk. This is an illusion caused by transit.' },
      { id: 'su2', icon: '🧘', label: 'Domestic Bliss', pred: 'Venus transits the 4th, bringing a sustained period of deep restorative sleep, aesthetic beauty, and profound household joy.', rem: 'Decorate the home with fresh flowers and light fragrant incense daily.' },
      { id: 'su3', icon: '🔥', label: 'Household Strife', pred: 'Mars brings fire into the domestic sphere. Arguments over trivial matters will dangerously escalate and disrupt the peace.', rem: 'Channel the aggressive energy into physically cleaning or repairing the house.' },
      { id: 'su4', icon: '🐂', label: 'Loss of Comfort', pred: 'Saturn afflicts the 4th Lord. Your vehicles or beasts of burden will suffer injury or break down repeatedly.', rem: 'Limit travel. Ensure all conveyances are properly maintained and blessed.' },
      { id: 'su5', icon: '🐜', label: 'Infestation', pred: 'Rahu transits the 4th house. The physical structure of your home will be overrun by subterranean pests or toxic mold, destroying your peace.', rem: 'Evacuate the dwelling temporarily and heavily fumigate with camphor and sulfur.' },
      { id: 'su6', icon: '🎊', label: 'Celebration at Home', pred: 'Venus enters the 4th. The household will host a magnificent, joyous celebration involving music, flowers, and extended family.', rem: 'Decorate the entrance with fresh mango leaves and turmeric.' }
    ]
  },
  'diksha': {
    title: 'Guru & Initiation', icon: '🪷', desc: 'D20 Vimsamsa',
    prompt: 'The D20 charts your spiritual receptivity and readiness for Mantra Diksha. Are you prepared to receive?',
    options: [
      { id: 'di1', icon: '👤', label: 'Finding the Master', pred: 'Jupiter aligns perfectly with the 9th. A highly traditional, orthodox Guru will enter your life and alter your destiny.', rem: 'You must seek him in ancient, established places of worship, not modern retreats.' },
      { id: 'di2', icon: '🕉️', label: 'Mantra Diksha', pred: 'Your vital channels are primed. A mantra received from a proper lineage right now will grant Siddhi 10x faster.', rem: 'Seek initiation strictly into a solar or fire-based deity.' },
      { id: 'di3', icon: '🐍', label: 'False Teachers', pred: 'Rahu obscures the 9th house. Beware of charismatic charlatans who promise immediate enlightenment for material wealth.', rem: 'Test the Guru’s actions against the Shastras. Reject any non-Vedic deviations.' },
      { id: 'di4', icon: '📚', label: 'Swadhyaya (Self-Study)', pred: 'Ketu in the D20 confirms you need no external master at this specific time. Your intuition will decode the ancient texts independently.', rem: 'Retreat into isolation and study rigorously. The inner Guru is awake.' },
      { id: 'di5', icon: '💔', label: 'Broken Vows', pred: 'Ketu is violently afflicted by Mars. You are on the verge of shattering a sacred mantra-diksha vow out of sheer frustration.', rem: 'Fast for 24 hours. The breaking of this vow carries horrific karmic penalties.' },
      { id: 'di6', icon: '🤫', label: 'Silent Meditation', pred: 'Saturn in the 12th demands Mauna Vrata. Taking a vow of absolute silence for 3 days will generate massive, concentrated spiritual power.', rem: 'Do not even communicate through writing. Absolute internal stillness is required.' }
    ]
  },
  'swapna': {
    title: 'Dreams & Omens', icon: '👁️', desc: 'Swapna Shastra',
    prompt: 'The subconscious mind receives signals from the astral plane. What omens are manifesting?',
    options: [
      { id: 'sw1', icon: '🌌', label: 'Prophetic Visions', pred: 'Benefic aspects on the 12th house indicate your dreams are currently hyper-literal blueprints of the future. Ignore them at your peril.', rem: 'Keep a record. The symbols of water or white animals ensure victory.' },
      { id: 'sw2', icon: '😱', label: 'Night Terrors', pred: 'Ketu transiting the 12th causes the astral body to momentarily detatch, resulting in severe sleep paralysis and dread.', rem: 'Keep a piece of crude iron under your sleeping mat to ground the physical body.' },
      { id: 'sw3', icon: '🛌', label: 'Nidra Dosha (Insomnia)', pred: 'Mars causes the mind’s defensive algorithms to loop endlessly, destroying restorative delta-wave sleep patterns.', rem: 'Wash the feet with cold water before sleeping and chant the Ratri Suktam.' },
      { id: 'sw4', icon: '👻', label: 'Astral Intrusions', pred: 'Rahu opens a tear in the 12th house. You are currently visible to low-level parasitic entities during the twilight hours.', rem: 'Never sleep at the exact time of sunset (Sandhya). Light a lamp.' },
      { id: 'sw5', icon: '💀', label: 'Message from Dead', pred: 'The Moon and Ketu align in the 8th. A recently deceased relative will attempt to transmit critical, urgent information through your dreams.', rem: 'Keep a journal by your bed. Record the symbols immediately upon waking.' },
      { id: 'sw6', icon: '🌌', label: 'Lucid Astral Travel', pred: 'An exalted Moon in the 12th grants the rare ability to maintain full conscious awareness while the physical body sleeps.', rem: 'Use this state to visit sacred astral realms; avoid lower dimensions.' }
    ]
  },
  'kirti': {
    title: 'Fame & Royal Favor', icon: '🌟', desc: 'Arudha Lagna Profile',
    prompt: 'The Arudha Lagna dictates the Maya—how the world perceives your status and renown. What is your public aim?',
    options: [
      { id: 'k1', icon: '👑', label: 'Rise in Status', pred: 'The AL is conjunct Venus and Jupiter. A sudden, massive elevation in societal status and undeniable fame is imminent.', rem: 'Act with extreme grace. The public will judge every microscopic flaw.' },
      { id: 'k2', icon: '🛡️', label: 'Loss of Honor', pred: 'Saturn aspects the AL heavily. Your reputation faces a 2-year period of harsh, unforgiving scrutiny and cold isolation.', rem: 'Do not defend yourself aggressively. Only silent, grinding righteous work restores trust.' },
      { id: 'k3', icon: '⚖️', label: 'Village Leadership', pred: 'The 10th Lord is strong. You will be universally chosen to lead a local council or resolve major societal disputes.', rem: 'Judge impartially. Unjust decisions now will invite a multi-generational curse.' },
      { id: 'k4', icon: '👻', label: 'Exile from Public', pred: 'Ketu transits the AL. You will become entirely energetically invisible. Seeking public validation now will yield absolute zero.', rem: 'Accept the exile gracefully. Use this hidden period to perform severe penance.' },
      { id: 'k5', icon: '📉', label: 'Infamy & Scandal', pred: 'Rahu dominates the 10th Lord. A fabricated, highly defamatory scandal will erupt out of nowhere, severely damaging your public standing.', rem: 'Do not issue fiery denials. The truth will quietly emerge in 6 months.' },
      { id: 'k6', icon: '🏛️', label: 'Posthumous Glory', pred: 'Saturn in the 10th ensures that your greatest worldly achievements will only be truly recognized and immortalized long after your passing.', rem: 'Build for eternity. Do not seek contemporary applause.' }
    ]
  },
  'mrityu': {
    title: 'Dangers & Longevity', icon: '⚠️', desc: 'Maraka & Badhaka',
    prompt: 'The Maraka (Death-inflicting) houses command periods of immense physical danger. Scan for immediate threats.',
    options: [
      { id: 'mr1', icon: '🔥', label: 'Fever & Inflammation', pred: 'The 6th Lord approaches combustion. A severe, undiagnosable fever will completely drain vital energy for weeks.', rem: 'Avoid entirely all pungent or heating foods. Rely purely on milk and ghee.' },
      { id: 'mr2', icon: '🐎', label: 'Accident Risk', pred: 'Mars transits exactly over a Mrityubhaga degree. The probability of severe injury from beasts, vehicles, or weapons is extreme.', rem: 'Strictly avoid travel and handling of sharp objects on Tuesdays.' },
      { id: 'mr3', icon: '🐍', label: 'Poison / Toxins', pred: 'Rahu obscures the 8th house. There is a high risk of food poisoning or snakebite in unfamiliar territories.', rem: 'Do NOT consume food prepared by strangers during this 45-day window.' },
      { id: 'mr4', icon: '🛡️', label: 'Titanium Armor', pred: 'The Lagna Lord exalted alongside Jupiter confirms absolute protection. No disease or weapon can touch you during this vast Dasha.', rem: 'Use this indestructible phase to attempt herculean, high-risk worldly tasks.' },
      { id: 'mr5', icon: '🌊', label: 'Water Hazard', pred: 'An afflicted Moon in the 8th creates a severe, immediate physiological vulnerability to drowning or waterborne pathogens.', rem: 'Strictly avoid oceans, rivers, and unboiled water for the next 40 days.' },
      { id: 'mr6', icon: '🧗', label: 'Fall from Height', pred: 'Saturn is afflicted by Mars. A catastrophic failure of balance or structural collapse while at a high elevation is mathematically probable.', rem: 'Do not climb ladders, mountains, or tall structures under any circumstances.' }
    ]
  },
  'dinacharya': {
    title: 'Daily Rites', icon: '⚙️', desc: '6th House Discipline',
    prompt: 'The 6th house requires the rhythmic discipline of daily life to suppress diseases and enemies. What needs correction?',
    options: [
      { id: 'di1', icon: '🌅', label: 'Brahma Muhurta', pred: 'The Sun demands you rise before dawn. Sleeping past sunrise will completely obliterate your willpower and financial drive.', rem: 'Wake 90 minutes before dawn and perform the Sandhyavandana instantly.' },
      { id: 'di2', icon: '🌙', label: 'Rest & Fasting', pred: 'Saturn requires structured deprivation. Skipping regular fasting days will result in aggressive accumulation of bodily toxins.', rem: 'Observe a strict water-only fast on the upcoming Ekadashi.' },
      { id: 'di3', icon: '🥗', label: 'Sattivic Diet', pred: 'Venus demands pure, heavy nourishment. Eating stale or highly processed foods right now will shatter the endocrine balance.', rem: 'Consume warm milk, ghee, and freshly cooked rice to anchor the energy.' },
      { id: 'di4', icon: '🧹', label: 'Purity of Space', pred: 'Ketu insists on absolute minimalism. Clutter or dirt in the home is actively spawning invisible malefic energies.', rem: 'Thoroughly cleanse the entire household with cow-dung ash or saltwater.' },
      { id: 'dc5', icon: '🥱', label: 'Missed Rituals', pred: 'Rahu induces a heavy, tamasic laziness, causing you to skip your non-negotiable daily rites and leaving your aura completely exposed.', rem: 'Force yourself through the motions even without feeling devotion. Discipline is armor.' },
      { id: 'dc6', icon: '☀️', label: 'Perfect Austerity', pred: 'A strongly placed Sun provides the iron willpower needed to execute your daily morning rituals with flawless, military precision.', rem: 'Increase the complexity of your mantras; you can handle the higher frequency.' }
    ]
  },
  'sangha': {
    title: 'Community & Guilds', icon: '🕸️', desc: '11th House Gains',
    prompt: 'The 11th house dictates your ability to extract wealth and favors from large societies or guilds. What is the objective?',
    options: [
      { id: 'sg1', icon: '👥', label: 'Leading the Masses', pred: 'Jupiter guarantees immense support from large communities. A massive gathering will yield profound financial gains.', rem: 'Donate a large portion of the proceeds to build a public well or temple.' },
      { id: 'sg2', icon: '🤝', label: 'Royal Patrons', pred: 'The exalted Sun places you in the immediate favor of kings, nobles, or high government officials within months.', rem: 'Treat them with immense respect, but maintain your inner ascetic dignity.' },
      { id: 'sg3', icon: '🐍', label: 'False Friends', pred: 'Rahu heavily afflicts the 11th. Your current circle of associates is parasitic, secretly envying and draining your resources.', rem: 'Execute a ruthless social purge. True prosperity requires isolation right now.' },
      { id: 'sg4', icon: '🏅', label: 'Public Honors', pred: 'The 11th Lord aspects the 10th. A major, prestigious honor or title will be conferred upon you completely unexpectedly.', rem: 'Accept it with humility. Arrogance will instantly reverse the blessing.' },
      { id: 'sg5', icon: '🚪', label: 'Excommunication', pred: 'Saturn opposes the 11th. You will be formally cast out of your professional guild or social community for defying a rigid orthodox rule.', rem: 'Accept the exile. A far superior network awaits you in isolation.' },
      { id: 'sg6', icon: '📜', label: 'Forming a Guild', pred: 'Mercury in the 11th gives you the administrative genius to gather disparate, skilled individuals and form a highly profitable new syndicate.', rem: 'Draft the bylaws clearly. Ensure intellectual property is protected.' }
    ]
  },
  'tantra': {
    title: 'Occult & Mysticism', icon: '🔮', desc: 'D8 Ashtamsa Matrix',
    prompt: 'The 8th house and D8 chart govern Tantra, hidden dimension, and the manipulation of occult energies. Do you dare look?',
    options: [
      { id: 't1', icon: '🧘', label: 'Kundalini Awakening', pred: 'A massive surge of Prana is preparing to rise up the central channel. Without a purified body, this will cause madness.', rem: 'Engage strictly in physical Hatha Yoga and Pranayama to fortify the nervous system.' },
      { id: 't2', icon: '🔥', label: 'Left-Hand Path', pred: 'WARNING: Mars and Rahu in the 8th. Any attempt to use Aghora or Vamachara methods to gain rapid power will result in total destruction.', rem: 'Flee from these practices instantly. Revert to orthodox right-hand worship.' },
      { id: 't3', icon: '👁️', label: 'Prashna Siddhi', pred: 'Jupiter and Ketu conjunct in the D8. You possess the rare intuitive capability to answer questions purely through omens.', rem: 'Observe the breath (Swara) when asked a question. The answer lies there.' },
      { id: 't4', icon: '👻', label: 'Entity Attachment', pred: 'The Moon is afflicted by Ketu. You are an open, unprotected vessel mistaking parasitic entities for divine guides.', rem: 'Cease all channeling immediately. Ground yourself with heavy lifting and root vegetables.' },
      { id: 't5', icon: '🏺', label: 'Cursed Object', pred: 'Saturn and Rahu indicate you have blindly brought an object into your home that carries a severe, multi-generational curse.', rem: 'Identify the antique or gifted item immediately and submerge it in seawater.' },
      { id: 't6', icon: '🛡️', label: 'Protective Yantra', pred: 'Favorable Sun and Mars allow the successful establishment of a geometric Yantra that will brutally repel all directed occult attacks.', rem: 'Draw it meticulously on copper and install it facing the East.' }
    ]
  },
  'vritti': {
    title: 'Profession & Job', icon: '⚖️', desc: '10th House Karma',
    prompt: 'The 10th house governs your livelihood, daily trade, and standing before employers. What is the state of your work?',
    options: [
      { id: 'vri1', icon: '📝', label: 'Securing a Position', pred: 'The 10th Lord is exceptionally dignified. A stable, honorable position with a generous superior is rapidly approaching.', rem: 'Accept the offer immediately on a Thursday to seal the Jupiterian blessing.' },
      { id: 'vri2', icon: '👑', label: 'Conflict with Boss', pred: 'The Sun is afflicted in your career house. Ego clashes with a powerful authority figure threaten your immediate livelihood.', rem: 'Bow your head. Do not engage in a battle of pride you cannot win right now.' },
      { id: 'vri3', icon: '📉', label: 'Loss of Trade', pred: 'Saturn transits the 10th. A multi-year period of severe professional stagnation or outright loss of current employment is beginning.', rem: 'Embrace frugality and pivot to a completely different, humbler trade.' },
      { id: 'vri4', icon: '⚒️', label: 'Changing Paths', pred: 'Rahu dictates a sudden, chaotic shift in your primary profession. You will abandon your lifelong trade for something entirely foreign.', rem: 'Follow the disruptive energy wisely but secure a financial buffer first.' },
      { id: 'vri5', icon: '👑', label: 'Royal Patronage', pred: 'The Sun sits powerfully in the 10th house. A monarch or massive government entity will commission your services directly, bypassing all middlemen.', rem: 'Execute the task flawlessly. This is the pinnacle of your career.' },
      { id: 'vri6', icon: '📉', label: 'Public Disgrace', pred: 'Rahu in the 10th warns of a massive, public professional failure due to overpromising and utilizing untested, chaotic methods.', rem: 'Under-promise drastically. Stick to agonizingly safe protocols right now.' }
    ]
  },
  'mitratva': {
    title: 'Friendship & Allies', icon: '🤝', desc: '11th House Bonds',
    prompt: 'The 11th house signifies the networks and companions we choose. Are your friends true allies or hidden drains?',
    options: [
      { id: 'mit1', icon: '🛡️', label: 'True Companion', pred: 'Jupiter aspects the 11th. A friend of immense moral character and resources will step silently in to shield you from ruin.', rem: 'Honor this bond fiercely. It is a karmic reward from past lives.' },
      { id: 'mit2', icon: '🐍', label: 'Bitter Betrayal', pred: 'Mars and Ketu conjunct in the house of friends. Someone within your inner circle is actively plotting to usurp your position or wealth.', rem: 'Trust no one with financial secrets for the entirety of this lunar phase.' },
      { id: 'mit3', icon: '🌐', label: 'Expanding Network', pred: 'Mercury is exalted. You will suddenly gain entry into a highly influential, intellectual circle that elevates your entire worldview.', rem: 'Listen twice as much as you speak. Absorb their operational wisdom.' },
      { id: 'mit4', icon: '👻', label: 'Toxic Influence', pred: 'Rahu brings glamorous but deeply flawed associates into your orbit. They will drag you into vices and squander your hard-earned time.', rem: 'Sever ties immediately. The association is mathematically poisoning you.' },
      { id: 'mit5', icon: '🔗', label: 'Lifelong Pact', pred: 'Jupiter and Saturn align perfectly. A friendship formed this week will calcify into an unbreakable, blood-brother pact that lasts till death.', rem: 'Seal the bond with a shared meal and a mutual vow of loyalty.' },
      { id: 'mit6', icon: '🐍', label: 'Jealousy of Peers', pred: 'Venus is intensely afflicted by Mars. Your recent success has triggered virulent, barely concealed envy among your closest professional peers.', rem: 'Downplay your victories. Conceal your newly acquired wealth.' }
    ]
  },
  'poshana': {
    title: 'Food & Nourishment', icon: '🥘', desc: '2nd House Sustenance',
    prompt: 'The 2nd house rules what enters the mouth. Diet directly shapes consciousness and physical destiny. What are you consuming?',
    options: [
      { id: 'pos1', icon: '🌾', label: 'Purity of Diet', pred: 'Sattvic planets demand an immediate shift to a pure, plant-based diet. Your spiritual antenna is currently blocked by heavy, tamasic food.', rem: 'Perform a 3-day fast on seasonal fruits to flush the accumulated dense karma.' },
      { id: 'pos2', icon: '🔥', label: 'Digestive Fire', pred: 'Mars is severely afflicted. The Agni (digestive fire) is erratic. Consuming heavy or overly spiced meals now will lead to chronic physical agony.', rem: 'Consume only warm, soupy grains and strictly avoid cold water.' },
      { id: 'pos3', icon: '🍯', label: 'Culinary Fortune', pred: 'Venus in the 2nd blesses you with an abundance of rich, exquisite foods and the means to host lavish feasts for others.', rem: 'Do not hoard the bounty. Always feed a stranger or an animal first.' },
      { id: 'pos4', icon: '☠️', label: 'Tainted Food', pred: 'Rahu introduces a high probability of consuming spoiled or highly toxic sustenance during travel or from negligent hosts.', rem: 'Smell your food carefully. If intuition hesitates, leave the plate untouched.' },
      { id: 'pos5', icon: '🏜️', label: 'Famine & Scarcity', pred: 'Saturn in the 2nd constricts the food supply. You will enter a grim period where finding even basic, nourishing calories becomes a brutal logistical challenge.', rem: 'Ration the stored grains meticulously. The supply lines are freezing.' },
      { id: 'pos6', icon: '🌿', label: 'Healing Herbs', pred: 'The Sun and Moon form a flawless trine. You will instinctively discover a specific medicinal herb or root that permanently cures a chronic physical ailment.', rem: 'Consume it precisely at dawn while facing the sun.' }
    ]
  },
  'pratibha': {
    title: 'Talent & Craftsmanship', icon: '🎨', desc: '3rd/5th House Skills',
    prompt: 'The 3rd house governs the hands; the 5th governs creative intelligence. Are you honing your innate God-given skills?',
    options: [
      { id: 'pra1', icon: '🎶', label: 'Musical Prowess', pred: 'Venus and Mercury align to grant sudden mastery over an instrument or vocal art. The muse is desperately trying to channel through you.', rem: 'Practice in absolute solitude for 2 hours daily before dawn.' },
      { id: 'pra2', icon: '🧱', label: 'Physical Craft', pred: 'Saturn heavily supports the patient shaping of wood, stone, or metal. Your hands are currently capable of building something that outlasts you.', rem: 'Focus on structural integrity over aesthetic beauty.' },
      { id: 'pra3', icon: '📝', label: 'Writer’s Block', pred: 'A severe affliction to the 3rd Lord completely severs your creative flow. Staring at the blank page will yield nothing but frustration.', rem: 'Stop forcing creation. Go labor physically until the mental block breaks.' },
      { id: 'pra4', icon: '🏅', label: 'Public Recognition', pred: 'The Sun illuminates the 5th house. A niche skill or hobby you have cultivated in secret will suddenly gain widespread, lucrative admiration.', rem: 'Do not let the praise inflate the ego. Remain a humble student of the craft.' },
      { id: 'pra5', icon: '🕵️', label: 'Stolen Ideas', pred: 'Mercury is eclipsed by Rahu. A rival will perfectly copy and patent your brilliant creative concept before you have the chance to launch it.', rem: 'Keep the blueprints under absolute lock and key. Speak to no one.' },
      { id: 'pra6', icon: '✨', label: 'Masterpiece Created', pred: 'An exalted Venus in the 5th guarantees that the physical art or code you are writing right now will be your defining magnum opus.', rem: 'Do not sleep. Work frantically while the celestial gate is open.' }
    ]
  },
  'sanskriti': {
    title: 'Culture & Heritage', icon: '🪔', desc: '9th House Roots',
    prompt: 'The 9th house connects you to the deep, unshakable roots of your ancestors, language, and cultural rituals. Are you tethered or drifting?',
    options: [
      { id: 'san1', icon: '🎭', label: 'Hosting Festivals', pred: 'Jupiter commands the organization of a large cultural or religious festival. Gathering your people under traditional rites will generate massive Punya (merit).', rem: 'Spare no expense. Ensure the elders are seated comfortably and fed first.' },
      { id: 'san2', icon: '🌬️', label: 'Cultural Drift', pred: 'Rahu pulls you aggressively toward foreign concepts, leading to a subtle but dangerous abandonment of your indigenous linguistic and cultural identity.', rem: 'Read the foundational texts of your mother tongue to re-anchor the mind.' },
      { id: 'san3', icon: '📜', label: 'Preserving Language', pred: 'Mercury’s exaltation indicates you are tasked karmically with archiving, teaching, or reviving a dying dialect or ancestral narrative.', rem: 'Document the stories of the oldest living members of your bloodline immediately.' },
      { id: 'san4', icon: '⚖️', label: 'Generational Clash', pred: 'Saturn forces a painful ideological collision between your modern behaviors and the rigid, orthodox expectations of your traditional patriarchs.', rem: 'Do not disrespect them openly, but quietly navigate your own necessary path.' },
      { id: 'san5', icon: '📜', label: 'Reviving Ancients', pred: 'A retrograde Jupiter pushes the mind backward. You will successfully resurrect a completely forgotten, highly potent ancient cultural ritual.', rem: 'Perform the rite exactly as described in the oldest available manuscript.' },
      { id: 'san6', icon: '⚡', label: 'Blasphemy', pred: 'Rahu in the 9th triggers a reckless, arrogant urge to publicly mock the sacred traditions of your ancestors. The karmic blowback will be immediate.', rem: 'Bite your tongue. Do not mistake edgy rebellion for profound intellect.' }
    ]
  },
  'vahana': {
    title: 'Vehicles & Conveyance', icon: '🐎', desc: '4th House Mobility',
    prompt: 'The 4th house and Venus dictate your comfort in travel, ownership of vehicles, beasts of burden, and daily transport. Is your carriage secure?',
    options: [
      { id: 'vah1', icon: '🛒', label: 'Acquiring a Vehicle', pred: 'Venus is strongly dignified in a Kendra. The coming fortnight is highly auspicious for purchasing a beautiful, reliable, and comfortable new vehicle.', rem: 'Bring the vehicle to the temple to be blessed before bringing it home.' },
      { id: 'vah2', icon: '💥', label: 'Breakdown & Accident', pred: 'Mars casts a malefic glance on the 4th house. A sudden, violent breakdown or accident involving your primary mode of transport is highly probable.', rem: 'Delay all non-essential travel. Perform maintenance strictly on a Monday.' },
      { id: 'vah3', icon: '🚚', label: 'Trade Logistics', pred: 'Saturn indicates slow, grinding, but ultimately highly profitable logistical movement of heavy cargo or goods over long distances.', rem: 'Insure the cargo meticulously. Delays are inevitable but will not destroy the profit.' },
      { id: 'vah4', icon: '🕵️', label: 'Theft of Conveyance', pred: 'Rahu’s transit threatens the sudden theft or inexplicable disappearance of your vehicle during an unguarded moment in a foreign area.', rem: 'Do not park in unlit, unfamiliar territories. Keep the vehicle heavily secured.' },
      { id: 'vah5', icon: '🐎', label: 'Acquiring Beasts', pred: 'Venus in the 4th ensures the swift, highly profitable acquisition of strong, beautiful horses or elite modern vehicles.', rem: 'Purchase the asset on a Friday during an auspicious planetary hour.' },
      { id: 'vah6', icon: '💥', label: 'Injury from Fall', pred: 'Mars in the 4th signifies a violent, bone-breaking fall from a moving chariot, vehicle, or beast of burden.', rem: 'Ensure the reins are tight. Do not travel at high speeds under any circumstances.' }
    ]
  },
  'vysana': {
    title: 'Vices & Weakness', icon: '🍷', desc: '6th House Afflictions',
    prompt: 'The 6th house rules Shadripu (the six enemies of the mind). Kama, Krodha, Lobha, Moha, Mada, Matsarya. Which vice has taken the reins?',
    options: [
      { id: 'vys1', icon: '🎲', label: 'Gambling Losses', pred: 'Rahu completely clouds the judgment in the 5th house. The urge to speculate impulsively will lead to total financial ruin if not suppressed instantly.', rem: 'Hand over control of your treasury to a trusted elder immediately.' },
      { id: 'vys2', icon: '🍻', label: 'Intoxicants', pred: 'The Moon afflicted by Saturn draws you toward heavy, depressive intoxicants to artificially numb a deep, unaddressed emotional wound.', rem: 'The substance is a false refuge. Face the pain through fierce, sober physical exertion.' },
      { id: 'vys3', icon: '🔥', label: 'Overcoming Habit', pred: 'An exalted Mars gives you a 40-day window of unbreakable titanium willpower. Any dark habit dropped right now will be severed forever.', rem: 'Make a hard, absolute vow and burn the bridges to the old behavior.' },
      { id: 'vys4', icon: '🐍', label: 'Unlawful Desires', pred: 'Venus debilitated brings a sickeningly sharp temptation toward an immoral or culturally forbidden romantic entanglement.', rem: 'Flee the situation. The resulting scandal will irrevocably obliterate your reputation.' },
      { id: 'vys5', icon: '⛓️', label: 'Debt to Criminals', pred: 'Rahu in the 6th indicates you have foolishly borrowed resources from dangerous, unscrupulous men to fund a rapidly escalating vice.', rem: 'Liquidate legitimate assets to pay them off today. They will break you otherwise.' },
      { id: 'vys6', icon: '💧', label: 'Purity Restored', pred: 'Jupiter’s aspect on the Ascendant suddenly washes away all desire for the intoxicant or vice that has plagued you for years.', rem: 'The chains are broken. Never look backward at the poison again.' }
    ]
  },
  'shrama': {
    title: 'Labor & Subordinates', icon: '⛏️', desc: '6th/Saturn Karma',
    prompt: 'The 6th house dictates your relation to hard physical labor, servants, employees, and those lower in the social hierarchy. How do you manage the toil?',
    options: [
      { id: 'shr1', icon: '🤝', label: 'Loyal Workforce', pred: 'Saturn is pleased by your past actions. You will acquire deeply loyal, hardworking subordinates who will act as the absolute backbone of your enterprise.', rem: 'Pay them exactly on time and grant them unexpected bonuses to seal their loyalty.' },
      { id: 'shr2', icon: '✊', label: 'Strike or Rebellion', pred: 'Mars transits the 6th. The labor force is seething with resentment over unfair treatment and is preparing an aggressive, coordinated halt to all production.', rem: 'Concede to their reasonable demands immediately before the enterprise bleeds.' },
      { id: 'shr3', icon: '😓', label: 'Physical Exhaustion', pred: 'The Sun is drained. You have taken on the physical labor of ten men, and the structural integrity of your spine and heart is failing.', rem: 'Delegate immediately. You are not a beast of burden meant to pull the cart alone.' },
      { id: 'shr4', icon: '⚖️', label: 'Exploitative Contracts', pred: 'Rahu indicates you are either severely underpaying someone, or you yourself are trapped in a deeply exploitative, parasitic labor contract.', rem: 'Review the ledgers. Karmic debt is accruing daily. Correct the scales.' },
      { id: 'shr5', icon: '⚒️', label: 'Skilled Craftsmen', pred: 'Mercury in the 6th brings technically brilliant, highly articulate subordinates into your employ who will optimize your entire operation.', rem: 'Give them the autonomy they demand. Do not micromanage genius.' },
      { id: 'shr6', icon: '🐀', label: 'Thieves in the Ranks', pred: 'Ketu in the 6th reveals that unseen, quiet employees are systematically siphoning resources from the lower levels of your enterprise.', rem: 'Audit the inventory immediately. The leak is coming from the bottom.' }
    ]
  },
  'pashu': {
    title: 'Animals & Pets', icon: '🐕', desc: '6th House Companions',
    prompt: 'The management of beasts, pets, and agricultural livestock falls under the 6th house. How is your relationship with the silent beings?',
    options: [
      { id: 'pas1', icon: '🐈', label: 'Acquiring a Pet', pred: 'Jupiter blesses the home with the arrival of a loyal animal companion. The creature will absorb significant negative energy directed at the household.', rem: 'Treat the animal as a highly honored guest; it is a spiritual shield.' },
      { id: 'pas2', icon: '🥀', label: 'Loss of Animal', pred: 'Ketu indicates the sudden, inexplicable passing or wandering away of a beloved pet or vital piece of agricultural livestock.', rem: 'Do not search endlessly if it vanishes. It has fulfilled its karmic contract with you.' },
      { id: 'pas3', icon: '🐄', label: 'Agricultural Bounty', pred: 'Venus in Taurus ensures that livestock used for milk, wool, or breeding will multiply flawlessly and yield immense, sustained profit.', rem: 'Ensure their living conditions are impeccably clean and comfortable.' },
      { id: 'pas4', icon: '🐺', label: 'Animal Attack', pred: 'Mars and Saturn afflict the Ascendant. There is a precise, high-risk planetary alignment indicating severe physical injury from a wild or feral animal.', rem: 'Avoid stray dogs, horses, and deep forests entirely for the next month.' },
      { id: 'pas5', icon: '🦠', label: 'Sickness in Herd', pred: 'Saturn in the 6th brings a cold, creeping plague into your livestock, pets, or dependent biological assets, threatening massive loss.', rem: 'Isolate the sick instantly. Burn sulfur in the stables.' },
      { id: 'pas6', icon: '🐕', label: 'Loyal Guard Dog', pred: 'Mars in the 6th signifies the acquisition of a fierce, utterly loyal animal that will physically save your life from an intruder.', rem: 'Feed it premium meat and treat it as a trusted warrior.' }
    ]
  },
  'vishrama': {
    title: 'Rest & Leisure', icon: '🏕️', desc: '12th/5th House Release',
    prompt: 'Between the grinding gears of Dharma and Artha, the soul requires Vishrama (rest) and playful release to maintain sanity. How do you retreat?',
    options: [
      { id: 'vis1', icon: '🧘', label: 'Deep Solitude', pred: 'Ketu in the 12th mandates absolute, silent retreat. Withdrawing from all social and worldly obligations for a week will reset the fundamental operating system of your mind.', rem: 'Go to a quiet mountain or forest isolated from all human chatter.' },
      { id: 'vis2', icon: '🏹', label: 'Sporting Victory', pred: 'Mars in the 3rd house grants explosive physical coordination. Entering physical competitions or athletic pastimes now guarantees dominant, exhilarating victories.', rem: 'Channel the aggressive energy fully into the sport; leave it all on the field.' },
      { id: 'vis3', icon: '🎭', label: 'Creative Play', pred: 'Venus illuminates the 5th. Engage purely in activities with absolutely zero financial outcome—painting, theater, or dancing—to unblock the heart chakra.', rem: 'Do not attempt to monetize the hobby. Its value is purely healing.' },
      { id: 'vis4', icon: '⛓️', label: 'Forced Inaction', pred: 'Saturn chains the Ascendant. The universe will physically incapacitate you with a minor ailment if you refuse to aggressively schedule rest into your calendar.', rem: 'Cancel the upcoming engagements voluntarily before the cosmos does it violently.' },
      { id: 'vis5', icon: '👁️', label: 'Disturbed Sleep', pred: 'Rahu blocks the 12th house. Paranoia and racing, horrifying thoughts will completely shatter your ability to enter deep REM sleep.', rem: 'Sleep with a heavy iron object under the mattress to ground the chaotic ether.' },
      { id: 'vis6', icon: '🌊', label: 'Healing Springs', pred: 'The Moon in a watery 4th house directs you to seek physical restoration in natural hot springs or mineral-rich coastal waters.', rem: 'Submerge yourself fully. The water will extract the deep fatigue.' }
    ]
  },
  'danam': {
    title: 'Charity & Giving', icon: '🤲', desc: '9th House Philanthropy',
    prompt: 'Wealth that is hoarded rots the soul. Danam (Charity) is the great purifier of the D2 treasury. Where must your resources flow?',
    options: [
      { id: 'dan1', icon: '💧', label: 'Building a Well', pred: 'The Moon dominates your chart. Funding a public water source, well, or reservoir will yield multi-generational merit that protects your descendants.', rem: 'Ensure the water is freely accessible to all castes, classes, and animals.' },
      { id: 'dan2', icon: '🍚', label: 'Feeding the Poor', pred: 'Saturn demands Anna Danam. Your current financial blockages will only clear once you physically serve hot, high-quality food to the impoverished.', rem: 'Do not just donate coin. Serve the food with your own hands on a Saturday.' },
      { id: 'dan3', icon: '📚', label: 'Supporting Scholars', pred: 'Jupiter instructs that providing resources to orthodox scholars, priests, or places of pure Vedic learning is your highest karmic leverage point right now.', rem: 'Sponsor the education of one dedicated, impoverished student silently.' },
      { id: 'dan4', icon: '🐉', label: 'Selfish Hoarding', pred: 'Rahu creates the terrifying illusion of scarcity, causing you to tightly hoard wealth. This miserly grip is actively strangling future financial inflows.', rem: 'Force yourself to make a painful, anonymously large donation to break the fear.' },
      { id: 'dan5', icon: '🥷', label: 'Secret Philanthropy', pred: 'The Sun in the 12th demands Gupt Danam (secret charity). A massive anonymous donation will instantly burn three lifetimes of terrible karma.', rem: 'If anyone discovers it was you who gave the wealth, the spiritual merit is voided.' },
      { id: 'dan6', icon: '🐉', label: 'Misused Funds', pred: 'Rahu in the 9th warns that the charitable foundation you recently trusted is run by charlatans embezzling the divine funds.', rem: 'Halt all donations. Re-direct your wealth to direct, physical feeding of the poor.' }
    ]
  },
  'runa': {
    title: 'Debts & Borrowing', icon: '📜', desc: '6th House Ledgers',
    prompt: 'The 6th house tracks the heavy karmic chains of Runa (Debt). Are you bound to creditors, or are others bound to you?',
    options: [
      { id: 'run1', icon: '⛓️', label: 'Crushing Debt', pred: 'Saturn and Mars lock the 6th house. A massive, compounding financial debt is threatening to completely consume your ancestral assets and peace of mind.', rem: 'Halt all new borrowing. Approach the creditor honestly and negotiate an austere repayment plan.' },
      { id: 'run2', icon: '💰', label: 'Sudden Repayment', pred: 'Jupiter casts a highly beneficial glance. You will suddenly secure the exact lump sum needed to eradicate a long-standing, suffocating financial burden.', rem: 'Clear the debt the very hour the funds arrive. Do not divert the money.' },
      { id: 'run3', icon: '🩸', label: 'Loaning to Family', pred: 'Venus in the 6th warns that any wealth loaned to a close relative right now will never return and will permanently shatter the familial bond.', rem: 'Give the money as a sheer gift if you must, but never expect it back. Avoid loans.' },
      { id: 'run4', icon: '👻', label: 'Inherited Debt', pred: 'Ketu reveals that a sudden structural failure in your finances is actually the manifestation of a dark, unpaid debt from your great-grandfather’s era.', rem: 'Perform a specific Tila Homa to clear the spiritual ledger before fixing the physical bank account.' },
      { id: 'run5', icon: '🕊️', label: 'Debt Forgiveness', pred: 'Jupiter sitting in the 6th house softens the heart of your harshest creditor. They will inexplicably wipe the slate clean if approached humbly.', rem: 'Beg for forgiveness today. The window of their mercy is very short.' },
      { id: 'run6', icon: '⛓️', label: 'Lifelong Bondage', pred: 'Saturn retrograde in the 6th ensures that a contract signed this week will financially indenture you and your immediate heirs for 40 years.', rem: 'Do not sign the ledger. The terms are mathematically designed to enslave you.' }
    ]
  }
};

// ==========================================
// 2. CLASSICAL MODULAR COMPONENTS
// ==========================================

const MandalaHero = ({ activeTime, setActiveTime, K, t, lang }) => {
  const timescales = ['Today', 'This Lunar Phase', 'This Masa (Month)', 'This Samvatsara (Year)', 'Mahadasha'];

  const [cache, setCache] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const fetchOracle = React.useCallback(async (forceRegenerate = false) => {
    if (!K) return;

    if (!forceRegenerate) {
       // Check localStorage for 24h TTK Cache
       const stored = localStorage.getItem(`jyotish_oracle_${activeTime}`);
       if (stored) {
         try {
           const parsed = JSON.parse(stored);
           const isStale = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
           if (!isStale && parsed.text) {
             setCache(prev => ({ ...prev, [activeTime]: parsed.text }));
             return;
           }
         } catch(e) {}
       }
       // Fallback to active session mapping
       if (cache[activeTime]) return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDate: new Date().toString(),
          timescale: activeTime,
          kundaliData: {
             lagna: { rashi: K.lagna?.rashi, deg: K.lagna?.degFmt },
             planets: K.planets.map(p => ({
               id: p.key, sign: p.rashi, house: p.house, nak: p.nakshatraName
             })),
             dasha: K.dasha ? { maha: K.dasha.maha, antar: K.dasha.antar } : null,
             panchanga: K.panchanga ? {
               tithi: K.panchanga.tithi?.name,
               karana: K.panchanga.karana?.name,
               yoga: K.panchanga.yoga?.name,
               nakshatra: K.panchanga.nakshatra?.name
             } : null,
             ashtakavarga: K.ashtakavarga ? { SAV: K.ashtakavarga.SAV } : null
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to consult the Oracle.');

      setCache(prev => ({ ...prev, [activeTime]: data.prediction }));
      localStorage.setItem(`jyotish_oracle_${activeTime}`, JSON.stringify({ text: data.prediction, timestamp: Date.now() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTime, K, cache]);

  React.useEffect(() => {
    fetchOracle();
  }, [activeTime, K]);

  return (
    <div className="mobile-hero-padding" style={{ background: 'var(--bg-input)', backgroundImage: 'radial-gradient(var(--bg-input) 20%, transparent 20%), radial-gradient(var(--bg-input) 20%, transparent 20%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px', padding: '50px', borderRadius: '4px', border: '2px solid var(--border-light)', marginBottom: '32px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 50px var(--bg-surface), 0 10px 30px rgba(0,0,0,0.5)' }}>
      <div style={{ position: 'absolute', top: '50%', right: '-5%', transform: 'translateY(-50%)', width: '300px', height: '300px', border: '5px dashed var(--border-light)', borderRadius: '50%', animation: 'spin 120s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ width: '200px', height: '200px', border: '10px double var(--border-light)', borderRadius: '50%', animation: 'spin 60s reverse infinite' }}></div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '38px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Predictions')}</h2>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {timescales.map(ts => (
            <button key={ts} onClick={() => setActiveTime(ts)} style={{ background: activeTime === ts ? 'var(--accent-gold)' : 'var(--bg-input)', color: activeTime === ts ? 'var(--bg-input)' : 'var(--accent-gold)', border: '1px solid #ffd700', padding: '8px 16px', borderRadius: '0', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase' }}>{t(ts)}</button>
          ))}
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '24px', borderLeft: '4px solid #ffd700', borderRight: '4px solid #ffd700', minHeight: '100px', display: 'flex', alignItems: 'center' }}>
          {loading ? (
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)' }}>
               <span style={{ fontSize: '24px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🪔</span>
               <span style={{ fontFamily: '"Cinzel", serif', fontSize: '16px', letterSpacing: '2px', textTransform: 'uppercase' }}>Consulting Akashic Records...</span>
             </div>
          ) : error ? (
             <p style={{ margin: 0, fontSize: '16px', color: 'var(--text-badge-red)', fontFamily: '"Cinzel", serif' }}>⚠️ {error}</p>
          ) : (
             <div style={{ position: 'relative', width: '100%', minHeight: '50px' }}>
               <p style={{ margin: 0, fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)', fontFamily: 'serif', fontStyle: 'italic', paddingRight: '40px' }}>
                 "{cache[activeTime] || 'Awaiting celestial alignment...'}"
               </p>
               {cache[activeTime] && (
                 <button 
                   onClick={() => fetchOracle(true)}
                   title="Consult again (Override cache)"
                   style={{ position: 'absolute', top: '-10px', right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}
                   onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.transform = 'rotate(180deg)'; }}
                   onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'rotate(0deg)'; }}
                 >
                   ⟳
                 </button>
               )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EclipticChart = ({ hue, pillarId, t }) => {
   const ALL = ['Su','Mo','Ma','Me','Ju','Ve','Sa','Ra','Ke'];
   const sum = [...(pillarId||'x')].reduce((a,c)=>a+c.charCodeAt(0),0);
   const p1 = ALL[sum % ALL.length];
   const p2 = ALL[(sum + 3) % ALL.length];
   const RASHIS = ['Mesha ♈','Vrish ♉','Mith ♊','Kark ♋','Simha ♌','Kanya ♍','Tula ♎','Vrish ♏','Dhanu ♐','Makar ♑','Kumbh ♒','Meen ♓'];
   const NAKSHATRAS = ['Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu', 'Pushya', 'Aslesha', 'Magha', 'P.Phal', 'U.Phal', 'Hasta', 'Chitra', 'Swati', 'Visakha', 'Anuradha', 'Jyeshtha', 'Mula', 'P.Ashadha', 'U.Ashadha', 'Sravana', 'Dhanishta', 'Satabhisha', 'P.Bhadra', 'U.Bhadra', 'Revati'];

   // Determine the Rashi index for highlighted planets to softly glow the sector
   const p1Ang = ((sum % ALL.length) * 40 + 15);
   const p2Ang = (((sum + 3) % ALL.length) * 40 + 15);
   const rashi1 = Math.floor((p1Ang % 360) / 30);
   const rashi2 = Math.floor((p2Ang % 360) / 30);

  return (
    <svg className="responsive-svg" width="100%" viewBox="0 0 500 500" style={{ filter: `hue-rotate(${hue}deg) drop-shadow(0 0 20px rgba(255,215,0,0.3))`, maxWidth: '400px', overflow: 'visible' }}>
       {/* Structural rings */}
       <circle cx="250" cy="250" r="230" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
       <circle cx="250" cy="250" r="190" fill="none" stroke="var(--text-muted)" strokeWidth="2" opacity="0.6" />
       <circle cx="250" cy="250" r="150" fill="none" stroke="var(--accent-gold)" strokeWidth="1" />
       
       {/* 12 Rashi Sectors & Text */}
       {RASHIS.map((rashi, i) => {
         const aAngle = i * 30 * (Math.PI/180);
         const x1 = 250 + 150 * Math.cos(aAngle), y1 = 250 + 150 * Math.sin(aAngle);
         const x2 = 250 + 190 * Math.cos(aAngle), y2 = 250 + 190 * Math.sin(aAngle);
         
         const aMid = (i * 30 + 15) * (Math.PI/180);
         const xText = 250 + 170 * Math.cos(aMid), yText = 250 + 170 * Math.sin(aMid);
         const isRashiHighlighted = (i === rashi1 || i === rashi2);

         return (
           <g key={`r-${i}`}>
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth="1" opacity="0.5" />
             {isRashiHighlighted && <circle cx={xText} cy={yText} r="16" fill="var(--accent-gold)" opacity="0.3" filter="drop-shadow(0 0 5px #ffd700)" />}
             <text x={xText} y={yText} fill={isRashiHighlighted ? "#fff" : "var(--text-main)"} fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" opacity={isRashiHighlighted ? 1 : 0.7} letterSpacing="0.5">{rashi}</text>
           </g>
         )
       })}

       {/* 27 Nakshatras & Sectors */}
       {NAKSHATRAS.map((nak, i) => {
         // Sector line
         const a1 = i * (360/27) * (Math.PI/180);
         const x1 = 250 + 190 * Math.cos(a1), y1 = 250 + 190 * Math.sin(a1);
         const x2 = 250 + 230 * Math.cos(a1), y2 = 250 + 230 * Math.sin(a1);
         
         // Text placement
         const aMidDeg = i * (360/27) + (360/54);
         const aMid = aMidDeg * (Math.PI/180);
         const xText = 250 + 210 * Math.cos(aMid);
         const yText = 250 + 210 * Math.sin(aMid);
         
         // Readability rotation: flip text if it's upside down
         let rot = aMidDeg;
         if (rot > 90 && rot < 270) rot += 180;
         
         return (
           <g key={`n-${i}`}>
             <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-main)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4"/>
             <text x={xText} y={yText} transform={`rotate(${rot}, ${xText}, ${yText})`} fill="var(--text-muted)" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" letterSpacing="0.5">{nak}</text>
           </g>
         )
       })}

       {/* Planets */}
       {ALL.map((pl, i) => {
          const ang = (i * 40 + 15) * (Math.PI/180);
          const r = 125;
          const isHighlighted = (pl === p1 || pl === p2);
          return <g key={pl} transform={`translate(${250+r*Math.cos(ang)}, ${250+r*Math.sin(ang)})`}>
            {isHighlighted ? (
                <>
                <line x1="0" y1="0" x2={25*Math.cos(ang)} y2={25*Math.sin(ang)} stroke="var(--accent-gold)" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
                <circle r="18" fill="var(--accent-gold)" stroke="#fff" strokeWidth="2" filter="drop-shadow(0 0 10px #ffd700)" />
                <text fill="#000" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" dy="1">{pl}</text>
                </>
            ) : (
                <>
                <circle r="12" fill="#2c0b0e" stroke="var(--accent-gold)" strokeWidth="1" opacity="0.4" />
                <text fill="var(--accent-gold)" fontSize="10" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" dy="1" opacity="0.6">{pl}</text>
                </>
            )}
          </g>
       })}
       
       <circle cx="250" cy="250" r="50" fill="var(--accent-gold)" opacity="0.1" />
       <circle cx="250" cy="250" r="10" fill="var(--accent-gold)" />
       <text x="250" y="285" fill="var(--text-muted)" fontSize="10" textAnchor="middle" letterSpacing="1">{t('VEDIC')}</text>
       <text x="250" y="300" fill="var(--text-muted)" fontSize="10" textAnchor="middle" letterSpacing="1">{t('MANDALA')}</text>
    </svg>
  );
};

const InteractionGateway = ({ targetPillar, onSelect, K, t, lang }) => {
  const data = PILLAR_DATA[targetPillar];
  const hue = [...targetPillar].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const heroImg = `https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop`;

  const [prediction, setPrediction] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchPrediction(false);
  }, [targetPillar, data]);

  const fetchPrediction = async (force = false) => {
    const cacheKey = `jyotish_pathway_${targetPillar}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached && JSON.parse(cached).text) {
         setPrediction(JSON.parse(cached).text);
         return;
      }
    }
    
    if (!K) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pathway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentDate: new Date().toString(),
          pathwayName: data.title,
          kundaliData: {
            lagna: { rashi: K.lagna?.rashi, deg: K.lagna?.degFmt },
            planets: K.planets.map(p => ({
              id: p.key, sign: p.rashi, house: p.house, nak: p.nakshatraName
            })),
            dasha: K.dasha ? { maha: K.dasha.maha, antar: K.dasha.antar } : null,
            panchanga: K.panchanga ? {
              tithi: K.panchanga.tithi?.name,
              karana: K.panchanga.karana?.name,
              yoga: K.panchanga.yoga?.name,
              nakshatra: K.panchanga.nakshatra?.name
            } : null,
            ashtakavarga: K.ashtakavarga ? { SAV: K.ashtakavarga.SAV } : null
          }
        })
      });
      const resData = await res.json();
      if(!res.ok) throw new Error(resData.error || 'Failed to sync with pathway matrix.');
      
      setPrediction(resData.prediction);
      localStorage.setItem(cacheKey, JSON.stringify({ text: resData.prediction, timestamp: Date.now() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', padding: '0 0 80px 0', border: '1px solid #4a151b', borderRadius: '8px', overflow: 'hidden' }}>
       {/* 1. Summary Image & Description Panel */}
       <div style={{ position: 'relative', minHeight: '400px', borderBottom: '2px solid var(--border-light)' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-app)' }}></div>
          
          <div className="mobile-hero-padding" style={{ position: 'relative', zIndex: 10, padding: '40px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center', minHeight: '400px', boxSizing: 'border-box' }}>
             <div style={{ flex: '1 1 500px', minWidth: 0 }}>
               <h3 style={{ fontSize: '48px', color: 'var(--accent-gold)', margin: '0 0 16px 0', fontFamily: '"Cinzel", serif', textShadow: '0 4px 20px var(--bg-surface)' }}>{t(data.title)}</h3>
               {loading ? (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                     <span style={{ fontSize: '24px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🪔</span>
                     <span style={{ fontFamily: '"Cinzel", serif', fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase' }}>Synthesizing Pathway Matrix...</span>
                   </div>
               ) : error ? (
                   <div style={{ position: 'relative', marginBottom: '32px' }}>
                     <p style={{ color: 'var(--text-badge-red)', fontSize: '18px', fontFamily: '"Cinzel", serif' }}>⚠️ {error}</p>
                     <button onClick={() => fetchPrediction(true)} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                   </div>
               ) : prediction ? (
                   <div style={{ position: 'relative', marginBottom: '32px' }}>
                     <p style={{ padding: '24px', background: 'var(--bg-surface)', borderLeft: '4px solid #ffd700', color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: 0, fontStyle: 'italic' }}>
                       "{prediction}"
                     </p>
                     <button onClick={() => fetchPrediction(true)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                   </div>
               ) : (
                   <div style={{ position: 'relative', marginBottom: '32px' }}>
                     <p style={{ color: 'var(--text-main)', fontSize: '18px', fontFamily: 'serif', lineHeight: 1.8, textShadow: '0 2px 10px var(--bg-surface)', maxWidth: '800px', margin: 0 }}>
                       This sacred pathway delves deep into the <strong>{data.desc}</strong> of your existence. {data.prompt} By decoding the precise planetary transits and stellar coordinates governing this dimension within your D1 matrix, we unveil the karmic trajectory designed exclusively for you. The ancient Parashari logic binds these 6 potential realities directly to your soul's resonance.
                     </p>
                     <button onClick={() => fetchPrediction(true)} style={{ position: 'absolute', top: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: '32px', height: '32px' }}>⟳</button>
                   </div>
               )}
               <div style={{ display: 'inline-block', background: 'var(--bg-surface)', border: '1px solid #b8860b', padding: '10px 24px', color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                 {data.options.length} {t('Shastric Outcomes Discovered')}
               </div>
             </div>
             
             {/* 2. Ecliptic Visualization */}
             <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: '"Cinzel", serif', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>{t('Stellar Ecliptic Alignment')}</div>
               <EclipticChart hue={hue} pillarId={targetPillar} t={t} />
             </div>
          </div>
       </div>

       {/* 3. 6 Shastric Outcome Cards with Images */}
       <div className="mobile-hero-padding" style={{ padding: '60px 40px 0 40px' }}>
         <h4 style={{ color: 'var(--text-main)', fontSize: '28px', fontFamily: '"Cinzel", serif', textAlign: 'center', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '4px' }}>{t('Select an Outcome to Reveal Prophecy')}</h4>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
           {data.options.map((opt, i) => {
             const cardHue = (hue + (i * 45)) % 360;
             const cardBg = `https://images.unsplash.com/photo-1541698444083-023c97db0e21?w=800&auto=format&fit=crop`;
             return (
               <button 
                 key={opt.id} 
                 onClick={() => onSelect(opt)}
                 style={{ 
                   position: 'relative', height: '240px', overflow: 'hidden', border: '2px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', 
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textDecoration: 'none'
                 }}
                 onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.boxShadow = '0 20px 40px var(--bg-surface), 0 0 20px rgba(255,215,0,0.2)'; e.currentTarget.querySelector('.card-bg').style.transform = 'scale(1.1)'; e.currentTarget.querySelector('.card-bg').style.opacity = '0.8'; }}
                 onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; e.currentTarget.querySelector('.card-bg').style.transform = 'scale(1)'; e.currentTarget.querySelector('.card-bg').style.opacity = '1'; }}
               >
                 <div className="card-bg" style={{ position: 'absolute', inset: 0, background: 'var(--bg-card)', zIndex: 0, transition: 'all 0.6s ease' }}></div>

                 <span style={{ position: 'relative', zIndex: 2, fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))', transition: 'transform 0.3s' }}>{opt.icon}</span>
                 <span style={{ position: 'relative', zIndex: 2, color: 'var(--text-main)', fontSize: '22px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', textShadow: '0 4px 10px var(--bg-surface)', letterSpacing: '1px', textAlign: 'center' }}>
                   {t(opt.label)}
                 </span>
               </button>
             );
           })}
         </div>
       </div>
    </div>
  );
};
const AstrologicalRemedyBox = ({ alert, remedy, t, lang }) => (
  <div style={{ marginTop: '24px', background: 'var(--bg-card)', padding: '24px', border: '2px solid var(--border-light)', boxShadow: '0 10px 30px var(--bg-surface)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
      <span style={{ fontSize: '24px' }}>🕉️</span><h4 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '20px', fontFamily: '"Cinzel", serif' }}>{t('Shastric Mitigation Protocol')}</h4>
    </div>
    {alert && <p style={{ color: 'var(--text-badge-red)', fontSize: '15px', marginBottom: '16px', background: 'rgba(255,0,0,0.1)', padding: '12px', border: '1px solid #ff6b6b' }}><strong>{t('Dosha Identified:')}</strong> {alert}</p>}
    <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: 1.6, margin: 0, fontFamily: 'serif' }}><strong>{t('Prescribed Parihara (Action):')}</strong> {remedy}</p>
  </div>
);

const NorthIndianChartSVG = ({ predText }) => {
  const h = Math.floor(Math.random()*12) + 1;
  const pl = 'Su';
  const centers = [ {x:100,y:50}, {x:50,y:30}, {x:30,y:50}, {x:50,y:100}, {x:30,y:150}, {x:50,y:170}, {x:100,y:150}, {x:150,y:170}, {x:170,y:150}, {x:150,y:100}, {x:170,y:50}, {x:150,y:30} ];

  return (
    <svg width="180" height="180" viewBox="0 0 200 200" style={{background:'#fdf5e6', border:'2px solid #8b0000', padding:'4px'}}>
      <rect x="0" y="0" width="200" height="200" fill="none" stroke="#8b0000" strokeWidth="2"/>
      <line x1="0" y1="0" x2="200" y2="200" stroke="#8b0000" strokeWidth="2"/>
      <line x1="200" y1="0" x2="0" y2="200" stroke="#8b0000" strokeWidth="2"/>
      <line x1="100" y1="0" x2="200" y2="100" stroke="#8b0000" strokeWidth="2"/>
      <line x1="200" y1="100" x2="100" y2="200" stroke="#8b0000" strokeWidth="2"/>
      <line x1="100" y1="200" x2="0" y2="100" stroke="#8b0000" strokeWidth="2"/>
      <line x1="0" y1="100" x2="100" y2="0" stroke="#8b0000" strokeWidth="2"/>
      {centers.map((c, i) => (
        <text key={i} x={c.x} y={c.y} fill="#8b0000" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
          {(i+1)===h ? pl : (i+1)}
        </text>
      ))}
    </svg>
  );
};

const SouthIndianChartSVG = ({ predText }) => {
  const h = Math.floor(Math.random()*12) + 1;
  const pl = 'Su';
  const centers = [ {x:75,y:25}, {x:125,y:25}, {x:175,y:25}, {x:175,y:75}, {x:175,y:125}, {x:175,y:175}, {x:125,y:175}, {x:75,y:175}, {x:25,y:175}, {x:25,y:125}, {x:25,y:75}, {x:25,y:25} ];

  return (
    <svg width="180" height="180" viewBox="0 0 200 200" style={{background:'#fdf5e6', border:'2px solid #8b0000', padding:'4px'}}>
      <rect x="0" y="0" width="200" height="200" fill="none" stroke="#8b0000" strokeWidth="2"/>
      <line x1="0" y1="50" x2="200" y2="50" stroke="#8b0000" strokeWidth="2"/>
      <line x1="0" y1="100" x2="200" y2="100" stroke="#8b0000" strokeWidth="2"/>
      <line x1="0" y1="150" x2="200" y2="150" stroke="#8b0000" strokeWidth="2"/>
      <line x1="50" y1="0" x2="50" y2="200" stroke="#8b0000" strokeWidth="2"/>
      <line x1="100" y1="0" x2="100" y2="200" stroke="#8b0000" strokeWidth="2"/>
      <line x1="150" y1="0" x2="150" y2="200" stroke="#8b0000" strokeWidth="2"/>
      <rect x="52" y="52" width="96" height="96" fill="#fdf5e6" />
      {centers.map((c, i) => (
        <text key={i} x={c.x} y={c.y} fill="#8b0000" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
          {(i+1)===h ? pl : ''}
        </text>
      ))}
    </svg>
  );
};

const AstrologicalBasisBox = ({ chartDesc, pillarId, pred, t, lang }) => {
  return (
    <div style={{ marginTop: '24px', background: 'var(--bg-input)', padding: '24px', border: '1px solid #b8860b', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', background: '#e8d5b5', padding: '16px', borderRadius: '4px' }}>
        <div>
           <div style={{fontSize:'12px', color:'#8b0000', textAlign:'center', marginBottom:'8px', fontWeight:'bold', fontFamily:'"Cinzel"'}}>{t('North Indian format')}</div>
           <NorthIndianChartSVG predText={pred} />
        </div>
        <div>
           <div style={{fontSize:'12px', color:'#8b0000', textAlign:'center', marginBottom:'8px', fontWeight:'bold', fontFamily:'"Cinzel"'}}>{t('South Indian format')}</div>
           <SouthIndianChartSVG predText={pred} />
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>📜</span><h4 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '18px', fontFamily: '"Cinzel"' }}>{t('Panchanga Calculation Basis')}</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '16px', border: '1px solid rgba(184, 134, 11, 0.5)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{t('Primary Varga')}</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '16px' }}>{chartDesc.split(' ')[0]}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '16px', border: '1px solid rgba(184, 134, 11, 0.5)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{t('Panchanga Tithi')}</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '16px' }}>Shukla Navami</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '16px', border: '1px solid rgba(184, 134, 11, 0.5)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>{t('Governing Nakshatra')}</div>
            <div style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '16px' }}>Pushya (Siddhi Yoga)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MandalVisualizer = ({ selectedOpt }) => {
  return (
    <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
       <div style={{ position: 'absolute', width: '220px', height: '220px', borderRadius: '50%', border: '4px dashed #b8860b', animation: 'spin 40s linear infinite' }}></div>
       <div style={{ position: 'absolute', width: '170px', height: '170px', borderRadius: '50%', border: '2px solid #ffd700', animation: 'spin 20s reverse infinite' }}></div>
       <div style={{ position: 'absolute', width: '120px', height: '120px', background: '#8b0000', borderRadius: '50%', boxShadow: '0 0 40px rgba(184, 134, 11, 0.8)' }}></div>
       <div style={{ fontSize: '70px', zIndex: 10, filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.8))' }}>{selectedOpt.icon}</div>
    </div>
  );
};

const ShastricExpander = ({ data, opt, t, lang }) => {
  return (
    <div style={{ marginTop: '32px', color: 'var(--text-main)', fontSize: '16px', lineHeight: 1.8, borderTop: '2px solid var(--border-light)', paddingTop: '24px', fontFamily: 'serif' }}>
      <p style={{ marginBottom: '16px' }}>
        <strong style={{color:'var(--accent-gold)'}}>{t('Shastric Synthesis:')}</strong> Upon rigorous examination of the <em>{data.desc}</em> framework regarding <strong>{opt.label.toLowerCase()}</strong>, the karmic unfoldment is unambiguous. The celestial bodies establish a critical temporal vibration affecting the relevant Bhava within your D1 matrix.
      </p>
      <p style={{ marginBottom: '16px' }}>
        According to the foundational geometric tenets of Brihat Parashara Hora Shastra, when the Grahas align in this specific configuration relative to the primary Varga matrix, the karmic ledger is activated. This precise dimensional alignment creates an unavoidable channel for the results of past-life (Sanchita) karma to manifest in the current timeline.
      </p>
      <p style={{ margin: 0 }}>
        {t('The Oracle reveals: ')}<em>"{opt.pred}"</em> Therefore, this transit cannot be bypassed purely through willpower. Strict, unwavering adherence to the prescribed remedial protocol is the only mechanism that will actively alter the trajectory of this event within the boundaries of Dharma.
      </p>
    </div>
  );
};

const StandardPillarView = ({ pillarId, K, partnerKundali, t, lang }) => {
  const [opt, setOpt] = useState(null);

  React.useEffect(() => {
    const el = document.getElementById('mock-dashboard-top');
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, [opt, pillarId]);
  const data = PILLAR_DATA[pillarId];

  if(!opt) return <InteractionGateway targetPillar={pillarId} onSelect={setOpt} K={K} t={t} lang={lang} />;

  return (
    <div className="responsive-grid-2" style={{ alignItems: 'start' }}>
       <div style={{ background: 'var(--bg-input)', padding: '40px', border: '2px solid var(--border-light)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
         <MandalVisualizer selectedOpt={opt} />
         <ShastricExpander data={data} opt={opt} t={t} lang={lang} />
       </div>
       <div>
         <div style={{ display: 'inline-block', background: 'var(--bg-card)', color: 'var(--accent-gold)', padding: '8px 16px', border: '1px solid #ffd700', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{t('Subject: ')} {t(opt.label)}</div>
         <h3 style={{ color: 'var(--text-main)', fontSize: '30px', marginTop: 0, marginBottom: '24px', lineHeight: 1.3, fontFamily: '"Cinzel", serif', textShadow: '0 2px 4px var(--bg-surface)' }}>{t(data.title)} {t('Oracle Activated')}</h3>
         
         <div style={{ background: 'var(--bg-input)', padding: '24px', borderLeft: '4px solid #ffd700', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
           <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <span style={{ fontSize: '18px' }}>👁️</span> {t('Prophetic Unfoldment')}
           </div>
           <p style={{ color: 'var(--text-main)', fontSize: '18px', lineHeight: 1.7, margin: 0, fontFamily: 'serif' }}>{opt.pred}</p>
         </div>

         <AstrologicalBasisBox chartDesc={data.desc} pillarId={pillarId} pred={opt.pred} t={t} lang={lang} />
         <AstrologicalRemedyBox remedy={opt.rem} alert={opt.pred.includes('afflict') || opt.pred.includes('debilitated') || opt.pred.includes('danger') ? t("Malefic vibration detected.") : null} t={t} lang={lang} />
          {/* 4. Native Dependency Component Injection (Synastry Engine) */}
          {partnerKundali && (pillarId === 'vivaha' || pillarId === 'dhana' || pillarId === 'dharma' || pillarId === 'arogya' || pillarId === 'muhurta') && (
            <div style={{ marginTop: '24px', background: 'rgba(255,215,0,0.05)', padding: '24px', border: '1px solid var(--accent-gold)', borderRadius: '8px', borderLeft: '6px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              <div style={{ color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', fontFamily: '"Cinzel", serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>💞</span> {t('Synastry Oracle Alignment: ')} {partnerKundali.name || t('Partner')}
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: 1.7, margin: 0, fontFamily: 'serif', fontStyle: 'italic' }}>
                {pillarId === 'vivaha' && "The combined planetary gravity of both charts indicates deep karmic debt resolution in this cycle. Joint communication must be carefully guarded on Tuesdays during Mars Hora."}
                {pillarId === 'dhana' && "Shared planetary energies indicate massive financial growth when liquid assets are pooled. The partner's Jupiter strongly trines your primary wealth axis, guaranteeing dual prosperity."}
                {pillarId === 'dharma' && "Spiritual paths diverge slightly under Rahu's influence, demanding extreme intellectual patience, but core moral philosophies remain perfectly bonded by the Sun."}
                {pillarId === 'arogya' && "The partner's lunar placement provides enormous ambient emotional healing to your nervous system. Vata dosha spikes are passively neutralized by their presence."}
                {pillarId === 'muhurta' && "Auspicious timings must now calculate both Moon signs (Chandra Bala). Your partner's lunar chart subtly delays the current window of absolute perfection by 48 hours."}
              </p>
            </div>
          )}
       </div>
    </div>
  );
};

const FullScreenWrapper = ({ title, onBack, children, t, lang }) => (
  <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
    <button onClick={onBack} style={{ background: 'var(--bg-card)', color: 'var(--accent-gold)', border: '1px solid #ffd700', padding: '12px 28px', cursor: 'pointer', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', fontFamily: '"Cinzel", serif', transition:'all 0.2s', textTransform:'uppercase' }} onMouseOver={e=>{e.currentTarget.style.background='var(--bg-input)'}} onMouseOut={e=>{e.currentTarget.style.background='var(--bg-card)'}}>
      {t('← Return to Main Mandala')}
    </button>
    <div style={{ background: 'var(--bg-card)', border: '2px solid var(--border-light)', padding: '2px' }}>
      <div className="mobile-hero-padding" style={{ border: '1px dashed rgba(184, 134, 11, 0.5)', padding: '60px' }}>{children}</div>
    </div>
  </div>
);

// ==========================================
// 3. MAIN DASHBOARD AGGREGATOR
// ==========================================
export const MockDashboard = ({ onOpenJyotishDesk, user, onRequireLogin, K, partnerKundali, t, lang }) => {
  const [activeTime, setActiveTime] = useState('This Masa (Month)');
  const [activeView, setActiveView] = useState('grid'); 

  if (activeView !== 'grid') {
    const data = PILLAR_DATA[activeView];
    return (
      <div id="mock-dashboard-top" style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 24px' }}>
        <FullScreenWrapper title={`${data.icon} ${t(data.title)}`} onBack={() => setActiveView('grid')} t={t} lang={lang}>
          <StandardPillarView pillarId={activeView} K={K} partnerKundali={partnerKundali} t={t} lang={lang} />
        </FullScreenWrapper>
      </div>
    );
  }

  return (
    <div id="mock-dashboard-top" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', fontFamily: 'serif', paddingBottom: '140px', background: 'var(--bg-app)', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid var(--border-light)', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '42px', margin: 0, fontFamily: '"Cinzel", serif', color: 'var(--accent-gold)', textShadow: '0 2px 4px var(--bg-surface)' }}>{t('Life Paths')}</h2>
          {partnerKundali && (
            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--accent-gold)', padding: '6px 12px', borderRadius: '4px', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💞</span> {t('Synastry Active')}
            </div>
          )}
        </div>
        <button onClick={onOpenJyotishDesk} style={{background:'var(--accent-gold)', border:'none', color:'var(--bg-app)', padding:'12px 28px', cursor:'pointer', borderRadius:'4px', fontFamily:'"Cinzel", serif', fontSize:'16px', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s', textTransform:'uppercase', letterSpacing:'1px', whiteSpace:'nowrap', boxShadow: '0 4px 15px rgba(255,215,0,0.4)'}} onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(255,215,0,0.6)'}} onMouseOut={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 15px rgba(255,215,0,0.4)'}}>
          {t('Reveal Kundali ➔')}
        </button>
      </div>
      <MandalaHero activeTime={activeTime} setActiveTime={setActiveTime} K={K} t={t} lang={lang} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {Object.entries(PILLAR_DATA).map(([key, data]) => (
          <div 
            key={key} onClick={() => { 
              if(!user) { onRequireLogin(); return; }
              setActiveView(key); 
              setTimeout(() => {
                const el = document.getElementById('mock-dashboard-top');
                if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
                else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
              }, 50); 
            }}
            style={{ background: 'var(--bg-input)', padding: '36px 24px', border: '1px solid #b8860b', cursor: 'pointer', transition: 'all 0.3s', position:'relative', overflow:'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 0 10px var(--bg-surface)' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.boxShadow = '0 10px 30px var(--bg-surface), inset 0 0 10px var(--bg-surface)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.boxShadow = 'inset 0 0 10px var(--bg-surface)'; }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '140px', opacity: 0.03, pointerEvents: 'none' }}>{data.icon}</div>
            <div style={{ fontSize: '50px', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(255,215,0,0.3))' }}>{data.icon}</div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', color: 'var(--accent-gold)', fontFamily: '"Cinzel", serif' }}>{t(data.title)}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontFamily: 'sans-serif' }}>{t(data.desc)}</div>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', lineHeight: 1.6, flexGrow: 1 }}>{data.options.length} {t('Shastric Outcomes')}</p>
            <div style={{ marginTop: '24px', color: 'var(--accent-gold)', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"Cinzel", serif', textTransform: 'uppercase' }}>
              {t('Consult Oracle →')}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};
