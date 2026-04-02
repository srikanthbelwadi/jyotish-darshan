import re

# 1. SyncContext getRedirectResult
with open('src/contexts/SyncContext.jsx', 'r') as f:
    text = f.read()

text = text.replace(
    "import { onAuthStateChanged } from 'firebase/auth';",
    "import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';"
)

text = text.replace(
    "if (typeof auth === 'undefined' || !auth) return;",
    "if (typeof auth === 'undefined' || !auth) return;\n    getRedirectResult(auth).catch(e => console.error('Redirect error', e));"
)

with open('src/contexts/SyncContext.jsx', 'w') as f:
    f.write(text)

# 2. AuthModal wait bypass
with open('src/components/AuthModal.jsx', 'r') as f:
    text = f.read()

text = text.replace(
    "const result = await signInWithGooglePopup();\n      const user = result.user;\n      onLogin({ \n        name: user.displayName || 'Seeker', \n        email: user.email, \n        photoURL: user.photoURL,\n        method: 'google' \n      });",
    "await signInWithGooglePopup();\n       // Flow is handed to browser redirect. No further execution here."
)

with open('src/components/AuthModal.jsx', 'w') as f:
    f.write(text)

print("Redirect fixes fully applied!")
