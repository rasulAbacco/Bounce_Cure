// server/routes/contact.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * 📊 Stats
 */
router.get("/stats", async (req, res) => {
  try {
    const total = await prisma.contact.count();
    const active = await prisma.contact.count({ where: { status: "active" } });
    const unsubscribed = await prisma.contact.count({
      where: { status: "unsubscribed" },
    });

    res.json({ total, active, unsubscribed });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * 📋 All Contacts
 */
router.get("/", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

/**
 * 👤 Single Contact
 */
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return res.status(404).json({ error: "Contact not found" });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
});

/**
 * ➕ Add Contact
 */
router.post("/", async (req, res) => {
  const { name, email, phone, status } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "Name and email are required" });

  try {
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        status:
          status && ["active", "unsubscribed"].includes(status)
            ? status
            : "active",
      },
    });
    res.json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * ✏️ Update Contact
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, phone, status } = req.body;

    const updatedContact = await prisma.contact.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status &&
          ["active", "unsubscribed"].includes(status) && { status }),
      },
    });

    res.json(updatedContact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * ❌ Delete Contact
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.contact.delete({ where: { id } });
    res.json({ message: "Contact deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * 📥 Import Contacts (CSV)
 */
router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      if (row.email) {
        results.push({
          name: row.name || "Unknown",
          email: row.email,
          phone: row.phone || null,
          status:
            row.status && ["active", "unsubscribed"].includes(row.status)
              ? row.status
              : "active",
        });
      }
    })
    .on("end", async () => {
      try {
        if (results.length === 0) {
          fs.unlinkSync(req.file.path);
          return res
            .status(400)
            .json({ error: "No valid contacts found in CSV" });
        }

        await prisma.contact.createMany({
          data: results,
          skipDuplicates: true,
        });

        fs.unlinkSync(req.file.path);
        res.json({ message: "Contacts imported", imported: results.length });
      } catch (err) {
        res.status(500).json({ error: "Failed to import contacts" });
      }
    });
});

export default router;
