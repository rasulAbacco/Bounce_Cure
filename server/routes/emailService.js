// emailService.js - Updated SendGrid configuration

import sgMail from '@sendgrid/mail';

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (emailData) => {
  try {
    const { recipients, subject, fromName, fromEmail, htmlContent, templateId } = emailData;
    
    // Use your verified sender identity email
    // This should be the email you verified in SendGrid, not the user's fromEmail
    const verifiedSenderEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
    
    const msg = {
      to: recipients,
      from: {
        email: verifiedSenderEmail, // Use your verified sender email
        name: fromName // But keep the name from the user
      },
      subject: subject,
      html: htmlContent,
      // Optional: Add reply-to if you want replies to go to the original fromEmail
      replyTo: {
        email: fromEmail,
        name: fromName
      }
    };

    // If using a template
    if (templateId) {
      msg.templateId = templateId;
    }

    console.log('Sending email with SendGrid...', {
      to: recipients,
      from: msg.from,
      subject: subject
    });

    const response = await sgMail.send(msg);
    console.log('Email sent successfully:', response[0].statusCode);
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      statusCode: response[0].statusCode
    };
    
  } catch (error) {
    console.error('SendGrid error:', error);
    
    // Extract more detailed error information
    let errorMessage = 'Failed to send email';
    if (error.response?.body?.errors) {
      errorMessage = error.response.body.errors.map(err => err.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(`Email sending failed: ${errorMessage}`);
  }
};