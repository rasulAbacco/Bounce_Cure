// server/routes/automationLogs.js
import express from "express";

const router = express.Router();

// Temporary in-memory logs store
let automationLogs = [];

// GET all logs
router.get("/", (req, res) => {
  res.json(automationLogs);
});

// POST a new log
router.post("/", (req, res) => {
  const { date, automation, status } = req.body;

  if (!date || !automation || !status) {
    return res.status(400).json({ error: "Missing required fields: date, automation, and status are required." });
  }

  const newLog = { date, automation, status };
  automationLogs.unshift(newLog); // Add to beginning

  res.status(201).json({ message: "Log added successfully", log: newLog });
});

export default router;
