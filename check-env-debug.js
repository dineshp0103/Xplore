const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');

console.log("First 10 chars code points:", content.substring(0, 10).split('').map(c => c.charCodeAt(0)));
console.log("Starts with BOM?", content.charCodeAt(0) === 0xFEFF);

const lines = content.split('\n');
console.log("First line:", lines[0]);

// Simulate basic parsing
const firstLine = lines[0].trim();
if (firstLine.startsWith('NEXT_PUBLIC_FIREBASE_API_KEY')) {
    console.log("First line key match: YES");
} else {
    console.log("First line key match: NO");
}
