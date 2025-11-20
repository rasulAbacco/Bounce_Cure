import express from "express";
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();

// -------------------- SAVE TEMPLATE --------------------
// -------------------- SAVE TEMPLATE --------------------
router.post("/save", async (req, res) => {
  console.log("=== SAVE TEMPLATE REQUEST ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { userId, templateId, name, category, preview, content } = req.body;

    // Validation
    if (!userId || !templateId || !name || !content) {
      console.error("Missing required fields:", { userId, templateId, name, hasContent: !!content });
      return res.status(400).json({ 
        error: "Missing required fields",
        received: { userId, templateId, name, hasContent: !!content }
      });
    }

    // Check if template already exists
    const existing = await prisma.savedTemplate.findFirst({
      where: {
        userId: Number(userId),
        templateId: templateId
      }
    });

    if (existing) {
      console.log("Template already exists, updating instead");
      const updated = await prisma.savedTemplate.update({
        where: { id: existing.id },
        data: {
          name,
          category: category || "Saved",
          preview: preview || "",
          content
        }
      });
      console.log("Template updated successfully:", updated.id);
      return res.status(200).json(updated);
    }

    // Create new template
    const saved = await prisma.savedTemplate.create({
      data: {
        userId: Number(userId),
        templateId,
        name,
        category: category || "Saved",
        preview: preview || "",
        content
      }
    });

    console.log("Template saved successfully:", saved.id);
    res.status(200).json(saved);
  } catch (err) {
    console.error("BACKEND SAVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------- GET ALL USER SAVED TEMPLATES --------------------
router.get("/:userId", async (req, res) => {
  try {
    const saved = await prisma.savedTemplate.findMany({
      where: { userId: Number(req.params.userId) },
    });
    res.json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch saved templates" });
  }
});

// -------------------- DELETE SAVED TEMPLATE --------------------
router.delete("/:userId/:templateId", async (req, res) => {
  try {
    await prisma.savedTemplate.deleteMany({
      where: {
        userId: Number(req.params.userId),
        templateId: req.params.templateId
      }
    });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete saved template" });
  }
});

// UPDATE EXISTING TEMPLATE
router.put("/update", async (req, res) => {
  try {
    const { userId, templateId, name, content } = req.body;

    const updated = await prisma.savedTemplate.updateMany({
      where: { userId: Number(userId), templateId },
      data: { name, content }
    });

    res.json({ message: "Updated", updated });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});


export default router;
