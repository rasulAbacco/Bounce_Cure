// services/imapScheduler.js
import { PrismaClient } from "@prisma/client";
import { syncEmailsForAccount } from "./imapSync.js";

const prisma = new PrismaClient();

/**
 * Starts a background job that fetches emails from all accounts every 60s
 */
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
                try {
                    await syncEmailsForAccount(account);
                } catch (err) {
                    console.error(`❌ Failed sync for ${account.imapUser}:`, err.message);
                }
            }
        } catch (err) {
            console.error("❌ Scheduler error:", err);
        }
    };

    // Run immediately once at startup
    runSync();

    // Keep running every 30s
    setInterval(runSync, 60 * 1000);
}

