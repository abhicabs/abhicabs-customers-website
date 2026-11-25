import { useCallback, useEffect, useState } from "react";
import { BLOGS as BUNDLED } from "../data/blogs";
import { fetchBlogsFile, ghConfigured } from "../lib/githubBlogs";

let cache = null; // shared by every CMS screen in this session
/** Call after publishing so the next list view reloads from GitHub. */
export const resetCmsBlogsCache = () => { cache = null; };

/**
 * Blog posts for the CMS. Loads the LIVE list (GitHub, via the backend); falls back to the bundled
 * list (and says why) when GitHub isn't configured or fails.
 * → { blogs, source: "github" | "bundled", status: "loading" | "ready" | "error", error, refresh }
 */
export default function useCmsBlogs() {
  const [state, setState] = useState(cache || { blogs: BUNDLED, source: "bundled", status: ghConfigured() ? "loading" : "ready", error: ghConfigured() ? "" : "Publishing isn't available — showing only the blogs bundled in this build." });

  const load = useCallback(async () => {
    if (!ghConfigured()) return;
    setState((s) => ({ ...s, status: "loading", error: "" }));
    try {
      const { blogsArray } = await fetchBlogsFile();
      cache = { blogs: blogsArray, source: "github", status: "ready", error: "" };
      setState(cache);
    } catch (e) {
      setState({ blogs: BUNDLED, source: "bundled", status: "error", error: e.message || "Could not load the live blog list from the server." });
    }
  }, []);

  useEffect(() => { if (!cache) load(); }, [load]);
  return { ...state, refresh: () => { cache = null; load(); } };
}
