import re

# PATCH BACKEND (Fallback counting)
backend_files = ['api/oracle.js', 'api/pathway.js', 'api/muhurat.js']
for path in backend_files:
    with open(path, 'r') as f:
        content = f.read()
    
    # We want to replace standard usageMetadata extraction with a robust fallback
    content = re.sub(
        r'const tokenCount = result\.response\?\.usageMetadata\?\.totalTokenCount \|\| 0;',
        '''let tokenCount = result.response?.usageMetadata?.totalTokenCount || 0;
    if (tokenCount === 0) {
        // Fallback approximate pricing if Gemini SDK drops usageMetadata
        const inputLen = systemPrompt ? systemPrompt.length : (prompt ? prompt.length : 1000);
        const outputLen = parsedPrediction ? JSON.stringify(parsedPrediction).length : (output ? output.length : 500);
        tokenCount = Math.ceil(inputLen / 3.5) + Math.ceil(outputLen / 3.5);
    }''',
        content
    )
    
    with open(path, 'w') as f:
        f.write(content)

# PATCH FRONTEND (Error logging)
frontend_files = ['src/components/dashboard/MandalaHero.jsx', 'src/components/dashboard/InteractionGateway.jsx', 'src/components/tabs/MuhuratPlanner.jsx']
for path in frontend_files:
    with open(path, 'r') as f:
        content = f.read()

    content = content.replace('} catch(e) {}', '} catch(e) { console.error("CPO TELEMETRY ERROR:", e); }')
    
    # Also log the incoming tokens just so we can see them if we want
    content = content.replace('if (data.tokenCount && user) {', 'if (data.tokenCount && user) {\n         console.log("CPO TELEMETRY FIRING:", data.tokenCount);')
    
    with open(path, 'w') as f:
        f.write(content)

print("Patch applied.")
