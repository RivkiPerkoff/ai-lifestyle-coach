const https = require('https');
require('dotenv').config();

// Bypass SSL certificate issues for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function listAvailableModels() {
  console.log('Listing available models...');
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No API key found');
    return;
  }
  
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
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
            console.log('\n✅ Available models:');
            
            if (parsed.models && parsed.models.length > 0) {
              parsed.models.forEach(model => {
                console.log(`- ${model.name}`);
                if (model.supportedGenerationMethods) {
                  console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
                }
              });
              
              // Try the first available model
              const firstModel = parsed.models.find(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes('generateContent')
              );
              
              if (firstModel) {
                console.log(`\n🔧 Testing with: ${firstModel.name}`);
                testWithModel(firstModel.name);
              }
            } else {
              console.log('No models found');
            }
          } catch (e) {
            console.log('✅ Got response but parsing failed:', responseData);
          }
        } else {
          console.log('❌ Error response:', responseData);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      reject(error);
    });
    
    req.end();
  });
}

async function testWithModel(modelName) {
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
    path: `/v1beta/${modelName}:generateContent?key=${apiKey}`,
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
      console.log('Test Status Code:', res.statusCode);
      
      if (res.statusCode === 200) {
        try {
          const parsed = JSON.parse(responseData);
          const text = parsed.candidates[0].content.parts[0].text;
          console.log(`✅ SUCCESS with ${modelName}! Response:`, text);
        } catch (e) {
          console.log('✅ Got response:', responseData);
        }
      } else {
        console.log(`❌ Test failed with ${modelName}:`, responseData);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Test request error:', error.message);
  });
  
  req.write(data);
  req.end();
}

listAvailableModels();