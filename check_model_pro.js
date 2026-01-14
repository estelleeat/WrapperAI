const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function check() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Test');
    console.log('SUCCESS: gemini-pro works!');
  } catch (e) {
    console.log('ERROR with gemini-pro:', e.message);
  }
}

check();
