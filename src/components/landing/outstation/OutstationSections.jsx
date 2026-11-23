import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock, MapPin, Plus } from "lucide-react";
import Button from "../../ui/Button";
import { Band, Head } from "../bangalore/shared";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

/* ════════════ Trip types — switcher with an animated route diagram per type ════════════ */

/** Diagram per trip type: stops (x,y in a 320×160 box) and the path the car takes. */
const DIAGRAMS = {
  oneway: { stops: [[40, 110], [280, 50]], path: "M40,110 C120,110 200,50 280,50", labels: ["A", "B"] },
  round: { stops: [[50, 80], [270, 80]], path: "M50,80 C110,20 210,20 270,80 C210,140 110,140 50,80", labels: ["A", "B"] },
  multi: { stops: [[40, 120], [130, 40], [230, 70], [290, 130]], path: "M40,120 C60,60 100,40 130,40 C170,40 200,70 230,70 C260,70 280,100 290,130", labels: ["A", "B", "C", "D"] },
};
const kindOf = (title = "") => (/round/i.test(title) ? "round" : /multi/i.test(title) ? "multi" : "oneway");
const journeyFor = (kind) => (kind === "round" || kind === "multi" ? { tripType: "round-trip" } : { tripType: "one-way" });

function RouteDiagram({ kind, moving = true }) {
  const d = DIAGRAMS[kind];
  const dur = kind === "multi" ? "5s" : kind === "round" ? "4.6s" : "3.4s";
  return (
    <svg viewBox="0 0 320 160" className="w-full h-auto" aria-hidden>
      <path d={d.path} fill="none" stroke="rgba(17,17,17,.12)" strokeWidth="10" strokeLinecap="round" />
      <path key={kind} d={d.path} fill="none" stroke="#111" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" pathLength="100" className="ac-draw" />
      {d.stops.map(([x, y], i) => (
        <g key={`${kind}-${i}`} className="ac-pop" style={{ animationDelay: `${0.25 + i * 0.2}s` }}>
          <circle cx={x} cy={y} r="17" fill={i === 0 ? "#111" : "#FFD54F"} stroke="#111" strokeWidth="2.5" />
          <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={i === 0 ? "#FFD54F" : "#111"} fontFamily="inherit">{d.labels[i]}</text>
        </g>
      ))}
      {/* the cab driving the route */}
      {moving && (
        <g key={`car-${kind}`}>
          <animateMotion dur={dur} begin="1s" repeatCount="indefinite" path={d.path} rotate="auto" keyPoints={kind === "oneway" ? "0;1;1" : "0;1"} keyTimes={kind === "oneway" ? "0;0.8;1" : "0;1"} calcMode="linear" />
          <rect x="-13" y="-8" width="26" height="16" rx="5" fill="#111" />
          <rect x="-6" y="-6" width="11" height="12" rx="2.5" fill="#FFD54F" />
          <circle cx="9" cy="-4" r="1.6" fill="#FFF1B8" /><circle cx="9" cy="4" r="1.6" fill="#FFF1B8" />
        </g>
      )}
    </svg>
  );
}

