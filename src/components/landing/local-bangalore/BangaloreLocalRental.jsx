import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Car, MapPin, Check, Plane, Navigation, Repeat, Clock } from "lucide-react";
import Breadcrumb from "../../ui/Breadcrumb";
import Button from "../../ui/Button";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, FaqSearch } from "../local/LocalSections";
import { BLR_LOCAL as C } from "../../../content/bangaloreLocalRental";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00]";

/** **bold** and [link](/path) inline syntax → React nodes. */
const TOKEN = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
function rich(text, linkClass = "font-semibold text-[#B88A00] underline underline-offset-2 hover:text-[#111]") {
  const out = []; let last = 0; let m; TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[1] ? <strong key={m.index} className="font-bold">{m[1]}</strong> : <a key={m.index} href={m[3]} className={linkClass}>{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
const plain = (t) => t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

/** True once the element scrolls into view (always true for reduced motion, false on the server). */
function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el); return () => io.disconnect();
  }, [ref]);
  return seen;
}

function Eyebrow({ children, light = false, center = false }) {
  return <p className={`flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] ${center ? "justify-center" : ""} ${light ? "text-primary" : "text-[#7A5D00]"}`}><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />{children}</p>;
}
const h2cls = "text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05] [text-wrap:balance]";
const h3sub = "mt-3 text-[17px] md:text-[19px] font-bold";

/* ════════════ Hero ════════════ */
function Hero({ booking, onBook }) {
  const h = C.hero;
  return (
    <section className="relative isolate overflow-hidden bg-[#111] text-white">
      <img src={h.image} alt={h.imageAlt} fetchpriority="high" className="absolute inset-0 -z-20 w-full h-full object-cover object-[70%_center]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 pt-8 pb-10 md:pt-12 md:pb-14">
        <Breadcrumb items={C.breadcrumb} light />
        <div className="max-w-[760px]">
          <h1 className="mt-3 text-[36px] sm:text-[48px] lg:text-[60px] font-black tracking-[-0.04em] leading-[1.02] [text-wrap:balance]">{h.h1}</h1>
          <h2 className="mt-4 text-[19px] md:text-[23px] font-extrabold text-primary">{h.h2}</h2>
          <div className="mt-4 space-y-3 text-[15.5px] md:text-[16.5px] text-white/80 leading-relaxed">
            {h.body.map((p, i) => <p key={i}>{rich(p, "font-semibold text-primary underline underline-offset-2 hover:text-white")}</p>)}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => onBook(null)}>{h.cta} <ArrowRight size={17} aria-hidden /></Button>
            <span className="text-[13px] font-bold text-white/55 ml-1">Quick pick:</span>
            {C.packages.items.map((p) => (
              <button key={p.hours} type="button" onClick={() => onBook({ tripType: "local", package: p.pkg })}
                className={`h-11 px-4 rounded-full border-2 border-white/25 text-[14px] font-extrabold hover:bg-primary hover:border-primary hover:text-[#111] transition-colors ${focusRing}`}>
                {p.hours}h
              </button>
            ))}
          </div>
        </div>
        <div className="mt-10">{booking}</div>
      </div>
    </section>
  );
}

