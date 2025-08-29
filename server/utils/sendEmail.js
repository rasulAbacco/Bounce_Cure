import nodemailer from "nodemailer";
import { config } from "../config.js";

export const sendEmail = async (to, subject, html) => {
    let transporter;

    if (process.env.NODE_ENV === "production") {
        // Use Gmail in production
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.emailUser,
                pass: config.emailPass,
            },
        });
    } else {
        // Use Ethereal in development/testing
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const info = await transporter.sendMail({
        from:
            process.env.NODE_ENV === "production"
                ? `"Auth System" <${config.emailUser}>`
                : `"Auth System" <${transporter.options.auth.user}>`,
        to,
        subject,
        html,
    });

    if (process.env.NODE_ENV !== "production") {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};
