// server/routes/dashboardCRM.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ middleware

const router = express.Router();

// Dashboard Overview (user-specific)
router.get("/overview", protect, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ logged-in user

    const verifiedCount = await prisma.verification.count({
      where: { userId },
    });

    // Example static or derived stats (you can expand later)
    const stats = [
      { label: "Verified Emails", value: verifiedCount },
      { label: "Bounce Rate", value: "2.5%" },
      { label: "Active Campaigns", value: 8 },
    ];

    // Get recent verifications for this user
    const history = await prisma.verification.findMany({
      where: { userId },
      orderBy: { checkedAt: "desc" },
      take: 10,
    });

    res.json({ stats, history });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;



// // server/routes/dashboardCRM.js

// import express from "express";
// import {prisma } from "../prisma/prismaClient.js";

// const router = express.Router();
 

// router.get("/overview", async (req, res) => {
//   try {
//     const stats = [
//     //   { label: "Total Clients", value: await prisma.client.count() },
//       { label: "Verified Emails", value: await prisma.verification.count() }, // ✅ from your Verification table
//       { label: "Bounce Rate", value: "2.5%" }, 
//       { label: "Active Campaigns", value: 8 }
//     ];

//     const history = await prisma.verification.findMany({
//       orderBy: { checkedAt: "desc" },
//       take: 10
//     });

//     res.json({ stats, history });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;
