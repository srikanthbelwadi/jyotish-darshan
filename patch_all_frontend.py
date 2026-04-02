import re
import os

files_to_patch = [
    'src/App.jsx',
    'src/components/tabs/ExpertReadingTab.jsx',
    'src/components/pdf/PrintLayout.jsx'
]

for filepath in files_to_patch:
    with open(filepath, 'r') as f:
        text = f.read()
    
    text = text.replace('.startStr', '.start')
    text = text.replace('.endStr', '.end')
    
    with open(filepath, 'w') as f:
        f.write(text)

print("Patched startStr/endStr across frontend files!")
