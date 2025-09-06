// advancedVerification.js
import dns from "dns/promises";
import disposableDomains from "./disposableDomains.js";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";
import http from "http";
import https from "https";

dotenv.config();

const SG_EMAIL_VAL_API_KEY = process.env.SG_EMAIL_VAL_API_KEY;

// ---- Tunables ----
const DEFAULTS = {
  dnsTimeout: 2000,
  smtpTimeout: 3000,
  retryGreylist: 0,
  cacheTtlMs: 30 * 60 * 1000,
  sgConcurrency: 200,
};

const ROLE_BASED = new Set([
  "info", "sales", "support", "admin", "contact", "billing", "help", "office", "noreply", "no-reply",
  "donotreply", "do-not-reply", "webmaster", "postmaster", "abuse", "security", "privacy", "legal",
  "compliance", "marketing", "hr", "careers", "jobs", "recruitment", "finance", "accounting",
  "invoice", "orders"
]);

const COMMON_INVALID_PATTERNS = [
  /test\d*@/i, /sample\d*@/i, /example\d*@/i, /dummy\d*@/i,
  /fake\d*@/i, /invalid\d*@/i, /temp\d*@/i, /placeholder\d*@/i
];

const SUSPICIOUS_DOMAINS = new Set([
  "example.com", "example.org", "example.net", "test.com", "domain.com"
]);

// Reuse HTTP connections
const keepAliveHttpAgent = new http.Agent({ keepAlive: true, maxSockets: 1000 });
const keepAliveHttpsAgent = new https.Agent({ keepAlive: true, maxSockets: 1000 });

// Simple concurrency limiter
function limiter(max) {
  let active = 0, queue = [];
  const next = () => {
    if (active >= max || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn().then((v) => { active--; resolve(v); next(); })
      .catch((e) => { active--; reject(e); next(); });
  };
  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject }); next();
  });
}

const sgLimit = limiter(DEFAULTS.sgConcurrency);

export default class AdvancedVerifier {
  constructor(opts = {}) {
    const {
      dnsTimeout = DEFAULTS.dnsTimeout,
      smtpTimeout = DEFAULTS.smtpTimeout,
      retryGreylist = DEFAULTS.retryGreylist,
      cacheTtlMs = DEFAULTS.cacheTtlMs,
      sgConcurrency = DEFAULTS.sgConcurrency,
    } = opts;

    this.dnsTimeout = dnsTimeout;
    this.smtpTimeout = smtpTimeout;
    this.retryGreylist = retryGreylist;
    this.cacheTtlMs = cacheTtlMs;
    this.sgLimit = sgConcurrency !== DEFAULTS.sgConcurrency ? limiter(sgConcurrency) : sgLimit;

    this.dnsCache = new Map();
    this.smtpDomainCache = new Map();
  }

  // ---------- Helpers ----------
  validateSyntax(email) {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (!regex.test(email)) return { valid: false };

    const [local, domain] = email.split("@");
    if (!local || !domain) return { valid: false };
    if (local.length > 64 || email.length > 254) return { valid: false };
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return { valid: false };
    if (COMMON_INVALID_PATTERNS.some(p => p.test(email))) return { valid: false };
    if (SUSPICIOUS_DOMAINS.has(domain.toLowerCase())) return { valid: false };

    return { valid: true };
  }

  _getCache(map, key) {
    const v = map.get(key);
    if (!v) return null;
    if (Date.now() - v.ts > this.cacheTtlMs) { map.delete(key); return null; }
    return v.value;
  }

  _setCache(map, key, value) {
    map.set(key, { value, ts: Date.now() });
  }

  async validateDomain(email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return { domain: null, valid: false, mx: [] };

    const c = this._getCache(this.dnsCache, domain);
    if (c) return c;

    const result = { domain, valid: false, mx: [], usedFallback: false };

    try {
      const mx = await Promise.race([
        dns.resolveMx(domain),
        new Promise((_, rej) => setTimeout(() => rej(new Error("DNS MX Timeout")), this.dnsTimeout))
      ]);

      if (mx && mx.length) {
        result.valid = true;
        result.mx = mx.sort((a, b) => a.priority - b.priority).map(m => m.exchange);
      }
    } catch {
      // Fallback: check A or AAAA (RFC 5321 allows this)
      try {
        await Promise.race([
          dns.resolve4(domain),
          dns.resolve6(domain),
          new Promise((_, rej) => setTimeout(() => rej(new Error("DNS A Timeout")), this.dnsTimeout))
        ]);
        result.valid = true;
        result.usedFallback = true; // risky, but not invalid
      } catch {
        result.valid = false;
      }
    }

    this._setCache(this.dnsCache, domain, result);
    return result;
  }

