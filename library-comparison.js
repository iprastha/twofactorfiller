const { totp } = require('otplib');
const speakeasy = require('speakeasy');
const totpGenerator = require('totp-generator');

const secret = 'I65VU7K5ZQL7WB4E';

console.log('=== TOTP LIBRARY COMPARISON ===');
console.log('Secret:', secret);
console.log('Time:', new Date().toLocaleString());

console.log('\n=== Current TOTP Codes ===');

// otplib
let otplibCode = 'ERROR';
try {
  otplibCode = totp.generate(secret);
  console.log('otplib v12.0.1:', otplibCode);
} catch (err) {
  console.log('otplib ERROR:', err.message);
}

// speakeasy
let speakeasyCode = 'ERROR';
try {
  speakeasyCode = speakeasy.totp({
    secret: secret,
    encoding: 'base32',
    time: Math.floor(Date.now() / 1000)
  });
  console.log('speakeasy v2.0.0:', speakeasyCode);
} catch (err) {
  console.log('speakeasy ERROR:', err.message);
}

// totp-generator
let totpGenCode = 'ERROR';
try {
  totpGenCode = totpGenerator(secret);
  console.log('totp-generator v1.0.0:', totpGenCode);
} catch (err) {
  console.log('totp-generator ERROR:', err.message);
}

console.log('\n=== Comparison ===');
console.log('All libraries match:', (otplibCode === speakeasyCode && speakeasyCode === totpGenCode));

if (otplibCode !== speakeasyCode || speakeasyCode !== totpGenCode) {
  console.log('⚠️  LIBRARIES PRODUCE DIFFERENT RESULTS!');
  console.log('This suggests implementation differences or bugs');
}

// Test with RFC 6238 test vectors to validate correctness
console.log('\n=== RFC 6238 Test Vectors ===');
const rfcSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const testCases = [
  { time: 59, expected: '94287082' },
  { time: 1111111109, expected: '07081804' },
  { time: 1111111111, expected: '14050471' },
  { time: 1234567890, expected: '89005924' },
  { time: 2000000000, expected: '69279037' }
];

testCases.forEach(({ time, expected }, i) => {
  console.log(`\nTest ${i + 1} (time: ${time}):`);
  console.log(`Expected: ${expected}`);
  
  // otplib
  try {
    const otplibResult = totp.generate(rfcSecret, time * 1000);
    console.log(`otplib: ${otplibResult} ${otplibResult === expected ? '✓' : '✗'}`);
  } catch (err) {
    console.log(`otplib: ERROR - ${err.message}`);
  }
  
  // speakeasy
  try {
    const speakeasyResult = speakeasy.totp({
      secret: rfcSecret,
      encoding: 'base32',
      time: time,
      step: 30,
      digits: 8  // RFC test vectors use 8 digits
    });
    console.log(`speakeasy: ${speakeasyResult} ${speakeasyResult === expected ? '✓' : '✗'}`);
  } catch (err) {
    console.log(`speakeasy: ERROR - ${err.message}`);
  }
});

// Test our specific secret with speakeasy (which is known to be Google Auth compatible)
console.log('\n=== Google Authenticator Compatible Test ===');
console.log('Using speakeasy (known Google Auth compatible):');

const speakeasyGoogleAuth = speakeasy.totp({
  secret: secret,
  encoding: 'base32',
  time: Math.floor(Date.now() / 1000),
  step: 30,
  digits: 6,
  algorithm: 'sha1'
});

console.log(`Speakeasy result: ${speakeasyGoogleAuth}`);
console.log('This should match Google Authenticator exactly');

// Also test with exact Google Authenticator settings
console.log('\n=== Manual Google Auth Settings ===');
const now = Math.floor(Date.now() / 1000);
const timeStep = Math.floor(now / 30);

console.log(`Current Unix time: ${now}`);
console.log(`30s time step: ${timeStep}`);

const speakeasyManual = speakeasy.totp({
  secret: secret,
  encoding: 'base32',
  time: timeStep * 30,  // Use exact time step
  step: 30,
  digits: 6,
  algorithm: 'sha1'
});

console.log(`Speakeasy (manual time): ${speakeasyManual}`);
console.log('Check if this matches your Google Authenticator now!');