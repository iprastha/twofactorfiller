const { totp } = require('otplib');

const secret = 'I65VU7K5ZQL7WB4E';

console.log('Testing your 2FA key:', secret);
console.log('Current time:', new Date().toLocaleString());

// Generate current code
const currentCode = totp.generate(secret);
console.log('Current TOTP code:', currentCode);

// Show next few codes for comparison
console.log('\nNext few codes (for time verification):');
const now = Math.floor(Date.now() / 1000);
for (let i = -1; i <= 2; i++) {
  const timeStep = now + (i * 30);
  const code = totp.generate(secret, timeStep * 1000);
  const timeStr = new Date(timeStep * 1000).toLocaleTimeString();
  const label = i === 0 ? ' <- CURRENT' : '';
  console.log(`${timeStr}: ${code}${label}`);
}

// Check if key needs different format
console.log('\nKey analysis:');
console.log('Length:', secret.length, 'characters');
console.log('Valid base32:', /^[A-Z2-7]+$/.test(secret));

// Show what your authenticator app should show
console.log('\n=== What to check ===');
console.log('1. Your authenticator app should show:', currentCode);
console.log('2. If not matching, check if time is synchronized');
console.log('3. Some apps use different periods or algorithms');