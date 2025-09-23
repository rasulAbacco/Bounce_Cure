// services/emailService.js
import sgMail from "@sendgrid/mail";

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY);

// Template definitions
const EMAIL_TEMPLATES = {
  basic: {
    name: "Basic Template",
    html: (subject, content, fromName, fromEmail) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #007bff; color: white; padding: 30px; text-align: center; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #6c757d; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #333; font-size: 22px; margin: 20px 0 15px 0; }
        p { line-height: 1.6; color: #333; margin: 15px 0; }
        img { max-width: 100%; height: auto; display: block; margin: 20px auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${subject}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>${fromName}</strong><br>
            123 Your Street, Your City, State 12345<br>
            United States</p>
            <p>
                <a href="mailto:${fromEmail}" style="color: #007bff;">${fromEmail}</a> | 
                <a href="https://bouncecure.onrender.com" style="color: #007bff;">subscribe</a>
            </p>
        </div>
    </div>
</body>
</html>`
  },

  newsletter: {
    name: "Newsletter Template",
    html: (subject, content, fromName, fromEmail) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #ffffff; }
        .container { max-width: 650px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .content { padding: 40px 30px; background-color: #ffffff; }
        .sidebar { background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
        .footer { background-color: #333; color: white; padding: 30px; text-align: center; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
        h1 { margin: 0; font-size: 32px; font-weight: 300; }
        h2 { color: #333; font-size: 24px; margin: 25px 0 15px 0; font-weight: 400; }
        h3 { color: #667eea; font-size: 18px; margin: 20px 0 10px 0; }
        p { line-height: 1.7; color: #444; margin: 15px 0; }
        .highlight { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px auto; display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${subject}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Newsletter from ${fromName}</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>${fromName}</strong><br>
            123 Your Street, Your City, State 12345<br>
            United States</p>
            <p style="margin-top: 20px; font-size: 11px; opacity: 0.8;">
                <a href="mailto:${fromEmail}" style="color: #ccc;">${fromEmail}</a> | 
                <a href="https://yourdomain.com/unsubscribe" style="color: #ccc;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>`
  },

  promotion: {
    name: "Promotional Template",
    html: (subject, content, fromName, fromEmail) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #ff6b6b; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(45deg, #ff6b6b, #ffa500); color: white; padding: 50px 30px; text-align: center; position: relative; overflow: hidden; }
        .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>') repeat; }
        .content { padding: 40px 30px; }
        .cta-section { background-color: #fff5f5; padding: 30px; margin: 30px 0; text-align: center; border-radius: 10px; }
        .footer { background-color: #333; color: white; padding: 25px 30px; text-align: center; }
        .button { display: inline-block; padding: 18px 36px; background: linear-gradient(45deg, #ff6b6b, #ffa500); color: white; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); transition: all 0.3s; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6); }
        h1 { margin: 0; font-size: 36px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); position: relative; z-index: 1; }
        h2 { color: #ff6b6b; font-size: 24px; margin: 25px 0 15px 0; font-weight: bold; }
        p { line-height: 1.6; color: #333; margin: 15px 0; }
        .highlight { background: linear-gradient(45deg, #ff6b6b, #ffa500); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
        img { max-width: 100%; height: auto; border-radius: 10px; margin: 20px auto; display: block; }
        .urgent { color: #ff6b6b; font-weight: bold; text-transform: uppercase; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${subject}</h1>
            <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.95; position: relative; z-index: 1;">Limited Time Offer!</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>${fromName}</strong><br>
            123 Your Street, Your City, State 12345<br>
            United States</p>
            <p style="margin-top: 20px; font-size: 11px; opacity: 0.8;">
                <a href="mailto:${fromEmail}" style="color: #ccc;">${fromEmail}</a> | 
                <a href="https://yourdomain.com/unsubscribe" style="color: #ccc;">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>`
  }
};

// Function to generate content from canvas data
const generateContentFromCanvas = (canvasData, template) => {
  if (!canvasData || canvasData.length === 0) {
    return getDefaultContent(template);
  }

  let content = '';
  
  canvasData.forEach((element) => {
    switch (element.type) {
      case "heading":
        content += `<h2 style="font-size:${element.fontSize || 28}px;color:${element.color || '#333'};text-align:${element.textAlign || 'left'};">${element.content || 'Heading'}</h2>`;
        break;
        
      case "subheading":
        content += `<h3 style="font-size:${element.fontSize || 20}px;color:${element.color || '#666'};text-align:${element.textAlign || 'left'};">${element.content || 'Subheading'}</h3>`;
        break;
        
      case "paragraph":
        const paragraphs = (element.content || 'Paragraph text').split('\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
          content += `<p style="font-size:${element.fontSize || 16}px;color:${element.color || '#333'};text-align:${element.textAlign || 'left'};">${paragraph.trim()}</p>`;
        });
        break;

      case "image":
        if (element.src) {
          content += `<img src="${element.src}" alt="${element.alt || 'Image'}" style="max-width:100%;height:auto;border-radius:8px;margin:20px auto;display:block;" />`;
        }
        break;
        
      case "button":
        content += `<div style="text-align:center;margin:30px 0;">
          <a href="${element.link || '#'}" class="button" style="display:inline-block;padding:15px 30px;background-color:${element.backgroundColor || '#007bff'};color:${element.color || '#ffffff'};text-decoration:none;border-radius:6px;font-weight:bold;font-size:${element.fontSize || 16}px;">${element.content || 'Click Here'}</a>
        </div>`;
        break;

      case "card":
        content += `<div style="background-color:${element.backgroundColor || '#f8f9fa'};padding:25px;border-radius:10px;margin:25px 0;border:1px solid #dee2e6;">
          ${element.content || 'Card content'}
        </div>`;
        break;
        
      case "line":
        content += `<hr style="border:none;height:${element.strokeWidth || 2}px;background-color:${element.strokeColor || '#dee2e6'};margin:25px 0;" />`;
        break;

      case "blockquote":
        content += `<blockquote style="border-left:4px solid #007bff;padding-left:20px;margin:25px 0;font-style:italic;color:#666;">
          ${element.content || 'Quote text'}
        </blockquote>`;
        break;
    }
  });

  return content || getDefaultContent(template);
};

// Default content for templates when no canvas data
const getDefaultContent = (template) => {
  switch (template) {
    case 'newsletter':
      return `
        <h2>Welcome to Our Newsletter</h2>
        <p>Thank you for subscribing to our newsletter. We're excited to share the latest updates and insights with you.</p>
        <div class="sidebar">
          <h3>This Week's Highlights</h3>
          <p>Check out what's new and exciting in our community.</p>
        </div>
        <p>We hope you find this content valuable and look forward to connecting with you regularly.</p>
      `;
    case 'promotion':
      return `
        <div class="cta-section">
          <h2>Special Offer Just for You!</h2>
          <p class="urgent">Don't miss out on this amazing opportunity</p>
          <p>We're excited to offer you an exclusive deal that you won't want to miss.</p>
          <a href="#" class="button">Claim Your Offer Now</a>
        </div>
        <p>This offer is available for a limited time only, so act fast!</p>
      `;
    default: // basic
      return `
        <h2>Thank You for Your Interest</h2>
        <p>We appreciate you taking the time to connect with us. This email contains important information we wanted to share.</p>
        <p>If you have any questions or need assistance, please don't hesitate to reach out to our team.</p>
      `;
  }
};

// Generate plain text content
const generatePlainTextFromCanvas = (canvasData, subject, fromName, fromEmail, template) => {
  let plainText = `${subject}\n${'='.repeat(subject.length)}\n\n`;
  
  if (canvasData && canvasData.length > 0) {
    canvasData.forEach((element) => {
      switch (element.type) {
        case "heading":
        case "subheading":
          plainText += `${element.content || ''}\n${'─'.repeat((element.content || '').length)}\n\n`;
          break;
        case "paragraph":
        case "card":
          plainText += `${element.content || ''}\n\n`;
          break;
        case "image":
          plainText += `[Image: ${element.alt || 'Image'}]\n\n`;
          break;
        case "button":
          plainText += `► ${element.content || 'Button'}: ${element.link || '#'}\n\n`;
          break;
        case "line":
          plainText += `${'─'.repeat(50)}\n\n`;
          break;
        case "blockquote":
          plainText += `"${element.content || 'Quote'}"\n\n`;
          break;
      }
    });
  } else {
    plainText += getDefaultPlainText(template);
  }
  
  plainText += `\n\n──────────────────────────────────────\n`;
  plainText += `Sent by ${fromName}\n`;
  plainText += `Email: ${fromEmail}\n\n`;
  plainText += `To unsubscribe: https://yourdomain.com/unsubscribe\n`;
  plainText += `Address: 123 Your Street, Your City, State 12345, United States`;
  
  return plainText;
};

const getDefaultPlainText = (template) => {
  switch (template) {
    case 'newsletter':
      return `Welcome to Our Newsletter\n\nThank you for subscribing to our newsletter. We're excited to share the latest updates and insights with you.\n\nThis Week's Highlights:\nCheck out what's new and exciting in our community.\n\nWe hope you find this content valuable and look forward to connecting with you regularly.`;
    case 'promotion':
      return `Special Offer Just for You!\n\nDON'T MISS OUT ON THIS AMAZING OPPORTUNITY\n\nWe're excited to offer you an exclusive deal that you won't want to miss.\n\n► Claim Your Offer Now: #\n\nThis offer is available for a limited time only, so act fast!`;
    default:
      return `Thank You for Your Interest\n\nWe appreciate you taking the time to connect with us. This email contains important information we wanted to share.\n\nIf you have any questions or need assistance, please don't hesitate to reach out to our team.`;
  }
};

// Main email sending function
const sendEmail = async (campaign) => {
  const {
    campaignName,
    subject,
    fromName,
    fromEmail,
    recipients,
    canvasData,
    template = 'basic'  // Default to basic template
  } = campaign;

  console.log(`Preparing to send email for campaign: ${campaignName}`);
  console.log(`Using template: ${template}`);
  console.log(`Recipients: ${recipients?.length || 0}`);
  console.log(`Canvas data elements: ${canvasData?.length || 0}`);

  // Validate template
  const selectedTemplate = EMAIL_TEMPLATES[template] || EMAIL_TEMPLATES.basic;
  
  // Generate content from canvas data
  const content = generateContentFromCanvas(canvasData, template);
  
  // Generate HTML using the selected template
  const htmlContent = selectedTemplate.html(subject, content, fromName, fromEmail);
  
  // Generate plain text version
  const plainTextContent = generatePlainTextFromCanvas(canvasData, subject, fromName, fromEmail, template);

  // Prepare email message
  const msg = {
    to: recipients.map(r => ({ email: r.email, name: r.name || r.email })),
    from: {
      email: fromEmail,
      name: fromName
    },
    subject: subject,
    text: plainTextContent,
    html: htmlContent,
    // Enhanced headers for better deliverability
    headers: {
      'X-Mailer': 'Professional Email System',
      'X-Priority': '1',
      'List-Unsubscribe': `<mailto:${fromEmail}?subject=Unsubscribe>, <https://yourdomain.com/unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    },
    // Tracking and settings
    trackingSettings: {
      clickTracking: { enable: true, enableText: false },
      openTracking: { enable: true, substitutionTag: '%opentrack%' },
      subscriptionTracking: {
        enable: true,
        text: 'If you would like to unsubscribe and stop receiving these emails click here: <%unsubscribe%>.',
        html: '<p>If you would like to unsubscribe and stop receiving these emails <a href="<%unsubscribe%>">click here</a>.</p>'
      }
    },
    mailSettings: {
      sandboxMode: { enable: false },
      bypassListManagement: { enable: false }
    },
    // Add categories for tracking
    categories: [`campaign-${campaignName}`, `template-${template}`]
  };

  try {
    console.log(`Sending email with template "${selectedTemplate.name}" to ${recipients.length} recipients`);
    
    // Use sendMultiple for better performance with multiple recipients
    const response = await sgMail.sendMultiple(msg);
    
    console.log(`✅ Campaign "${campaignName}" sent successfully`);
    console.log(`Response status codes:`, response[0]?.statusCode);
    
    return { 
      success: true, 
      messageId: response[0]?.headers?.['x-message-id'],
      template: selectedTemplate.name,
      recipientCount: recipients.length
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    if (error.response) {
      console.error('SendGrid error details:', {
        status: error.response.status,
        body: error.response.body
      });
    }
    
    // Throw with more specific error information
    const errorMessage = error.response?.body?.errors?.[0]?.message || error.message || 'Unknown error';
    throw new Error(`Email sending failed: ${errorMessage}`);
  }
};

export default sendEmail;