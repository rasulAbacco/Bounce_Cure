// server/routes/advancedVerification.js
import dns from "dns/promises";
import fetch from "node-fetch";
import { SMTPClient } from "smtp-client";

export default class AdvancedVerifier {
    constructor(opts = {}) {
        this.awsKey = process.env.SL_AWS_API_KEY;
        this.endpoint = "https://api.silverlining.cloud/email-verifier/validate";
        this.smtpTimeout = opts.smtpTimeout || 5000;
        this.dnsTimeout = opts.dnsTimeout || 3000;
        this.retryGreylist = opts.retryGreylist || 0;
        this.stats = { total: 0, valid: 0, invalid: 0, risky: 0 };
    }

    getStats() {
        return this.stats;
    }

    async verify(email, { smtpCheck = false, isBulk = false, fast = false } = {}) {
        this.stats.total++;

        // 1. Syntax check
        const syntax_valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!syntax_valid) {
            this.stats.invalid++;
            return {
                email,
                status: "invalid",
                score: 0,
                syntax_valid,
                domain_valid: false,
                mailbox_exists: false,
                catch_all: false,
                disposable: false,
                role_based: false,
                greylisted: false,
                error: "Invalid syntax"
            };
        }

        // 2. Domain & MX check
        const domain = email.split("@")[1].toLowerCase();
        let domain_valid = false;
        let mxRecords = [];
        try {
            mxRecords = await dns.resolveMx(domain);
            domain_valid = mxRecords && mxRecords.length > 0;
        } catch {
            domain_valid = false;
        }
        if (!domain_valid) {
            this.stats.invalid++;
            return {
                email,
                status: "invalid",
                score: 0,
                syntax_valid,
                domain_valid,
                mailbox_exists: false,
                catch_all: false,
                disposable: false,
                role_based: false,
                greylisted: false,
                error: "No MX records found"
            };
        }

        // 3. Disposable & Role-based detection
        const disposableDomains = ["mailinator.com", "tempmail.com", "yopmail.com", "guerrillamail.com"];
        const roleBased = ["admin", "info", "support", "sales", "contact"];
        const localPart = email.split("@")[0].toLowerCase();
        const disposable = disposableDomains.includes(domain);
        const role_based = roleBased.includes(localPart);

        // 4. Provider call (AWS API)
        let providerResp = {};
        let providerStatus = null;
        let mailbox_exists = null;
        try {
            const resp = await fetch(this.endpoint, {
                method: "POST",
                headers: {
                    "x-api-key": this.awsKey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email_address: email })
            });

            if (resp.ok) {
                providerResp = await resp.json();
                providerStatus = providerResp?.validationResult?.status || null;

                if (providerStatus === "valid") mailbox_exists = true;
                else if (providerStatus === "invalid") mailbox_exists = false;
                else mailbox_exists = null;
            } else {
                mailbox_exists = null;
            }
        } catch (err) {
            mailbox_exists = null;
        }

        // 5. SMTP Fallback (only if fast=false and still uncertain)
        if (!fast && smtpCheck && mailbox_exists === null) {
            try {
                const client = new SMTPClient({
                    host: mxRecords[0].exchange,
                    port: 25,
                    timeout: this.smtpTimeout
                });
                await client.connect();
                await client.greet({ hostname: "example.com" });
                await client.mail({ from: "verify@example.com" });
                const rcpt = await client.rcpt({ to: email });
                if (rcpt.code === 250) mailbox_exists = true;
                else if (rcpt.code === 550) mailbox_exists = false;
                else mailbox_exists = null;
                await client.quit();
            } catch {
                mailbox_exists = null;
            }
        }

        // 6. Catch-all detection
        let catch_all = false;
        try {
            const testUser = `catchall_test_${Date.now()}@${domain}`;
            const client = new SMTPClient({ host: mxRecords[0].exchange, port: 25, timeout: 3000 });
            await client.connect();
            await client.greet({ hostname: "example.com" });
            await client.mail({ from: "verify@example.com" });
            const rcpt = await client.rcpt({ to: testUser });
            if (rcpt.code === 250) catch_all = true;
            await client.quit();
        } catch {
            catch_all = false;
        }

        // 7. Final status calculation
        const result = this.computeFinalStatusAndScore({
            email,
            syntax_valid,
            domain_valid,
            mailbox_exists,
            catch_all,
            disposable,
            role_based,
            providerResp
        });

        this.stats[result.status]++;
        return result;
    }

    computeFinalStatusAndScore(r) {
        let status = "invalid";
        let score = 0;

        if (!r.syntax_valid || !r.domain_valid) {
            status = "invalid";
            score = 0;
        } else if (r.mailbox_exists === true) {
            status = "valid";
            score = 100;
        } else if (r.mailbox_exists === false) {
            status = "invalid";
            score = 0;
        } else {
            // null/unknown → treat as invalid (strict rule)
            status = "invalid";
            score = 0;
        }

        return {
            email: r.email,
            status,
            score,
            syntax_valid: r.syntax_valid,
            domain_valid: r.domain_valid,
            mailbox_exists: r.mailbox_exists,
            catch_all: r.catch_all,
            disposable: r.disposable,
            role_based: r.role_based,
            greylisted: false,
            mxRecord: r.providerResp?.mxRecords?.join(",") || null,
            provider: JSON.stringify(r.providerResp || null),
            isFreeDomain: ["gmail.com", "yahoo.com", "outlook.com"].includes(r.email.split("@")[1].toLowerCase()),
            error: null
        };
    }
}
