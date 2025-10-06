// server/routes/taskRoutes.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ GET all tasks for logged-in user
router.get("/", protect, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: { userId: req.user.id },
            orderBy: { due: "asc" },
        });
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ POST new task (belongs to user)
router.post("/", protect, async (req, res) => {
    try {
        const { title, due, status, priority, notes } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                due: due ? new Date(due) : null,
                status,
                priority,
                notes,
                userId: req.user.id, // 👈 tie to user
            },
        });
        res.status(201).json(task);
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ PUT update task (only if it belongs to user)
router.put("/:id", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title, due, status, priority, notes } = req.body;

        // ensure ownership
        const existing = await prisma.task.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await prisma.task.update({
            where: { id },
            data: { title, due: due ? new Date(due) : null, status, priority, notes },
        });

        res.json({ message: "Task updated" });
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ DELETE task (only if it belongs to user)
router.delete("/:id", protect, async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        // ensure ownership
        const existing = await prisma.task.findUnique({
            where: { id },
        });

        if (!existing || existing.userId !== req.user.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        await prisma.task.delete({ where: { id } });
        res.json({ message: "Task deleted" });
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;


// import express from "express";
// import { PrismaClient } from "@prisma/client";
// const router = express.Router();

// const prisma = new PrismaClient();

// // GET all tasks
// router.get("/", async (req, res) => {
//     const tasks = await prisma.task.findMany({ orderBy: { due: "asc" } });
//     res.json(tasks);
// });

// // POST new task
// router.post("/", async (req, res) => {
//     const { title, due, status, priority, notes } = req.body;
//     const task = await prisma.task.create({
//         data: { title, due: new Date(due), status, priority, notes },
//     });
//     res.status(201).json(task);
// });

// // PUT update task
// router.put("/:id", async (req, res) => {
//     const id = parseInt(req.params.id);
//     const { title, due, status, priority, notes } = req.body;
//     await prisma.task.update({
//         where: { id },
//         data: { title, due: new Date(due), status, priority, notes },
//     });
//     res.json({ message: "Task updated" });
// });

// // DELETE task
// router.delete("/:id", async (req, res) => {
//     const id = parseInt(req.params.id);
//     await prisma.task.delete({ where: { id } });
//     res.json({ message: "Task deleted" });
// });

// export default router;
