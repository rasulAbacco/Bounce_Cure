import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { syncEmailsForAccount } from './services/imapSync.js';

const prisma = new PrismaClient();

export function startCronJobs() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            const accounts = await prisma.emailAccount.findMany();
            for (const account of accounts) {
                await syncEmailsForAccount(account);
            }
            console.log('IMAP sync completed');
        } catch (error) {
            console.error('Error during IMAP sync cron job:', error);
        }
    });
}
