const { totp, TOTP } = require('otplib');

function testSecret(secret, label = '') {
  console.log(`\n=== Testing Secret: ${secret} ${label} ===`);
  
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const timestamp = new Date().toLocaleTimeString();
    
    console.log(`Current time: ${timestamp} (Unix: ${currentTime})`);
    console.log(`Time window (30s): ${Math.floor(currentTime / 30)}`);
    
    // Test with different configurations
    const configs = [
      { algorithm: 'sha1', digits: 6, step: 30, name: 'Standard (SHA1, 6 digits, 30s)' },
      { algorithm: 'sha256', digits: 6, step: 30, name: 'SHA256 (6 digits, 30s)' },
      { algorithm: 'sha1', digits: 8, step: 30, name: 'Extended (SHA1, 8 digits, 30s)' },
      { algorithm: 'sha1', digits: 6, step: 60, name: 'Long period (SHA1, 6 digits, 60s)' },
    ];
    
    configs.forEach((config, i) => {
      try {
        const totpInstance = new TOTP({
          secret,
          algorithm: config.algorithm,
          digits: config.digits,
          step: config.step
        });
        const code = totpInstance.generate();
        console.log(`Config ${i + 1} ${config.name}: ${code}`);
      } catch (err) {
        console.log(`Config ${i + 1} ${config.name} failed: ${err.message}`);
      }
    });
    
    // Also test with default totp
    try {
      const defaultCode = totp.generate(secret);
      console.log(`Default otplib config: ${defaultCode}`);
    } catch (err) {
      console.log(`Default config failed: ${err.message}`);
    }
    
  } catch (error) {
    console.error(`Error testing secret: ${error.message}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const secret = args[0] || 'I65VU7K5ZQL7WB4E';
  
  console.log('TOTP Debug Tool');
  console.log('===============');
  
  // Test the provided secret
  testSecret(secret, '(your key)');
  
  // Test with example key for comparison
  if (secret !== 'JBSWY3DPEHPK3PXP') {
    testSecret('JBSWY3DPEHPK3PXP', '(example key)');
  }
  
  console.log('\n=== Secret Key Analysis ===');
  console.log(`Length: ${secret.length} characters`);
  console.log(`Contains only base32 chars (A-Z, 2-7): ${/^[A-Z2-7]+$/.test(secret)}`);
  console.log(`Padding needed: ${secret.length % 8 !== 0 ? 8 - (secret.length % 8) : 0} characters`);
  
  // Try with padding if needed
  if (secret.length % 8 !== 0) {
    const padded = secret + '='.repeat(8 - (secret.length % 8));
    console.log(`Padded version: ${padded}`);
    testSecret(padded, '(padded)');
  }
}

if (require.main === module) {
  main();
}