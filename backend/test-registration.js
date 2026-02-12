#!/usr/bin/env node

/**
 * Comprehensive Diagnostic Test
 * Tests registration, database storage, and email sending
 */

require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./src/models/UserSchema');
const OTPModel = require('./src/models/OTPSchema');
const AuthService = require('./src/services/authServiceMongo');
const EmailService = require('./src/services/emailService');

const testEmail = 'test@example.com';
const testPassword = 'Test123456';
const testName = 'Test User';

async function runTests() {
  console.log('\n🧪 Comprehensive Diagnostic Test\n');
  console.log('='.repeat(60));

  try {
    // Test 1: MongoDB Connection
    console.log('\n1️⃣  Testing MongoDB Connection...');
    await mongoose.connect('mongodb://localhost:27017/online-library');
    console.log('✅ MongoDB connected');

    // Test 2: Check Email Configuration
    console.log('\n2️⃣  Checking Email Configuration...');
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    if (!emailUser || emailUser === 'your-email@gmail.com') {
      console.log('❌ EMAIL_USER not configured');
    } else {
      console.log('✅ EMAIL_USER configured:', emailUser);
    }

    if (!emailPassword || emailPassword === 'your-app-password-16-chars') {
      console.log('❌ EMAIL_PASSWORD not configured');
    } else {
      console.log('✅ EMAIL_PASSWORD configured (length:', emailPassword.length, ')');
    }

    // Test 3: Clean up test user if exists
    console.log('\n3️⃣  Cleaning up previous test data...');
    await UserModel.deleteOne({ email: testEmail });
    await OTPModel.deleteMany({ email: testEmail });
    console.log('✅ Cleaned up');

    // Test 4: Register User
    console.log('\n4️⃣  Testing User Registration...');
    console.log('   Registering:', testEmail);
    
    const registerResult = await AuthService.register(testEmail, testPassword, testName);
    
    if (registerResult.ok) {
      console.log('✅ User registered successfully');
      console.log('   Token:', registerResult.token ? '✅ Generated' : '❌ Not generated');
    } else {
      console.log('❌ Registration failed:', registerResult.error);
    }

    // Test 5: Check Database
    console.log('\n5️⃣  Checking MongoDB Database...');
    const savedUser = await UserModel.findByEmail(testEmail);
    
    if (savedUser) {
      console.log('✅ User found in database');
      console.log('   Email:', savedUser.email);
      console.log('   Name:', savedUser.name);
      console.log('   Created:', savedUser.createdAt);
    } else {
      console.log('❌ User NOT found in database');
      console.log('   Problem: User data is not being saved to MongoDB!');
    }

    // Test 6: Send OTP Email
    console.log('\n6️⃣  Testing OTP Email Sending...');
    
    if (!savedUser) {
      console.log('⚠️  Skipping OTP test - user not in database');
    } else {
      console.log('   Sending OTP to:', testEmail);
      
      // Generate OTP first
      const otp = await OTPModel.generateOTP(testEmail);
      console.log('   OTP Generated:', otp.code);

      // Try to send email
      const emailResult = await EmailService.sendOTPEmail(testEmail, otp.code, testName);
      
      if (emailResult.ok && emailResult.emailSent) {
        console.log('✅ OTP email sent successfully!');
      } else {
        console.log('❌ OTP email sending failed');
        console.log('   Reason:', emailResult.error);
      }
    }

    // Test 7: List all users
    console.log('\n7️⃣  Listing All Users in Database...');
    const allUsers = await UserModel.find({});
    
    if (allUsers.length === 0) {
      console.log('❌ No users in database');
    } else {
      console.log(`✅ Found ${allUsers.length} user(s):`);
      allUsers.forEach(u => {
        console.log(`   - ${u.email}`);
      });
    }

    // Clean up
    console.log('\n8️⃣  Cleaning up test data...');
    await UserModel.deleteOne({ email: testEmail });
    await OTPModel.deleteMany({ email: testEmail });
    console.log('✅ Test data removed');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('\nFull error:');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n' + '='.repeat(60));
    console.log('\n📋 Summary:\n');
    console.log('If you see ❌ errors above, here are the fixes:\n');
    console.log('Problem 1: User not saved to MongoDB');
    console.log('  → Check if MongoDB is running');
    console.log('  → Check MONGODB_URI in .env');
    console.log('  → Restart backend server\n');
    
    console.log('Problem 2: OTP email not sent');
    console.log('  → Configure EMAIL_USER in .env');
    console.log('  → Configure EMAIL_PASSWORD in .env (Gmail App Password)');
    console.log('  → Restart backend server\n');
    
    process.exit(0);
  }
}

runTests();
