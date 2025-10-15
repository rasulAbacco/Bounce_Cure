// server/services/imapSync.js
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { google } from "googleapis";
import { ConfidentialClientApplication } from "@azure/msal-node";
import fetch from "node-fetch";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import axios from "axios"; // add this if missing

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const prisma = new PrismaClient();

/**
 * -----------------------
 * SendGrid email sending
 * -----------------------
 */
export async function sendEmailWithSendGrid({ to, subject, text, html }) {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER, // Verified sender
      subject,
      text,
      html,
    };

    const response = await sgMail.send(msg);
    console.log(`📤 Sent email to ${to} | Status: ${response[0].statusCode}`);
    return true;
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.body || error.message);
    return false;
  }
}

/**
 * Send and update email in Prisma
 */
export async function sendAndUpdateEmail(emailId) {
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) return;

  const sent = await sendEmailWithSendGrid({
    to: email.to,
    subject: email.subject,
    text: email.body,
    html: email.bodyHtml,
  });

  await prisma.email.update({
    where: { id: emailId },
    data: {
      status: sent ? "SENT" : "FAILED",
      updatedAt: new Date(),
    },
  });
}

/**
 * -----------------------
 * Save email safely with account validation
 * -----------------------
 */
export async function saveEmail(prisma, emailData, accountId) {
  try {
    // ✅ Validate that the account exists before attempting to save
    const accountExists = await prisma.emailAccount.findUnique({
      where: { id: accountId },
      select: { id: true } // Only select id for minimal data transfer
    });

    if (!accountExists) {
      console.error(`❌ Cannot save email: EmailAccount with id ${accountId} not found`);
      throw new Error(`EmailAccount with id ${accountId} does not exist`);
    }

    await prisma.email.upsert({
      where: { messageId: emailData.messageId },
      update: {}, // Do nothing if exists
      create: {
        messageId: emailData.messageId || `no-id-${Date.now()}`,
        from: emailData.from || "unknown",
        to: emailData.to || "unknown",
        subject: emailData.subject || "(no subject)",
        body: emailData.body || "",
        bodyHtml: emailData.bodyHtml || "",
        date: emailData.date || new Date(),
        folder: emailData.folder || "INBOX",
        source: emailData.source || "imap",
        status: emailData.status || "unread",
        tags: emailData.tags || [],
        threadId: emailData.threadId || null,
        inReplyTo: emailData.inReplyTo || null,
        isReply: emailData.isReply || false,
        account: { connect: { id: accountId } },
      },
    });
    
    console.log(`✅ Saved email: ${emailData.subject} for account ${accountId}`);
  } catch (err) {
    if (err.code === 'P2025') {
      console.error(`❌ Failed to save email: EmailAccount ${accountId} not found`);
    } else {
      console.error("❌ Failed to save email:", err.message);
    }
    throw new Error(`Failed to create email: ${err.message}`);
  }
}
/**
 * -----------------------
 * Email skip logic
 * -----------------------
 */
function shouldSkipEmail(subject, from) {
  const unwantedSubjects = [
    "Delivery Status Notification",
    "Undelivered Mail Returned to Sender",
    "Mail Delivery Failure",
    "Failure Notice",
    "Returned mail",
  ];

  const unwantedSenders = ["mailer-daemon@", "postmaster@", "no-reply@"];

  const subjectLower = (subject || "").toLowerCase();
  if (unwantedSubjects.some((s) => subjectLower.includes(s.toLowerCase())))
    return true;

  const fromLower = (from || "").toLowerCase();
  if (unwantedSenders.some((addr) => fromLower.includes(addr.toLowerCase())))
    return true;

  return false;
}

/**
 * -----------------------
 * OAuth2 Tokens
 * -----------------------
 */
async function getOAuth2AccessToken(account) {
  const { provider, oauthClientId, oauthClientSecret, refreshToken } = account;

  if (!provider || !oauthClientId || !oauthClientSecret) {
    throw new Error("Missing OAuth2 credentials");
  }

  switch (provider) {
    case "gmail":
      return getGmailAccessToken(oauthClientId, oauthClientSecret, refreshToken);
    case "outlook":
      return getOutlookAccessToken(oauthClientId, oauthClientSecret);
    case "zoho":
      return getZohoAccessToken(oauthClientId, oauthClientSecret, refreshToken);
    case "rediff":
      return getRediffAccessToken(oauthClientId, oauthClientSecret, refreshToken);
    case "amazon":
      return getAmazonAccessToken(oauthClientId, oauthClientSecret, refreshToken);
    default:
      throw new Error(`Unsupported OAuth2 provider: ${provider}`);
  }
}

