// server/services/mailer.js
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

/**
 * Initialize SendGrid with API key
 */
export function initSendGrid() {
  const apiKey = process.env.SENDGRID_CMP_API_KEY;
  if (!apiKey) {
    console.warn('SendGrid API key not found in environment variables');
    return false;
  }
  sgMail.setApiKey(apiKey);
  console.log('SendGrid initialized successfully');
  return true;
}

/**
 * Send email using SendGrid API
 * @param {Object} options - Email options
 * @param {string} options.from - Sender email (must be verified in SendGrid)
 * @param {string} options.fromName - Sender name
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {string} options.inReplyTo - Message ID this is replying to
 * @param {string} options.references - Reference message IDs
 * @param {string} options.messageId - Custom message ID
 */
export async function sendEmailViaSendGrid(options) {
  try {
    const msg = {
      to: options.to,
      from: {
        email: options.from,
        name: options.fromName || options.from
      },
      subject: options.subject,
      text: options.text,
      html: options.html,
      // Custom headers for threading
      headers: {}
    };

    // Add threading headers if available
    if (options.inReplyTo) {
      msg.headers['In-Reply-To'] = options.inReplyTo;
    }
    if (options.references) {
      msg.headers['References'] = options.references;
    }
    if (options.messageId) {
      msg.headers['Message-ID'] = options.messageId;
    }

    const response = await sgMail.send(msg);
    console.log('SendGrid email sent successfully:', {
      to: options.to,
      messageId: response[0].headers['x-message-id']
    });

    return {
      success: true,
      messageId: options.messageId,
      response: response[0]
    };
  } catch (error) {
    console.error('SendGrid send error:', error);
    
    // Parse SendGrid error
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    
    throw new Error(`SendGrid failed: ${error.message}`);
  }
}

/**
 * Create SMTP transporter (fallback method)
 * This is kept for accounts that use SMTP instead of SendGrid
 */
export async function createTransporter(account) {
  if (!account || !account.smtpHost) {
    throw new Error("Account SMTP configuration is missing");
  }

  const transporter = nodemailer.createTransporter({
    host: account.smtpHost,
    port: account.smtpPort || 587,
    secure: account.smtpPort === 465,
    auth: {
      user: account.smtpUser || account.email,
      pass: account.smtpPassword,
    },
  });

  await transporter.verify();
  return transporter;
}

/**
 * Send email using the best available method
 * Tries SendGrid first, falls back to SMTP if account has SMTP config
 */
export async function sendEmail(options, account) {
  // Try SendGrid first if API key is available
  if (process.env.SENDGRID_API_KEY) {
    try {
      return await sendEmailViaSendGrid(options);
    } catch (error) {
      console.error('SendGrid failed, trying SMTP fallback:', error.message);
      
      // If SendGrid fails and we have SMTP config, try SMTP
      if (account?.smtpHost) {
        const transporter = await createTransporter(account);
        const info = await transporter.sendMail({
          from: `"${options.fromName}" <${options.from}>`,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
          inReplyTo: options.inReplyTo,
          references: options.references,
          messageId: options.messageId,
        });
        
        return {
          success: true,
          messageId: info.messageId,
          method: 'smtp'
        };
      }
      
      throw error;
    }
  }
  
  // If no SendGrid key, try SMTP
  if (account?.smtpHost) {
    const transporter = await createTransporter(account);
    const info = await transporter.sendMail({
      from: `"${options.fromName}" <${options.from}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      inReplyTo: options.inReplyTo,
      references: options.references,
      messageId: options.messageId,
    });
    
    return {
      success: true,
      messageId: info.messageId,
      method: 'smtp'
    };
  }
  
  throw new Error('No email sending method available (no SendGrid API key or SMTP config)');
}