// routes/phoneOtp.js
import express from "express";
import admin from "firebase-admin"; // use the one already initialized

const router = express.Router();

// In-memory OTP request counter
const otpRequests = {};

router.post("/send-otp", (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number required" });
  }

  if (!phoneNumber.startsWith("+91") && !phoneNumber.startsWith("+1")) {
    return res.status(400).json({ error: "Only India (+91) & USA (+1) supported" });
  }

  // ✅ Example: check if user exists
  admin
    .auth()
    .getUserByPhoneNumber(phoneNumber)
    .then((user) => {
      res.json({ success: true, message: "Phone number already exists", uid: user.uid });
    })
    .catch(() => {
      // If user doesn’t exist, create one
      admin
        .auth()
        .createUser({ phoneNumber })
        .then((userRecord) => {
          res.json({ success: true, message: "User created", uid: userRecord.uid });
        })
        .catch((err) => {
          console.error("Error:", err);
          res.status(500).json({ error: "Failed to process phone number" });
        });
    });
});

export default router;
