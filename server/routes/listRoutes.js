// server/routes/listRoutes.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ JWT Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "my_super_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Helper to format list response
const formatListResponse = (list) => ({
  id: list.id,
  name: list.name,
  count: list.count,
  email: list.email,
  phone: list.phone,
  created: list.createdAt.toISOString().split("T")[0],
  uploadedFile: list.uploadedFile
    ? {
      name: `file-${list.id}`,
      type: "unknown",
      size: `${list.uploadedFile.length} bytes`
    }
    : null
});

/**
 * ✅ Create a new list (scoped to user)
 */
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { name, count, email, phone } = req.body;
    const userId = req.user.id;

    const newList = await prisma.list.create({
      data: {
        name,
        count: parseInt(count, 10),
        email,
        phone,
        uploadedFile: req.file ? req.file.buffer : null,
        userId, // 👈 link to user
      },
    });

    res.status(201).json(formatListResponse(newList));
  } catch (error) {
    console.error("❌ Error creating list:", error);
    res.status(500).json({ error: "Failed to create list" });
  }
});

/**
 * ✅ Get all lists for logged-in user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const lists = await prisma.list.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(lists.map(formatListResponse));
  } catch (error) {
    console.error("❌ Error fetching lists:", error);
    res.status(500).json({ error: "Failed to fetch lists" });
  }
});

/**
 * ✅ Update list (only owner can update)
 */
router.put("/:id", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, count, email, phone } = req.body;

    const list = await prisma.list.findUnique({ where: { id } });
    if (!list || list.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this list" });
    }

    const updatedList = await prisma.list.update({
      where: { id },
      data: {
        name,
        count: parseInt(count, 10),
        email,
        phone,
        uploadedFile: req.file ? req.file.buffer : undefined,
      },
    });

    res.json(formatListResponse(updatedList));
  } catch (error) {
    console.error("❌ Error updating list:", error);
    res.status(500).json({ error: "Failed to update list" });
  }
});

/**
 * ✅ Delete list (only owner can delete)
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await prisma.list.findUnique({ where: { id } });
    if (!list || list.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this list" });
    }

    await prisma.list.delete({ where: { id } });
    res.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting list:", error);
    res.status(500).json({ error: "Failed to delete list" });
  }
});

/**
 * ✅ Get uploaded file (only owner can access)
 */
router.get("/files/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const list = await prisma.list.findUnique({ where: { id } });
    if (!list || list.userId !== userId || !list.uploadedFile) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=file-${id}`);
    res.send(Buffer.from(list.uploadedFile));
  } catch (error) {
    console.error("❌ Error fetching file:", error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

export default router;



// // server/routes/listRoutes.js
// import express from "express";
// import { PrismaClient } from "@prisma/client";
// import multer from "multer";
// import path from "path";
// import fs from "fs/promises";

// const prisma = new PrismaClient();
// const router = express.Router();

// // File upload configuration (store in /uploads folder)
// const upload = multer({ storage: multer.memoryStorage() });

// // Helper function to format list response
// const formatListResponse = (list) => {
//   return {
//     id: `LST-${list.id.toString().padStart(3, "0")}`,
//     name: list.name,
//     count: list.count,
//     email: list.email,
//     phone: list.phone,
//     created: list.createdAt.toISOString().split("T")[0],
//     uploadedFile: list.uploadedFile ? {
//       name: list.uploadedFile,
//       type: "unknown", // We don't store the file type, so we'll use a default
//       size: "unknown"    // We don't store the file size, so we'll use a default
//     } : null
//   };
// };

// /**
//  * Create a new list
//  */
// // Create list
// router.post("/", upload.single("file"), async (req, res) => {
//   try {
//     const { name, count, email, phone } = req.body;

//     // Generate new ID
//     const lastList = await prisma.list.findFirst({
//       orderBy: { createdAt: "desc" }
//     });

//     let newId;
//     if (!lastList) {
//       newId = "LST-001";
//     } else {
//       const lastNum = parseInt(lastList.id.replace("LST-", ""), 10) || 0;
//       newId = `LST-${(lastNum + 1).toString().padStart(3, "0")}`;
//     }

//     const newList = await prisma.list.create({
//       data: {
//         id: newId,
//         name,
//         count: parseInt(count, 10),
//         email,
//         phone,
//         uploadedFile: req.file ? req.file.buffer : null,
//       },
//     });

//     res.status(201).json(newList);
//   } catch (error) {
//     console.error("❌ Error creating list:", error);
//     res.status(500).json({ error: "Failed to create list" });
//   }
// });

// // Get all lists
// router.get("/", async (req, res) => {
//   try {
//     const lists = await prisma.list.findMany({ orderBy: { createdAt: "desc" } });
//     res.json(lists);
//   } catch (error) {
//     console.error("❌ Error fetching lists:", error);
//     res.status(500).json({ error: "Failed to fetch lists" });
//   }
// });

// // Update list
// router.put("/:id", upload.single("file"), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, count, email, phone } = req.body;

//     const updatedList = await prisma.list.update({
//       where: { id },
//       data: {
//         name,
//         count: parseInt(count, 10),
//         email,
//         phone,
//         uploadedFile: req.file ? req.file.buffer : undefined,
//       },
//     });

//     res.json(updatedList);
//   } catch (error) {
//     console.error("❌ Error updating list:", error);
//     res.status(500).json({ error: "Failed to update list" });
//   }
// });

// // Delete list
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.list.delete({ where: { id } });
//     res.json({ message: "List deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting list:", error);
//     res.status(500).json({ error: "Failed to delete list" });
//   }
// });

// // Get uploaded file
// router.get("/files/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const list = await prisma.list.findUnique({ where: { id } });

//     if (!list || !list.uploadedFile) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     res.setHeader("Content-Type", "application/octet-stream");
//     res.setHeader("Content-Disposition", `attachment; filename=${id}`);
//     res.send(Buffer.from(list.uploadedFile));
//   } catch (error) {
//     console.error("❌ Error fetching file:", error);
//     res.status(500).json({ error: "Failed to fetch file" });
//   }
// });


// // Helper to generate next ID
// async function generateListId(prisma) {
//   const lastList = await prisma.list.findFirst({
//     orderBy: { created: "desc" }
//   });

//   if (!lastList) return "LST-001";

//   // Extract number part
//   const lastNum = parseInt(lastList.id.replace("LST-", ""), 10) || 0;
//   const newNum = lastNum + 1;
//   return `LST-${newNum.toString().padStart(3, "0")}`;
// }

// export default router;