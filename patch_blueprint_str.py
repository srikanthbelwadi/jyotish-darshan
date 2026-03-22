import sys

with open('src/App.jsx', 'r') as f:
    code = f.read()

# Update English
code = code.replace("en:{newChart:'New Chart',", "en:{newChart:'Make New Blueprint',deleteProfile:'Delete Profile',")
# Update Hindi
code = code.replace("hi:{newChart:'नया चार्ट',", "hi:{newChart:'नया ब्लूप्रिंट बनाएं',deleteProfile:'प्रोफ़ाइल हटाएं',")
# Update Kannada
code = code.replace("kn:{newChart:'ಹೊಸ ಚಾರ್ಟ್',", "kn:{newChart:'ಹೊಸ ಬ್ಲೂಪ್ರಿಂಟ್ ರಚಿಸಿ',deleteProfile:'ಪ್ರೊಫೈಲ್ ಅಳಿಸಿ',")
# Update Telugu
code = code.replace("te:{newChart:'కొత్త చార్ట్',", "te:{newChart:'కొత్త బ్లూప్రింట్ సృష్టించు',deleteProfile:'ప్రొఫైల్ తొలగించు',")
# Update Tamil
code = code.replace("ta:{newChart:'புதிய விளக்கப்படம்',", "ta:{newChart:'புதிய ப்ளூபிரிண்ட் உருவாக்கு',deleteProfile:'சுயவிவரத்தை நீக்கு',")
# Update Sanskrit
code = code.replace("sa:{newChart:'नया चार्ट',", "sa:{newChart:'नूतनं ब्लूप्रिन्ट् रचयतु',deleteProfile:'प्रोफाइलमपनयतु',")
# Update Marathi
code = code.replace("mr:{newChart:'नवीन चार्ट',", "mr:{newChart:'नवीन ब्लूप्रिंट तयार करा',deleteProfile:'प्रोफाइल हटवा',")
# Update Gujarati
code = code.replace("gu:{newChart:'નવો ચાર્ટ',", "gu:{newChart:'નવો બ્લુપ્રિન્ટ બનાવો',deleteProfile:'પ્રોફાઇલ કાઢી નાખો',")
# Update Bengali
code = code.replace("bn:{newChart:'নতুন চার্ট',", "bn:{newChart:'নতুন ব্লুপ্রিন্ট তৈরি করুন',deleteProfile:'প্রোফাইল মুছুন',")
# Update Malayalam
code = code.replace("ml:{newChart:'പുതിയ ചാർട്ട്',", "ml:{newChart:'പുതിയ ബ്ലൂപ്രിന്റ് ഉണ്ടാക്കുക',deleteProfile:'പ്രൊഫൈൽ ഇല്ലാതാക്കുക',")

with open('src/App.jsx', 'w') as f:
    f.write(code)

print("Translation patch complete.")
