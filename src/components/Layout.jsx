import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store, rehydrateStore } from "../store/store";
import Header from "./Header";
import Footer from "./Footer";
import ToastStack from "./ToastStack";
import LoginPopup from "./LoginPopup";
import WhatsAppFloat from "./WhatsAppFloat";
import { usePageContext } from "vike-react/usePageContext";
import { PagesContext } from "../hooks/usePageContent";
import "../styles/global.css";

export default function Layout({ children }) {
  const serverPages = usePageContext().data?.allPages ?? null;
  useEffect(() => {
    rehydrateStore();
  }, []);

  // Card spotlight: one delegated, rAF-throttled listener feeds the cursor
  // position to .ac-card (see global.css). Mouse-only, skipped on touch.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover)").matches) return;
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
        // subtle 3D tilt, max ±4°
        card.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width) - 0.5) * 8}deg`);
        card.style.setProperty("--rx", `${(0.5 - ((e.clientY - r.top) / r.height)) * 8}deg`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });

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
    document.addEventListener("mouseover", onOver, { passive: true });

    // Click ripple on brand buttons
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
    document.addEventListener("pointerdown", onDown, { passive: true });

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
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("mouseover", onOver); document.removeEventListener("pointerdown", onDown); document.removeEventListener("click", onClickBook); window.removeEventListener("hashchange", onHash); clearTimeout(hoverT); cancelAnimationFrame(raf); };
  }, []);

  return (
    <Provider store={store}>
     <PagesContext.Provider value={serverPages}>
      <div aria-hidden className="ac-progress" />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <ToastStack />
      <LoginPopup />
      <WhatsAppFloat />
     </PagesContext.Provider>
    </Provider>
  );
}