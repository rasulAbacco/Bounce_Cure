import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Check if API key exists
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ ERROR: SendGrid API key not set in environment variables.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_CMP_API_KEY || process.env.SENDGRID_USER_API_KEY);
  console.log("✅ SendGrid API key loaded successfully.");
}

router.post("/", async (req, res) => {
  try {
    const { fullname, email, phone, service, message, subscribe } = req.body;

    // Basic validation 
    if (!fullname || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    // Construct HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px;">
          <h2 style="color: #c2831f;">📩 New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${fullname}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Subscribed to updates:</strong> ${subscribe ? "Yes" : "No"}</p>
          <hr style="margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-line;">${message}</p>
        </div>
      </div>
    `;

    // SendGrid message object
    const msg = {
      to: "keithburtb2bleads@gmail.com", // Your receiving email
      from: {
        email: "jeffwilseyb2bleads@gmail.com", // verified sender
        name: "BounceCure Contact Form",
      },
      replyTo: email, // so you can reply directly to user
      subject: `New Contact Form: ${service.toUpperCase()} - ${fullname}`,
      text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nService: ${service}\nSubscribe: ${
        subscribe ? "Yes" : "No"
      }\nMessage:\n${message}`,
      html: htmlContent,
    };

    await sgMail.send(msg);

    console.log(`✅ Email sent successfully from ${email} (${fullname})`);
    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("❌ SendGrid Error:", error);

    if (error.response) {
      console.error("SendGrid Response Body:", error.response.body);
      const errMsg =
        error.response.body?.errors?.[0]?.message ||
        "Email service error. Please try again later.";
      return res.status(500).json({
        success: false,
        message: `Email service error: ${errMsg}`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
});

export default router;
