// server/routes/campaigns.js
import express from "express";
import sgMail from "@sendgrid/mail";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

/* ==========================================================
   HTML + Plain Text Generators
========================================================== */
const generateHtmlFromCanvas = (canvasData, subject, fromName, fromEmail) => {
  if (!canvasData || canvasData.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="center" style="padding:20px;">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
              <tr><td style="padding:20px;background-color:#ffffff;">
                <h1 style="margin:0 0 20px 0;font-size:24px;color:#333333;">${subject}</h1>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                  This email was sent from your campaign builder.
                </p>
                <hr style="border:none;height:1px;background-color:#eeeeee;margin:30px 0;">
                <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                  Sent by ${fromName}<br>
                  <a href="mailto:${fromEmail}" style="color:#007bff;">${fromEmail}</a>
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`;
  }

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="padding:20px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">
            <tr><td style="padding:30px;">`;

  canvasData.forEach((element) => {
    switch (element.type) {
      case "heading":
        htmlContent += `<h1 style="margin:0 0 20px 0;font-size:${element.fontSize || 28}px;color:${element.color || "#333"};font-weight:bold;text-align:${element.textAlign || "left"};">${element.content || "Heading"}</h1>`;
        break;
      case "subheading":
        htmlContent += `<h2 style="margin:0 0 16px 0;font-size:${element.fontSize || 22}px;color:${element.color || "#333"};font-weight:600;text-align:${element.textAlign || "left"};">${element.content || "Subheading"}</h2>`;
        break;
      case "paragraph":
        const paragraphs = (element.content || "Paragraph text").split("\n").filter((p) => p.trim());
        paragraphs.forEach((p) => {
          htmlContent += `<p style="margin:0 0 16px 0;font-size:${element.fontSize || 16}px;color:${element.color || "#333"};line-height:1.6;text-align:${element.textAlign || "left"};">${p.trim()}</p>`;
        });
        break;
      case "image":
        htmlContent += `<div style="margin:20px 0;text-align:${element.textAlign || "center"};"><img src="${element.src}" alt="${element.alt || "Image"}" style="max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`;
        break;
      case "button":
        htmlContent += `
          <table cellpadding="0" cellspacing="0" border="0" style="margin:25px auto;">
            <tr><td style="background-color:${element.backgroundColor || "#007bff"};padding:12px 24px;border-radius:6px;">
              <a href="${element.link || "#"}" style="color:${element.color || "#ffffff"};text-decoration:none;font-weight:bold;font-size:${element.fontSize || 16}px;">${element.content || "Click Me"}</a>
            </td></tr>
          </table>`;
        break;
      case "line":
        htmlContent += `<hr style="border:none;height:${element.strokeWidth || 1}px;background-color:${element.strokeColor || "#dee2e6"};margin:25px 0;" />`;
        break;
    }
  });

  htmlContent += `
            </td></tr>
            <tr><td style="padding:20px;background-color:#f8f9fa;border-top:1px solid #dee2e6;text-align:center;">
              <p style="margin:0 0 10px 0;font-size:12px;color:#6c757d;">This email was sent by <strong>${fromName}</strong></p>
              <p style="margin:0;font-size:11px;color:#999999;"><a href="mailto:${fromEmail}" style="color:#007bff;">${fromEmail}</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;
  return htmlContent;
};

const generatePlainTextFromCanvas = (canvasData, subject, fromName, fromEmail) => {
  let plainText = `${subject}\n\n`;
  if (!canvasData || canvasData.length === 0) {
    plainText += "This email was sent from your campaign builder.\n\n";
  } else {
    canvasData.forEach((el) => {
      switch (el.type) {
        case "heading":
        case "subheading":
        case "paragraph":
          plainText += `${el.content || ""}\n\n`;
          break;
        case "image":
          plainText += `[Image: ${el.alt || "Image"}]\n\n`;
          break;
        case "button":
          plainText += `[${el.content || "Button"}] - ${el.link || "#"}\n\n`;
          break;
        case "line":
          plainText += "----------------------------------------\n\n";
          break;
      }
    });
  }
  plainText += `\n\nSent by ${fromName}\nEmail: ${fromEmail}`;
  return plainText;
};

/* ==========================================================
   ✅ GET USER CREDITS (Accumulated from all payments)
========================================================== */
router.get("/credits", async (req, res) => {
  try {
    console.log("📊 Fetching accumulated credits for user:", req.user.id);

    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id, status: "succeeded" },
      select: { emailSendCredits: true, emailVerificationCredits: true },
    });

    const totalEmailSendCredits = payments.reduce((sum, p) => sum + (p.emailSendCredits || 0), 0);
    const totalEmailVerificationCredits = payments.reduce((sum, p) => sum + (p.emailVerificationCredits || 0), 0);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailLimit: true, contactLimit: true, plan: true },
    });

    const emailSendCredits = (user?.emailLimit ?? 0) + totalEmailSendCredits;
    const emailVerificationCredits = (user?.contactLimit ?? 0) + totalEmailVerificationCredits;

    console.log("✅ Aggregated Credits:", { emailSendCredits, emailVerificationCredits });

    res.json({
      success: true,
      emailSendCredits,
      emailVerificationCredits,
      plan: user?.plan || "Free",
    });
  } catch (error) {
    console.error("❌ Error fetching credits:", error);
    res.status(500).json({ success: false, error: "Failed to fetch credits" });
  }
});

router.post("/send", async (req, res) => {
  try {
    console.log("📨 /api/campaigns/send called by user:", req.user?.id);

    const {
      recipients,
      fromEmail,
      fromName,
      subject,
      canvasData,
      scheduleType = "immediate",
      scheduledDate,
      scheduledTime,
      timezone,
      recurringFrequency,
      recurringDays,
      recurringEndDate,
    } = req.body;

    // 🧩 Basic validation
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients specified" });
    }
    if (!fromEmail || !fromName) {
      return res.status(400).json({ error: "Missing sender fields (fromEmail/fromName)" });
    }

    const emailSubject = subject?.trim() || "Untitled Campaign";

    // ==========================================================
    // 🧮 STEP 1: Credit Validation
    // ==========================================================
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id, status: "succeeded" },
      select: { emailSendCredits: true },
    });

    const totalPaymentCredits = payments.reduce((sum, p) => sum + (p.emailSendCredits || 0), 0);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailLimit: true, plan: true },
    });

    const availableCredits = (user?.emailLimit ?? 0) + totalPaymentCredits;
    const requiredCredits = recipients.length;

    console.log(`📊 Credits check - Available: ${availableCredits}, Required: ${requiredCredits}`);

    if (availableCredits < requiredCredits) {
      return res.status(403).json({
        error: `Insufficient credits. You need ${requiredCredits} credits but only have ${availableCredits}.`,
        available: availableCredits,
        required: requiredCredits,
        creditLimitReached: true,
      });
    }

    // ==========================================================
    // 🧠 STEP 2: SendGrid setup
    // ==========================================================
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({ error: "SendGrid API key not configured" });
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // ==========================================================
    // 💾 STEP 3: Prepare Scheduled DateTime
    // ==========================================================
    let scheduledDateTime = null;
    
    if (scheduleType !== "immediate" && scheduledDate && scheduledTime) {
      // ✅ Combine date and time properly
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
      
      // ✅ Validate scheduled time is in future
      const now = new Date();
      if (scheduledDateTime <= now) {
        return res.status(400).json({
          error: "Scheduled time must be in the future (at least 5 minutes from now)",
        });
      }
      
      console.log(`📅 Campaign scheduled for: ${scheduledDateTime.toISOString()}`);
    }

    // ==========================================================
    // 💾 STEP 4: Create Campaign Record (✅ STORING RECIPIENTS)
    // ==========================================================
    const campaign = await prisma.campaign.create({
      data: {
        userId: req.user.id,
        name: emailSubject,
        subject: emailSubject,
        fromEmail,
        fromName,
        scheduleType,
        designJson: JSON.stringify(canvasData || []),
        recipientsJson: JSON.stringify(recipients), // ✅ STORE RECIPIENTS
        scheduledAt: scheduledDateTime,
        recurringFrequency: scheduleType === "recurring" ? recurringFrequency : null,
        recurringDays: scheduleType === "recurring" ? JSON.stringify(recurringDays || []) : null,
        recurringEndDate: scheduleType === "recurring" && recurringEndDate ? new Date(recurringEndDate) : null,
        status: scheduleType === "immediate" ? "processing" : "scheduled",
      },
    });

    console.log(`✅ Campaign ${campaign.id} created with scheduleType: ${scheduleType}`);

    // ==========================================================
    // 🕒 STEP 5: If scheduled or recurring → Save and let scheduler handle it
    // ==========================================================
    if (scheduleType === "scheduled" || scheduleType === "recurring") {
      console.log(`🕒 Campaign ${campaign.id} saved for ${scheduleType} sending`);
      
      // ✅ Create automation log for scheduled campaign
      await prisma.automationLog.create({
        data: {
          userId: req.user.id,
          campaignId: campaign.id,
          campaignName: emailSubject,
          status: 'scheduled',
          message: scheduleType === "scheduled" 
            ? `Campaign scheduled for ${scheduledDateTime.toLocaleString()}`
            : `Recurring campaign created (${recurringFrequency})`,
        },
      });

      return res.status(200).json({
        success: true,
        message:
          scheduleType === "scheduled"
            ? `✅ Campaign scheduled for ${scheduledDate} at ${scheduledTime}. It will be sent automatically.`
            : `✅ Recurring campaign created (${recurringFrequency}). It will be sent automatically based on your schedule.`,
        campaignId: campaign.id,
        scheduledAt: scheduledDateTime,
      });
    }

    // ==========================================================
    // 🚀 STEP 6: Immediate Send
    // ==========================================================
    const htmlContent = generateHtmlFromCanvas(canvasData, emailSubject, fromName, fromEmail);
    const plainTextContent = generatePlainTextFromCanvas(canvasData, emailSubject, fromName, fromEmail);
    
    const results = { success: [], failed: [] };
    let actualSentCount = 0;

    console.log(`📤 Sending immediate campaign to ${recipients.length} recipients`);

    for (const r of recipients) {
      const toEmail = typeof r === "string" ? r : r.email;
      if (!toEmail) continue;
      if (actualSentCount >= availableCredits) {
        results.failed.push({ email: toEmail, error: "Credit limit reached" });
        break;
      }

      const msg = {
        to: toEmail,
        from: { name: fromName, email: fromEmail },
        subject: emailSubject,
        text: plainTextContent,
        html: htmlContent,
      };

      try {
        const response = await sgMail.send(msg);
        if (response[0].statusCode >= 200 && response[0].statusCode < 300) {
          results.success.push({ email: toEmail });
          actualSentCount++;
        } else {
          results.failed.push({ email: toEmail, error: `SendGrid status ${response[0].statusCode}` });
        }
      } catch (err) {
        const msgErr = err.response?.body?.errors?.[0]?.message || err.message || "Unknown error";
        console.error(`❌ Failed to send to ${toEmail}:`, msgErr);
        results.failed.push({ email: toEmail, error: msgErr });
      }

      await new Promise((r) => setTimeout(r, 200));
    }

    // ==========================================================
    // 💰 STEP 7: Deduct Credits
    // ==========================================================
    const newUserCredits = Math.max(0, (user.emailLimit ?? 0) - actualSentCount);

    const latestPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id, status: "succeeded" },
      orderBy: { paymentDate: "desc" },
    });

    if (latestPayment) {
      const updatedSendCredits = Math.max(
        0,
        (latestPayment.emailSendCredits || 0) - actualSentCount
      );
      await prisma.payment.update({
        where: { id: latestPayment.id },
        data: { emailSendCredits: updatedSendCredits },
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { emailLimit: newUserCredits },
    });

    // ✅ Update campaign status
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { 
        sentCount: actualSentCount,
        status: results.failed.length === 0 ? 'sent' : 'failed'
      },
    });

    // ✅ Create automation log
    await prisma.automationLog.create({
      data: {
        userId: req.user.id,
        campaignId: campaign.id,
        campaignName: emailSubject,
        status: results.failed.length === 0 ? 'sent' : 'failed',
        message: `Campaign sent: ${results.success.length} success, ${results.failed.length} failed`,
        error: results.failed.length > 0 ? `${results.failed.length} emails failed` : null,
      },
    });

    console.log(`✅ Immediate campaign sent - Success: ${results.success.length}, Failed: ${results.failed.length}`);

    // ==========================================================
    // 📤 STEP 8: Response
    // ==========================================================
    res.status(200).json({
      success: true,
      message: `Sent: ${results.success.length}, Failed: ${results.failed.length}`,
      campaignId: campaign.id,
      results,
      creditsUsed: actualSentCount,
      creditsRemaining: newUserCredits,
    });
  } catch (err) {
    console.error("❌ Campaign send error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Failed to process campaign",
    });
  }
});
 
router.get("/", async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch {
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { events: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  } catch {
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: req.user.id },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    await prisma.campaign.delete({ where: { id } });
    res.json({ message: "Campaign deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

export { router };
