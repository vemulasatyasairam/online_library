#!/usr/bin/env node

/**
 * Check registered users in MongoDB
 */

const mongoose = require('mongoose');
const UserModel = require('./src/models/UserSchema');

async function checkUsers() {
  try {
    console.log('\n🔍 Checking registered users...\n');
    
    await mongoose.connect('mongodb://localhost:27017/online-library');
    console.log('✅ Connected to MongoDB\n');

    const users = await UserModel.find({});
    
    if (users.length === 0) {
      console.log('❌ No users registered yet\n');
      console.log('📝 Next steps:');
      console.log('   1. Go to login page');
      console.log('   2. Click "Register"');
      console.log('   3. Create an account with email and password');
      console.log('   4. Then you can reset password using OTP\n');
    } else {
      console.log(`📋 Found ${users.length} registered user(s):\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
        if (user.name) console.log(`      Name: ${user.name}`);
        console.log(`      Registered: ${user.createdAt.toLocaleDateString()}\n`);
      });
      
      console.log('✅ These users can reset password using OTP');
      console.log('   (Other emails will show "User not found")\n');
    }

    await mongoose.connection.close();
    console.log('MongoDB connection closed\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
