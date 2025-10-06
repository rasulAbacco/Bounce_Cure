// server/middleware/settingsMiddleware.js
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/prismaClient.js";

export default async function verifySettingsAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = parseInt(payload.id, 10);

    // Fetch full user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach full user object to req
    req.user = user;

    next();
  } catch (err) {
    console.error("[verifySettingsAuth] Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
