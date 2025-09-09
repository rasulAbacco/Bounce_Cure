import express from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption.js';
import ImapFlow from 'imapflow';

const router = express.Router();
const prisma = new PrismaClient();

// ----------------------------
// POST /api/email-account
// Save new email account with encrypted password
// ----------------------------
router.post('/', async (req, res) => {
    try {
        const { userId, email, imapHost, imapPort, imapUser, imapPass } = req.body;

        // Validate required fields
        if (!userId || !email || !imapHost || !imapPort || !imapUser || !imapPass) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Convert port to integer
        const port = parseInt(imapPort, 10);
        if (isNaN(port)) {
            return res.status(400).json({ error: 'IMAP Port must be a valid number' });
        }

        // Encrypt password
        const encrypted = encrypt(imapPass); // { iv, content }
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
// Get all accounts for a user with decrypted passwords
// ----------------------------
router.get('/:userId', async (req, res) => {
    try {
        const accounts = await prisma.emailAccount.findMany({
            where: { userId: req.params.userId },
        });

        const decryptedAccounts = accounts.map(account => {
            let decryptedPass = null;
            try {
                const encryptedPass = JSON.parse(account.encryptedPass); // { iv, content }
                decryptedPass = decrypt(encryptedPass); // returns plain string
            } catch (err) {
                console.error('Failed to decrypt password for account ID:', account.id);
            }

            return {
                ...account,
                imapPass: decryptedPass, // plain string
            };
        });

        res.json(decryptedAccounts);
    } catch (error) {
        console.error('Error fetching email accounts:', error);
        res.status(500).json({ error: 'Failed to get email accounts' });
    }
});

// ----------------------------
// POST /api/email-account/test-connection
// Test IMAP login with decrypted password
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
                pass: imapPass, // MUST be plain string
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

export default router;
