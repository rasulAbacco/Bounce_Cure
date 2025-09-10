import express from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '../utils/encryption.js';
import { ImapFlow } from 'imapflow';

const router = express.Router();
const prisma = new PrismaClient();

// ----------------------------
// POST /api/email-account
// Save new email account with encrypted password
// ----------------------------
router.post('/', async (req, res) => {
    try {
        const { userId, email, imapHost, imapPort, imapUser, imapPass } = req.body;

        if (!userId || !email || !imapHost || !imapPort || !imapUser || !imapPass) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const port = parseInt(imapPort, 10);
        if (isNaN(port)) {
            return res.status(400).json({ error: 'IMAP Port must be a valid number' });
        }

        // Encrypt password
        const encrypted = encrypt(imapPass);
        const encryptedPassString = JSON.stringify(encrypted);

        // Save account
        const savedAccount = await prisma.emailAccount.create({
            data: {
                userId,
                email,
                imapHost,
                imapPort: port,
                imapUser,
                encryptedPass: encryptedPassString,
            },
        });

        res.status(201).json(savedAccount);
    } catch (error) {
        console.error('Error saving email account:', error);
        res.status(500).json({ error: 'Failed to save email account' });
    }
});

// ----------------------------
// GET /api/email-account/:userId
// Get all accounts for a user (safe fields only)
// ----------------------------
router.get('/:userId', async (req, res) => {
    try {
        const accounts = await prisma.emailAccount.findMany({
            where: { userId: req.params.userId },
            select: {
                id: true,
                email: true,
                imapUser: true,
            }
        });

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching email accounts:', error);
        res.status(500).json({ error: 'Failed to get email accounts' });
    }
});

// ----------------------------
// POST /api/email-account/test-connection
// Test IMAP login with plain password
// ----------------------------
router.post('/test-connection', async (req, res) => {
    try {
        const { imapHost, imapPort, imapUser, imapPass, secure } = req.body;

        if (!imapHost || !imapPort || !imapUser || !imapPass) {
            return res.status(400).json({ error: 'Missing IMAP credentials' });
        }

        const client = new ImapFlow({
            host: imapHost,
            port: parseInt(imapPort, 10),
            secure: !!secure,
            auth: {
                user: imapUser,
                pass: imapPass,
            },
        });

        await client.connect();
        await client.logout();

        res.json({ success: true, message: 'IMAP login successful' });
    } catch (error) {
        console.error('IMAP connection error:', error);
        res.status(400).json({ success: false, message: 'IMAP login failed', error: error.message });
    }
});

// ----------------------------
// GET /api/email-accounts
// List all accounts (safe fields only)
// ----------------------------
router.get('/', async (req, res) => {
    try {
        const accounts = await prisma.emailAccount.findMany({
            select: { id: true, imapUser: true, email: true },
        });

        res.json(accounts);
    } catch (error) {
        console.error("Error fetching accounts:", error);
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
});

export default router;