/* ════════════ Hourly packages — clock rings that fill on scroll ════════════ */
function Ring({ hours, go }) {
  const R = 54, L = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 140 140" className="w-[132px] h-[132px]" aria-hidden>
      <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="12" />
      <circle cx="70" cy="70" r={R} fill="none" stroke="#FFD54F" strokeWidth="12" strokeLinecap="round" transform="rotate(-90 70 70)"
        strokeDasharray={L} strokeDashoffset={go ? L * (1 - hours / 12) : L} style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)" }} />
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 2 * Math.PI - Math.PI / 2; return <circle key={i} cx={70 + 38 * Math.cos(a)} cy={70 + 38 * Math.sin(a)} r={i % 3 === 0 ? 2.2 : 1.2} fill="rgba(255,255,255,.35)" />; })}
      <text x="70" y="78" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900" fontFamily="inherit">{hours}h</text>
    </svg>
  );
}
function Packages({ onBook }) {
  const p = C.packages; const ref = useRef(null); const go = useInView(ref);
  return (
    <section id="packages" aria-labelledby="packages-title" className="bg-[#FAF7EE] py-16 md:py-24 scroll-mt-28">
      <div ref={ref} className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[720px] mx-auto">
          <Eyebrow center>Hourly packages</Eyebrow>
          <h2 id="packages-title" className={`mt-3 ${h2cls}`}>{p.heading}</h2>
        </div>
        <ul className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          {p.items.map((it, i) => (
            <li key={it.hours} className="group flex flex-col items-center text-center rounded-[28px] p-8 bg-[#111] text-white border-2 border-transparent hover:border-primary transition-colors duration-300 shadow-[0_30px_60px_-40px_rgba(0,0,0,.7)]">
              <Ring hours={it.hours} go={go} />
              <h3 className="mt-5 text-[20px] font-extrabold tracking-[-0.02em]">{it.title}</h3>
              <p className="mt-2 text-[14.5px] text-white/70 leading-relaxed">{it.desc}</p>
              <button type="button" onClick={() => onBook({ tripType: "local", package: it.pkg })}
                className={`mt-auto pt-6 inline-flex items-center gap-2 text-[14.5px] font-extrabold text-primary hover:text-white transition-colors rounded-sm ${focusRing}`}>
                Book {it.hours} hours <ArrowRight size={16} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-[14.5px] text-text-secondary">{p.note}</p>
        <div className="mt-6 text-center"><Button size="lg" onClick={() => onBook({ tripType: "local" })}>{p.cta}</Button></div>
      </div>
    </section>
  );
}

/* ════════════ Vehicles — scrollytelling: sticky photo stage + scrolling chapters ════════════ */
function VehicleImg({ it, className = "" }) {
  const crop = it.crop;
  return (
    <img src={it.image} alt={`${it.name} — Abhi Cabs 24×7 Bangalore car rental`} loading="lazy" decoding="async"
      className={`absolute inset-0 w-full h-full ${it.fit === "contain" ? "object-contain p-[8%]" : "object-cover"} ${className}`}
      style={crop ? { objectPosition: `${crop.x}% ${crop.y}%`, transform: `scale(${crop.zoom})`, transformOrigin: `${crop.x}% ${crop.y}%` } : undefined} />
  );
}

function Vehicles({ onBook }) {
  const v = C.vehicles;
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const cur = v.items[active];

  return (
    <section id="vehicles" aria-labelledby="vehicles-title" className="bg-[#0E0F11] text-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[760px] mx-auto">
          <Eyebrow center light>Our cars</Eyebrow>
          <h2 id="vehicles-title" className={`mt-3 ${h2cls}`}>{v.heading}</h2>
          <h3 className={`${h3sub} text-primary`}>{v.subheading}</h3>
          <p className="mt-3 text-[15.5px] text-white/65">{rich(v.intro, "font-semibold text-primary underline")}</p>
        </div>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-10 lg:gap-16">
          {/* sticky stage (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-[104px] h-[min(620px,calc(100vh-150px))] rounded-[32px] overflow-hidden bg-black isolate">
              {v.items.map((it, i) => (
                <div key={it.name} aria-hidden={i !== active}
                  className={`absolute inset-0 -z-10 transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.06]"}`}>
                  <VehicleImg it={it} />
                </div>
              ))}
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
              <span className="absolute top-5 left-5 rounded-full bg-primary text-[#111] px-3.5 py-1.5 text-[12.5px] font-black">{cur.type}</span>
              <span className="absolute top-6 right-6 text-[13px] font-black tabular-nums text-white/70">{String(active + 1).padStart(2, "0")} / {String(v.items.length).padStart(2, "0")}</span>
              <p aria-hidden key={cur.name} className={`ac-stage-name absolute left-6 right-6 bottom-12 ${cur.name.length > 16 ? "text-[36px] xl:text-[44px]" : "text-[54px] xl:text-[68px]"} font-black uppercase tracking-[-0.04em] leading-[.9] text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,.85)] [text-wrap:balance]`}>{cur.name}</p>
              <div aria-hidden className="absolute left-6 right-6 bottom-6 flex gap-1.5">
                {v.items.map((_, i) => <span key={i} className={`h-[4px] flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-primary" : "bg-white/20"}`} />)}
              </div>
              <style>{"@keyframes ac-stage-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}.ac-stage-name{animation:ac-stage-in .6s cubic-bezier(.22,1,.36,1)}@media (prefers-reduced-motion:reduce){.ac-stage-name{animation:none}}"}</style>
            </div>
          </div>

          {/* chapters */}
          <ol className="lg:py-[18vh]">
            {v.items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.name} ref={(el) => (refs.current[i] = el)} data-i={i}
                  className={`lg:min-h-[52vh] flex flex-col justify-center py-8 lg:py-0 border-b border-white/10 lg:border-0 transition-opacity duration-500 ${on ? "lg:opacity-100" : "lg:opacity-30"}`}>
                  <div className="lg:hidden relative aspect-[16/10] rounded-[22px] overflow-hidden bg-black mb-6"><VehicleImg it={it} /></div>
                  <div className="flex items-center gap-3">
                    <span className="text-[44px] font-black tabular-nums leading-none text-transparent [-webkit-text-stroke:1.5px_#FFD54F]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="rounded-full border border-white/25 px-3 py-1 text-[12px] font-black text-white/80">{it.type}</span>
                  </div>
                  <p className="mt-4 text-[32px] md:text-[42px] font-black tracking-[-0.035em] leading-[1.02]">{it.name}</p>
                  <p className="mt-3 max-w-[440px] text-[16px] text-white/70 leading-relaxed">{it.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button size="md" onClick={() => onBook({ tripType: "local" })} tabIndex={0}>Book this car <ArrowRight size={16} aria-hidden /></Button>
                    <Button size="md" variant="outlineInverse" href="/our-vehicles">View in Our Vehicles</Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-10 lg:mt-4 text-center">
          <p className="text-[15px] text-white/75">{rich(v.link, "font-semibold text-primary underline underline-offset-2 hover:text-white")}</p>
          <div className="mt-6"><Button href="/our-vehicles" variant="inverse" size="lg">{v.cta}</Button></div>
        </div>
      </div>
    </section>
  );
}

/* ════════════ Service types — photo bento ════════════ */
function Services({ onBook }) {
  const s = C.services;
  return (
    <section id="services" aria-labelledby="services-title" className="bg-[#FAF7EE] py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <Eyebrow>Ways to use it</Eyebrow>
        <h2 id="services-title" className={`mt-3 max-w-[760px] ${h2cls}`}>{s.heading}</h2>
        <ul className="mt-12 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-5">
          {s.items.map((it, i) => (
            <li key={it.title} className={`group relative overflow-hidden isolate rounded-[28px] bg-[#111] text-white flex flex-col justify-end ${i === 0 ? "lg:row-span-2 min-h-[520px]" : "min-h-[300px]"}`}>
              <img src={it.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 -z-20 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transition-none" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
              <div className="p-7 md:p-9">
                <h3 className={`font-black tracking-[-0.03em] leading-tight ${i === 0 ? "text-[30px] md:text-[38px]" : "text-[24px]"}`}>{it.title}</h3>
                <div className="mt-3 space-y-2 text-[14.5px] md:text-[15px] text-white/80 leading-relaxed max-w-[560px]">
                  {it.body.map((p, j) => <p key={j}>{rich(p, "font-semibold text-primary underline underline-offset-2 hover:text-white")}</p>)}
                </div>
                <Button size="sm" className="mt-5" onClick={() => onBook(it.journey)}>Book this <ArrowRight size={15} aria-hidden /></Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ════════════ Locations — map panel of area buttons ════════════ */
function Locations({ onBook }) {
  const l = C.locations;
  return (
    <section id="locations" aria-labelledby="locations-title" className="bg-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[780px] mx-auto">
          <Eyebrow center>Pickup areas</Eyebrow>
          <h2 id="locations-title" className={`mt-3 ${h2cls}`}>{l.heading}</h2>
          <h3 className={h3sub}>{l.subheading}</h3>
        </div>
        <div className="relative mt-10 rounded-[30px] bg-[#F1EBD6] px-5 py-10 sm:p-12 overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-70 pointer-events-none" style={{
            backgroundImage: "linear-gradient(#E3DABD 1.5px, transparent 1.5px), linear-gradient(90deg, #E3DABD 1.5px, transparent 1.5px), linear-gradient(28deg, transparent 49%, #D9CDA6 49.6%, #D9CDA6 50.6%, transparent 51.2%), linear-gradient(-22deg, transparent 49%, #D9CDA6 49.6%, #D9CDA6 50.4%, transparent 51%)",
            backgroundSize: "52px 52px, 52px 52px, 100% 100%, 100% 100%",
          }} />
          <p className="relative text-center text-[12.5px] font-black uppercase tracking-[0.16em] text-[#7A5D00]">Tap your area to start a booking</p>
          <ul className="relative mt-5 flex flex-wrap justify-center gap-3">
            {l.areas.map((a) => (
              <li key={a}>
                <button type="button" onClick={() => onBook({ tripType: "local", pickup: `${a}, Bengaluru` })}
                  className={`group inline-flex items-center gap-2 rounded-full bg-white border border-[#D9D1B5] pl-3 pr-4 py-2.5 text-[14.5px] font-bold shadow-[0_6px_14px_-10px_rgba(0,0,0,.35)] hover:bg-[#111] hover:border-[#111] hover:text-white transition-colors ${focusRing}`}>
                  <MapPin size={16} aria-hidden className="text-[#B88A00] group-hover:text-primary" />{a}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 max-w-[820px] mx-auto text-center space-y-3 text-[15px] text-text-secondary leading-relaxed">
          {l.body.map((p, i) => <p key={i}>{rich(p)}</p>)}
        </div>
      </div>
    </section>
  );
}

/* ════════════ Prices — pre-booking checklist receipt ════════════ */
function Prices({ onBook }) {
  const p = C.prices;
  return (
    <section id="prices" aria-labelledby="prices-title" className="bg-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-10 lg:gap-16 items-center">
        <div>
          <Eyebrow>Prices</Eyebrow>
          <h2 id="prices-title" className={`mt-3 ${h2cls}`}>{p.heading}</h2>
          <h3 className={h3sub}>{p.subheading}</h3>
          <div className="mt-4 space-y-3 text-[15.5px] text-text-secondary leading-relaxed">{p.body.map((t, i) => <p key={i}>{rich(t)}</p>)}</div>
          <div className="mt-7"><Button size="lg" onClick={() => onBook({ tripType: "local" })}>{p.cta}</Button></div>
        </div>
        <div className="relative mx-auto w-full max-w-[460px] lg:rotate-[1.5deg]">
          <div className="bg-[#FAF7EE] rounded-t-[22px] border border-[#EAE3CC] border-b-0 shadow-[0_40px_80px_-50px_rgba(0,0,0,.55)] px-7 pt-6 pb-10">
            <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#DCD3B6]">
              <span className="text-[14px] font-black">ABHI CABS 24×7</span>
              <span className="text-[12px] font-bold text-text-secondary">Before you book</span>
            </div>
            <ul className="mt-2">
              {p.checklist.map((t) => (
                <li key={t} className="flex items-center justify-between py-3 border-b border-dashed border-[#E3DBC2] text-[15px] font-semibold">
                  {t}<span className="grid place-items-center w-6 h-6 rounded-full bg-[#111] text-primary"><Check size={14} strokeWidth={3} aria-hidden /></span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] text-text-secondary">Review each item on the fare page before you confirm.</p>
          </div>
          <div aria-hidden className="absolute left-0 right-0 -bottom-[10px] h-[10px]" style={{ background: "radial-gradient(circle at 10px 0, #FAF7EE 9.5px, transparent 10px) 0 0 / 20px 10px repeat-x" }} />
        </div>
      </div>
    </section>
  );
}

/* ════════════ More services — three big link tiles ════════════ */
const MORE_ICON = { airport: Plane, oneway: Navigation, round: Repeat };
function MoreServices() {
  const m = C.more;
  return (
    <section id="more-services" aria-labelledby="more-title" className="bg-[#111] text-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="max-w-[780px]">
          <Eyebrow light>Beyond the city</Eyebrow>
          <h2 id="more-title" className={`mt-3 ${h2cls}`}>{m.heading}</h2>
          <h3 className={`${h3sub} text-primary`}>{m.subheading}</h3>
          <p className="mt-3 text-[15.5px] text-white/65 leading-relaxed">{m.intro}</p>
        </div>
        <ul className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {m.links.map((l) => {
            const Icon = MORE_ICON[l.kind] || Clock;
            return (
              <li key={l.href}>
                <a href={l.href} className={`group relative flex flex-col h-full min-h-[240px] rounded-[26px] bg-white/[.05] border border-white/10 p-7 overflow-hidden isolate hover:border-primary transition-colors ${focusRing}`}>
                  <span aria-hidden className="absolute inset-0 -z-10 bg-primary origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100 motion-reduce:transition-none" />
                  <span className="flex items-start justify-between">
                    <span className="grid place-items-center w-14 h-14 rounded-2xl bg-primary text-[#111] group-hover:bg-[#111] group-hover:text-primary transition-colors"><Icon size={26} aria-hidden /></span>
                    <ArrowUpRight size={24} aria-hidden className="transition-all duration-300 group-hover:text-[#111] group-hover:rotate-45" />
                  </span>
                  <span className="mt-auto pt-8 text-[22px] font-black tracking-[-0.02em] leading-tight group-hover:text-[#111] transition-colors">{l.label}</span>
                  <span className="mt-2 text-[14.5px] text-white/65 group-hover:text-[#111]/75 transition-colors">{l.desc}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ════════════ Final CTA ════════════ */
function FinalCta({ onBook }) {
  const c = C.cta;
  return (
    <section id="book-cta" aria-labelledby="book-cta-title" className="relative isolate overflow-hidden bg-primary py-16 md:py-24 scroll-mt-28">
      <Car aria-hidden strokeWidth={0.6} className="absolute -right-16 -bottom-16 -z-10 w-[460px] h-[460px] text-[#111]/[.07]" />
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 max-w-[900px] text-center">
        <h2 id="book-cta-title" className="text-[32px] md:text-[52px] font-black tracking-[-0.04em] leading-[1.02] [text-wrap:balance]">{c.heading}</h2>
        <h3 className="mt-4 text-[17px] md:text-[20px] font-extrabold">{c.subheading}</h3>
        <div className="mt-5 space-y-3 text-[15.5px] md:text-[16.5px] text-[#111]/75 leading-relaxed">{c.body.map((p, i) => <p key={i}>{rich(p)}</p>)}</div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" className="bg-[#111]! text-white! shadow-none! hover:bg-black!" onClick={() => onBook(null)}>{c.button} <ArrowRight size={17} aria-hidden /></Button>
          <Button size="lg" variant="outline" href="/contact">Talk to Us</Button>
        </div>
      </div>
    </section>
  );
}

/* ════════════ Page ════════════ */
export default function BangaloreLocalRental() {
  const [booking, setBooking] = useState({ key: "blr-local", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  const widget = <ServiceBooking widgetKey={booking.key} initialMode="local" presetJourney={booking.journey} />;
  return (
    <>
      <Hero booking={widget} onBook={book} />
      <Packages onBook={book} />
      <Vehicles onBook={book} />
      <Services onBook={book} />
      <Locations onBook={book} />
      <BenefitRows data={{ eyebrow: "Why Abhi Cabs", heading: C.why.heading, subheading: C.why.subheading, items: C.why.items }} ctaLabel={C.hero.cta} onCta={() => book(null)} />
      <Prices onBook={book} />
      <MoreServices />
      <HowSection data={{ eyebrow: "How it works", ...C.how }} onBook={book} bg="bg-[#FAF7EE]" />
      <FaqSearch heading={C.faqHeading} items={C.faqs.map(([q, a]) => ({ q, a: plain(a) }))} placeholder="Search questions, e.g. full day, tolls, sightseeing" />
      <FinalCta onBook={book} />
    </>
  );
}
