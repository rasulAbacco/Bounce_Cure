// File: backend/routes/customRoutes.js
import express from "express";
import { protect as auth } from "../middleware/auth.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

//
// 🔹 CUSTOM RECORDS CRUD
//

// GET all custom records for the authenticated user
router.get("/records", auth, async (req, res) => {
  try {
    const records = await prisma.customRecord.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (error) {
    console.error("❌ Error fetching records:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET a single custom record by ID
router.get("/records/:id", auth, async (req, res) => {
  try {
    const record = await prisma.customRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(record);
  } catch (error) {
    console.error("❌ Error fetching record:", error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE a custom record
router.put("/records/:id", auth, async (req, res) => {
  try {
    let {
      recordType,
      name,
      email,
      phone,
      company,
      website,
      source,
      status,
      score,
      last,
      customFields,
    } = req.body;

    // 🛡️ Sanitize score
    if (score === "" || score === undefined || score === null) {
      score = null;
    } else {
      score = parseInt(score, 10);
    }

    const record = await prisma.customRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ message: "Record not found" });
    }

    const updatedRecord = await prisma.customRecord.update({
      where: { id: req.params.id },
      data: {
        recordType,
        name,
        email,
        phone,
        company,
        website,
        source,
        status,
        score,
        last: last || record.last,
        customFields,
      },
    });

    res.json(updatedRecord);
  } catch (error) {
    console.error("❌ Error updating record:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST a new custom record
router.post("/records", auth, async (req, res) => {
  try {
    let {
      recordType,
      name,
      email,
      phone,
      company,
      website,
      source,
      status,
      score,
      last,
      customFields,
    } = req.body;

    if (!recordType) {
      return res.status(400).json({ message: "Record type is required" });
    }

    // 🛡️ Sanitize score
    if (score === "" || score === undefined || score === null) {
      score = null;
    } else {
      score = parseInt(score, 10);
    }

    const newRecord = await prisma.customRecord.create({
      data: {
        recordType,
        name,
        email,
        phone,
        company,
        website,
        source: source || "manual",
        status,
        score,
        last: last || null,
        customFields: customFields || {},
        userId: req.user.id,
      },
    });

    res.status(201).json(newRecord);
  } catch (error) {
    console.error("❌ Error creating record:", error);
    res.status(500).json({ message: error.message });
  }
});




// DELETE a custom record
router.delete("/records/:id", auth, async (req, res) => {
  try {
    const record = await prisma.customRecord.findUnique({
      where: { id: req.params.id },
    });

    if (!record || record.userId !== req.user.id) {
      return res.status(404).json({ message: "Record not found" });
    }

    await prisma.customRecord.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting record:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET records by type for the authenticated user
router.get("/records/type/:type", auth, async (req, res) => {
  try {
    const { type } = req.params;
    const records = await prisma.customRecord.findMany({
      where: {
        userId: req.user.id,
        recordType: type,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (error) {
    console.error("❌ Error fetching records by type:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET all unique record types for the authenticated user
router.get("/record-types", auth, async (req, res) => {
  try {
    const types = await prisma.customRecord.findMany({
      where: { userId: req.user.id },
      select: { recordType: true },
      distinct: ["recordType"],
    });

    const recordTypes = types.map((t) => t.recordType);
    res.json(recordTypes);
  } catch (error) {
    console.error("❌ Error fetching record types:", error);
    res.status(500).json({ message: error.message });
  }
});

//
// 🔹 CUSTOM FIELDS MANAGEMENT
//

// GET all custom fields
router.get("/fields", auth, async (req, res) => {
  try {
    const fields = await prisma.customField.findMany({
      where: { userId: req.user.id },
      orderBy: { id: "asc" },
    });
    res.json(fields);
  } catch (error) {
    console.error("❌ Error fetching fields:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST - Add a new custom field
router.post("/fields", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Field name is required" });
    }

    const field = await prisma.customField.create({
      data: {
        name: name.trim(),
        userId: req.user.id,
      },
    });

    res.status(201).json(field);
  } catch (error) {
    console.error("❌ Error creating field:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE a custom field
router.delete("/fields/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const field = await prisma.customField.findUnique({ where: { id } });
    if (!field || field.userId !== req.user.id) {
      return res.status(404).json({ message: "Field not found" });
    }

    await prisma.customField.delete({ where: { id } });
    res.json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting field:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/custom-records
router.post("/", async (req, res) => {
  try {
    const {
      recordType,
      name,
      email,
      phone,
      company,
      website,
      source,
      status,
      score,
      last,
      customFields,
      userId,
    } = req.body;

    if (!recordType || !userId) {
      return res.status(400).json({ error: "recordType and userId are required" });
    }

    const record = await prisma.customRecord.create({
      data: {
        recordType,
        name,
        email,
        phone,
        company,
        website,
        source,
        status,
        score,
        last,
        customFields,
        userId: Number(userId),
      },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("❌ Error creating custom record:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/custom-records/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const records = await prisma.customRecord.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching custom records:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;
