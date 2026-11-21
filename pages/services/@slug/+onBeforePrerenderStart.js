// Build a static page for every CMS service/template page at deploy time
// (same list the sitemap uses). If the API can't be reached, nothing extra is built.
import { fetchAllPages } from "../../../src/lib/serviceData";

const BUILT_IN = ["local", "airport-taxi", "one-way-outstation", "round-trip", "corporate", "airport-transfer"];

export default async function onBeforePrerenderStart() {
  const { ok, pages } = await fetchAllPages(8000);
  if (!ok) return [];
  return Object.entries(pages)
    .filter(([, p]) => p && (p._service || p._template))
    .map(([id, p]) => p._slug || id)
    .filter((slug) => slug && !BUILT_IN.includes(slug))
    .map((slug) => `/services/${slug}`);
}
