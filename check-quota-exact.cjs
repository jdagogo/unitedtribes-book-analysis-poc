#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

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

// Read the cache file
const cacheFile = path.join(__dirname, 'data', 'youtube-api-cache.json');
let cache = {};
try {
  if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }
} catch (error) {
  console.log('No API cache file found. Starting fresh tracking from now.');
  cache = {};
}

// Get current date for filtering today's calls (Pacific Time)
const now = new Date();
const pacificOffset = -8; // PST is UTC-8 (or -7 for PDT)
const nowPacific = new Date(now.getTime() - (pacificOffset * 60 * 60 * 1000));

// Calculate midnight Pacific Time for today
const todayPacific = new Date(nowPacific);
todayPacific.setHours(0, 0, 0, 0);
const todayTimestamp = todayPacific.getTime() + (pacificOffset * 60 * 60 * 1000);

// Calculate time until reset
const tomorrowPacific = new Date(todayPacific);
tomorrowPacific.setDate(tomorrowPacific.getDate() + 1);
const resetTime = tomorrowPacific.getTime() + (pacificOffset * 60 * 60 * 1000);
const msUntilReset = resetTime - now.getTime();
const hoursUntilReset = Math.floor(msUntilReset / (1000 * 60 * 60));
const minutesUntilReset = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

// Count API calls made today per key
const keyUsage = {
  0: { calls: 0, units: 0 }, // YOUTUBE_API_KEY
  1: { calls: 0, units: 0 }, // YOUTUBE_API_KEY_2
  2: { calls: 0, units: 0 }  // YOUTUBE_API_KEY_3
};

let totalCallsToday = 0;
let totalUnitsToday = 0;

// Analyze cache entries
for (const [key, entry] of Object.entries(cache)) {
  // Check if this was called today (after Pacific midnight)
  if (entry.timestamp >= todayTimestamp) {
    totalCallsToday++;
    totalUnitsToday += (entry.units || 100);

    const keyIndex = entry.keyIndex || 0;
    if (keyUsage[keyIndex]) {
      keyUsage[keyIndex].calls++;
      keyUsage[keyIndex].units += (entry.units || 100);
    }
  }
}

// Total units available (3 keys × 10,000 units each)
const totalUnitsAvailable = 30000;
const unitsRemaining = totalUnitsAvailable - totalUnitsToday;
const searchesRemaining = Math.floor(unitsRemaining / 100);

console.log(colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);
console.log(colors.cyan + colors.bright + '                    YouTube API Quota Status (EXACT)' + colors.reset);
console.log(colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);
console.log(colors.white + `Current Time: ${now.toLocaleString()}` + colors.reset);
console.log(colors.white + `Pacific Time: ${nowPacific.toLocaleString()}` + colors.reset);
console.log('');

console.log(colors.yellow + colors.bright + '📊 Today\'s Usage (since Pacific midnight):' + colors.reset);
console.log(`  ${colors.cyan}• API calls made:${colors.reset}     ${totalCallsToday}`);
console.log(`  ${colors.cyan}• Units used:${colors.reset}         ${colors.bright}${totalUnitsToday.toLocaleString()}${colors.reset} / ${totalUnitsAvailable.toLocaleString()}`);
console.log(`  ${colors.cyan}• Units remaining:${colors.reset}    ${colors.green}${unitsRemaining.toLocaleString()}${colors.reset}`);
console.log(`  ${colors.cyan}• Searches remaining:${colors.reset} ~${colors.green}${searchesRemaining}${colors.reset}`);
console.log(`  ${colors.cyan}• Usage percentage:${colors.reset}   ${((totalUnitsToday / totalUnitsAvailable) * 100).toFixed(2)}%`);
console.log('');

console.log(colors.yellow + colors.bright + '🔑 API Key Status:' + colors.reset);

// Key 1 status
const key1Units = keyUsage[0].units;
const key1Remaining = 10000 - key1Units;
const key1Color = key1Units >= 10000 ? colors.red : key1Units >= 8000 ? colors.yellow : colors.green;
console.log(`  ${colors.cyan}Key 1 (YOUTUBE_API_KEY):${colors.reset}`);
console.log(`    • Calls made: ${keyUsage[0].calls}`);
console.log(`    • Units used: ${key1Color}${key1Units.toLocaleString()} / 10,000${colors.reset}`);
console.log(`    • Units remaining: ${key1Remaining > 0 ? colors.green : colors.red}${key1Remaining}${colors.reset}`);
console.log(`    • Status: ${key1Units >= 10000 ? colors.red + 'EXHAUSTED' : key1Units >= 8000 ? colors.yellow + 'NEAR LIMIT' : colors.green + 'ACTIVE'}${colors.reset}`);
console.log('');

