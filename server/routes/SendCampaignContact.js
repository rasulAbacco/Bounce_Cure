// server/routes/SendCampaignContact.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ secure middleware

const router = express.Router();

// -------------------- Get all contacts (user only) --------------------
router.get("/", protect, async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: req.user.id }, // ✅ only this user's contacts
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (err) {
    console.error("❌ Error fetching contacts:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Get single contact --------------------
router.get("/:id", protect, async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact || contact.userId !== req.user.id) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json(contact);
  } catch (err) {
    console.error("❌ Error fetching contact:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Create new contact --------------------
router.post("/", protect, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message: message || null,
        userId: req.user.id, // ✅ assign to logged-in user
      },
    });

    res.status(201).json(contact);
  } catch (err) {
    console.error("❌ Error creating contact:", err);

    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "A contact with this email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Update contact --------------------
router.patch("/:id", protect, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contactId = parseInt(req.params.id);

    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact || existingContact.userId !== req.user.id) {
      return res.status(404).json({ message: "Contact not found" });
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(message !== undefined && { message }),
      },
    });

    res.json(contact);
  } catch (err) {
    console.error("❌ Error updating contact:", err);

    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ message: "A contact with this email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Delete contact --------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);

    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact || existingContact.userId !== req.user.id) {
      return res.status(404).json({ message: "Contact not found" });
    }

    await prisma.contact.delete({ where: { id: contactId } });

    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting contact:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

// //server/routes/SendCampaignContact.js
// import express from 'express';
// import { prisma } from '../prisma/prismaClient.js'

// const router = express.Router();
// // Get all contacts
// router.get('/', async (req, res) => {
//   try {
//     const contacts = await prisma.contact.findMany({
//       orderBy: { createdAt: 'desc' }
//     });
//     res.json(contacts);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get single contact
// router.get('/:id', async (req, res) => {
//   try {
//     const contact = await prisma.contact.findUnique({
//       where: { id: parseInt(req.params.id) }
//     });
    
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }
    
//     res.json(contact);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create new contact
// router.post('/', async (req, res) => {
//   try {
//     const { name, email, message } = req.body;
    
//     if (!name || !email) {
//       return res.status(400).json({ 
//         message: 'Name and email are required' 
//       });
//     }
    
//     const contact = await prisma.contact.create({
//       data: {
//         name,
//         email,
//         message: message || null
//       }
//     });
    
//     res.status(201).json(contact);
//   } catch (err) {
//     console.error(err);
    
//     // Handle unique constraint error
//     if (err.code === 'P2002') {
//       return res.status(400).json({ 
//         message: 'A contact with this email already exists' 
//       });
//     }
    
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Update contact
// router.patch('/:id', async (req, res) => {
//   try {
//     const { name, email, message } = req.body;
//     const contactId = parseInt(req.params.id);
    
//     // Check if contact exists
//     const existingContact = await prisma.contact.findUnique({
//       where: { id: contactId }
//     });
    
//     if (!existingContact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }
    
//     const contact = await prisma.contact.update({
//       where: { id: contactId },
//       data: {
//         ...(name && { name }),
//         ...(email && { email }),
//         ...(message !== undefined && { message })
//       }
//     });
    
//     res.json(contact);
//   } catch (err) {
//     console.error(err);
    
//     // Handle unique constraint error
//     if (err.code === 'P2002') {
//       return res.status(400).json({ 
//         message: 'A contact with this email already exists' 
//       });
//     }
    
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete contact
// router.delete('/:id', async (req, res) => {
//   try {
//     const contactId = parseInt(req.params.id);
    
//     // Check if contact exists
//     const existingContact = await prisma.contact.findUnique({
//       where: { id: contactId }
//     });
    
//     if (!existingContact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }
    
//     await prisma.contact.delete({
//       where: { id: contactId }
//     });
    
//     res.json({ message: 'Contact deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;