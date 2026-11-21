// Build a static page for every PUBLISHED blog post (src/data/blogs.js — the file the
// Blog Builder commits to). Publishing from the CMS triggers a rebuild, so new posts
// get their own page automatically. Unknown slugs show the 404 page.
import { BLOGS } from "../../../src/data/blogs";

const isPublished = (b) => b && b.slug && !b.draft && (!b.status || String(b.status).toLowerCase() === "published");

export default function onBeforePrerenderStart() {
  return (BLOGS || []).filter(isPublished).map((b) => `/blogs/${b.slug}`);
}
