import express from "express";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import sendEmail from "../services/emailService.js";

const prisma = new PrismaClient();
const router = express.Router();

// Add sender verification endpoint
router.get("/sender/verification", async (req, res) => {
  try {
    // This is a placeholder - in a real implementation, you would check SendGrid API
    const verified = true; // Replace with actual verification logic

    res.json({ verified });
  } catch (error) {
    console.error("Error checking sender verification:", error);
    res.status(500).json({
      error: "Failed to check sender verification",
      details: error.message
    });
  }
});

// Add sender verification middleware
const verifySender = async (req, res, next) => {
  const { fromEmail } = req.body;

  try {
    const isVerified = true; // Replace with actual verification

    if (!isVerified) {
      return res.status(400).json({
        error: "Sender domain not verified",
        message: "Please verify your sender domain in SendGrid and set up SPF, DKIM, and DMARC records.",
        deliverabilityTips: [
          "Verify your sender domain in SendGrid",
          "Set up SPF, DKIM, and DMARC records",
          "Use a professional domain email",
          "Avoid spam trigger words",
          "Send to engaged subscribers only"
        ]
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Error verifying sender" });
  }
};

// ========== CRON JOB ==========
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    // Get campaigns that are due
    const dueCampaigns = await prisma.scheduledCampaign.findMany({
      where: {
        status: "scheduled",
        scheduledDateTime: { lte: now },
      },
    });

    if (dueCampaigns.length === 0) {
      return;
    }

    for (const campaign of dueCampaigns) {
      try {
        await sendEmail(campaign);

        await prisma.scheduledCampaign.update({
          where: { id: campaign.id },
          data: { status: "sent" },
        });

        console.log(`✅ Campaign "${campaign.campaignName}" sent successfully`);
      } catch (err) {
        console.error("❌ Failed to send campaign:", err);
        await prisma.scheduledCampaign.update({
          where: { id: campaign.id },
          data: {
            status: "failed",
            error: err.message || "Unknown error"
          },
        });
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

// Add a manual trigger endpoint for testing
router.post("/trigger-cron", async (req, res) => {
  try {
    const now = new Date();

    // Get campaigns that are due
    const dueCampaigns = await prisma.scheduledCampaign.findMany({
      where: {
        status: "scheduled",
        scheduledDateTime: { lte: now },
      },
    });

    if (dueCampaigns.length === 0) {
      // Get all scheduled campaigns for the response
      const scheduledCampaigns = await prisma.scheduledCampaign.findMany({
        where: {
          status: "scheduled",
        },
      });

      return res.json({
        message: "No campaigns are due at this time",
        scheduledCount: scheduledCampaigns.length,
        scheduledCampaigns: scheduledCampaigns.map(c => ({
          id: c.id,
          campaignName: c.campaignName,
          scheduledDateTime: c.scheduledDateTime
        }))
      });
    }

    const results = [];

    for (const campaign of dueCampaigns) {
      try {
        await sendEmail(campaign);

        await prisma.scheduledCampaign.update({
          where: { id: campaign.id },
          data: { status: "sent" },
        });

        results.push({ id: campaign.id, status: "sent" });
      } catch (err) {
        await prisma.scheduledCampaign.update({
          where: { id: campaign.id },
          data: {
            status: "failed",
            error: err.message || "Unknown error"
          },
        });
        results.push({ id: campaign.id, status: "failed", error: err.message });
      }
    }

    // Get remaining scheduled campaigns
    const remainingScheduled = await prisma.scheduledCampaign.findMany({
      where: {
        status: "scheduled",
      },
    });

    res.json({
      message: "Cron job triggered successfully",
      processedCount: dueCampaigns.length,
      results,
      scheduledCount: remainingScheduled.length,
      scheduledCampaigns: remainingScheduled.map(c => ({
        id: c.id,
        campaignName: c.campaignName,
        scheduledDateTime: c.scheduledDateTime
      }))
    });
  } catch (error) {
    console.error("Error triggering cron job:", error);
    res.status(500).json({ error: "Failed to trigger cron job" });
  }
});

// ========== ROUTES ==========

// Create / send campaign (for immediate sending)
router.post("/send", verifySender, async (req, res) => {
  try {
    const {
      campaignName,
      subject,
      fromName,
      fromEmail,
      recipients,
      canvasData,
      template = 'basic', // Add template support with default
      scheduleType,
      scheduledDate,
      scheduledTime,
      timezone,
      recurringFrequency,
      recurringDays,
      recurringEndDate,
    } = req.body;

    // Log received data for debugging
    console.log("Received campaign data:", {
      campaignName,
      subject,
      template,
      canvasDataLength: canvasData?.length || 0,
      recipientCount: recipients?.length || 0
    });

    // Validate required fields
    if (!campaignName || !subject || !fromName || !fromEmail || !recipients?.length) {
      return res.status(400).json({
        error: "Missing required campaign fields",
        deliverabilityTips: [
          "All fields are required",
          "Use a professional sender name and email",
          "Include at least one recipient"
        ]
      });
    }

    // Check for spam trigger words in subject
    const spamTriggers = [
      'free', 'urgent', 'act now', 'limited time', 'click here', 'make money',
      'guaranteed', 'no cost', 'risk free', 'winner', 'congratulations'
    ];
    const subjectLower = subject.toLowerCase();
    const hasSpamTriggers = spamTriggers.some(trigger => subjectLower.includes(trigger));

    if (hasSpamTriggers) {
      return res.status(400).json({
        error: "Subject contains spam trigger words",
        message: "Your subject line contains words that might trigger spam filters.",
        deliverabilityTips: [
          "Avoid words like 'free', 'urgent', 'guarantee'",
          "Be clear and honest in your subject line",
          "Personalize when possible"
        ]
      });
    }

    // Convert scheduled date & time into a Date object
    let scheduledDateTime = null;
    if (scheduleType === "scheduled" || scheduleType === "recurring") {
      if (!scheduledDate || !scheduledTime) {
        return res.status(400).json({
          error: "Scheduled campaigns require date and time",
          deliverabilityTips: [
            "Provide both date and time for scheduled campaigns",
            "Consider your recipients' timezone"
          ]
        });
      }

      // Create a Date object in the specified timezone
      scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);

      // If timezone is provided, adjust for it
      if (timezone && timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
        // This is a simplified approach - in production, use a library like moment-timezone
        const offset = new Date().getTimezoneOffset();
        const targetOffset = getTimezoneOffset(timezone);
        const diff = offset - targetOffset;
        scheduledDateTime = new Date(scheduledDateTime.getTime() + diff * 60000);
      }
    }

    // Create campaign with JSON data including template and canvas data
    const newCampaign = await prisma.scheduledCampaign.create({
      data: {
        campaignName,
        subject,
        fromName,
        fromEmail,
        recipients: recipients,
        template: template, // Store template choice
        canvasData: canvasData || [], // Store canvas data
        scheduleType,
        scheduledDateTime,
        timezone,
        recurringFrequency,
        recurringDays: recurringDays,
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
        status: scheduleType === "immediate" ? "processing" : "scheduled",
      },
    });

    console.log(`Created campaign with ID: ${newCampaign.id}, status: ${newCampaign.status}, template: ${template}`);

    // If immediate, send the campaign right now
    if (scheduleType === "immediate") {
      try {
        // Prepare enhanced campaign data for email service
        const enhancedCampaign = {
          ...newCampaign,
          template: template,
          canvasData: canvasData || []
        };

        const result = await sendEmail(enhancedCampaign);

        await prisma.scheduledCampaign.update({
          where: { id: newCampaign.id },
          data: { status: "sent" },
        });

        return res.json({
          message: `Campaign sent successfully using ${result.template} template`,
          campaign: newCampaign,
          result: result,
          deliverabilityTips: [
            "Monitor your campaign performance in analytics",
            "Check for spam complaints and unsubscribes",
            "Clean your email list regularly for better engagement"
          ]
        });
      } catch (err) {
        console.error("Failed to send immediate campaign:", err);
        await prisma.scheduledCampaign.update({
          where: { id: newCampaign.id },
          data: {
            status: "failed",
            error: err.message || "Unknown error"
          },
        });
        return res.status(500).json({
          error: "Failed to send immediate campaign",
          details: err.message,
          deliverabilityTips: [
            "Check your sender verification status",
            "Verify your SPF, DKIM, and DMARC records",
            "Ensure your content doesn't trigger spam filters"
          ]
        });
      }
    }

    res.json({
      message: `Campaign scheduled successfully with ${template} template`,
      campaign: newCampaign,
      deliverabilityTips: [
        "Monitor your campaign before it sends",
        "Ensure your sender domain is authenticated",
        "Check your recipient list for engagement"
      ]
    });
  } catch (error) {
    console.error("Error scheduling campaign:", error);
    res.status(500).json({
      error: "Failed to schedule campaign",
      details: error.message
    });
  }
});

// Helper function to get timezone offset (simplified)
function getTimezoneOffset(timeZone) {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  return (utcDate - tzDate) / (1000 * 60);
}

// Get all scheduled campaigns
router.get("/scheduled", async (req, res) => {
  try {
    const campaigns = await prisma.scheduledCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Add recipient count and template info to each campaign
    const campaignsWithCount = campaigns.map(campaign => ({
      ...campaign,
      recipientCount: Array.isArray(campaign.recipients) ? campaign.recipients.length : 0,
      template: campaign.template || 'basic',
    }));

    res.json(campaignsWithCount);
  } catch (error) {
    console.error("Error fetching scheduled campaigns:", error);
    res.status(500).json({
      error: "Failed to fetch scheduled campaigns",
      details: error.message
    });
  }
});

// Get automation logs
router.get("/logs", async (req, res) => {
  try {
    // For now, we'll create logs from campaign history
    // In a real app, you'd have a separate logs table
    const campaigns = await prisma.scheduledCampaign.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50, // Last 50 activities
    });

    const logs = campaigns.map(campaign => ({
      id: campaign.id,
      campaignName: campaign.campaignName,
      status: campaign.status,
      message: getLogMessage(campaign.status, campaign.campaignName, campaign.template),
      createdAt: campaign.updatedAt,
      details: `Recipients: ${campaign.recipients?.length || 0} | Template: ${campaign.template || 'basic'}`,
    }));

    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({
      error: "Failed to fetch logs",
      details: error.message
    });
  }
});

// Helper function to generate log messages
function getLogMessage(status, campaignName, template) {
  const templateText = template ? ` using ${template} template` : '';
  switch (status) {
    case 'scheduled':
      return `Campaign "${campaignName}" has been scheduled${templateText}`;
    case 'sent':
      return `Campaign "${campaignName}" sent successfully${templateText}`;
    case 'failed':
      return `Campaign "${campaignName}" failed to send${templateText}`;
    case 'paused':
      return `Campaign "${campaignName}" has been paused`;
    case 'processing':
      return `Campaign "${campaignName}" is being processed${templateText}`;
    default:
      return `Campaign "${campaignName}" status updated`;
  }
}

// Pause campaign
router.post("/:id/pause", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    if (isNaN(campaignId)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const campaign = await prisma.scheduledCampaign.update({
      where: { id: campaignId },
      data: { status: "paused" },
    });

    // Parse recipients if stored as JSON
    const parsedCampaign = {
      ...campaign,
      recipientCount: Array.isArray(campaign.recipients) ? campaign.recipients.length : 0,
    };

    res.json({
      message: "Campaign paused successfully",
      campaign: parsedCampaign
    });
  } catch (error) {
    console.error("Error pausing campaign:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(500).json({
      error: "Failed to pause campaign",
      details: error.message
    });
  }
});

