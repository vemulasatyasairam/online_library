#!/usr/bin/env node

/**
 * OTP Email Service Troubleshooter
 * Run this script to diagnose email sending issues
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 OTP Email Service Diagnostics\n');
console.log('=' .repeat(50));

// Check 1: Environment variables
console.log('\n1️⃣  Checking Environment Variables:');
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser) {
  console.log('❌ EMAIL_USER not set in .env file');
} else if (emailUser === 'your-email@gmail.com') {
  console.log('⚠️  EMAIL_USER is still the default placeholder');
  console.log('   Please update it with your actual Gmail address');
} else {
  console.log('✅ EMAIL_USER is set:', emailUser);
}

if (!emailPassword) {
  console.log('❌ EMAIL_PASSWORD not set in .env file');
} else if (emailPassword === 'your-app-password-16-chars') {
  console.log('⚠️  EMAIL_PASSWORD is still the default placeholder');
  console.log('   Please update it with your actual Gmail App Password');
} else if (emailPassword.length < 16) {
  console.log('⚠️  EMAIL_PASSWORD seems too short (should be 16 characters for Gmail App Password)');
  console.log('   Length:', emailPassword.length);
} else {
  console.log('✅ EMAIL_PASSWORD is set (length:', emailPassword.length, 'chars)');
}

// Check 2: Test connection
console.log('\n2️⃣  Testing Email Connection:');

if (!emailUser || !emailPassword || emailUser === 'your-email@gmail.com' || emailPassword === 'your-app-password-16-chars') {
  console.log('⚠️  Skipping connection test - credentials not configured');
  console.log('\n   👉 Please update .env file first:\n');
  console.log('      EMAIL_USER=your-email@gmail.com');
  console.log('      EMAIL_PASSWORD=your-16-char-app-password\n');
} else {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Email connection failed:');
      console.log('   Error:', error.message);
      console.log('\n   Common issues:');
      console.log('   • Wrong App Password (use 16-char generated password, not Gmail password)');
      console.log('   • 2-Step Verification not enabled on Gmail account');
      console.log('   • Network/firewall blocking SMTP port 587');
      console.log('   • Gmail account security settings');
    } else {
      console.log('✅ Email connection successful!');
      console.log('   Ready to send OTP emails');
    }

    // Check 3: .env file setup checklist
    console.log('\n3️⃣  Setup Checklist:');
    console.log('   ' + (emailUser && emailUser !== 'your-email@gmail.com' ? '✅' : '❌') + ' Email address configured');
    console.log('   ' + (emailPassword && emailPassword !== 'your-app-password-16-chars' ? '✅' : '❌') + ' App Password configured');
    console.log('   ' + (emailPassword && emailPassword.length === 16 ? '✅' : '⚠️ ') + ' App Password is 16 characters');

    // Check 4: Gmail setup checklist
    console.log('\n4️⃣  Gmail Setup Checklist:');
    console.log('   Go to https://myaccount.google.com/security');
    console.log('   ✅ 2-Step Verification must be ENABLED');
    console.log('   ✅ Generate App Password (16 characters)');
    console.log('   ✅ Use generated password in EMAIL_PASSWORD field');
    console.log('   ✅ Do NOT use your regular Gmail password');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📝 Next Steps:\n');
    if (!emailUser || emailUser === 'your-email@gmail.com') {
      console.log('1. Update EMAIL_USER in .env with your Gmail address');
      console.log('2. Restart backend server');
      console.log('3. Run this script again\n');
    } else if (!emailPassword || emailPassword === 'your-app-password-16-chars') {
      console.log('1. Generate App Password from Gmail settings');
      console.log('2. Update EMAIL_PASSWORD in .env');
      console.log('3. Restart backend server');
      console.log('4. Run this script again\n');
    } else if (error) {
      console.log('The email configuration needs to be fixed.');
      console.log('Check the error message above for details.\n');
    } else {
      console.log('✨ All checks passed! OTP emails should be sending now.\n');
    }

    process.exit(error ? 1 : 0);
  });
}
