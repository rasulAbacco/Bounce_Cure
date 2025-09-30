// server/routes/webhooks.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();

router.post("/sendgrid-events", express.json(), async (req, res) => {
  try {
    const events = req.body;
    
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid webhook payload" });
    }

    console.log(`📨 Received ${events.length} events from SendGrid`);

    for (const event of events) {
      try {
        // Extract campaign ID from customArgs or categories
        const campaignId = event.campaignId || 
                          event.category?.[0]?.replace('campaign_', '') || 
                          event.unique_args?.campaignId;
        
        if (!campaignId) {
          console.warn("⚠️  No campaign ID found in event:", event.event);
          continue;
        }

        const parsedCampaignId = parseInt(campaignId);
        
        // Check if campaign exists
        const campaign = await prisma.campaign.findUnique({
          where: { id: parsedCampaignId }
        });

        if (!campaign) {
          console.warn(`⚠️  Campaign ${parsedCampaignId} not found`);
          continue;
        }

        // Handle different event types
        switch (event.event) {
          case "delivered":
            console.log(`✅ Delivered: ${event.email} (Campaign ${parsedCampaignId})`);
            break;

          case "open":
            // Check for duplicate using sgEventId
            const existingOpen = await prisma.campaignEvent.findFirst({
              where: {
                sgEventId: event.sg_event_id
              }
            });

            if (!existingOpen) {
              await prisma.campaignEvent.create({
                data: {
                  campaignId: parsedCampaignId,
                  type: "open",
                  email: event.email,
                  userAgent: event.useragent,
                  ip: event.ip,
                  sgEventId: event.sg_event_id
                }
              });

              await prisma.campaign.update({
                where: { id: parsedCampaignId },
                data: { openCount: { increment: 1 } }
              });

              console.log(`👁️  Open tracked: ${event.email} (Campaign ${parsedCampaignId})`);
            } else {
              console.log(`⏭️  Duplicate open event ignored: ${event.email}`);
            }
            break;

          case "click":
            // Check for duplicate using sgEventId
            const existingClick = await prisma.campaignEvent.findFirst({
              where: {
                sgEventId: event.sg_event_id
              }
            });

            if (!existingClick) {
              await prisma.campaignEvent.create({
                data: {
                  campaignId: parsedCampaignId,
                  type: "click",
                  email: event.email,
                  url: event.url,
                  userAgent: event.useragent,
                  ip: event.ip,
                  sgEventId: event.sg_event_id
                }
              });

              await prisma.campaign.update({
                where: { id: parsedCampaignId },
                data: { clickCount: { increment: 1 } }
              });

              console.log(`🖱️  Click tracked: ${event.email} → ${event.url} (Campaign ${parsedCampaignId})`);
            } else {
              console.log(`⏭️  Duplicate click event ignored: ${event.email}`);
            }
            break;

          case "bounce":
          case "dropped":
          case "deferred":
          case "spam_report":
          case "unsubscribe":
            // Record these events for monitoring
            await prisma.campaignEvent.create({
              data: {
                campaignId: parsedCampaignId,
                type: event.event,
                email: event.email,
                userAgent: event.useragent,
                ip: event.ip,
                sgEventId: event.sg_event_id
              }
            });
            console.log(`⚠️  ${event.event}: ${event.email} (Campaign ${parsedCampaignId})`);
            break;

          default:
            console.log(`❓ Unhandled event type: ${event.event}`);
        }
      } catch (eventError) {
        console.error("❌ Error processing event:", eventError);
      }
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export { router };