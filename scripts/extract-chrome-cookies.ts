#!/usr/bin/env npx tsx
/**
 * Extract X/Twitter auth cookies from Chrome's encrypted cookie store.
 * Saves them to .tweet-bot-cookies.json for the tweet bot to use.
 *
 * macOS only. Requires Keychain access (will prompt once).
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createDecipheriv, pbkdf2Sync } from "crypto";
import Database from "better-sqlite3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIES_FILE = resolve(__dirname, "../.tweet-bot-cookies.json");

function getChromeEncryptionKey(): Buffer {
  // Get Chrome Safe Storage password from macOS Keychain
  const raw = execSync(
    'security find-generic-password -w -s "Chrome Safe Storage" -a "Chrome"',
    { encoding: "utf-8" }
  ).trim();

  // Derive the actual encryption key using PBKDF2
  return pbkdf2Sync(raw, "saltysalt", 1003, 16, "sha1");
}

function decryptCookieValue(
  encryptedValue: Buffer,
  key: Buffer
): string {
  if (encryptedValue.length <= 3) return "";

  // Chrome prefixes encrypted cookies with "v10" (3 bytes)
  const prefix = encryptedValue.subarray(0, 3).toString("utf-8");
  if (prefix !== "v10") {
    // Not encrypted or unknown format
    return encryptedValue.toString("utf-8");
  }

  const iv = Buffer.alloc(16, " "); // 16 spaces
  const encrypted = encryptedValue.subarray(3);
  const decipher = createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(true);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf-8");
}

function main() {
  console.log("Extracting Chrome cookies for x.com...");

  // Copy the cookie DB (Chrome locks it)
  const chromeDbPath = resolve(
    process.env.HOME!,
    "Library/Application Support/Google/Chrome/Default/Cookies"
  );
  const tmpDb = "/tmp/chrome-cookies-copy.db";
  copyFileSync(chromeDbPath, tmpDb);

  const key = getChromeEncryptionKey();
  const db = new Database(tmpDb, { readonly: true });

  const rows = db
    .prepare(
      `SELECT name, encrypted_value, host_key, path, is_httponly, is_secure, expires_utc
       FROM cookies
       WHERE (host_key LIKE '%x.com%' OR host_key LIKE '%twitter.com%')
         AND name IN ('auth_token', 'ct0', 'twid')`
    )
    .all() as Array<{
    name: string;
    encrypted_value: Buffer;
    host_key: string;
    path: string;
    is_httponly: number;
    is_secure: number;
    expires_utc: number;
  }>;

  const cookies: Record<string, string> = {};

  for (const row of rows) {
    const value = decryptCookieValue(row.encrypted_value, key);
    if (value) {
      cookies[row.name] = value;
      const preview = value.substring(0, 8) + "...";
      console.log(`  ${row.name}: ${preview} (${row.host_key})`);
    }
  }

  db.close();
  unlinkSync(tmpDb);

  if (!cookies.auth_token || !cookies.ct0) {
    console.error(
      "Missing required cookies. Make sure you're logged into X in Chrome."
    );
    process.exit(1);
  }

  writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log(`\nSaved to ${COOKIES_FILE}`);
}

main();
