import re

with open('src/App.jsx', 'r') as f:
    text = f.read()

# 1. Save to sessionStorage
text = text.replace(
    "if(e.message === 'AUTH_REQUIRED') {\n        setShowAuthModal(true);",
    "if(e.message === 'AUTH_REQUIRED') {\n        sessionStorage.setItem('pendingKundaliFetch', JSON.stringify(inp));\n        setShowAuthModal(true);"
)

# 2. Pick it up on user auth
auto_resume = """
  React.useEffect(() => {
    if (user) {
      const pending = sessionStorage.getItem('pendingKundaliFetch');
      if (pending) {
        sessionStorage.removeItem('pendingKundaliFetch');
        try {
          const inp = JSON.parse(pending);
          handleSubmit(inp);
        } catch(e) {}
      }
    }
  }, [user]);

  React.useEffect(()=>{
"""

text = text.replace("  React.useEffect(()=>{\n    let mounted = true;", auto_resume + "    let mounted = true;")

with open('src/App.jsx', 'w') as f:
    f.write(text)

print("Added auto-resume logic!")
