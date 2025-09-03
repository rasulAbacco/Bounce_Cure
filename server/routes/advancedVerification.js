import dns from "dns/promises";
import disposableDomains from "./disposableDomains.js";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const SG_EMAIL_VAL_API_KEY = process.env.SG_EMAIL_VAL_API_KEY;

const ROLE_BASED = [
  "info", "sales", "support", "admin", "contact", "billing", "help", "office",
  "noreply", "no-reply", "donotreply", "do-not-reply", "webmaster", "postmaster",
  "abuse", "security", "privacy", "legal", "compliance", "marketing", "hr",
  "careers", "jobs", "recruitment", "finance", "accounting", "invoice", "orders"
];

const COMMON_INVALID_PATTERNS = [
  /test\d*@/i, /sample\d*@/i, /example\d*@/i, /dummy\d*@/i,
  /fake\d*@/i, /invalid\d*@/i, /temp\d*@/i, /placeholder\d*@/i
];

const SUSPICIOUS_DOMAINS = [
  "example.com", "example.org", "example.net", "test.com", "domain.com"
];

export default class AdvancedVerifier {
  constructor({ dnsTimeout = 8000, retryGreylist = 2, smtpTimeout = 10000 } = {}) {
    this.dnsTimeout = dnsTimeout;
    this.retryGreylist = retryGreylist;
    this.smtpTimeout = smtpTimeout;
    this.dnsCache = new Map();
  }

  validateSyntax(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) return { valid: false };

    const [local, domain] = email.split("@");
    if (!local || !domain) return { valid: false };
    if (local.length > 64 || email.length > 254) return { valid: false };
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return { valid: false };
    if (COMMON_INVALID_PATTERNS.some(p => p.test(email))) return { valid: false };
    if (SUSPICIOUS_DOMAINS.includes(domain)) return { valid: false };