// Key 2 status
const key2Units = keyUsage[1].units;
const key2Remaining = 10000 - key2Units;
const key2Color = key2Units >= 10000 ? colors.red : key2Units >= 8000 ? colors.yellow : colors.green;
console.log(`  ${colors.cyan}Key 2 (YOUTUBE_API_KEY_2):${colors.reset}`);
console.log(`    • Calls made: ${keyUsage[1].calls}`);
console.log(`    • Units used: ${key2Color}${key2Units.toLocaleString()} / 10,000${colors.reset}`);
console.log(`    • Units remaining: ${key2Remaining > 0 ? colors.green : colors.red}${key2Remaining}${colors.reset}`);
console.log(`    • Status: ${key2Units >= 10000 ? colors.red + 'EXHAUSTED' : key2Units >= 8000 ? colors.yellow + 'NEAR LIMIT' : colors.green + 'ACTIVE'}${colors.reset}`);
console.log('');

// Key 3 status
const key3Units = keyUsage[2].units;
const key3Remaining = 10000 - key3Units;
const key3Color = key3Units >= 10000 ? colors.red : key3Units >= 8000 ? colors.yellow : colors.green;
console.log(`  ${colors.cyan}Key 3 (YOUTUBE_API_KEY_3):${colors.reset}`);
console.log(`    • Calls made: ${keyUsage[2].calls}`);
console.log(`    • Units used: ${key3Color}${key3Units.toLocaleString()} / 10,000${colors.reset}`);
console.log(`    • Units remaining: ${key3Remaining > 0 ? colors.green : colors.red}${key3Remaining}${colors.reset}`);
console.log(`    • Status: ${key3Units >= 10000 ? colors.red + 'EXHAUSTED' : key3Units >= 8000 ? colors.yellow + 'NEAR LIMIT' : colors.green + 'ACTIVE'}${colors.reset}`);
console.log('');

// Current active key
let currentKey = 'Key 1';
if (key1Units >= 10000) {
  currentKey = key2Units >= 10000 ? 'Key 3' : 'Key 2';
}
console.log(`  ${colors.cyan}Currently using:${colors.reset} ${colors.bright}${currentKey}${colors.reset}`);
console.log('');

console.log(colors.yellow + colors.bright + '💾 Cache Statistics:' + colors.reset);
console.log(`  ${colors.cyan}• Total cached entries:${colors.reset}  ${Object.keys(cache).length}`);
console.log(`  ${colors.cyan}• Entries from today:${colors.reset}    ${totalCallsToday}`);
console.log(`  ${colors.cyan}• Oldest entry:${colors.reset}          ${Object.keys(cache).length > 0 ?
  new Date(Math.min(...Object.values(cache).map(e => e.timestamp))).toLocaleDateString() : 'N/A'}`);
console.log('');

console.log(`${colors.cyan}⏰ Quota resets in:${colors.reset} ${colors.bright}${hoursUntilReset}h ${minutesUntilReset}m${colors.reset} (midnight Pacific Time)`);

console.log(colors.cyan + colors.bright + '═══════════════════════════════════════════════════════════════════════' + colors.reset);

// Warnings
if (unitsRemaining < 2000) {
  console.log('');
  console.log(colors.red + colors.bright + '⚠️  WARNING: Approaching daily quota limit!' + colors.reset);
  console.log(colors.yellow + 'Consider waiting until quota resets or using cached results.' + colors.reset);
} else if (unitsRemaining < 5000) {
  console.log('');
  console.log(colors.yellow + colors.bright + '⚠️  NOTICE: Less than 5,000 units remaining today.' + colors.reset);
  console.log('Monitor usage carefully to avoid exhausting quota.' + colors.reset);
}

// Success message if plenty of quota
if (unitsRemaining > 20000) {
  console.log('');
  console.log(colors.green + colors.bright + '✅ Plenty of quota available!' + colors.reset);
  console.log(`You can make approximately ${searchesRemaining} more searches today.`);
}

console.log('');