/**
 * Single source of truth for mapping a local /images/<file> path to its
 * Cloudinary delivery URL. Used by the Vite build plugin (vite.config.js),
 * the runtime helper (src/lib/cdn.js) and the upload script.
 *
 *   /images/hero-hill-road.webp
 *     → https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,c_limit,w_1920/abhicabs/hero-hill-road_webp
 */
export const FOLDER = "abhicabs";

/** "hero-hill-road.webp" → "abhicabs/hero-hill-road_webp" (extension kept so a.png and a.webp never collide) */
export function publicIdFor(fileName) {
  return `${FOLDER}/${fileName.replace(/\.([a-z0-9]+)$/i, "_$1")}`;
}

/** Cloudinary transformation: auto format (AVIF/WebP), auto quality, never wider than 1920px. SVGs are served as-is. */
export function transformFor(fileName) {
  return /\.svg$/i.test(fileName) ? "" : "f_auto,q_auto,c_limit,w_1920/";
}

export function cloudinaryUrl(cloudName, fileName) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformFor(fileName)}${publicIdFor(fileName)}`;
}
