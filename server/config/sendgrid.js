// server/config/sendgrid.js
import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_CMP_API_KEY) {
    console.error("❌ SENDGRID_CMP_API_KEY not set!");
} else {
    console.log("✅ SENDGRID API key detected");
}

sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY);

/**
 * Send invoice email with one or multiple PDF attachments
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {Buffer} options.pdfBuffer - Main (dark theme) invoice PDF
 * @param {Buffer} [options.pdfBuffers] - Secondary (print-friendly) invoice PDF
 * @param {string} [options.fileName] - Name for main invoice
 */
export const sendInvoiceEmail = async ({ to, subject, html, pdfBuffer, pdfBuffers, fileName }) => {
    if (!to || !subject || !html) throw new Error("Missing email fields (to, subject, or html)");

    console.log(`📧 Preparing to send invoice to: ${to}`);

    // Prepare attachments array
    const attachments = [];

    // 🧾 Dark invoice (email-friendly version)
    if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
        attachments.push({
            content: pdfBuffer.toString("base64"),
            filename: fileName || "invoice-dark.pdf",
            type: "application/pdf",
            disposition: "attachment",
        });
    } else {
        console.warn("⚠️ No valid dark invoice PDF buffer provided");
    }

    // 🖨️ Print-friendly invoice (blue theme)
    if (pdfBuffers && Buffer.isBuffer(pdfBuffers)) {
        attachments.push({
            content: pdfBuffers.toString("base64"),
            filename: fileName
                ? fileName.replace(".pdf", "-print.pdf")
                : "invoice-print.pdf",
            type: "application/pdf",
            disposition: "attachment",
        });
    } else {
        console.warn("⚠️ No valid print invoice PDF buffer provided");
    }

    const msg = {
        to,
        from: {
            email: "info@abaccotech.com",
            name: "BounceCure Billing",
        },
        subject,
        html,
        attachments,
    };

    try {
        const response = await sgMail.send(msg);
        console.log(`✅ SendGrid response: ${response[0].statusCode}`);
        console.log(`✅ Invoice email successfully sent to ${to}`);
    } catch (error) {
        console.error("❌ SendGrid send error:", error.response?.body || error.message);
        throw new Error(error.message);
    }
};
