const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent('Test');
    console.log('SUCCESS: gemini-1.0-pro works!');
  } catch (e) {
    console.log('ERROR with gemini-1.0-pro:', e.message);
  }
}

check();
