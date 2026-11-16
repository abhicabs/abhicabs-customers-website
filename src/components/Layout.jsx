import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store, rehydrateStore } from "../store/store";
import Header from "./Header";
import Footer from "./Footer";
import ToastStack from "./ToastStack";
import LoginPopup from "./LoginPopup";
import WhatsAppFloat from "./WhatsAppFloat";
import BookingWidget from "./BookingWidget";
import { usePageContext } from "vike-react/usePageContext";
import { PagesContext } from "../hooks/usePageContent";
import "../styles/global.css";

/* Pages where the global booking strip should NOT appear */
const HIDE_BOOKING_ON = ["/about", "/contact", "/contact-us"];

function GlobalBookingStrip() {
  const { urlPathname } = usePageContext();
  const path = (urlPathname || "/").replace(/\/+$/, "") || "/";

  const hide = HIDE_BOOKING_ON.some(
    (p) => path === p || path.startsWith(p + "/")
  );
  if (hide) return null;

  /* Don't double-render on pages that already embed their own widget */
  const pageAlreadyHasWidget =
    path === "/" ||
    path.startsWith("/booking") ||
    path.startsWith("/checkout") ||
    path.startsWith("/confirmation") ||
    path.startsWith("/payment") ||
    path.startsWith("/cab-details") ||
    path.startsWith("/tracking") ||
    path.startsWith("/my-booking") ||
    path.startsWith("/login") ||
    path.startsWith("/delete-account") ||
    path.startsWith("/support-tickets") ||
    path.startsWith("/admin") ||
    path.startsWith("/offers") ||
    path.startsWith("/outstation") ||
    path.startsWith("/cities/") ||
    (path.startsWith("/services/") && path !== "/services");

  if (pageAlreadyHasWidget) return null;

  return (
    <div
      id="booking"
      style={{
        width: "100%",
        maxWidth: 1120,
        margin: "-48px auto 0",
        position: "relative",
        zIndex: 20,
        padding: "0 16px",
        scrollMarginTop: 96,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <BookingWidget initialMode="one-way" />
      </div>
    </div>
  );
}

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
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("mouseover", onOver); document.removeEventListener("pointerdown", onDown); clearTimeout(hoverT); cancelAnimationFrame(raf); };
  }, []);

  return (
    <Provider store={store}>
     <PagesContext.Provider value={serverPages}>
      <div aria-hidden className="ac-progress" />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
          <GlobalBookingStrip />
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