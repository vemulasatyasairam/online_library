#!/usr/bin/env node

/**
 * Interactive OTP Email Setup Guide
 * Follow the prompts to configure Gmail email service
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function setup() {
  console.log('\n🚀 OTP Email Service Setup\n');
  console.log('=' .repeat(60));
  
  console.log('\n📋 Prerequisites:');
  console.log('1. You need a Gmail account');
  console.log('2. 2-Step Verification must be enabled');
  console.log('3. You need to generate an App Password (16 characters)');
  
  console.log('\n📖 How to generate Gmail App Password:');
  console.log('   1. Go to: https://myaccount.google.com');
  console.log('   2. Click "Security" in left menu');
  console.log('   3. Enable "2-Step Verification" (if not already)');
  console.log('   4. Find and click "App passwords"');
  console.log('   5. Select "Mail" and "Windows Computer"');
  console.log('   6. Copy the 16-character password Google generates');
  
  console.log('\n' + '='.repeat(60));
  
  const email = await question('\n📧 Enter your Gmail address: ');
  const password = await question('🔑 Enter your 16-character App Password: ');
  
  if (!email || !password) {
    console.log('\n❌ Error: Email and password are required');
    rl.close();
    process.exit(1);
  }
  
  if (!email.includes('@gmail.com')) {
    console.log('\n⚠️  Warning: This doesn\'t look like a Gmail address');
    const confirm = await question('Continue anyway? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Setup cancelled');
      rl.close();
      process.exit(0);
    }
  }
  
  if (password.length !== 16 && password.length !== 22) {
    console.log('\n⚠️  Warning: App Password should be 16 characters (with or without hyphens)');
    const confirm = await question('Continue anyway? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Setup cancelled');
      rl.close();
      process.exit(0);
    }
  }
  
  // Read current .env
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Replace email
  envContent = envContent.replace(
    /EMAIL_USER=.*/,
    `EMAIL_USER=${email}`
  );
  
  // Replace password
  envContent = envContent.replace(
    /EMAIL_PASSWORD=.*/,
    `EMAIL_PASSWORD=${password}`
  );
  
  // Write updated .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Configuration saved to .env file');
  console.log('\n📝 Next steps:');
  console.log('   1. Restart your backend server');
  console.log('   2. Run: npm start');
  console.log('   3. Run: node check-email.js (to verify)');
  console.log('   4. Test sending OTP from the login page');
  
  console.log('\n🎉 Setup complete!\n');
  
  rl.close();
  process.exit(0);
}

setup().catch(err => {
  console.error('Setup error:', err);
  rl.close();
  process.exit(1);
});
