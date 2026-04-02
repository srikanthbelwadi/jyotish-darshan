import json

with open('vercel.json', 'r') as f:
    config = json.load(f)

config['headers'] = [
    {
        "source": "/(.*)",
        "headers": [
            {
                "key": "Cross-Origin-Opener-Policy",
                "value": "same-origin-allow-popups"
            }
        ]
    }
]

with open('vercel.json', 'w') as f:
    json.dump(config, f, indent=2)

print("Patched vercel.json successfully!")
