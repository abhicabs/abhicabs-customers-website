import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Button from "./ui/Button";

/**
 * Outstation "Get your fare in 10 seconds" CTA — a countdown-timer band.
 * The gold ring fills and the number counts 0 → 10 once when it scrolls into
 * view (one short animation, then static). Copy is passed in untouched.
 */
const R = 54, C = 2 * Math.PI * R;

export default function FareCountdownCta({ title, text, primary, secondary }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(reduce ? 10 : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    const t = setInterval(() => { i += 1; setN(i); if (i >= 10) clearInterval(t); }, 140);
    return () => clearInterval(t);
  }, [inView, reduce]);

  return (
    <section className="ac-cta relative overflow-hidden isolate border-t border-[#F1E3B5]" style={{ background: "linear-gradient(120deg,#FFFDF5 0%,#FFF6D9 55%,#FFEDB3 100%)" }}>
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.06]" style={{ backgroundImage: "repeating-linear-gradient(135deg,#9A6B00 0 1px,transparent 1px 18px)" }} />
      <div aria-hidden className="absolute -z-10 -left-24 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.45), transparent 65%)" }} />

      <div className="max-w-[1100px] mx-auto px-6 py-14 md:py-20 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
        {/* timer */}
        <div ref={ref} className="relative mx-auto w-[200px] h-[200px] md:w-[230px] md:h-[230px]" aria-hidden>
          <svg viewBox="0 0 140 140" style={{ width: "100%", height: "100%", display: "block" }}>
            <defs>
              <linearGradient id="acTimerG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFD54F" /><stop offset="1" stopColor="#E6AC00" /></linearGradient>
            </defs>
            {/* crown */}
            <rect x="61" y="2" width="18" height="9" rx="3" fill="#111" />
            <rect x="67" y="9" width="6" height="7" fill="#111" />
            {/* face */}
            <circle cx="70" cy="74" r="64" fill="#111" />
            <circle cx="70" cy="74" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
            <motion.circle
              cx="70" cy="74" r={R} fill="none" stroke="url(#acTimerG)" strokeWidth="9" strokeLinecap="round"
              transform="rotate(-90 70 74)" strokeDasharray={C}
              initial={{ strokeDashoffset: reduce ? 0 : C }}
              animate={{ strokeDashoffset: inView || reduce ? 0 : C }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i * 36 * Math.PI) / 180;
              return <circle key={i} cx={70 + 42 * Math.sin(a)} cy={74 - 42 * Math.cos(a)} r="1.6" fill={i < n ? "#FFD54F" : "rgba(255,255,255,.25)"} />;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center pt-4">
            <div className="text-center leading-none">
              <span className="block text-[56px] md:text-[64px] font-black text-white tabular-nums">{n}</span>
              <span className="block mt-1 text-[11px] font-black tracking-[0.3em] text-[#FFD54F]">SEC</span>
            </div>
          </div>
        </div>

        {/* copy + actions */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center md:text-left"
        >
          <h2 className="text-[30px] md:text-[42px] font-extrabold tracking-tight leading-[1.08] text-[#111]">{title}</h2>
          <p className="mt-4 text-[#4B5563] text-[15.5px] md:text-[17px] leading-relaxed max-w-[560px] mx-auto md:mx-0">{text}</p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Button href={primary.href} size="lg" className="bg-[#111]! text-white! hover:bg-black! shadow-[0_14px_30px_-12px_rgba(0,0,0,.5)] justify-center">{primary.label}</Button>
            <Button href={secondary.href} size="lg" variant="outline" className="border-2! border-[#111]! text-[#111]! bg-transparent! hover:bg-[#111]! hover:text-white! justify-center">{secondary.label}</Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
