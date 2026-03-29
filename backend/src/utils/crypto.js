const crypto = require("crypto");

function getKey() {
  const b64 = process.env.ENC_KEY;
  if (!b64) throw new Error("Missing ENC_KEY");
  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) throw new Error("ENC_KEY must be 32 bytes (base64)");
  return key;
}

function encryptText(plain) {
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM standard
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: enc.toString("base64")
  };
}

function decryptText(payload) {
  const key = getKey();
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const data = Buffer.from(payload.data, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

module.exports = { encryptText, decryptText };
