import os

filepath = "src/components/tabs/MockDashboard.jsx"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Add state variable
if "const [isMinimized" not in text:
    old_state = "  const [error, setError] = React.useState(null);"
    new_state = "  const [error, setError] = React.useState(null);\n  const [isMinimized, setIsMinimized] = React.useState(false);"
    text = text.replace(old_state, new_state)

# 2. Reset on fetch
if "setIsMinimized(false);" not in text:
    old_loading = "    setLoading(true);\n    setError(null);"
    new_loading = "    setLoading(true);\n    setError(null);\n    setIsMinimized(false);"
    text = text.replace(old_loading, new_loading)

# 3. Quick patch for time scale selection buttons so they immediately expand if minimized and swapped
old_btn = "onClick={() => setActiveTime(ts)}"
new_btn = "onClick={() => { setActiveTime(ts); setIsMinimized(false); }}"
text = text.replace(old_btn, new_btn)

old_select = "onChange={(e) => setActiveTime(e.target.value)}"
new_select = "onChange={(e) => { setActiveTime(e.target.value); setIsMinimized(false); }}"
text = text.replace(old_select, new_select)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)

print("MockDashboard patched!")
