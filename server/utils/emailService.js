// emailService.js
import nodemailer from "nodemailer";

let transporter;

export const initEmail = async () => {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log("Ethereal test account created:", testAccount);
    console.log("Preview emails at:", "https://ethereal.email/messages");
};

export const sendEmail = async ({ to, subject, html }) => {
    if (!transporter) throw new Error("Email transporter not initialized");

    const info = await transporter.sendMail({
        from: '"Bounce Cure" <no-reply@bouncecure.com>',
        to,
        subject,
        html,
    });

    console.log("Message sent:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
};


const testAccount = await nodemailer.createTestAccount();
transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: testAccount.user,
        pass: testAccount.pass,
    },
});



export default {
    initEmail,
    sendEmail,
};