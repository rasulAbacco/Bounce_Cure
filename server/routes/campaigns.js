// server/routes/campaigns.js
import express from "express";
import sgMail from "@sendgrid/mail";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

const generateHtmlFromCanvas = (canvasData, subject, fromName, fromEmail) => {
  if (!canvasData || canvasData.length === 0) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
      </head>
      <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                  <td align="center" style="padding:20px;">
                      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
                          <tr>
                              <td style="padding:20px;background-color:#ffffff;">
                                  <h1 style="margin:0 0 20px 0;font-size:24px;color:#333333;">${subject}</h1>
                                  <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#333333;">
                                      This email was sent from your campaign builder.
                                  </p>
                                  <hr style="border:none;height:1px;background-color:#eeeeee;margin:30px 0;">
                                  <p style="margin:0;font-size:12px;color:#999999;text-align:center;">
                                      Sent by ${fromName}<br>
                                      <a href="mailto:${fromEmail}" style="color:#007bff;">${fromEmail}</a>
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>
    `;
  }

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
    </head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td align="center" style="padding:20px;">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;">
                        <tr>
                            <td style="padding:30px;">
  `;

  canvasData.forEach((element) => {
    switch (element.type) {
      case "heading":
        htmlContent += `<h1 style="margin:0 0 20px 0;font-size:${element.fontSize || 28}px;color:${element.color || '#333'};font-weight:bold;text-align:${element.textAlign || 'left'};">${element.content || 'Heading'}</h1>`;
        break;
        
      case "subheading":
        htmlContent += `<h2 style="margin:0 0 16px 0;font-size:${element.fontSize || 22}px;color:${element.color || '#333'};font-weight:600;text-align:${element.textAlign || 'left'};">${element.content || 'Subheading'}</h2>`;
        break;
        
      case "paragraph":
        const paragraphs = (element.content || 'Paragraph text').split('\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
          htmlContent += `<p style="margin:0 0 16px 0;font-size:${element.fontSize || 16}px;color:${element.color || '#333'};line-height:1.6;text-align:${element.textAlign || 'left'};">${paragraph.trim()}</p>`;
        });
        break;

      case "image":
        htmlContent += `<div style="margin:20px 0;text-align:${element.textAlign || 'center'};"><img src="${element.src}" alt="${element.alt || 'Image'}" style="max-width:100%;height:auto;display:block;margin:0 auto;" /></div>`;
        break;
        
      case "button":
        htmlContent += `
          <table cellpadding="0" cellspacing="0" border="0" style="margin:25px auto;">
              <tr>
                  <td style="background-color:${element.backgroundColor || '#007bff'};padding:12px 24px;border-radius:6px;">
                      <a href="${element.link || '#'}" style="color:${element.color || '#ffffff'};text-decoration:none;font-weight:bold;font-size:${element.fontSize || 16}px;">${element.content || 'Click Me'}</a>
                  </td>
              </tr>
          </table>`;
        break;
        
      case "line":
        htmlContent += `<hr style="border:none;height:${element.strokeWidth || 1}px;background-color:${element.strokeColor || '#dee2e6'};margin:25px 0;" />`;
        break;
    }
  });

  htmlContent += `
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px;background-color:#f8f9fa;border-top:1px solid #dee2e6;text-align:center;">
                            <p style="margin:0 0 10px 0;font-size:12px;color:#6c757d;">
                                This email was sent by <strong>${fromName}</strong>
                            </p>
                            <p style="margin:0;font-size:11px;color:#999999;">
                                <a href="mailto:${fromEmail}" style="color:#007bff;">${fromEmail}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </body>
    </html>
  `;

  return htmlContent;
};

