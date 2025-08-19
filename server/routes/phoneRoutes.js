import express from "express";
import pkg from "libphonenumber-js";

const { parsePhoneNumberFromString } = pkg;
const router = express.Router();

router.post("/validatephone", (req, res) => {
  let { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // Remove extra spaces
  phoneNumber = phoneNumber.replace(/\s+/g, "");

  try {
    // Auto-detect country if starts with '+', otherwise try IN then US
    let parsedNumber =
      phoneNumber.startsWith("+")
        ? parsePhoneNumberFromString(phoneNumber)
        : parsePhoneNumberFromString(phoneNumber, "IN");

    if (!parsedNumber || !parsedNumber.isValid()) {
      // Try US if IN failed
      parsedNumber = parsePhoneNumberFromString(phoneNumber, "US");
    }

    if (!parsedNumber || !parsedNumber.isValid()) {
      return res.json({ status: "Invalid", message: "Invalid phone number" });
    }

    const type = parsedNumber.getType();
    let status;
    if (type === "MOBILE") status = "Valid Mobile";
    else if (type === "FIXED_LINE" || type === "FIXED_LINE_OR_MOBILE") status = "Valid Landline";
    else status = "Invalid";

    return res.json({
      status,
      country: parsedNumber.country,
      formatted: parsedNumber.formatInternational(),
    });
  } catch (error) {
    console.error("Validation error:", error.message);
    return res.status(500).json({ status: "Error", message: error.message });
  }
});

export default router;
