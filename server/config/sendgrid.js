import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY);

export const sendInvoiceEmail = async ({ to, subject, html, pdfBuffer, fileName }) => {
    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
        throw new Error("Invalid PDF buffer provided to sendInvoiceEmail");
    }

    const msg = {
        to,
        from: "info@abaccotech.com", // must be verified in SendGrid
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

    await sgMail.send(msg);
};
