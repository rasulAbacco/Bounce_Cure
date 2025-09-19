import express from "express";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Clean old PDFs
fs.readdirSync(tempDir).forEach(file => {
  try {
    const filePath = path.join(tempDir, file);
    if (Date.now() - fs.statSync(filePath).mtimeMs > 10 * 60 * 1000) fs.unlinkSync(filePath);
  } catch {}
});

const prisma = new PrismaClient();

// Create invoice PDF
async function createInvoice(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const fileName = `invoice-${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);
      doc.pipe(fs.createWriteStream(filePath));

      // Colors
      const headingColor = "#c2831f";
      const textColor = "white";
      const accent = "#c2831f";
      const backgroundColor = "#000000"; // add this

      const pageWidth = doc.page.width, pageHeight = doc.page.height, margin = 50;

      // Fill background black
      doc.rect(0, 0, pageWidth, pageHeight).fill(backgroundColor);

      // Add watermark behind content
      doc.save();
      doc.font("Helvetica-Bold")
         .fontSize(60)              // smaller so the full text fits
         .fillColor("#c2831f")
         .opacity(0.08)             // faint
         .rotate(-45, { origin: [pageWidth / 2, pageHeight / 2] })
         .text("BounceCure", 0, pageHeight / 2, {
           align: "center",
           width: pageWidth
         });
      doc.restore();
      doc.opacity(1);

      // Reset fill to white text after filling background
      doc.fillColor(textColor);

      // Header positioning
      const headerTop = margin;
      const logoSize = 60;
      const radius = 20;
      const logoWidth = logoSize * 1.5;
      const logoHeight = logoSize * 1.5;
      const textLeft = margin + logoWidth + 20;

      // --- Draw Logo with Rounded Corners ---
      doc.save();
      doc.roundedRect(margin, headerTop, logoWidth, logoHeight, radius).clip();
      doc.image(
        path.join(__dirname, '../../client/public/bounce.jpg'),
        margin,
        headerTop,
        { width: logoWidth, height: logoHeight }
      );
      doc.restore();

      // Invoice Info (Right aligned)
      const rightBlockWidth = 220;
      const invoiceTitleY = headerTop + 20;
      doc.fontSize(16).font("Helvetica-Bold").fillColor(headingColor)
        .text("BounceCure Invoice", pageWidth - margin - rightBlockWidth, invoiceTitleY, { width: rightBlockWidth, align: "right" });

      const invoiceDetailsY = invoiceTitleY + 25;
      doc.fontSize(10).font("Helvetica").fillColor(textColor)
        .text(`Invoice #${data.transactionId}`, pageWidth - margin - rightBlockWidth, invoiceDetailsY, { width: rightBlockWidth, align: "right" })
        .text(`Date: ${data.processedDate}`, pageWidth - margin - rightBlockWidth, invoiceDetailsY + 14, { width: rightBlockWidth, align: "right" });

      // Calculate header bottom
      const logoBottom = headerTop + logoHeight;
      const invoiceBottom = invoiceDetailsY + 14 + 10;
      const headerBottom = Math.max(logoBottom, invoiceBottom) + 15;

      // Header line
      doc.moveTo(margin, headerBottom).lineTo(pageWidth - margin, headerBottom)
        .strokeColor(headingColor).lineWidth(2).stroke();

      // BILLING INFO
      let leftY = headerBottom + 20, rightY = headerBottom + 20;
      const colWidth = 250;

      // Left column
      doc.fillColor(headingColor).fontSize(13).font("Helvetica-Bold").text("ISSUED TO:", margin, leftY);
      doc.fillColor(textColor).fontSize(10).font("Helvetica");
      if (data.issuedTo.companyName) {
        doc.font("Helvetica-Bold").text(data.issuedTo.companyName, margin, leftY + 22);
        leftY += 36; doc.font("Helvetica");
      } else leftY += 22;

      if (data.issuedTo.email) { doc.text(data.issuedTo.email, margin, leftY); leftY += 14; }
      if (data.issuedTo.address) { doc.text(data.issuedTo.address, margin, leftY, { width: colWidth, height: 35 }); leftY += 28; }
      if (data.issuedTo.placeOfSupply) { doc.text(`Place of Supply: ${data.issuedTo.placeOfSupply}`, margin, leftY); leftY += 14; }

      // Right column
      const rightColX = margin + colWidth + 50;
      doc.fillColor(headingColor).fontSize(13).font("Helvetica-Bold").text("ISSUED BY:", rightColX, rightY);
      doc.fillColor(textColor).fontSize(10).font("Helvetica");
      if (data.issuedBy.name) {
        doc.font("Helvetica-Bold").text(data.issuedBy.name, rightColX, rightY + 22);
        rightY += 36; doc.font("Helvetica");
      } else rightY += 22;

      if (data.issuedBy.address) { doc.text(data.issuedBy.address, rightColX, rightY, { width: colWidth, height: 35 }); rightY += 28; }
      if (data.issuedBy.website) { doc.text(`Website: ${data.issuedBy.website}`, rightColX, rightY); rightY += 14; }
      if (data.issuedBy.taxId) { doc.text(`Tax ID: ${data.issuedBy.taxId}`, rightColX, rightY); rightY += 14; }

      // TABLE SECTION
      const tableY = Math.max(leftY, rightY) + 30;
      doc.moveTo(margin, tableY - 10).lineTo(pageWidth - margin, tableY - 10)
        .strokeColor(headingColor).lineWidth(1).stroke();

      doc.fillColor(headingColor).fontSize(14).font("Helvetica-Bold").text("Invoice Details", margin, tableY + 5);
      let currentY = tableY + 30;
      const tableWidth = 320, col1Width = 120, col2Width = tableWidth - col1Width;

      const drawRow = (label, value, y) => {
        doc.rect(margin, y, tableWidth, 22).strokeColor("#666").lineWidth(0.5).stroke();
        doc.fillColor(headingColor).fontSize(10).font("Helvetica-Bold").text(label, margin + 8, y + 6, { width: col1Width - 16 });
        doc.fillColor(textColor).font("Helvetica").text(value || "-", margin + col1Width + 8, y + 6, { width: col2Width - 16 });
        return y + 22;
      };

      currentY = drawRow("Plan Name", data.planName, currentY);
      currentY = drawRow("Contacts", data.contacts?.toString(), currentY);
      if (data.discountTitle) currentY = drawRow("Discount", `${data.discountTitle} - $${data.discountAmount}`, currentY);

      // PAYMENT TABLE
      currentY += 15;
      doc.fillColor(headingColor).fontSize(14).font("Helvetica-Bold").text("Payment Information", margin, currentY);
      currentY += 25;
      currentY = drawRow("Payment Method", data.paymentMethod, currentY);
      currentY = drawRow("Payment Date", data.paymentDate, currentY);
      if (data.nextPaymentDate) currentY = drawRow("Next Payment Date", data.nextPaymentDate, currentY);

      // PAYMENT SUMMARY BOX
      const summaryX = margin + tableWidth + 30, summaryWidth = 190, summaryY = tableY + 30;
      doc.rect(summaryX, summaryY - 5, summaryWidth, 170).strokeColor(accent).lineWidth(2).stroke();
      doc.fillColor(headingColor).fontSize(14).font("Helvetica-Bold").text("Payment Summary", summaryX + 10, summaryY + 5);

      let sumY = summaryY + 30;
      const addSumRow = (label, value, bold = false) => {
        doc.fillColor(textColor).fontSize(10).font(bold ? "Helvetica-Bold" : "Helvetica")
          .text(label, summaryX + 10, sumY)
          .text(`${value}`, summaryX + summaryWidth - 60, sumY, { width: 50, align: "right" });
        sumY += 16;
      };

      addSumRow("Plan Price:", data.planPrice);
      addSumRow("Subtotal:", data.subtotal);
      if (data.discountAmount && parseFloat(data.discountAmount) > 0) addSumRow("Discount:", `-${data.discountAmount}`);
      addSumRow(`Tax (${data.taxRate || 10}%):`, data.tax);

      sumY += 3;
      doc.moveTo(summaryX + 10, sumY).lineTo(summaryX + summaryWidth - 10, sumY).strokeColor(accent).lineWidth(1).stroke();
      sumY += 8;

      doc.rect(summaryX + 5, sumY, summaryWidth - 10, 26).fill(accent);
      doc.fillColor("white").fontSize(12).font("Helvetica-Bold")
        .text("TOTAL:", summaryX + 15, sumY + 6)
        .text(`${data.finalTotal}`, summaryX + summaryWidth - 60, sumY + 6, { width: 50, align: "right" });

      // Footer line position (safe above bottom margin)
      const footerY = pageHeight - 80;

      doc.moveTo(margin, footerY)
         .lineTo(doc.page.width - margin, footerY)
         .strokeColor("#EAA64D")
         .lineWidth(1)
         .stroke();

      // Footer text
      doc.fontSize(12)
         .fillColor("#EAA64D") // golden theme
         .text("Abacco Technology", margin, footerY + 10, {
           align: "center",
           width: doc.page.width - margin * 2
         });

      doc.end();
      doc.on('end', () => resolve({ filePath, fileName }));
      doc.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

// Send invoice endpoint
router.post("/send-invoice", async (req, res) => {
  const data = req.body;
  const required = ["email", "transactionId", "processedDate", "planName", "planPrice", "contacts", "issuedTo", "issuedBy"];
  const missing = required.filter(f => !data[f]);
  
  if (missing.length) return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(", ")}` });

  try {
    const { filePath, fileName } = await createInvoice(data);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.json({ success: false, message: "Email not configured", downloadPath: `/api/download-invoice/${fileName}` });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
      from: `"BounceCure" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject: `Invoice ${data.transactionId} - ${data.planName}`,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="cid:logo" alt="BounceCure Logo" style="width: 50px;">
              <h1 style="color: #154c7c; margin: 20px 0 10px 0;">BounceCure</h1>
            </div>
            <h2 style="color: #154c7c; border-bottom: 2px solid #154c7c; padding-bottom: 10px;">Invoice Generated</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for your purchase! Your invoice for <strong>${data.planName}</strong> has been generated and is attached.
            </p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Invoice ID:</td><td style="padding: 8px 0;">${data.transactionId}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Plan:</td><td style="padding: 8px 0;">${data.planName}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Total:</td><td style="padding: 8px 0; color: #154c7c; font-weight: bold; font-size: 18px;">$${data.finalTotal}</td></tr>
              </table>
            </div>
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">Tax was applied to this purchase.</p>
              <p style="font-size: 12px; color: #666;">© 2023-${new Date().getFullYear()} BounceCure® All Rights Reserved</p>
              <p style="font-size: 12px; color: #666;">405 N. Angier Ave. NE, Atlanta, GA 30312 USA</p>
              <p style="font-size: 12px; color: #666;">
                <a href="https://bouncecure.com/contact" style="color: #666; text-decoration: underline;">Contact Us</a>
                 • 
                <a href="https://bouncecure.com/terms" style="color: #666; text-decoration: underline;">Terms of Use</a>
                 • 
                <a href="https://bouncecure.com/privacy" style="color: #666; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="font-size: 12px; color: #666;">
                <a href="https://bouncecure.com/unsubscribe?email=${data.email}" style="color: #666; text-decoration: underline;">Turn off Notification</a>
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        { filename: fileName, path: filePath },
        { filename: 'bounce.jpg', path: path.join(__dirname, '../../client/public/bounce.jpg'), cid: 'logo' }
      ]
    };

    await transporter.sendMail(mailOptions);
    fs.unlinkSync(filePath);
    res.json({ success: true, message: "Invoice sent to " + data.email });
  } catch (err) {
    console.error("Invoice error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to send invoice" });
  }
});

