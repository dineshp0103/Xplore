const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Check for BOM
    if (content.charCodeAt(0) === 0xFEFF) {
        console.log("BOM found. Removing...");
        content = content.substring(1);
        fs.writeFileSync(envPath, content, 'utf8');
        console.log("BOM removed and file saved.");
    } else {
        console.log("No BOM found.");
    }
} catch (e) {
    console.error("Error:", e.message);
}
