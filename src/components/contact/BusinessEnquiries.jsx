import React from "react";
import { Briefcase, Handshake, ArrowRight, Check } from "lucide-react";
import { focusRing } from "./shared";

const ICONS = { briefcase: Briefcase, handshake: Handshake };

/** Two big side-by-side enquiry cards; each button preselects the form subject (and prefill) via onPick. */
export default function BusinessEnquiries({ content, onPick }) {
  const c = content.business;
  return (
    <section id="contact-business" aria-labelledby="contact-business-title" className="bg-[#FAF7EE] py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="max-w-[720px] mx-auto text-center">
          <p className="flex items-center justify-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] text-[#7A5D00]"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />{c.eyebrow}</p>
          <h2 id="contact-business-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">{c.title}</h2>
          <p className="mt-4 text-[15.5px] text-text-secondary leading-relaxed">{c.description}</p>
        </div>
        <ul className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {c.categories.map((cat, i) => {
            const Icon = ICONS[cat.icon] || Briefcase;
            const dark = i % 2 === 0;
            return (
              <li key={cat.title} className={`group relative overflow-hidden rounded-[30px] p-7 md:p-10 min-h-[420px] flex flex-col isolate ${dark ? "bg-[#111] text-white" : "bg-primary text-[#111]"}`}>
                {dark && c.image && (
                  <>
                    <img src={c.image} alt={c.imageAlt || ""} loading="lazy" className="absolute inset-0 -z-10 w-full h-full object-cover opacity-30 transition-transform duration-[1200ms] group-hover:scale-105 motion-reduce:transition-none" />
                    <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-[#111] via-[#111]/80 to-[#111]/40" />
                  </>
                )}
                {!dark && <Icon aria-hidden strokeWidth={0.7} className="absolute -right-8 -top-8 w-56 h-56 -z-10 text-[#111]/[.07]" />}
                <span className={`grid place-items-center w-14 h-14 rounded-2xl ${dark ? "bg-primary text-[#111]" : "bg-[#111] text-primary"}`}><Icon size={26} aria-hidden /></span>
                <h3 className="mt-6 text-[26px] md:text-[32px] font-black tracking-[-0.03em] leading-tight">{cat.title}</h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {cat.points.map((p) => (
                    <li key={p} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold ${dark ? "bg-white/10 text-white/90" : "bg-[#111]/[.08]"}`}>
                      <Check size={14} strokeWidth={3} aria-hidden className={dark ? "text-primary" : ""} />{p}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => onPick(cat.subject, cat.prefill)}
                  className={`mt-auto pt-8 self-start inline-flex items-center gap-3 text-[16px] font-extrabold rounded-full ${focusRing}`}>
                  <span className={`inline-flex items-center gap-2 h-12 px-6 rounded-full transition-colors ${dark ? "bg-primary text-[#111] group-hover:bg-white" : "bg-[#111] text-white group-hover:bg-black"}`}>
                    {cat.cta} <ArrowRight size={17} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