  detectDisposable(domain) {
    domain = domain.toLowerCase();
    if (disposableDomains.includes(domain)) return true;
    return /(?:temp|trash|disposable|10min|guerrilla|yopmail)/i.test(domain);
  }

  detectRoleBased(local) {
    local = local.toLowerCase();
    if (ROLE_BASED.has(local)) return true;
    return /^(info|support|sales|admin|contact|hello|team|office|help|hr|marketing)\b/i.test(local);
  }

  computeScore(d) {
    let s = 100;
    if (!d.syntax_valid) s -= 50;
    if (!d.domain_valid) s -= 50;
    if (d.usedFallback) s -= 15; // Fallback = risky
    if (d.mailbox_exists === false) s -= 100;
    if (d.disposable) s -= 35;
    if (d.role_based) s -= 20;
    if (d.catch_all) s -= 20;
    if (d.greylisted) s -= 10;
    return Math.max(0, Math.min(s, 100));
  }

  async validateWithSendGrid(email) {
    if (!SG_EMAIL_VAL_API_KEY) return null;
    const doCall = async () => {
      const res = await fetch("https://api.sendgrid.com/v3/validations/email", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SG_EMAIL_VAL_API_KEY}`,
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
        agent: (parsedURL) => parsedURL.protocol === 'http:' ? keepAliveHttpAgent : keepAliveHttpsAgent,
        body: JSON.stringify({ email, source: "verification" }),
      });

      if (!res.ok) {
        let msg = res.statusText;
        try {
          const errJson = await res.json();
          msg = errJson?.errors ? JSON.stringify(errJson.errors) : msg;
        } catch { }
        throw new Error(`SendGrid API error: ${res.status} - ${msg}`);
      }
      const data = await res.json();
      return data?.result || null;
    };

    try {
      return await this.sgLimit(doCall);
    } catch {
      return null;
    }
  }

  // ---------- Main verify ----------
  async verify(email, options = {}) {
    const { smtpCheck = false } = options;
    const normalized = (email || "").trim().toLowerCase();

    if (!normalized) {
      return {
        email: "",
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

    const syntax = this.validateSyntax(normalized);
    if (!syntax.valid) {
      return {
        email: normalized,
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

    const [domainR, sgResult] = await Promise.all([
      this.validateDomain(normalized),
      this.validateWithSendGrid(normalized)
    ]);

    const domain = domainR.domain ?? normalized.split("@")[1];
    const local = normalized.split("@")[0] || "";

    const disposable = this.detectDisposable(domain);
    const role = this.detectRoleBased(local);

    let mailbox_exists = null;
    let catch_all = false;
    let greylisted = false;

    if (sgResult) {
      if (typeof sgResult.is_valid === "boolean") mailbox_exists = sgResult.is_valid;
      if (typeof sgResult.is_catch_all_address === "boolean") catch_all = sgResult.is_catch_all_address;
      if (sgResult.has_valid_mx === false) {
        domainR.valid = false;
        domainR.mx = [];
      }
    }

    const data = {
      syntax_valid: true,
      domain_valid: domainR.valid,
      usedFallback: domainR.usedFallback,
      mailbox_exists,
      catch_all,
      disposable,
      role_based: role,
      greylisted
    };

    const score = this.computeScore(data);

    let status = "valid";
    if (!domainR.valid) status = "invalid";
    else if (mailbox_exists === false) status = "invalid";
    else if (disposable || role || catch_all || domainR.usedFallback || score < 60) status = "risky";

    return {
      email: normalized,
      status,
      score,
      ...data,
      mx: domainR.mx
    };
  }
  getStats() {
    return {
      dnsCacheSize: this.dnsCache.size,
      smtpCacheSize: this.smtpDomainCache.size,
      settings: {
        dnsTimeout: this.dnsTimeout,
        smtpTimeout: this.smtpTimeout,
        retryGreylist: this.retryGreylist,
        cacheTtlMs: this.cacheTtlMs,
      },
      timestamp: new Date().toISOString(),
    };
  }

}