/**
 * Gmail OAuth2
 */
async function getGmailAccessToken(clientId, clientSecret, refreshToken) {
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  try {
    const { token } = await oAuth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error("❌ Gmail token refresh failed:", error.message);
    throw error;
  }
}

/**
 * Outlook OAuth2
 */

// ---------------- OUTLOOK TOKEN REFRESH ----------------




/**
 * Refresh and return a valid Outlook access token.
 * Also updates refresh_token in DB if Microsoft rotates it.
 */
export async function getOutlookAccessToken(account, prisma) {
  try {
    const { refreshToken, oauthClientId, oauthClientSecret, id } = account;

    // 🧩 Validate required OAuth fields
    if (!refreshToken || !oauthClientId || !oauthClientSecret) {
      console.error("❌ [Outlook] Missing OAuth params:", {
        hasRefresh: !!refreshToken,
        hasClientId: !!oauthClientId,
        hasSecret: !!oauthClientSecret,
      });
      throw new Error("Missing Outlook OAuth params");
    }

    // 🏗️ Prepare request payload
    const params = new URLSearchParams({
      client_id: oauthClientId,
      client_secret: oauthClientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      redirect_uri:
        process.env.OUTLOOK_REDIRECT_URI ||
        "http://localhost:5173/oauth/outlook/callback",
      scope: [
        "offline_access",
        "openid",
        "email",
        "profile",
        "https://outlook.office365.com/IMAP.AccessAsUser.All",
        "https://outlook.office365.com/SMTP.Send",
      ].join(" "),
    });

    // 🌍 Request new access token
    const res = await axios.post(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!res.data?.access_token)
      throw new Error("No access_token returned from Microsoft");

    const newAccessToken = res.data.access_token;
    const newRefreshToken = res.data.refresh_token;

    console.log("✅ [Outlook] Refreshed access token OK");

    // 🔁 Save rotated refresh token if provided
    if (newRefreshToken && prisma) {
      try {
        await prisma.emailAccount.update({
          where: { id },
          data: { refreshToken: newRefreshToken },
        });
        console.log("🔄 [Outlook] Refresh token updated in DB");
      } catch (dbErr) {
        console.error("⚠ Failed to update new refresh token:", dbErr.message);
      }
    } else if (!newRefreshToken) {
      console.log("ℹ️ [Outlook] No new refresh token returned (Microsoft did not rotate it).");
    }

    // ✅ Return usable access token
    return newAccessToken;

  } catch (err) {
    console.error("❌ [Outlook] Token refresh failed:", err.response?.data || err.message);
    throw err;
  }
}




/**
 * Zoho / Rediff / Amazon generic token fetch
 */
async function fetchAccessToken(url, params) {
  const body = new URLSearchParams(params);
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }
  const data = await response.json();
  return data.access_token;
}

