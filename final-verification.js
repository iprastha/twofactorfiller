const { totp } = require('otplib');

console.log('=== FINAL OTPLIB VERIFICATION ===');
console.log('Library: otplib v12.0.1');
console.log('Secret: I65VU7K5ZQL7WB4E');
console.log('Current time:', new Date().toLocaleString());

// Test current code
const currentCode = totp.generate('I65VU7K5ZQL7WB4E');
console.log('Current TOTP code from otplib:', currentCode);

// Verify otplib settings
console.log('\n=== OTPLIB Configuration ===');
console.log('Default options:', totp.options);

// Test the same QR code you provided
const qrSecret = 'I65VU7K5ZQL7WB4E'; // from your QR code
const qrCode = totp.generate(qrSecret);
console.log('Code from QR secret:', qrCode);

// Let's also try a known test vector to verify otplib is working correctly
console.log('\n=== RFC Test Vector ===');
// Using RFC 6238 test vector
const rfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const rfcTime = 1111111109 * 1000; // Known test timestamp
const rfcCode = totp.generate(rfcSecret, rfcTime);
console.log('RFC test vector result:', rfcCode);
console.log('Expected RFC result: 081804 (if otplib is working correctly)');

// Time verification
const now = Date.now();
const unixTime = Math.floor(now / 1000);
const timeWindow = Math.floor(unixTime / 30);
console.log('\n=== Time Analysis ===');
console.log('JavaScript timestamp (ms):', now);
console.log('Unix timestamp (s):', unixTime);
console.log('30-second window:', timeWindow);

// Show what Google Authenticator should match
console.log('\n=== Google Authenticator Comparison ===');
console.log('Our code:', currentCode);
console.log('Your Google Auth shows: (please check now)');
console.log('They should match if time is synchronized');

// Test with exact current 30-second window
const windowStart = timeWindow * 30 * 1000;
const codeAtWindow = totp.generate('I65VU7K5ZQL7WB4E', windowStart);
console.log('Code at exact window start:', codeAtWindow);
console.log('This should also match Google Authenticator');