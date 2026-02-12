/**
 * Test Complete OTP Verification Flow
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuthService = require('./src/services/authServiceMongo');
const OTPModel = require('./src/models/OTPSchema');
const connectDB = require('./src/config/database');

async function testVerifyOTP() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Testing complete OTP verification flow...\n');
    
    const testEmail = 'sairamvemula15@gmail.com';
    
    // Step 1: Send OTP
    console.log('Step 1: Sending OTP...');
    const sendResult = await AuthService.sendOTP(testEmail);
    console.log('Send Result:', sendResult);
    
    if (!sendResult.ok) {
      console.log('❌ Failed to send OTP:', sendResult.error);
      await mongoose.connection.close();
      return;
    }
    
    // Step 2: Get the OTP from database (for testing)
    console.log('\nStep 2: Fetching OTP from database...');
    const otpDoc = await OTPModel.findByEmail(testEmail);
    if (!otpDoc) {
      console.log('❌ OTP not found in database');
      await mongoose.connection.close();
      return;
    }
    
    console.log('OTP Details:');
    console.log('  Code:', otpDoc.code);
    console.log('  Type of code:', typeof otpDoc.code);
    console.log('  Email:', otpDoc.email);
    console.log('  Expires at:', otpDoc.expiresAt);
    console.log('  Is expired:', otpDoc.isExpired());
    console.log('  Attempts:', otpDoc.attempts);
    console.log('  Is used:', otpDoc.isUsed);
    
    // Step 3: Test verification with correct code
    console.log('\nStep 3: Testing verification with correct code...');
    const code = otpDoc.code;
    const newPassword = 'newpassword123';
    
    console.log('Verifying with code:', code, '(type:', typeof code, ')');
    const verifyResult = await AuthService.verifyOTP(testEmail, code, newPassword);
    console.log('Verify Result:', verifyResult);
    
    if (verifyResult.ok) {
      console.log('\n✅ OTP verified successfully!');
      console.log('Token:', verifyResult.token);
      console.log('User:', verifyResult.user);
    } else {
      console.log('\n❌ Verification failed:', verifyResult.error);
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error in test:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testVerifyOTP();
