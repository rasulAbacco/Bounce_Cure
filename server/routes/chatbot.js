import express from "express";
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
    const { message } = req.body;

    const companyContext = `
  BounceCure is a SaaS platform for email verification and deliverability optimization.
  It helps businesses reduce bounce rates, detect spam traps, and protect sender reputation.
  Pricing starts at $43.78/month with a free trial. Visit https://www.bouncecure.com.
  `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // ✅ confirmed available
            messages: [
                { role: "system", content: "You are BounceCure's official chatbot assistant. Be concise, friendly, and professional." },
                { role: "user", content: `Company info: ${companyContext}` },
                { role: "user", content: message },
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (err) {
        console.error("Error from OpenAI:", err);
        res.status(500).json({ reply: "Sorry, there was a problem contacting the AI service." });
    }
});

export default router;













// import express from "express";
// import OpenAI from "openai";

// const router = express.Router();

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY, // stored safely in Render environment variables
// });

// router.post("/", async (req, res) => {
//     const { message } = req.body;

//     // Context for the AI (so it knows about BounceCure)
//     const companyContext = `
//   BounceCure is a SaaS platform offering advanced email verification and deliverability solutions.
//   We help businesses reduce bounce rates, detect spam traps, and improve sender reputation.
//   Services: email list hygiene, bulk verification, API integration, real-time verification, analytics dashboard.
//   Pricing starts at $43.78/month with a free trial available. Website: https://www.bouncecure.com.
//   `;

//     try {
//         const completion = await openai.chat.completions.create({
//             model: "gpt-4-turbo",
//             messages: [
//                 { role: "system", content: "You are BounceCure's official support assistant. Be concise, friendly, and accurate." },
//                 { role: "user", content: `Company info: ${companyContext}` },
//                 { role: "user", content: message },
//             ],
//             max_tokens: 300,
//             temperature: 0.7,
//         });

//         const reply = completion.choices[0].message.content;
//         res.status(200).json({ reply });
//     } catch (err) {
//         console.error("Error from OpenAI:", err);
//         res.status(500).json({ reply: "Sorry, something went wrong. Please try again later." });
//     }
// });

// export default router;
