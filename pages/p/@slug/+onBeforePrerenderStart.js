// Build a static (client-rendered) shell for every CMS page at deploy time, so hosts
// like Cloudflare Pages serve /p/<slug> directly. Unknown slugs show the 404 page.
import { fetchAllPages } from "../../../src/lib/serviceData";

export default async function onBeforePrerenderStart() {
  const { ok, pages } = await fetchAllPages(8000);
  if (!ok) return [];
  return Object.entries(pages)
    .filter(([, p]) => p && !p._service && !p._template)
    .map(([id, p]) => p._slug || id)
    .filter(Boolean)
    .map((slug) => `/p/${slug}`);
}
