/**
 * scripts/write-cms-redirects.mjs  (runs after `vike build`)
 *
 * Applies the redirects managed in Blog Builder → Redirects. The CMS saves them to
 * src/data/redirects.js (committing it triggers a build); this step turns the active
 * ones into rules at the top of dist/client/_redirects, which both Netlify and
 * Cloudflare read before anything else. The hand-written rules in public/_redirects
 * and netlify.toml are kept as they are.
 *
 * Never fails the build: a missing file means "no CMS redirects", and an entry that
 * can't be used is skipped with a warning.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseExportedArray } from "../src/lib/safeLiteral.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = resolve(ROOT, "src/data/redirects.js");
const OUT_DIR = resolve(ROOT, "dist/client");
const OUT = resolve(OUT_DIR, "_redirects");
const SITE_HOSTS = new Set(["abhicabs24x7.com", "www.abhicabs24x7.com"]);
// Netlify skips a rule when a file exists at the old URL unless it is forced ("!");
// Cloudflare always applies rules and doesn't accept "!".
const FORCE = process.env.NETLIFY === "true" ? "!" : "";

const warn = (msg) => console.warn(`[cms-redirects] ${msg}`);

function fromPath(raw) {
  let v = String(raw || "").trim();
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      if (!SITE_HOSTS.has(u.hostname)) return null; // only this site's own URLs can be redirected
      v = u.pathname;
    } catch { return null; }
  }
  if (!v.startsWith("/")) v = "/" + v;
  return /^\/[^\s#?]*$/.test(v) ? v : null;
}

function toTarget(raw) {
  const v = String(raw || "").trim();
  if (/^https?:\/\/\S+$/i.test(v)) return v;
  if (/^\/\S*$/.test(v)) return v;
  if (/^[^\s/:][^\s:]*$/.test(v)) return "/" + v; // "new-page" → "/new-page"
  return null;
}

function main() {
  if (!existsSync(OUT_DIR)) { warn("dist/client not found — run after `vike build`. Skipped."); return; }
  if (!existsSync(SOURCE)) { console.log("[cms-redirects] No src/data/redirects.js — no CMS redirects."); return; }

  let list;
  try {
    list = parseExportedArray(readFileSync(SOURCE, "utf8"), "REDIRECTS");
  } catch (err) {
    warn(`Could not read src/data/redirects.js (${err.message}). Skipped.`);
    return;
  }

  const lines = [];
  const seen = new Set();
  for (const r of list) {
    if (!r || typeof r !== "object" || r.status === false) continue; // switched off in the CMS
    const from = fromPath(r.from);
    const to = toTarget(r.to);
    if (!from || !to) { warn(`Skipped invalid redirect: ${JSON.stringify(r.from)} → ${JSON.stringify(r.to)}`); continue; }
    if (from === "/" ) { warn(`Skipped redirect of the home page to ${to}`); continue; }
    const code = String(r.type) === "302" ? "302" : "301";
    const variants = from.endsWith("/") || from.endsWith("*") ? [from] : [from, from + "/"]; // same as public/_redirects
    for (const f of variants) {
      if (f === to || seen.has(f)) continue;
      seen.add(f);
      lines.push(`${f}  ${to}  ${code}${FORCE}`);
    }
  }

  const existing = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (!lines.length) { console.log("[cms-redirects] No active CMS redirects."); return; }
  if (lines.length + existing.split("\n").length > 1900) warn("Close to the host's limit of about 2,000 redirect rules.");

  const block = `# ── CMS redirects (Blog Builder → Redirects), added at build time ──\n${lines.join("\n")}\n\n`;
  writeFileSync(OUT, block + existing);
  console.log(`[cms-redirects] Wrote ${lines.length} rule(s) to dist/client/_redirects.`);
}

main();
