const https = require('https');
require('dotenv').config();

// Get all API keys from environment
const API_KEYS = [
  { name: 'YOUTUBE_API_KEY', value: process.env.YOUTUBE_API_KEY },
  { name: 'YOUTUBE_API_KEY_2', value: process.env.YOUTUBE_API_KEY_2 },
  { name: 'YOUTUBE_API_KEY_3', value: process.env.YOUTUBE_API_KEY_3 }
].filter(key => key.value);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

console.log('\n' + colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);
console.log(colors.cyan + colors.bright + '                    YouTube API Quota Status Report' + colors.reset);
console.log(colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);
console.log(colors.white + `Report Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles', timeZoneName: 'short' })}` + colors.reset);
console.log(colors.white + `Found ${API_KEYS.length} API keys configured\n` + colors.reset);

// Function to check detailed quota for a single API key
function checkDetailedQuota(apiKey, keyName) {
  return new Promise((resolve, reject) => {
    // Use the quotaUser parameter to get more accurate quota info
    // We'll make a search request which costs 100 units
    const testUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&maxResults=1&key=${apiKey}&quotaUser=${keyName}`;

    https.get(testUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const result = JSON.parse(data);

          // Parse headers for quota information
          const headers = response.headers;

          if (result.error) {
            // Check error details for quota information
            if (result.error.code === 403) {
              const errorMessage = result.error.message || '';
              const errors = result.error.errors || [];

              // Try to extract quota details from error message
              let quotaUsed = 'Unknown';
              let quotaLimit = 10000;

              // Check if it's a quota exceeded error
              if (errorMessage.includes('quota') ||
                  errors.some(e => e.reason === 'quotaExceeded' || e.domain === 'youtube.quota')) {

                // Extract numbers from error message if available
                const quotaMatch = errorMessage.match(/(\d+)[^\d]*of[^\d]*(\d+)/);
                if (quotaMatch) {
                  quotaUsed = parseInt(quotaMatch[1]);
                  quotaLimit = parseInt(quotaMatch[2]);
                }

                resolve({
                  keyName,
                  status: 'QUOTA_EXCEEDED',
                  working: false,
                  quotaLimit: quotaLimit,
                  quotaUsed: quotaUsed === 'Unknown' ? quotaLimit : quotaUsed,
                  quotaRemaining: 0,
                  percentUsed: 100,
                  message: 'Daily quota limit exceeded',
                  details: errorMessage,
                  testCost: 0 // No cost since request failed
                });
              } else {
                resolve({
                  keyName,
                  status: 'FORBIDDEN',
                  working: false,
                  quotaLimit: 10000,
                  quotaUsed: 'Unknown',
                  quotaRemaining: 'Unknown',
                  percentUsed: 'Unknown',
                  message: 'API key may be invalid or restricted',
                  details: errorMessage,
                  testCost: 0
                });
              }
            } else if (result.error.code === 400) {
              resolve({
                keyName,
                status: 'INVALID_KEY',
                working: false,
                quotaLimit: 10000,
                quotaUsed: 'Unknown',
                quotaRemaining: 'Unknown',
                percentUsed: 'Unknown',
                message: 'Invalid API key',
                details: result.error.message,
                testCost: 0
              });
            } else {
              resolve({
                keyName,
                status: 'ERROR',
                working: false,
                quotaLimit: 10000,
                quotaUsed: 'Unknown',
                quotaRemaining: 'Unknown',
                percentUsed: 'Unknown',
                message: `Error code: ${result.error.code}`,
                details: result.error.message,
                testCost: 0
              });
            }
          } else if (result.items) {
            // Success - key is working
            // Since we can't get exact quota from headers, we'll estimate based on typical usage
            const quotaLimit = 10000;
            const testCost = 100; // Search costs 100 units

            // We know it's working and has at least 100 units available
            resolve({
              keyName,
              status: 'WORKING',
              working: true,
              quotaLimit: quotaLimit,
              quotaUsed: 'Unknown (< ' + (quotaLimit - testCost) + ')',
              quotaRemaining: '> ' + testCost,
              percentUsed: '< ' + ((quotaLimit - testCost) / quotaLimit * 100).toFixed(1),
              message: 'API key is active and has quota available',
              details: 'Successfully retrieved search results',
              testCost: testCost
            });
          } else {
            resolve({
              keyName,
              status: 'UNKNOWN',
              working: false,
              quotaLimit: 10000,
              quotaUsed: 'Unknown',
              quotaRemaining: 'Unknown',
              percentUsed: 'Unknown',
              message: 'Unexpected response format',
              details: 'No items or error in response',
              testCost: 0
            });
          }
        } catch (error) {
          resolve({
            keyName,
            status: 'PARSE_ERROR',
            working: false,
            quotaLimit: 10000,
            quotaUsed: 'Unknown',
            quotaRemaining: 'Unknown',
            percentUsed: 'Unknown',
            message: 'Failed to parse API response',
            details: error.message,
            testCost: 0
          });
        }
      });
    }).on('error', (error) => {
      resolve({
        keyName,
        status: 'REQUEST_FAILED',
        working: false,
        quotaLimit: 10000,
        quotaUsed: 'Unknown',
        quotaRemaining: 'Unknown',
        percentUsed: 'Unknown',
        message: 'Failed to connect to YouTube API',
        details: error.message,
        testCost: 0
      });
    });
  });
}

// Function to make additional API call to estimate usage
async function estimateQuotaUsage(apiKey, keyName) {
  // Try to make a cheaper call (1 unit) to test if we're close to limit
  return new Promise((resolve) => {
    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${apiKey}`;

    https.get(testUrl, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            resolve({ nearLimit: true, canMakeCheapCalls: false });
          } else {
            resolve({ nearLimit: false, canMakeCheapCalls: true });
          }
        } catch {
          resolve({ nearLimit: 'unknown', canMakeCheapCalls: 'unknown' });
        }
      });
    }).on('error', () => {
      resolve({ nearLimit: 'unknown', canMakeCheapCalls: 'unknown' });
    });
  });
}

