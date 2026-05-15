import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 32;

export function hashAccessPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(Buffer.from(pin.normalize("NFKC"), "utf8"), salt, SCRYPT_KEYLEN);
  return `${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyAccessPin(pin: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [saltB64, hashB64] = parts;
  if (!saltB64 || !hashB64) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltB64, "base64");
    expected = Buffer.from(hashB64, "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  let hash: Buffer;
  try {
    hash = scryptSync(Buffer.from(pin.normalize("NFKC"), "utf8"), salt, expected.length);
  } catch {
    return false;
  }
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}

export function isValidAccessPinFormat(pin: string): boolean {
  return /^\d{4,8}$/.test(pin.trim());
}
