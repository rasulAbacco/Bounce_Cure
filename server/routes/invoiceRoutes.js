import express from "express";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
  } catch (err) {
    console.error("Error cleaning temp files:", err);
  }
});

const prisma = new PrismaClient();

// Test database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Create payment for user function
async function createPaymentForUser(userEmail) {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user) throw new Error("User not found. Cannot create payment.");

  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      email: user.email,
      transactionId: "TXN1758577063918487",
      planName: "Pro Plan",
      planType: "monthly",
      provider: "Discover",
      contacts: 2500,
      amount: 103.13,
      currency: "USD",
      paymentMethod: "Discover ending in 1117",
      cardLast4: "1117",
      paymentDate: new Date("2025-09-22T18:30:00.000Z"),
      nextPaymentDate: new Date("2025-10-22T18:30:00.000Z"),
      status: "success",
    },
  });

  return payment;
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  console.log("=== BACKEND AUTH DEBUG ===");
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log("Auth header:", authHeader ? "Present" : "Missing");
  console.log("Token:", token ? "Present" : "Missing");
  
  if (!token) {
    console.log("ERROR: No token provided");
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication token required',
      debug: {
        authHeader: authHeader,
        token: token
      }
    });
  }
  
  console.log("JWT Secret:", process.env.JWT_SECRET ? "Present" : "Missing");
  
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.log("ERROR: Token verification failed:", err.message);
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token',
        debug: {
          error: err.message,
          token: token.substring(0, 20) + "..."
        }
      });
    }
    
    console.log("SUCCESS: Token verified");
    console.log("User payload:", user);
    req.user = user;
    next();
  });
};

// Test authentication endpoint
router.get("/test-auth", authenticateToken, (req, res) => {
  console.log("Test auth endpoint called");
  console.log("User from token:", req.user);
  
  res.json({ 
    success: true, 
    message: "Authentication is working",
    user: req.user,
    debug: {
      headers: req.headers,
      token: req.headers.authorization ? req.headers.authorization.substring(0, 20) + "..." : "Missing"
    }
  });
});

// Create a test token endpoint (for development only)
router.get("/test-token", (req, res) => {
  const testUser = {
    userId: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User"
  };
  
  const token = jwt.sign(
    testUser,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
  
  res.json({ 
    success: true, 
    token,
    user: testUser
  });
});

// Create payment for user endpoint
router.post("/create-payment", authenticateToken, async (req, res) => {
  try {
    console.log("=== CREATE PAYMENT DEBUG ===");
    console.log("User from token:", req.user);
    
    const userEmail = req.user.email;
    console.log("Creating payment for user:", userEmail);
    
    const payment = await createPaymentForUser(userEmail);
    
    console.log("Payment created successfully:", payment);
    
    res.json({ 
      success: true, 
      message: "Payment created successfully",
      payment
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create payment",
      debug: {
        error: error.message,
        stack: error.stack
      }
    });
  }
});

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
      const backgroundColor = "#000000";

      const pageWidth = doc.page.width, pageHeight = doc.page.height, margin = 50;

      // Fill background black
      doc.rect(0, 0, pageWidth, pageHeight).fill(backgroundColor);

      // Add watermark behind content
      doc.save();
      doc.font("Helvetica-Bold")
         .fontSize(60)
         .fillColor("#F4991A")
         .opacity(0.2)
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

      // --- TABLE SECTION ---
      const tableY = Math.max(leftY, rightY) + 30;

      // Draw a thin separator line
      doc.moveTo(margin, tableY - 10).lineTo(pageWidth - margin, tableY - 10)
        .strokeColor(headingColor).lineWidth(1).stroke();

      doc.fillColor(headingColor).fontSize(14).font("Helvetica-Bold").text("Invoice Details", margin + 10, tableY + 5);

      // Table dimensions
      const innerPad = 10;
      const tableX = margin + innerPad;
      const tableWidth = 320 - innerPad * 2;
      const col1Width = 120;
      const col2Width = tableWidth - col1Width;

      let currentY = tableY + 30;

      // Dynamic row drawing function
      const drawRow = (label, value, y) => {
        // Measure text height
        const labelHeight = doc.heightOfString(label, { width: col1Width - 16 });
        const valueHeight = doc.heightOfString(value || "-", { width: col2Width - 16 });
        const rowHeight = Math.max(labelHeight, valueHeight) + 12; // padding

        // Draw the row box with dynamic height
        doc.rect(tableX, y, tableWidth, rowHeight).strokeColor("#666").lineWidth(0.5).stroke();

        // Label
        doc.fillColor(headingColor).fontSize(10).font("Helvetica-Bold")
          .text(label, tableX + 8, y + 6, { width: col1Width - 16, align: "left" });

        // Value
        doc.fillColor(textColor).fontSize(10).font("Helvetica")
          .text(value || "-", tableX + col1Width + 8, y + 6, { width: col2Width - 16, align: "left" });

        return y + rowHeight; // Move Y down for next row
      };

      // Draw invoice details rows
      currentY = drawRow("Plan Name", data.planName, currentY);
      currentY = drawRow("Contacts", data.contacts?.toString(), currentY);
      if (data.discountTitle) currentY = drawRow("Discount", `${data.discountTitle} - $${data.discountAmount}`, currentY);

      // PAYMENT TABLE
      currentY += 15;
      doc.fillColor(headingColor).fontSize(14).font("Helvetica-Bold").text("Payment Information", tableX, currentY);
      currentY += 25;
      currentY = drawRow("Payment Method", data.paymentMethod, currentY);
      currentY = drawRow("Payment Date", data.paymentDate, currentY);
      if (data.nextPaymentDate) currentY = drawRow("Next Payment Date", data.nextPaymentDate, currentY);

      // PAYMENT SUMMARY BOX
      const summaryX = margin + tableWidth + 30;
      const summaryWidth = 190;
      const summaryY = currentY + 15; // Position after payment table
      
      doc.rect(summaryX, summaryY - 5, summaryWidth, 170).strokeColor(accent).lineWidth(2).stroke();
      doc.fillColor(headingColor).fontSize(14).font("Helvetica-Bold").text("Payment Summary", summaryX + 10, summaryY + 5);

      // Summary box content
      let sumY = summaryY + 30;
      const valueColWidth = 60;
      const labelColWidth = summaryWidth - 20 - valueColWidth;

      const addSumRow = (label, value, bold = false) => {
        doc.fillColor(textColor).fontSize(10).font(bold ? "Helvetica-Bold" : "Helvetica")
          .text(label, summaryX + 10, sumY, { width: labelColWidth, align: "left" })
          .text(`${value}`, summaryX + 10 + labelColWidth, sumY, { width: valueColWidth, align: "right" });
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
        .text("TOTAL:", summaryX + 15, sumY + 6, { width: summaryWidth - valueColWidth - 40, align: "left" })
        .text(`${data.finalTotal}`, summaryX + summaryWidth - 60, sumY + 6, { width: 50, align: "right" });

      // Footer
      const footerY = pageHeight - 80;
      doc.moveTo(margin, footerY)
         .lineTo(doc.page.width - margin, footerY)
         .strokeColor("#EAA64D")
         .lineWidth(1)
         .stroke();

      doc.fontSize(12)
         .fillColor("#EAA64D")
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

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    console.log("Password from request:", password);
    console.log("Password from DB:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Passwords match?", isMatch);

    if (!isMatch) {
      console.log("Incorrect password for:", email);
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log("Login successful:", email);
    return res.json({ success: true, token, user: { id: user.id, email: user.email } });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error", debug: err.message });
  }
});

