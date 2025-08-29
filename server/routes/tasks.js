import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

// GET all tasks
router.get("/", async (req, res) => {
    const tasks = await prisma.task.findMany({ orderBy: { due: "asc" } });
    res.json(tasks);
});

// POST new task
router.post("/", async (req, res) => {
    const { title, due, status, priority, notes } = req.body;
    const task = await prisma.task.create({
        data: { title, due: new Date(due), status, priority, notes },
    });
    res.status(201).json(task);
});

// PUT update task
router.put("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, due, status, priority, notes } = req.body;
    await prisma.task.update({
        where: { id },
        data: { title, due: new Date(due), status, priority, notes },
    });
    res.json({ message: "Task updated" });
});

// DELETE task
router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
});

export default router;
