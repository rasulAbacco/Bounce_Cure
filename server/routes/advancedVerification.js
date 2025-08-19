import dns from "dns/promises";
import net from "net";
import disposableDomains from "./disposableDomains.js";
import { randomUUID } from "crypto";

const ROLE_BASED = [
  "info", "sales", "support", "admin", "contact", "billing", "help", "office",
  "noreply", "no-reply", "donotreply", "do-not-reply", "webmaster", "postmaster",
  "abuse", "security", "privacy", "legal", "compliance", "marketing", "hr",
  "careers", "jobs", "recruitment", "finance", "accounting", "invoice", "orders"
];

const COMMON_INVALID_PATTERNS = [
  /test\d*@/i,
  /sample\d*@/i,
  /example\d*@/i,
  /dummy\d*@/i,
  /fake\d*@/i,
  /invalid\d*@/i,
  /temp\d*@/i,
  /placeholder\d*@/i
];

const SUSPICIOUS_DOMAINS = [
  "example.com", "example.org", "example.net",
  "test.com", "localhost.com", "domain.com"
];

export default class AdvancedVerifier {
  constructor({
    dnsTimeout = 5000,
    smtpTimeout = 8000,
    maxRetries = 5,
    concurrency = 3
  } = {}) {
    this.dnsTimeout = dnsTimeout;
    this.smtpTimeout = smtpTimeout;
    this.maxRetries = maxRetries;
    this.concurrency = concurrency;
    this.dnsCache = new Map();
    this.smtpConnectionPool = new Map();
    this.stats = {
      totalVerifications: 0,
      cacheHits: 0,
      retries: 0,
      greylisted: 0,
      timeouts: 0
    };
  }

  validateSyntax(email) {
    try {
      const basicRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
      if (!basicRegex.test(email)) return { valid: false, reason: "Invalid format" };

      const [local, domain] = email.split("@");
      if (!local || !domain) return { valid: false, reason: "Missing local or domain" };

      if (local.length > 64) return { valid: false, reason: "Local part too long" };
      if (email.length > 254) return { valid: false, reason: "Email too long" };
      if (domain.length > 253) return { valid: false, reason: "Domain too long" };

      if (local.startsWith('.') || local.endsWith('.')) return { valid: false, reason: "Local part starts/ends with dot" };
      if (local.includes('..')) return { valid: false, reason: "Consecutive dots in local part" };

      const domainParts = domain.split('.');
      if (domainParts.some(part => part.length === 0 || part.length > 63)) return { valid: false, reason: "Invalid domain part length" };
      if (domainParts[domainParts.length - 1].length < 2) return { valid: false, reason: "TLD too short" };

      for (const pattern of COMMON_INVALID_PATTERNS) {
        if (pattern.test(email)) return { valid: false, reason: "Suspicious pattern detected" };
      }

      if (SUSPICIOUS_DOMAINS.includes(domain.toLowerCase())) return { valid: false, reason: "Suspicious domain" };

      return { valid: true, reason: "Valid syntax" };
    } catch {
      return { valid: false, reason: "Syntax validation error" };
    }
  }

  async validateDomain(email) {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return { domain: null, valid: false, mx: [], reason: "No domain" };

    if (this.dnsCache.has(domain)) {
      this.stats.cacheHits++;
      return this.dnsCache.get(domain);
    }

    const result = { domain, valid: false, mx: [], reason: "Unknown" };

    try {
      const originalTimeout = dns.timeout;
      dns.timeout = this.dnsTimeout;

      try {
        const mxRecords = await dns.resolveMx(domain);
        if (mxRecords && mxRecords.length > 0) {
          result.valid = true;
          result.mx = mxRecords.sort((a, b) => a.priority - b.priority);
          result.reason = "MX records found";
        }
      } catch {
        try {
          await dns.resolve4(domain);
          result.valid = true;
          result.mx = [{ exchange: domain, priority: 0 }];
          result.reason = "A record found (no MX)";
        } catch {
          try {
            await dns.resolve6(domain);
            result.valid = true;
            result.mx = [{ exchange: domain, priority: 0 }];
            result.reason = "AAAA record found (no MX/A)";
          } catch {
            result.reason = "No DNS records found";
          }
        }
      }

      dns.timeout = originalTimeout;
    } catch (error) {
      result.reason = `DNS error: ${error.message}`;
    }

    this.dnsCache.set(domain, result);
    setTimeout(() => this.dnsCache.delete(domain), 300000);

    return result;
  }

