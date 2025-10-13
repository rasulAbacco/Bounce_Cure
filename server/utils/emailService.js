// server/utils/emailService.js
import nodemailer from 'nodemailer';

const sendEmail = async ({ to, from, subject, text, html }) => {
    try {
        // Check if we're in production or using real email service
        const isProduction = process.env.NODE_ENV === 'production';
        const useRealEmail = process.env.USE_REAL_EMAIL === 'true';

        let transporter;

        if (isProduction || useRealEmail) {
            // Production: Use real email service (Gmail, SendGrid, etc.)
            
            // Option 1: Gmail SMTP
            if (process.env.EMAIL_SERVICE === 'gmail') {
                transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_APP_PASSWORD // Use App Password, not regular password
                    }
                });
            }
            // Option 2: SendGrid
            else if (process.env.EMAIL_SERVICE === 'sendgrid') {
                transporter = nodemailer.createTransport({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'apikey',
                        pass: process.env.SENDGRID_CMP_API_KEY
                    }
                });
            }
            // Option 3: Custom SMTP
            else {
                transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
            }
        } else {
            // Development: Use Ethereal Email (test inbox)
            const testAccount = await nodemailer.createTestAccount();
            
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        const mailOptions = {
            from: from || process.env.EMAIL_FROM || 'info@abaccotech.com',
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully to', to);
        
        // In development with Ethereal, log the preview URL
        if (!isProduction && !useRealEmail) {
            console.log('📧 Preview URL (Ethereal):', nodemailer.getTestMessageUrl(info));
            console.log('⚠️  This is a TEST email. To send real emails, configure a real email service.');
        }

        return {
            success: true,
            messageId: info.messageId,
            previewUrl: nodemailer.getTestMessageUrl(info)
        };

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export default sendEmail;