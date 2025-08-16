// server/routes/disposableDomains.js - Enhanced disposable domains database

const disposableDomains = [
  // Popular temporary email services
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "20minutemail.com", "30minutemail.com", "60minutemail.com",
  "guerrillamail.com", "guerrillamail.net", "guerrillamail.org", "guerrillamail.de",
  "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmail.io", "tempmailo.com",
  "mailinator.com", "mailinator.net", "mailinator.org",
  "throwawaymail.com", "throwaway-mail.com", "throwawayemailaddress.com",
  "getnada.com", "getnada.cc",
  "dispostable.com", "disposable.com", "disposablemail.com", "disposablemail.org",
  "yopmail.com", "yopmail.net", "yopmail.fr",
  "maildrop.cc", "maildrop.com",
  "fakeinbox.com", "fake-mail.ml",
  "mintemail.com", "mint-email.com",
  "mailcatch.com", "mail-catch.com",
  "moakt.com", "moakt.ws",
  "spambox.us", "spambox.info",
  "trashmail.com", "trashmail.net", "trashmail.org", "trash-mail.com",
  "sharklasers.com", "sharklesers.com",
  "mytrashmail.com", "my-trash-mail.com",
  "spamgourmet.com", "spamgourmet.net", "spamgourmet.org",
  "wegwerfemail.de", "wegwerfmail.de", "wegwerfmail.net",
  "mail-temporaire.fr", "mail-temporaire.com",
  "mailnesia.com", "mailnessia.com",
  "anonymbox.com", "anonbox.net",
  "spam4.me", "spam4.us",
  "getairmail.com", "getairmail.cf", "getairmail.ga", "getairmail.gq", "getairmail.ml", "getairmail.tk",
  "tempinbox.com", "temp-inbox.com",
  "grr.la", "guerrillamailblock.com",
  "mailnull.com", "mail-null.com",
  "spamfree24.org", "spamfree24.com", "spamfree24.de",
  "fakebox.org", "fake-box.com",
  "tempemail.co", "temp-email.com", "temp-email.org",
  "disposableemailaddresses.com", "disposable-email.ml",
  "emailondeck.com", "email-on-deck.com",
  "dropmail.me", "drop-mail.com",
  "mailtemp.net", "mail-temp.com", "mailtemp.info",
  "mohmal.com", "mohmal.in", "mohmal.tech",
  "tempmail.ninja", "tempmail.plus", "tempmail.top",
  "10mail.org", "10mail.com",
  "burnermail.io", "burner-mail.com",
  "tempmailaddress.com", "temp-mail-address.com",
  "spamdecoy.net", "spam-decoy.com",
  "disposableinbox.com", "disposable-inbox.com",
  "fakeemailgenerator.com", "fake-email-generator.com",
  
  // International temporary email services
  "correo-temporal.com", "correo-temporal.org", // Spanish
  "e-mail-temporaire.com", "email-temporaire.fr", // French
  "temporaere-email.de", "temp-email.de", // German
  "временная-почта.рф", "tempmail.ru", // Russian
  "临时邮箱.com", "tempmail.cn", // Chinese
  "임시메일.com", "tempmail.kr", // Korean
  "メール捨て.com", "tempmail.jp", // Japanese
  
  // Lesser known but active services
  "emailfake.com", "email-fake.com",
  "tempail.com", "temp-mail.ru",
  "inboxbear.com", "inbox-bear.com",
  "tempemails.net", "temp-emails.com",
  "mailexpire.com", "mail-expire.com",
  "tempinbox.net", "tempinbox.org",
  "incognitomail.org", "incognito-mail.com",
  "guerrillamail.biz", "guerrillamail.info",
  "emailto.de", "email-to.de",
  "spamherelots.com", "spamhereplease.com",
  "bumpymail.com", "bumpy-mail.com",
  "deadaddress.com", "dead-address.com",
  "mailmetrash.com", "mailme-trash.com",
  "mt2014.com", "mt2015.com", "mt2016.com",
  "thankyou2010.com", "thankyou2011.com",
  "guerrillamail.com", "guerrillamailblock.com",
  "pokemail.net", "poke-mail.com",
  "spamspot.com", "spam-spot.net",
  "tempsky.com", "temp-sky.net",
  "yepmail.net", "yep-mail.com",
  "luxusmail.org", "luxus-mail.com",
  "trashdevil.com", "trash-devil.net",
  "kurzepost.de", "kurz-post.com",
  "shortmail.net", "short-mail.com",
  "tempmail.de", "tempmail.eu",
  "wegwerfadresse.de", "wegwerf-email.de",
  "oneoffmail.com", "oneoff-mail.com",
  "mailforspam.com", "mail-for-spam.com",
  "nospamfor.us", "no-spam-for.me",
  "spamhereplease.com", "spam-here-please.com",
  "spamhole.com", "spam-hole.net",
  "mailscrap.com", "mail-scrap.net",
  "guerrillamail.net", "guerrilla-mail.com",
  "mailzi.ru", "mail-zi.com",
  "tempmail.altervista.org", "temp-mail-altervista.org",
  "jourrapide.com", "jour-rapide.com",
  "rhyta.com", "rhy-ta.com",
  "mohmal.im", "moh-mal.com",
  "armyspy.com", "army-spy.net",
  "cuvox.de", "cu-vox.com",
  "dayrep.com", "day-rep.net",
  "einrot.com", "ein-rot.de",
  "fleckens.hu", "fleck-ens.com",
  "gustr.com", "gus-tr.net",
  "jourrapide.com", "jour-rap-ide.com",
  "superrito.com", "super-rito.net",
  "teleworm.us", "tele-worm.com",
  
  // Catch-all patterns for common disposable email formats
  "0-mail.com", "0mail.cf", "0mail.ga", "0mail.ml", "0mail.tk",
  "1mail.ml", "2mail.ml", "3mail.ga", "4mail.cf", "5mail.tk",
  "6mail.cf", "7mail.ga", "8mail.ml", "9mail.tk",
  "a-bc.net", "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com",
  "abaabaabc.tk", "abaabaabc.ga", "abaabaabc.cf", "abaabaabc.ml",
  
  // Dynamic/programmatic disposable services
  "tempmail.tk", "tempmail.ga", "tempmail.cf", "tempmail.ml",
  "guerrilla.tk", "guerrilla.ga", "guerrilla.cf", "guerrilla.ml",
  "temp.tk", "temp.ga", "temp.cf", "temp.ml",
  "disposable.tk", "disposable.ga", "disposable.cf", "disposable.ml",
  "trash.tk", "trash.ga", "trash.cf", "trash.ml",
  "fake.tk", "fake.ga", "fake.cf", "fake.ml",
  
  // Mobile app based temporary emails
  "temp-mail.io", "tempmail.plus", "tempmail.dev",
  "guerrillamail.net", "guerrilla.tk",
  "mailtemp.info", "mail-temp.net",
  "throwaway.email", "throw-away.ml",
  
  // API-based services
  "1secmail.com", "1secmail.org", "1secmail.net",
  "esiix.com", "wwjmp.com", "lroid.com",
  "vusra.com", "rteet.com", "dpptd.com",
  "tfsid.com", "laste.ml", "miucce.com",
  
  // Recently discovered services
  "tempmail.email", "temp-email.net",
  "disposable-email.tk", "disposable.tk",
  "temporary-mail.net", "temporary-email.ga",
  "fake-mail.ga", "fake-email.ml",
  "spam-mail.tk", "spam-email.cf",
  "junk-mail.ga", "junk-email.ml",
  "test-mail.tk", "test-email.cf",
  
  // Educational/testing domains that shouldn't be used in production
  "example.com", "example.org", "example.net",
  "test.com", "test.org", "test.net",
  "localhost.com", "localhost.net",
  "invalid.com", "invalid.org", "invalid.net",
  "domain.com", "domain.org", "domain.net",
  "sample.com", "sample.org", "sample.net",
  
  // Honeypot and spam trap domains
  "spamtrap.com", "spam-trap.net",
  "honeypot.com", "honey-pot.net",
  "blackhole.com", "black-hole.net",
  "devnull.com", "dev-null.net",
  "bitbucket.com", "bit-bucket.net", // Not the real bitbucket
  
  // Expired or discontinued services (still blocked for safety)
  "deadfake.cf", "deadfake.tk", "deadfake.ga", "deadfake.ml",
  "expired-email.com", "expired-mail.net",
  "defunct-mail.com", "defunct-email.net",
  
  // Regional variations and mirrors
  "tempmail.us", "tempmail.ca", "tempmail.uk", "tempmail.au",
  "guerrilla.us", "guerrilla.ca", "guerrilla.uk", "guerrilla.au",
  "throwaway.us", "throwaway.ca", "throwaway.uk", "throwaway.au",
  "disposable.us", "disposable.ca", "disposable.uk", "disposable.au"
];

