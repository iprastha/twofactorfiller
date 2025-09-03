const { totp } = require('otplib');

const secret = 'I65VU7K5ZQL7WB4E';
const expectedCode = '937918';

console.log('=== SECRET KEY FORMAT TESTING ===');
console.log('Original secret:', secret);
console.log('Expected code:', expectedCode);

// Test different interpretations of the key
const variations = [
  secret, // original
  secret.toLowerCase(), // lowercase
  secret + '=', // with padding
  secret + '==', // with more padding
  secret + '===', // with more padding
  secret + '====', // with even more padding
];

console.log('\n=== Testing Key Variations ===');
variations.forEach((key, i) => {
  try {
    const code = totp.generate(key);
    const match = code === expectedCode ? ' ← MATCH!' : '';
    console.log(`Variation ${i + 1} (${key}): ${code}${match}`);
  } catch (err) {
    console.log(`Variation ${i + 1} (${key}): Error - ${err.message}`);
  }
});

// Test if it's a hex key instead of base32
console.log('\n=== Testing as HEX Key ===');
try {
  // Convert assumed base32 to hex and test
  const hexKey = Buffer.from(secret, 'hex').toString('base64');
  const codeFromHex = totp.generate(hexKey);
  const match = codeFromHex === expectedCode ? ' ← MATCH!' : '';
  console.log(`As HEX converted: ${codeFromHex}${match}`);
} catch (err) {
  console.log('HEX conversion failed:', err.message);
}

// Test with the key as ASCII
console.log('\n=== Testing as ASCII Key ===');
try {
  const asciiKey = Buffer.from(secret, 'ascii').toString('base64');
  const codeFromAscii = totp.generate(asciiKey);
  const match = codeFromAscii === expectedCode ? ' ← MATCH!' : '';
  console.log(`As ASCII converted: ${codeFromAscii}${match}`);
} catch (err) {
  console.log('ASCII conversion failed:', err.message);
}

// Check what authenticator apps typically use
console.log('\n=== QUESTIONS TO VERIFY ===');
console.log('1. What authenticator app are you using? (Google Auth, Authy, etc.)');
console.log('2. How did you get this secret key? (QR code, manual entry, etc.)');
console.log('3. What service is this 2FA for?');
console.log('4. Are you sure the key is exactly: I65VU7K5ZQL7WB4E');
console.log('5. What time does your authenticator show vs system time?');

// Show current system time details
const now = new Date();
console.log('\n=== SYSTEM TIME INFO ===');
console.log('System time:', now.toLocaleString());
console.log('UTC time:', now.toUTCString());
console.log('Unix timestamp:', Math.floor(now.getTime() / 1000));
console.log('30s time window:', Math.floor(now.getTime() / 1000 / 30));