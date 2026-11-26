/**
 * Server-side data for /services/<slug> (Vike `+data` hook — runs on the server for the first request and in the
 * browser for client-side navigation).
 *
 * Why: pages created in the CMS (state / city / route pages) used to render as "Loading page…" and only filled in after
 * JavaScript ran, so crawlers got an empty shell and an unknown slug answered 200. Fetching here gives crawlers the real
 * HTML and lets an unknown slug return a genuine 404.
 *
 * Failure-safe: if the API can't be reached we do NOT 404 (a valid page must never disappear during an outage); we hand
 * back `loadFailed` and the component falls back to its client-side fetch (and marks that fallback noindex).
 */
import { render } from "vike/abort";
import { SERVICE_DEFAULTS } from "../content/serviceDefaults";

import { API_ROOT } from "./apiBase";
const API_BASE = API_ROOT;

async function fetchAllPagesOnce(timeoutMs) {
  const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = ctrl && setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/api/v1/blog/pages`, ctrl ? { signal: ctrl.signal } : undefined);
    if (!res.ok) return { ok: false, pages: {} };
    const json = await res.json();
    return { ok: true, pages: json?.data && typeof json.data === "object" ? json.data : {} };
  } catch {
    return { ok: false, pages: {} };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// On the server (build / pre-render) every page needs the same list. Share one request
// for a short while instead of one per page: with many CMS pages the per-page requests
// used to run into the API's rate limit, and those pages were then built as "load failed".
// Only successful answers are reused; the browser always fetches fresh.
const SERVER_REUSE_MS = 30 * 1000;
let serverShared = null; // { at, promise }

export async function fetchAllPages(timeoutMs = 4000) {
  if (typeof window !== "undefined") return fetchAllPagesOnce(timeoutMs);
  if (serverShared && Date.now() - serverShared.at < SERVER_REUSE_MS) return serverShared.promise;
  const entry = { at: Date.now(), promise: fetchAllPagesOnce(timeoutMs) };
  serverShared = entry;
  const out = await entry.promise;
  if (!out.ok && serverShared === entry) serverShared = null; // don't keep a failure
  return out;
}

const findPage = (pages, slug) => Object.entries(pages).find(([id, p]) => id === slug || p?._slug === slug)?.[1] || null;

/** `+data` factory. Pass a slug for the fixed built-in routes; omit it for the dynamic /services/:slug route. */
export function makeServiceData(fixedSlug) {
  return async function data(pageContext) {
    const slug = fixedSlug || pageContext.routeParams?.slug;
    const { ok, pages } = await fetchAllPages();
    const page = findPage(pages, slug);
    // Real 404 (not a soft one) for unknown CMS slugs. Fixed built-in routes (e.g. /services/airport-transfer)
    // exist in code, so they never 404 here — throwing during pre-render aborts the WHOLE site build
    // whenever the CMS has no page for them; they render the page's own fallback instead.
    if (ok && !page && !fixedSlug && !SERVICE_DEFAULTS[slug]) throw render(404, "Page not found");
    return { slug, page, allPages: ok ? pages : null, loadFailed: !ok };
  };
}

/**
 * `+data` factory for the main (non-service) pages: hands the page's own CMS content to the
 * first render, so the pre-rendered HTML includes CMS edits (see usePageContent). Only the
 * named pages are passed, to keep the page small. If the API can't be reached the page
 * renders exactly as before (defaults first, live content fetched in the browser).
 */
export function makeCmsPageData(...pageIds) {
  return async function data() {
    const { ok, pages } = await fetchAllPages();
    if (!ok) return { cmsPages: null };
    const cmsPages = {};
    for (const id of pageIds) if (pages[id]) cmsPages[id] = pages[id];
    return { cmsPages };
  };
}
