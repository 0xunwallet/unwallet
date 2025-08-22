const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000', // Adjust this to your server URL
  username: 'agent1', // Replace with an actual username from your database
  chainId: 1328, // Sei Testnet
  tokenAddress: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED', // Replace with actual token address
  tokenAmount: '100'
};

// Simulate the same device making multiple requests
async function testStealthAddressReuse() {
  console.log('🧪 Testing Stealth Address Reuse Feature\n');

  try {
    // First request - should generate a new stealth address
    console.log('📤 Making first request...');
    const response1 = await axios.post(`${TEST_CONFIG.baseURL}/api/user/${TEST_CONFIG.username}/stealth`, {
      chainId: TEST_CONFIG.chainId,
      tokenAddress: TEST_CONFIG.tokenAddress,
      tokenAmount: TEST_CONFIG.tokenAmount,
      reuseSession: true
    });

    console.log('✅ First request successful');
    console.log(`📍 Stealth Address: ${response1.data.data.address}`);
    console.log(`🆔 Payment ID: ${response1.data.data.paymentId}`);
    console.log(`⏰ Event Listener: ${response1.data.data.eventListener ? 'Active' : 'Inactive'}\n`);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Second request - should return the same stealth address
    console.log('📤 Making second request (same device)...');
    const response2 = await axios.post(`${TEST_CONFIG.baseURL}/api/user/${TEST_CONFIG.username}/stealth`, {
      chainId: TEST_CONFIG.chainId,
      tokenAddress: TEST_CONFIG.tokenAddress,
      tokenAmount: TEST_CONFIG.tokenAmount,
      reuseSession: true
    });

    console.log('✅ Second request successful');
    console.log(`📍 Stealth Address: ${response2.data.data.address}`);
    console.log(`🆔 Payment ID: ${response2.data.data.paymentId}`);
    console.log(`⏰ Event Listener: ${response2.data.data.eventListener ? 'Active' : 'Inactive'}\n`);

    // Check if addresses are the same
    const addressesMatch = response1.data.data.address === response2.data.data.address;
    const paymentIdsSame = response1.data.data.paymentId === response2.data.data.paymentId;
    const isReusedSession = response2.data.message.includes('Reused existing');

    console.log('🔍 Analysis:');
    console.log(`   Addresses match: ${addressesMatch ? '✅ YES' : '❌ NO'}`);
    console.log(`   Payment IDs same: ${paymentIdsSame ? '✅ YES' : '❌ NO'}`);
    console.log(`   Session reused: ${isReusedSession ? '✅ YES' : '❌ NO'}`);
    console.log(`   Message: ${response2.data.message}\n`);

    if (addressesMatch && isReusedSession) {
      console.log('🎉 SUCCESS: Stealth address reuse feature is working correctly!');
      console.log('   - Same device gets the same stealth address');
      console.log('   - Existing payment session is reused');
      console.log('   - Nonce is not incremented unnecessarily');
    } else {
      console.log('❌ FAILURE: Stealth address reuse feature is not working as expected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the username exists in your database');
    } else if (error.response?.status === 400) {
      console.log('\n💡 Tip: Check the request parameters (chainId, tokenAddress, etc.)');
    }
  }
}

// Test with explicit device ID
async function testWithExplicitDeviceId() {
  console.log('\n🧪 Testing with Explicit Device ID\n');

  const deviceId = 'test_device_123';

  try {
    // First request with explicit device ID
    console.log('📤 Making first request with explicit device ID...');
    const response1 = await axios.post(`${TEST_CONFIG.baseURL}/api/user/${TEST_CONFIG.username}/stealth`, {
      chainId: TEST_CONFIG.chainId,
      tokenAddress: TEST_CONFIG.tokenAddress,
      tokenAmount: TEST_CONFIG.tokenAmount,
      deviceId: deviceId,
      reuseSession: true
    });

    console.log('✅ First request successful');
    console.log(`📍 Stealth Address: ${response1.data.data.address}`);
    console.log(`🆔 Device ID: ${deviceId}\n`);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Second request with same device ID
    console.log('📤 Making second request with same device ID...');
    const response2 = await axios.post(`${TEST_CONFIG.baseURL}/api/user/${TEST_CONFIG.username}/stealth`, {
      chainId: TEST_CONFIG.chainId,
      tokenAddress: TEST_CONFIG.tokenAddress,
      tokenAmount: TEST_CONFIG.tokenAmount,
      deviceId: deviceId,
      reuseSession: true
    });

    console.log('✅ Second request successful');
    console.log(`📍 Stealth Address: ${response2.data.data.address}`);
    console.log(`🆔 Device ID: ${deviceId}\n`);

    // Check if addresses are the same
    const addressesMatch = response1.data.data.address === response2.data.data.address;

    console.log('🔍 Analysis:');
    console.log(`   Addresses match: ${addressesMatch ? '✅ YES' : '❌ NO'}`);
    console.log(`   Message: ${response2.data.message}\n`);

    if (addressesMatch) {
      console.log('🎉 SUCCESS: Explicit device ID reuse feature is working correctly!');
    } else {
      console.log('❌ FAILURE: Explicit device ID reuse feature is not working as expected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Stealth Address Reuse Tests\n');
  
  await testStealthAddressReuse();
  await testWithExplicitDeviceId();
  
  console.log('\n✨ Test suite completed!');
}

// Check if axios is available
try {
  require('axios');
  runTests();
} catch (error) {
  console.log('📦 Installing axios...');
  console.log('Run: npm install axios');
  console.log('Then run: node test-stealth-reuse.js');
}
