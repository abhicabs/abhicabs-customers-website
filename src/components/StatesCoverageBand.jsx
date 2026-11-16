import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Car, MapPin } from "lucide-react";

/**
 * Dark "states we serve" band: copy on the left (passed in untouched as children),
 * a "live route hub" on the right — the four pickup states orbit a central dispatch
 * hub, with gold dots travelling along the spokes. Decorative only (aria-hidden).
 * Deliberately different from the Home page coverage map.
 */
const STATES = ["Karnataka", "Andhra Pradesh", "Maharashtra", "Telangana"];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.2 };
const R = 41; // orbit radius, % of the box

function RouteHub({ reduce }) {
  return (
    <div className="ac-hub relative aspect-square w-full" aria-hidden>
      {/* outer compass ring with ticks (rotates slowly) */}
      <svg viewBox="0 0 100 100" className="ac-ring-rev absolute inset-0" style={{ width: "100%", height: "100%" }}>
        <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,213,79,.18)" strokeWidth=".3" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i * 6 * Math.PI) / 180, long = i % 5 === 0;
          const r1 = long ? 45.5 : 47, r2 = 49;
          return <line key={i} x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)} x2={50 + r2 * Math.cos(a)} y2={50 + r2 * Math.sin(a)} stroke={long ? "rgba(255,213,79,.45)" : "rgba(255,255,255,.12)"} strokeWidth={long ? ".5" : ".3"} />;
        })}
      </svg>

      {/* orbit: ring + spokes + travelling dots + state pins (whole layer rotates) */}
      <div className="ac-orbit absolute inset-0">
        <svg viewBox="0 0 100 100" className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,213,79,.28)" strokeWidth=".35" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth=".3" />
          {STATES.map((_, i) => {
            const a = ((i * 90 - 45) * Math.PI) / 180;
            const x = 50 + R * Math.cos(a), y = 50 + R * Math.sin(a);
            const d = `M50 50 L${x.toFixed(2)} ${y.toFixed(2)}`;
            return (
              <g key={i}>
                <path d={d} stroke="rgba(255,213,79,.35)" strokeWidth=".4" strokeDasharray=".6 1.6" fill="none" />
                {!reduce && (
                  <>
                    <circle r="1.1" fill="#FFD54F">
                      <animateMotion dur={`${2.6 + i * 0.35}s`} repeatCount="indefinite" path={d} keyPoints={i % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
                    </circle>
                    <circle r="2.6" fill="rgba(255,213,79,.18)">
                      <animateMotion dur={`${2.6 + i * 0.35}s`} repeatCount="indefinite" path={d} keyPoints={i % 2 ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear" />
                    </circle>
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {STATES.map((n, i) => {
          const a = ((i * 90 - 45) * Math.PI) / 180;
          return (
            <div key={n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VIEW}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.5 + i * 0.15 }}
              >
                <div className="ac-orbit-counter ac-glass flex items-center gap-2 rounded-full pl-2 pr-3.5 py-2 whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,.45)]">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-[#FFD54F] text-[#111] shrink-0"><MapPin size={15} strokeWidth={2.4} /></span>
                  <span className="text-[13px] font-bold text-white">{n}</span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* hub */}
      <motion.div
        initial={reduce ? false : { scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={VIEW}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="ac-hub-pulse absolute inset-0 rounded-full" />
        <span className="ac-hub-pulse ac-hub-pulse-2 absolute inset-0 rounded-full" />
        <div className="relative grid place-items-center w-[clamp(84px,9vw,112px)] h-[clamp(84px,9vw,112px)] rounded-full bg-gradient-to-br from-[#FFE27A] via-[#FFD54F] to-[#E6AC00] text-[#111] shadow-[0_0_60px_rgba(255,213,79,.45),inset_0_2px_0_rgba(255,255,255,.5)]">
          <Car size={40} strokeWidth={2.2} />
        </div>
      </motion.div>
    </div>
  );
}

export default function StatesCoverageBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-cv relative overflow-hidden isolate py-16 md:py-24" style={{ background: "linear-gradient(135deg,#1C1C1C,#0a0a0a)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <div aria-hidden className="ac-hero-glow absolute -z-10 right-[10%] top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.14), transparent 65%)" }} />
      <div aria-hidden className="absolute -z-10 -left-32 -bottom-32 w-[380px] h-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.1), transparent 65%)" }} />

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
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

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VIEW}
          transition={{ duration: 1, ease: EASE }}
          className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px] px-10 sm:px-12"
        >
          <RouteHub reduce={reduce} />
        </motion.div>
      </div>
    </section>
  );
}
