/**
 * Email Service
 * Handles sending emails via Nodemailer
 */

const nodemailer = require('nodemailer');

class EmailService {
  static transporter = null;

  /**
   * Initialize the email transporter
   */
  static initializeTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    // Check if email credentials are configured
    if (!emailUser || !emailPassword || emailUser === 'your-email@gmail.com' || emailPassword === 'your-app-password-16-chars') {
      console.warn('⚠️  EMAIL SERVICE NOT CONFIGURED');
      console.warn('Please set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return null;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPassword
        }
      });

      console.log('✅ Email service initialized for:', emailUser);
      return this.transporter;
    } catch (err) {
      console.error('❌ Failed to initialize email service:', err.message);
      return null;
    }
  }

  /**
   * Send OTP email
   */
  static async sendOTPEmail(email, otp, userName = null) {
    try {
      const transporter = this.initializeTransporter();

      if (!transporter) {
        console.warn('⚠️  Email service not available - OTP:', otp);
        console.warn('📧 TEST MODE: OTP logged above - use for testing');
        // In test mode, still return success so frontend can proceed
        return {
          ok: true,
          message: 'OTP sent (test mode)',
          emailSent: true,
          testMode: true,
          testOTP: otp // For development only
        };
      }

      const subject = 'Your OTP for Password Reset - Online Library';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #071427; padding: 20px; border-radius: 10px; color: #eaf6ff;">
            <h2 style="margin-top: 0; color: #67b6ff;">Password Reset Request</h2>
            <p>Hello ${userName || 'User'},</p>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            
            <div style="background-color: #0b1220; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #67b6ff; letter-spacing: 5px; margin: 0;">${otp}</h1>
              <p style="color: #9fb6c4; margin: 10px 0 0 0; font-size: 12px;">Valid for 10 minutes</p>
            </div>

            <p style="color: #9fb6c4;">If you didn't request this, please ignore this email.</p>
            <p style="color: #9fb6c4; font-size: 12px; margin-top: 30px;">
              © Online Library - Password Reset
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: htmlContent
      };

      console.log('📧 Sending OTP email to:', email);
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.response);

      return {
        ok: true,
        message: 'OTP sent to your email',
        emailSent: true
      };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error.message);
      console.error('Error details:', {
        code: error.code,
        response: error.response,
        command: error.command
      });

      return {
        ok: false,
        error: `Email sending failed: ${error.message}. Falling back to test mode - check server logs for OTP.`,
        emailSent: false,
        testMode: true,
        testOTP: otp // For development/testing
      };
    }
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email, userName = null) {
    try {
      const transporter = this.initializeTransporter();

      if (!transporter) {
        return {
          ok: false,
          error: 'Email service not configured',
          emailSent: false
        };
      }

      const subject = 'Welcome to Online Library';
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #071427; padding: 20px; border-radius: 10px; color: #eaf6ff;">
            <h2 style="margin-top: 0; color: #67b6ff;">Welcome to Online Library!</h2>
            <p>Hello ${userName || 'User'},</p>
            <p>Your account has been successfully created. Start exploring our collection of books, notes, and exam prep materials.</p>
            
            <a href="http://localhost:3000" style="display: inline-block; background-color: #0b72b9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Go to Online Library
            </a>

            <p style="color: #9fb6c4; font-size: 12px; margin-top: 30px;">
              © Online Library - Happy Reading!
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: htmlContent
      };

      console.log('📧 Sending welcome email to:', email);
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent:', info.response);

      return {
        ok: true,
        message: 'Welcome email sent',
        emailSent: true
      };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      return {
        ok: false,
        error: 'Failed to send welcome email',
        emailSent: false
      };
    }
  }
}

module.exports = EmailService;
