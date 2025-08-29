// controllers/emailController.js
import { sendEmail } from "../services/emailService.js"; // adjust path

export const testEmail = async (req, res) => {
    try {
        await sendEmail(
            "user@example.com",
            "Test Email",
            "<h1>Hello from your email service!</h1>"
        );

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
};

