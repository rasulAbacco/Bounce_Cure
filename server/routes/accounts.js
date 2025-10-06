// server/routes/accounts.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { runSync, sendEmailWithSendGrid, syncEmailsForAccount } from "../services/imapSync.js";
import nodemailer from "nodemailer";
import { getOAuth2AccessToken, getZohoAccessToken, getRediffAccessToken, getOutlookAccessToken } from "./accountsAuth.js";

const prisma = new PrismaClient();
const router = express.Router();

// Utility: safe async runner
const safeRun = (fn) => {
  Promise.resolve()
    .then(fn)
    .catch((err) => console.error("❌ Async error:", err));
};

// Send email via SMTP using account's SMTP settings
router.post("/send-via-smtp", async (req, res) => {
  const { accountId, to, subject, text, html, inReplyTo, references } = req.body;

  console.log("📧 Send via SMTP request received");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  if (!accountId) {
    console.error("❌ Missing accountId");
    return res.status(400).json({
      error: "accountId is required",
      received: req.body,
    });
  }

  if (!to) {
    console.error("❌ Missing 'to' field");
    return res.status(400).json({
      error: "'to' field is required",
      received: req.body,
    });
  }

  if (!subject) {
    console.error("❌ Missing subject");
    return res.status(400).json({
      error: "subject is required",
      received: req.body,
    });
  }

  if (!text && !html) {
    console.error("❌ Missing both text and html");
    return res.status(400).json({
      error: "Either text or html is required",
      received: req.body,
    });
  }

  try {
    console.log(`🔍 Fetching account with ID: ${accountId}`);
    const account = await prisma.emailAccount.findUnique({
      where: { id: parseInt(accountId, 10) },
    });

    if (!account) {
      console.error(`❌ Account not found: ${accountId}`);
      return res.status(404).json({ error: "Account not found" });
    }

    console.log(`✅ Account found: ${account.email}`);
    console.log(`Auth type: ${account.authType}`);

    let transporter;

    if (account.authType === "password") {
      console.log("🔐 Using password authentication");

      let transporterOptions = {
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpPort === 465,
        auth: {
          user: account.smtpUser,
          pass: account.encryptedPass,
        },
        logger: true,
        debug: true,
      };

      if (account.provider === "rediff") {
        const domain = account.email.split("@")[1];
        transporterOptions.name = domain;
        transporterOptions.tls = {
          rejectUnauthorized: false,
        };
        transporterOptions.connectionTimeout = 10000;
        transporterOptions.greetingTimeout = 10000;
        transporterOptions.socketTimeout = 10000;
      }

      transporter = nodemailer.createTransport(transporterOptions);
    } else if (account.authType === "oauth") {
      console.log("🔐 Using OAuth2 authentication");

      if (account.provider === "zoho") {
        const accessToken = await getZohoAccessToken(
          account.refreshToken,
          account.oauthClientId,
          account.oauthClientSecret
        );
        console.log("✅ Zoho access token obtained");

        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: {
            type: "OAuth2",
            user: account.smtpUser,
            accessToken,
          },
          logger: true,
          debug: true,
        });
      } else if (account.provider === "rediff") {
        const accessToken = await getRediffAccessToken(
          account.refreshToken,
          account.oauthClientId,
          account.oauthClientSecret
        );
        console.log("✅ Rediff access token obtained");

        const domain = account.email.split("@")[1];

        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: {
            type: "OAuth2",
            user: account.smtpUser,
            accessToken,
          },
          name: domain,
          logger: true,
          debug: true,
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        });
      } else if (account.provider === "outlook") {
        const accessToken = await getOutlookAccessToken(
          account.refreshToken,
          account.oauthClientId,
          account.oauthClientSecret
        );
        console.log("✅ Outlook access token obtained");

        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: {
            type: "OAuth2",
            user: account.smtpUser,
            accessToken,
          },
          logger: true,
          debug: true,
        });
      } else {
        const accessToken = await getOAuth2AccessToken(account);
        console.log("✅ Google access token obtained");

        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: {
            type: "OAuth2",
            user: account.smtpUser,
            clientId: account.oauthClientId,
            clientSecret: account.oauthClientSecret,
            refreshToken: account.refreshToken,
            accessToken,
          },
          logger: true,
          debug: true,
        });
      }
    } else {
      console.error(`❌ Unsupported auth type: ${account.authType}`);
      return res.status(400).json({ error: "Unsupported authentication type" });
    }

    const mailOptions = {
      from: account.email,
      to,
      subject,
      text,
      html,
    };

    if (inReplyTo) {
      mailOptions.inReplyTo = inReplyTo;
    }
    if (references) {
      mailOptions.references = references;
    }

    console.log("📤 Sending email...");
    console.log("From:", account.email);
    console.log("To:", to);
    console.log("Subject:", subject);

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! MessageId: ${result.messageId}`);

    res.status(200).json({
      success: true,
      message: "Email sent via SMTP",
      messageId: result.messageId,
    });
  } catch (err) {
    console.error("❌ SMTP send error:", err);
    console.error("Error details:", err.message);
    console.error("Error stack:", err.stack);

    res.status(500).json({
      error: "Failed to send email via SMTP",
      details: err.message,
      status: "failed",
    });
  }
});

// Get all accounts
router.get("/", async (_req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    res.json(accounts);
  } catch (err) {
    console.error("❌ Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// Get emails for an account
router.get("/emails", async (req, res) => {
  const accountId = parseInt(req.query.accountId, 10);
  if (!accountId) return res.status(400).json({ error: "Account ID is required" });

  try {
    const emails = await prisma.email.findMany({
      where: { accountId },
      orderBy: { date: "desc" },
    });
    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Trigger sync for one account
router.post("/sync/:id", async (req, res) => {
  const accountId = parseInt(req.params.id, 10);
  try {
    const account = await prisma.emailAccount.findUnique({ where: { id: accountId } });
    if (!account) return res.status(404).json({ error: "Account not found" });

    console.log(`🔄 Manual sync requested for ${account.email}`);
    safeRun(() => syncEmailsForAccount(prisma, account));

    res.status(200).json({ message: "Sync started" });
  } catch (err) {
    console.error("❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

// Trigger sync for all accounts
router.post("/sync", async (_req, res) => {
  try {
    console.log("🔄 Manual sync requested for ALL accounts");
    safeRun(() => runSync(prisma));
    res.status(200).json({ message: "Sync started for all accounts" });
  } catch (err) {
    console.error("❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

// Send email via SendGrid
router.post("/send", async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "to, subject, text/html are required" });
  }

  try {
    const sent = await sendEmailWithSendGrid({ to, subject, text, html });
    res.status(sent ? 200 : 500).json({ message: sent ? "Email sent via SendGrid" : "Failed to send email" });
  } catch (err) {
    console.error("❌ SendGrid error:", err);
    res.status(500).json({ error: "Failed to send email via SendGrid" });
  }
});

// Create an account
router.post("/", async (req, res) => {
  const {
    userId,
    email,
    provider,
    imapHost,
    imapPort,
    imapUser,
    smtpHost,
    smtpPort,
    smtpUser,
    encryptedPass,
    oauthClientId,
    oauthClientSecret,
    refreshToken,
    authType,
  } = req.body;

  if (!userId || !email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (authType === "password" && !encryptedPass) {
    return res.status(400).json({ error: "App password is required" });
  }

  if (authType === "oauth" && (!oauthClientId || !oauthClientSecret || !refreshToken)) {
    return res.status(400).json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });
  }

  // Force OAuth for Outlook
  if (provider === "outlook" && authType === "password") {
    return res.status(400).json({ error: "Outlook requires OAuth authentication (password auth deprecated)" });
  }

  try {
    const existing = await prisma.emailAccount.findFirst({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ error: `Account with email ${email} already exists` });
    }

    // Provider-specific validation
    if (provider === "amazon") {
      if (imapHost !== "imap.mail.us-east-1.awsapps.com") {
        return res.status(400).json({ error: "Amazon WorkMail requires specific IMAP host: imap.mail.us-east-1.awsapps.com" });
      }
      if (imapPort !== 993) {
        return res.status(400).json({ error: "Amazon WorkMail requires IMAP port 993" });
      }
    }

    if (provider === "rediff") {
      if (imapHost !== "imap.rediffmailpro.com") {
        return res.status(400).json({ error: "Rediff Mail Pro requires specific IMAP host: imap.rediffmailpro.com" });
      }
      if (imapPort !== 993) {
        return res.status(400).json({ error: "Rediff Mail Pro requires IMAP port 993" });
      }
      if (smtpHost !== "smtp.rediffmailpro.com") {
        return res.status(400).json({ error: "Rediff Mail Pro requires specific SMTP host: smtp.rediffmailpro.com" });
      }
      if (smtpPort !== 465) {
        return res.status(400).json({ error: "Rediff Mail Pro requires SMTP port 465" });
      }
    }

    if (provider === "zoho") {
      if (imapHost !== "imap.zoho.com" || smtpHost !== "smtp.zoho.com") {
        return res.status(400).json({ error: "Zoho requires IMAP host imap.zoho.com and SMTP host smtp.zoho.com" });
      }
    }

    if (provider === "outlook") {
      if (imapHost !== "outlook.office365.com" || smtpHost !== "smtp.office365.com") {
        return res.status(400).json({ error: "Outlook requires IMAP host outlook.office365.com and SMTP host smtp.office365.com" });
      }
    }

    const account = await prisma.emailAccount.create({
      data: {
        email,
        provider,
        imapHost,
        imapPort: parseInt(imapPort, 10),
        imapUser,
        smtpHost,
        smtpPort: parseInt(smtpPort, 10),
        smtpUser,
        encryptedPass,
        oauthClientId,
        oauthClientSecret,
        refreshToken,
        authType,
      },
    });

    console.log(`✅ Account created: ${account.email}, starting sync...`);
    safeRun(() => syncEmailsForAccount(prisma, account));

    res.status(201).json(account);
  } catch (err) {
    console.error("❌ Error creating account:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ error: `Account with email ${email} already exists` });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Invalid userId" });
    }
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Update an account
router.put("/:id", async (req, res) => {
  const accountId = parseInt(req.params.id, 10);
  const {
    email,
    provider,
    imapHost,
    imapPort,
    imapUser,
    smtpHost,
    smtpPort,
    smtpUser,
    encryptedPass,
    oauthClientId,
    oauthClientSecret,
    refreshToken,
    authType,
  } = req.body;

  if (!email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (authType === "password" && !encryptedPass) {
    return res.status(400).json({ error: "App password is required" });
  }

  if (authType === "oauth" && (!oauthClientId || !oauthClientSecret || !refreshToken)) {
    return res.status(400).json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });
  }

  // Force OAuth for Outlook
  if (provider === "outlook" && authType === "password") {
    return res.status(400).json({ error: "Outlook requires OAuth authentication (password auth deprecated)" });
  }

  try {
    const existing = await prisma.emailAccount.findFirst({
      where: { email, id: { not: accountId } },
    });

    if (existing) {
      return res.status(400).json({ error: `Account with email ${email} already exists` });
    }

    // Provider-specific validation
    if (provider === "amazon") {
      if (imapHost !== "imap.mail.us-east-1.awsapps.com") {
        return res.status(400).json({ error: "Amazon WorkMail requires specific IMAP host: imap.mail.us-east-1.awsapps.com" });
      }
      if (imapPort !== 993) {
        return res.status(400).json({ error: "Amazon WorkMail requires IMAP port 993" });
      }
    }

    if (provider === "rediff") {
      if (imapHost !== "imap.rediffmailpro.com") {
        return res.status(400).json({ error: "Rediff Mail Pro requires specific IMAP host: imap.rediffmailpro.com" });
      }
      if (imapPort !== 993) {
        return res.status(400).json({ error: "Rediff Mail Pro requires IMAP port 993" });
      }
      if (smtpHost !== "smtp.rediffmailpro.com") {
        return res.status(400).json({ error: "Rediff Mail Pro requires specific SMTP host: smtp.rediffmailpro.com" });
      }
      if (smtpPort !== 465) {
        return res.status(400).json({ error: "Rediff Mail Pro requires SMTP port 465" });
      }
    }

    if (provider === "zoho") {
      if (imapHost !== "imap.zoho.com" || smtpHost !== "smtp.zoho.com") {
        return res.status(400).json({ error: "Zoho requires IMAP host imap.zoho.com and SMTP host smtp.zoho.com" });
      }
    }

    if (provider === "outlook") {
      if (imapHost !== "outlook.office365.com" || smtpHost !== "smtp.office365.com") {
        return res.status(400).json({ error: "Outlook requires IMAP host outlook.office365.com and SMTP host smtp.office365.com" });
      }
    }

    const updatedAccount = await prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        email,
        provider,
        imapHost,
        imapPort: parseInt(imapPort, 10),
        imapUser,
        smtpHost,
        smtpPort: parseInt(smtpPort, 10),
        smtpUser,
        encryptedPass,
        oauthClientId,
        oauthClientSecret,
        refreshToken,
        authType,
      },
    });

    console.log(`✅ Account updated: ${updatedAccount.email}, starting sync...`);
    safeRun(() => syncEmailsForAccount(prisma, updatedAccount));

    res.status(200).json(updatedAccount);
  } catch (err) {
    console.error("❌ Error updating account:", err);
    if (err.code === "P2002") {
      return res.status(400).json({ error: `Account with email ${email} already exists` });
    }
    res.status(500).json({ error: "Failed to update account" });
  }
});

// Delete an account
router.delete("/:id", async (req, res) => {
  const accountId = parseInt(req.params.id, 10);
  try {
    await prisma.email.deleteMany({ where: { accountId } });
    await prisma.emailAccount.delete({ where: { id: accountId } });
    res.status(200).json({ message: "Account and emails deleted" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;