// Check all API keys
async function checkAllKeys() {
  if (API_KEYS.length === 0) {
    console.log(colors.red + '❌ No YouTube API keys found in environment variables' + colors.reset);
    console.log(colors.yellow + 'Please ensure YOUTUBE_API_KEY environment variables are set' + colors.reset);
    return;
  }

  console.log(colors.yellow + 'Checking API keys...\n' + colors.reset);

  let totalAvailable = 0;
  let totalUsed = 0;
  let workingKeys = 0;

  for (const key of API_KEYS) {
    const result = await checkDetailedQuota(key.value, key.name);

    // Display result with appropriate formatting
    let statusIcon = '❓';
    let statusColor = colors.white;

    if (result.status === 'WORKING') {
      statusIcon = '✅';
      statusColor = colors.green;
      workingKeys++;
    } else if (result.status === 'QUOTA_EXCEEDED') {
      statusIcon = '⚠️';
      statusColor = colors.yellow;
    } else {
      statusIcon = '❌';
      statusColor = colors.red;
    }

    console.log(colors.bright + '───────────────────────────────────────────────────────────────────────' + colors.reset);
    console.log(statusColor + colors.bright + `${statusIcon} ${result.keyName}` + colors.reset);
    console.log(colors.bright + '───────────────────────────────────────────────────────────────────────' + colors.reset);

    console.log(`${colors.cyan}Status:${colors.reset}          ${statusColor}${result.status}${colors.reset}`);
    console.log(`${colors.cyan}Message:${colors.reset}         ${result.message}`);

    if (result.working || result.status === 'QUOTA_EXCEEDED') {
      console.log(`${colors.cyan}Daily Limit:${colors.reset}     ${colors.white}${result.quotaLimit.toLocaleString()} units${colors.reset}`);

      // Format quota used
      if (typeof result.quotaUsed === 'number') {
        const usedColor = result.quotaUsed >= 9000 ? colors.red :
                         result.quotaUsed >= 7500 ? colors.yellow : colors.green;
        console.log(`${colors.cyan}Quota Used:${colors.reset}      ${usedColor}${result.quotaUsed.toLocaleString()} units${colors.reset}`);
        totalUsed += result.quotaUsed;
      } else {
        console.log(`${colors.cyan}Quota Used:${colors.reset}      ${colors.white}${result.quotaUsed}${colors.reset}`);
      }

      // Format quota remaining
      if (typeof result.quotaRemaining === 'number') {
        const remainColor = result.quotaRemaining <= 1000 ? colors.red :
                           result.quotaRemaining <= 2500 ? colors.yellow : colors.green;
        console.log(`${colors.cyan}Quota Remaining:${colors.reset} ${remainColor}${result.quotaRemaining.toLocaleString()} units${colors.reset}`);
        totalAvailable += result.quotaRemaining;
      } else {
        console.log(`${colors.cyan}Quota Remaining:${colors.reset} ${colors.green}${result.quotaRemaining} units${colors.reset}`);
        if (result.working) totalAvailable += 100; // At least 100 available if working
      }

      // Format percent used
      if (typeof result.percentUsed === 'number') {
        const percentColor = result.percentUsed >= 90 ? colors.red :
                            result.percentUsed >= 75 ? colors.yellow : colors.green;
        console.log(`${colors.cyan}Percent Used:${colors.reset}    ${percentColor}${result.percentUsed}%${colors.reset}`);
      } else {
        console.log(`${colors.cyan}Percent Used:${colors.reset}    ${colors.green}${result.percentUsed}%${colors.reset}`);
      }
    }

    if (result.testCost > 0) {
      console.log(`${colors.magenta}Note:${colors.reset}            This test consumed ${result.testCost} quota units`);
    }

    // Try to get more detailed usage for working keys
    if (result.working) {
      const usage = await estimateQuotaUsage(key.value, key.name);
      if (usage.canMakeCheapCalls === false) {
        console.log(`${colors.yellow}Warning:${colors.reset}         Key may be near quota limit (can't make 1-unit calls)`);
      }
    }

    console.log();
  }

  // Summary
  console.log(colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.cyan + colors.bright + '                              SUMMARY' + colors.reset);
  console.log(colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);

  const totalKeys = API_KEYS.length;
  const quotaExceeded = API_KEYS.filter((_, index) => {
    const results = API_KEYS.map(key => checkDetailedQuota(key.value, key.name));
    return results[index]?.status === 'QUOTA_EXCEEDED';
  }).length;

  console.log(`${colors.green}✅ Working Keys:${colors.reset}        ${workingKeys} of ${totalKeys}`);

  if (workingKeys > 0) {
    console.log(`${colors.green}✅ Available Quota:${colors.reset}     At least ${totalAvailable.toLocaleString()} units across all keys`);
    console.log(`${colors.cyan}📊 Estimated Capacity:${colors.reset}  ~${Math.floor(totalAvailable / 100)} searches remaining today`);
  }

  // Calculate time until reset
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));
  const midnight = new Date(pacificTime);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);
  const hoursUntilReset = Math.floor((midnight - pacificTime) / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(((midnight - pacificTime) % (1000 * 60 * 60)) / (1000 * 60));

  console.log(`${colors.cyan}⏰ Quota Reset:${colors.reset}         ${hoursUntilReset}h ${minutesUntilReset}m (Midnight PT)`);
  console.log();

  // Recommendations
  if (workingKeys === 0) {
    console.log(colors.red + colors.bright + '⚠️  CRITICAL: No working API keys available!' + colors.reset);
    console.log(colors.yellow + 'Recommendations:' + colors.reset);
    console.log('1. Wait until quota resets at midnight Pacific Time');
    console.log('2. Add new API keys from different Google Cloud projects');
    console.log('3. Consider implementing a caching layer to reduce API calls');
  } else if (workingKeys < totalKeys) {
    console.log(colors.yellow + colors.bright + '⚠️  Some API keys have issues or exceeded quota.' + colors.reset);
    console.log(`Currently using ${workingKeys} of ${totalKeys} configured keys.`);
  } else {
    console.log(colors.green + colors.bright + '✅ All API keys are working properly!' + colors.reset);

    if (totalAvailable < 2000 && totalAvailable !== 0) {
      console.log(colors.yellow + '\n⚠️  Warning: Running low on quota. Consider:' + colors.reset);
      console.log('• Reducing API calls where possible');
      console.log('• Implementing caching for frequently searched items');
    }
  }

  // API Usage Guide
  console.log(colors.cyan + '\n📊 YouTube API Quota Cost Guide:' + colors.reset);
  console.log('• Search request:        100 units');
  console.log('• Video details:         1 unit');
  console.log('• Playlist items:        1 unit');
  console.log('• Channel details:       1 unit');
  console.log('• Daily quota per key:   10,000 units');

  console.log(colors.cyan + colors.bright + '\n═══════════════════════════════════════════════════════════════════════\n' + colors.reset);
}

// Run the check
checkAllKeys().catch(console.error);