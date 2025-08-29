import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();


// POST /deals

router.post("/", async (req, res) => {
    try {
        const { name, client, stage, value, closing, status } = req.body;
        const newDeal = await prisma.deal.create({
            data: {
                name,
                client,
                stage,
                value: value ? parseFloat(value.toString().replace(/[^0-9.]/g, "")) : 0,
                closing: new Date(closing),
                status,
            },
        });
        res.status(201).json(newDeal);
    } catch (error) {
        console.error("Error creating deal:", error);
        res.status(500).json({ error: "Failed to create deal" });
    }
});

// GET all deals
router.get("/", async (req, res) => {
    try {
        const deals = await prisma.deal.findMany({
            orderBy: { closing: "asc" },
        });
        res.json(deals);
    } catch (error) {
        console.error("Error fetching deals:", error);
        res.status(500).json({ error: "Failed to fetch deals" });
    }
});

// PUT update deals
// PUT /deals/:id
router.put("/:id", async (req, res) => {
    try {
        const dealId = parseInt(req.params.id);
        const { name, client, stage, value, closing, status } = req.body;

        const updatedDeal = await prisma.deal.update({
            where: { id: dealId },
            data: {
                name,
                client,
                stage,
                value: parseFloat(value.toString().replace(/[^0-9.]/g, "")),
                closing: new Date(closing),
                status,
            },
        });

        res.json(updatedDeal);
    } catch (error) {
        console.error("Error updating deal:", error);
        res.status(500).json({ error: "Failed to update deal" });
    }
});


// DELETE task
// DELETE /deals/:id
router.delete("/:id", async (req, res) => {
    try {
        const dealId = parseInt(req.params.id);

        await prisma.deal.delete({
            where: { id: dealId },
        });

        res.status(204).end();
    } catch (error) {
        console.error("Error deleting deal:", error);
        res.status(500).json({ error: "Failed to delete deal" });
    }
});


export default router;