// advancedVerification.js
import dns from "dns/promises";
import disposableDomains from "./disposableDomains.js";
import { SMTPClient } from "smtp-client";
import crypto from "crypto";
import axios from 'axios';

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

const MAILS_SO_API_URL = "https://api.mails.so/v1";
const MAILS_SO_API_KEY = process.env.MAILS_SO_API_KEY;

if (!MAILS_SO_API_KEY) {
  throw new Error("MAILS_SO_API_KEY environment variable is required");
}

class AdvancedVerifier {
  constructor({ dnsTimeout = 5000, smtpTimeout = 8000, retryGreylist = 1 } = {}) {
    this.dnsTimeout = dnsTimeout;
    this.smtpTimeout = smtpTimeout;
    this.retryGreylist = retryGreylist;
    this.dnsCache = new Map();
    this.axiosInstance = axios.create({
      baseURL: MAILS_SO_API_URL,
      headers: {
        "X-Mails-Api-Key": MAILS_SO_API_KEY,
        "Content-Type": "application/json"
      },
      timeout: 10000
    });
  }

  // Helper function to make Mails.so API requests
  async _makeApiRequest(endpoint, method = "GET", data = null, options = {}) {
    try {
      const config = { method, url: endpoint, ...options };

      if (data) {
        config.data = data;
      }

      const response = await this.axiosInstance(config);
      return response.data;
    } catch (error) {
      console.error("API error response:", error.response?.data);
      throw new Error(`Mails.so API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Verify single email with Mails.so
  async verifySingleWithMailsSo(email) {
    try {
      const endpoint = '/validate'; // Correct endpoint for single email validation
      const params = { email };

      // Make the GET request with query params
      const result = await this._makeApiRequest(endpoint, 'GET', null, { params });

      // Validate response format
      if (!result || typeof result !== 'object' || !result.data) {
        throw new Error('Invalid API response format');
      }

      const data = result.data;

      // Map API response fields to internal format
      return {
        email: data.email || email,
        syntax_valid: data.isv_format ?? false,
        domain_valid: data.isv_domain ?? false,
        mailbox_exists: data.isv_mx ?? false,
        disposable: data.is_disposable ?? false,
        role_based: !data.isv_nogeneric ?? false,
        catch_all: !data.isv_nocatchall ?? false,
        greylisted: false, // Not provided in this API response, default to false
        score: data.score ?? 0,
        mx: data.mx_record ? [data.mx_record] : []
      };
    } catch (err) {
      console.error('[Mails.so] Verification error:', err.message);
      return {
        email,
        status: 'invalid',
        score: 0,
        syntax_valid: false,
        domain_valid: false,
        mailbox_exists: false,
        catch_all: false,
        disposable: false,
        role_based: false,
        greylisted: false,
        error: err.message
      };
    }
  }

  // Create batch with Mails.so
  async createBatchWithMailsSo(emails) {
    if (!emails.length) {
      throw new Error("Emails array is empty");
    }

    const endpoint = "/batch";
    const headers = {
      'x-mails-api-key': MAILS_SO_API_KEY,
      'Content-Type': 'application/json'
    };
    const data = { emails };
    console.log("Batch request payload:", JSON.stringify(data, null, 2));

    try {
      const result = await this._makeApiRequest(endpoint, "POST", data, { headers });

      console.log("Batch creation response:", JSON.stringify(result, null, 2));

      // Use 'id' from response
      return result.id;
    } catch (err) {
      console.error("Batch creation failed:", err.message);
      if (err.response) {
        console.error("API response:", err.response.data);
      }
      throw err;
    }
  }

  // Get batch status from Mails.so
  async getBatchStatusWithMailsSo(batchId) {
    const endpoint = `/batch/${batchId}`;
    return await this._makeApiRequest(endpoint);
  }

  // Get batch results from Mails.so
  async getBatchResultsWithMailsSo(batchId) {
    console.log(`[getBatchResultsWithMailsSo] Fetching results for batchId: ${batchId}`);

    // Call your API to get batch info
    const batchInfo = await this._makeApiRequest(`/batch/${batchId}`);

    console.log('[getBatchResultsWithMailsSo] API response:', batchInfo);

    if (!batchInfo.emails || !Array.isArray(batchInfo.emails)) {
      throw new Error("Batch results not ready or missing 'emails' array");
    }

    // Map through the email results and normalize output
    return batchInfo.emails.map(item => {
      const score = item.score ?? 0;

      // Compute status using same rules as verify()
      let status = "valid";
      if (!item.isv_domain || item.isv_mx === false || score < 40) {
        status = "invalid";
      } else if (item.is_disposable || score < 60) {
        status = "risky";
      }

      return {
        email: item.email,
        syntax_valid: item.isv_format ?? false,
        domain_valid: item.isv_domain ?? false,
        mailbox_exists: item.isv_mx ?? false,
        disposable: item.is_disposable ?? false,
        role_based: !item.isv_nogeneric,
        catch_all: !item.isv_nocatchall,
        greylisted: false,
        score,
        status,   // ✅ now correctly set
        mx: item.mx_record ? [item.mx_record] : []
      };
    });
  }

  // Wait for batch completion with polling
  async waitForBatchCompletion(batchId, maxAttempts = 12, interval = 5000) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      const status = await this.getBatchStatusWithMailsSo(batchId);

      if (status.status === "completed") {
        return await this.getBatchResultsWithMailsSo(batchId);
      }

      if (status.status === "failed") {
        throw new Error("Batch processing failed");
      }

      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }

    throw new Error("Batch processing timed out");
  }

  // Removed manual validateSyntax()

  // Main verify method updated to rely on Mails.so syntax validation only
  async verify(email, options = {}) {
    email = email.trim().toLowerCase();

    try {
      const mailsSoResult = await this.verifySingleWithMailsSo(email);

      const data = {
        syntax_valid: mailsSoResult.syntax_valid,
        domain_valid: mailsSoResult.domain_valid,
        mailbox_exists: mailsSoResult.mailbox_exists,
        catch_all: mailsSoResult.catch_all,
        disposable: mailsSoResult.disposable,
        role_based: mailsSoResult.role_based,
        greylisted: mailsSoResult.greylisted
      };

      const score = this.computeScore({ ...data, score: mailsSoResult.score });

      let status = "valid";
      if (!mailsSoResult.syntax_valid || !mailsSoResult.domain_valid || mailsSoResult.mailbox_exists === false || score < 40) {
        status = "invalid";
      } else if (mailsSoResult.disposable || score < 60) {
        status = "risky";
      }

      return {
        email,
        status,
        score,
        ...data,
        mx: mailsSoResult.mx
      };
    } catch (err) {
      console.error("[Mails.so] Verification error:", err.message);
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
        greylisted: false,
        error: err.message
      };
    }
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
}

export default AdvancedVerifier;
