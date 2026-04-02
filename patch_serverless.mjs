import fs from 'fs';

const FILE = 'src/App.jsx';
let content = fs.readFileSync(FILE, 'utf-8');

// 1. Delete the colossal math block (lines 20-363 approx) (DONE MANUALLY)
// 2. Inject the async fetchKundali adapter at the top level (DONE MANUALLY)

// 3. DailyPanchang: Convert to async useEffect
content = content.replace(
  /const K=computeKundali\(\{year:now\.getUTCFullYear\(\)(.*?)\}\);/g,
  `// Replaced by async fetch
      fetchKundali({year:now.getUTCFullYear()$1}, null, true).then(K => setPanchang(K.panchang)).catch(e => console.error("Panchang load failed", e));
      return;`
);
content = content.replace(/setPanchang\(K\.panchang\);/, '');

// 4. Partner Generation in App.jsx (onGeneratePartner)
content = content.replace(
  /const pk = computeKundali\(inputParams\);/g,
  `const pk = await fetchKundali(inputParams, user);`
);
// Make the handler async
content = content.replace(
  /const handleGeneratePartner = \(inputParams\) => {/,
  `const handleGeneratePartner = async (inputParams) => {`
);

// 5. Initial generation from localStorage / profiles (validProfiles)
content = content.replace(
  /setKundali\(computeKundali\(validProfiles\[0\]\)\);/g,
  `fetchKundali(validProfiles[0], user).then(k => setKundali(k)).catch(e => {
        if(e.message==='AUTH_REQUIRED') { setShowAuthModal(true); setKundali(null); }
      });`
);

// 6. Sync profile restoration
content = content.replace(
  /setKundali\(computeKundali\(syncRequestedProfile\)\);/g,
  `fetchKundali(syncRequestedProfile, user).then(k => setKundali(k)).catch(e => {
        if(e.message==='AUTH_REQUIRED') { setShowAuthModal(true); setKundali(null); }
      });`
);

// 7. Form Submission (handleSubmit)
content = content.replace(
  /const handleSubmit = \(inp\) => \{/,
  `const handleSubmit = async (inp) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }`
);
content = content.replace(
  /setKundali\(computeKundali\(inp\)\);/,
  `try {
        const k = await fetchKundali(inp, user);
        setKundali(k);
      } catch(e) {
        if(e.message==='AUTH_REQUIRED') setShowAuthModal(true);
        else alert("Failed to generate birth chart from celestial cloud.");
      }`
);

fs.writeFileSync(FILE, content);
console.log("App.jsx successfully refactored for Vercel Serverless IP Protection.");
