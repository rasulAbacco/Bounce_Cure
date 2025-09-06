import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const prisma = new PrismaClient();
const router = express.Router();

// File upload configuration (store in /uploads folder)
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to format list response
const formatListResponse = (list) => {
  return {
    id: `LST-${list.id.toString().padStart(3, "0")}`,
    name: list.name,
    count: list.count,
    email: list.email,
    phone: list.phone,
    created: list.createdAt.toISOString().split("T")[0],
    uploadedFile: list.uploadedFile ? {
      name: list.uploadedFile,
      type: "unknown", // We don't store the file type, so we'll use a default
      size: "unknown"    // We don't store the file size, so we'll use a default
    } : null
  };
};

/**
 * Create a new list
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { name, count, email, phone } = req.body;

    const newList = await prisma.list.create({
      data: {
        name,
        count: parseInt(count),
        email,
        phone,
        uploadedFile: req.file ? req.file.buffer : null, // ✅ store binary file
      },
    });

    res.status(201).json(newList);
  } catch (error) {
    console.error("Error creating list:", error);
    res.status(500).json({ error: "Failed to create list" });
  }
});

/**
 * Get all lists
 */
router.get("/", async (req, res) => {
  try {
    const lists = await prisma.list.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    // Format each list to match frontend expectations
    const formattedLists = lists.map(formatListResponse);
    
    res.json(formattedLists);
  } catch (error) {
    console.error("❌ Error fetching lists:", error);
    res.status(500).json({ error: error.message || "Failed to fetch lists" });
  }
});

/**
 * Update a list
 */
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    // Extract the numeric ID from the string ID (e.g., "LST-001" -> 1)
    const idMatch = req.params.id.match(/LST-(\d+)/);
    if (!idMatch) {
      return res.status(400).json({ error: "Invalid list ID format" });
    }
    const numericId = parseInt(idMatch[1], 10);
    
    const { name, count, email, phone } = req.body;
    
    // Find the existing list
    const existingList = await prisma.list.findUnique({
      where: { id: numericId }
    });
    
    if (!existingList) {
      return res.status(404).json({ error: "List not found" });
    }
    
    // Update the list
    const updatedList = await prisma.list.update({
      where: { id: numericId },
      data: {
        name,
        count: parseInt(count) || 0,
        email,
        phone,
        uploadedFile: req.file ? path.basename(req.file.path) : existingList.uploadedFile,
      },
    });
    
    // Format the response to match frontend expectations
    const formattedList = formatListResponse(updatedList);
    
    res.json(formattedList);
  } catch (error) {
    console.error("❌ Error updating list:", error);
    res.status(500).json({ error: error.message || "Failed to update list" });
  }
});

/**
 * Delete a list
 */
router.delete("/:id", async (req, res) => {
  try {
    // Extract the numeric ID from the string ID (e.g., "LST-001" -> 1)
    const idMatch = req.params.id.match(/LST-(\d+)/);
    if (!idMatch) {
      return res.status(400).json({ error: "Invalid list ID format" });
    }
    const numericId = parseInt(idMatch[1], 10);
    
    // Find the list to get the file path before deletion
    const list = await prisma.list.findUnique({
      where: { id: numericId }
    });
    
    if (!list) {
      return res.status(404).json({ error: "List not found" });
    }
    
    // Delete the list
    await prisma.list.delete({ where: { id: numericId } });
    
    // If the list had an uploaded file, delete it from the filesystem
    if (list.uploadedFile) {
      try {
        const filePath = path.join(process.cwd(), "uploads", list.uploadedFile);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.error("❌ Error deleting file:", fileError);
        // Don't fail the request if file deletion fails
      }
    }
    
    res.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting list:", error);
    res.status(500).json({ error: error.message || "Failed to delete list" });
  }
});

/**
 * Get a file by filename
 */
router.get("/files/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch record from database
    const list = await prisma.list.findUnique({
      where: { id: parseInt(id) },
    });

    if (!list || !list.uploadedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    // Convert buffer back to binary and send as file
    const fileBuffer = Buffer.from(list.uploadedFile);

    // Set headers for download
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=file_${id}`);

    res.send(fileBuffer);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
});


export default router;