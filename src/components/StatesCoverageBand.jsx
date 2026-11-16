import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * "States we serve" band — a highway scene. Copy on top (passed in untouched as
 * children); below it a sunset landscape with Indian roadside milestones for the
 * four pickup states and a final "INDIA" stone for destinations across India,
 * while a cab drives past on the road. Decorative scene is aria-hidden.
 */
const STONES = [
  { code: "KA", name: "Karnataka" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "TG", name: "Telangana" },
];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.25 };

function Milestone({ code, label, name, dark, i, reduce }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEW}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.25 + i * 0.14 }}
      className="ac-stone group relative flex flex-col items-center shrink-0 snap-center"
    >
      <div className={`relative w-full transition-transform duration-500 group-hover:-translate-y-2 ${dark ? "" : ""}`}>
        {/* dome cap */}
        <div className={`h-[50px] md:h-[66px] rounded-t-[999px] grid place-items-center font-black tracking-[0.08em] ${dark ? "bg-gradient-to-b from-[#2a2a2a] to-[#0b0b0b] text-[#FFD54F] text-[14px] md:text-[15px] tracking-[0.2em]" : "bg-gradient-to-b from-[#FFDA47] to-[#F2B705] text-[#111] text-[19px] md:text-[24px]"} shadow-[inset_0_3px_0_rgba(255,255,255,.45),inset_0_-2px_0_rgba(0,0,0,.08)]`}>
          {code}
        </div>
        {/* white body */}
        <div className="bg-gradient-to-b from-white to-[#F4F1EA] px-2 pt-3 pb-5 md:pt-4 md:pb-7 text-center border-x border-[#E7E0CF] shadow-[inset_0_-6px_10px_-6px_rgba(0,0,0,.12)]">
          <div className={`text-[9.5px] md:text-[10px] font-black tracking-[0.22em] ${dark ? "text-[#111]" : "text-[#9A6B00]"}`}>{label}</div>
          <div className="mt-1 text-[12px] md:text-[14px] font-extrabold text-[#111] leading-tight">{name}</div>
        </div>
        {/* plinth */}
        <div className="h-[10px] -mx-[6px] rounded-[3px] bg-gradient-to-b from-[#CFC8B8] to-[#A9A291]" />
      </div>
      {/* ground shadow */}
      <div className="mt-[-2px] h-[10px] w-[120%] rounded-[50%] bg-black/25 blur-[5px]" />
    </motion.div>
  );
}

function Cab() {
  return (
    <svg viewBox="0 0 120 48" style={{ width: "100%", height: "100%", display: "block" }}>
      <ellipse cx="60" cy="45" rx="50" ry="3" fill="rgba(0,0,0,.35)" />
      <rect x="44" y="4" width="22" height="7" rx="2" fill="#FFD54F" stroke="#111" strokeWidth="1" />
      <text x="55" y="9.6" textAnchor="middle" fontSize="4.6" fontWeight="900" fill="#111" fontFamily="sans-serif">TAXI</text>
      <path d="M10 34 L12 24 Q14 20 20 19 L34 18 L44 11 Q48 9 54 9 L76 9 Q82 9 86 12 L96 19 L106 21 Q112 22 112 28 L112 34 Q112 37 109 37 L13 37 Q10 37 10 34 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.2" />
      <path d="M38 18 L46 12.5 Q49 11 54 11 L63 11 L63 18 Z" fill="#9CC3E6" opacity=".9" />
      <path d="M66 11 L76 11 Q81 11 84 13.5 L91 18 L66 18 Z" fill="#9CC3E6" opacity=".9" />
      <rect x="12" y="26" width="99" height="3.2" fill="#FFD54F" />
      <circle cx="104" cy="25" r="2" fill="#FFF1B8" />
      <g className="ac-wheel" style={{ transformOrigin: "30px 37px" }}><circle cx="30" cy="37" r="8" fill="#1a1a1a" /><circle cx="30" cy="37" r="3.4" fill="#cfcfcf" /><path d="M30 31v12M24 37h12" stroke="#888" strokeWidth="1" /></g>
      <g className="ac-wheel" style={{ transformOrigin: "92px 37px" }}><circle cx="92" cy="37" r="8" fill="#1a1a1a" /><circle cx="92" cy="37" r="3.4" fill="#cfcfcf" /><path d="M92 31v12M86 37h12" stroke="#888" strokeWidth="1" /></g>
    </svg>
  );
}

