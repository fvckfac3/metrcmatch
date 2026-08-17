import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { ENV } from "./_core/env";

const algorithm = "aes-256-gcm";

function encryptionKey() {
  if (!ENV.cookieSecret)
    throw new Error(
      "Credential encryption is unavailable because the application secret is missing."
    );
  return createHash("sha256")
    .update(`${ENV.cookieSecret}:metrcmatch:credentials`)
    .digest();
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${ciphertext.toString("base64url")}`;
}

export function decryptSecret(value: string | null) {
  if (!value) return null;
  const [version, ivValue, tagValue, body] = value.split(":");
  if (version !== "v1" || !ivValue || !tagValue || !body)
    throw new Error("Stored credential format is invalid.");
  const decipher = createDecipheriv(
    algorithm,
    encryptionKey(),
    Buffer.from(ivValue, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(body, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
