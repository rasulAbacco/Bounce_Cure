// server/src/services/syncService.js
// Simple scheduler stub — integrate your imapSync.js functionality here.
export function startSyncLoop(prisma) {
    // fire-and-forget: run immediately and every minute
    const run = async () => {
        try {
            console.log("SYNC: fetching accounts");
            const accounts = await prisma.emailAccount.findMany();
            for (const a of accounts) {
                // call your imap sync here, for now we log
                console.log("Would sync account:", a.imapUser);
                // await some syncEmailsForAccount(a);
            }
        } catch (err) {
            console.error("SYNC error", err);
        }
    };
    run();
    setInterval(run, 6000 * 1000);
}
