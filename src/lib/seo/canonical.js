/**
 * Canonical URL + indexing rules — one source of truth, used by:
 *   • pages/+Head.jsx            (server / pre-rendered HTML, first page load)
 *   • src/components/Layout.jsx  (keeps the tags in sync on in-site navigation,
 *                                 which swaps pages in the browser without a reload)
 */
import { SITE_ORIGIN } from "./constants";

// Old / duplicate addresses (301-redirected) name the real page as canonical.
export const CANONICAL_ALIAS = {
  "/services/local": "/local-car-rental",
  "/fleet": "/our-vehicles",
  "/services/one-way-outstation": "/one-way-cabs",
  "/services/airport-taxi": "/airport-taxi",
  "/services/round-trip": "/round-trip-cabs",
  "/contact-us": "/contact",
  "/services/airport-transfer": "/airport-taxi",
  "/blog": "/blogs",
};

// App / transactional screens: keep out of search results (robots.txt also blocks crawling).
const PRIVATE_RE = /^\/(checkout|payment|confirmation|login|my-booking|booking-details|support-tickets|tracking|delete-account|admin)(\/|$)/;

export const normalizePath = (urlPathname) => (urlPathname || "/").replace(/\/+$/, "");

/** https://abhicabs24x7.com + path — no trailing slash, no query string. */
export const canonicalFor = (urlPathname) => {
  const path = normalizePath(urlPathname);
  return SITE_ORIGIN + (CANONICAL_ALIAS[path] || path);
};

export const isPrivatePath = (urlPathname) => PRIVATE_RE.test(normalizePath(urlPathname));

/** Browser only: point the canonical / og:url / robots tags at the current page. */
export function syncCanonicalTags(urlPathname, { isErrorPage = false } = {}) {
  if (typeof document === "undefined") return;
  const head = document.head;
  const url = canonicalFor(urlPathname);

  let link = head.querySelector('link[rel="canonical"]');
  let og = head.querySelector('meta[property="og:url"]');
  if (isErrorPage) { link?.remove(); og?.remove(); }
  else {
    if (!link) { link = document.createElement("link"); link.setAttribute("rel", "canonical"); head.appendChild(link); }
    link.setAttribute("href", url);
    if (!og) { og = document.createElement("meta"); og.setAttribute("property", "og:url"); head.appendChild(og); }
    og.setAttribute("content", url);
  }

  // noindex for private screens (our own tag only — pages that set their own robots tag are left alone)
  const ours = head.querySelector('meta[name="robots"][data-ac-robots]');
  if (isPrivatePath(urlPathname)) {
    if (!ours && !head.querySelector('meta[name="robots"]')) {
      const m = document.createElement("meta");
      m.setAttribute("name", "robots"); m.setAttribute("content", "noindex, follow"); m.setAttribute("data-ac-robots", "");
      head.appendChild(m);
    }
  } else if (ours) ours.remove();
}
