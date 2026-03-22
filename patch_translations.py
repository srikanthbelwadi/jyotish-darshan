import sys

with open('src/App.jsx', 'r') as f:
    code = f.read()

# 1. Update English
code = code.replace("en:{newChart:'New Chart',", "en:{newChart:'New Chart',fullName:'Full Name',namePlaceholder:'Enter name (e.g. Rahul)...',")
# 2. Update Hindi
code = code.replace("hi:{newChart:'नया चार्ट',", "hi:{newChart:'नया चार्ट',fullName:'पूरा नाम',namePlaceholder:'नाम दर्ज करें (उदा. राहुल)...',")
# 3. Update Kannada
code = code.replace("kn:{newChart:'ಹೊಸ ಚಾರ್ಟ್',", "kn:{newChart:'ಹೊಸ ಚಾರ್ಟ್',fullName:'ಪೂರ್ಣ ಹೆಸರು',namePlaceholder:'ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಉದಾ. ರಾಹುಲ್)...',")
# 4. Update Telugu
code = code.replace("te:{newChart:'కొత్త చార్ట్',", "te:{newChart:'కొత్త చార్ట్',fullName:'పూర్తి పేరు',namePlaceholder:'పేరు నమోదు చేయండి (ఉదా. రాహుల్)...',")
# 5. Update Tamil
code = code.replace("ta:{newChart:'புதிய விளக்கப்படம்',", "ta:{newChart:'புதிய விளக்கப்படம்',fullName:'முழு பெயர்',namePlaceholder:'பெயரை உள்ளிடவும் (உதா. ராகுல்)...',")
# 6. Update Sanskrit
code = code.replace("sa:{newChart:'नया चार्ट',", "sa:{newChart:'नया चार्ट',fullName:'पूर्ण नाम',namePlaceholder:'नाम प्रविशतु (उदा. राहुल)...',")
# 7. Update Marathi
code = code.replace("mr:{newChart:'नवीन चार्ट',", "mr:{newChart:'नवीन चार्ट',fullName:'पूर्ण नाव',namePlaceholder:'नाव प्रविष्ट करा (उदा. राहुल)...',")
# 8. Update Gujarati
code = code.replace("gu:{newChart:'નવો ચાર્ટ',", "gu:{newChart:'નવો ચાર્ટ',fullName:'પૂરું નામ',namePlaceholder:'નામ દાખલ કરો (દા.ત. રાહુલ)...',")
# 9. Update Bengali
code = code.replace("bn:{newChart:'নতুন চার্ট',", "bn:{newChart:'নতুন চার্ট',fullName:'পূর্ণ নাম',namePlaceholder:'নাম লিখুন (উদাঃ রাহুল)...',")
# 10. Update Malayalam
code = code.replace("ml:{newChart:'പുതിയ ചാർട്ട്',", "ml:{newChart:'പുതിയ ചാർട്ട്',fullName:'പൂർണ്ണ നാമം',namePlaceholder:'പേര് നൽകുക (ഉദാ. രാഹുൽ)...',")


# Fix the input form to use translation keys instead of hardcoded 'Full Name'
# First, locate the Full Name label
target_label = '<label style={LS}>Full Name</label>'
new_label = '<label style={LS}>{t("fullName",lang)}</label>'
code = code.replace(target_label, new_label)

# Locate the placeholder
target_placeholder = 'placeholder="Enter name (e.g. Rahul)..."'
new_placeholder = 'placeholder={t("namePlaceholder",lang)}'
code = code.replace(target_placeholder, new_placeholder)

# Now, implement the 'Delete All Profiles' capability inside ResultsPage or App.jsx
# we need a function to completely clear local storage securely.
# Let's add it right before `return(` in App.jsx
# Wait, actually we can just add a button in the Action Bar header of the Results page.

# Wait, the user wanted:
# 2. "Your Cosmic Blue Print" to be Full Name
target_header = '<h2 className="serif" style={{color:\'var(--accent-gold)\',margin:\'0 0 10px\',fontSize:26}}>\n                Your Cosmic Blueprint — {nakName}\n              </h2>'
new_header = '<h2 className="serif" style={{color:\'var(--accent-gold)\',margin:\'0 0 10px\',fontSize:26}}>\n                {profileData.name||"Your Cosmic Blueprint"} — {nakName}\n              </h2>'
code = code.replace(target_header, new_header)

# Wait, is `profileData` available there? Yes, the Active profile is `data` in `App.jsx`, wait.
# the ResultPage takes `data` as prop. Let's see how the header is rendered.
# I will use another python script to handle the header and action bar.

with open('src/App.jsx', 'w') as f:
    f.write(code)

print("Patching complete.")
