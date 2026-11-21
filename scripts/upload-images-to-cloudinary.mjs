#!/usr/bin/env node
/**
 * Upload every file in public/images to Cloudinary (folder "abhicabs").
 *
 *   CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=xxx \
 *     node scripts/upload-images-to-cloudinary.mjs
 *
 * (on Windows PowerShell: set $env:CLOUDINARY_CLOUD_NAME="xxx" etc. first, or put
 *  them in a .env file in the project root — this script reads it.)
 *
 * Safe to re-run: existing images are overwritten with the local version.
 * Uses Cloudinary's signed REST upload — no extra npm package required (Node 18+).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { publicIdFor } from "./cloudinary-paths.mjs";

// minimal .env loader (KEY=value lines)
const envFile = path.resolve(".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
if (!CLOUD || !KEY || !SECRET) {
  console.error("✗ Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET (env vars or .env).");
  process.exit(1);
}

const DIR = path.resolve("public/images");
const files = fs.readdirSync(DIR).filter((f) => /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(f));
const sign = (params) =>
  crypto.createHash("sha1").update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&") + SECRET).digest("hex");

let ok = 0, failed = 0;
for (const file of files) {
  const params = { overwrite: "true", public_id: publicIdFor(file), timestamp: Math.floor(Date.now() / 1000).toString() };
  const form = new FormData();
  Object.entries(params).forEach(([k, v]) => form.append(k, v));
  form.append("api_key", KEY);
  form.append("signature", sign(params));
  form.append("file", new Blob([fs.readFileSync(path.join(DIR, file))]), file);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || res.statusText);
    ok++;
    console.log(`✓ ${file} → ${json.public_id} (${Math.round(json.bytes / 1024)} KB)`);
  } catch (e) {
    failed++;
    console.error(`✗ ${file}: ${e.message}`);
  }
}
console.log(`\nDone: ${ok} uploaded, ${failed} failed, ${files.length} total.`);
if (failed) process.exit(1);
