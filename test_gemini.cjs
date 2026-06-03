const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prompt = `Estimate the driving distance and travel time from 'New York' to 'Washington, DC'. 
Return the result STRICTLY as a JSON object with this exact structure, no markdown, no backticks:
{
  "time": "e.g., 15 mins",
  "distance": "e.g., 4 km"
}`;
ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt })
  .then(res => console.log(res.text))
  .catch(console.error);
