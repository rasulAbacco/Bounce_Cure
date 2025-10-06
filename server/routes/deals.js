// server/routes/deals.js
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

// ✅ POST /deals (Create Deal - belongs to user)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, client, stage, value, closing, status } = req.body;

        const newDeal = await prisma.deal.create({
            data: {
                name,
                client,
                stage,
                value: value
                    ? parseFloat(value.toString().replace(/[^0-9.]/g, ""))
                    : 0,
                closing: closing ? new Date(closing) : null,
                status,
                userId, // 👈 attach userId
            },
        });

        res.status(201).json(newDeal);
    } catch (error) {
        console.error("❌ Error creating deal:", error);
        res.status(500).json({ error: "Failed to create deal" });
    }
});

// ✅ GET /deals (Fetch only user’s deals)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const deals = await prisma.deal.findMany({
            where: { userId },
            orderBy: { closing: "asc" },
        });
        res.json(deals);
    } catch (error) {
        console.error("❌ Error fetching deals:", error);
        res.status(500).json({ error: "Failed to fetch deals" });
    }
});

// ✅ PUT /deals/:id (Update only user’s deal)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const dealId = parseInt(req.params.id);
        const { name, client, stage, value, closing, status } = req.body;

        // Check ownership first
        const existingDeal = await prisma.deal.findUnique({
            where: { id: dealId },
        });

        if (!existingDeal || existingDeal.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized to update this deal" });
        }

        const updatedDeal = await prisma.deal.update({
            where: { id: dealId },
            data: {
                name,
                client,
                stage,
                value: value
                    ? parseFloat(value.toString().replace(/[^0-9.]/g, ""))
                    : 0,
                closing: closing ? new Date(closing) : null,
                status,
            },
        });

        res.json(updatedDeal);
    } catch (error) {
        console.error("❌ Error updating deal:", error);
        res.status(500).json({ error: "Failed to update deal" });
    }
});

// ✅ DELETE /deals/:id (Delete only user’s deal)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const dealId = parseInt(req.params.id);

        // Check ownership first
        const existingDeal = await prisma.deal.findUnique({
            where: { id: dealId },
        });

        if (!existingDeal || existingDeal.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized to delete this deal" });
        }

        await prisma.deal.delete({
            where: { id: dealId },
        });

        res.status(204).end();
    } catch (error) {
        console.error("❌ Error deleting deal:", error);
        res.status(500).json({ error: "Failed to delete deal" });
    }
});

export default router;


// //server/routes/deals.js
// import express from "express";
// import { PrismaClient } from "@prisma/client";
// const router = express.Router();

// const prisma = new PrismaClient();


// // POST /deals

// router.post("/", async (req, res) => {
//     try {
//         const { name, client, stage, value, closing, status } = req.body;
//         const newDeal = await prisma.deal.create({
//             data: {
//                 name,
//                 client,
//                 stage,
//                 value: value ? parseFloat(value.toString().replace(/[^0-9.]/g, "")) : 0,
//                 closing: new Date(closing),
//                 status,
//             },
//         });
//         res.status(201).json(newDeal);
//     } catch (error) {
//         console.error("Error creating deal:", error);
//         res.status(500).json({ error: "Failed to create deal" });
//     }
// });

// // GET all deals
// router.get("/", async (req, res) => {
//     try {
//         const deals = await prisma.deal.findMany({
//             orderBy: { closing: "asc" },
//         });
//         res.json(deals);
//     } catch (error) {
//         console.error("Error fetching deals:", error);
//         res.status(500).json({ error: "Failed to fetch deals" });
//     }
// });

// // PUT update deals
// // PUT /deals/:id
// router.put("/:id", async (req, res) => {
//     try {
//         const dealId = parseInt(req.params.id);
//         const { name, client, stage, value, closing, status } = req.body;

//         const updatedDeal = await prisma.deal.update({
//             where: { id: dealId },
//             data: {
//                 name,
//                 client,
//                 stage,
//                 value: parseFloat(value.toString().replace(/[^0-9.]/g, "")),
//                 closing: new Date(closing),
//                 status,
//             },
//         });

//         res.json(updatedDeal);
//     } catch (error) {
//         console.error("Error updating deal:", error);
//         res.status(500).json({ error: "Failed to update deal" });
//     }
// });


// // DELETE task
// // DELETE /deals/:id
// router.delete("/:id", async (req, res) => {
//     try {
//         const dealId = parseInt(req.params.id);

//         await prisma.deal.delete({
//             where: { id: dealId },
//         });

//         res.status(204).end();
//     } catch (error) {
//         console.error("Error deleting deal:", error);
//         res.status(500).json({ error: "Failed to delete deal" });
//     }
// });


// export default router;