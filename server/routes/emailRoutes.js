import express from 'express';
import { PrismaClient } from '@prisma/client';
import  {syncEmailsForAccount}  from '../services/imapSync.js';
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/emails - get recent emails
router.get('/', async (req, res) => {
    try {
        const emails = await prisma.email.findMany({
            orderBy: { date: 'desc' },
            take: 50,
        });
        res.json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

// POST /api/emails - save new email
router.post('/', async (req, res) => {
    try {
        const {
            from,
            to,
            subject,
            body,
            date,
            tags = [],
            status = 'unread',
            source = 'imap',
            folder = 'INBOX',
        } = req.body;

        if (!from || !to || !subject || !body || !date) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const email = await prisma.email.create({
            data: {
                from,
                to,
                subject,
                body,
                date: new Date(date),
                tags,
                status,
                source,
                folder,
            },
        });

        res.status(201).json(email);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create email' });
    }
});


router.get('/sync/:userId', async (req, res) => {
    try {
        const account = await prisma.emailAccount.findFirst({
            where: { userId: req.params.userId },
        });

        if (!account) {
            return res.status(404).json({ error: 'No account found for user' });
        }

        await syncEmailsForAccount(account);

        res.send('✅ Manual IMAP sync complete');
    } catch (error) {
        console.error('❌ Sync error:', error);
        res.status(500).json({ error: 'Failed to sync emails' });
    }
});
export default router;
