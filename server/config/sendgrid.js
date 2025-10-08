// server/config/sendgrid.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY);

export const sendInvoiceEmail = async ({ to, subject, html, pdfBuffer, fileName }) => {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
        throw new Error("Invalid PDF buffer provided to sendInvoiceEmail");
    }

    const msg = {
        to,
        from: "info@abaccotech.com",
        subject,
        html,
        attachments: [
            {
                content: pdfBuffer.toString("base64"),
                filename: fileName,
                type: "application/pdf",
                disposition: "attachment",
            },
        ],
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Invoice sent to ${to}`);
    } catch (error) {
        console.error("❌ SendGrid send error:", error);
        throw error;  // rethrow if you want to handle it upstream
    }
};

