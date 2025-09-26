import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET all leads
router.get("/", async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "desc" }
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new lead
router.post("/", async (req, res) => {
  try {
    const lead = await prisma.lead.create({ data: req.body });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a lead
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLead = await prisma.lead.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.json(updatedLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a lead
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lead.delete({ where: { id: Number(id) } });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
