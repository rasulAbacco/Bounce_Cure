// middleware/supportMiddleware.js

export default function supportMiddleware(req, res, next) {
  if (!req.user) {
    req.supportUser = null;
    return next();
  }

  // Copy only what you need
  req.supportUser = {
    id: req.user.id,
    email: req.user.email,
    userId: req.user.id,      // 👈 added for message storing
    userEmail: req.user.email // 👈 added for message storing
  };

  next();
}
