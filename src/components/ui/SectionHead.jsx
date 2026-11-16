import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Brand-aligned section head — the gold accent bar and underline draw in as the
// heading scrolls into view. `light` for dark backgrounds; `id` wires aria-labelledby.
const EASE = [0.22, 1, 0.36, 1];

export default function SectionHead({ eyebrow, title, subheading, description, center = false, light = false, id, className = "" }) {
  const reduce = useReducedMotion();
  const inView = (from, to, delay = 0) =>
    reduce ? {} : { initial: from, whileInView: to, viewport: { once: true, margin: "0px 0px -60px 0px" }, transition: { duration: 0.8, delay, ease: EASE } };
  return (
    <div className={`max-w-[640px] ${center ? "text-center mx-auto" : ""} ${className}`.trim()}>
      {eyebrow && (
        <div className={`flex items-center gap-2.5 mb-3 ${center ? "justify-center" : ""}`}>
          <motion.span {...inView({ scaleX: 0 }, { scaleX: 1 })} className="h-[3px] w-8 bg-primary rounded-full origin-left" />
          <motion.span {...inView({ opacity: 0, x: -8 }, { opacity: 1, x: 0 }, 0.1)} className={`text-[12px] font-black uppercase tracking-[0.2em] ${light ? "text-white/60" : "text-text-secondary"}`}>{eyebrow}</motion.span>
        </div>
      )}
      <h2 id={id ? `${id}-title` : undefined} className={`text-[27px] md:text-[38px] font-black tracking-tight leading-tight ${light ? "text-white" : "text-text"}`}>{title}</h2>
      {!reduce && (
        <motion.span
          aria-hidden
          {...inView({ scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1 }, 0.2)}
          className={`block h-[3px] w-14 mt-4 rounded-full bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00] ${center ? "mx-auto origin-center" : "origin-left"}`}
        />
      )}
      {subheading && <h3 className={`mt-3 text-[17px] md:text-[20px] font-bold leading-snug ${light ? "text-white/85" : "text-text"}`}>{subheading}</h3>}
      {description && <p className={`mt-3 text-[16px] md:text-[17px] leading-relaxed ${light ? "text-white/70" : "text-text-secondary"}`}>{description}</p>}
    </div>
  );
}
