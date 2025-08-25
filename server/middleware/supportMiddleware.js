// ✅ Combined middleware: optional JWT decode
export default function supportMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.supportUser = {
        id: decoded.id,
        email: decoded.email,
        userId: decoded.id,
        userEmail: decoded.email,
      };
    } catch (err) {
      console.warn("⚠️ Invalid token in supportMiddleware:", err.message);
      req.supportUser = null;
    }
  } else {
    req.supportUser = null;
  }

  next();
}