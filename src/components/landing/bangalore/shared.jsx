import React from "react";
import { renderInline } from "../../ServiceLanding";

export { renderInline };

/** "Label: description" → [label, description]. Plain strings → [null, text]. */
export function splitLabel(t) {
  const i = typeof t === "string" ? t.indexOf(": ") : -1;
  return i > 0 && i < 60 ? [t.slice(0, i), t.slice(i + 2)] : [null, t];
}

/** Section wrapper — own spacing so these sections don't inherit the card-page rhythm. */
export function Band({ id, bg = "bg-white", className = "", children }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`${bg} py-16 md:py-24 scroll-mt-28 ac-cv ${className}`.trim()}>
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">{children}</div>
    </section>
  );
}

/** Left-aligned editorial heading. Keeps the SEO H2/H3 text exactly as written in landingPages.js. */
export function Head({ id, eyebrow, title, sub, intro = [], light = false, center = false, className = "" }) {
  return (
    <div className={`max-w-[680px] ${center ? "mx-auto text-center" : ""} ${className}`.trim()}>
      {eyebrow && (
        <p className={`flex items-center gap-2.5 text-[13.5px] font-bold ${center ? "justify-center" : ""} ${light ? "text-primary" : "text-[#7A5D00]"}`}>
          <span aria-hidden className="block w-6 h-[3px] rounded-full bg-primary" />
          {eyebrow}
        </p>
      )}
      <h2 id={id ? `${id}-title` : undefined} className={`mt-3 text-[28px] md:text-[40px] font-extrabold tracking-[-0.03em] leading-[1.1] [text-wrap:balance] ${light ? "text-white" : "text-text"}`}>
        {title}
      </h2>
      {sub && <h3 className={`mt-3 text-[17px] md:text-[19px] font-semibold leading-snug ${light ? "text-white/80" : "text-text"}`}>{sub}</h3>}
      {[].concat(intro || []).map((p, i) => (
        <p key={i} className={`mt-3 text-[15.5px] leading-[1.75] ${light ? "text-white/70" : "text-text-secondary"}`}>{renderInline(p)}</p>
      ))}
    </div>
  );
}

/** Quiet text-style action used for secondary links. */
export function TextLink({ href, onClick, light = false, children }) {
  const cls = `inline-flex items-center gap-2 text-[14.5px] font-bold underline underline-offset-[5px] decoration-2 decoration-primary hover:decoration-[3px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary rounded-sm ${light ? "text-white" : "text-text"}`;
  return href ? <a href={href} className={cls}>{children}</a> : <button type="button" onClick={onClick} className={cls}>{children}</button>;
}
