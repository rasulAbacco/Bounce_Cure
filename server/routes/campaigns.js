import express from "express";
import nodemailer from "nodemailer";
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();

// Create email transporter with TLS options
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// Send campaign + save to DB
router.post("/send", async (req, res) => {
  try {
    const { recipients, fromName, fromEmail, subject, canvasData } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients specified" });
    }
    if (!subject) {
      return res.status(400).json({ error: "Email subject is required" });
    }
 // --- Generate HTML from canvasData this is formart for receiving  mail---

 let htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
    
    <div style="position: relative; width: 800px; background-color: #ffffff; padding: 20px;">
  `;

  if (canvasData && canvasData.length > 0) {
    canvasData.forEach((element) => {
      if (element.type === "heading") {
        htmlContent += `<h1 style="font-size: ${element.fontSize || 24}px; color: ${element.color || '#000'}; margin: 10px 0;">${element.content || 'Heading'}</h1>`;
      } else if (element.type === "paragraph") {
        htmlContent += `<p style="font-size: ${element.fontSize || 14}px; color: ${element.color || '#000'}; margin: 10px 0;">${element.content || 'Paragraph text'}</p>`;
      } else if (element.type === "image") {
        htmlContent += `<img src="${element.src}" style="width: ${element.width || 200}px; height: ${element.height || 150}px; object-fit: cover; margin: 10px 0;" alt="Image"/>`;
      } else if (element.type === "button") {
        htmlContent += `
          <a href="${element.link || '#'}" style="
            display: inline-block;
            background-color: ${element.backgroundColor || '#007bff'};
            color: ${element.color || '#ffffff'};
            padding: 10px 20px;
            text-decoration: none;
            border-radius: ${element.borderRadius || 4}px;
            font-size: ${element.fontSize || 16}px;
            margin: 10px 0;
          ">
            ${element.content || 'Click Me'}
          </a>
        `;
      } else if (element.type === "card") {
        htmlContent += `
          <div style="
            border: 1px solid ${element.borderColor || '#ddd'};
            border-radius: ${element.borderRadius || 8}px;
            padding: ${element.padding || 16}px;
            box-shadow: ${element.boxShadow || '0 2px 5px rgba(0,0,0,0.1)'};
            margin: 10px 0;
            background-color: ${element.backgroundColor || '#f9f9f9'};
          ">
            <p style="font-size: ${element.fontSize || 14}px; color: ${element.color || '#333'};">
              ${element.content || 'Card content goes here'}
            </p>
          </div>
        `;
      }
      // Add more types as needed...
    });
  }

  htmlContent += `
    </div>
    <p style="margin-top: 20px; color: #666; font-size: 14px;">
      This email was sent by ${fromName} (${fromEmail}).
    </p>
    </div>
  `;


    // --- Save campaign in DB ---
    const campaign = await prisma.campaign.create({
      data: {
        name: subject,
        subject,
        fromName,
        fromEmail,
        sentCount: recipients.length,
        designJson: JSON.stringify(canvasData || []),
      },
    });

    // --- Save "sent" events ---
    await prisma.campaignEvent.createMany({
      data: recipients.map((r) => ({
        campaignId: campaign.id,
        type: "sent",
        email: r.email,
      })),
    });

    // --- Send emails ---
    const emailPromises = recipients.map((recipient) => {
      const mailOptions = {
        from: `"${fromName}" <${process.env.EMAIL_USER}>`, // always use verified sender
        replyTo: fromEmail,
        to: recipient.email,
        subject,
        html: htmlContent,
      };
      return transporter.sendMail(mailOptions);
    });
    await Promise.all(emailPromises);

    res.status(200).json({
      message: `✅ Campaign sent successfully to ${recipients.length} recipients!`,
      campaignId: campaign.id,
      recipientsCount: recipients.length,
    });
  } catch (error) {
    console.error("Error sending campaign:", error);
    res.status(500).json({ error: "Failed to send campaign" });
  }
});

// 🔹 Analytics routes
router.get("/", async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { events: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { events: true },
    });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaign" });
  }
});

export { router };
