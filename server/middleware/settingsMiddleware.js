// server/middleware/settingsMiddleware.js
import jwt from "jsonwebtoken";

export default function verifySettingsAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Store the userId on req so routes can access it
   req.userId = payload.id;  // since your token uses "id"

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