  async verifySMTP(email, host, retryCount = 0) {
    if (retryCount >= this.maxRetries) {
      return { exists: false, greylisted: false, reason: "Max retries exceeded" };
    }

    try {
      return await this._performSMTPCheck(email, host);
    } catch (error) {
      this.stats.retries++;

      if (error.greylisted && retryCount < this.maxRetries) {
        const delay = Math.min(2000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.verifySMTP(email, host, retryCount + 1);
      }

      if (error.timeout) {
        this.stats.timeouts++;
        return { exists: false, greylisted: false, reason: "SMTP timeout" };
      }

      return { exists: false, greylisted: error.greylisted || false, reason: error.message || "SMTP error" };
    }
  }

  _performSMTPCheck(email, host) {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(25, host);
      let step = 0;
      let response = "";
      let greylisted = false;
      let mailboxExists = false;
      let completed = false;

      const commands = [
        `HELO verifier-${Date.now()}.com\r\n`,
        `MAIL FROM:<verify@verifier-${Date.now()}.com>\r\n`,
        `RCPT TO:<${email}>\r\n`,
        `QUIT\r\n`,
      ];

      const timeout = setTimeout(() => {
        if (!completed) {
          completed = true;
          socket.destroy();
          const error = new Error("SMTP timeout");
          error.timeout = true;
          error.greylisted = greylisted;
          reject(error);
        }
      }, this.smtpTimeout);

      const cleanup = () => {
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          socket.destroy();
        }
      };

      socket.on("data", (data) => {
        if (completed) return;
        
        response += data.toString();
        const lines = response.split("\r\n");
        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith("421") || line.startsWith("451") || 
              line.includes("try again") || line.includes("temporary failure") ||
              line.includes("greylisted") || line.includes("rate limit")) {
            greylisted = true;
            this.stats.greylisted++;
          }

          if (step === 2 && (line.startsWith("250") || line.startsWith("251"))) mailboxExists = true;
          if (step === 2 && (line.startsWith("550") || line.startsWith("551") || line.startsWith("553") ||
              line.includes("no such user") || line.includes("user unknown") || line.includes("invalid recipient"))) {
            mailboxExists = false;
          }
        }

        if (response.endsWith("\r\n")) {
          if (step < commands.length) {
            try {
              socket.write(commands[step]);
              step++;
              response = "";
            } catch (writeError) {
              cleanup();
              const error = new Error(`SMTP write error: ${writeError.message}`);
              error.greylisted = greylisted;
              reject(error);
            }
          } else {
            cleanup();
            resolve({ exists: mailboxExists, greylisted, reason: mailboxExists ? "Mailbox exists" : "Mailbox not found" });
          }
        }
      });

      socket.on("error", (error) => {
        if (!completed) {
          cleanup();
          const smtpError = new Error(`SMTP connection error: ${error.message}`);
          smtpError.greylisted = greylisted;
          reject(smtpError);
        }
      });

      socket.on("close", () => {
        if (!completed) {
          cleanup();
          resolve({ exists: mailboxExists, greylisted, reason: "Connection closed" });
        }
      });

      socket.on("timeout", () => {
        if (!completed) {
          cleanup();
          const error = new Error("Socket timeout");
          error.timeout = true;
          error.greylisted = greylisted;
          reject(error);
        }
      });
    });
  }

  async detectCatchAll(domain, mxHosts) {
    if (!mxHosts || mxHosts.length === 0) return false;
    const host = mxHosts[0].exchange || mxHosts[0];
    const testEmails = [
      `${randomUUID().slice(0, 8)}@${domain}`,
      `${randomUUID().slice(0, 8)}@${domain}`,
      `nonexistent-${Date.now()}@${domain}`
    ];

    try {
      const results = await Promise.allSettled(testEmails.map(email => this.verifySMTP(email, host)));
      const successCount = results.filter(r => r.status === "fulfilled" && r.value.exists).length;
      return successCount >= 2;
    } catch {
      return false;
    }
  }

  detectDisposable(domain) {
    const lowerDomain = domain.toLowerCase();
    if (disposableDomains.includes(lowerDomain)) return true;

    const disposablePatterns = [
      /^\d+mail\./,
      /temp.*mail/,
      /mail.*temp/,
      /trash.*mail/,
      /throwaway/,
      /disposable/,
      /guerrilla/,
      /^[a-z0-9]{6,12}\.(tk|ml|ga|cf)$/,
    ];

    return disposablePatterns.some(pattern => pattern.test(lowerDomain));
  }

  detectRoleBased(local) {
    const lowerLocal = local.toLowerCase();
    if (ROLE_BASED.includes(lowerLocal)) return true;

    const rolePatterns = [
      /^(info|support|sales|admin|help|contact)\d*$/,
      /^(no-?reply|donotreply)$/,
      /^(postmaster|webmaster|abuse|security)$/,
    ];

    return rolePatterns.some(pattern => pattern.test(lowerLocal));
  }

  computeScore(data) {
    let score = 100;
    let penalties = [];

    if (!data.syntax_valid) { score -= 50; penalties.push("Invalid syntax (-50)"); }
    if (!data.domain_valid) { score -= 40; penalties.push("Invalid domain (-40)"); }
    if (!data.mailbox_exists) { score -= 35; penalties.push("Mailbox not found (-35)"); }
    if (data.disposable) { score -= 30; penalties.push("Disposable email (-30)"); }
    if (data.catch_all) { score -= 20; penalties.push("Catch-all domain (-20)"); }
    if (data.role_based) { score -= 15; penalties.push("Role-based email (-15)"); }
    if (data.greylisted) { score -= 10; penalties.push("Greylisted (-10)"); }

    const finalScore = Math.max(Math.min(score, 100), 0);

    return {
      score: finalScore,
      penalties,
      confidence: this._calculateConfidence(data, finalScore)
    };
  }

  _calculateConfidence(data, score) {
    if (data.syntax_valid && data.domain_valid && data.mailbox_exists && !data.disposable) return "high";
    if (score >= 70) return "medium";
    if (score >= 50) return "low";
    return "very_low";
  }

  async verify(email) {
    this.stats.totalVerifications++;
    const startTime = Date.now();

    try {
      email = email.toLowerCase().trim();

      const syntaxResult = this.validateSyntax(email);
      const domainResult = syntaxResult.valid ? await this.validateDomain(email) : { valid: false, mx: [], domain: email.split('@')[1] };
      const domain = domainResult.domain || email.split("@")[1];
      const local = email.split("@")[0] || "";

      const disposable = this.detectDisposable(domain);
      const role_based = this.detectRoleBased(local);

      let mailbox_exists = false;
      let greylisted = false;
      let catch_all = false;
      let smtpReason = "Not checked";

      if (syntaxResult.valid && domainResult.valid && !disposable) {
        const smtpResult = await this.verifySMTP(email, domainResult.mx[0]?.exchange || domain);
        mailbox_exists = smtpResult.exists;
        greylisted = smtpResult.greylisted;
        smtpReason = smtpResult.reason;

        if (mailbox_exists) {
          catch_all = await this.detectCatchAll(domain, domainResult.mx);
        }
      }

      const verificationData = { syntax_valid: syntaxResult.valid, domain_valid: domainResult.valid, mailbox_exists, catch_all, disposable, role_based, greylisted };
      const scoreResult = this.computeScore(verificationData);

      let status = "valid";
      if (!syntaxResult.valid || !domainResult.valid) status = "invalid";
      else if (disposable || scoreResult.score < 50) status = "risky";
      else if (!mailbox_exists || scoreResult.score < 70) status = "invalid";

      const processingTime = Date.now() - startTime;

      return { email, status, score: scoreResult.score, confidence: scoreResult.confidence, processing_time_ms: processingTime, ...verificationData, details: { syntax_reason: syntaxResult.reason, domain_reason: domainResult.reason, smtp_reason: smtpReason, penalties: scoreResult.penalties }, timestamp: new Date().toISOString() };
    } catch (error) {
      return { email, status: "error", score: 0, confidence: "none", processing_time_ms: Date.now() - startTime, syntax_valid: false, domain_valid: false, mailbox_exists: false, catch_all: false, disposable: false, role_based: false, greylisted: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  getStats() {
    return { ...this.stats, cacheSize: this.dnsCache.size, uptime: process.uptime(), memoryUsage: process.memoryUsage() };
  }

  clearCache() {
    this.dnsCache.clear();
    this.smtpConnectionPool.clear();
  }
}