// server/routes/verifiedEmails.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const router = express.Router();
const prisma = new PrismaClient();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY); // Use the correct API key

// POST /api/verified-emails/send-verification
router.post('/send-verification', async (req, res) => {
  try {
    console.log('Received verification request:', req.body);
    
    const { email, fromName } = req.body;
    
    // Validate inputs
    if (!email || !fromName) {
      console.error('Missing required fields:', { email, fromName });
      return res.status(400).json({ error: "Email and fromName are required" });
    }
    
    // Generate a verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log('Generated token:', verificationToken);
    
    // Set expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Save verification token to database
    console.log('Saving to database...');
    const dbRecord = await prisma.campaignVerifiedEmail.upsert({
      where: { email },
      update: { 
        verificationToken, 
        isVerified: false,
        verifiedAt: null,
        expiresAt,
        fromName
      },
      create: { 
        email, 
        verificationToken, 
        isVerified: false,
        expiresAt,
        fromName
      }
    });
    console.log('Database record saved:', dbRecord);
    
    // Create verification URL - Update this to your actual domain
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
    console.log('Verification URL:', verificationUrl);
    
    // Setup email data for SendGrid (REAL EMAIL DELIVERY)
    const msg = {
      to: email, // This will be the ACTUAL recipient
      from: {
        email: process.env.SENDGRID_FROM_EMAIL, // Your verified sender email
        name: fromName
      },
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0; font-size: 28px;">Email Verification</h1>
              <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Please verify your email address to continue</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        display: inline-block; 
                        font-weight: bold; 
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                        transition: transform 0.2s;">
                ✓ Verify Email Address
              </a>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #4CAF50; border-radius: 4px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px; margin: 10px 0 0 0; border: 1px solid #ddd;">
                ${verificationUrl}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 5px 0;">This link will expire in 24 hours</p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">If you didn't request this verification, please ignore this email</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #333; font-size: 16px; margin: 0;">
                Best regards,<br>
                <strong>${fromName}</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    };
    
    // Send the REAL email using SendGrid
    console.log('Sending REAL email with SendGrid to:', email);
    await sgMail.send(msg);
    console.log('✅ REAL email sent successfully to recipient');
    
    res.json({ 
      success: true, 
      message: "Verification email sent successfully to recipient",
      recipient: email
    });
    
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    
    // Better error handling for SendGrid
    let errorMessage = "Failed to send verification email";
    if (error.response?.body?.errors) {
      errorMessage = error.response.body.errors.map(err => err.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/verified-emails/verify/:token - VERIFICATION ENDPOINT
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('🔍 Verification request received');
    console.log('📝 Token from URL:', token);
    
    // Find the verification record by token
    const record = await prisma.campaignVerifiedEmail.findFirst({
      where: { verificationToken: token }
    });
    
    if (!record) {
      console.error('❌ Token not found in database');
      return res.status(404).json({ 
        error: "Invalid verification token",
        details: "The token does not exist in our database"
      });
    }
    
    console.log('✅ Token found in database');
    console.log('📧 Email associated with token:', record.email);
    
    // Check if token is expired
    const now = new Date();
    console.log('⏰ Current time:', now);
    console.log('⏳ Token expires at:', record.expiresAt);
    
    if (now > record.expiresAt) {
      console.error('❌ Token expired');
      return res.status(400).json({ 
        error: "Verification token has expired",
        details: "Please request a new verification email"
      });
    }
    
    // Check if already verified
    if (record.isVerified) {
      console.log('✅ Email already verified for:', record.email);
      return res.json({ 
        message: "Email is already verified",
        email: record.email 
      });
    }
    
    // Update the record to mark as verified
    console.log('🔄 Marking email as verified...');
    const updatedRecord = await prisma.campaignVerifiedEmail.update({
      where: { id: record.id },
      data: {
        isVerified: true,
        verifiedAt: now
      }
    });
    
    console.log('✅ Email verified successfully for:', record.email);
    console.log('📊 Updated record:', updatedRecord);
    
    return res.json({ 
      message: "Email verified successfully",
      email: record.email 
    });
    
  } catch (error) {
    console.error("❌ Error verifying email:", error);
    res.status(500).json({ 
      error: "Failed to verify email",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/verified-emails/check/:email
router.get('/check/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const record = await prisma.campaignVerifiedEmail.findUnique({
      where: { email }
    });
    
    if (!record) {
      return res.json({ isVerified: false });
    }
    
    res.json({ 
      isVerified: record.isVerified, 
      verifiedAt: record.verifiedAt,
      fromName: record.fromName
    });
  } catch (error) {
    console.error("Error checking email verification:", error);
    res.status(500).json({ error: "Failed to check email verification" });
  }
});

// GET /api/verified-emails
router.get('/', async (req, res) => {
  try {
    const verifiedEmails = await prisma.campaignVerifiedEmail.findMany({
      where: { isVerified: true }
    });
    
    res.json(verifiedEmails);
  } catch (error) {
    console.error("Error fetching verified emails:", error);
    res.status(500).json({ error: "Failed to fetch verified emails" });
  }
});

export { router };