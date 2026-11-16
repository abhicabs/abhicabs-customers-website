import { CITY_CONTENT } from "../../../src/content/cityDefaults";

// Pre-render every city page to static HTML at build time, so search engines
// get the full content without running JavaScript (faster + better for SEO).
export function onBeforePrerenderStart() {
  return Object.keys(CITY_CONTENT).map((slug) => `/cities/${slug}`);
}
