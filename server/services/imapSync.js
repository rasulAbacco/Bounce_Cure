import { ImapFlow } from "imapflow";
import fetch from "node-fetch";
import { decrypt } from "../utils/encryption.js";
import EmailReplyParser from "email-reply-parser";

export async function syncEmailsForAccount(account) {
    console.log(`🔐 Decrypting password for ${account.imapUser}...`);
    let imapPass;

    try {
        let encryptedPass = account.encryptedPass;

        try {
            if (typeof encryptedPass === "string") {
                encryptedPass = JSON.parse(encryptedPass);
            }
            imapPass = decrypt(encryptedPass).replace(/\s+/g, "");
            console.log("✅ Decrypted using JSON format");
        } catch {
            console.warn("⚠️ Could not parse encryptedPass as JSON, assuming plain text");
            imapPass = encryptedPass;
        }

        if (typeof imapPass !== "string") {
            throw new Error("❌ Decrypted password is not a string");
        }
    } catch (err) {
        console.error("❌ Failed to process password:", err);
        throw err;
    }

    const client = new ImapFlow({
        host: account.imapHost,
        port: account.imapPort,
        secure: true,
        auth: {
            user: account.imapUser,
            pass: imapPass,
        },
        logger: false,
    });

    try {
        await client.connect();
        console.log(`✅ Connected to ${account.imapUser}`);

        const lock = await client.mailboxOpen("INBOX");
        console.log(`📥 ${account.imapUser} INBOX opened. Total: ${lock.exists}`);

        const from = lock.exists > 20 ? lock.exists - 20 + 1 : 1;

        for await (let message of client.fetch(`${from}:*`, { source: true })) {
            const buffer = message.source.toString();
            const parsed = await (await import("mailparser")).simpleParser(buffer);

            const fromEmail = parsed.from?.value?.[0]?.address || "";
            const isReply = parsed.inReplyTo || (parsed.references && parsed.references.length > 0);

            const skipSenders = ["no-reply@", "@google.com", "@hubspot.com", "@mongodb.com", "@notifications"];
            if (!isReply || skipSenders.some((d) => fromEmail.toLowerCase().includes(d))) {
                console.log(`⏭️ Skipping system email from ${fromEmail}`);
                continue;
            }

            const replyParser = new EmailReplyParser();
            const onlyReply = replyParser.read(parsed.text || "").getVisibleText();

            const emailData = {
                from: parsed.from?.text || "",
                to: parsed.to?.text || "",
                subject: parsed.subject || "(No Subject)",
                body: onlyReply || "",
                date: parsed.date || new Date(),
                tags: ["imap"],
                status: "unread",
                source: "imap",
                folder: "INBOX",
                accountId: account.id,
            };

            try {
                const response = await fetch("http://localhost:5000/api/emails", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(emailData),
                });

                if (!response.ok) {
                    console.error(`❌ Failed to save email: ${parsed.subject}`, await response.text());
                } else {
                    console.log(`✅ Saved email: ${parsed.subject}`);
                }
            } catch (err) {
                console.error(`❌ Exception saving email: ${parsed.subject}`, err);
            }
        }

        await client.logout();
        console.log(`📴 IMAP closed for ${account.imapUser}`);
    } catch (err) {
        console.error(`❌ IMAP sync error for ${account.imapUser}:`, err);
    }
}
