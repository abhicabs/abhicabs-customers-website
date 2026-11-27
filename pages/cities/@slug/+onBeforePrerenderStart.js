import { CITY_CONTENT } from "../../../src/content/cityDefaults";

// Cities with a dedicated page outside /cities/ (e.g. /pune/car-rental).
// They keep their entry in CITY_CONTENT for data, but don't get a /cities/<slug> page.
const DEDICATED_PAGES = ["mangaluru", "tirupati", "pune", "visakhapatnam", "hyderabad", "mumbai"];

// Pre-render every city page to static HTML at build time, so search engines
// get the full content without running JavaScript (faster + better for SEO).
export function onBeforePrerenderStart() {
  return Object.keys(CITY_CONTENT)
    .filter((slug) => !DEDICATED_PAGES.includes(slug))
    .map((slug) => `/cities/${slug}`);
}
