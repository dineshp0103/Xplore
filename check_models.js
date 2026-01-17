const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

let finalApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!finalApiKey && fs.existsSync('.env.local')) {
    const envConfig = fs.readFileSync('.env.local', 'utf8');
    const match = envConfig.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match) {
        finalApiKey = match[1].trim();
    }
}

if (!finalApiKey) {
    console.error("Could not find NEXT_PUBLIC_GEMINI_API_KEY in process.env or .env.local");
    process.exit(1);
}

console.log("API Key found. Length:", finalApiKey.length);

const genAI = new GoogleGenerativeAI(finalApiKey);

// Clear results file
fs.writeFileSync('model_results.txt', '');

async function testModel(modelName) {
    console.log(`Testing ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello?");
        const response = await result.response;
        const msg = `✅ ${modelName} is WORKING.\n`;
        console.log(msg);
        fs.appendFileSync('model_results.txt', msg);
        return true;
    } catch (error) {
        const msg = `❌ ${modelName} FAILED: ${error.message}\n`;
        console.log(msg);
        if (error.response) {
            console.log("Response:", JSON.stringify(error.response, null, 2));
        }
        fs.appendFileSync('model_results.txt', msg);
        return false;
    }
}

async function main() {
    console.log("Checking commonly used models...");

    // Candidates
    const candidates = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-pro"
    ];

    for (const model of candidates) {
        await testModel(model);
    }
}

main();
