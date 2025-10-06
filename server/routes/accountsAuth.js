// server/routes/accountsAuth.js
import express from "express";
import axios from "axios";
import { google } from "googleapis";

const router = express.Router();

const CLIENT_ID = "";
const CLIENT_SECRET = "";
const REDIRECT_URI = "https://www.bouncecure.com/";
const SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

const OUTLOOK_SCOPES = [
  "https://outlook.office.com/IMAP.AccessAsUser.All",
  "https://outlook.office.com/SMTP.Send",
  "offline_access",
];
const OUTLOOK_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const OUTLOOK_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Utility to get Google access token
export async function getOAuth2AccessToken(account) {
  const oAuth2Client = new google.auth.OAuth2(account.oauthClientId, account.oauthClientSecret);
  oAuth2Client.setCredentials({ refresh_token: account.refreshToken });
  const { token } = await oAuth2Client.getAccessToken();
  return token;
}

// Utility to get Zoho access token
export async function getZohoAccessToken(refreshToken, clientId, clientSecret) {
  try {
    const response = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error("❌ Error refreshing Zoho token:", err);
    throw new Error("Failed to refresh access token");
  }
}

// Utility to get Rediff access token
export async function getRediffAccessToken(refreshToken, clientId, clientSecret) {
  try {
    const response = await axios.post(
      "https://accounts.rediff.com/oauth2/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error("❌ Error refreshing Rediff token:", err);
    throw new Error("Failed to refresh access token");
  }
}

// Utility to get Outlook access token
export async function getOutlookAccessToken(refreshToken, clientId, clientSecret) {
  try {
    const response = await axios.post(
      OUTLOOK_TOKEN_URL,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        scope: OUTLOOK_SCOPES.join(" "),
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data.access_token;
  } catch (err) {
    console.error("❌ Error refreshing Outlook token:", err);
    throw new Error("Failed to refresh access token");
  }
}

// Google OAuth routes
router.get("/google/auth-url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  res.json({ url });
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing authorization code" });

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("✅ OAuth tokens:", tokens);
    res.json({
      message: "OAuth2 tokens received",
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
    });
  } catch (err) {
    console.error("❌ Error exchanging code for tokens:", err);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

// Zoho OAuth routes
router.get("/zoho/auth-url", (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res.status(400).json({ error: "Client ID is required" });
  }
  const url = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=mail.full_access`;
  res.json({ url });
});

router.get("/zoho/callback", async (req, res) => {
  const { code, clientId, clientSecret } = req.query;
  if (!code || !clientId || !clientSecret) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const response = await axios.post(
      "https://accounts.zoho.com/oauth/v2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const { access_token, refresh_token } = response.data;
    res.json({
      message: "OAuth2 tokens received",
      refreshToken: refresh_token,
      accessToken: access_token,
    });
  } catch (err) {
    console.error("❌ Error exchanging code for tokens:", err);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

// Rediff OAuth routes
router.get("/rediff/auth-url", (req, res) => {
  const { clientId } = req.query;
  if (!clientId) {
    return res.status(400).json({ error: "Client ID is required" });
  }
  const url = `https://accounts.rediff.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=mail`;
  res.json({ url });
});

router.get("/rediff/callback", async (req, res) => {
  const { code, clientId, clientSecret } = req.query;
  if (!code || !clientId || !clientSecret) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  try {
    const response = await axios.post(
      "https://accounts.rediff.com/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const { access_token, refresh_token } = response.data;
    res.json({
      message: "OAuth2 tokens received",
      refreshToken: refresh_token,
      accessToken: access_token,
    });
  } catch (err) {
    console.error("❌ Error exchanging code for tokens:", err);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

// Yahoo OAuth routes
router.get("/yahoo/auth-url", (req, res) => {
  const url = `https://api.login.yahoo.com/oauth2/request_auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=mail`;
  res.json({ url });
});

router.get("/yahoo/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }
  try {
    const response = await axios.post(
      "https://api.login.yahoo.com/oauth2/get_token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const { access_token, refresh_token } = response.data;
    res.json({
      message: "OAuth2 tokens received",
      refreshToken: refresh_token,
      accessToken: access_token,
    });
  } catch (err) {
    console.error("❌ Error exchanging code for tokens:", err);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

// Outlook OAuth routes
router.get("/outlook/auth-url", (req, res) => {
  const { clientId } = req.query;
  if (!clientId) return res.status(400).json({ error: "Client ID required" });
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: OUTLOOK_SCOPES.join(" "),
    response_mode: "query",
  });
  const url = `${OUTLOOK_AUTH_URL}?${params.toString()}`;
  res.json({ url });
});

router.get("/outlook/callback", async (req, res) => {
  const { code, clientId, clientSecret } = req.query;
  if (!code || !clientId || !clientSecret) return res.status(400).json({ error: "Missing parameters" });
  try {
    const response = await axios.post(
      OUTLOOK_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: clientId,
        client_secret: clientSecret,
        scope: OUTLOOK_SCOPES.join(" "),
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const { access_token, refresh_token } = response.data;
    res.json({ message: "OAuth tokens received", refreshToken: refresh_token, accessToken: access_token });
  } catch (err) {
    console.error("❌ Error exchanging code:", err);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

export default router;