const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Checking available models for your API key...");
    // For the older SDK/v1beta, we sometimes need to list models differently,
    // but let's try getting a standard model and checking if it runs.
    
    // Attempt to list models (if SDK supports it directly via a method, otherwise we test strict names)
    // Note: The Node SDK generic listModels might not be exposed easily in all versions, 
    // so we will test the 3 most common names.

    const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        console.log(`✅ SUCCESS: '${modelName}' is working!`);
        console.log(`   Response: ${result.response.text()}`);
        return; // Stop after finding the first working one
      } catch (error) {
        console.log(`❌ FAILED: '${modelName}' - ${error.message.split(' ')[0]}...`);
      }
    }
    console.log("!!! All common model names failed. Check your API Key permissions.");

  } catch (err) {
    console.error("Script Error:", err);
  }
}

listModels();