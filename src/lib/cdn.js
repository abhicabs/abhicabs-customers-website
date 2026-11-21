import { cloudinaryUrl } from "../../scripts/cloudinary-paths.mjs";

/**
 * Runtime helper for image paths built dynamically in code (e.g. from CMS data).
 * Static "/images/…" strings in the source are already rewritten at build time by
 * the Cloudinary plugin in vite.config.js — use this only for paths assembled at runtime.
 *
 *   cdnImage("/images/route-1.webp") → Cloudinary URL (or the local path when
 *   VITE_CLOUDINARY_CLOUD_NAME isn't set, so local dev keeps working offline).
 */
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export function cdnImage(path) {
  if (!CLOUD || typeof path !== "string") return path;
  const m = path.match(/^\/images\/([A-Za-z0-9_.-]+)$/);
  return m ? cloudinaryUrl(CLOUD, m[1]) : path;
}
