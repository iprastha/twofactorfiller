# 2FA OTP Generator

A proof of concept Time-based One-Time Password (TOTP) generator that mimics how authenticator apps work. This application generates 6-digit OTP codes that refresh every 30 seconds, just like Google Authenticator, Authy, or other 2FA apps.

## Features

- RFC 6238 compliant TOTP generation using the `speakeasy` library
- Real-time OTP generation with 30-second intervals
- Visual countdown timer showing time remaining
- Progress bar indicating current period position
- Clean terminal interface with auto-refresh
- Support for base32 encoded secret keys
- Graceful shutdown with Ctrl+C

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Using the Example Secret Key

Run the application with the built-in example:

```bash
npm start
```

This uses the example secret key `JBSWY3DPEHPK3PXP` for demonstration purposes.

### Using Your Own Secret Key

To use your own 2FA secret key:

```bash
node totp-generator.js YOUR_SECRET_KEY_HERE
```

Example:
```bash
node totp-generator.js JBSWY3DPEHPK3PXP
```

### Using QR Code Content (otpauth URI)

You can also use the complete otpauth URI that QR codes contain:

```bash
node totp-generator.js "otpauth://totp/Example:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example"
```

Example with a real QR code URI:
```bash
node totp-generator.js "otpauth://totp/totp@authenticationtest.com?secret=I65VU7K5ZQL7WB4E"
```

The application will automatically parse the URI and extract:
- The secret key
- Issuer information  
- Account label
- Algorithm, digits, and period settings

**This is the recommended method** as it ensures you're using the exact same parameters as the service intended.

## How to Get Your Secret Key or QR Code Content

When setting up 2FA on a service:

### Method 1: QR Code Content (Recommended)
1. **Scan QR Code**: Use a QR code reader app to decode the QR code
2. **Extract URI**: The QR code contains an `otpauth://` URI that you can use directly
3. **Use Full URI**: Copy the entire URI and pass it to the application in quotes
4. **Example URI format**: `otpauth://totp/service@email.com?secret=SECRETKEY&issuer=ServiceName`

### Method 2: Manual Secret Key Entry
1. **QR Code Method**: Most services show a QR code. Look for a "Can't scan?" or "Manual entry" option
2. **Manual Entry**: Services usually provide a base32 encoded secret key as an alternative to QR codes
3. **Format**: The secret key should be a base32 encoded string (letters A-Z and numbers 2-7)

## Example Output

```
╔═══════════════════════════════════════╗
║        2FA OTP Generator              ║
╠═══════════════════════════════════════╣
║ Current Time: 3:45:22 PM              ║
║ Current OTP:  123456                  ║
║ Time Left:    18s                     ║
╚═══════════════════════════════════════╝

Press Ctrl+C to exit

Progress: [████████████░░░░░░░░] 60%
```

## How It Works

This application implements the TOTP algorithm (RFC 6238) which:

1. Takes a shared secret key
2. Combines it with the current time (in 30-second windows)
3. Uses HMAC-SHA1 to generate a hash
4. Extracts a 6-digit code from the hash

The codes change every 30 seconds and are synchronized with authenticator apps that use the same secret key.

## Security Notes

- Keep your secret keys secure and never share them
- This is a proof of concept for educational purposes
- In production, secret keys should be stored securely (encrypted, not in plain text)
- The example secret key is for demonstration only

## Dependencies

- [speakeasy](https://www.npmjs.com/package/speakeasy) - RFC 6238 compliant TOTP library with perfect Google Authenticator compatibility
- ~~otplib~~ - Removed due to RFC 6238 compliance issues in v12.0.1

## License

MIT