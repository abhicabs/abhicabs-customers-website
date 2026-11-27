/**
 * Re-export from the single source of truth.
 * Use cldOptimize(path, { width }) everywhere — it handles both
 * local /images/… paths AND existing Cloudinary URLs.
 */
export { cldOptimize, cdnImage } from "../utils/cloudinaryUrl";
