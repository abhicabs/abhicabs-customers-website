import React, { useId, useMemo, useRef, useState } from "react";
import { Check, Search, ArrowRight, MapPin, Phone, MessageCircle, Clock3, PlusCircle, Gauge, Receipt, Users, CalendarCheck, Car } from "lucide-react";
import Button from "../../ui/Button";
import Accordion from "../../ui/Accordion";
import { resolveIcon } from "../../ui/iconMap";
import { PHONES, whatsappHref } from "../../../data/businessInfo";
import { Band, Head, renderInline, splitLabel } from "../bangalore/shared";
import useRentalPackages, { packageForCard } from "../../../hooks/useRentalPackages";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

/* ════════════ 1. Service switcher — tabs over full-width photos ════════════ */

/** Photo + booking action for each local service, matched on its heading. */
const SERVICE_META = [
  { test: /point-to-point/i, image: "/images/dashboard-pov.jpg", journey: { tripType: "one-way" }, label: "Book a city ride" },
  { test: /hourly/i, image: "/images/hero-local-chauffeur-900.webp", journey: { tripType: "local" }, label: "Book by the hour" },
  { test: /sightseeing/i, image: "/images/route-6.webp", journey: { tripType: "local", package: "8 hrs / 80 km" }, label: "Book sightseeing" },
  { test: /corporate|business/i, image: "/images/corporate.webp", href: "/services/corporate", label: "Corporate enquiry" },
  { test: /family|personal/i, image: "/images/family.webp", journey: { tripType: "local" }, label: "Book a family ride" },
];
const metaFor = (heading, fallbackImage) => SERVICE_META.find((m) => m.test.test(heading)) || { image: fallbackImage, journey: { tripType: "local" }, label: "Book now" };