    return { valid: true };
  }

  async validateDomain(email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return { domain: null, valid: false };

    if (this.dnsCache.has(domain)) return this.dnsCache.get(domain);

    const result = { domain, valid: false, mx: [] };

    try {
      const mx = await Promise.race([
        dns.resolveMx(domain),
        new Promise((_, rej) => setTimeout(() => rej(new Error("DNS MX Timeout")), this.dnsTimeout))
      ]);
      if (mx?.length) {
        result.valid = true;
        result.mx = mx.map(m => m.exchange);
      }
    } catch {
      try {
        await Promise.race([
          dns.resolve4(domain),
          new Promise((_, rej) => setTimeout(() => rej(new Error("DNS A Timeout")), this.dnsTimeout))
        ]);
        result.valid = true;
      } catch {
        // domain invalid
      }
    }

    this.dnsCache.set(domain, result);
    setTimeout(() => this.dnsCache.delete(domain), 30 * 60 * 1000); // cache for 30 mins
    return result;
  }

  detectDisposable(domain) {
    domain = domain.toLowerCase();
    if (disposableDomains.includes(domain)) return true;
    return /temp|trash|disposable/i.test(domain);
  }

  detectRoleBased(local) {
    local = local.toLowerCase();
    if (ROLE_BASED.includes(local)) return true;
    return /^(info|support|sales)/.test(local);
  }

  computeScore(d) {
    let s = 100;
    if (!d.syntax_valid) s -= 50;
    if (!d.domain_valid) s -= 40;
    if (d.mailbox_exists === false) s -= 100;
    if (d.disposable) s -= 35;
    if (d.role_based) s -= 30;
    if (d.greylisted) s -= 20;
    return Math.max(Math.min(s, 100), 0);
  }

  /**
   * Check mailbox existence via SMTP.
   * Implements retry on greylist with exponential backoff.
   * @param {string} email
   * @param {string[]} mxHosts
   * @returns {Promise<{exists: boolean|null, greylisted: boolean, catch_all: boolean}>}
   */
  async checkMailbox(email, mxHosts) {
    if (!mxHosts?.length) return { exists: null, greylisted: false, catch_all: false };

    const SMTPClient = (await import("smtp-client")).SMTPClient;

    for (const host of mxHosts) {
      for (let attempt = 0; attempt <= this.retryGreylist; attempt++) {
        const client = new SMTPClient({
          host,
          port: 25,
          timeout: this.smtpTimeout,
        });

        try {
          await client.connect();
          await client.greet({ hostname: "localhost" });
          await client.mail({ from: "verify@abaccotech.com" });

          try {
            await client.rcpt({ to: email });
            await client.quit();
            // Successful RCPT means mailbox likely exists
            return { exists: true, greylisted: false, catch_all: false };
          } catch (err) {
            const msg = (err.message || "").toLowerCase();

            if (msg.includes("450") || msg.includes("greylist")) {
              await client.quit();
              if (attempt < this.retryGreylist) {
                const delay = 3000 * Math.pow(2, attempt); // Exponential backoff
                console.log(`[SMTP] Greylist detected for ${email} on ${host}, retrying in ${delay}ms... (attempt ${attempt + 1})`);
                await new Promise(r => setTimeout(r, delay));
                continue; // retry
              } else {
                return { exists: null, greylisted: true, catch_all: false };
              }
            } else if (
              msg.includes("550") ||
              msg.includes("user unknown") ||
              msg.includes("not exist")
            ) {
              await client.quit();
              return { exists: false, greylisted: false, catch_all: false };
            } else {
              await client.quit();
              return { exists: null, greylisted: false, catch_all: false };
            }
          }
        } catch (err) {
          console.error(`[SMTP] Connection or protocol error on host ${host}:`, err.message);
          try { await client.quit(); } catch { }
          // Try next MX server
          break;
        }
      }
    }

    return { exists: null, greylisted: false, catch_all: false };
  }

  /**
   * Main verify function.
   * @param {string} email
   * @param {object} options
   * @param {boolean} options.smtpCheck - Set to true to enable slow SMTP mailbox check (default false)
   */
  async verify(email, options = { smtpCheck: false }) {
    email = email.trim().toLowerCase();
    console.log(`\n[VERIFY] Starting verification for email: ${email}`);

    const syntax = this.validateSyntax(email);
    if (!syntax.valid) {
      console.log(`[VERIFY] Syntax invalid for email: ${email}`);
      return {
        email,
        status: "invalid",
        score: 0,
        syntax_valid: false,
        domain_valid: false,
        mailbox_exists: false,
        catch_all: false,
        disposable: false,
        role_based: false,
        greylisted: false
      };
    }
    console.log(`[VERIFY] Syntax valid for email: ${email}`);

    // Run domain validation and SendGrid check in parallel for speed
    const [domainR, sgResult] = await Promise.all([
      this.validateDomain(email),
      validateWithSendGrid(email).catch(err => {
        console.error(`[VERIFY] SendGrid validation failed for ${email}:`, err.message);
        return null;
      }),
    ]);

    const domain = domainR.domain ?? email.split("@")[1];
    const local = email.split("@")[0] || "";

    console.log(`[VERIFY] Domain check for ${email}: ${domainR.valid ? 'valid' : 'invalid'}, MX: ${domainR.mx.join(", ")}`);

    const disposable = this.detectDisposable(domain);
    const role = this.detectRoleBased(local);
    console.log(`[VERIFY] Disposable: ${disposable}, Role-based: ${role}`);

    let mailbox_exists = null;
    let catch_all = false;
    let greylisted = false;

    if (sgResult) {
      mailbox_exists = sgResult.verdict === "Valid" || sgResult.is_valid === true;
      catch_all = sgResult.is_catch_all_address || false;
      greylisted = false; // not exposed by SendGrid
      console.log(`[VERIFY] SendGrid validation result for ${email}: verdict=${sgResult.verdict}, mailbox_exists=${mailbox_exists}, catch_all=${catch_all}`);
    }

    // Optional slow SMTP mailbox check - disabled by default to speed things up
    if (options.smtpCheck && domainR.mx.length > 0) {
      try {
        const smtpResult = await this.checkMailbox(email, domainR.mx);
        mailbox_exists = smtpResult.exists;
        catch_all = smtpResult.catch_all;
        greylisted = smtpResult.greylisted;
        console.log(`[VERIFY] SMTP mailbox check result for ${email}: exists=${mailbox_exists}, catch_all=${catch_all}, greylisted=${greylisted}`);
      } catch (e) {
        console.error(`[VERIFY] SMTP check failed for ${email}:`, e.message);
      }
    }

    const data = {
      syntax_valid: true,
      domain_valid: domainR.valid,
      mailbox_exists,
      catch_all,
      disposable,
      role_based: role,
      greylisted
    };

    const score = this.computeScore(data);
    console.log(`[VERIFY] Computed score for ${email}: ${score}`);

    let status = "valid";
    if (!domainR.valid || mailbox_exists === false || score < 40) {
      status = "invalid";
    } else if (disposable || score < 60) {
      status = "risky";
    }

    console.log(`[VERIFY] Final status for ${email}: ${status}`);

    return {
      email,
      status,
      score,
      ...data
    };
  }
}

async function validateWithSendGrid(email) {
  console.log(`[SendGrid] Using API key: ${SG_EMAIL_VAL_API_KEY ? SG_EMAIL_VAL_API_KEY.substring(0, 10) + "..." : "undefined"}`);

  const response = await fetch("https://api.sendgrid.com/v3/validations/email", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${SG_EMAIL_VAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, source: "signup" }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.errors ? JSON.stringify(errorData.errors) : response.statusText;
    throw new Error(`SendGrid API error: ${response.status} - ${errorMessage}`);
  }

  const data = await response.json();
  console.log(`[SendGrid] API response for ${email}:`, data.result);
  return data.result;
}
