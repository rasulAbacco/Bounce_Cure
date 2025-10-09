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
                // ✅ Check for valid account based on authType
                const isPasswordAccount =
                    account.authType === "password" && account.encryptedPass;

                const isOutlookOAuth =
                    account.authType === "oauth" &&
                    account.provider === "outlook" &&
                    account.refreshToken &&
                    account.oauthClientId &&
                    account.oauthClientSecret;

                const isValid =
                    account &&
                    account.imapUser &&
                    account.imapHost &&
                    account.imapPort &&
                    (isPasswordAccount || isOutlookOAuth);

                if (!isValid) {
                    console.warn("⚠ Skipping invalid account:", {
                        id: account.id,
                        email: account.email,
                        authType: account.authType,
                        hasRefresh: !!account.refreshToken,
                        hasPass: !!account.encryptedPass,
                    });
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

    // 🟢 Run immediately on startup
    runSync();

    // 🔁 Repeat every 2 minutes
    setInterval(runSync, 2 * 60 * 1000);
}
