import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development: Create test account for Ethereal Email
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.warn('Failed to create Ethereal test account, using console logging only');
      return null;
    }
  }
};

export const sendPasswordResetEmail = async (email, resetToken, req) => {
  try {
    const resetUrl = `${req.protocol}://${req.get('host').replace(':5002', ':3001')}/reset-password?token=${resetToken}`;
    
    // Always log for development
    console.log('\n📧 PASSWORD RESET EMAIL');
    console.log('═══════════════════════');
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${resetToken}`);
    console.log('═══════════════════════\n');
    
    const transporter = await createTransporter();
    
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Bug Tracker <noreply@bugtracker.com>',
        to: email,
        subject: 'Password Reset Request - Bug Tracker',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Bug Tracker</h1>
            </div>
            
            <div style="padding: 40px 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                You requested a password reset for your Bug Tracker account. Click the button below to reset your password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
              </p>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              © 2024 Bug Tracker. All rights reserved.
            </div>
          </div>
        `,
        text: `
          Password Reset Request - Bug Tracker
          
          You requested a password reset for your Bug Tracker account.
          
          Click this link to reset your password: ${resetUrl}
          
          This link will expire in 10 minutes. If you didn't request this reset, please ignore this email.
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
    }
    
    return { success: true, messageId: 'console-only' };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    console.log('\n📧 WELCOME EMAIL');
    console.log('═══════════════════');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log('═══════════════════\n');
    
    const transporter = await createTransporter();
    
    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Bug Tracker <noreply@bugtracker.com>',
        to: email,
        subject: 'Welcome to Bug Tracker!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Bug Tracker!</h1>
            </div>
            
            <div style="padding: 40px 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Thank you for joining Bug Tracker! Your account has been successfully created.
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                You can now start creating projects, tracking issues, and collaborating with your team.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" 
                   style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Get Started
                </a>
              </div>
            </div>
            
            <div style="background: #e9ecef; padding: 20px; text-align: center; color: #666; font-size: 12px;">
              © 2024 Bug Tracker. All rights reserved.
            </div>
          </div>
        `,
        text: `
          Welcome to Bug Tracker!
          
          Hi ${name}!
          
          Thank you for joining Bug Tracker! Your account has been successfully created.
          
          You can now start creating projects, tracking issues, and collaborating with your team.
          
          Visit: ${process.env.FRONTEND_URL || 'http://localhost:3001'}
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Welcome email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      
      return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
    }
    
    return { success: true, messageId: 'console-only' };
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};