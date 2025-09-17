import { PrismaClient } from "@prisma/client";
import { syncEmailsForAccount } from "./imapSync.js";

const prisma = new PrismaClient();

export function startEmailScheduler() {
    const runSync = async () => {
        try {
            const accounts = await prisma.emailAccount.findMany();
            if (!accounts || accounts.length === 0) {
                console.log("⏳ No email accounts found, skipping sync.");
                return;
            }

            console.log(`⏳ Running IMAP sync for ${accounts.length} accounts...`);

            for (const account of accounts) {
                if (!account || !account.imapUser || !account.imapHost || !account.encryptedPass) {
                    console.warn("⚠ Skipping invalid account:", account);
                    continue;
                }

                try {
                    await syncEmailsForAccount(prisma, account);
                } catch (err) {
                    console.error(`❌ Failed sync for ${account.imapUser || account.email}:`, err.message);
                }
            }
        } catch (err) {
            console.error("❌ Scheduler error:", err);
        }
    };

    runSync(); // Run immediately on startup

    setInterval(runSync, 2 * 60 * 1000); // Repeat every 2 minutes
}
