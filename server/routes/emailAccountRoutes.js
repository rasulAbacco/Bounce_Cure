import express from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '../utils/encryption.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/email-account - create new email account with encrypted password
router.post('/', async (req, res) => {
    try {
        const { userId, email, imapHost, imapPort, imapUser, imapPass } = req.body;

        if (!userId || !email || !imapHost || !imapPort || !imapUser || !imapPass) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const encryptedPass = encrypt(imapPass);

        const savedAccount = await prisma.emailAccount.create({
            data: {
                userId,
                email,
                imapHost,
                imapPort,
                imapUser,
                encryptedPass,
            },
        });

        res.status(201).json(savedAccount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save email account' });
    }
});

// GET /api/email-account/:userId - get all accounts for a user
router.get('/:userId', async (req, res) => {
    try {
        const accounts = await prisma.emailAccount.findMany({
            where: { userId: req.params.userId },
        });
        res.json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get email accounts' });
    }
});

export default router;
