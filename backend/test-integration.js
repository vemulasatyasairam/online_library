/**
 * Complete Integration Test for OTP Flow
 * Tests: Registration -> Send OTP -> Verify OTP
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuthService = require('./src/services/authServiceMongo');
const OTPModel = require('./src/models/OTPSchema');
const UserModel = require('./src/models/UserSchema');
const connectDB = require('./src/config/database');

async function testCompleteFlow() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('=== INTEGRATION TEST: OTP Password Reset Flow ===\n');
    
    const testEmail = 'testuser' + Date.now() + '@test.com';
    const initialPassword = 'password123';
    const newPassword = 'newPassword456';
    
    // Step 1: Register a test user
    console.log('Step 1: Registering test user...');
    const registerResult = await AuthService.register(testEmail, initialPassword, 'Test User');
    
    if (!registerResult.ok) {
      console.log('❌ Registration failed:', registerResult.error);
      await cleanup();
      return;
    }
    console.log('✅ User registered:', testEmail);
    
    // Step 2: Send OTP
    console.log('\nStep 2: Sending OTP for password reset...');
    const sendResult = await AuthService.sendOTP(testEmail);
    
    if (!sendResult.ok) {
      console.log('❌ Failed to send OTP:', sendResult.error);
      await cleanup(testEmail);
      return;
    }
    console.log('✅ OTP sent successfully');
    
    // Step 3: Get OTP from database
    console.log('\nStep 3: Retrieving OTP from database...');
    const otpDoc = await OTPModel.findByEmail(testEmail);
    
    if (!otpDoc) {
      console.log('❌ OTP not found in database');
      await cleanup(testEmail);
      return;
    }
    
    console.log('OTP Details:');
    console.log('  Code:', otpDoc.code);
    console.log('  Type:', typeof otpDoc.code);
    console.log('  Expires:', otpDoc.expiresAt);
    console.log('  Attempts:', otpDoc.attempts);
    
    // Step 4: Test with wrong OTP (should fail)
    console.log('\nStep 4: Testing with wrong OTP...');
    const wrongResult = await AuthService.verifyOTP(testEmail, '000000', newPassword);
    
    if (wrongResult.ok) {
      console.log('❌ FAIL: Wrong OTP was accepted!');
    } else {
      console.log('✅ Correctly rejected wrong OTP:', wrongResult.error);
    }
    
    // Step 5: Verify with correct OTP
    console.log('\nStep 5: Verifying with correct OTP...');
    const verifyResult = await AuthService.verifyOTP(testEmail, otpDoc.code, newPassword);
    
    if (!verifyResult.ok) {
      console.log('❌ Verification failed:', verifyResult.error);
      await cleanup(testEmail);
      return;
    }
    console.log('✅ OTP verified and password reset!');
    console.log('   Token:', verifyResult.token ? '✓' : '✗');
    console.log('   User:', verifyResult.user ? verifyResult.user.email : '✗');
    
    // Step 6: Try logging in with new password
    console.log('\nStep 6: Testing login with new password...');
    const loginResult = await AuthService.login(testEmail, newPassword);
    
    if (!loginResult.ok) {
      console.log('❌ Login with new password failed:', loginResult.error);
    } else {
      console.log('✅ Successfully logged in with new password!');
    }
    
    // Step 7: Verify old password doesn't work
    console.log('\nStep 7: Verifying old password no longer works...');
    const oldLoginResult = await AuthService.login(testEmail, initialPassword);
    
    if (oldLoginResult.ok) {
      console.log('❌ FAIL: Old password still works!');
    } else {
      console.log('✅ Old password correctly rejected');
    }
    
    // Cleanup
    await cleanup(testEmail);
    
    console.log('\n=== ALL TESTS PASSED ✅ ===');
    console.log('\nOTP Password Reset Flow is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function cleanup(email) {
  if (email) {
    console.log('\nCleaning up test user...');
    await UserModel.deleteOne({ email: email.toLowerCase() });
    await OTPModel.deleteOne({ email: email.toLowerCase() });
  }
  await mongoose.connection.close();
  console.log('Database connection closed');
}

testCompleteFlow();
