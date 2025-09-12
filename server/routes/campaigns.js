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

// Fixed HTML generation section for campaigns.js

      let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
              .email-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 0;
              }
              .email-content {
                  position: relative;
                  width: 100%;
                  background-color: #ffffff;
                  padding: 20px;
                  box-sizing: border-box;
              }
              .email-footer {
                  margin-top: 30px;
                  padding: 20px;
                  background-color: #f8f9fa;
                  border-top: 1px solid #dee2e6;
                  color: #6c757d;
                  font-size: 14px;
                  text-align: center;
              }
              /* Responsive styles */
              @media only screen and (max-width: 600px) {
                  .email-container {
                      max-width: 100% !important;
                      margin: 0 !important;
                  }
                  .email-content {
                      padding: 15px !important;
                  }
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-content">
      `;

      if (canvasData && canvasData.length > 0) {
          canvasData.forEach((element) => {
             if (element.type === "heading") {
                      htmlContent += `
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                        <tr>
                          <td align="${element.textAlign || 'center'}" style="padding: 20px;">
                            <h1 style="
                                font-size: ${element.fontSize || 24}px;
                                color: ${element.color || '#000'};
                                margin: 0;
                                font-family: ${element.fontFamily || 'Arial, sans-serif'};
                                line-height: 1.3;
                                font-weight: bold;
                            ">
                              ${element.content || 'Heading'}
                            </h1>
                          </td>
                        </tr>
                      </table>`;
                  } else if (element.type === "subheading") {
                      htmlContent += `
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                        <tr>
                          <td align="${element.textAlign || 'center'}" style="padding: 15px;">
                            <h2 style="
                                font-size: ${element.fontSize || 20}px;
                                color: ${element.color || '#333'};
                                margin: 0;
                                font-family: ${element.fontFamily || 'Arial, sans-serif'};
                                line-height: 1.3;
                                font-weight: 600;
                            ">
                              ${element.content || 'Subheading'}
                            </h2>
                          </td>
                        </tr>
                      </table>`;
                  } else if (element.type === "paragraph") {
                  // Split content by line breaks and create proper paragraphs
                  const paragraphs = (element.content || 'Paragraph text').split('\n').filter(p => p.trim());
                  paragraphs.forEach(paragraph => {
                      htmlContent += `
                      <p style="
                          font-size: ${element.fontSize || 16}px; 
                          color: ${element.color || '#333'}; 
                          margin: 0 0 16px 0;
                          line-height: 1.6;
                          font-family: ${element.fontFamily || 'Arial, sans-serif'};
                          font-weight: ${element.fontWeight || 'normal'};
                          text-align: ${element.textAlign || 'left'};
                      ">
                          ${paragraph.trim()}
                      </p>`;
                  });
              } else if (element.type === "blockquote") {
                  htmlContent += `
                  <blockquote style="
                      font-size: ${element.fontSize || 16}px; 
                      color: ${element.color || '#555'}; 
                      margin: 20px 0;
                      padding: 15px 20px;
                      border-left: 4px solid ${element.borderColor || '#ddd'};
                      background-color: #f9f9f9;
                      font-style: italic;
                      line-height: 1.6;
                      font-family: ${element.fontFamily || 'Arial, sans-serif'};
                  ">
                      ${element.content || 'Blockquote text'}
                  </blockquote>`;
              } else if (element.type === "image") {
                  htmlContent += `
                  <div style="margin: 20px 0; text-align: ${element.textAlign || 'center'};">
                      <img src="${element.src}" 
                          style="
                              max-width: ${element.width || 400}px; 
                              height: auto;
                              border-radius: ${element.borderRadius || 0}px;
                              border: ${element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'};
                              display: block;
                              margin: 0 auto;
                          " 
                          alt="${element.alt || 'Image'}"
                      />
                  </div>`;
              } else if (element.type === "button") {
                  htmlContent += `
                  <div style="margin: 25px 0; text-align: ${element.textAlign || 'center'};">
                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                          <tbody>
                              <tr>
                                  <td style="
                                      background-color: ${element.backgroundColor || '#007bff'};
                                      border-radius: ${element.borderRadius || 6}px;
                                      padding: ${element.padding || '12px 24px'};
                                  ">
                                      <a href="${element.link || '#'}" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style="
                                              display: inline-block;
                                              font-size: ${element.fontSize || 16}px;
                                              font-family: ${element.fontFamily || 'Arial, sans-serif'};
                                              color: ${element.color || '#ffffff'};
                                              font-weight: ${element.fontWeight || 'bold'};
                                              text-decoration: none;
                                              line-height: 1.2;
                                        "
                                      >
                                          ${element.content || 'Click Me'}
                                      </a>
                                  </td>
                              </tr>
                          </tbody>
                      </table>
                  </div>`;
              } else if (element.type === "card") {
                  htmlContent += `
                  <div style="
                      border: 1px solid ${element.borderColor || '#ddd'};
                      border-radius: ${element.borderRadius || 8}px;
                      padding: ${element.padding || '20px'};
                      margin: 20px 0;
                      background-color: ${element.backgroundColor || '#f9f9f9'};
                      box-shadow: ${element.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'};
                  ">
                      <div style="
                          font-size: ${element.fontSize || 16}px; 
                          color: ${element.color || '#333'};
                          line-height: 1.6;
                          font-family: ${element.fontFamily || 'Arial, sans-serif'};
                      ">
                          ${(element.content || 'Card content goes here').replace(/\n/g, '<br>')}
                      </div>
                  </div>`;
              } else if (element.type === "line") {
                  htmlContent += `
                  <hr style="
                      border: none;
                      height: ${element.strokeWidth || 1}px;
                      background-color: ${element.strokeColor || '#ddd'};
                      margin: 25px 0;
                      width: 100%;
                  ">`;
              }
              // Add more element types as needed...
          });
      } else {
          // Default content if no canvas data
          htmlContent += `
          <div style="text-align: center; padding: 40px 20px; color: #666;">
              <h2 style="color: #333; margin-bottom: 16px;">No Content Available</h2>
              <p style="font-size: 16px; line-height: 1.6;">This email was sent without content from the design editor.</p>
          </div>`;
      }

      htmlContent += `
              </div>
              <div class="email-footer">
                  <p style="margin: 0 0 10px 0;">
                      This email was sent by <strong>${fromName}</strong>
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #999;">
                      If you have questions, please reply to this email or contact us at 
                      <a href="mailto:${fromEmail}" style="color: #007bff; text-decoration: none;">${fromEmail}</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
      `;
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

// DELETE /api/campaigns/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCampaign = await prisma.campaign.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Campaign deleted successfully." });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});


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
