import { ImapFlow } from "imapflow";
import { getOutlookAccessToken } from "../imapSync.js"; 
/**
 * Save email safely using Prisma upsert to avoid duplicates
 */
export async function saveEmail(prisma, emailData, accountId) {
  try {
    await prisma.email.upsert({
      where: { messageId: emailData.messageId },
      update: {}, // do nothing if exists
      create: {
        messageId: emailData.messageId || `no-id-${Date.now()}`,
        from: emailData.from || "unknown",
        to: emailData.to || "unknown",
        subject: emailData.subject || "(no subject)",
        body: emailData.body || "",
        date: emailData.date || new Date(),
        folder: emailData.folder || "INBOX",
        source: emailData.source || "imap",
        status: emailData.status || "unread",
        tags: emailData.tags || [],
        account: { connect: { id: accountId } },
      },
    });
  } catch (err) {
    console.error("❌ Failed to save email:", err);
    throw new Error(`HTTP 500: {"error":"Failed to create email"}`);
  }
}

/**
 * Sync emails for a single account
 */
export async function syncEmailsForAccount(prisma, account) {
  try {
    console.log(`🔍 Starting sync for ${account.email || account.imapUser}...`);

    let client;

    if (account.provider === "outlook" && account.authType === "oauth") {
      console.log("🔄 [Outlook] Fetching new access token...");
      const accessToken = await getOutlookAccessToken(account, prisma);

      const xoauth2 = Buffer.from(
        `user=${account.imapUser}\x01auth=Bearer ${accessToken}\x01\x01`,
        "utf-8"
      ).toString("base64");

      client = new ImapFlow({
        host: account.imapHost,
        port: account.imapPort,
        secure: true,
        auth: {
          user: account.imapUser,
          accessToken,
          method: "XOAUTH2",
        },
        logger: false,
      });

      // store internally to send manually if needed
      client._xoauth2 = xoauth2;
    } else {
      // password-based accounts
      client = new ImapFlow({
        host: account.imapHost,
        port: account.imapPort,
        secure: true,
        auth: {
          user: account.imapUser,
          pass: account.encryptedPass,
        },
      });
    }

    client.on("error", (err) => {
      console.error(`❌ IMAP error for ${account.imapUser}:`, err.message);
    });

    console.log(`🔌 Connecting to ${account.imapHost} as ${account.imapUser}...`);
    await client.connect();
    console.log("✅ Connected to IMAP");

    const lock = await client.getMailboxLock("INBOX");

    try {
      const latestEmail = await prisma.email.findFirst({
        where: { accountId: account.id },
        orderBy: { date: "desc" },
      });

      const sinceUID = Math.max(latestEmail?.id || 1, 1);

      for await (const message of client.fetch(
        { uid: `${sinceUID + 1}:*` },
        { envelope: true, source: true }
      )) {
        const emailData = {
          messageId: message.envelope.messageId || `uid-${message.uid}-${Date.now()}`,
          from: message.envelope.from?.map((f) => f.address).join(", ") || "unknown",
          to: message.envelope.to?.map((t) => t.address).join(", ") || "unknown",
          subject: message.envelope.subject || "(no subject)",
          body: message.source.toString() || "",
          date: message.envelope.date || new Date(),
          folder: "INBOX",
          source: "imap",
          status: "unread",
          tags: [],
        };

        await prisma.email.upsert({
          where: { messageId: emailData.messageId },
          update: {},
          create: { ...emailData, account: { connect: { id: account.id } } },
        });

        console.log(`📥 Saved email: ${emailData.subject}`);
      }
    } finally {
      lock.release();
      await client.logout();
      console.log("✅ Sync completed and logged out.");
    }
  } catch (err) {
    console.error(`❌ IMAP sync failed for ${account.imapUser}:`, err.message);
  }
}

/**
 * Main sync loop for all accounts
 */

//server/services/syncService.js
// export async function runSync(prisma) {
//   console.log("⏳ Running email sync for all accounts...");

//   const accounts = await prisma.emailAccount.findMany();

//   if (!accounts.length) {
//     console.warn("⚠ No email accounts found in DB.");
//     return;
//   }

//   for (const account of accounts) {
//     try {
//       const { email, provider, authType } = account;

//       if (!email || !provider || !authType) {
//         console.warn("⚠ Skipping invalid account:", { id: account.id, email, provider, authType });
//         continue;
//       }

//       // 🧠 Handle PASSWORD-based IMAP
//       if (authType === "password") {
//         if (!account.encryptedPass) {
//           console.warn(`⚠ Missing password for ${email}, skipping.`);
//           continue;
//         }
//         console.log(`🔄 Using password IMAP for ${email}`);
//         await syncEmailsForAccount(prisma, account);
//         continue;
//       }

//       // 🧠 Handle OAUTH-based accounts
//       if (authType === "oauth") {
//         if (provider === "gmail") {
//           console.log(`🔄 Using Gmail API for ${email}`);
//           await syncGmailAPI(prisma, account);
//         } else if (provider === "outlook") {
//           console.log(`🔄 Using Outlook IMAP OAuth for ${email}`);
//           await syncEmailsForAccount(prisma, account); // uses XOAUTH2 under the hood
//         } else {
//           console.log(`⚠ Unknown OAuth provider for ${email}, using IMAP fallback`);
//           await syncEmailsForAccount(prisma, account);
//         }
//         continue;
//       }

//       console.error(`❌ Unknown authType for ${email}: ${authType}`);
//     } catch (err) {
//       console.error(`❌ Failed sync for ${account.email}:`, err.message);
//     }
//   }

//   console.log("✅ Sync cycle finished");
// }