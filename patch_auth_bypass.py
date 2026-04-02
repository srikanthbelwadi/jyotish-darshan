import re

# 1. App.jsx url patch
with open('src/App.jsx', 'r') as f:
    text = f.read()

text = text.replace(
    "const res = await fetch('/api/kundali', {",
    "const url = isPanchang ? '/api/kundali?panchang=1' : '/api/kundali';\n  const res = await fetch(url, {"
)

with open('src/App.jsx', 'w') as f:
    f.write(text)


# 2. api/kundali.js query string read
with open('api/kundali.js', 'r') as f:
    text = f.read()

text = text.replace(
    "if (!token && !parsedBody.isPanchang)",
    "if (!token && !parsedBody.isPanchang && req.query?.panchang !== '1')"
)
text = text.replace(
    "else if (!token && !parsedBody.isPanchang) {",
    "else if (!token && !parsedBody.isPanchang && req.query?.panchang !== '1') {"
)

with open('api/kundali.js', 'w') as f:
    f.write(text)


# 3. firebase.js proxy export
with open('src/firebase.js', 'r') as f:
    text = f.read()

text = text.replace("signInWithPopup(auth, googleProvider)", "signInWithRedirect(auth, googleProvider)")
text = text.replace("signInWithPopup }", "signInWithRedirect }")

with open('src/firebase.js', 'w') as f:
    f.write(text)

print("Patch script executed fully!")