// Send invoice endpoint
router.post("/send-invoice", authenticateToken, async (req, res) => {
  console.log("=== SEND INVOICE DEBUG ===");
  console.log("User from token:", req.user);
  
  const data = req.body;
  console.log("Received invoice data:", data);
  const required = ["email", "transactionId", "processedDate", "planName", "planPrice", "contacts", "issuedTo", "issuedBy"];
  const missing = required.filter(f => !data[f]);
  
  if (missing.length) {
    console.error("Missing fields:", missing);
    return res.status(400).json({ 
      success: false, 
      message: `Missing fields: ${missing.join(", ")}`,
      debug: {
        missingFields: missing,
        receivedData: data
      }
    });
  }

  try {
    console.log("Creating PDF...");
    const { filePath, fileName } = await createInvoice(data);
    console.log("PDF created successfully:", filePath);
    
    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing");
      return res.status(500).json({ 
        success: false, 
        message: "Email not configured", 
        downloadPath: `/api/download-invoice/${fileName}`,
        debug: {
          emailUser: process.env.EMAIL_USER ? "Present" : "Missing",
          emailPass: process.env.EMAIL_PASS ? "Present" : "Missing"
        }
      });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});


    // Verify email configuration
    try {
      console.log("Verifying email configuration...");
      await transporter.verify();
      console.log("Email server connection verified");
    } catch (emailErr) {
      console.error("Email verification failed:", emailErr);
      return res.status(500).json({ 
        success: false, 
        message: "Email server configuration error", 
        downloadPath: `/api/download-invoice/${fileName}`,
        debug: {
          emailError: emailErr.message
        }
      });
    }

    // Prepare email options
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

    // Send email
    console.log("Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    
    // Clean up PDF file
    try {
      fs.unlinkSync(filePath);
      console.log("Temporary PDF file deleted");
    } catch (deleteErr) {
      console.error("Error deleting PDF file:", deleteErr);
    }
    
    return res.json({ success: true, message: "Invoice sent to " + data.email });
  } catch (err) {
    console.error("Invoice error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to send invoice",
      debug: {
        error: err.message,
        stack: err.stack
      }
    });
  }
});

// Save payment data endpoint
// Save payment endpoint
router.post("/save-payment", authenticateToken, async (req, res) => {
  console.log("=== SAVE PAYMENT DEBUG ===");
  try {
    const {
      email,
      transactionId,
      planName,
      planType,
      provider,
      contacts,
      amount,
      currency,
      paymentMethod,
      cardLast4,
      paymentDate,
      nextPaymentDate,
      status
    } = req.body;

    if (!email || !transactionId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (email, transactionId, amount)"
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        email,
        transactionId,
        planName,
        planType,
        provider,
        contacts,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        cardLast4,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
        status
      }
    });

    res.json({ success: true, message: "Payment saved successfully", payment });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save payment",
      error: error.message
    });
  }
});


// Global error handler
router.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    debug: {
      error: err.message,
      stack: err.stack
    }
  });
});

export default router;