// Resume campaign
router.post("/:id/resume", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    if (isNaN(campaignId)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    const campaign = await prisma.scheduledCampaign.update({
      where: { id: campaignId },
      data: { status: "scheduled" },
    });

    // Parse recipients if stored as JSON
    const parsedCampaign = {
      ...campaign,
      recipientCount: Array.isArray(campaign.recipients) ? campaign.recipients.length : 0,
    };

    res.json({
      message: "Campaign resumed successfully",
      campaign: parsedCampaign
    });
  } catch (error) {
    console.error("Error resuming campaign:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(500).json({
      error: "Failed to resume campaign",
      details: error.message
    });
  }
});

// Delete campaign
router.delete("/:id/delete", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    if (isNaN(campaignId)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    // First, delete any related SentEmail records
    try {
      await prisma.sentEmail.deleteMany({
        where: {
          campaignId: campaignId
        }
      });
      console.log(`Deleted related SentEmail records for campaign ${campaignId}`);
    } catch (error) {
      // If the table doesn't exist or there's another error, continue with deletion
      console.log("No related SentEmail records found or error deleting them:", error.message);
    }

    // Then delete the campaign
    await prisma.scheduledCampaign.delete({
      where: { id: campaignId },
    });

    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(500).json({
      error: "Failed to delete campaign",
      details: error.message
    });
  }
});

// Alternative delete route (POST method for compatibility)
router.post("/:id/delete", async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    if (isNaN(campaignId)) {
      return res.status(400).json({ error: "Invalid campaign ID" });
    }

    // First, delete any related SentEmail records
    try {
      await prisma.sentEmail.deleteMany({
        where: {
          campaignId: campaignId
        }
      });
      console.log(`Deleted related SentEmail records for campaign ${campaignId}`);
    } catch (error) {
      // If the table doesn't exist or there's another error, continue with deletion
      console.log("No related SentEmail records found or error deleting them:", error.message);
    }

    // Then delete the campaign
    await prisma.scheduledCampaign.delete({
      where: { id: campaignId },
    });

    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(500).json({
      error: "Failed to delete campaign",
      details: error.message
    });
  }
});

export default router;