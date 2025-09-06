import crypto from "crypto";

const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY;

if (!secretKey) {
  console.warn("⚠️ ENCRYPTION_KEY missing, encryption disabled.");
}

export const encrypt = (text) => {
  if (!secretKey) return text; // just return plain text
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return { iv: iv.toString("hex"), content: encrypted.toString("hex") };
};

export const decrypt = (hash) => {
  if (!secretKey) return hash.content; // return plain
  const iv = Buffer.from(hash.iv, "hex");
  const key = crypto.scryptSync(secretKey, "salt", 32);
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString();
};
