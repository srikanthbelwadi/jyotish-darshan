import re

with open('src/App.jsx', 'r') as f:
    text = f.read()

# Replace all forms of K.divCharts[...] with (K.divCharts || K.divisionalCharts)[...]
# But exclude the ones we already patched like (K.divCharts?.D9 || K.divisionalCharts?.D9)
text = re.sub(r'K\.divCharts\[(v|exp)\]', r'(K.divCharts || K.divisionalCharts)[\1]', text)

with open('src/App.jsx', 'w') as f:
    f.write(text)

print("divCharts arrays fixed!")