export function TripTypeSwitcher({ eyebrow, title, description, types, onBook }) {
  const [active, setActiveRaw] = useState(0);
  const [picked, setPicked] = useState(false);        // stop auto-cycling once the visitor chooses
  const [hover, setHover] = useState(false);
  const boxRef = useRef(null);
  const inView = useInView(boxRef, { amount: 0.4 });
  const reduce = useReducedMotion();
  const setActive = (i) => { setPicked(true); setActiveRaw(i); };
  useEffect(() => {
    if (!inView || picked || hover || reduce || types.length < 2) return;
    const t = setInterval(() => setActiveRaw((a) => (a + 1) % types.length), 5500);
    return () => clearInterval(t);
  }, [inView, picked, hover, reduce, types.length]);
  const base = useId();
  const tabs = useRef([]);
  const cur = types[active];
  const kind = cur.kind || kindOf(cur.title);
  const onKey = (e, i) => {
    const n = types.length;
    const next = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : null;
    if (next === null) return;
    e.preventDefault(); setActive(next); tabs.current[next]?.focus();
  };
  return (
    <Band id="trip-types" bg="bg-white">
      <style>{"@keyframes ac-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}.ac-draw{stroke-dasharray:100;animation:ac-draw 1.1s cubic-bezier(.22,1,.36,1) both}@keyframes ac-pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}.ac-pop{transform-box:fill-box;transform-origin:center;animation:ac-pop .45s cubic-bezier(.22,1,.36,1) both}@media (prefers-reduced-motion:reduce){.ac-draw,.ac-pop{animation:none}}"}</style>
      <Head id="trip-types" center eyebrow={eyebrow} title={title} intro={description ? [description] : []} />

      <div role="tablist" aria-label="Trip types" className="mt-10 mx-auto w-fit max-w-full flex gap-1.5 rounded-full bg-[#F3F2EE] p-1.5 overflow-x-auto">
        {types.map((t, i) => (
          <button key={t.short || t.title} ref={(el) => (tabs.current[i] = el)} type="button" role="tab" id={`${base}-t${i}`} aria-controls={`${base}-p`}
            aria-selected={i === active} tabIndex={i === active ? 0 : -1} onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14.5px] font-bold transition-colors ${focusRing} ${i === active ? "bg-text text-white" : "text-text hover:bg-white"}`}>
            <span aria-hidden className={i === active ? "text-primary" : ""}>{t.icon}</span>{t.short || t.title}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${base}-p`} aria-labelledby={`${base}-t${active}`}
        ref={boxRef} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className="mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8 md:gap-12 items-center rounded-[32px] bg-primary p-7 sm:p-10 md:p-14">
        <div className="rounded-[24px] bg-[#FFE28A] p-6 md:p-8"><RouteDiagram kind={kind} moving={!reduce && inView} /></div>
        <div>
          <h3 className="text-[30px] md:text-[42px] font-extrabold tracking-[-0.03em] leading-[1.05]">{cur.title}</h3>
          <p className="mt-4 text-[16px] md:text-[17px] leading-[1.7] text-text/80">{cur.desc}</p>
          {cur.highlight && <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-text text-white px-4 py-2 text-[13.5px] font-bold"><Check size={15} strokeWidth={3} aria-hidden className="text-primary" />{cur.highlight}</p>}
          <div className="mt-7">
            <Button size="lg" className="bg-text! text-white! shadow-none! hover:bg-black!" onClick={() => onBook(journeyFor(kind))}>
              {cur.cta || `Plan a ${cur.title.toLowerCase()}`} <ArrowRight size={18} aria-hidden />
            </Button>
          </div>
        </div>
      </div>
      {/* every type's text stays in the page for search engines and screen readers */}
      <ul className="sr-only">{types.filter((_, i) => i !== active).map((t) => <li key={t.title}>{t.title}: {t.desc} {t.highlight || ""}</li>)}</ul>
    </Band>
  );
}

/* ════════════ Popular routes — dark destination board, photo follows the cursor ════════════ */

const FILTERS = [
  { id: "all", label: "All routes", test: () => true },
  { id: "near", label: "Under 300 km", test: (r) => r.km < 300 },
  { id: "far", label: "300 km and more", test: (r) => r.km >= 300 },
];

export function RouteBoard({ eyebrow, title, sub, description, note, ctaLabel, routes, onBook }) {
  const [filter, setFilter] = useState("all");
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const box = useRef(null);
  const list = useMemo(() => routes.filter(FILTERS.find((f) => f.id === filter).test), [routes, filter]);
  const move = (e) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    setPos({ x: Math.min(e.clientX - r.left + 28, r.width - 310), y: e.clientY - r.top });
  };

  return (
    <Band id="routes" bg="bg-[#111]" className="text-white">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <Head id="routes" light eyebrow={eyebrow} title={title} sub={sub} intro={description ? [description] : []} />
        <div role="group" aria-label="Filter routes by distance" className="flex flex-wrap gap-2 shrink-0">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-2.5 text-[13.5px] font-bold border-2 transition-colors ${focusRing.replace("outline-text", "outline-primary")} ${filter === f.id ? "bg-primary text-text border-primary" : "border-white/20 text-white hover:border-white/50"}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={box} className="relative mt-12" onMouseMove={move} onMouseLeave={() => setHover(null)}>
        {/* floating photo (desktop pointer only, decorative) */}
        <div aria-hidden className={`pointer-events-none hidden lg:block absolute z-20 w-[300px] aspect-[4/3] rounded-[18px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] transition-[opacity,transform] duration-300 ease-out ${hover ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          style={{ left: pos.x, top: pos.y - 110, rotate: "-4deg" }}>
          {routes.map((r) => (
            <img key={r.to} src={r.img} alt="" loading="lazy" decoding="async" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hover === r.to ? "opacity-100" : "opacity-0"}`} />
          ))}
        </div>

        <ul className="border-t border-white/15">
          {list.map((r, i) => (
            <li key={r.to} onMouseEnter={() => setHover(r.to)}
              className="group grid grid-cols-[64px_minmax(0,1fr)_auto] lg:grid-cols-[56px_minmax(0,1fr)_200px_auto] items-center gap-x-4 lg:gap-x-8 gap-y-2 py-5 md:py-6 border-b border-white/12">
              <span className="text-[13px] font-black tabular-nums text-white/35 hidden lg:block">{String(i + 1).padStart(2, "0")}</span>
              <img src={r.img} alt="" loading="lazy" decoding="async" className="lg:hidden w-16 h-16 rounded-[14px] object-cover" />
              <div className="min-w-0">
                {r.label && <span className="sr-only">{r.label}</span>}
                <p aria-hidden={r.label ? true : undefined} className="text-[13px] font-semibold text-white/50">{r.from} to</p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[26px] md:text-[44px] font-extrabold tracking-[-0.03em] leading-tight transition-colors duration-300 group-hover:text-primary">{r.to}</span>
                  {r.tag && <span className="rounded-full border border-white/25 px-2.5 py-0.5 text-[11.5px] font-bold text-white/75">{r.tag}</span>}
                </p>
                {r.desc && <p className="mt-1.5 text-[14px] md:text-[15px] text-white/65 leading-snug max-w-[560px]">{r.desc}</p>}
                <p className="lg:hidden mt-1 flex gap-4 text-[13px] text-white/60">
                  <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden />{r.km} km</span>
                  <span className="inline-flex items-center gap-1"><Clock size={13} aria-hidden />~{r.hr} hrs</span>
                </p>
              </div>
              <p className="hidden lg:flex gap-5 text-[14px] text-white/65 tabular-nums">
                <span className="inline-flex items-center gap-1.5"><MapPin size={15} aria-hidden />{r.km} km</span>
                <span className="inline-flex items-center gap-1.5"><Clock size={15} aria-hidden />~{r.hr} hrs</span>
              </p>
              <Button size="sm" variant="outlineInverse" className="group-hover:bg-primary! group-hover:text-text! group-hover:border-primary!"
                onClick={() => onBook({ tripType: "one-way", pickup: r.from, drop: r.to })} aria-label={`Get fare from ${r.from} to ${r.to}`}>
                Get fare
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {note && <p className="mt-10 max-w-[680px] mx-auto text-center text-[14.5px] text-white/65 leading-relaxed">{note}</p>}
      {ctaLabel && <div className="mt-6 text-center"><Button size="lg" onClick={() => onBook({ tripType: "one-way" })}>{ctaLabel}</Button></div>}
    </Band>
  );
}

/* ════════════ Pricing — a fare receipt: included vs charged separately ════════════ */

export function FareReceipt({ eyebrow, title, included, extrasTitle, extras, note }) {
  return (
    <Band id="pricing" bg="bg-primary-tint">
      <Head id="pricing" center eyebrow={eyebrow} title={title} />
      <div className="relative mt-12 max-w-[920px] mx-auto bg-white rounded-t-[24px] shadow-[0_40px_80px_-50px_rgba(0,0,0,.55)] md:-rotate-[0.6deg]">
        <div className="flex items-center justify-between px-7 sm:px-10 py-5 border-b-2 border-dashed border-border">
          <span className="text-[15px] font-black tracking-[-0.01em]">ABHI CABS 24×7</span>
          <span className="text-[13px] font-bold text-text-secondary">Outstation fare</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-dashed divide-border">
          <div className="px-7 sm:px-10 py-7">
            <h3 className="text-[13px] font-black uppercase tracking-[.08em] text-[#2E7D32]">Included in your fare</h3>
            <ul className="mt-4 space-y-3.5">
              {included.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] font-semibold leading-snug">
                  <span className="mt-0.5 grid place-items-center w-5 h-5 shrink-0 rounded-full bg-[#2E7D32] text-white"><Check size={12} strokeWidth={3.5} aria-hidden /></span>{t}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-7 sm:px-10 py-7 border-t-2 border-dashed border-border md:border-t-0">
            <h3 className="text-[13px] font-black uppercase tracking-[.08em] text-text-secondary">{extrasTitle}</h3>
            <ul className="mt-4 space-y-3.5">
              {extras.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-snug text-text-secondary">
                  <span className="mt-0.5 grid place-items-center w-5 h-5 shrink-0 rounded-full border-2 border-[#C9C9C9]"><Plus size={11} strokeWidth={3.5} aria-hidden /></span>{t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {note && <p className="mx-7 sm:mx-10 mb-10 rounded-[14px] bg-[#111] text-white px-5 py-4 text-[14px] leading-relaxed">{note}</p>}
        <div aria-hidden className="absolute left-0 right-0 -bottom-[10px] h-[10px]" style={{ background: "radial-gradient(circle at 10px 0, #fff 9.5px, transparent 10px) 0 0 / 20px 10px repeat-x" }} />
      </div>
    </Band>
  );
}
