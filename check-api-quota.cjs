const https = require('https');
require('dotenv').config();

// Get all API keys from environment
const API_KEYS = [
  { name: 'YOUTUBE_API_KEY', value: process.env.YOUTUBE_API_KEY },
  { name: 'YOUTUBE_API_KEY_2', value: process.env.YOUTUBE_API_KEY_2 },
  { name: 'YOUTUBE_API_KEY_3', value: process.env.YOUTUBE_API_KEY_3 }
].filter(key => key.value);

console.log('\n========================================');
console.log('YouTube API Quota Check');
console.log('========================================');
console.log(`Found ${API_KEYS.length} API keys configured\n`);

// Function to check quota for a single API key
function checkQuota(apiKey, keyName) {
  return new Promise((resolve, reject) => {
    // Make a simple search request to check if quota is exceeded
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}`;

    https.get(testUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (result.error) {
            // Check error details
            if (result.error.code === 403) {
              if (result.error.message.includes('quota')) {
                resolve({
                  keyName,
                  status: 'QUOTA_EXCEEDED',
                  message: 'Daily quota limit exceeded',
                  error: result.error.message
                });
              } else {
                resolve({
                  keyName,
                  status: 'FORBIDDEN',
                  message: 'API key may be invalid or restricted',
                  error: result.error.message
                });
              }
            } else if (result.error.code === 400) {
              resolve({
                keyName,
                status: 'INVALID_KEY',
                message: 'Invalid API key',
                error: result.error.message
              });
            } else {
              resolve({
                keyName,
                status: 'ERROR',
                message: `Error code: ${result.error.code}`,
                error: result.error.message
              });
            }
          } else if (result.items) {
            // Success - key is working
            resolve({
              keyName,
              status: 'WORKING',
              message: 'API key is active and has quota available',
              quotaCost: 100 // A search request costs 100 units
            });
          } else {
            resolve({
              keyName,
              status: 'UNKNOWN',
              message: 'Unexpected response format'
            });
          }
        } catch (error) {
          resolve({
            keyName,
            status: 'PARSE_ERROR',
            message: 'Failed to parse API response',
            error: error.message
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        keyName,
        status: 'REQUEST_FAILED',
        message: 'Failed to connect to YouTube API',
        error: error.message
      });
    });
  });
}

// Check all API keys
async function checkAllKeys() {
  if (API_KEYS.length === 0) {
    console.log('❌ No YouTube API keys found in environment variables');
    console.log('Please ensure YOUTUBE_API_KEY environment variables are set');
    return;
  }

  console.log('Checking API keys...\n');

  for (const key of API_KEYS) {
    const result = await checkQuota(key.value, key.name);

    // Display result with appropriate emoji
    let emoji = '❓';
    if (result.status === 'WORKING') emoji = '✅';
    else if (result.status === 'QUOTA_EXCEEDED') emoji = '⚠️';
    else if (result.status === 'FORBIDDEN' || result.status === 'INVALID_KEY') emoji = '❌';
    else if (result.status === 'ERROR' || result.status === 'REQUEST_FAILED') emoji = '🔴';

    console.log(`${emoji} ${result.keyName}:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   ${result.message}`);
    if (result.error && result.status !== 'WORKING') {
      console.log(`   Details: ${result.error}`);
    }
    if (result.quotaCost) {
      console.log(`   Note: This test consumed ${result.quotaCost} quota units`);
    }
    console.log();
  }

  // Summary
  console.log('========================================');
  console.log('Summary:');
  const workingKeys = API_KEYS.filter((_, index) =>
    API_KEYS[index] && checkQuota[index]?.status === 'WORKING'
  ).length;

  const results = await Promise.all(API_KEYS.map(key => checkQuota(key.value, key.name)));
  const working = results.filter(r => r.status === 'WORKING').length;
  const quotaExceeded = results.filter(r => r.status === 'QUOTA_EXCEEDED').length;
  const errors = results.filter(r => !['WORKING', 'QUOTA_EXCEEDED'].includes(r.status)).length;

  console.log(`✅ Working: ${working}`);
  console.log(`⚠️  Quota Exceeded: ${quotaExceeded}`);
  console.log(`❌ Errors/Invalid: ${errors}`);
  console.log('========================================');

  // Recommendation
  if (working === 0) {
    console.log('\n⚠️  CRITICAL: No working API keys available!');
    console.log('Recommendations:');
    console.log('1. Wait until quota resets (midnight Pacific Time)');
    console.log('2. Add new API keys from different Google Cloud projects');
    console.log('3. Consider implementing a caching layer to reduce API calls');
  } else if (working < API_KEYS.length) {
    console.log('\n⚠️  Some API keys have issues.');
    console.log(`Currently using ${working} of ${API_KEYS.length} configured keys.`);
  } else {
    console.log('\n✅ All API keys are working properly!');
  }

  // Daily quota info
  console.log('\n📊 YouTube API Quota Information:');
  console.log('• Daily quota: 10,000 units per key');
  console.log('• Search request: 100 units');
  console.log('• Video details: 1 unit');
  console.log('• Quota resets: Midnight Pacific Time (PT)');
  console.log('• Current time: ' + new Date().toLocaleString());
}

// Run the check
checkAllKeys().catch(console.error);