// server/services/imapSync.js
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

/**
 * Save email safely using Prisma upsert to avoid duplicates
 */
export async function saveEmail(prisma, emailData, accountId) {
  try {
    await prisma.email.upsert({
      where: { messageId: emailData.messageId },
      update: {}, // Do nothing if exists
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
 * Determines whether an email should be skipped based on subject or sender.
 */
function shouldSkipEmail(subject, from) {
  const unwantedSubjects = [
    "Delivery Status Notification",
    "Undelivered Mail Returned to Sender",
    "Mail Delivery Failure",
    "Failure Notice",
    "Returned mail",
  ];

  const unwantedSenders = [
    "mailer-daemon@", // common auto-reply address
    "postmaster@",
    "no-reply@",
  ];

  const subjectLower = subject.toLowerCase();
  if (unwantedSubjects.some(s => subjectLower.includes(s.toLowerCase()))) return true;

  const fromLower = from.toLowerCase();
  if (unwantedSenders.some(addr => fromLower.includes(addr.toLowerCase()))) return true;

  return false;
}

/**
 * Sync emails for a single account
 */
export async function syncEmailsForAccount(prisma, account) {
  if (!account || typeof account !== "object") {
    console.error("❌ Invalid account passed to syncEmailsForAccount:", account);
    return;
  }

  try {
    console.log(`🔍 Starting sync for ${account.email || account.imapUser || "unknown account"}...`);

    let password = account.encryptedPass;
    if (typeof password === "string") {
      try {
        password = JSON.parse(password);
      } catch {
        // plain text, fine
      }
    }

    const client = new ImapFlow({
      host: account.imapHost,
      port: account.imapPort,
      secure: true,
      auth: { user: account.imapUser, pass: password },
      socketTimeout: 120000,
      authTimeout: 30000,
    });

    client.on("error", (err) => {
      console.error(`❌ IMAP socket error for ${account.imapUser}:`, err.message);
    });

    try {
      console.log(`🔌 Connecting to ${account.imapHost} as ${account.imapUser}...`);
      await client.connect();
      console.log("✅ Connected to IMAP");
    } catch (err) {
      console.error("❌ Failed to connect:", err.message);
      return;
    }

    const lock = await client.getMailboxLock("INBOX");
    try {
      const latestEmail = await prisma.email.findFirst({
        where: { accountId: account.id },
        orderBy: { date: "desc" },
      });

      const sinceUID = Math.max(latestEmail?.id || 1, 1);

      for await (let message of client.fetch(
        { uid: `${sinceUID + 1}:*` },
        { envelope: true, source: true }
      )) {
        try {
          const parsed = await simpleParser(message.source);

          const subject = message.envelope.subject || "(no subject)";
          const from = message.envelope.from?.map(f => f.address).join(", ") || "unknown";

          // ✅ Skip unwanted emails
          if (shouldSkipEmail(subject, from)) {
            console.log(`⏭ Skipping unwanted email: ${subject}`);
            continue;
          }

          const emailData = {
            messageId: message.envelope.messageId || `uid-${message.uid}-${Date.now()}`,
            from,
            to: message.envelope.to?.map(t => t.address).join(", ") || "unknown",
            subject,
            body: parsed.text || parsed.html || "",
            date: message.envelope.date || new Date(),
            folder: "INBOX",
            source: "imap",
            status: "unread",
            tags: [],
          };

          await saveEmail(prisma, emailData, account.id);
          console.log(`📥 Saved email: ${emailData.subject}`);
        } catch (emailErr) {
          console.error(`⚠ Failed to save email: ${emailErr.message}`);
        }
      }
    } finally {
      lock.release();
      await client.logout();
    }
  } catch (err) {
    console.error(`❌ IMAP sync error for ${account.imapUser || "unknown"}:`, err);
  }
}

/**
 * Main sync loop for all accounts
 */
export async function runSync(prisma) {
  try {
    console.log("⏳ Running IMAP sync for all accounts...");

    const accounts = await prisma.emailAccount.findMany({
      select: {
        id: true,
        email: true,
        imapHost: true,
        imapPort: true,
        imapUser: true,
        encryptedPass: true,
      },
    });

    if (!Array.isArray(accounts) || accounts.length === 0) {
      console.warn("⚠ No valid email accounts found.");
      return;
    }

    for (const account of accounts) {
      const isValid =
        account &&
        account.imapUser &&
        account.imapHost &&
        account.imapPort &&
        account.encryptedPass;

      if (!isValid) {
        console.warn("⚠ Skipping invalid account:", account);
        continue;
      }

      try {
        await syncEmailsForAccount(prisma, account);
      } catch (err) {
        console.error(`❌ Failed sync for ${account.email || account.imapUser}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Sync loop error:", err);
  }
}
