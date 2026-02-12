/**
 * Test OTP Flow
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuthService = require('./src/services/authServiceMongo');
const connectDB = require('./src/config/database');

async function testOTPFlow() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Testing OTP flow...\n');
    
    // Test with an email (make sure this user exists in your database)
    const testEmail = 'sairamvemula15@gmail.com'; // Using actual registered user
    
    console.log('1. Sending OTP to:', testEmail);
    const sendResult = await AuthService.sendOTP(testEmail);
    console.log('Send OTP Result:', sendResult);
    
    if (sendResult.ok) {
      console.log('\n✅ OTP send successful!');
      if (sendResult.code) {
        console.log('OTP Code:', sendResult.code);
      }
    } else {
      console.log('\n❌ OTP send failed:', sendResult.error);
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error in test:', error);
    process.exit(1);
  }
}

testOTPFlow();
