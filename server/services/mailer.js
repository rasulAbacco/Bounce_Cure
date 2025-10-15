// server/services/mailer.js
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

/**
 * Initialize SendGrid with API key
 */
export function initSendGrid() {
  const apiKey = process.env.SENDGRID_CMP_API_KEY; // ✅ use correct env var
  if (!apiKey) {
    console.warn('⚠️ SendGrid API key not found in environment variables (SENDGRID_CMP_API_KEY)');
    return false;
  }
  sgMail.setApiKey(apiKey);
  console.log('✅ SendGrid initialized successfully');
  return true;
}

/**
 * Send email using SendGrid API
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
      headers: {}
    };

    // Threading headers
    if (options.inReplyTo) msg.headers['In-Reply-To'] = options.inReplyTo;
    if (options.references) msg.headers['References'] = options.references;
    if (options.messageId) msg.headers['Message-ID'] = options.messageId;

    if (options.attachments && options.attachments.length > 0) {
      msg.attachments = options.attachments;
    }

    const response = await sgMail.send(msg);
    console.log('✅ SendGrid email sent successfully:', {
      to: options.to,
      messageId: response[0].headers['x-message-id'] || options.messageId,
    });

    return {
      success: true,
      method: 'sendgrid',
      messageId: response[0].headers['x-message-id'] || options.messageId,
    };
  } catch (error) {
    console.error('❌ SendGrid send error:', error.message);
    if (error.response?.body) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw new Error(`SendGrid failed: ${error.message}`);
  }
}

/**
 * Create SMTP transporter (fallback)
 */
export async function createTransporter(account) {
  if (!account || !account.smtpHost) {
    throw new Error("Account SMTP configuration is missing");
  }

  // ✅ Fixed createTransporter → createTransport
  const transporter = nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort || 587,
    secure: account.smtpPort === 465, // true for 465, false for others
    auth: {
      user: account.smtpUser || account.email,
      pass: account.smtpPassword,
    },
  });

  await transporter.verify();
  console.log(`✅ SMTP transporter verified for ${account.email}`);
  return transporter;
}

/**
 * Send email using SendGrid (primary) or SMTP (fallback)
 */
export async function sendEmail(options, account) {
  // ✅ Try SendGrid first (using correct env variable)
  if (process.env.SENDGRID_CMP_API_KEY) {
    try {
      const result = await sendEmailViaSendGrid(options);
      console.log('📬 Sending via SendGrid');
      return result;
    } catch (error) {
      console.error('⚠️ SendGrid failed, trying SMTP fallback:', error.message);
      // Continue to fallback below
    }
  }

  // ✅ Fallback to SMTP if configured
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
      attachments: options.attachments || [],
    });

    console.log('✅ Email sent successfully via SMTP:', info.messageId);
    return {
      success: true,
      method: 'smtp',
      messageId: info.messageId,
    };
  }

  // ❌ No send method available
  throw new Error('No email sending method available (missing SendGrid API key and SMTP config)');
}
