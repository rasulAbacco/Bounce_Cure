import { ImapFlow } from 'imapflow';
import fetch from 'node-fetch';
import { decrypt } from '../utils/encryption.js';
import EmailReplyParser from 'email-reply-parser';

export async function syncEmailsForAccount(account) {
    console.log('🔐 Decrypting password...');
    let imapPass;
    try {
        console.log("🧪 account.encryptedPass = ", account.encryptedPass);
        imapPass = decrypt(account.encryptedPass);
        console.log("🔑 Decrypted password:", imapPass);
    } catch (err) {
        console.error('❌ Failed to decrypt password:', err);
        throw err;
    }

    console.log('⚙️ Setting up ImapFlow connection...');
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
        console.log('✅ Connected to IMAP server');

        const lock = await client.mailboxOpen('INBOX');
        console.log(`📥 INBOX opened. Total messages: ${lock.exists}`);

        const from = lock.exists > 30 ? lock.exists - 30 + 1 : 1;

        for await (let message of client.fetch(`${from}:*`, { source: true })) {
            const buffer = message.source.toString();
            const parsed = await (await import('mailparser')).simpleParser(buffer);

            // Extract only reply part
            let cleanBody = '';
            try {
                const replyParser = new EmailReplyParser();
                cleanBody = replyParser.read(parsed.text || '').getVisibleText().trim();
            } catch (e) {
                console.warn('⚠️ Reply parsing failed. Using full body.');
                cleanBody = parsed.text || '';
            }

            // Ignore if body is empty
            if (!cleanBody || cleanBody.length < 2) {
                console.log('⏭️ Skipped: Empty or invalid reply body');
                continue;
            }

            const emailData = {
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                subject: parsed.subject || '(No Subject)',
                body: cleanBody,
                date: parsed.date || new Date(),
                tags: ['imap'],
                status: 'unread',
                source: 'imap',
                folder: 'INBOX',
            };

            await fetch('http://localhost:5000/api/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData),
            });

            console.log(`💾 Saved: ${emailData.subject}`);
        }

        await client.logout();
        console.log('📴 IMAP connection closed');
    } catch (err) {
        console.error('❌ IMAP sync error:', err);
        throw err;
    }
}
