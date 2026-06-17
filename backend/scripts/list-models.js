require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.error('ERROR: GEMINI_API_KEY is not configured in backend/.env');
    return;
  }

  console.log(`Using API Key starting with: ${apiKey.substring(0, 10)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Testing generateContent with gemini-1.5-flash (forced apiVersion: v1)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
    const result = await model.generateContent('Hello, are you active?');
    const text = result.response.text();
    console.log(`SUCCESS with gemini-1.5-flash (v1)! Response: ${text.trim()}`);
  } catch (err) {
    console.error('Error with gemini-1.5-flash (v1):', err.message);
    
    console.log('\nTesting generateContent with gemini-1.5-flash (forced apiVersion: v1beta)...');
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1beta' });
      const result = await model.generateContent('Hello, are you active?');
      console.log(`SUCCESS with gemini-1.5-flash (v1beta)! Response: ${result.response.text().trim()}`);
    } catch (err2) {
      console.error('Error with gemini-1.5-flash (v1beta):', err2.message);
      
      console.log('\nTesting fallback model: gemini-pro...');
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent('Hello, are you active?');
        console.log(`SUCCESS with gemini-pro (Gemini 1.0 Pro)! Response: ${result.response.text().trim()}`);
      } catch (err3) {
        console.error('Error with gemini-pro:', err3.message);
      }
    }
  }
}

checkModels();