const generatePlainTextFromCanvas = (canvasData, subject, fromName, fromEmail) => {
  let plainText = `${subject}\n\n`;
  
  if (!canvasData || canvasData.length === 0) {
    plainText += "This email was sent from your campaign builder.\n\n";
  } else {
    canvasData.forEach((element) => {
      switch (element.type) {
        case "heading":
        case "subheading":
        case "paragraph":
          plainText += `${element.content || ''}\n\n`;
          break;
        case "image":
          plainText += `[Image: ${element.alt || 'Image'}]\n\n`;
          break;
        case "button":
          plainText += `[${element.content || 'Button'}] - ${element.link || '#'}\n\n`;
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

router.post("/send", async (req, res) => {
  try {
    const { recipients, fromEmail, fromName, subject, canvasData } = req.body;

    if (!recipients?.length) return res.status(400).json({ error: "No recipients specified" });
    if (!subject || !fromEmail || !fromName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ CHECK EMAIL SEND CREDITS BEFORE SENDING
    const latestPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id },
      orderBy: { paymentDate: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailLimit: true, plan: true },
    });

    const availableCredits = latestPayment?.emailSendCredits ?? user?.emailLimit ?? 0;
    const requiredCredits = recipients.length;

    console.log(`📧 User ${req.user.id} - Available: ${availableCredits}, Required: ${requiredCredits}`);

    if (availableCredits < requiredCredits) {
      return res.status(403).json({
        error: "Insufficient email send credits",
        available: availableCredits,
        required: requiredCredits,
        creditLimitReached: true,
      });
    }

    // Check if sender is verified
    const sender = await prisma.verifiedSender.findFirst({
      where: { email: fromEmail.toLowerCase() },
    });

    if (!sender || !sender.verified) {
      return res.status(400).json({
        error: "Sender email not verified",
        senderVerificationRequired: true,
      });
    }

    // Setup SendGrid API
    if (!process.env.SENDGRID_USER_API_KEY) {
      throw new Error("Missing SENDGRID_USER_API_KEY");
    }
    sgMail.setApiKey(process.env.SENDGRID_USER_API_KEY);

    const htmlContent = generateHtmlFromCanvas(canvasData, subject, fromName, fromEmail);
    const plainTextContent = generatePlainTextFromCanvas(canvasData, subject, fromName, fromEmail);

    // Save campaign
    const campaign = await prisma.campaign.create({
      data: {
        userId: req.user.id,
        name: subject,
        subject,
        fromEmail,
        fromName,
        sentCount: recipients.length,
        deliveredCount: 0,
        openCount: 0,
        clickCount: 0,
        conversionCount: 0,
        designJson: JSON.stringify(canvasData || []),
      },
    });

    const results = { success: [], failed: [] };
    let deliveredCount = 0;
    let actualSentCount = 0;

    for (const recipient of recipients) {
      // ✅ STOP SENDING IF CREDITS RUN OUT MID-CAMPAIGN
      if (actualSentCount >= availableCredits) {
        console.log(`⚠️ Credit limit reached. Stopping at ${actualSentCount} emails.`);
        results.failed.push({
          email: recipient.email,
          error: "Credit limit reached",
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const msg = {
        to: recipient.email,
        from: { name: fromName, email: fromEmail },
        replyTo: { email: fromEmail, name: fromName },
        subject,
        text: plainTextContent,
        html: htmlContent,
        headers: {
          "List-Unsubscribe": `<mailto:unsubscribe@yourdomain.com>, <https://yourdomain.com/unsubscribe>`,
        },
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: true },
        },
        mailSettings: {
          bypassListManagement: { enable: true },
          footer: { enable: false },
          sandboxMode: { enable: false },
        },
      };

      try {
        await sgMail.send(msg);
        deliveredCount++;
        actualSentCount++;
        results.success.push({ 
          email: recipient.email, 
          timestamp: new Date().toISOString() 
        });

        await prisma.campaignEvent.create({
          data: {
            campaignId: campaign.id,
            userId: req.user.id,
            type: "delivered",
            email: recipient.email,
          },
        });

      } catch (err) {
        const errorMessage = err.response?.body?.errors?.[0]?.message || err.message || "Unknown error";
        results.failed.push({ 
          email: recipient.email, 
          error: errorMessage, 
          timestamp: new Date().toISOString() 
        });

        await prisma.campaignEvent.create({
          data: {
            campaignId: campaign.id,
            userId: req.user.id,
            type: "failed",
            email: recipient.email,
          },
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // ✅ DEDUCT CREDITS AFTER SUCCESSFUL SENDS
    const newCredits = availableCredits - actualSentCount;
    
    if (latestPayment) {
      await prisma.payment.update({
        where: { id: latestPayment.id },
        data: { emailSendCredits: Math.max(0, newCredits) },
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { emailLimit: Math.max(0, newCredits) },
    });

    console.log(`✅ Campaign ${campaign.id}: Sent=${actualSentCount}, Delivered=${deliveredCount}, Failed=${results.failed.length}`);
    console.log(`📊 Remaining credits: ${newCredits}`);

    return res.status(200).json({
      message: `Sent: ${results.success.length}, Failed: ${results.failed.length}`,
      campaignId: campaign.id,
      recipientsCount: recipients.length,
      deliveredCount: deliveredCount,
      remainingCredits: newCredits,
      results,
    });
  } catch (error) {
    console.error("Campaign send error:", error);
    return res.status(500).json({
      error: "Failed to send campaign",
      details: error.message,
    });
  }
});

// Get all campaigns for logged-in user
router.get("/", async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// Get single campaign (user-only)
router.get("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      include: { events: true },
    });

    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    console.error("Error fetching campaign:", err);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

// Delete campaign (user-only)
router.delete("/:id", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, userId: req.user.id },
    });

    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    await prisma.campaign.delete({ where: { id: campaignId } });

    res.status(200).json({ message: "Campaign deleted successfully." });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

// ✅ GET USER'S REMAINING CREDITS
router.get("/credits", protect, async (req, res) => {
  try {
    const latestPayment = await prisma.payment.findFirst({
      where: { userId: req.user.id },
      orderBy: { paymentDate: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { emailLimit: true, contactLimit: true, plan: true },
    });

    const emailSendCredits =
      latestPayment?.emailSendCredits ?? user?.emailLimit ?? 50;

    const emailVerificationCredits =
      latestPayment?.emailVerificationCredits ?? user?.contactLimit ?? 50;

    res.json({
      success: true,
      emailSendCredits,
      emailVerificationCredits,
      plan: user?.plan || "Free",
    });
  } catch (error) {
    console.error("❌ Error fetching credits:", error);
    res.status(500).json({ error: "Failed to fetch credits" });
  }
});


export { router };