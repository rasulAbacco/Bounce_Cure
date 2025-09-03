// utils/providerMap.js

export default {
    "aspmx.l.google.com": {
        provider: "Gmail",
        isFreeDomain: true,
        isCatchAllProvider: true,
        isSmtpBlocked: true
    },
    "gmail-smtp-in.l.google.com": {
        provider: "Gmail",
        isFreeDomain: true,
        isCatchAllProvider: true,
        isSmtpBlocked: true
    },
    "mx.zoho.com": {
        provider: "Zoho",
        isFreeDomain: false,
        isCatchAllProvider: false,
        isSmtpBlocked: false
    },
    "mx.yandex.net": {
        provider: "Yandex",
        isFreeDomain: true,
        isCatchAllProvider: false,
        isSmtpBlocked: true
    },
    "mx1.mail.icloud.com": {
        provider: "iCloud",
        isFreeDomain: true,
        isCatchAllProvider: false,
        isSmtpBlocked: true
    },
    "outlook-com.olc.protection.outlook.com": {
        provider: "Outlook",
        isFreeDomain: true,
        isCatchAllProvider: true,
        isSmtpBlocked: true
    }
    // ➕ Add more as needed
};