// Save payment data endpoint
router.post("/save-payment", async (req, res) => {
  const { email, transactionId, planName, paymentDate, nextPaymentDate, amount } = req.body;
  
  try {
    const payment = await prisma.payment.create({
      data: {
        email,
        transaction_id: transactionId,
        plan_name: planName,
        payment_date: new Date(paymentDate),
        next_payment_date: new Date(nextPaymentDate),
        amount: parseFloat(amount)
      }
    });
    
    res.json({ success: true, message: "Payment data saved", id: payment.id });
  } catch (err) {
    console.error('Error saving payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Download invoice endpoint
router.get("/download-invoice/:filename", (req, res) => {
  const filePath = path.join(tempDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "Invoice not found" });
  
  res.download(filePath, req.params.filename, (err) => {
    if (err) return res.status(500).json({ success: false, message: "Download error" });
    try { fs.unlinkSync(filePath); } catch {}
  });
});

// Validate payment endpoint
router.post("/validate-payment", async (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;

  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Simple validation for demo purposes
    // In a real application, you would integrate with a payment gateway
    const isValid = cardNumber.length >= 13 && 
                   /^\d{2}\/\d{2}$/.test(expiry) && 
                   cvv.length >= 3;
    
    if (isValid) {
      res.json({ success: true, message: "Payment validated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid payment details" });
    }
  } catch (err) {
    console.error('Error validating payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Function to send payment reminder
async function sendPaymentReminder(payment) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false }
  });
  
  const mailOptions = {
    from: `"BounceCure" <${process.env.EMAIL_USER}>`,
    to: payment.email,
    subject: `Payment Reminder for ${payment.plan_name}`,
    html: `
      <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:logo" alt="BounceCure Logo" style="width: 50px;">
            <h1 style="color: #154c7c; margin: 20px 0 10px 0;">BounceCure</h1>
          </div>
          <h2 style="color: #154c7c; border-bottom: 2px solid #154c7c; padding-bottom: 10px;">Payment Reminder</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            This is a reminder that your next payment for <strong>${payment.plan_name}</strong> is due on <strong>${new Date(payment.next_payment_date).toLocaleDateString()}</strong>.
          </p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <table style="width: 100%;">
              <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Plan:</td><td style="padding: 8px 0;">${payment.plan_name}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Amount:</td><td style="padding: 8px 0; color: #154c7c; font-weight: bold; font-size: 18px;">$${payment.amount}</td></tr>
              <tr><td style="padding: 8px 0; color: #666; font-weight: bold;">Due Date:</td><td style="padding: 8px 0;">${new Date(payment.next_payment_date).toLocaleDateString()}</td></tr>
            </table>
          </div>
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">Tax was applied to this purchase.</p>
            <p style="font-size: 12px; color: #666;">© 2023-${new Date().getFullYear()} BounceCure® All Rights Reserved</p>
            <p style="font-size: 12px; color: #666;">405 N. Angier Ave. NE, Atlanta, GA 30312 USA</p>
            <p style="font-size: 12px; color: #666;">
              <a href="https://bouncecure.com/contact" style="color: #666; text-decoration: underline;">Contact Us</a>
               • 
              <a href="https://bouncecure.com/terms" style="color: #666; text-decoration: underline;">Terms of Use</a>
               • 
              <a href="https://bouncecure.com/privacy" style="color: #666; text-decoration: underline;">Privacy Policy</a>
            </p>
            <p style="font-size: 12px; color: #666;">
              <a href="https://bouncecure.com/unsubscribe?email=${payment.email}" style="color: #666; text-decoration: underline;">Turn off Notification</a>
            </p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      { filename: 'bounce.jpg', path: path.join(__dirname, '../../client/public/bounce.jpg'), cid: 'logo' }
    ]
  };

  await transporter.sendMail(mailOptions);
  console.log(`Payment reminder sent to ${payment.email}`);
}

// Schedule cron job to check for upcoming payments
cron.schedule('0 8 * * *', async () => {
  console.log('Running payment reminder check...');
  
  try {
    // Get current date and 5 days from now
    const now = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(now.getDate() + 5);
    
    // Find payments due in 5 days that haven't been notified
    const upcomingPayments = await prisma.payment.findMany({
      where: {
        next_payment_date: {
          gte: now,
          lte: fiveDaysLater
        },
        notified: false
      }
    });
    
    for (const payment of upcomingPayments) {
      // Send reminder email
      await sendPaymentReminder(payment);
      
      // Update payment record to mark as notified
      await prisma.payment.update({
        where: {
          id: payment.id
        },
        data: {
          notified: true
        }
      });
    }
    
    console.log(`Sent ${upcomingPayments.length} payment reminders`);
  } catch (err) {
    console.error('Error in payment reminder job:', err);
  }
});

export default router;