async function getZohoAccessToken(clientId, clientSecret, refreshToken) {
  return fetchAccessToken("https://accounts.zoho.com/oauth/v2/token", {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

}

async function getRediffAccessToken(clientId, clientSecret, refreshToken) {
  return fetchAccessToken("https://oauth.rediff.com/oauth/token", {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });
}

async function getAmazonAccessToken(clientId, clientSecret, refreshToken) {
  return fetchAccessToken("https://api.amazon.com/auth/o2/token", {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token,
    grant_type: "refresh_token",
  });
}

/**
 * -----------------------
 * Sync functions
 * -----------------------
 */

// Gmail API sync
async function syncGmailAPI(prisma, account) {
  const oAuth2Client = new google.auth.OAuth2(
    account.oauthClientId,
    account.oauthClientSecret
  );
  oAuth2Client.setCredentials({ refresh_token: account.refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const res = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
    q: "in:inbox newer_than:30d",
  });

  if (!res.data.messages) return;

  for (const msg of res.data.messages) {
    const fullMsg = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const headers = fullMsg.data.payload.headers;
    const subject = headers.find((h) => h.name === "Subject")?.value || "(no subject)";
    const from = headers.find((h) => h.name === "From")?.value?.split("<").pop()?.replace(">", "") || "unknown";
    const to = headers.find((h) => h.name === "To")?.value?.split("<").pop()?.replace(">", "") || "unknown";
    const inReplyTo = headers.find((h) => h.name === "In-Reply-To")?.value || null;
    const references = headers.find((h) => h.name === "References")?.value || null;
    const isReply = !!inReplyTo;
    const threadId = references ? references.split(" ")[0]?.replace(/[<>]/g, "") : inReplyTo?.replace(/[<>]/g, "") || null;
    const body = fullMsg.data.snippet || Buffer.from(fullMsg.data.payload?.body?.data || "", "base64").toString();

    const emailData = {
      messageId: fullMsg.data.id,
      from,
      to,
      subject,
      body,
      bodyHtml: "",
      date: new Date(parseInt(fullMsg.data.internalDate)),
      folder: "INBOX",
      source: "gmail-api",
      status: "unread",
      tags: [],
      threadId,
      inReplyTo,
      isReply,
    };

    if (!shouldSkipEmail(subject, from)) {
      await saveEmail(prisma, emailData, account.id);
      console.log(`📥 Saved via Gmail API: ${subject}`);
    }
  }
}

// Outlook API sync


async function syncOutlookAPI(prisma, account) {
  console.log(`🔄 Using Outlook IMAP for ${account.email}`);

  const accessToken = await getOutlookAccessToken(account, prisma);
  if (!accessToken) {
    console.error("❌ [Outlook] No access token available");
    return;
  }

  // Connect to Outlook IMAP using OAuth token
  const client = new ImapFlow({
    host: "outlook.office365.com",
    port: 993,
    secure: true,
    auth: {
      user: account.email,
      accessToken,
      xoauth2: true,
    },
  });

  try {
    await client.connect();
    console.log(`✅ Connected to Outlook IMAP for ${account.email}`);

    // Open Inbox
    const lock = await client.getMailboxLock("INBOX");
    try {
      let messageCount = 0;
      for await (let message of client.fetch("1:*", {
        envelope: true,
        source: true,
        bodyStructure: true,
      })) {
        const parsed = await simpleParser(message.source);
        const emailData = {
          messageId: message.envelope?.messageId || parsed.messageId,
          from: parsed.from?.text || "unknown",
          to: parsed.to?.text || "unknown",
          subject: parsed.subject || "(no subject)",
          body: parsed.text || "",
          bodyHtml: parsed.html || "",
          date: parsed.date || new Date(),
          folder: "INBOX",
          source: "outlook-imap",
          status: "unread",
          tags: [],
          threadId: null,
          inReplyTo: parsed.inReplyTo || null,
          isReply: !!parsed.inReplyTo,
        };
        await saveEmail(prisma, emailData, account.id);
        messageCount++;
      }
      console.log(`📥 Synced ${messageCount} messages via Outlook IMAP`);
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    console.error(`❌ [Outlook IMAP] Sync failed:`, err.message);
  }
}


// IMAP sync (for password auth and fallback)
async function syncImap(prisma, account) {
  let authConfig;

  // FIXED: Check authType first
  if (account.authType === "password") {
    // Use app password for authentication
    authConfig = {
      user: account.imapUser,
      pass: account.encryptedPass
    };
    console.log(`🔐 Using password auth for ${account.email}`);
  }
  // Only use OAuth if explicitly configured
  else if (account.authType === "oauth" && account.oauthClientId && account.oauthClientSecret && account.refreshToken) {
    try {
      const accessToken = await getOAuth2AccessToken(account);
      authConfig = { user: account.imapUser, accessToken };
      console.log(`🔑 Using OAuth2 for ${account.email}`);
    } catch (error) {
      console.error(`❌ OAuth2 failed for ${account.email}, falling back to IMAP:`, error.message);
      // Fall back to password if available
      if (account.encryptedPass) {
        authConfig = { user: account.imapUser, pass: account.encryptedPass };
        console.log(`🔄 Falling back to password auth for ${account.email}`);
      } else {
        throw new Error("No valid authentication method available");
      }
    }
  } else {
    throw new Error("No valid authentication method available");
  }

  let client;

  if (account.authType === 'password') {
    // Standard IMAP login with app password
    client = new ImapFlow({
      host: account.imapHost,
      port: account.imapPort,
      secure: true,
      auth: {
        user: account.imapUser,
        pass: account.encryptedPass, // ✅ direct app password
      },
      tls: {
        rejectUnauthorized: false, // helps for Zoho/Outlook SSL handshake edge cases
      },
      socketTimeout: 120000,
      authTimeout: 30000,
    });
  } else if (account.authType === 'oauth') {
    // OAuth flow (for Gmail, Zoho OAuth, etc.)
    client = new ImapFlow({
      host: account.imapHost,
      port: account.imapPort,
      secure: true,
      auth: authConfig,
      socketTimeout: 120000,
      authTimeout: 30000,
    });
  }


  client.on("error", (err) => console.error(`❌ IMAP socket error [${account.imapUser}]:`, err.message));

  try {
    await client.connect();
    console.log(`✅ Connected to IMAP for ${account.email}`);

    const lock = await client.getMailboxLock("INBOX");
    try {
      let messageCount = 0;
      for await (let message of client.fetch("1:*", { envelope: true, source: true })) {
        try {
          const parsed = await simpleParser(message.source);
          const subject = message.envelope.subject || "(no subject)";
          const from = message.envelope.from?.map((f) => f.address).join(", ") || "unknown";

          if (!shouldSkipEmail(subject, from)) {
            const inReplyTo = parsed.headers.get("in-reply-to") || null;
            const references = parsed.headers.get("references");
            const threadId = references ? references.split(" ")[0]?.replace(/[<>]/g, "") : inReplyTo?.replace(/[<>]/g, "") || null;

            const emailData = {
              messageId: message.envelope.messageId || `uid-${message.uid}-${Date.now()}`,
              from,
              to: message.envelope.to?.map((t) => t.address).join(", ") || "unknown",
              subject,
              body: parsed.text || "",
              bodyHtml: parsed.html || "",
              date: message.envelope.date || new Date(),
              folder: "INBOX",
              source: "imap",
              status: "unread",
              tags: [],
              threadId,
              inReplyTo,
              isReply: !!inReplyTo,
            };

            await saveEmail(prisma, emailData, account.id);
            console.log(`📥 Saved via IMAP: ${subject}`);
            messageCount++;
          }
        } catch (emailErr) {
          console.error(`⚠ Failed to process email: ${emailErr.message}`);
        }
      }
      console.log(`📥 Synced ${messageCount} emails for ${account.email}`);
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error(`❌ IMAP sync failed for ${account.email}:`, err.message);
    throw err;
  } finally {
    await client.logout();
  }
}

/**
 * -----------------------
 * Main sync for all accounts
 * -----------------------
 */

//server/services/imapSync.js
export async function runSync(prisma) {
  console.log("⏳ Running email sync for all accounts...");

  const accounts = await prisma.emailAccount.findMany();

  if (!accounts.length) {
    console.warn("⚠ No email accounts found in DB.");
    return;
  }

  // for (const account of accounts) {
  //   try {
  //     const { email, provider, authType } = account;

  //     if (!email || !provider || !authType) {
  //       console.warn("⚠ Skipping invalid account:", { id: account.id, email, provider, authType });
  //       continue;
  //     }

  //     // 🧠 Handle PASSWORD-based IMAP
  //     if (authType === "password") {
  //       if (!account.encryptedPass) {
  //         console.warn(`⚠ Missing password for ${email}, skipping.`);
  //         continue;
  //       }
  //       console.log(`🔄 Using password IMAP for ${email}`);
  //       await syncEmailsForAccount(prisma, account);
  //       continue;
  //     }

  //     // 🧠 Handle OAUTH-based accounts
  //     if (authType === "oauth") {
  //       if (provider === "gmail") {
  //         console.log(`🔄 Using Gmail API for ${email}`);
  //         await syncGmailAPI(prisma, account);
  //       } else if (provider === "outlook") {
  //         console.log(`🔄 Using Outlook IMAP OAuth for ${email}`);
  //         await syncEmailsForAccount(prisma, account); // uses XOAUTH2 under the hood
  //       } else {
  //         console.log(`⚠ Unknown OAuth provider for ${email}, using IMAP fallback`);
  //         await syncEmailsForAccount(prisma, account);
  //       }
  //       continue;
  //     }

  //     console.error(`❌ Unknown authType for ${email}: ${authType}`);
  //   } catch (err) {
  //     console.error(`❌ Failed sync for ${account.email}:`, err.message);
  //   }
  // }

  console.log("✅ Sync cycle finished");
}

/**
 * Sync emails for a single account
 */
export async function syncEmailsForAccount(prisma, account) {
  try {
    // FIXED: Check authType before choosing sync method
    if (account.authType === "password") {
      console.log(`🔄 Using IMAP for password-authenticated account: ${account.email}`);
      await syncImap(prisma, account);
    } else if (account.authType === "oauth") {
      if (account.provider === "gmail") {
        console.log(`🔄 Using Gmail API for OAuth account: ${account.email}`);
        await syncGmailAPI(prisma, account);
      } else if (account.provider === "outlook") {
        console.log(`🔄 Using Outlook API for OAuth account: ${account.email}`);
        await syncOutlookAPI(prisma, account);
      } else {
        console.log(`🔄 Using IMAP for OAuth account: ${account.email}`);
        await syncImap(prisma, account);
      }
    } else {
      console.error(`❌ Unknown authType for ${account.email}: ${account.authType}`);
      throw new Error(`Unknown authType: ${account.authType}`);
    }
    console.log(`✅ Sync completed for ${account.email}`);
  } catch (err) {
    console.error(`❌ Failed sync for ${account.email}:`, err.message);
    throw err;
  }
}



// helper to return access token for the account
async function fetchAccessTokenForAccount(account) {
  if (account.authType !== "oauth") return null;

  switch (account.provider) {
    case "outlook":
      return await getOutlookAccessToken(
        account.refreshToken,
        account.oauthClientId,
        account.oauthClientSecret
      );
    case "yahoo":
      return await getYahooAccessToken(
        account.refreshToken,
        account.oauthClientId,
        account.oauthClientSecret
      );
    default:
      return await getOAuth2AccessToken(account);
  }
}

function buildImapConfig(account, accessToken) {
  if (account.authType === "password") {
    return {
      user: account.imapUser,
      password: account.encryptedPass,
      host: account.imapHost,
      port: account.imapPort,
      tls: true,
      authTimeout: 15000,
    };
  }

  // XOAUTH2 flow
  const xoauth2Token = Buffer.from(
    `user=${account.imapUser}\x01auth=Bearer ${accessToken}\x01\x01`
  ).toString("base64");

  return {
    user: account.imapUser,
    xoauth2: xoauth2Token,
    host: account.imapHost,
    port: account.imapPort,
    tls: true,
    authTimeout: 15000,
  };
}

// Example connect & error handling (call from your sync function)
export async function connectImapAndSync(prisma, account) {
  let accessToken = null;

  try {
    if (account.authType === "oauth") {
      accessToken = await fetchAccessTokenForAccount(account);
      if (!accessToken) throw new Error("Failed to get Outlook access token");
    }

    const imapConfig = buildImapConfig(account, accessToken);
    const imap = new Imap(imapConfig);

    imap.once("ready", () => {
      console.log(`[imapSync] IMAP ready for ${account.email}`);
      imap.openBox("INBOX", true, (err, box) => {
        if (err) throw err;
        console.log(`[imapSync] ${account.email} INBOX opened, ${box.messages.total} messages`);
        // ... fetch or idle logic here ...
        imap.end();
      });
    });

    imap.once("error", async (err) => {
      console.error(`[imapSync] IMAP error for ${account.email}`, err);
      const msg = err.message || "";
      if (/auth/i.test(msg) || /invalid/i.test(msg)) {
        await prisma.emailAccount.update({
          where: { id: account.id },
          data: { status: "auth_failed", lastAuthError: msg.slice(0, 255) },
        });
      }
    });

    imap.once("end", () => {
      console.log(`[imapSync] IMAP connection ended for ${account.email}`);
    });

    imap.connect();
  } catch (err) {
    console.error(`[imapSync] Failed IMAP connect for ${account.email}:`, err.message);
    await prisma.emailAccount.update({
      where: { id: account.id },
      data: { status: "sync_failed", lastAuthError: err.message },
    });
  }
}

