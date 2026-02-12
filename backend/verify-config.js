#!/usr/bin/env node

require('dotenv').config();

console.log('\n✅ Email Configuration Verification\n');
console.log('='.repeat(50));

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log('\n📧 EMAIL_USER:', emailUser || '❌ NOT SET');
console.log('🔑 EMAIL_PASSWORD:', emailPassword ? `✅ SET (${emailPassword.length} chars)` : '❌ NOT SET');

if (emailUser && emailUser !== 'your-email@gmail.com' && 
    emailPassword && emailPassword !== 'your-app-password-16-chars') {
  console.log('\n✅ Configuration looks good!');
  console.log('\n📝 Next: Test registration and OTP from login page');
} else {
  console.log('\n❌ Configuration incomplete');
}

console.log('\n' + '='.repeat(50) + '\n');
process.exit(0);
