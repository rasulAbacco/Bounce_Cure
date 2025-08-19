import express from "express";
import {prisma } from "../prisma/prismaClient.js";

const router = express.Router();
 

router.get("/overview", async (req, res) => {
  try {
    const stats = [
    //   { label: "Total Clients", value: await prisma.client.count() },
      { label: "Verified Emails", value: await prisma.verification.count() }, // ✅ from your Verification table
      { label: "Bounce Rate", value: "2.5%" }, 
      { label: "Active Campaigns", value: 8 }
    ];

    // const clients = await prisma.client.findMany();

    // const activities = await prisma.activity.findMany({
    //   orderBy: { id: "desc" },
    //   take: 5
    // });
    const history = await prisma.verification.findMany({
      orderBy: { checkedAt: "desc" },
      take: 10
    });

    res.json({ stats, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
