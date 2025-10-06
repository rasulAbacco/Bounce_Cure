// server/routes/leads.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "my_super_secret"
    );
    req.user = decoded; // decoded should contain { id: userId, ... }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ GET all leads (only user’s leads)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const leads = await prisma.lead.findMany({
      where: { userId },
      orderBy: { id: "desc" }
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE a new lead (attach userId)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const lead = await prisma.lead.create({
      data: {
        ...req.body,
        userId, // 👈 attach logged-in user
      },
    });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE a lead (only if owned by user)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = Number(req.params.id);

    // check ownership
    const existingLead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!existingLead || existingLead.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this lead" });
    }

    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: req.body,
    });

    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE a lead (only if owned by user)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const leadId = Number(req.params.id);

    // check ownership
    const existingLead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!existingLead || existingLead.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this lead" });
    }

    await prisma.lead.delete({ where: { id: leadId } });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


// import express from "express";
// import { PrismaClient } from "@prisma/client";

// const router = express.Router();
// const prisma = new PrismaClient();

// // GET all leads
// router.get("/", async (req, res) => {
//   try {
//     const leads = await prisma.lead.findMany({
//       // where: { userId: req.user.id },
//       orderBy: { id: "desc" }
//     });
//     res.json(leads);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // CREATE a new lead
// router.post("/", async (req, res) => {
//   try {
//     const lead = await prisma.lead.create({ data: req.body });
//     res.json(lead);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // UPDATE a lead
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedLead = await prisma.lead.update({
//       where: { id: Number(id) },
//       data: req.body,
//     });
//     res.json(updatedLead);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE a lead
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.lead.delete({ where: { id: Number(id) } });
//     res.json({ message: "Lead deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
