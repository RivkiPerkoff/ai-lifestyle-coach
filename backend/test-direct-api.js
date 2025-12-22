const https = require('https');
require('dotenv').config();

// Bypass SSL certificate issues for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testGeminiDirectAPI() {
  console.log('Testing Gemini API directly...');
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  const data = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Say "Hello World"'
      }]
    }]
  });
  
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    rejectUnauthorized: false
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(responseData);
            const text = parsed.candidates[0].content.parts[0].text;
            console.log('✅ SUCCESS! Response:', text);
          } catch (e) {
            console.log('✅ Got response but parsing failed:', responseData);
          }
        } else {
          console.log('❌ Error response:', responseData);
          
          if (res.statusCode === 403) {
            console.log('\n🔧 API Key issue - go to https://aistudio.google.com/app/apikey');
          } else if (res.statusCode === 404) {
            console.log('\n🔧 Model not found - trying different endpoint...');
            testAlternativeModel();
          }
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

async function testAlternativeModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const data = JSON.stringify({
    contents: [{
      parts: [{
        text: 'Say "Hello World"'
      }]
    }]
  });
  
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    },
    rejectUnauthorized: false
  };
  
  const req = https.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Alternative Status Code:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(responseData);
          const text = parsed.candidates[0].content.parts[0].text;
          console.log('✅ SUCCESS with gemini-pro! Response:', text);
        } catch (e) {
          console.log('✅ Got response:', responseData);
        }
      } else {
        console.log('❌ Alternative also failed:', responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Alternative request error:', error.message);
  });
  
  req.write(data);
  req.end();
}

testGeminiDirectAPI();