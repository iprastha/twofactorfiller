const { totp } = require('otplib');
const crypto = require('crypto');

const secret = 'I65VU7K5ZQL7WB4E';
const expectedCode = '937918';

console.log('=== COMPREHENSIVE TOTP DEBUGGING ===');
console.log('Secret:', secret);
console.log('Expected code:', expectedCode);
console.log('Current time:', new Date().toLocaleString());

// Test different time bases
const now = Math.floor(Date.now() / 1000);
console.log('\n=== Testing Different Time Calculations ===');

// Try different time offsets (in case of timezone issues)
for (let offset = -120; offset <= 120; offset += 30) {
  const testTime = now + offset;
  try {
    const code = totp.generate(secret, testTime * 1000);
    if (code === expectedCode) {
      console.log(`✓ MATCH FOUND! Offset: ${offset}s, Time: ${new Date(testTime * 1000).toLocaleTimeString()}, Code: ${code}`);
    }
  } catch (err) {
    // Ignore errors
  }
}

// Test with manual HMAC calculation (in case otplib has issues)
console.log('\n=== Manual TOTP Calculation ===');

function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  let value = 0;
  
  for (let i = 0; i < base32.length; i++) {
    value = (value << 5) | alphabet.indexOf(base32[i]);
    bits += value.toString(2).padStart(5, '0');
  }
  
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    if (i + 8 <= bits.length) {
      bytes.push(parseInt(bits.substr(i, 8), 2));
    }
  }
  
  return Buffer.from(bytes);
}

function generateTOTPManual(secret, timeStep, algorithm = 'sha1', digits = 6) {
  try {
    const secretBuffer = base32Decode(secret);
    const timeBuffer = Buffer.allocUnsafe(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(timeStep, 4);
    
    const hmac = crypto.createHmac(algorithm, secretBuffer);
    hmac.update(timeBuffer);
    const digest = hmac.digest();
    
    const offset = digest[digest.length - 1] & 0xf;
    const code = (
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)
    ) % Math.pow(10, digits);
    
    return code.toString().padStart(digits, '0');
  } catch (err) {
    return `Error: ${err.message}`;
  }
}

// Test manual calculation with different algorithms and time steps
const timeStep30 = Math.floor(now / 30);
const timeStep60 = Math.floor(now / 60);

console.log('Manual SHA1 (30s step):', generateTOTPManual(secret, timeStep30, 'sha1', 6));
console.log('Manual SHA256 (30s step):', generateTOTPManual(secret, timeStep30, 'sha256', 6));
console.log('Manual SHA1 (60s step):', generateTOTPManual(secret, timeStep60, 'sha1', 6));
console.log('Manual SHA512 (30s step):', generateTOTPManual(secret, timeStep30, 'sha512', 6));

// Test around current time with manual calculation
console.log('\n=== Manual Calculation Time Range ===');
for (let offset = -2; offset <= 2; offset++) {
  const testTimeStep = timeStep30 + offset;
  const testTime = testTimeStep * 30;
  const code = generateTOTPManual(secret, testTimeStep, 'sha1', 6);
  const timeStr = new Date(testTime * 1000).toLocaleTimeString();
  const match = code === expectedCode ? ' ← MATCH!' : '';
  console.log(`${timeStr}: ${code}${match}`);
}

console.log('\n=== Trying Different Algorithms ===');
const algorithms = ['sha1', 'sha256', 'sha512'];
algorithms.forEach(alg => {
  const code = generateTOTPManual(secret, timeStep30, alg, 6);
  const match = code === expectedCode ? ' ← MATCH!' : '';
  console.log(`${alg.toUpperCase()}: ${code}${match}`);
});

console.log('\nIf no match found, the issue might be:');
console.log('1. Different secret key encoding');
console.log('2. Custom algorithm implementation');
console.log('3. Different epoch time base');
console.log('4. The authenticator app uses non-standard settings');