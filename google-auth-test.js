const { totp } = require('otplib');

const secret = 'I65VU7K5ZQL7WB4E';
const expectedCode = '937918';

console.log('=== GOOGLE AUTHENTICATOR DEBUGGING ===');
console.log('Secret:', secret);
console.log('Expected from Google Auth:', expectedCode);
console.log('Current time:', new Date().toLocaleString());

const now = Math.floor(Date.now() / 1000);

// Test with wider time range (Google Auth might have slight time differences)
console.log('\n=== Extended Time Range Test ===');
let foundMatch = false;

for (let offset = -300; offset <= 300; offset += 30) {
  const testTime = now + offset;
  const code = totp.generate(secret, testTime * 1000);
  if (code === expectedCode) {
    const timeStr = new Date(testTime * 1000).toLocaleString();
    console.log(`✓ MATCH FOUND! Time offset: ${offset}s, Time: ${timeStr}, Code: ${code}`);
    foundMatch = true;
  }
}

if (!foundMatch) {
  console.log('No time-based match found in ±5 minute range');
}

// Let's also check if we need to handle the secret differently for Google Auth
console.log('\n=== Current codes from our generator ===');
for (let i = -2; i <= 2; i++) {
  const testTime = (now + (i * 30)) * 1000;
  const code = totp.generate(secret, testTime);
  const timeStr = new Date(testTime).toLocaleTimeString();
  console.log(`${timeStr}: ${code}`);
}

// Test with Google Authenticator's typical settings explicitly
console.log('\n=== Google Authenticator Standard Settings ===');
console.log('Algorithm: SHA1');
console.log('Digits: 6'); 
console.log('Period: 30 seconds');
console.log('Current 30s window:', Math.floor(now / 30));

// Manual verification of the current time window calculation
const currentWindow = Math.floor(now / 30);
console.log('\n=== Time Window Analysis ===');
console.log('Unix timestamp:', now);
console.log('30s window number:', currentWindow);
console.log('Window start time:', new Date(currentWindow * 30 * 1000).toLocaleTimeString());
console.log('Window end time:', new Date((currentWindow + 1) * 30 * 1000).toLocaleTimeString());

// One more attempt with exact Google Authenticator simulation
console.log('\n=== Final Verification ===');
console.log('What Google Authenticator should show right now:', totp.generate(secret));
console.log('What you see in Google Authenticator:', expectedCode);
console.log('Match:', totp.generate(secret) === expectedCode ? 'YES' : 'NO');

if (!foundMatch) {
  console.log('\n=== POSSIBLE ISSUES ===');
  console.log('1. The secret key might have been transcribed incorrectly');
  console.log('2. Google Authenticator might be showing an old code (try waiting 30 seconds)');
  console.log('3. There might be a character that looks similar (0 vs O, 1 vs I, etc.)');
  console.log('4. The 2FA service might use non-standard TOTP settings');
  console.log('\nCan you double-check the secret key character by character?');
  console.log('Current key: I65VU7K5ZQL7WB4E');
  console.log('Character breakdown:', secret.split('').join(' '));
}