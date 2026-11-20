import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Fleet page — "states" band as a car speedometer: copy on the left (children,
 * untouched), a dark dial on the right whose gold arc fills and needle sweeps up,
 * with the four pickup states on the arc and destinations fanning out beyond it.
 */
const STATES = ["Karnataka", "Andhra Pradesh", "Maharashtra", "Telangana"];
const DEG = [160, 115, 65, 20];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.3 };
const CX = 50, CY = 58, RA = 36, H = 74;
const A = (r, d) => { const a = (d * Math.PI) / 180; return [CX + r * Math.cos(a), CY - r * Math.sin(a)]; };
const ARC = `M${CX - RA} ${CY} A${RA} ${RA} 0 0 1 ${CX + RA} ${CY}`;
const CAR = "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2";

function Gauge({ reduce }) {
  const draw = (d, dur = 1.4) => (reduce ? {} : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: VIEW, transition: { duration: dur, delay: d, ease: "easeInOut" } });
  return (
    <div className="relative w-full max-w-[560px] mx-auto" style={{ aspectRatio: `100 / ${H}` }} aria-hidden>
      <svg viewBox={`0 0 100 ${H}`} style={{ width: "100%", height: "100%", display: "block", overflow: "visible", filter: "drop-shadow(0 26px 30px rgba(0,0,0,.28))" }}>
        <defs>
          <linearGradient id="acGa" x1="0" x2="1"><stop offset="0" stopColor="#E6AC00" /><stop offset=".6" stopColor="#FFD54F" /><stop offset="1" stopColor="#FFF1B8" /></linearGradient>
          <radialGradient id="acDk" cx="50%" cy="85%" r="80%"><stop offset="0" stopColor="#2b2b2b" /><stop offset="1" stopColor="#0a0a0a" /></radialGradient>
          <filter id="acGlo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {/* dial body */}
        <path d={`M${CX - 48} ${CY + 6} A48 48 0 0 1 ${CX + 48} ${CY + 6} L${CX + 48} ${CY + 10} L${CX - 48} ${CY + 10} Z`} fill="url(#acDk)" />
        <path d={`M${CX - 48} ${CY + 6} A48 48 0 0 1 ${CX + 48} ${CY + 6}`} fill="none" stroke="rgba(255,213,79,.4)" strokeWidth=".4" />
        {/* track + glowing arc */}
        <path d={ARC} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" strokeLinecap="round" />
        <motion.path d={ARC} fill="none" stroke="url(#acGa)" strokeWidth="2.4" strokeLinecap="round" filter="url(#acGlo)" {...draw(0.2, 1.6)} />
        {/* ticks */}
        {Array.from({ length: 25 }, (_, i) => {
          const [x1, y1] = A(RA - 6, 180 - i * 7.5), [x2, y2] = A(RA - (i % 3 === 0 ? 9.5 : 8), 180 - i * 7.5);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`rgba(255,255,255,${i % 3 === 0 ? 0.7 : 0.25})`} strokeWidth={i % 3 === 0 ? 0.5 : 0.3} />;
        })}
        {/* destination fans */}
        {DEG.map((d, si) => [-12, 0, 12].map((off, k) => {
          const [sx, sy] = A(RA, d), [ex, ey] = A(RA + 15, d + off);
          return (
            <g key={`${si}${k}`}>
              <motion.line x1={sx} y1={sy} x2={ex} y2={ey} stroke="rgba(230,172,0,.7)" strokeWidth=".35" strokeDasharray=".6 1" {...draw(1.2 + si * 0.25, 0.6)} />
              <motion.g initial={reduce ? false : { opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={VIEW} transition={{ delay: 1.6 + si * 0.25 + k * 0.06, type: "spring", stiffness: 400, damping: 14 }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                <circle cx={ex} cy={ey} r="2" fill="rgba(255,213,79,.4)" />
                <circle cx={ex} cy={ey} r=".9" fill="#111" className="ac-twinkle" style={{ animationDelay: `${(si * 3 + k) * 0.3}s` }} />
              </motion.g>
            </g>
          );
        }))}
        {/* needle sweeps from 180° to settle */}
        <g transform={`translate(${CX} ${CY})`}>
          <motion.g
            initial={reduce ? { rotate: 55 } : { rotate: -90 }}
            whileInView={{ rotate: reduce ? 55 : [-90, 65, 48, 55] }}
            viewport={VIEW}
            transition={{ duration: 2.2, delay: 0.3, times: [0, 0.6, 0.8, 1], ease: "easeOut" }}
            style={{ originX: 0.5, originY: 1 }}
          >
            <line x1="0" y1="0" x2="0" y2={-(RA - 10)} stroke="rgba(255,213,79,.35)" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="0" y2={-(RA - 10)} stroke="#FFD54F" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="0" cy={-(RA - 10)} r=".9" fill="#FFF1B8" />
          </motion.g>
        </g>
      </svg>

      {/* state chips on the arc */}
      {STATES.map((n, i) => {
        const [x, y] = A(RA, DEG[i]);
        return (
          <motion.div key={n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${(y / H) * 100}%` }}
            initial={reduce ? false : { opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={VIEW}
            transition={{ type: "spring", stiffness: 340, damping: 16, delay: 0.7 + i * 0.25 }}>
            <div className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 whitespace-nowrap bg-gradient-to-b from-[#262626] to-[#0e0e0e] text-white ring-1 ring-[#FFD54F]/40 shadow-[0_12px_26px_-10px_rgba(0,0,0,.7)]">
              <span className="grid place-items-center w-6 h-6 rounded-full bg-gradient-to-br from-[#FFE98A] via-[#FFD54F] to-[#E6AC00] text-[#111] text-[10px] font-black">{i + 1}</span>
              <span className="text-[11.5px] md:text-[12.5px] font-bold">{n}</span>
            </div>
          </motion.div>
        );
      })}

      {/* hub */}
      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${CX}%`, top: `${(CY / H) * 100}%` }}
        initial={reduce ? false : { scale: 0.4, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={VIEW} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
        <span className="ac-hub-pulse absolute inset-0 rounded-full" />
        <div className="relative grid place-items-center w-[clamp(58px,6.5vw,80px)] h-[clamp(58px,6.5vw,80px)] rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFE98A,#FFD54F_50%,#E6AC00)] shadow-[0_16px_40px_-8px_rgba(230,172,0,.8),inset_0_2px_0_rgba(255,255,255,.6)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "48%", height: "48%" }}>
            <path d={CAR} /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export default function StatesGaugeBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-states ac-cv relative overflow-hidden isolate py-16 md:py-24" style={{ background: "linear-gradient(160deg,#FFFBEA 0%,#FFF1C2 55%,#FFFDF5 100%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.08]" style={{ backgroundImage: "radial-gradient(#9A6B00 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div aria-hidden className="ac-hero-glow absolute -z-10 right-[8%] top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.5), transparent 62%)" }} />
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-14 items-center">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.span aria-hidden initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className="block h-[3px] w-14 mb-5 rounded-full origin-left bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00]" />
          {children}
        </motion.div>
        <div className="px-6 sm:px-10 pt-6"><Gauge reduce={reduce} /></div>
      </div>
    </section>
  );
}
