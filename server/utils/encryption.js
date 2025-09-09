import crypto from "crypto";

// Encryption algorithm and key
const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY;

if (!secretKey) {
  console.warn("⚠️ ENCRYPTION_KEY missing, encryption disabled. Data will be stored as plain text.");
}

/**
 * Encrypts a given text using AES-256-CTR
 * @param {string} text - The text to encrypt
 * @returns {Object} - An object containing 'iv' and 'content' in hexadecimal format
 */
export const encrypt = (text) => {
  if (!secretKey) return text; // fallback: return plaintext if no key provided

  const iv = crypto.randomBytes(16); // initialization vector
  const key = crypto.scryptSync(secretKey, "salt", 32); // derive key from secret

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex")
  };
};

/**
 * Decrypts a given hash using AES-256-CTR
 * @param {Object|string} hash - The encrypted data or plain text
 * @returns {string} - The decrypted text
 */
export const decrypt = (hash) => {
  if (!secretKey || typeof hash === 'string') {
    return hash; // fallback: assume plain text
  }

  if (!hash.iv || !hash.content) {
    throw new Error("❌ Invalid hash format passed to decrypt()");
  }

  const iv = Buffer.from(hash.iv, "hex");
  const key = crypto.scryptSync(secretKey, "salt", 32);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final()
  ]);

  return decrypted.toString();
};
