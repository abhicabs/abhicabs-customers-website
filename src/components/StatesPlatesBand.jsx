import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Services page — "states" band as Indian commercial (yellow) number plates.
 * Copy is passed in untouched as children; plates are decorative (aria-hidden).
 */
const PLATES = [
  { code: "KA", name: "Karnataka" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "TG", name: "Telangana" },
];
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.3 };

export default function StatesPlatesBand({ children }) {
  const reduce = useReducedMotion();
  return (
    <section className="ac-states ac-cv relative overflow-hidden isolate py-16 md:py-24 bg-white">
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(60% 80% at 100% 0%, rgba(255,213,79,.18), transparent 60%), radial-gradient(50% 70% at 0% 100%, rgba(255,213,79,.12), transparent 60%)" }} />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.05]" style={{ backgroundImage: "repeating-linear-gradient(135deg,#111 0 2px,transparent 2px 22px)" }} />

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <motion.div
          className="max-w-[780px]"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <motion.span aria-hidden initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={VIEW} transition={{ duration: 0.8, delay: 0.2, ease: EASE }} className="block h-[3px] w-14 mb-5 rounded-full origin-left bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00]" />
          {children}
        </motion.div>

        <div aria-hidden className="mt-12 md:mt-14 [perspective:1200px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {PLATES.map((p, i) => (
              <motion.div
                key={p.code}
                initial={reduce ? false : { opacity: 0, rotateX: -95, y: -10 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={VIEW}
                transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.25 + i * 0.22 }}
                style={{ transformOrigin: "50% 0%" }}
                className="group"
              >
                {/* mounting screws + plate */}
                <div className="ac-plate relative grid grid-cols-[30px_1fr] md:grid-cols-[36px_1fr] rounded-[14px] border-[3px] border-[#111] overflow-hidden bg-gradient-to-b from-[#FFDD55] to-[#F5C21B] shadow-[0_22px_34px_-18px_rgba(0,0,0,.55),inset_0_2px_0_rgba(255,255,255,.65)] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:[transform:rotateX(8deg)_translateY(-6px)]">
                  <div className="bg-[#1d4ed8] text-white flex flex-col items-center justify-end pb-2.5 gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/70 grid place-items-center text-[7px]">✦</span>
                    <span className="text-[9px] font-black tracking-[0.1em] [writing-mode:vertical-rl] rotate-180">IND</span>
                  </div>
                  <div className="relative text-center px-2 pt-4 pb-4 md:pt-5 md:pb-5">
                    <span className="absolute left-2.5 top-2.5 w-2 h-2 rounded-full bg-[#9a7a12] shadow-[inset_0_1px_1px_rgba(0,0,0,.4)]" />
                    <span className="absolute right-2.5 top-2.5 w-2 h-2 rounded-full bg-[#9a7a12] shadow-[inset_0_1px_1px_rgba(0,0,0,.4)]" />
                    <div className="text-[44px] md:text-[64px] leading-none font-black tracking-[0.08em] text-[#111]" style={{ textShadow: "0 1px 0 rgba(255,255,255,.5)" }}>{p.code}</div>
                    <div className="mt-2 text-[9.5px] md:text-[10px] font-black tracking-[0.24em] text-[#6b4e00]">PICKUP</div>
                    <div className="text-[13px] md:text-[15px] font-extrabold text-[#111] leading-tight">{p.name}</div>
                    <span className="ac-plate-shine absolute inset-0 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* drop bar */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.7, delay: 1.25, ease: EASE }}
            className="relative mt-5 overflow-hidden rounded-2xl bg-[#111] text-white px-5 py-4 md:py-5 flex items-center justify-center gap-4"
          >
            <span className="text-[11px] font-black tracking-[0.22em] text-[#FFD54F]">DROP</span>
            <span className="text-[16px] md:text-[19px] font-extrabold">Destinations across India</span>
            <span className="ac-drop-arrow text-[#FFD54F] text-[20px] font-black">→</span>
            <span className="ac-hero-sweep absolute inset-0 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
