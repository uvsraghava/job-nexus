const fs = require('fs');
const axios = require('axios'); // [NEW] Needed to download file from Cloudinary URL
const pdf = require('pdf-parse'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResume = async (fileInput, jobDescription) => {
  try {
    console.log(`[AI] 1. Processing File...`);

    let dataBuffer;

    // --- STEP A: SMART BUFFER LOADING ---
    // Check if input is a Cloudinary URL (starts with http) or a Local Path
    if (fileInput.startsWith('http')) {
        console.log(`[AI] Detected Cloud URL. Fetching content...`);
        const response = await axios.get(fileInput, { responseType: 'arraybuffer' });
        dataBuffer = response.data;
    } else {
        console.log(`[AI] Detected Local Path. Reading from disk...`);
        dataBuffer = fs.readFileSync(fileInput);
    }

    // --- STEP B: EXTRACT TEXT ---
    let resumeText = "";
    try {
        const data = await pdf(dataBuffer);
        resumeText = data.text;
    } catch (parseError) {
        console.error("[PDF Parse Error]", parseError);
        return { score: 0, reason: "PDF File is corrupted or unreadable." };
    }

    // Safety Check
    if (!resumeText || resumeText.trim().length < 50) {
        return { score: 10, reason: "Could not extract text. Ensure resume is a text PDF." };
    }

    console.log(`[AI] 2. Text Extracted (${resumeText.length} chars). Sending to Gemini...`);

    // --- STEP C: SEND TEXT TO GEMINI ---
    // Using gemini-flash-latest as configured
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      Act as an expert Recruiter. Analyze the following RESUME TEXT.
      
      RESUME TEXT:
      ${resumeText.slice(0, 15000)} 
      (Truncated if too long)

      Task:
      1. Score the resume (0-100) based on quality, clarity, and metrics.
      2. Provide a 1-sentence feedback summary.

      Output ONLY a raw JSON object (no markdown) with this structure:
      { "score": number, "reason": "string" }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean Markdown formatting
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    console.log(`[AI] 3. Success! Score: ${cleanJson}`);
    
    try {
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return { score: 0, reason: "AI returned invalid format." };
    }

  } catch (error) {
    console.error("________________________________________");
    console.error("[AI CRITICAL ERROR]");
    console.error(error.message); 
    console.error("________________________________________");
    
    return { score: 0, reason: "AI Service Error. Check server logs." };
  }
};

module.exports = { analyzeResume };