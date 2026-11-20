/**
 * src/hooks/useSiteSettings.js
 *
 * Fetches global site settings (header + footer) from the CMS
 * (GET /api/v1/blog/site-settings — public). Falls back to {} when the backend
 * is unreachable or nothing has been customised yet, so every consumer must
 * pass its own hardcoded default to get()/getList() — the live site then keeps
 * working exactly as before until an admin saves overrides.
 */
import { useState, useEffect } from "react";

import { API_ROOT } from "../lib/apiBase";
const API_BASE = API_ROOT;

let _cache = null;
let _promise = null;

// If the backend doesn't have this endpoint yet (404), remember that for an hour
// so every page load doesn't repeat the request and log a red 404 in the console.
// Any other failure (offline, 5xx) is NOT remembered, so it retries next load.
const MISSING_KEY = "ac:site-settings:404";
const MISSING_TTL = 60 * 60 * 1000;
const knownMissing = () => {
  try { const t = Number(localStorage.getItem(MISSING_KEY)); return t && Date.now() - t < MISSING_TTL; } catch { return false; }
};
const markMissing = () => { try { localStorage.setItem(MISSING_KEY, String(Date.now())); } catch { /* storage blocked */ } };
const clearMissing = () => { try { localStorage.removeItem(MISSING_KEY); } catch { /* storage blocked */ } };

function fetchSettings() {
  if (_promise) return _promise;
  if (typeof window !== "undefined" && knownMissing()) {
    _cache = {};
    _promise = Promise.resolve(_cache);
    return _promise;
  }
  _promise = fetch(`${API_BASE}/api/v1/blog/site-settings`)
    .then((r) => {
      if (r.status === 404) { markMissing(); return Promise.reject(); }
      return r.ok ? r.json() : Promise.reject();
    })
    .then((json) => { clearMissing(); _cache = json?.data || {}; return _cache; })
    .catch(() => { _cache = {}; return _cache; });
  return _promise;
}

export function useSiteSettings() {
  const [data, setData] = useState(_cache);
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache) { setData(_cache); setLoading(false); return; }
    fetchSettings().then((d) => { setData(d); setLoading(false); });
  }, []);

  const header = data?.header || {};
  const footer = data?.footer || {};

  // get("header","phone","default") — returns a scalar field or the fallback
  const get = (group, field, fallback = "") => {
    const g = group === "header" ? header : footer;
    const v = g?.[field];
    return v === undefined || v === null || v === "" ? fallback : v;
  };

  // getList("header","nav",[...]) — returns a non-empty array or the fallback
  const getList = (group, field, fallback = []) => {
    const g = group === "header" ? header : footer;
    const v = g?.[field];
    return Array.isArray(v) && v.length ? v : fallback;
  };

  return { header, footer, get, getList, loading };
}

export default useSiteSettings;
