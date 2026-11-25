/**
 * Live access to the website's CMS data files (src/data/blogs.js, src/data/redirects.js).
 * The Blog Builder publishes by committing to these files on GitHub.
 *
 * All GitHub access now goes through the backend (/api/v1/blog/github/file), which holds the
 * GitHub token on the server. The website no longer needs — and must not have — VITE_GH_TOKEN:
 * any VITE_ variable is baked into the public JavaScript.
 *
 *   GET  /api/v1/blog/github/file?path=…   blogs.js is public; other files need a CMS login
 *   PUT  /api/v1/blog/github/file          CMS editor/admin login required
 */
import { API_URL } from "./apiBase";

export const GH_BRANCH = "main";
export const GH_FILE = "src/data/blogs.js";
export const REDIRECTS_FILE = "src/data/redirects.js";

/** The CMS login token (stored by BlogAuthContext), as an Authorization header. */
function cmsAuthHeader() {
  if (typeof window === "undefined") return {};
  try {
    const s = JSON.parse(localStorage.getItem("abhicabsBlogAuth") || "null");
    return s?.token ? { Authorization: `Bearer ${s.token}` } : {};
  } catch { return {}; }
}

/** Publishing is configured on the server; the CMS can always try. Kept for existing callers. */
export const ghConfigured = () => true;

async function errorFrom(res, fallback) {
  const j = await res.json().catch(() => ({}));
  const e = new Error(j.message || `${fallback}: HTTP ${res.status}`);
  e.status = res.status;
  return e;
}

/** → GitHub-shaped { content (base64), sha }. `fresh` skips the server's 30-second cache (CMS only). */
export async function ghGetFile(path, { fresh = false, signedIn = true } = {}) {
  const url = `${API_URL}/blog/github/file?path=${encodeURIComponent(path)}${fresh ? "&fresh=1" : ""}&t=${Date.now()}`;
  const res = await fetch(url, { headers: signedIn ? cmsAuthHeader() : {}, cache: "no-store" });
  if (!res.ok) throw await errorFrom(res, "Could not load " + path);
  return res.json();
}

/** Commit new text to an allowed file. Throws an Error with .status === 409 if the file changed meanwhile. */
export async function ghPutFile(path, { text, sha, message }) {
  const res = await fetch(`${API_URL}/blog/github/file`, {
    method: "PUT",
    headers: { ...cmsAuthHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ path, content: encodeBase64Utf8(text), sha, message }),
  });
  if (!res.ok) throw await errorFrom(res, "Commit failed");
  return res.json(); // { content: { sha }, commit: { sha } }
}

export const decodeBase64Utf8 = (b64) =>
  new TextDecoder("utf-8").decode(Uint8Array.from(atob(String(b64).replace(/\n/g, "")), (c) => c.charCodeAt(0)));
export const encodeBase64Utf8 = (text) => btoa(unescape(encodeURIComponent(text)));

/** Evaluate the array literal exported by a data file ("export const NAME = [ … ];"). */
export function parseExportedArray(text, name) {
  const body = text.replace(new RegExp(`^[\\s\\S]*?export\\s+const\\s+${name}\\s*=\\s*`), "").replace(/;?\s*$/, "").trim();
  // eslint-disable-next-line no-new-func
  const arr = new Function(`return ${body || "[]"}`)();
  if (!Array.isArray(arr)) throw new Error(`${name} is not an array.`);
  return arr;
}

/** Same layout the CMS has always written. */
export const serializeArray = (name, arr) =>
  `export const ${name} = [\n${arr.map((r) => "  " + JSON.stringify(r, null, 2).replace(/\n/g, "\n  ")).join(",\n")}\n];\n`;

/** → { sha, blogsArray } — the live blog list, read fresh for the CMS. */
export async function fetchBlogsFile() {
  const file = await ghGetFile(GH_FILE, { fresh: true });
  return { sha: file.sha, blogsArray: parseExportedArray(decodeBase64Utf8(file.content), "BLOGS") };
}
