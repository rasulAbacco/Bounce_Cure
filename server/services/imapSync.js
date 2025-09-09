import { ImapFlow } from 'imapflow';
import fetch from 'node-fetch';
import { decrypt } from '../utils/encryption.js';
import EmailReplyParser from 'email-reply-parser';

export async function syncEmailsForAccount(account) {
    console.log('🔐 Decrypting password...');
    let imapPass;
    try {
        console.log('🧪 account.encryptedPass =', account.encryptedPass);

        let encryptedPass = account.encryptedPass;

        // Try parsing JSON — if it fails, assume it's plain text
        try {
            if (typeof encryptedPass === 'string') {
                encryptedPass = JSON.parse(encryptedPass);
            }
            imapPass = decrypt(encryptedPass);
            console.log('✅ Decrypted using JSON format');
        } catch (jsonErr) {
            console.warn('⚠️ Could not parse encryptedPass as JSON, assuming plain text');
            imapPass = encryptedPass;
        }

        console.log('🔑 Decrypted password:', imapPass);
        console.log('🔑 Password is string?', typeof imapPass === 'string');

        if (typeof imapPass !== 'string') {
            throw new Error('❌ Decrypted password is not a string');
        }
    } catch (err) {
        console.error('❌ Failed to process password:', err);
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

        const from = lock.exists > 20 ? lock.exists - 20 + 1 : 1;

        for await (let message of client.fetch(`${from}:*`, { source: true })) {
            const buffer = message.source.toString();
            const parsed = await (await import('mailparser')).simpleParser(buffer);

            const fromEmail = parsed.from?.value?.[0]?.address || '';
            const isReply = parsed.inReplyTo || (parsed.references && parsed.references.length > 0);

            const skipSenders = [
                'no-reply@',
                '@google.com',
                '@hubspot.com',
                '@mongodb.com',
                '@notifications',
            ];
            if (
                !isReply ||
                skipSenders.some(domain => fromEmail.toLowerCase().includes(domain))
            ) {
                console.log(`⏭️ Skipping non-reply or system email from ${fromEmail}`);
                continue;
            }

            const replyParser = new EmailReplyParser();
            const onlyReply = replyParser.read(parsed.text || '').getVisibleText();
            console.log(`🧹 Clean reply: ${onlyReply}`);

            const emailData = {
                from: parsed.from?.text || '',
                to: parsed.to?.text || '',
                subject: parsed.subject || '(No Subject)',
                body: onlyReply || '',
                date: parsed.date || new Date(),
                tags: ['imap'],
                status: 'unread',
                source: 'imap',
                folder: 'INBOX',
                accountId: account.id // ✅ Added accountId here
            };

            try {
                const response = await fetch('http://localhost:5000/api/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
        console.log('📴 IMAP connection closed');
    } catch (err) {
        console.error('❌ IMAP sync error:', err);
        throw err;
    }
}
