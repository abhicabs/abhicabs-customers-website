import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store, rehydrateStore } from "../store/store";
import Header from "./Header";
import Footer from "./Footer";
import LinkDirectory from "./LinkDirectory";
import ToastStack from "./ToastStack";
import LoginPopup from "./LoginPopup";
import WhatsAppFloat from "./WhatsAppFloat";
import { usePageContext } from "vike-react/usePageContext";
import { PagesContext } from "../hooks/usePageContent";
import "../styles/global.css";
import { syncCanonicalTags } from "../lib/seo/canonical";

export default function Layout({ children }) {
  const pageCtx = usePageContext();
  const serverPages = pageCtx.data?.allPages ?? null;
  // Home page keeps its full original motion; every other page runs in performance mode.
  const isHome = ((pageCtx.urlPathname || "/").replace(/\/+$/, "") || "/") === "/";
  // CMS/admin screens are full-screen tools: no public link directory there.
  const isAdmin = (pageCtx.urlPathname || "").startsWith("/admin");
  // In-site navigation swaps pages without a reload, so <head> tags written on the first
  // load would go stale — re-point canonical / og:url / robots at the current page.
  useEffect(() => {
    syncCanonicalTags(pageCtx.urlPathname, { isErrorPage: Boolean(pageCtx.is404 || pageCtx.abortStatusCode) });
  }, [pageCtx.urlPathname, pageCtx.is404, pageCtx.abortStatusCode]);
  useEffect(() => {
    rehydrateStore();
  }, []);

  // Home page only: card spotlight + 3D tilt and button click ripple (original behaviour).
  useEffect(() => {
    if (!isHome || typeof window === "undefined") return;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const card = e.target.closest?.(".ac-card");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
        card.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width) - 0.5) * 8}deg`);
        card.style.setProperty("--rx", `${(0.5 - ((e.clientY - r.top) / r.height)) * 8}deg`);
      });
    };
    const onDown = (e) => {
      const btn = e.target.closest?.(".ac-btn");
      if (!btn || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = btn.getBoundingClientRect(), d = Math.max(r.width, r.height);
      const span = document.createElement("span");
      span.className = "ac-ripple";
      span.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 700);
    };
    if (window.matchMedia("(hover: hover)").matches) document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerdown", onDown); cancelAnimationFrame(raf); };
  }, [isHome]);

  // Site-wide behaviour (kept light on purpose: no pointermove/scroll listeners).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    // FAQ <details> (city pages, services, fleet, CMS blocks): open on hover,
    // one at a time per section. Tap/click still works everywhere.
    let hoverT = 0;
    const onOver = (e) => {
      const d = e.target.closest?.("main details:not([data-no-hover])");
      if (e.relatedTarget && d && d.contains(e.relatedTarget)) return;
      clearTimeout(hoverT);
      if (!d || d.open) return;
      hoverT = setTimeout(() => {
        const scope = d.closest("section") || d.parentElement;
        scope?.querySelectorAll("details[open]:not([data-no-hover])").forEach((o) => { if (o !== d) o.open = false; });
        d.open = true;
      }, 160);
    };
    if (canHover) document.addEventListener("mouseover", onOver, { passive: true });

    // "Book" links/buttons point at #booking. Pages that don't carry a booking
    // form (services, fleet, blogs, legal…) send the visitor to the home form.
    const hasForm = () => !!document.getElementById("booking");
    const onClickBook = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      if ((href === "#booking" || href === `${window.location.pathname}#booking`) && !hasForm()) {
        e.preventDefault();
        window.location.href = "/#booking";
      }
    };
    const onHash = () => { if (window.location.hash === "#booking" && !hasForm()) window.location.href = "/#booking"; };
    document.addEventListener("click", onClickBook);
    window.addEventListener("hashchange", onHash);
    return () => { document.removeEventListener("mouseover", onOver); document.removeEventListener("click", onClickBook); window.removeEventListener("hashchange", onHash); clearTimeout(hoverT); };
  }, []);

  return (
    <Provider store={store}>
     <PagesContext.Provider value={serverPages}>
      {isHome && <div aria-hidden className="ac-progress" />}
      <div className="min-h-screen flex flex-col" data-perf={isHome ? "off" : "on"}>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        {!isAdmin && <LinkDirectory />}
        <Footer />
      </div>
      <ToastStack />
      <LoginPopup />
      <WhatsAppFloat />
     </PagesContext.Provider>
    </Provider>
  );
}