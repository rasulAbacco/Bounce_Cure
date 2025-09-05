// Use CommonJS for imap and mailparser
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import fetch from 'node-fetch';
import { decrypt } from '../utils/encryption.js'; // keep this ES module if rest of your app uses ESM

async function syncEmailsForAccount(account) {
    return new Promise((resolve, reject) => {
        console.log('🔐 Decrypting password...');
        let imapPass;
        try {
            imapPass = decrypt(account.encryptedPass);
        } catch (err) {
            console.error('❌ Failed to decrypt password:', err);
            return reject(err);
        }

        console.log('⚙️ Setting up IMAP connection...');
        const imap = new Imap({
            user: account.imapUser,
            password: imapPass,
            host: account.imapHost,
            port: account.imapPort,
            tls: true,
            tlsOptions: { rejectUnauthorized: false }, // allow self-signed certs (Gmail is OK)
        });

        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);
        }

        imap.once('ready', () => {
            console.log('✅ IMAP connection ready!');
            openInbox((err, box) => {
                if (err) {
                    console.error('❌ Failed to open inbox:', err);
                    imap.end();
                    return reject(err);
                }

                console.log(`📥 INBOX opened. Total messages: ${box.messages.total}`);
                const from = box.messages.total > 20 ? box.messages.total - 20 : 1;
                const fetcher = imap.seq.fetch(`${from}:${box.messages.total}`, {
                    bodies: '',
                    struct: true,
                });

                fetcher.on('message', (msg, seqno) => {
                    console.log(`📩 Message #${seqno} received`);
                    let buffer = '';

                    msg.on('body', (stream) => {
                        stream.on('data', (chunk) => {
                            buffer += chunk.toString('utf8');
                        });
                    });

                    msg.once('end', async () => {
                        try {
                            const parsed = await simpleParser(buffer);
                            console.log(`✅ Parsed email: ${parsed.subject}`);

                            const emailData = {
                                from: parsed.from?.text || '',
                                to: parsed.to?.text || '',
                                subject: parsed.subject || '(No Subject)',
                                body: parsed.text || '',
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

                            console.log('💾 Email saved to DB');
                        } catch (err) {
                            console.error('❌ Error parsing or saving email:', err);
                        }
                    });
                });

                fetcher.once('error', (err) => {
                    console.error('❌ Fetch error:', err);
                });

                fetcher.once('end', () => {
                    console.log('✅ Finished fetching all emails');
                    imap.end();
                    resolve();
                });
            });
        });

        imap.once('error', (err) => {
            console.error('❌ IMAP connection error:', err);
            reject(err);
        });

        imap.once('end', () => {
            console.log('📴 IMAP connection closed');
        });

        imap.connect();
    });
}


export{
    syncEmailsForAccount,
};
