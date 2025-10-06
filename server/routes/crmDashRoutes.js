// server/routes/crmDashRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js"; // ✅ middleware

const prisma = new PrismaClient();
const router = express.Router();

// --- Leads ---
router.get("/leads", protect, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { userId: req.user.id }, // ✅ scoped to logged-in user
    });
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Contacts ---
router.get("/contacts", protect, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.id },
    });
    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Deals ---
router.get("/deals", protect, async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { userId: req.user.id },
    });
    res.json(deals);
  } catch (err) {
    console.error("Error fetching deals:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Tasks ---
router.get("/tasks", protect, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
    });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- Dashboard stats ---
router.get("/", protect, async (req, res) => {
  try {
    // --- Deals by stage ---
    const dealsByStage = await prisma.deal.groupBy({
      by: ["stage"],
      _count: { stage: true },
      where: { userId: req.user.id }, // ✅ scoped
    });

    const totalDeals =
      dealsByStage.reduce((sum, d) => sum + d._count.stage, 0) || 1;

    const pipelinePercents = dealsByStage.map((d) => ({
      label: d.stage,
      value: Math.round((d._count.stage / totalDeals) * 100),
    }));

    // --- Leads & Deals trend (per month) ---
    const leads = await prisma.lead.findMany({
      where: { userId: req.user.id },
      select: { last: true },
    });

    const deals = await prisma.deal.findMany({
      where: { userId: req.user.id },
      select: { createdAt: true },
    });

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const chartData = months.map((month, idx) => {
      const leadsCount = leads.filter((l) => {
        if (!l.last) return false;
        const date = new Date(l.last);
        return !isNaN(date) && date.getMonth() === idx;
      }).length;

      const dealsCount = deals.filter(
        (d) => new Date(d.createdAt).getMonth() === idx
      ).length;

      return { month, leads: leadsCount, deals: dealsCount };
    });

    res.json({ pipelinePercents, chartData });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;



// //server/routes/crmDashRoutes.js
// import express from "express";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const router = express.Router();

// // --- Leads ---
// router.get("/leads", async (req, res) => {
//   try {
//     const leads = await prisma.lead.findMany();
//     res.json(leads);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // --- Contacts ---
// router.get("/contacts", async (req, res) => {
//   try {
//     const contacts = await prisma.contact.findMany();
//     res.json(contacts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // --- Deals ---
// router.get("/deals", async (req, res) => {
//   try {
//     const deals = await prisma.deal.findMany();
//     res.json(deals);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // --- Tasks ---
// router.get("/tasks", async (req, res) => {
//   try {
//     const tasks = await prisma.task.findMany();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// router.get("/", async (req, res) => {
//   try {
//     // --- Deals by stage ---
//     const dealsByStage = await prisma.deal.groupBy({
//       by: ["stage"],
//       _count: { stage: true },
//     });

//     const totalDeals = dealsByStage.reduce((sum, d) => sum + d._count.stage, 0) || 1;
//     const pipelinePercents = dealsByStage.map((d) => ({
//       label: d.stage,
//       value: Math.round((d._count.stage / totalDeals) * 100),
//     }));

//     // --- Leads & Deals trend (per month) ---
//     const leads = await prisma.lead.findMany({
//       select: { last: true },
//     });

//     const deals = await prisma.deal.findMany({
//       select: { createdAt: true }, // ✅ use Deal.createdAt
//     });

//     const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//     const chartData = months.map((month, idx) => {
//       const leadsCount = leads.filter((l) => {
//         if (!l.last) return false;
//         const date = new Date(l.last);
//         return !isNaN(date) && date.getMonth() === idx;
//       }).length;

//       const dealsCount = deals.filter(
//         (d) => new Date(d.createdAt).getMonth() === idx
//       ).length;

//       return { month, leads: leadsCount, deals: dealsCount };
//     });

//     res.json({ pipelinePercents, chartData });
//   } catch (err) {
//     console.error("Dashboard stats error:", err);
//     res.status(500).json({ error: "Failed to fetch stats" });
//   }
// });



// // Similarly for inbox, lists, orders...
// export default router;
