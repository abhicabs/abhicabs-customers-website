// Build a static (client-rendered) shell for every CMS page at deploy time, so hosts
// like Cloudflare Pages serve /p/<slug> directly. Unknown slugs show the 404 page.
import { fetchAllPages } from "../../../src/lib/serviceData";

// The CMS's main pages are edits of real routes (/, /about, /contact …), not separate pages.
// Building /p/home, /p/about … as well would publish thin duplicates of them.
const MAIN_PAGES = new Set(["home", "about", "outstation", "fleet", "contact", "blogs"]);

export default async function onBeforePrerenderStart() {
  const { ok, pages } = await fetchAllPages(8000);
  if (!ok) return [];
  return Object.entries(pages)
    .filter(([id, p]) => p && !p._service && !p._template && !MAIN_PAGES.has(id))
    .map(([id, p]) => p._slug || id)
    .filter(Boolean)
    .map((slug) => `/p/${slug}`);
}