function Scene({ reduce }) {
  return (
    <div className="relative mt-10 md:mt-6" aria-hidden>
      {/* landscape */}
      <div className="absolute inset-x-0 bottom-[96px] md:bottom-[112px] h-[260px] md:h-[300px] -z-0 pointer-events-none">
        <div className="ac-sun absolute right-[10%] top-[8%] w-[120px] h-[120px] md:w-[160px] md:h-[160px] rounded-full" style={{ background: "radial-gradient(circle at 50% 50%,#FFF3B0 0%,#FFD54F 45%,rgba(255,213,79,0) 72%)" }} />
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
          <path d="M0 170 C 160 110, 300 150, 420 120 S 700 60, 860 110 S 1150 70, 1300 100 S 1440 90, 1440 90 L1440 300 L0 300 Z" fill="#F6E3A6" />
          <path d="M0 210 C 200 160, 340 200, 520 170 S 820 130, 980 175 S 1260 150, 1440 165 L1440 300 L0 300 Z" fill="#EFD37F" />
          <path d="M0 250 C 180 225, 380 245, 560 228 S 900 205, 1080 232 S 1320 220, 1440 228 L1440 300 L0 300 Z" fill="#E4BF58" />
          {[[40, 238], [120, 232], [210, 230], [330, 226], [470, 222], [560, 218], [690, 214], [800, 220], [930, 224], [1050, 226], [1170, 222], [1270, 224], [1360, 226], [1420, 230]].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y})`}>
              <rect x="-2" y="-4" width="4" height="16" fill="#8a6a1c" />
              <circle cx="0" cy="-14" r={k % 2 ? 13 : 16} fill={k % 3 ? "#B9952E" : "#A8841F"} />
            </g>
          ))}
        </svg>
      </div>

      {/* milestones on the roadside */}
      <div className="relative z-10 max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="flex items-end gap-4 md:gap-0 md:justify-between overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-1 -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none] [&>*]:w-[108px] md:[&>*]:w-[128px] lg:[&>*]:w-[138px] md:px-[3%]">
          {STONES.map((s, i) => <Milestone key={s.code} {...s} label="PICKUP" i={i} reduce={reduce} />)}
          <div className="!w-[150px] md:!w-[176px] lg:!w-[196px] shrink-0 snap-center">
            <Milestone code="INDIA" label="DROP" name="Destinations across India" dark i={4} reduce={reduce} />
          </div>
        </div>
      </div>

      {/* road */}
      <div className="relative h-[96px] md:h-[112px] bg-gradient-to-b from-[#353535] to-[#232323] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[7px] bg-[#E8DFC8]" />
        <div className="absolute inset-x-0 top-[7px] h-[3px] bg-white/70" />
        <div className="ac-lane absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2" style={{ background: "repeating-linear-gradient(90deg,#FFD54F 0 64px,transparent 64px 120px)" }} />
        <div className="absolute inset-x-0 bottom-[8px] h-[2px] bg-white/30" />
        {!reduce && (
          <div className="ac-cab absolute bottom-[14px] md:bottom-[18px] w-[120px] md:w-[150px] h-[48px] md:h-[60px]">
            <Cab />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatesCoverageBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-states ac-cv relative overflow-hidden isolate pt-16 md:pt-24" style={{ background: "linear-gradient(180deg,#FFFCF0 0%,#FFF4CF 55%,#FFE9A8 100%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#9A6B00 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
      <div className="relative z-10 max-w-[1264px] mx-auto px-5 sm:px-6">
        <motion.div
          className="max-w-[760px]"
          initial={reduce ? false : { opacity: 0, y: 30, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
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
      </div>
      <Scene reduce={reduce} />
    </section>
  );
}
