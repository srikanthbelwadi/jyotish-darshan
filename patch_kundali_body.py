import re

with open('api/kundali.js', 'r') as f:
    text = f.read()

new_body_logic = """  let rawBody = req.body;
  if (Buffer.isBuffer(rawBody)) {
    rawBody = rawBody.toString('utf8');
  }
  let parsedBody = {};
  if (typeof rawBody === 'string') {
    try { parsedBody = JSON.parse(rawBody); } catch(e) {}
  } else if (rawBody) {
    parsedBody = rawBody;
  }"""

text = re.sub(
    r"  let parsedBody = \{\};\n  if \(typeof req\.body === 'string'\) \{\n    try \{ parsedBody = JSON\.parse\(req\.body\); \} catch\(e\) \{\}\n  \} else if \(req\.body\) \{\n    parsedBody = req\.body;\n  \}",
    new_body_logic,
    text,
    count=1,
    flags=re.DOTALL
)

with open('api/kundali.js', 'w') as f:
    f.write(text)

print("Patched api/kundali.js body parsing!")
