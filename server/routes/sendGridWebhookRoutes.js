import express from "express";
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();

router.post("/sendgrid/webhook", express.json({ type:"*/*" }), async (req,res)=>{
  const events = req.body;

  if(!Array.isArray(events)) return res.status(400).send("Invalid payload");

  try {
    for(const ev of events){
      const email = ev.email?.toLowerCase();
      if(!email) continue;

      if(ev.event === "bounce") {
        console.log("Bounce:", email);
        await prisma.verification.updateMany({
          where:{ email },
          data:{ bounced:true, mailbox_exists:false }
        });
      } 
      else if(ev.event === "delivered") {
        console.log("Delivered:", email);
        await prisma.verification.updateMany({
          where:{ email },
          data:{ mailbox_exists:true }
        });
      }
    }

    res.status(200).send("OK");
  } catch(err){
    console.error("SendGrid webhook error:",err);
    res.status(500).send("Webhook error");
  }
});

export default router;
