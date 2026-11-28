import { defineConfig, loadEnv } from "vite";
import vike from "vike/plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudinaryUrl } from "./scripts/cloudinary-paths.mjs";

/**
 * Serve every /images/<file> from Cloudinary.
 * At build time, any "/images/<file>" path written in our source (JSX src/srcSet,
 * content objects, JSON such as placeImages.json, CSS url(), SEO tags with the site
 * origin; subfolders like /images/places/ included) is rewritten to the
 * matching Cloudinary URL. Source files are never modified.
 * OPT-IN: only when VITE_CLOUDINARY_SERVE_SITE_IMAGES=true (and the images were uploaded first
 * with `npm run images:upload`). Otherwise the site serves public/images itself — setting
 * VITE_CLOUDINARY_CLOUD_NAME alone (needed for CMS uploads) does not move the site's images.
 */
function cloudinaryImages(cloudName) {
  const SITE_ABS = /(\$\{SITE\}|https?:\/\/(?:www\.)?abhicabs24x7\.com)\/images\/((?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:png|jpe?g|webp|svg|gif|avif))/g;
  const LOCAL = /(["'`(\s,=])\/images\/((?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:png|jpe?g|webp|svg|gif|avif))/g;
  return {
    name: "abhicabs-cloudinary-images",
    enforce: "pre",
    transform(code, id) {
      if (!cloudName || id.includes("node_modules") || !/\.(jsx?|mjs|css|json)$/.test(id.split("?")[0])) return null;
      if (!code.includes("/images/")) return null;
      const out = code
        .replace(SITE_ABS, (_, _origin, file) => cloudinaryUrl(cloudName, file))
        .replace(LOCAL, (_, pre, file) => pre + cloudinaryUrl(cloudName, file));
      return out === code ? null : { code: out, map: null };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const serveSiteImages = (env.VITE_CLOUDINARY_SERVE_SITE_IMAGES || process.env.VITE_CLOUDINARY_SERVE_SITE_IMAGES) === "true";
  return {
    plugins: [cloudinaryImages(serveSiteImages ? cloudName : null), vike(), react(), tailwindcss()],
  };
});
