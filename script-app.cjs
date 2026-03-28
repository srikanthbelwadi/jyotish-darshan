const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Initial State
content = content.replace("const [dashboardMode, setDashboardMode] = React.useState('gateway');", "const [dashboardMode, setDashboardMode] = React.useState('kundali');");

// 2. Erase the massive dashboardMode === 'gateway' block!
// Since it's huge, I'll use a regex that matches the start of the gateway block and deletes until the start of dashboardMode === 'kundali'.
// Let's check the exact string:
const gatewayRegex = /\{\/\* ==========================================\s*\*\/\}\s*\{\/\* 4\. GATEWAY \/ SELECTION SCREEN\s*\*\/\}\s*\{\/\* ==========================================\s*\*\/\}\s*\{dashboardMode === 'gateway' && \([\s\S]*?\)\}\s*\{\/\* ==========================================\s*\*\/\}\s*\{\/\* 5\. KUNDALI DESK \(TECHNICAL ARSENAL\)\s*\*\/\}\s*\{\/\* ==========================================\s*\*\/\}/m;

// If the comment blocks aren't exactly like that, I will just match {dashboardMode === 'gateway' && (...)} 
// But a safer way is just to replace the `dashboardMode === 'gateway'` render block manually via strings.
// Let's look exactly at the file lines via view_file first.
