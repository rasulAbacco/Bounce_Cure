// server/routes/conversations.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /conversations
 * Returns all emails mapped as "conversations"
 */
router.get("/", async (req, res) => {
    try {
        // Get all emails that are not replies (starting point of conversations)
        const emails = await prisma.email.findMany({
            where: { 
                isReply: false,
                folder: "INBOX" // Only show emails from inbox
            },
            orderBy: { date: "desc" },
            take: 100,
            include: { 
                account: true,
            },
        });

        // For each email, count how many emails are in the same thread
        const convs = await Promise.all(emails.map(async (e) => {
            const threadId = e.threadId || e.messageId;
            const replyCount = await prisma.email.count({
                where: {
                    OR: [
                        { threadId: threadId },
                        { inReplyTo: e.messageId }
                    ],
                    id: { not: e.id } // Exclude the current email
                }
            });

            return {
                id: e.id,
                subject: e.subject || "(no subject)",
                lastMessage: e.body ? e.body.slice(0, 120) : "",
                from: e.from,
                to: e.to,
                date: e.date,
                account: e.account,
                messageCount: 1 + replyCount,
                threadId: threadId
            };
        }));

        res.json(convs);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

/**
 * GET /conversations/:id
 * Returns one email wrapped as a "conversation" with all replies
 */
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
        // Get the original email
        const email = await prisma.email.findUnique({
            where: { id },
            include: { 
                account: true,
            },
        });

        if (!email) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Determine the thread ID
        const threadId = email.threadId || email.messageId;

        // Get all emails in the thread (original + replies)
        const threadEmails = await prisma.email.findMany({
            where: { 
                OR: [
                    { id: email.id },
                    { threadId: threadId },
                    { inReplyTo: email.messageId },
                    { inReplyTo: threadId }
                ]
            },
            orderBy: { date: "asc" },
            include: { account: true }
        });

        // Format all emails in the thread
        const messages = threadEmails.map(e => ({
            id: e.id,
            messageId: e.messageId,
            fromName: e.from,
            to: e.to,
            body: e.bodyHtml || e.body, // Use HTML version if available
            createdAt: e.date,
            isOriginal: e.id === email.id,
            inReplyTo: e.inReplyTo,
            isReply: e.isReply
        }));

        res.json({
            id: email.id,
            subject: email.subject || "(no subject)",
            email: email.from,
            messages
        });
    } catch (err) {
        console.error("Error fetching conversation:", err);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
});

/**
 * POST /conversations/:id/reply
 * Add a reply to a conversation
 */
router.post("/:id/reply", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { body, fromName, fromEmail, toEmail, inReplyTo } = req.body;

    try {
        // Find the original email
        const originalEmail = await prisma.email.findUnique({
            where: { id }
        });

        if (!originalEmail) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        console.log("Sending reply to:", toEmail);
        console.log("Sending reply from:", fromEmail);

        // Generate a unique message ID for the reply
        const messageId = `<${Date.now()}@${process.env.DOMAIN || 'localhost'}>`;
        
        // Determine thread ID
        const threadId = originalEmail.threadId || originalEmail.messageId;
        
        // Create the reply
        const reply = await prisma.email.create({
            data: {
                subject: `Re: ${originalEmail.subject}`,
                body,
                bodyHtml: body, // Store as HTML
                from: fromEmail, // Use the email from the request body
                to: toEmail, // Send to the original sender's email
                date: new Date(),
                accountId: originalEmail.accountId,
                inReplyTo: inReplyTo || originalEmail.messageId,
                threadId: threadId,
                isReply: true,
                messageId,
                folder: "SENT", // Mark as sent
                status: "sent",
                source: "web"
            }
        });

        // Fetch the created reply with account information
        const createdReply = await prisma.email.findUnique({
            where: { id: reply.id },
            include: { account: true }
        });

        // Format the response
        const response = {
            id: createdReply.id,
            messageId: createdReply.messageId,
            fromName: fromName || createdReply.from, // Use the name from the request or fall back to email
            to: createdReply.to,
            body: createdReply.bodyHtml || createdReply.body,
            createdAt: createdReply.date,
            inReplyTo: createdReply.inReplyTo,
            isReply: true,
            conversationId: id
        };

        res.json(response);
    } catch (err) {
        console.error("Error creating reply:", err);
        res.status(500).json({ error: "Failed to create reply" });
    }
});

/**
 * DELETE /conversations/:id
 * Delete conversation by ID
 */
router.delete("/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        // Find the email to get thread information
        const email = await prisma.email.findUnique({
            where: { id }
        });
        
        if (!email) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        
        // Determine the thread ID
        const threadId = email.threadId || email.messageId;
        
        // Delete all emails in the thread
        await prisma.email.deleteMany({
            where: {
                OR: [
                    { id: email.id },
                    { threadId: threadId },
                    { inReplyTo: email.messageId },
                    { inReplyTo: threadId }
                ]
            }
        });
        
        res.json({ message: "Conversation deleted" });
    } catch (err) {
        console.error("Failed to delete conversation:", err);
        res.status(404).json({ error: "Conversation not found" });
    }

//     *
//  * DELETE /conversations
//  * Delete multiple conversations by IDs
//  */
router.delete("/", async (req, res) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No conversation IDs provided" });
    }
    
    try {
        console.log(`Deleting ${ids.length} conversations with IDs:`, ids);
        
        let totalDeletedCount = 0;
        
        // Process each conversation ID
        for (const id of ids) {
            const conversationId = parseInt(id, 10);
            
            if (isNaN(conversationId)) {
                console.error(`Invalid conversation ID: ${id}`);
                continue;
            }
            
            // Find the email to get thread information
            const email = await prisma.email.findUnique({
                where: { id: conversationId }
            });
            
            if (!email) {
                console.error(`Conversation not found with ID: ${conversationId}`);
                continue;
            }
            
            // Determine the thread ID
            const threadId = email.threadId || email.messageId;
            
            // Delete all emails in the thread
            const deleteResult = await prisma.email.deleteMany({
                where: {
                    OR: [
                        { id: email.id },
                        { threadId: threadId },
                        { inReplyTo: email.messageId },
                        { inReplyTo: threadId }
                    ]
                }
            });
            
            totalDeletedCount += deleteResult.count;
            console.log(`Deleted ${deleteResult.count} emails for conversation ${conversationId}`);
        }
        
        res.json({ 
            message: "Conversations deleted successfully",
            deletedCount: totalDeletedCount,
            conversationCount: ids.length
        });
    } catch (err) {
        console.error("Failed to delete conversations:", err);
        
        // Check if it's a Prisma error
        if (err.code) {
            console.error("Prisma error code:", err.code);
            console.error("Prisma error meta:", err.meta);
        }
        
        // Return appropriate error response
        res.status(500).json({ 
            error: "Failed to delete conversations",
            details: err.message 
        });
    }
});

});

export default router;