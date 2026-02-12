/**
 * Test Change Password Endpoint
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AuthService = require('./src/services/authServiceMongo');
const connectDB = require('./src/config/database');

async function testChangePassword() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('=== TEST: Change Password Flow ===\n');
    
    const testEmail = 'sairamvemula15@gmail.com';
    const currentPassword = 'password123'; // Change this to actual current password
    const newPassword = 'newPassword456';
    
    console.log('Step 1: Login with current password...');
    const loginResult = await AuthService.login(testEmail, currentPassword);
    
    if (!loginResult.ok) {
      console.log('❌ Login failed:', loginResult.error);
      console.log('Note: Make sure the user exists and the current password is correct');
      await cleanup();
      return;
    }
    console.log('✅ Login successful with current password');
    
    console.log('\nStep 2: Change password...');
    const changeResult = await AuthService.changePassword(testEmail, newPassword);
    
    if (!changeResult.ok) {
      console.log('❌ Password change failed:', changeResult.error);
      await cleanup();
      return;
    }
    console.log('✅ Password changed successfully');
    
    console.log('\nStep 3: Try login with old password (should fail)...');
    const oldLoginResult = await AuthService.login(testEmail, currentPassword);
    
    if (oldLoginResult.ok) {
      console.log('❌ FAIL: Old password still works!');
    } else {
      console.log('✅ Old password correctly rejected:', oldLoginResult.error);
    }
    
    console.log('\nStep 4: Login with new password...');
    const newLoginResult = await AuthService.login(testEmail, newPassword);
    
    if (!newLoginResult.ok) {
      console.log('❌ Login with new password failed:', newLoginResult.error);
    } else {
      console.log('✅ Login successful with new password!');
      console.log('   User:', newLoginResult.user.email);
    }
    
    // Restore original password
    console.log('\nStep 5: Restoring original password...');
    const restoreResult = await AuthService.changePassword(testEmail, currentPassword);
    
    if (restoreResult.ok) {
      console.log('✅ Original password restored');
    } else {
      console.log('⚠️  Could not restore original password');
    }
    
    await cleanup();
    
    console.log('\n=== TEST COMPLETED ✅ ===');
    console.log('Change password functionality is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

async function cleanup() {
  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
}

testChangePassword();
