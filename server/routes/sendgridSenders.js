// server/src/routes/sendgridSenders.js
import express from "express";
import axios from "axios";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const SG_BASE = "https://api.sendgrid.com/v3";

function sgHeaders() {
    if (!process.env.SENDGRID_API_KEY) throw new Error("Missing SENDGRID_API_KEY env var");
    return {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
    };
}

/**
 * POST /api/senders/create
 */
router.post("/create", protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, name, address, city, state, zip, country, nickname } = req.body;
        if (!email || !name) return res.status(400).json({ error: "email and name are required" });

        const payload = {
            nickname: nickname || `${name}-sender`,
            from: { email, name },
            reply_to: { email, name },
            address: address || "N/A",
            city: city || "N/A",
            state: state || "",
            zip: zip || "",
            country: country || "N/A",
        };

        const sgRes = await axios.post(`${SG_BASE}/senders`, payload, { headers: sgHeaders() });
        const sgData = sgRes.data;

        const record = await prisma.verifiedSender.upsert({
            where: { email_userId: { email: email.toLowerCase(), userId } }, // 👈 composite unique
            create: {
                userId,
                email: email.toLowerCase(),
                fromName: name,
                sendgridSenderId: sgData.id || null,
                sendgridStatus: sgData.status || JSON.stringify(sgData),
            },
            update: {
                fromName: name,
                sendgridSenderId: sgData.id || null,
                sendgridStatus: sgData.status || JSON.stringify(sgData),
            },
        });

        return res.json({ message: "SendGrid sender created (verification email sent)", record });
    } catch (err) {
        console.error("create sender error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to create sender", details: err.response?.data || err.message });
    }
});

/**
 * GET /api/senders/check/:email
 */
router.get("/check/:email", protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const email = decodeURIComponent(req.params.email).toLowerCase();

        let record = await prisma.verifiedSender.findUnique({
            where: { email_userId: { email, userId } },
        });
        if (!record) return res.status(404).json({ error: "No sender record found" });

        if (!record.sendgridSenderId) {
            return res.json({
                isRegisteredWithSendGrid: false,
                isVerified: !!record.verified,
                record,
            });
        }

        const sgRes = await axios.get(`${SG_BASE}/senders/${record.sendgridSenderId}`, { headers: sgHeaders() });
        const sgData = sgRes.data;

        const isVerified =
            sgData.verified?.status === true ||
            sgData.verified?.sender === true ||
            ["verified", "active", "approved"].includes(sgData.status);

        record = await prisma.verifiedSender.update({
            where: { email_userId: { email, userId } },
            data: {
                sendgridStatus: sgData.status || JSON.stringify(sgData),
                verified: isVerified,
                verifiedAt: isVerified ? new Date() : null,
            },
        });

        return res.json({ sendgrid: sgData, isVerified, record });
    } catch (err) {
        console.error("check sender error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to check sendgrid sender", details: err.response?.data || err.message });
    }
});

/**
 * GET /api/senders/verified
 */
router.get("/verified", protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const senders = await prisma.verifiedSender.findMany({ where: { userId } });
        const refreshed = [];

        for (const sender of senders) {
            if (!sender.sendgridSenderId) {
                refreshed.push(sender);
                continue;
            }
            try {
                const sgRes = await axios.get(`${SG_BASE}/senders/${sender.sendgridSenderId}`, { headers: sgHeaders() });
                const sgData = sgRes.data;

                const isVerified =
                    sgData.verified?.status === true ||
                    sgData.verified?.sender === true ||
                    ["verified", "active", "approved"].includes(sgData.status);

                const isDeleted = sgData.locked === true || sgData.verified?.status === false;

                const updated = await prisma.verifiedSender.update({
                    where: { id: sender.id },
                    data: {
                        sendgridStatus: sgData.status || JSON.stringify(sgData),
                        verified: isVerified && !isDeleted,
                        verifiedAt: isVerified && !isDeleted ? new Date() : null,
                    },
                });
                refreshed.push(updated);
            } catch (err) {
                if (err.response?.status === 404) {
                    const updated = await prisma.verifiedSender.update({
                        where: { id: sender.id },
                        data: { verified: false, verifiedAt: null, sendgridStatus: "deleted" },
                    });
                    refreshed.push(updated);
                } else {
                    refreshed.push(sender);
                }
            }
        }

        const onlyVerified = refreshed.filter((s) => s.verified === true);
        res.json(onlyVerified);
    } catch (err) {
        console.error("verified senders error:", err);
        res.status(500).json({ error: "Failed to fetch verified senders" });
    }
});

export default router;


// // server/src/routes/sendgridSenders.js
// import express from "express";
// import axios from "axios";
// import { prisma } from "../prisma/prismaClient.js"; // adjust this import to match your project

// const router = express.Router();
// const SG_BASE = "https://api.sendgrid.com/v3";

// function sgHeaders() {
//     if (!process.env.SENDGRID_USER_API_KEY) throw new Error("Missing SENDGRID_USER_API_KEY env var");
//     return {
//         Authorization: `Bearer ${process.env.SENDGRID_USER_API_KEY}`,
//         "Content-Type": "application/json",
//     };
// }

// /**
//  * POST /api/senders/create
//  * Body: { email, name, address?, city?, state?, zip?, country?, nickname? }
//  * Creates a SendGrid sender identity (SendGrid will email the user to confirm)
//  */
// router.post("/create", async (req, res) => {
//     try {
//         const { email, name, address, city, state, zip, country, nickname } = req.body;
//         if (!email || !name) return res.status(400).json({ error: "email and name are required" });

//         const payload = {
//             nickname: nickname || `${name}-sender`,
//             from: { email, name },
//             reply_to: { email, name },
//             address: address || "N/A",
//             city: city || "N/A",
//             state: state || "",
//             zip: zip || "",
//             country: country || "N/A",
//         };

