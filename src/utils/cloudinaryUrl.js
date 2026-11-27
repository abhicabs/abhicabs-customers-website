/**
 * src/utils/cloudinaryUrl.js
 *
 * ONE function for every runtime image path on the site:
 *
 *  1. Local /images/… paths  → Cloudinary delivery URL (using the same
 *     naming convention as the Vite build plugin and the upload script).
 *  2. Cloudinary upload URLs → adds f_auto, q_auto (and optional width).
 *  3. Anything else (data URIs, external https, already-optimised) → pass-through.
 *
 * The Vite plugin rewrites *static* "/images/…" literals at build time.
 * This function covers paths assembled at *runtime* — CMS data, API
 * responses, dynamic string concatenation, placeImages.json entries, etc.
 *
 * When VITE_CLOUDINARY_CLOUD_NAME is not set (local dev), local paths are
 * returned as-is so the site works offline from public/images.
 */
import { cloudinaryUrl as _buildCldUrl } from "../../scripts/cloudinary-paths.mjs";

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export function cldOptimize(url, { width } = {}) {
  if (!url || typeof url !== "string") return url;

  // ── 1. Local /images/… → Cloudinary ───────────────────────────────────
  // Strip an optional ?v=… cache-buster before matching.
  const clean = url.replace(/\?[^#]*$/, "");
  const localMatch = clean.match(
    /^\/images\/((?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+)$/
  );
  if (localMatch) {
    if (!CLOUD) return url; // local dev — serve from public/images
    // _buildCldUrl already adds f_auto,q_auto,c_limit,w_1920 for rasters
    let out = _buildCldUrl(CLOUD, localMatch[1]);
    // If the caller asked for a tighter width, replace the default w_1920
    if (width) {
      out = out.replace(/w_\d+/, `w_${Math.round(width)}`);
    }
    return out;
  }

  // ── 2. Already a Cloudinary URL → add transforms ──────────────────────
  if (/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) {
    if (/\/upload\/[^/]*\bf_auto\b/.test(url)) return url; // already optimized
    const t = [];
    if (width) t.push(`w_${Math.round(width)}`, "c_limit");
    t.push("f_auto", "q_auto");
    return url.replace("/image/upload/", `/image/upload/${t.join(",")}/`);
  }

  // ── 3. External URL / data URI / anything else → pass-through ─────────
  return url;
}

/** Legacy alias — code that imported cdnImage keeps working. */
export const cdnImage = (path) => cldOptimize(path);
