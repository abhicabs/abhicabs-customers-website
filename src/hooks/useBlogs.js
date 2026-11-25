import { useMemo, useState, useEffect } from "react";
import { BLOGS } from "../data/blogs";
import { SAMPLE_BLOGS } from "../data/sampleBlogs";
import { SEO_ARTICLES } from "../data/seoArticles";
import { sortBlogs } from "../lib/blog";
import { ghGetFile, decodeBase64Utf8, parseExportedArray, GH_FILE } from "../lib/githubBlogs";

/**
 * The single source of blog posts for every blog page.
 *
 * **LIVE CONTENT**: On the client, this hook fetches the latest blogs.js (via the
 * backend, which reads it from GitHub) so newly published posts appear instantly — no rebuild needed.
 * The bundled BLOGS array is the SSR/initial-render fallback.
 *
 * Priority: GitHub live > bundled BLOGS > SEO_ARTICLES > sample posts (dev only).
 */
const SAMPLE_ALLOWED = import.meta.env.DEV || String(import.meta.env.VITE_BLOG_SAMPLE_DATA).toLowerCase() === "true";
const isPublished = (b) => b && b.slug && !b.draft && (!b.status || String(b.status).toLowerCase() === "published");


// In-memory cache so we don't refetch on every component mount
let _liveCache = null;
let _liveFetched = false;
let _liveFetching = false;
let _liveListeners = [];

function notifyListeners(data) {
  _liveListeners.forEach((fn) => fn(data));
}

async function fetchLiveBlogs() {
  if (_liveFetched || _liveFetching || typeof window === "undefined") return _liveCache;
  _liveFetching = true;
  try {
    // Public read through the backend — no token in the browser.
    const file = await ghGetFile(GH_FILE, { signedIn: false });
    const arr = parseExportedArray(decodeBase64Utf8(file.content), "BLOGS");
    _liveCache = arr;
    _liveFetched = true;
    notifyListeners(arr);
    return arr;
  } catch {
    return null;
  } finally {
    _liveFetching = false;
  }
}

/** Merge blogs from multiple sources, dedup by slug, filter published, sort. */
// Placeholder articles (the bundled SEO_ARTICLES + dev sample posts) are switched OFF for now:
// only real posts published from the Blog Builder (BLOGS / live GitHub) are shown.
// Set to true to show the placeholder articles again.
const SHOW_PLACEHOLDER_ARTICLES = false;

function mergeBlogs(liveBlogs) {
  // Priority: live GitHub > bundled BLOGS > (placeholders, when enabled)
  const primary = (liveBlogs || BLOGS || []).filter(isPublished);
  if (!SHOW_PLACEHOLDER_ARTICLES) return { blogs: sortBlogs(primary), isSample: false };
  const taken = new Set(primary.map((b) => b.slug));
  const seo = (SEO_ARTICLES || []).filter((a) => isPublished(a) && !taken.has(a.slug));
  const merged = [...primary, ...seo];
  if (merged.length) return { blogs: sortBlogs(merged), isSample: false };
  return SAMPLE_ALLOWED ? { blogs: sortBlogs(SAMPLE_BLOGS), isSample: true } : { blogs: [], isSample: false };
}

/** SSR-safe: returns bundled blogs immediately. */
export function getBlogs() {
  return mergeBlogs(_liveCache);
}

/**
 * Hook: returns { blogs, isSample }.
 * On client, triggers a background fetch from GitHub and re-renders with live data.
 */
export default function useBlogs() {
  const initial = useMemo(() => mergeBlogs(_liveCache), []);
  const [data, setData] = useState(initial);

  useEffect(() => {
    // If we already have live data cached, use it
    if (_liveFetched && _liveCache) {
      const merged = mergeBlogs(_liveCache);
      setData(merged);
      return;
    }

    // Listen for live data
    const listener = (liveBlogs) => {
      setData(mergeBlogs(liveBlogs));
    };
    _liveListeners.push(listener);

    // Trigger fetch
    fetchLiveBlogs();

    return () => {
      _liveListeners = _liveListeners.filter((fn) => fn !== listener);
    };
  }, []);

  return data;
}

/** Force a refetch (called after publishing a new post). */
export function refreshLiveBlogs() {
  _liveFetched = false;
  _liveFetching = false;
  _liveCache = null;
  fetchLiveBlogs();
}
