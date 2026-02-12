/**
 * Test script for Email Service
 */

require('dotenv').config();
const EmailService = require('./src/services/emailService');

async function testEmail() {
  console.log('Testing email service...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET');
  
  try {
    const testOTP = '123456';
    const testEmail = 'test@example.com'; // Change this to your test email
    
    console.log('\nSending test OTP email...');
    const result = await EmailService.sendOTPEmail(testEmail, testOTP, 'Test User');
    
    console.log('\nResult:', result);
    
    if (result.ok) {
      if (result.testMode) {
        console.log('✅ Email service in test mode - OTP:', result.testOTP);
      } else {
        console.log('✅ Email sent successfully!');
      }
    } else {
      console.log('❌ Email sending failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
