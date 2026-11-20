import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import React from "react";
import Button from "../../ui/Button";
import useServiceLinks from "../../../hooks/useServiceLinks";
import { Band, Head, renderInline, splitLabel } from "./shared";
import { Phone, MessageCircle } from "lucide-react";
import Accordion from "../../ui/Accordion";
import { resolveIcon } from "../../ui/iconMap";
import { PHONES, whatsappHref } from "../../../data/businessInfo";
/* ── How it works: a real sequence, so numbered steps on a single track ── */

export function ChauffeurSection({ data }) {
  return (
    <Band id="chauffeur" bg="bg-primary-tint">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
        {data.image && (
          <img src={data.image} alt={data.imageAlt || ""} loading="lazy" decoding="async" className="w-full aspect-[4/3] lg:aspect-[4/5] object-cover rounded-[20px]" />
        )}
        <div>
          <Head id="chauffeur" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
          <ul className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
            {data.points.map((t) => {
              const [label, desc] = splitLabel(t);
              return (
                <li key={t} className="border-l-[3px] border-primary-dark pl-4">
                  {label && <strong className="block text-[15.5px] font-extrabold leading-snug">{label}:</strong>}
                  <span className="block mt-1 text-[14.5px] text-text-secondary leading-[1.65]">{desc}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Band>
  );
}

/* ── Why Abhi Cabs: heading column + two-column icon list (no cards) ── */

export function WhySection({ data }) {
  return (
    <Band id="why" bg="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16">
        <Head id="why" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 border-t border-border">
          {data.items.map((f) => {
            const Icon = resolveIcon(f);
            return (
              <li key={f.title} className="flex items-start gap-4 py-5 border-b border-border">
                <Icon size={22} strokeWidth={1.8} aria-hidden className="shrink-0 mt-0.5 text-[#B88A00]" />
                <div>
                  <h3 className="text-[15.5px] font-extrabold leading-snug">{f.title}</h3>
                  <p className="mt-1 text-[14px] text-text-secondary leading-relaxed">{f.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Band>
  );
}

/* ── Fares: what to review, laid out as a trip slip with a perforated edge ── */

export function PricesSection({ data, onBook }) {
  const intro = [].concat(data.intro || []);
  return (
    <Band id="prices" bg="bg-bg">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-start">
        <Head id="prices" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={intro} />
        <div className="relative bg-white rounded-t-[18px] border border-border border-b-0 shadow-[0_30px_60px_-40px_rgba(0,0,0,.35)]">
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b-2 border-text">
            <span className="text-[15px] font-extrabold">Before you confirm</span>
            <span className="text-[13px] font-semibold text-text-secondary">Abhi Cabs 24×7</span>
          </div>
          <ul className="px-6 sm:px-8">
            {data.points.map((t) => {
              const [label, desc] = splitLabel(t);
              return (
                <li key={t} className="grid grid-cols-1 sm:grid-cols-[180px_minmax(0,1fr)] gap-x-6 gap-y-1 py-4 border-b border-dashed border-[#D4D4D4]">
                  <strong className="text-[14.5px] font-extrabold">{label}</strong>
                  <span className="text-[14px] text-text-secondary leading-relaxed">{desc}</span>
                </li>
              );
            })}
          </ul>
          <div className="px-6 sm:px-8 pt-6 pb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[15px] font-bold">See your exact fare before you book</p>
            {data.cta?.label && <Button className="whitespace-normal! h-auto! min-h-12 py-3 text-center" onClick={() => onBook(null)}>{data.cta.label}</Button>}
          </div>
          {/* perforated bottom edge */}
          <div aria-hidden className="absolute left-0 right-0 -bottom-[10px] h-[10px]" style={{ background: "radial-gradient(circle at 10px 0, #fff 9.5px, transparent 10px) 0 0 / 20px 10px repeat-x" }} />
        </div>
      </div>
    </Band>
  );
}

/* ── How it works: a real sequence, so numbered steps on a single track ── */

export function HowSection({ data, onBook, bg = "bg-white" }) {
  const steps = data.steps || [];
  const n = steps.length;
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Walk through the steps while the section is on screen (pauses on hover/focus).
  useEffect(() => {
    if (!inView || paused || reduce || n < 2) return;
    const t = setInterval(() => setActive((a) => (a + 1) % n), 2600);
    return () => clearInterval(t);
  }, [inView, paused, reduce, n]);
  const fill = n > 1 ? (active / (n - 1)) * 100 : 0;
  return (
    <Band id="how" bg={bg}>
      <Head id="how" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} />
      <ol ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
        className={`mt-12 grid grid-cols-1 ${n === 4 ? "md:grid-cols-4" : "md:grid-cols-3"} gap-8 md:gap-6 relative`}>
        <span aria-hidden className="hidden md:block absolute top-[22px] left-[22px] right-[22px] h-[2px] bg-border overflow-hidden">
          <span className="block h-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none" style={{ width: `${fill}%` }} />
        </span>
        {steps.map((s, i) => {
          const on = i === active, past = i < active;
          return (
            <li key={s.title} className="relative md:pr-6">
              <button type="button" onClick={() => setActive(i)} aria-current={on ? "step" : undefined} aria-label={`Step ${i + 1}: ${s.title}`}
                className={`relative z-[1] grid place-items-center w-11 h-11 rounded-full bg-primary text-text text-[17px] font-black ring-8 ${bg === "bg-white" ? "ring-white" : "ring-[#FAFAFA]"} transition-transform duration-300 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-text ${on ? "scale-110" : past ? "" : "hover:scale-105"}`}>
                {on && !reduce && <span aria-hidden className="absolute inset-0 rounded-full bg-primary animate-ping opacity-40" />}
                <span className="relative">{i + 1}</span>
              </button>
              <h3 className={`mt-5 text-[17px] font-extrabold leading-snug transition-colors duration-300 ${on ? "text-text" : "text-text/80"}`}>{s.title}</h3>
              <p className="mt-2 text-[14.5px] text-text-secondary leading-[1.7] max-w-[340px]">{s.desc}</p>
            </li>
          );
        })}
      </ol>
      <div className="mt-10"><Button size="lg" onClick={() => onBook(null)}>{data.ctaLabel || "Start Booking"}</Button></div>
    </Band>
  );
}

/* ── Other services: one compact link row ── */

export function FaqSection({ heading, items }) {
  const wa = whatsappHref();
  return (
    <Band id="faq" bg="bg-bg">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-10 lg:gap-16">
        <div className="lg:sticky lg:top-28 self-start">
          <Head id="faq" eyebrow="FAQ" title={heading} />
          <p className="mt-6 text-[15px] font-bold">Need an answer for your trip?</p>
          <ul className="mt-3 space-y-2">
            {PHONES.map((p) => (
              <li key={p.href}><a href={p.href} className="inline-flex items-center gap-2.5 text-[15px] font-semibold hover:text-[#B88A00] focus-visible:outline-2 focus-visible:outline-primary rounded-sm"><Phone size={17} aria-hidden /> {p.label}</a></li>
            ))}
            {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-[15px] font-semibold hover:text-[#B88A00] focus-visible:outline-2 focus-visible:outline-primary rounded-sm"><MessageCircle size={17} aria-hidden /> Chat on WhatsApp</a></li>}
          </ul>
        </div>
        <Accordion items={items} tone="tint" />
      </div>
    </Band>
  );
}

/* ── Other services: one compact link row ── */

export function ExploreServices({ exclude }) {
  const links = [...useServiceLinks().filter((l) => l.href !== exclude).map((l) => ({ label: l.short, href: l.href })), { label: "All Services", href: "/services" }];
  return (
    <section className="bg-white border-t border-border">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 py-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
        <h2 className="text-[16px] font-extrabold shrink-0">Explore other services</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {links.map((r) => (
            <li key={r.href}><a href={r.href} className="text-[14.5px] font-semibold underline underline-offset-[5px] decoration-border decoration-2 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-primary rounded-sm">{r.label}</a></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
