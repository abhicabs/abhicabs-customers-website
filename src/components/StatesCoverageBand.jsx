import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

/**
 * "States we serve" band — copy on the left (passed in untouched as children),
 * a ride-booking visual on the right: a real photo with a floating "Pickup from"
 * card (the four states) and a "Drop to" card (destinations across India), joined
 * by a dotted route a little car keeps driving along. Decorative only.
 */
const STATES = ["Karnataka", "Andhra Pradesh", "Maharashtra", "Telangana"];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.25 };
const ROUTE = "M22 46 C 8 68, 82 60, 76 88";

function RideVisual({ reduce }) {
  const pop = (d, from = { opacity: 0, y: 30, scale: 0.94 }) =>
    reduce ? {} : { initial: from, whileInView: { opacity: 1, y: 0, x: 0, scale: 1 }, viewport: VIEW, transition: { duration: 0.8, delay: d, ease: EASE } };

  return (
    <div className="relative w-full max-w-[520px] mx-auto" aria-hidden>
      {/* photo */}
      <motion.div {...pop(0, { opacity: 0, scale: 0.92 })} className="relative overflow-hidden rounded-[28px] aspect-[5/6] shadow-[0_40px_80px_-30px_rgba(120,80,0,.55)] ring-1 ring-black/5">
        <img src="/images/hero-hill-road.webp" srcSet="/images/hero-hill-road-900.webp 900w, /images/hero-hill-road.webp 1672w" sizes="(min-width:1024px) 520px, 100vw" alt="" loading="lazy" decoding="async" className="ac-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,0) 55%,rgba(0,0,0,.55) 100%)" }} />

        {/* dotted route + a car driving it, between the two cards (same SVG → always aligned) */}
        <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
          <path d={ROUTE} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="2.6" strokeLinecap="round" />
          <path d={ROUTE} fill="none" stroke="#FFD54F" strokeWidth="1.1" strokeDasharray="1.6 2.6" strokeLinecap="round" className="ac-route-flow" />
          <circle cx="22" cy="46" r="2.2" fill="#FFD54F" stroke="#111" strokeWidth=".8" />
          <circle cx="76" cy="88" r="2.2" fill="#111" stroke="#FFD54F" strokeWidth=".8" />
          {!reduce && (
            <g>
              <animateMotion dur="5.5s" repeatCount="indefinite" path={ROUTE} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".45 .05 .55 .95" />
              <circle r="7" fill="rgba(255,213,79,.35)" />
              <circle r="5" fill="#FFD54F" stroke="#111" strokeWidth=".5" />
              <g transform="translate(-3.3 -3.3) scale(.275)" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
              </g>
            </g>
          )}
        </svg>
      </motion.div>

      {/* Pickup card */}
      <motion.div {...pop(0.35, { opacity: 0, x: -30, y: 0 })} className="ac-float absolute -left-3 sm:-left-8 top-[7%] w-[78%] sm:w-[72%] rounded-2xl bg-white/95 backdrop-blur p-4 shadow-[0_24px_50px_-18px_rgba(0,0,0,.45)] ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#9A6B00]">
          <span className="relative grid place-items-center w-5 h-5 rounded-full bg-[#FFD54F] text-[#111]"><MapPin size={11} strokeWidth={2.8} /></span>
          Pickup from
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {STATES.map((n, i) => (
            <motion.span
              key={n}
              {...(reduce ? {} : { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 }, viewport: VIEW, transition: { type: "spring", stiffness: 380, damping: 18, delay: 0.6 + i * 0.1 } })}
              className="flex items-center gap-1.5 rounded-xl bg-[#FFF8DC] ring-1 ring-[#F5E3A8] px-2.5 py-2 text-[12.5px] font-bold text-[#111] leading-tight"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E6AC00] shrink-0" />
              {n}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* Drop card */}
      <motion.div {...pop(0.6, { opacity: 0, x: 30, y: 0 })} className="ac-float ac-float-2 absolute -right-3 sm:-right-8 bottom-[8%] w-[70%] sm:w-[62%] rounded-2xl bg-[#111] text-white p-4 shadow-[0_24px_50px_-18px_rgba(0,0,0,.6)] ring-1 ring-white/10">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#FFD54F]">
          <Navigation size={13} strokeWidth={2.6} />
          Drop to
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="relative grid place-items-center w-10 h-10 rounded-full bg-[#FFD54F] text-[#111] shrink-0">
            <span className="ac-hub-pulse absolute inset-0 rounded-full" />
            <MapPin size={18} strokeWidth={2.5} className="relative" />
          </span>
          <span className="text-[16px] font-extrabold leading-tight">Destinations across India</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function StatesCoverageBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-states ac-cv relative overflow-hidden isolate py-16 md:py-24" style={{ background: "linear-gradient(160deg,#FFFBEA 0%,#FFF3C9 50%,#FFFDF5 100%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.09]" style={{ backgroundImage: "radial-gradient(#9A6B00 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <div aria-hidden className="ac-hero-glow absolute -z-10 right-[6%] top-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.55), transparent 62%)" }} />
      {/* big faint route swoosh behind everything */}
      <svg aria-hidden viewBox="0 0 1200 500" preserveAspectRatio="none" className="absolute inset-0 -z-10" style={{ width: "100%", height: "100%" }}>
        <path className="ac-swoosh" d="M-50 420 C 250 300, 420 470, 700 300 S 1100 120, 1260 160" fill="none" stroke="rgba(230,172,0,.35)" strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
      </svg>

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-16 items-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -40, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.span
            aria-hidden
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEW}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="block h-[3px] w-14 mb-5 rounded-full origin-left bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00]"
          />
          {children}
        </motion.div>

        <div className="px-4 sm:px-8"><RideVisual reduce={reduce} /></div>
      </div>
    </section>
  );
}
