const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Try to load API keys from environment or .env file
const API_KEYS = [
  process.env.YOUTUBE_API_KEY,
  process.env.YOUTUBE_API_KEY_2,
  process.env.YOUTUBE_API_KEY_3
].filter(Boolean);

if (API_KEYS.length === 0) {
  console.error('❌ No YouTube API keys found in environment variables');
  process.exit(1);
}

console.log(`\n🔍 Checking YouTube API Quota Status...`);
console.log(`📊 Found ${API_KEYS.length} API key(s) to check\n`);

async function checkQuota(apiKey, keyIndex) {
  return new Promise((resolve, reject) => {
    const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;

    // Test with a simple search request
    const options = {
      hostname: 'www.googleapis.com',
      path: `/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200) {
            console.log(`✅ API Key ${keyIndex + 1} (${maskedKey}): WORKING`);
            console.log(`   - Status: Active`);
            console.log(`   - Response: Search successful\n`);
            resolve({ key: keyIndex + 1, status: 'working', maskedKey });
          } else if (res.statusCode === 403) {
            const error = response.error;
            if (error && error.message.includes('quota')) {
              console.log(`❌ API Key ${keyIndex + 1} (${maskedKey}): QUOTA EXCEEDED`);
              console.log(`   - Error: ${error.message}\n`);
              resolve({ key: keyIndex + 1, status: 'quota_exceeded', maskedKey });
            } else {
              console.log(`⚠️ API Key ${keyIndex + 1} (${maskedKey}): FORBIDDEN`);
              console.log(`   - Error: ${error?.message || 'Unknown error'}\n`);
              resolve({ key: keyIndex + 1, status: 'forbidden', maskedKey });
            }
          } else {
            console.log(`❓ API Key ${keyIndex + 1} (${maskedKey}): UNKNOWN STATUS`);
            console.log(`   - Status Code: ${res.statusCode}`);
            console.log(`   - Response: ${data.substring(0, 200)}\n`);
            resolve({ key: keyIndex + 1, status: 'unknown', maskedKey });
          }
        } catch (e) {
          console.log(`💥 API Key ${keyIndex + 1} (${maskedKey}): ERROR`);
          console.log(`   - Error: ${e.message}\n`);
          resolve({ key: keyIndex + 1, status: 'error', maskedKey });
        }
      });
    });

    req.on('error', (e) => {
      console.log(`💥 API Key ${keyIndex + 1} (${maskedKey}): NETWORK ERROR`);
      console.log(`   - Error: ${e.message}\n`);
      resolve({ key: keyIndex + 1, status: 'network_error', maskedKey });
    });

    req.end();
  });
}

// Check all API keys
async function checkAllKeys() {
  const results = [];

  for (let i = 0; i < API_KEYS.length; i++) {
    const result = await checkQuota(API_KEYS[i], i);
    results.push(result);
  }

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('═══════════════════════════════════════');

  const working = results.filter(r => r.status === 'working');
  const quotaExceeded = results.filter(r => r.status === 'quota_exceeded');
  const other = results.filter(r => !['working', 'quota_exceeded'].includes(r.status));

  console.log(`✅ Working Keys: ${working.length}/${API_KEYS.length}`);
  if (working.length > 0) {
    working.forEach(k => console.log(`   - Key ${k.key} (${k.maskedKey})`));
  }

  console.log(`❌ Quota Exceeded: ${quotaExceeded.length}/${API_KEYS.length}`);
  if (quotaExceeded.length > 0) {
    quotaExceeded.forEach(k => console.log(`   - Key ${k.key} (${k.maskedKey})`));
  }

  if (other.length > 0) {
    console.log(`⚠️ Other Issues: ${other.length}/${API_KEYS.length}`);
    other.forEach(k => console.log(`   - Key ${k.key} (${k.maskedKey}): ${k.status}`));
  }

  console.log('\n📝 NOTES:');
  console.log('• YouTube API quota resets daily at midnight Pacific Time');
  console.log('• Each API key gets 10,000 units per day');
  console.log('• A search request costs 100 units');
  console.log('• Video details request costs 1 unit');

  if (working.length === 0 && quotaExceeded.length === API_KEYS.length) {
    console.log('\n⚠️ All API keys have exceeded their quota!');
    console.log('💡 Solutions:');
    console.log('  1. Wait until midnight PT for quota reset');
    console.log('  2. Create a new Google Cloud project for fresh quota');
    console.log('  3. Add more API keys to .env file');
  } else if (working.length > 0) {
    console.log(`\n✅ ${working.length} API key(s) are still working!`);
    console.log('The application should be functional.');
  }
}

checkAllKeys().catch(console.error);