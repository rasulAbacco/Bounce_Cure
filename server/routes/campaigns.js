import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create email transporter with TLS options
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Allow self-signed certificates
    rejectUnauthorized: false
  }
});

// Send campaign
router.post('/send', async (req, res) => {
  try {
    const { recipients, fromName, fromEmail, subject, canvasData } = req.body;
    
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients specified' });
    }
    
    if (!subject) {
      return res.status(400).json({ error: 'Email subject is required' }); 
    }
    
    // Create HTML content from canvas data
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2>${subject}</h2>
        <div style="position: relative; width: 800px; height: 600px; background-color: #ffffff;">
    `;
    
    // Process canvas elements to create HTML
    if (canvasData && canvasData.length > 0) {
      canvasData.forEach(element => {
        const style = `
          position: absolute;
          left: ${element.x}px;
          top: ${element.y}px;
          width: ${element.width}px;
          height: ${element.height}px;
          font-family: ${element.fontFamily || 'Arial'};
          color: ${element.color || '#000000'};
          background-color: ${element.backgroundColor || 'transparent'};
          border: ${element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'};
          border-radius: ${element.borderRadius || 0}px;
          font-weight: ${element.fontWeight || 'normal'};
          font-style: ${element.fontStyle || 'normal'};
          text-decoration: ${element.textDecoration || 'none'};
          text-align: ${element.textAlign || 'left'};
          font-size: ${element.fontSize || 16}px;
          opacity: ${element.opacity || 1};
          z-index: ${element.zIndex || 0};
          transform: rotate(${element.rotation || 0}deg);
          padding: 8px;
          box-sizing: border-box;
        `;
        
        if (element.type === 'heading' || element.type === 'subheading' || element.type === 'paragraph') {
          const tag = element.type === 'heading' ? 'h1' : 
                     element.type === 'subheading' ? 'h2' : 'p';
          htmlContent += `<${tag} style="${style}">${element.content || 'Text content'}</${tag}>`;
        } else if (element.type === 'button') {
          htmlContent += `<div style="${style} display: flex; align-items: center; justify-content: center;">
            <a href="#" style="background-color: ${element.backgroundColor || '#4299E1'}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              ${element.content || 'Click Me'}
            </a>
          </div>`;
        } else if (element.type === 'image' && element.src) {
          htmlContent += `<img src="${element.src}" alt="Image" style="${style} object-fit: cover;" />`;
        } else if (element.type === 'rectangle' || element.type === 'circle') {
          const borderRadius = element.type === 'circle' ? '50%' : element.borderRadius || 0;
          htmlContent += `<div style="${style}; border-radius: ${borderRadius}px;"></div>`;
        }
      });
    }
    
    htmlContent += `
        </div>
        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          This email was sent by ${fromName} (${fromEmail}).<br>
          If you believe this was sent in error, please contact us.
        </p>
      </div>
    `;
    
    // Send emails to all recipients
    // const emailPromises = recipients.map(recipient => {
    //   const mailOptions = {
    //     from: `"${fromName}" <${fromEmail}>`,
    //     to: recipient.email,
    //     subject: subject,
    //     html: htmlContent,
    //   };
    const emailPromises = recipients.map(recipient => {
      const mailOptions = {
        from: `"${fromName}" <${process.env.EMAIL_USER}>`,  // always use your verified email
        replyTo: fromEmail,  // ✅ replies will go to the dynamic email
        to: recipient.email,
        subject: subject,
        html: htmlContent,
      };
      
      return transporter.sendMail(mailOptions);
    });
    
    await Promise.all(emailPromises);
    
    res.status(200).json({ 
      message: `Campaign sent successfully to ${recipients.length} recipients!`,
      recipientsCount: recipients.length
    });
    
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

export { router };