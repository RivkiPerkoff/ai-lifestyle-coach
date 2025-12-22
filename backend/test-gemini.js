const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Bypass SSL certificate issues for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testGeminiAPI() {
  console.log('Testing Gemini API...');
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ No API key found in .env file');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    console.log('Sending API request...');
    const result = await model.generateContent('Say "Hello World"');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ SUCCESS! Response:', text);
    console.log('\n🎉 Gemini API is working correctly!');
  } catch (error) {
    console.log('❌ API ERROR:', error.message);
  }
}

testGeminiAPI();