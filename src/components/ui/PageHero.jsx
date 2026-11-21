import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Breadcrumb from "./Breadcrumb";

/**
 * Shared inner-page hero — cinematic version matching the Home hero.
 *  - Ken Burns slow zoom/pan on the photo (CSS only, GPU transform, no JS cost)
 *  - layered wash + vignette + breathing gold glow for depth and legibility
 *  - shimmering gold accent/subtitle, staggered blur-in reveal of the copy
 *  - `center` centres the copy (use when a booking card sits under it)
 *  - `children` → content under the copy (booking card), `actions` → buttons
 * Content is passed in untouched — this component only changes presentation.
 */
const EASE = [0.22, 1, 0.36, 1];

/** Phone-sized source for the hero photo: Cloudinary resizes on the fly; local hero-*.webp files have a -900 twin. */
function heroSrcSet(image = "") {
  if (image.includes("res.cloudinary.com") && image.includes("w_1920")) return `${image.replace("w_1920", "w_900")} 900w, ${image} 1920w`;
  if (/\/hero-[a-z-]+\.webp$/.test(image)) return `${image.replace(/\.webp$/, "-900.webp")} 900w, ${image} 1672w`;
  return undefined;
}

export default function PageHero({ image, imageAlt = "", imagePosition = "center", breadcrumb, title, accent, subtitle, description, actions, stats, center = false, children }) {
  const reduce = useReducedMotion();
  const [more, setMore] = useState(false);
  const longDesc = typeof description === "string" && description.length > 220;
  const rise = (d, extra = {}) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26, ...extra.from },
          animate: { opacity: 1, y: 0, ...extra.to },
          transition: { duration: 0.8, delay: d, ease: EASE },
        };

  return (
    <section className="ac-hero relative overflow-hidden bg-[#0a0a0a] isolate">
      {/* Photo — eager + high priority: this is the LCP element */}
      <div aria-hidden={!imageAlt} className="absolute -inset-[4%]">
        <img src={image} srcSet={heroSrcSet(image)} sizes="100vw" alt={imageAlt} fetchPriority="high" decoding="async" className="ac-kenburns w-full h-full object-cover" style={{ width: "100%", height: "100%", objectPosition: imagePosition }} />
      </div>

      {/* Depth layers */}
      <div aria-hidden className="absolute inset-0" style={{ background: center ? "linear-gradient(180deg,rgba(8,8,8,.9) 0%,rgba(8,8,8,.55) 38%,rgba(8,8,8,.5) 60%,rgba(8,8,8,.9) 100%)" : "linear-gradient(105deg,rgba(8,8,8,.96) 0%,rgba(8,8,8,.8) 46%,rgba(8,8,8,.38) 100%)" }} />
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 65% at 50% 42%, transparent 35%, rgba(0,0,0,.55) 100%)" }} />
      <div aria-hidden className="ac-hero-glow absolute rounded-full pointer-events-none" style={center ? { top: "8%", left: "50%", width: "min(720px,90vw)", height: "min(420px,55vw)", translate: "-50% 0", background: "radial-gradient(ellipse,rgba(255,213,79,.14),transparent 68%)" } : { left: "-6rem", bottom: "-6rem", width: 420, height: 420, background: "radial-gradient(circle,rgba(255,213,79,.22),transparent 65%)" }} />
      <div aria-hidden className="ac-hero-sweep absolute inset-0 pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FFD54F]/50 to-transparent" />

      <div className={`relative max-w-[1264px] mx-auto px-5 sm:px-6 py-[clamp(36px,5vw,72px)] ${center ? "flex flex-col items-center text-center" : ""}`}>
        {breadcrumb && (
          <motion.div {...rise(0)}>
            <Breadcrumb items={breadcrumb} light className={center ? "justify-center" : ""} />
          </motion.div>
        )}

        <motion.h1
          {...rise(0.08)}
          className="text-white font-extrabold tracking-tight leading-[1.1] [text-wrap:balance] max-w-[1200px]"
          style={{ fontSize: "clamp(28px,4.2vw,50px)", letterSpacing: "-0.03em", textShadow: "0 4px 30px rgba(0,0,0,.45)" }}
        >
          {title}
          {accent && <> <span className="ac-gold-shimmer sm:whitespace-nowrap">{accent}</span></>}
        </motion.h1>

        {subtitle && (
          <motion.h2 {...rise(0.18)} className="mt-3 font-bold leading-snug [text-wrap:balance]" style={{ fontSize: "clamp(17px,1.9vw,23px)" }}>
            <span className="ac-gold-shimmer">{subtitle}</span>
          </motion.h2>
        )}

        {subtitle && !reduce && (
          <motion.span
            aria-hidden
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
            className={`block h-[3px] w-16 mt-4 rounded-full bg-gradient-to-r from-[#E6AC00] via-[#FFD54F] to-[#E6AC00] ${center ? "origin-center" : "origin-left"}`}
          />
        )}

        {/* Hero description paragraph intentionally not shown (removed site-wide). */}

        {stats && (
          <motion.ul {...rise(0.36)} className={`mt-7 flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
            {stats.map(([n, l], i) => (
              <motion.li
                key={l}
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: 0.45 + i * 0.09, ease: EASE }}
                className="ac-glass rounded-2xl px-5 py-3"
              >
                <div className="text-[clamp(20px,2.2vw,26px)] font-extrabold text-primary leading-none">{n}</div>
                <div className="text-[12.5px] text-white/70 mt-1.5 font-medium">{l}</div>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {actions && <motion.div {...rise(0.42)} className={`mt-8 flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>{actions}</motion.div>}

        {children && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
            className="w-full mt-8 flex justify-center [&>*]:w-full [&>*]:min-w-0"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
