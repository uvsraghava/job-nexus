require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ NO API KEY FOUND. Check your .env file.");
  process.exit(1);
}

// Direct URL to ask Google for the list
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔍 Querying Google API for available models...");

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
        console.error("❌ API Error:", data.error.message);
    } else if (data.models) {
        console.log("\n✅ SUCCESS! You have access to these models:");
        console.log("------------------------------------------------");
        data.models.forEach(m => {
            // Only show models that can generate text/content
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                 console.log(`👉 ${m.name.replace('models/', '')}`);
            }
        });
        console.log("------------------------------------------------");
        console.log("Pick one of the names above for your ai.js file.");
    } else {
        console.log("⚠️ Unexpected response:", data);
    }
  })
  .catch(err => console.error("❌ Network Error:", err));