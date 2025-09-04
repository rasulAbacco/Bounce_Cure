import express from "express";
const router = express.Router();
import prisma from "../db.js"; // adjust path to your Prisma instance

router.post("/sendgrid-events", async (req, res) => {
  const events = req.body;

  for (const event of events) {
    const { email, event: type, reason } = event;

    if (!email) continue;

    // Update database based on SendGrid event
    if (type === "bounce" || type === "dropped") {
      await prisma.verification.updateMany({
        where: { email },
        data: {
          status: "invalid",
          error: reason || type,
        },
      });
    }

    if (type === "delivered") {
      await prisma.verification.updateMany({
        where: { email },
        data: {
          status: "valid",
        },
      });
    }
  }

  res.status(200).send("ok");
});

export default router;