//         const sgRes = await axios.post(`${SG_BASE}/senders`, payload, { headers: sgHeaders() });
//         const sgData = sgRes.data; // typically contains an `id` and other info

//         // Save or update local DB record (store sendgridSenderId)
//         await prisma.verifiedSender.upsert({
//             where: { email: String(email).toLowerCase() },
//             create: {
//                 email: String(email).toLowerCase(),
//                 fromName: name,
//                 sendgridSenderId: sgData.id || null,
//                 sendgridStatus: sgData.status || JSON.stringify(sgData),
//             },
//             update: {
//                 fromName: name,
//                 sendgridSenderId: sgData.id || null,
//                 sendgridStatus: sgData.status || JSON.stringify(sgData),
//             },
//         });

//         return res.json({ message: "SendGrid sender created (verification email sent)", sendgridData: sgData });
//     } catch (err) {
//         console.error("create sender error:", err.response?.data || err.message);
//         return res.status(500).json({ error: "Failed to create sender", details: err.response?.data || err.message });
//     }
// });

// /**
//  * GET /api/senders/check/:email
//  * Checks SendGrid status for a local sender by email.
//  * If SendGrid shows verified, we update local DB verified=true.
//  */
// router.get("/check/:email", async (req, res) => {
//     try {
//         const email = decodeURIComponent(req.params.email).toLowerCase();
//         let record = await prisma.verifiedSender.findUnique({ where: { email } });

//         if (!record) {
//             return res.status(404).json({ error: "No sender record found" });
//         }

//         if (!record.sendgridSenderId) {
//             return res.json({
//                 isRegisteredWithSendGrid: false,
//                 isVerified: !!record.verified,
//                 record,
//             });
//         }

//         // fetch from SendGrid
//         const sgRes = await axios.get(
//             `${SG_BASE}/senders/${record.sendgridSenderId}`,
//             { headers: sgHeaders() }
//         );
//         const sgData = sgRes.data;

//         // ✅ check sender-specific verified flag
//         const isVerified =
//             sgData.verified?.status === true ||
//             sgData.verified?.sender === true ||
//             sgData.status === "verified" ||
//             sgData.status === "active" ||
//             sgData.status === "approved";

//         const updated = await prisma.verifiedSender.update({
//             where: { id: sender.id },
//             data: {
//                 sendgridStatus: sgData.status || JSON.stringify(sgData),
//                 verified: isVerified,                         // ✅ always sync
//                 verifiedAt: isVerified ? new Date() : null,   // ✅ clear if unverified
//             },
//         });




//         // update DB
//         record = await prisma.verifiedSender.update({
//             where: { email },
//             data: {
//                 sendgridStatus: sgData.status || JSON.stringify(sgData),
//                 ...(isVerified && { verified: true, verifiedAt: new Date() }),
//             },
//         });

//         return res.json({
//             sendgrid: sgData,
//             isVerified,
//             record,
//         });
//     } catch (err) {
//         console.error("check sender error:", err.response?.data || err.message);
//         return res.status(500).json({
//             error: "Failed to check sendgrid sender",
//             details: err.response?.data || err.message,
//         });
//     }
// });
// ;

// // server/src/routes/sendgridSenders.js
// // GET /api/senders/verified
// // GET /api/senders/verified
// // GET /api/senders/verified
// router.get("/verified", async (req, res) => {
//     try {
//         // 1️⃣ Get all senders from DB (verified + unverified)
//         const senders = await prisma.verifiedSender.findMany();
//         const refreshed = [];

//         for (const sender of senders) {
//             if (!sender.sendgridSenderId) {
//                 refreshed.push(sender);
//                 continue;
//             }

//             try {
//                 const sgRes = await axios.get(
//                     `${SG_BASE}/senders/${sender.sendgridSenderId}`,
//                     { headers: sgHeaders() }
//                 );
//                 const sgData = sgRes.data;

//                 // 🔍 Check verification & deletion
//                 const isVerified =
//                     sgData.verified?.status === true ||
//                     sgData.verified?.sender === true ||
//                     sgData.status === "verified" ||
//                     sgData.status === "active" ||
//                     sgData.status === "approved";

//                 const isDeletedOrLocked = sgData.locked === true || sgData.verified?.status === false;

//                 const updated = await prisma.verifiedSender.update({
//                     where: { id: sender.id },
//                     data: {
//                         sendgridStatus: sgData.status || JSON.stringify(sgData),
//                         verified: isVerified && !isDeletedOrLocked,
//                         verifiedAt: isVerified && !isDeletedOrLocked ? new Date() : null,
//                     },
//                 });

//                 refreshed.push(updated);
//             } catch (err) {
//                 if (err.response?.status === 404) {
//                     // ✅ Sender truly deleted in SendGrid
//                     const updated = await prisma.verifiedSender.update({
//                         where: { id: sender.id },
//                         data: {
//                             verified: false,
//                             verifiedAt: null,
//                             sendgridStatus: "deleted",
//                         },
//                     });
//                     refreshed.push(updated);
//                 } else {
//                     console.error(`❌ Failed to refresh sender ${sender.email}:`, err.message);
//                     refreshed.push(sender);
//                 }
//             }
//         }


//         // 5️⃣ Only return verified senders for dropdown
//         const onlyVerified = refreshed.filter((s) => s.verified === true);
//         res.json(onlyVerified);
//     } catch (err) {
//         console.error("❌ fetch verified senders error:", err);
//         res.status(500).json({ error: "Failed to fetch verified senders" });
//     }
// });



// router.get("/debug/all-senders", async (req, res) => {
//     const all = await prisma.verifiedSender.findMany();
//     res.json(all);
// });



// export default router;
