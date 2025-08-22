# Stealth Address Reuse Feature

## Overview

This feature ensures that when a user queries for a stealth address from the same device/machine/IP, the system returns the same address instead of generating a new one each time. This provides consistency and prevents unnecessary nonce increments.

## Implementation Details

### Key Changes Made

1. **New Method in PaymentSessionService**: Added `getLastUsedStealthAddressForDevice()` method to retrieve the last used stealth address for a specific device.

2. **Enhanced Device Session Logic**: Modified the stealth address generation flow to check for existing stealth addresses before generating new ones.

3. **Conditional Nonce Increment**: The nonce is only incremented when generating a new stealth address, not when reusing an existing one.

4. **Conditional Database Storage**: Stealth addresses are only stored in the database when they are newly generated, not when reusing existing ones.

5. **Improved Device ID Generation**: Enhanced the device ID generation to use user agent and IP address for consistent device identification.

### How It Works

1. **Device Identification**: The system generates a device ID based on user agent and IP address if not provided. The device ID is created using a hash function that combines the user agent and IP address for consistent identification.

2. **Active Session Check**: First, it checks for an active payment session for the device (if `reuseSession` is true).

3. **Last Used Address Check**: If no active session exists, it checks for the last used stealth address for this device.

4. **Address Reuse**: If a last used stealth address is found, it:
   - Creates a new payment session for the existing address
   - Updates the device session with the current payment ID
   - Starts a new event listener for payment detection
   - Returns the existing stealth address without incrementing the nonce

5. **New Address Generation**: If no existing address is found, it:
   - Generates a new stealth address
   - Increments the user's nonce
   - Stores the address in the database
   - Creates payment session and event listener

### Device ID Generation

The device ID is generated using a hash function that combines:
- User Agent string
- IP Address

This ensures that the same device (same browser/IP combination) will always get the same device ID, enabling consistent stealth address reuse.

### Database Schema

The feature uses the existing `device_sessions` table with the `lastUsedStealthAddress` field:

```sql
CREATE TABLE device_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "deviceId" VARCHAR(100) NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "lastActivePaymentId" VARCHAR(100),
    "lastUsedStealthAddress" VARCHAR(42), -- Last stealth address for this device
    "userAgent" TEXT,
    "ipAddress" INET,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastAccessedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE("deviceId", "userId")
);
```

### API Usage

The feature works with the existing `/api/user/:username/stealth` endpoint:

```javascript
// Request with device ID for consistent address return
const response = await fetch('/api/user/username/stealth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chainId: 713715,
    tokenAddress: '0x...',
    tokenAmount: '100',
    deviceId: 'dev_abc123', // Optional: will be generated if not provided
    reuseSession: true // Optional: enables session reuse
  })
});
```

### Benefits

1. **Consistency**: Same device always gets the same stealth address
2. **Efficiency**: Prevents unnecessary nonce increments
3. **User Experience**: Users can rely on consistent addresses for their devices
4. **Resource Optimization**: Reduces database writes and computational overhead

### Logging

The feature includes comprehensive logging to track:
- Device session creation and updates
- Stealth address reuse events
- Nonce increment decisions
- Database storage operations

### Error Handling

- Graceful fallback to new address generation if reuse logic fails
- Detailed error logging for debugging
- Non-blocking errors that don't prevent stealth address generation

## Testing

A test script `test-stealth-reuse.js` is provided to verify the feature:

1. Install axios: `npm install axios`
2. Update the test configuration in the script
3. Run: `node test-stealth-reuse.js`

The test will:
1. Make a request to generate a stealth address
2. Make another request with the same device
3. Verify that the same stealth address is returned
4. Check that the nonce hasn't been incremented
5. Verify that no duplicate database records are created

## Future Enhancements

- Add device fingerprinting for more accurate device identification
- Implement address expiration policies
- Add metrics for reuse frequency and success rates
- Consider implementing address rotation policies for security
