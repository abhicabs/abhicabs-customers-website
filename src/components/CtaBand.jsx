import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Full-bleed dark CTA band used at the end of service and city pages.
 * Copy is passed in untouched; this only handles presentation:
 *  - the page's own photo, heavily darkened, slowly drifting behind the copy
 *  - copy left, actions right in a column of equal-width buttons
 *  - `.ac-cta` lets the footer butt straight up against it (no white gap)
 */
const EASE = [0.22, 1, 0.36, 1];
const VIEW = { once: true, amount: 0.3 };

export default function CtaBand({ title, subheading, description, actions, image }) {
  const reduce = useReducedMotion();
  const rise = (d) => (reduce ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: VIEW, transition: { duration: 0.8, delay: d, ease: EASE } });
  return (
    <section className="ac-cta relative overflow-hidden isolate bg-[#0d0d0d]">
      {image && (
        <div aria-hidden className="absolute -inset-[4%] -z-20">
          <img src={image} alt="" loading="lazy" decoding="async" className="ac-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.32 }} />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "linear-gradient(100deg,#0d0d0d 0%,rgba(13,13,13,.92) 45%,rgba(13,13,13,.7) 100%)" }} />
      <div aria-hidden className="ac-hero-glow absolute -z-10 -left-24 -top-24 w-[460px] h-[460px] rounded-full" style={{ background: "radial-gradient(circle,rgba(255,213,79,.18),transparent 65%)" }} />
      <div aria-hidden className="ac-hero-sweep absolute inset-0 -z-10 pointer-events-none" />
      <div aria-hidden className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFD54F]/50 to-transparent" />

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center text-white">
        <div>
          <motion.span aria-hidden {...(reduce ? {} : { initial: { scaleX: 0 }, whileInView: { scaleX: 1 }, viewport: VIEW, transition: { duration: 0.8, ease: EASE } })} className="block h-[3px] w-14 mb-5 rounded-full origin-left bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00]" />
          <motion.h2 {...rise(0.05)} className="text-[28px] md:text-[40px] font-extrabold tracking-tight leading-[1.12] [text-wrap:balance]">{title}</motion.h2>
          {subheading && <motion.p {...rise(0.15)} className="mt-3 font-bold text-[16px] md:text-[18px]"><span className="ac-gold-shimmer">{subheading}</span></motion.p>}
          {description && <motion.p {...rise(0.25)} className="mt-4 text-white/78 text-[15px] md:text-[16px] leading-[1.75] max-w-[640px]">{description}</motion.p>}
        </div>
        <motion.div {...rise(0.3)} className="flex flex-col gap-3 w-full max-w-[400px] lg:justify-self-end [&>*]:w-full [&>*]:justify-center">
          {actions}
        </motion.div>
      </div>
    </section>
  );
}
