import dns from "dns/promises";
import disposableDomains from "./disposableDomains.js";
import { SMTPClient } from "smtp-client";
import crypto from "crypto";
// Common role-based addresses
const ROLE_BASED = [
  "info", "sales", "support", "admin", "contact", "billing", "help", "office",
  "noreply", "no-reply", "donotreply", "do-not-reply", "webmaster", "postmaster",
  "abuse", "security", "privacy", "legal", "compliance", "marketing", "hr",
  "careers", "jobs", "recruitment", "finance", "accounting", "invoice", "orders"
];

// Patterns and domains that indicate fake or test emails
const COMMON_INVALID_PATTERNS = [/test\d*@/i, /sample\d*@/i, /example\d*@/i, /dummy\d*@/i, /fake\d*@/i, /invalid\d*@/i, /temp\d*@/i, /placeholder\d*@/i];
const SUSPICIOUS_DOMAINS = ["example.com", "example.org", "example.net", "test.com", "domain.com"];

export default class AdvancedVerifier {
  constructor({ dnsTimeout = 5000, smtpTimeout = 8000, retryGreylist = 1 } = {}) {
    this.dnsTimeout = dnsTimeout;
    this.smtpTimeout = smtpTimeout;
    this.retryGreylist = retryGreylist;
    this.dnsCache = new Map();
  }

  // all other methods here...



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
      const mx = await dns.resolveMx(domain);
      if (mx?.length) {
        result.valid = true;
        result.mx = mx.map(m => m.exchange);
      }
    } catch {
      try {
        await dns.resolve4(domain); // fallback if MX fails
        result.valid = true;
      } catch {
        // domain invalid
      }
    }

    this.dnsCache.set(domain, result);
    setTimeout(() => this.dnsCache.delete(domain), 300000); // cache for 5 mins
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
    if (d.mailbox_exists === false) s -= 100;  // ✅ Major penalty
    if (d.disposable) s -= 35;
    if (d.role_based) s -= 30;
    if (d.greylisted) s -= 20;

    return Math.max(Math.min(s, 100), 0);
  }

  async checkMailbox(email, mxHosts) {
    if (!mxHosts?.length) return { exists: null, greylisted: false, catch_all: false };

    let lastGrey = false;
    let mailboxExists = null;
    let catchAll = false;

    for (const host of mxHosts) {
      const client = new SMTPClient({ host, port: 25, timeout: this.smtpTimeout });
      try {
        await client.connect();
        await client.greet({ hostname: "localhost" });
        await client.mail({ from: "verify@abaccotech.com" });

        // Check actual mailbox
        try {
          await client.rcpt({ to: email });
          mailboxExists = true;
        } catch (err) {
          const msg = (err.message || "").toLowerCase();
          if (msg.includes("450") || msg.includes("greylist")) lastGrey = true;
          else if (msg.includes("550") || msg.includes("user unknown") || msg.includes("not exist")) {
            mailboxExists = false;
          }
        }

        // Catch-all test
        const domain = email.split("@")[1];
        const randomLocal = crypto.randomBytes(5).toString("hex");
        const randomEmail = `${randomLocal}@${domain}`;
        try {
          await client.rcpt({ to: randomEmail });
          catchAll = true;
        } catch {
          // Not catch-all
        }

        await client.quit();
        break;
      } catch {
        // Try next MX
      }
    }

    return {
      exists: mailboxExists,
      greylisted: lastGrey,
      catch_all: catchAll
    };
  }

  async verify(email) {
  email = email.trim().toLowerCase();

  const syntax = this.validateSyntax(email);
  if (!syntax.valid) {
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

  const domainR = await this.validateDomain(email);
  const domain = domainR.domain ?? email.split("@")[1];
  const local = email.split("@")[0] || "";

  const disposable = this.detectDisposable(domain);
  const role = this.detectRoleBased(local);

  let mailbox = { exists: null, greylisted: false, catch_all: false };

  if (domainR.mx?.length > 0) {
    mailbox = await this.checkMailbox(email, domainR.mx);
    if (mailbox.exists !== true) {
      mailbox.exists = false;
    }
  } else {
    mailbox.exists = false; // ✅ ← This ensures fallback when no MX
  }

  const data = {
    syntax_valid: true,
    domain_valid: domainR.valid,
    mailbox_exists: mailbox.exists,
    catch_all: mailbox.catch_all,
    disposable,
    role_based: role,
    greylisted: mailbox.greylisted
  };

  const score = this.computeScore(data);

  let status = "valid";
  if (!domainR.valid || mailbox.exists === false || score < 40) {
    status = "invalid";
  } else if (disposable || role || score < 60) {
    status = "risky";
  }

  return {
    email,
    status,
    score,
    ...data
  };
}
}