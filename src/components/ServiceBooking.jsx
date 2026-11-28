import React from "react";
import BookingWidget from "./BookingWidget";
import Reveal from "./ui/Reveal";

/**
 * The exact Home-hero booking card (BookingWidget), reusable on service pages.
 * Submitting creates a journey in the store and goes to /booking-search — the
 * same live fare lookup + booking flow as the Home page. No separate logic.
 *
 * Remount (via `widgetKey`) to switch trip type / preset a route.
 * `presetJourney` ({ tripType, package, pickup, drop, … }) presets a full journey.
 */
export default function ServiceBooking({ widgetKey, initialMode = "one-way", presetPickup = "", presetDrop = "", presetJourney = null, id = "booking", className = "" }) {
  return (
    <Reveal y={28}>
      <div
        id={id}
        className={className}
        style={{
          width: "100%", maxWidth: 1120, scrollMarginTop: 96,
          background: "#fff", borderRadius: 22, overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,.28)", border: "1px solid rgba(255,255,255,.12)",
        }}
      >
        <BookingWidget key={widgetKey} initialMode={initialMode} presetPickup={presetPickup} presetDrop={presetDrop} presetJourney={presetJourney} />
      </div>
    </Reveal>
  );
}

export function scrollToBooking(id = "booking") {
  if (typeof document === "undefined") return;
  if (typeof id !== "string") id = "booking"; // guard: called directly as an onClick handler (receives the click event)
  const go = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(go, 60);
  // A widget that animates in (e.g. the round-trip form) makes framer-motion measure it, which
  // resets the window scroll and cancels the smooth scroll above. If we didn't arrive, go again.
  const retry = () => {
    const el = document.getElementById(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) go();
  };
  setTimeout(retry, 450);
  setTimeout(retry, 1100);
}