// Enhanced detection patterns for dynamic disposable services
export const disposablePatterns = [
  /^\d+mail\./,              // 10minutemail, 20minutemail, etc.
  /^\d+min.*mail/,           // 5minutemail, 10minmail, etc.
  /temp.*mail/,              // tempmail variations
  /mail.*temp/,              // mailtemp variations
  /trash.*mail/,             // trashmail variations
  /throw.*away/,             // throwaway variations
  /disposable/,              // disposable variations
  /guerrilla/,               // guerrilla variations
  /fake.*mail/,              // fakemail variations
  /mail.*fake/,              // mailfake variations
  /spam.*mail/,              // spammail variations
  /mail.*spam/,              // mailspam variations
  /junk.*mail/,              // junkmail variations
  /mail.*junk/,              // mailjunk variations
  /burn.*mail/,              // burner mail variations
  /mail.*burn/,              // mailburn variations
  /^[a-z0-9]{4,12}\.(tk|ml|ga|cf|gq)$/, // Suspicious short domains on free TLDs
  /^[a-z]{1,3}[0-9]{2,4}\.(com|net|org)$/, // Pattern like abc123.com
  /^\d{4,8}\.(com|net|org)$/,  // Pure numeric domains
];

// Function to check if a domain matches disposable patterns
export function isDisposablePattern(domain) {
  const lowerDomain = domain.toLowerCase();
  return disposablePatterns.some(pattern => pattern.test(lowerDomain));
}

// Function to check against both list and patterns
export function isDisposableDomain(domain) {
  const lowerDomain = domain.toLowerCase();
  return disposableDomains.includes(lowerDomain) || isDisposablePattern(lowerDomain);
}

// Export both the list and utility functions
export default disposableDomains;
