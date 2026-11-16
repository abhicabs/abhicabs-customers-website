import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MAP_DATA } from "./coverageMapData";

/**
 * Dark "states we serve" band: copy on the left (passed in untouched as children),
 * an animated map of the four states on the right. Presentation only — the map is
 * decorative (aria-hidden) and reuses the same geometry as the Home coverage map.
 */
const STATES = ["Karnataka", "Andhra Pradesh", "Maharashtra", "Telangana"];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.2 };

function Mini({ name }) {
  const md = MAP_DATA.states[name]?.mini;
  if (!md) return null;
  return (
    <svg viewBox={`0 0 ${md.w} ${md.h}`} aria-hidden style={{ height: 38, width: 46, display: "block" }} preserveAspectRatio="xMidYMid meet">
      <path d={md.d} fill="url(#acBandG)" stroke="#FFE79A" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
  );
}

function StateMap({ reduce }) {
  const md = MAP_DATA;
  return (
    <svg viewBox={`0 0 ${md.vb.w} ${md.vb.h}`} aria-hidden style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="acBandG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD24A" />
          <stop offset="100%" stopColor="#B8790A" />
        </linearGradient>
        <filter id="acBandGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Each state: outline draws in, then the gold fill fades up */}
      {STATES.filter((n) => md.states[n]).map((n, i) => (
        <g key={n}>
          <motion.path
            d={md.states[n].big}
            fill="url(#acBandG)"
            filter="url(#acBandGlow)"
            initial={reduce ? false : { fillOpacity: 0 }}
            whileInView={{ fillOpacity: 0.88 }}
            viewport={VIEW}
            transition={{ duration: 0.9, delay: 0.7 + i * 0.18, ease: EASE }}
          />
          <motion.path
            d={md.states[n].big}
            fill="none"
            stroke="#FFE79A"
            strokeWidth="1.2"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={VIEW}
            transition={{ duration: 1.4, delay: i * 0.18, ease: "easeInOut" }}
          />
        </g>
      ))}

      {/* Travelling dotted routes between cities */}
      <motion.g initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VIEW} transition={{ duration: 0.8, delay: 1.5 }}>
        {md.connectors.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#FFF1B8" strokeWidth="1.6" strokeDasharray="1 7" strokeLinecap="round">
            {!reduce && <animate attributeName="stroke-dashoffset" from="0" to="-64" dur="2s" repeatCount="indefinite" />}
          </path>
        ))}
      </motion.g>

      {/* City pins — drop in, then pulse */}
      {STATES.filter((n) => md.pins[n]).map((n, i) => {
        const p = md.pins[n];
        return (
          <g key={`p-${n}`} transform={`translate(${p.x} ${p.y})`}>
            <motion.g
              initial={reduce ? false : { y: -24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={VIEW}
              transition={{ type: "spring", stiffness: 380, damping: 16, delay: 1.3 + i * 0.12 }}
            >
              <circle r="5" fill="#FFD54F" opacity="0.45">
                {!reduce && <animate attributeName="r" values="5;18;5" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />}
                {!reduce && <animate attributeName="opacity" values=".45;0;.45" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />}
              </circle>
              <circle r="5.5" fill="#111" stroke="#FFD54F" strokeWidth="2.5" />
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

export default function StatesCoverageBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-cv relative overflow-hidden isolate py-16 md:py-24" style={{ background: "linear-gradient(135deg,#1C1C1C,#0a0a0a)" }}>
      {/* depth: dot grid + gold glows */}
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <div aria-hidden className="ac-hero-glow absolute -z-10 right-[8%] top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.16), transparent 65%)" }} />
      <div aria-hidden className="absolute -z-10 -left-32 -bottom-32 w-[380px] h-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.1), transparent 65%)" }} />

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        {/* Copy */}
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
          <div className="ac-states-copy">{children}</div>

          {/* State tiles */}
          <ul className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3" aria-hidden>
            {STATES.map((n, i) => (
              <motion.li
                key={n}
                initial={reduce ? false : { opacity: 0, y: 18, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={VIEW}
                transition={{ duration: 0.55, delay: 0.4 + i * 0.1, ease: EASE }}
                className="ac-glass rounded-2xl px-3 py-3.5 flex flex-col items-center justify-center gap-2 text-center h-full min-h-[92px]"
              >
                <Mini name={n} />
                <span className="text-[12.5px] font-bold text-white/90 leading-tight">{n}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={VIEW}
          transition={{ duration: 1, ease: EASE }}
          className="relative mx-auto w-full max-w-[460px]"
        >
          <div aria-hidden className="ac-ring absolute inset-[6%] rounded-full border border-dashed border-[#FFD54F]/25" />
          <div aria-hidden className="ac-ring-rev absolute inset-[16%] rounded-full border border-[#FFD54F]/10" />
          <div className="relative p-[8%]"><StateMap reduce={reduce} /></div>
        </motion.div>
      </div>
    </section>
  );
}
