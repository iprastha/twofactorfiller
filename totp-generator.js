const speakeasy = require('speakeasy');

class TOTPGenerator {
  constructor(secret) {
    this.secret = secret;
    this.intervalId = null;
  }

  generateOTP() {
    return speakeasy.totp({
      secret: this.secret,
      encoding: 'base32',
      time: Math.floor(Date.now() / 1000),
      step: 30,
      digits: 6,
      algorithm: 'sha1'
    });
  }

  getRemainingTime() {
    const now = Math.floor(Date.now() / 1000);
    const period = 30; // TOTP period in seconds
    const timeRemaining = period - (now % period);
    return timeRemaining;
  }

  displayOTP() {
    console.clear();
    const currentOTP = this.generateOTP();
    const remainingTime = this.getRemainingTime();
    const timestamp = new Date().toLocaleTimeString();
    
    console.log('╔═══════════════════════════════════════╗');
    console.log('║        2FA OTP Generator              ║');
    console.log('╠═══════════════════════════════════════╣');
    console.log(`║ Current Time: ${timestamp.padEnd(18)} ║`);
    console.log(`║ Current OTP:  ${currentOTP.padEnd(18)} ║`);
    console.log(`║ Time Left:    ${remainingTime}s${' '.repeat(16)} ║`);
    console.log('╚═══════════════════════════════════════╝');
    console.log('\nPress Ctrl+C to exit');
    
    // Progress bar for visual countdown
    const progress = Math.floor(((30 - remainingTime) / 30) * 20);
    const progressBar = '█'.repeat(progress) + '░'.repeat(20 - progress);
    console.log(`\nProgress: [${progressBar}] ${Math.floor(((30 - remainingTime) / 30) * 100)}%`);
  }

  start() {
    console.log('Starting TOTP Generator...\n');
    
    // Display immediately
    this.displayOTP();
    
    // Update every second
    this.intervalId = setInterval(() => {
      this.displayOTP();
    }, 1000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\nShutting down TOTP Generator...');
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      process.exit(0);
    });
  }
}

function parseOtpAuthUri(uri) {
  try {
    const url = new URL(uri);
    
    if (url.protocol !== 'otpauth:') {
      throw new Error('Invalid protocol. Expected otpauth://');
    }
    
    if (url.hostname !== 'totp') {
      throw new Error('Only TOTP is supported');
    }
    
    const secret = url.searchParams.get('secret');
    if (!secret) {
      throw new Error('No secret found in URI');
    }
    
    const issuer = url.searchParams.get('issuer');
    const label = decodeURIComponent(url.pathname.substring(1));
    
    return {
      secret,
      issuer,
      label,
      algorithm: url.searchParams.get('algorithm') || 'SHA1',
      digits: parseInt(url.searchParams.get('digits')) || 6,
      period: parseInt(url.searchParams.get('period')) || 30
    };
  } catch (error) {
    throw new Error(`Failed to parse otpauth URI: ${error.message}`);
  }
}

// Example usage
function main() {
  // Get secret from command line argument or use default example
  const args = process.argv.slice(2);
  let secret;
  let displayInfo = null;

  if (args.length > 0) {
    const input = args[0];
    
    // Check if input is an otpauth URI (QR code content)
    if (input.startsWith('otpauth://')) {
      try {
        const parsed = parseOtpAuthUri(input);
        secret = parsed.secret;
        displayInfo = {
          issuer: parsed.issuer,
          label: parsed.label,
          algorithm: parsed.algorithm,
          digits: parsed.digits,
          period: parsed.period
        };
        console.log('Parsed otpauth URI successfully:');
        if (parsed.issuer) console.log(`Issuer: ${parsed.issuer}`);
        if (parsed.label) console.log(`Account: ${parsed.label}`);
        console.log(`Algorithm: ${parsed.algorithm}, Digits: ${parsed.digits}, Period: ${parsed.period}s\n`);
      } catch (error) {
        console.error('Error parsing otpauth URI:', error.message);
        process.exit(1);
      }
    } else {
      // Assume it's a raw secret key
      secret = input;
    }
  } else {
    // Example secret key (base32 encoded) - this would typically come from a 2FA setup
    secret = 'JBSWY3DPEHPK3PXP';
    console.log('Using example secret key. To use your own secret or QR code URI, run:');
    console.log('node totp-generator.js YOUR_SECRET_KEY');
    console.log('or');
    console.log('node totp-generator.js "otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"\n');
  }

  try {
    const generator = new TOTPGenerator(secret);
    generator.start();
  } catch (error) {
    console.error('Error starting TOTP generator:', error.message);
    console.log('\nPlease ensure your secret key is valid base32 encoded string or valid otpauth URI.');
    console.log('\nNote: Now using speakeasy library for RFC 6238 compliance and Google Authenticator compatibility.');
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = TOTPGenerator;