export function ServiceSwitcher({ data, onBook }) {
  const items = data.items || [];
  const [active, setActive] = useState(0);
  const base = useId();
  const tabs = useRef([]);
  const onKey = (e, i) => {
    const n = items.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : null;
    if (next === null) return;
    e.preventDefault(); setActive(next); tabs.current[next]?.focus();
  };
  if (!items.length) return null;

  return (
    <Band id="services" bg="bg-white">
      <Head id="services" center eyebrow={data.eyebrow} title={data.heading} intro={data.body} />

      <div role="tablist" aria-label={data.heading} className="snap-row mt-10 flex md:justify-center gap-2 overflow-x-auto -mx-5 px-5 pb-2">
        {items.map((it, i) => (
          <button key={it.heading} ref={(el) => (tabs.current[i] = el)} type="button" role="tab"
            id={`${base}-t${i}`} aria-controls={`${base}-p${i}`} aria-selected={i === active} tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)}
            className={`shrink-0 rounded-full px-5 py-3 text-[14px] font-bold transition-colors ${focusRing} ${i === active ? "bg-text text-white" : "bg-[#F3F3F1] text-text hover:bg-primary"}`}>
            {it.heading.replace(/ Services?$/i, "")}
          </button>
        ))}
      </div>

      {/* all panels stay in the page (and in search results); only the active one is visible */}
      <div className="mt-6 grid">
        {items.map((it, i) => {
          const m = metaFor(it.heading, data.image);
          const on = i === active;
          return (
            <div key={it.heading} role="tabpanel" id={`${base}-p${i}`} aria-labelledby={`${base}-t${i}`}
              className={`[grid-area:1/1] relative min-h-[460px] md:min-h-[520px] rounded-[28px] overflow-hidden transition-opacity duration-500 motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0 invisible"}`}>
              <img src={m.image} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] ease-out motion-reduce:transition-none ${on ? "scale-100" : "scale-105"}`} />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/85 via-black/55 to-black/5" />
              <div className="relative h-full flex flex-col justify-end md:justify-center p-7 sm:p-10 md:p-14 max-w-[600px] text-white">
                <p className="text-[13px] font-bold text-primary tabular-nums">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
                <h3 className="mt-3 text-[28px] md:text-[38px] font-extrabold tracking-[-0.03em] leading-[1.1] [text-wrap:balance]">{it.heading}</h3>
                <p className="mt-4 text-[15.5px] md:text-[16.5px] leading-[1.75] text-white/85">{renderInline(it.body)}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  {m.href
                    ? <Button href={m.href} size="lg" tabIndex={on ? 0 : -1}>{m.label}</Button>
                    : <Button size="lg" tabIndex={on ? 0 : -1} onClick={() => onBook(m.journey)}>{m.label}</Button>}
                  {items.length > 1 && (
                    <Button variant="outlineInverse" size="lg" tabIndex={on ? 0 : -1} onClick={() => setActive((i + 1) % items.length)} aria-label="Show next service">
                      Next <ArrowRight size={18} aria-hidden />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Band>
  );
}

/* ════════════ 2. Package dial — a 12-hour clock that fills to the chosen package ════════════ */

/** Package cards → live rental packages (shortest / middle / longest) — see hooks/useRentalPackages.
 *  Falls back to 4 / 8 / 12 hrs when the backend isn't reachable. */
function Dial({ hours, caption, max = 12 }) {
  const R = 104, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 260 260" className="w-[230px] h-[230px] md:w-[260px] md:h-[260px]" aria-hidden>
      <circle cx="130" cy="130" r={R} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="18" />
      <circle cx="130" cy="130" r={R} fill="none" stroke="#FFD54F" strokeWidth="18" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, hours / max))} transform="rotate(-90 130 130)"
        className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none" />
      {Array.from({ length: 12 }, (_, h) => {
        const a = (h / 12) * 2 * Math.PI - Math.PI / 2;
        const r1 = h % 3 === 0 ? 72 : 78, r2 = 84;
        return <line key={h} x1={130 + r1 * Math.cos(a)} y1={130 + r1 * Math.sin(a)} x2={130 + r2 * Math.cos(a)} y2={130 + r2 * Math.sin(a)} stroke="rgba(255,255,255,.45)" strokeWidth={h % 3 === 0 ? 3 : 1.5} strokeLinecap="round" />;
      })}
      <text x="130" y="124" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="900" fontFamily="inherit">{caption[0]}</text>
      <text x="130" y="152" textAnchor="middle" fill="rgba(255,255,255,.65)" fontSize="14" fontWeight="600" fontFamily="inherit">{caption[1]}</text>
    </svg>
  );
}

export function PackageDial({ data, onBook }) {
  const live = useRentalPackages();
  const maxHours = Math.max(12, ...live.map((p) => p.hours));
  const opts = (data.points || []).map((t) => { const [label, desc] = splitLabel(t); return { label, desc, ...packageForCard(label, live) }; });
  const [active, setActive] = useState(Math.min(1, opts.length - 1));
  const cur = opts[active] || {};
  const caption = cur.pkg ? cur.pkg.split(" / ") : ["Hourly", "flexible hours"];

  return (
    <Band id="packages" bg="bg-[#111]" className="text-white">
      <Head id="packages" center light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />

      <div className="mt-12 flex flex-col items-center">
        <Dial hours={cur.hours || 0} caption={caption} max={maxHours} />

        <div role="radiogroup" aria-label={data.heading} className="mt-10 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
          {opts.map((o, i) => {
            const on = i === active;
            return (
              <button key={o.label} type="button" role="radio" aria-checked={on} onClick={() => setActive(i)}
                className={`flex flex-col justify-start text-left rounded-[20px] p-6 border-2 transition-colors ${focusRing.replace("outline-text", "outline-primary")} ${on ? "bg-primary text-text border-primary" : "bg-white/[.04] border-white/12 hover:border-white/40"}`}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[18px] font-extrabold">{o.label}</span>
                  <span className={`grid place-items-center w-6 h-6 rounded-full border-2 ${on ? "border-text bg-text" : "border-white/40"}`}>{on && <Check size={14} strokeWidth={3} className="text-primary" aria-hidden />}</span>
                </span>
                <span className={`block mt-2 text-[14.5px] leading-relaxed ${on ? "text-text/80" : "text-white/70"}`}>{o.desc}</span>
                {o.pkg && <span className={`inline-block mt-3 text-[12.5px] font-bold tabular-nums ${on ? "text-text" : "text-primary"}`}>{o.pkg}</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-9 flex flex-col items-center gap-4 text-center">
          <Button size="lg" onClick={() => onBook(cur.pkg ? { tripType: "local", package: cur.pkg } : { tripType: "local" })}>
            {data.ctaLabel || `Book ${cur.label || ""}`}
          </Button>
          {data.note && <p className="max-w-[640px] text-[13.5px] text-white/60 leading-relaxed">{data.note}</p>}
        </div>
      </div>
    </Band>
  );
}

/* ════════════ 3. Fleet — photo showcase: hotspots on the real fleet photo, zoom to a vehicle ════════════ */

/**
 * Vehicle positions in /images/who-we-are-fleet.webp (3:2), as % of the photo.
 * A vehicle type is matched on its name (sedan, SUV, tempo, bus).
 */
const FLEET_PHOTO = "/images/who-we-are-fleet.webp";
const SPOTS = [
  { test: /sedan/i, x: 15, y: 62 },
  { test: /suv|muv/i, x: 36, y: 60 },
  { test: /tempo|traveller/i, x: 59, y: 57 },
  { test: /^(?!.*bus).*urbania/i, x: 50, y: 53 },   // Urbania listed on its own (not "Urbania & Bus")
  { test: /bus|urbania|coach/i, x: 81, y: 53 },
];
// Stage is 16:9, photo is 3:2 → the stage shows 84.375% of the photo's height, starting at CROP_TOP.
const CROP_TOP = 13, VISIBLE_H = 84.375, ZOOM = 1.9;

/** transform (in % of the photo) that centres point (x, y) at ZOOM without exposing an edge. */
function zoomTo(x, y) {
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const tx = clamp(50 - ZOOM * x, -(ZOOM - 1) * 100, 0);
  const ty = clamp(CROP_TOP + VISIBLE_H / 2 - ZOOM * y, CROP_TOP + VISIBLE_H - ZOOM * 100, CROP_TOP);
  return `translate(${tx}%, ${ty - CROP_TOP}%) scale(${ZOOM})`;
}

export function FleetShowcase({ data }) {
  const items = (data.points || []).map((t, i) => {
    const [label, desc] = splitLabel(t);
    const spot = SPOTS.find((s) => s.test.test(label || t)) || SPOTS[i] || SPOTS[0];
    return { label: label || t, desc, x: spot.x, y: spot.y };
  });
  const [active, setActive] = useState(null);
  const cur = active === null ? null : items[active];
  const white = focusRing.replace("outline-text", "outline-white");

  return (
    <Band id="fleet" bg="bg-bg">
      <Head id="fleet" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />

      <div className="mt-12">
        <div className="relative aspect-[16/9] rounded-[28px] overflow-hidden bg-[#1a1a1a]">
          {/* the photo: cropped to the vehicles; zooms to the chosen one */}
          <div className="absolute inset-x-0 aspect-[3/2] origin-top-left transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
            style={{ top: `-${(CROP_TOP / VISIBLE_H) * 100}%`, transform: cur ? zoomTo(cur.x, cur.y) : "none" }}>
            <img src={FLEET_PHOTO} alt="Abhi Cabs sedan, SUV, tempo traveller and bus" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <div aria-hidden className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity duration-500 ${cur ? "opacity-100" : "opacity-0"}`} />

          {/* hotspots (overview only) */}
          {items.map((v, i) => (
            <button key={v.label} type="button" onClick={() => setActive(i)} aria-label={`Show ${v.label}`} tabIndex={cur ? -1 : 0}
              className={`absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center w-11 h-11 rounded-full transition-opacity duration-300 ${white} ${cur ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              style={{ left: `${v.x}%`, top: `${((v.y - CROP_TOP) / VISIBLE_H) * 100}%` }}>
              <span aria-hidden className="absolute inset-0 rounded-full bg-primary/50 animate-ping motion-reduce:animate-none" />
              <span aria-hidden className="relative grid place-items-center w-7 h-7 rounded-full bg-primary text-text text-[13px] font-black ring-4 ring-white/70">{i + 1}</span>
            </button>
          ))}

          {/* glass info card (desktop overlay; mobile reads it from the selector below) */}
          {cur && (
            <div className="hidden md:block absolute left-6 bottom-6 max-w-[420px] rounded-[20px] bg-white/15 backdrop-blur-xl border border-white/25 p-6 text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]">
              <p className="text-[12.5px] font-bold text-primary tabular-nums">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
              <p className="mt-1.5 text-[24px] font-extrabold tracking-[-0.02em] leading-tight">{cur.label}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/90">{cur.desc}</p>
            </div>
          )}
          {cur && (
            <button type="button" onClick={() => setActive(null)}
              className={`absolute top-3 right-3 md:top-4 md:right-4 rounded-full bg-black/55 backdrop-blur px-4 py-2 text-[13px] font-bold text-white hover:bg-black/75 ${white}`}>
              Show all vehicles
            </button>
          )}
        </div>

        {/* selector — also carries every description (visible on mobile, for screen readers on desktop) */}
        <ul className={`mt-4 grid grid-cols-2 ${items.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-3`}>
          {items.map((v, i) => {
            const on = i === active;
            return (
              <li key={v.label}>
                <button type="button" aria-pressed={on} onClick={() => setActive(on ? null : i)}
                  className={`w-full h-full text-left rounded-[18px] px-5 py-4 border-2 transition-colors ${focusRing} ${on ? "bg-text text-white border-text" : "bg-white border-border hover:border-text"}`}>
                  <span className={`text-[12px] font-bold tabular-nums ${on ? "text-primary" : "text-[#B88A00]"}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="block mt-1 text-[15.5px] font-extrabold leading-snug">{v.label}</span>
                  <span className={`block mt-1 text-[13.5px] leading-relaxed ${on ? "text-white/75" : "text-text-secondary"} md:sr-only`}>{v.desc}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 text-center">
        {data.note && <p className="text-[13.5px] text-text-secondary">{data.note}</p>}
        {(data.links || []).map((l, i) => <p key={i} className="text-[14.5px]">{renderInline(l)}</p>)}
        {data.ctaLabel && <Button href="/fleet" variant="outline" size="lg">{data.ctaLabel}</Button>}
      </div>
    </Band>
  );
}

/* ════════════ 4. Benefits — big numbered rows on yellow; hovering a row inverts it ════════════ */

export function BenefitRows({ data, ctaLabel, onCta }) {
  const items = data.items || [];
  return (
    <Band id="benefits" bg="bg-primary">
      <Head id="benefits" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />
      <ul className="mt-12 border-t-2 border-text">
        {items.map((f, i) => {
          const Icon = resolveIcon(f);
          return (
            <li key={f.title} className="group relative border-b border-text/20 overflow-hidden">
              <span aria-hidden className="absolute inset-0 bg-text origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none" />
              <div className="relative grid grid-cols-[40px_minmax(0,1fr)] md:grid-cols-[72px_minmax(0,5fr)_minmax(0,4fr)_56px] items-center gap-x-4 md:gap-x-6 gap-y-1 py-6 md:py-7 px-1 md:px-4 transition-colors duration-300 group-hover:text-white">
                <span className="text-[14px] md:text-[15px] font-black tabular-nums text-text/50 group-hover:text-primary transition-colors">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="text-[21px] md:text-[30px] font-extrabold tracking-[-0.03em] leading-tight transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transition-none">{f.title}</h3>
                <p className="col-start-2 md:col-start-auto text-[14.5px] md:text-[15px] leading-relaxed text-text/75 group-hover:text-white/80 transition-colors">{f.desc}</p>
                <span aria-hidden className="hidden md:grid place-items-center w-12 h-12 rounded-full border-2 border-text/25 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-text group-hover:-rotate-12 motion-reduce:transition-none">
                  <Icon size={22} strokeWidth={1.9} />
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {ctaLabel && <div className="mt-10 text-center"><Button size="lg" className="bg-text! text-white! shadow-none! hover:bg-black!" onClick={onCta}>{ctaLabel}</Button></div>}
    </Band>
  );
}

/* ════════════ 6. Tips — cards that stack as you scroll ════════════ */

const TIP_ICONS = [
  [/pickup|drop|location/i, MapPin], [/duration/i, Clock3], [/extra/i, PlusCircle], [/kilomet/i, Gauge],
  [/parking|toll/i, Receipt], [/capacity|passenger/i, Users], [/availab/i, CalendarCheck],
];
const tipIcon = (t) => (TIP_ICONS.find(([re]) => re.test(t)) || [null, Check])[1];
const TIP_STYLES = ["bg-white text-text border border-border", "bg-primary text-text", "bg-[#111] text-white", "bg-[#F4F0E2] text-text"];

export function TipStack({ data, onBook, ctaLabel }) {
  const items = data.items || [];
  return (
    <Band id="tips" bg="bg-white">
      <Head id="tips" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />
      <ol className="mt-12 max-w-[860px] mx-auto">
        {items.map((t, i) => {
          const Icon = tipIcon(t.title);
          const dark = i % TIP_STYLES.length === 2;
          return (
            <li key={t.title} className="sticky mb-5" style={{ top: `${96 + i * 14}px` }}>
              <div className={`rounded-[26px] p-7 md:p-10 min-h-[190px] grid grid-cols-[minmax(0,1fr)_auto] gap-6 items-start shadow-[0_-18px_40px_-28px_rgba(0,0,0,.45)] ${TIP_STYLES[i % TIP_STYLES.length]}`}>
                <div>
                  <span className={`text-[13px] font-black tabular-nums ${dark ? "text-primary" : "text-text/45"}`}>{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-[24px] md:text-[34px] font-extrabold tracking-[-0.03em] leading-tight">{t.title}</h3>
                  <p className={`mt-3 text-[15.5px] md:text-[17px] leading-relaxed max-w-[520px] ${dark ? "text-white/75" : "text-text/70"}`}>{t.desc}</p>
                </div>
                <Icon aria-hidden strokeWidth={1.4} className={`w-12 h-12 md:w-20 md:h-20 ${dark ? "text-primary" : "text-text"}`} />
              </div>
            </li>
          );
        })}
      </ol>
      {ctaLabel && <div className="mt-6 text-center"><Button size="lg" onClick={() => onBook({ tripType: "local" })}>{ctaLabel}</Button></div>}
    </Band>
  );
}

/* ════════════ 7. FAQ — searchable ════════════ */

export function FaqSearch({ heading, items, placeholder = "Search questions, e.g. packages, airport, toll" }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? items.filter((f) => `${f.q} ${typeof f.a === "string" ? f.a : f.text || ""}`.toLowerCase().includes(t)) : items;
  }, [q, items]);
  const wa = whatsappHref();
  const link = `inline-flex items-center gap-2 text-[15px] font-semibold hover:text-[#B88A00] rounded-sm ${focusRing}`;
  return (
    <Band id="faq" bg="bg-bg">
      <Head id="faq" center eyebrow="FAQ" title={heading} />
      <div className="mt-10 max-w-[880px] mx-auto">
        <label className="relative block">
          <span className="sr-only">Search the questions</span>
          <Search size={19} aria-hidden className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
            className="w-full h-14 rounded-full border-2 border-border bg-white pr-5 text-[15px] font-medium outline-none focus:border-primary transition-colors" style={{ paddingLeft: 52 }} />
        </label>
        <p className="mt-3 text-[13px] text-text-secondary text-center" aria-live="polite">
          {q.trim() ? `${shown.length} of ${items.length} questions` : `${items.length} questions`}
        </p>
        <div className="mt-5">
          {shown.length > 0
            ? <Accordion key={q} items={shown} tone="tint" />
            : <p className="rounded-[18px] bg-white border border-border px-6 py-8 text-center text-[15px]">No questions match “{q}”. Ask our team directly:</p>}
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {PHONES.map((p) => <li key={p.href}><a href={p.href} className={link}><Phone size={17} aria-hidden /> {p.label}</a></li>)}
          {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className={link}><MessageCircle size={17} aria-hidden /> Chat on WhatsApp</a></li>}
        </ul>
      </div>
    </Band>
  );
}

/* ════════════ 4. Benefits — dark hairline grid with a cursor spotlight ════════════ */

const CTA_SPAN = { 1: "lg:col-span-3", 2: "lg:col-span-2" };

export function BenefitsBento({ data, onBook, ctaLabel, ctaJourney = { tripType: "local" } }) {
  const items = data.items || [];
  const glow = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  const cell = "relative overflow-hidden bg-[#0E0E0E] p-7 sm:p-8 min-h-[220px] flex flex-col";
  return (
    <Band id="benefits" bg="bg-[#0A0A0A]" className="text-white">
      <Head id="benefits" center light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-[24px] overflow-hidden border border-white/10">
        {items.map((f, i) => {
          const Icon = resolveIcon(f);
          return (
            <li key={f.title} onMouseMove={glow} className={`group ${cell}`}>
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), rgba(255,213,79,.16), transparent 70%)" }} />
              <span className="relative grid place-items-center w-12 h-12 rounded-full border border-white/15 bg-white/[.04] group-hover:border-primary/60 transition-colors">
                <Icon aria-hidden size={22} strokeWidth={1.7} className="text-primary" />
              </span>
              <span aria-hidden className="relative mt-auto pt-10 text-[12px] font-bold text-white/30 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="relative mt-1 text-[17px] font-extrabold tracking-[-0.01em] leading-snug">{f.title}</h3>
              <p className="relative mt-1.5 text-[14px] text-white/60 leading-relaxed">{f.desc}</p>
            </li>
          );
        })}
        {onBook && items.length % 4 !== 0 && (
          <li className={`${cell} bg-primary! text-text justify-between ${CTA_SPAN[items.length % 4] || ""}`}>
            <Car aria-hidden size={40} strokeWidth={1.5} />
            <div className="mt-10">
              <p className="text-[20px] font-extrabold tracking-[-0.02em] leading-tight">{ctaLabel}</p>
              <Button variant="primary" className="mt-4 bg-text! text-white! hover:bg-[#2A2A2A]!" onClick={() => onBook(ctaJourney)}>
                Start booking <ArrowRight size={17} aria-hidden />
              </Button>
            </div>
          </li>
        )}
      </ul>
    </Band>
  );
}

/* ════════════ 5. Coverage — route map: cities at their real positions, routes from Bengaluru ════════════ */

/** Cities we serve with a page or that the coverage copy names, with real coordinates. */
const CITIES = [
  { name: "Bengaluru", state: "Karnataka", lat: 12.97, lon: 77.59, href: "/bangalore/car-rental", hub: true },
  { name: "Mangaluru", state: "Karnataka", lat: 12.91, lon: 74.86, href: "/cities/mangaluru" },
  { name: "Tirupati", state: "Andhra Pradesh", lat: 13.63, lon: 79.42, href: "/cities/tirupati" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.69, lon: 83.22, href: "/cities/visakhapatnam" },
  { name: "Pune", state: "Maharashtra", lat: 18.52, lon: 73.86, href: "/cities/pune" },
  { name: "Hyderabad", state: "Telangana", lat: 17.39, lon: 78.49 },
];
const MAP = { w: 1000, h: 640, lon0: 72.6, lon1: 84.4, lat0: 11.7, lat1: 19.6 };
const px = (c) => ({ x: ((c.lon - MAP.lon0) / (MAP.lon1 - MAP.lon0)) * MAP.w, y: ((MAP.lat1 - c.lat) / (MAP.lat1 - MAP.lat0)) * MAP.h });

export function CoverageStates({ data, onBook, tripType = "local", bookLabel = "Book local" }) {
  const cities = CITIES.filter((c) => `${data.heading || ""} ${data.subheading || ""}`.includes(c.state));
  const [sel, setSel] = useState(cities[0]?.name);
  const cur = cities.find((c) => c.name === sel) || cities[0];
  const hub = cities.find((c) => c.hub);
  const states = [...new Set(cities.map((c) => c.state))];

  return (
    <Band id="coverage" bg="bg-white">
      <Head id="coverage" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} />
      <div className="mt-6 max-w-[760px] mx-auto text-center space-y-3">
        {(data.body || []).map((p, i) => <p key={i} className="text-[15.5px] text-text-secondary leading-[1.75]">{renderInline(p)}</p>)}
      </div>

      {cities.length > 0 && (<>
        <style>{`
          .ac-route { animation: ac-dash 1.6s linear infinite; }
          .ac-pulse { transform-box: fill-box; transform-origin: center; animation: ac-pulse 1.8s ease-out infinite; }
          @keyframes ac-dash { to { stroke-dashoffset: -32; } }
          @keyframes ac-pulse { 0% { transform: scale(.6); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
          @media (prefers-reduced-motion: reduce) { .ac-route, .ac-pulse { animation: none; } }
        `}</style>
        <div className="relative mt-12 rounded-[28px] overflow-hidden bg-[#111]"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.13) 1.2px, transparent 1.3px)", backgroundSize: "22px 22px" }}>
          <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} className="block w-full h-auto" role="group" aria-label="Cities we serve">
            {hub && cities.filter((c) => !c.hub).map((c) => {
              const a = px(hub), b = px(c);
              const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 70;
              return <path key={c.name} d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`} fill="none" strokeWidth="2.5" strokeDasharray="7 9" strokeLinecap="round"
                className={`ac-route transition-[stroke] duration-300 ${c.name === sel ? "stroke-[#FFD54F]" : "stroke-white/25"}`} />;
            })}
            {cities.map((c) => {
              const { x, y } = px(c); const on = c.name === sel;
              return (
                <g key={c.name} transform={`translate(${x},${y})`} className="cursor-pointer outline-none" onClick={() => setSel(c.name)} onMouseEnter={() => setSel(c.name)} onFocus={() => setSel(c.name)}
                  tabIndex={0} role="button" aria-pressed={on} aria-label={`${c.name}, ${c.state}`} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(c.name))}>
                  {on && <circle r="26" className="fill-[#FFD54F]/20 ac-pulse" />}
                  <circle r={c.hub ? 11 : 8} className={on ? "fill-[#FFD54F]" : "fill-white"} />
                  <circle r={c.hub ? 4.5 : 3} className="fill-[#111]" />
                  <text y={-22} textAnchor="middle" className={`text-[22px] font-extrabold ${on ? "fill-[#FFD54F]" : "fill-white"}`} style={{ paintOrder: "stroke", stroke: "#111", strokeWidth: 6 }}>{c.name}</text>
                </g>
              );
            })}
          </svg>

          {cur && (
            <div className="sm:absolute sm:right-6 sm:bottom-6 m-4 sm:m-0 sm:w-[300px] rounded-[20px] bg-white p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)]" aria-live="polite">
              <p className="text-[12.5px] font-bold text-[#7A5D00]">{cur.state}</p>
              <h3 className="mt-0.5 text-[22px] font-extrabold tracking-[-0.02em]">{cur.name}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onBook({ tripType, pickup: cur.name })}>{bookLabel}</Button>
                {cur.href && <Button size="sm" variant="outline" href={cur.href}>City page</Button>}
              </div>
            </div>
          )}
        </div>
      </>)}

      {/* the same cities as plain links, grouped by state */}
      <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {states.map((s) => (
          <li key={s} className="text-[14px]">
            <span className="font-bold">{s}:</span>{" "}
            {cities.filter((c) => c.state === s).map((c, i, arr) => (
              <React.Fragment key={c.name}>
                {c.href ? <a href={c.href} className={`font-semibold underline underline-offset-4 decoration-2 decoration-primary rounded-sm ${focusRing}`}>{c.name}</a> : <span className="font-semibold">{c.name}</span>}
                {i < arr.length - 1 ? ", " : ""}
              </React.Fragment>
            ))}
          </li>
        ))}
      </ul>
    </Band>
  );
}

/* ════════════ Car Rental: coverage as boarding-pass tickets + city marquee ════════════ */

/** City → its airport code (used as the ticket's big code). */
const CITY_CODES = { Bengaluru: "BLR", Mangaluru: "IXE", Tirupati: "TIR", Visakhapatnam: "VTZ", Pune: "PNQ", Hyderabad: "HYD" };

function Marquee({ items, reverse = false, outline = false }) {
  const row = items.map((t) => (
    <span key={t} className="flex items-center gap-8 md:gap-12 pr-8 md:pr-12">
      <span className={outline ? "text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,.45)]" : "text-primary"}>{t}</span>
      <span aria-hidden className={outline ? "text-white/30" : "text-white/40"}>✦</span>
    </span>
  ));
  return (
    <div className="flex overflow-hidden whitespace-nowrap select-none">
      {[0, 1].map((k) => (
        <div key={k} className={`flex shrink-0 text-[40px] md:text-[72px] font-black tracking-[-0.03em] leading-none py-2 ac-marquee ${reverse ? "ac-marquee-rev" : ""}`}>{row}</div>
      ))}
    </div>
  );
}

export function CoverageTickets({ data, onBook, tripType = "local", bookLabel = "Book local" }) {
  const text = `${data.heading || ""} ${data.subheading || ""}`;
  const cities = CITIES.filter((c) => text.includes(c.state));
  const states = [...new Set(cities.map((c) => c.state))];
  if (!cities.length) return null;

  return (
    <section id="coverage" aria-labelledby="coverage-title" className="bg-[#111] text-white py-16 md:py-24 scroll-mt-28 ac-cv overflow-hidden">
      <style>{"@keyframes ac-mq{to{transform:translateX(-100%)}}.ac-marquee{animation:ac-mq 38s linear infinite}.ac-marquee-rev{animation-direction:reverse}@media (prefers-reduced-motion:reduce){.ac-marquee{animation:none}}"}</style>
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <Head id="coverage" center light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} />
        <div className="mt-6 max-w-[760px] mx-auto text-center space-y-3">
          {(data.body || []).map((p, i) => <p key={i} className="text-[15.5px] text-white/65 leading-[1.75] [&_a]:text-primary">{renderInline(p)}</p>)}
        </div>
      </div>

      {/* decorative: cities one way, states the other */}
      <div aria-hidden className="mt-12 md:mt-16 -rotate-2 scale-[1.04] border-y border-white/10 py-3 bg-white/[.03]">
        <Marquee items={cities.map((c) => c.name)} />
        <Marquee items={states} reverse outline />
      </div>

      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <ul className="mt-14 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {cities.map((c, i) => {
            const code = CITY_CODES[c.name] || c.name.slice(0, 3).toUpperCase();
            return (
              <li key={c.name} className={`group transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-2 motion-reduce:transition-none ${i % 2 ? "hover:rotate-[1.2deg]" : "hover:-rotate-[1.2deg]"}`}>
                <article className="relative rounded-[22px] bg-[#FAF7EE] text-text overflow-hidden shadow-[0_24px_50px_-30px_rgba(0,0,0,.8)]">
                  {/* ticket body */}
                  <div className="px-6 pt-6 pb-7">
                    <div className="flex items-center justify-between text-[11.5px] font-bold tracking-[.08em] uppercase text-text/50">
                      <span>Abhi Cabs 24×7</span>
                      <span>{c.state}</span>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-4">
                      <div>
                        <p aria-hidden className="text-[56px] md:text-[64px] font-black leading-[.9] tracking-[-0.04em] transition-colors duration-300 group-hover:text-[#E0A800]">{code}</p>
                        <h3 className="mt-2 text-[19px] font-extrabold tracking-[-0.02em]">{c.name}</h3>
                      </div>
                      <div aria-hidden className="flex items-center gap-1.5 pb-2 text-text/35">
                        <span className="w-2 h-2 rounded-full border-2 border-current" />
                        <span className="w-10 md:w-14 border-t-2 border-dashed border-current" />
                        <Car size={20} strokeWidth={2} className="text-text transition-transform duration-500 group-hover:translate-x-1.5 motion-reduce:transition-none" />
                      </div>
                    </div>
                  </div>
                  {/* perforation with side notches */}
                  <div aria-hidden className="relative h-0 border-t-2 border-dashed border-text/15 mx-5">
                    <span className="absolute -left-[32px] -top-[13px] w-6 h-6 rounded-full bg-[#111]" />
                    <span className="absolute -right-[32px] -top-[13px] w-6 h-6 rounded-full bg-[#111]" />
                  </div>
                  {/* stub */}
                  <div className="px-6 py-5 flex flex-wrap items-center gap-2.5">
                    <Button size="sm" onClick={() => onBook({ tripType, pickup: c.name })} aria-label={`${bookLabel} in ${c.name}`}>{bookLabel}</Button>
                    {c.href && <Button size="sm" variant="outline" href={c.href}>City page</Button>}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
