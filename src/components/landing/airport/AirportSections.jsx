import React, { useEffect, useId, useRef, useState } from "react";
import { PlaneLanding, PlaneTakeoff, Clock3, Briefcase, Users, Plane, Check, ChevronDown, ArrowRight, Car, CarFront, Caravan, BusFront } from "lucide-react";
import Button from "../../ui/Button";
import { AIRPORTS } from "../../../data/airports";
import { Band, Head, renderInline, splitLabel } from "../bangalore/shared";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

/* ════════════ Airport services — overhead terminal signs that open into details ════════════ */

/** Pictogram + booking for each service, matched on its heading. */
const SIGNS = [
  { test: /pickup/i, Icon: PlaneLanding, journey: { tripType: "airport", airportDirection: "pickup" }, label: "Book a pickup" },
  { test: /drop/i, Icon: PlaneTakeoff, journey: { tripType: "airport", airportDirection: "drop" }, label: "Book a drop" },
  { test: /24|late-night|early/i, Icon: Clock3, journey: { tripType: "airport" }, label: "Book any time" },
  { test: /corporate|business/i, Icon: Briefcase, journey: { tripType: "airport" }, label: "Book a business ride" },
  { test: /family|group/i, Icon: Users, journey: { tripType: "airport" }, label: "Book for a group" },
];
const signFor = (h) => SIGNS.find((s) => s.test.test(h)) || { Icon: Plane, journey: { tripType: "airport" }, label: "Book now" };

export function TerminalSigns({ data, onBook }) {
  const items = data.items || [];
  const [open, setOpen] = useState(0);
  const base = useId();
  return (
    <Band id="services" bg="bg-white">
      <Head id="services" center eyebrow={data.eyebrow} title={data.heading} intro={data.body} />
      <ul className="mt-12 max-w-[980px] mx-auto space-y-3">
        {items.map((it, i) => {
          const s = signFor(it.heading);
          const on = open === i;
          const [title, tail] = it.heading.split(/ – /);
          return (
            <li key={it.heading} className="rounded-[18px] overflow-hidden bg-[#111] text-white shadow-[0_18px_40px_-28px_rgba(0,0,0,.7)]">
              <h3>
                <button type="button" aria-expanded={on} aria-controls={`${base}-${i}`} onClick={() => setOpen(on ? -1 : i)}
                  className={`w-full flex items-center gap-4 md:gap-5 p-3 pr-5 md:pr-6 text-left ${focusRing.replace("outline-text", "outline-primary")}`}>
                  <span className="grid place-items-center w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[12px] bg-primary text-text">
                    <s.Icon size={30} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[18px] md:text-[24px] font-extrabold tracking-[-0.02em] leading-tight">{title}</span>
                    {tail && <span className="block mt-0.5 text-[13px] md:text-[14px] font-semibold text-white/55">{tail}</span>}
                  </span>
                  <span aria-hidden className="hidden sm:block text-[13px] font-black tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <ChevronDown size={22} aria-hidden className={`shrink-0 transition-transform duration-300 ${on ? "rotate-180 text-primary" : "text-white/60"}`} />
                </button>
              </h3>
              <div id={`${base}-${i}`} className={`grid transition-[grid-template-rows] duration-400 ease-out motion-reduce:transition-none ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <div className="px-5 md:px-6 pb-6 md:pl-[100px] flex flex-col md:flex-row md:items-end gap-5 md:gap-10">
                    <div className="flex-1 space-y-2">
                      {[].concat(it.body || []).map((p, j) => <p key={j} className="text-[15px] leading-[1.75] text-white/75 [&_a]:text-primary [&_a:hover]:text-white">{renderInline(p)}</p>)}
                    </div>
                    <Button size="md" tabIndex={on ? 0 : -1} className="shrink-0" onClick={() => onBook(s.journey)}>{s.label} <ArrowRight size={16} aria-hidden /></Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

/* ════════════ Vehicle options — baggage tags on strings that swing on hover ════════════ */

const TAG_META = [
  { test: /sedan/i, code: "SDN", Icon: Car },
  { test: /suv|muv/i, code: "SUV", Icon: CarFront },
  { test: /tempo/i, code: "TT", Icon: Caravan },
  { test: /urbania/i, code: "URB", Icon: Caravan },
  { test: /bus|coach/i, code: "BUS", Icon: BusFront },
];
const TAG_COLORS = ["bg-primary", "bg-white", "bg-[#111] text-white", "bg-white", "bg-primary"];

export function BaggageTags({ data }) {
  const tags = (data.points || []).map((t, i) => {
    const [label, desc] = splitLabel(t);
    const m = TAG_META.find((x) => x.test.test(label || t)) || { code: String(i + 1).padStart(2, "0"), Icon: Car };
    return { label: label || t, desc, ...m };
  });
  return (
    <Band id="vehicles" bg="bg-[#F4F1E6]">
      <style>{"@keyframes ac-swing{0%{transform:rotate(0)}25%{transform:rotate(5deg)}55%{transform:rotate(-3.5deg)}80%{transform:rotate(1.5deg)}100%{transform:rotate(0)}}.ac-tag:hover .ac-tag-body,.ac-tag:focus-within .ac-tag-body{animation:ac-swing 1.1s ease-in-out}@media (prefers-reduced-motion:reduce){.ac-tag:hover .ac-tag-body{animation:none}}"}</style>
      <Head id="vehicles" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />

      <div className="relative mt-14">
        {/* the rail the tags hang from */}
        <div aria-hidden className="hidden lg:block absolute left-0 right-0 top-[6px] h-[3px] rounded-full bg-text/80" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-5 gap-y-10">
          {tags.map((t, i) => {
            const dark = TAG_COLORS[i % TAG_COLORS.length].includes("111");
            return (
              <li key={t.label} className="ac-tag flex flex-col items-center">
                <span aria-hidden className="hidden lg:block w-[2px] h-10 bg-text/70" />
                <div className={`ac-tag-body origin-top relative w-full max-w-[240px] rounded-[22px] pt-9 pb-7 px-6 shadow-[0_22px_40px_-26px_rgba(0,0,0,.55)] ${TAG_COLORS[i % TAG_COLORS.length]} ${dark ? "" : "text-text"}`}>
                  {/* eyelet */}
                  <span aria-hidden className={`absolute top-3.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-[3px] ${dark ? "border-white/40 bg-[#111]" : "border-text/30 bg-[#F4F1E6]"}`} />
                  <p aria-hidden className={`mt-2 text-[40px] font-black tracking-[-0.04em] leading-none ${dark ? "text-primary" : ""}`}>{t.code}</p>
                  <t.Icon aria-hidden size={28} strokeWidth={1.6} className="absolute right-5 top-12 opacity-70" />
                  <div aria-hidden className={`my-4 border-t-2 border-dashed ${dark ? "border-white/20" : "border-text/15"}`} />
                  <h3 className="text-[16.5px] font-extrabold leading-snug">{t.label}</h3>
                  <p className={`mt-1.5 text-[13.5px] leading-relaxed ${dark ? "text-white/70" : "text-text/70"}`}>{t.desc}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-12 flex flex-col items-center gap-3 text-center">
        {data.note && <p className="text-[13.5px] text-text-secondary">{data.note}</p>}
        {(data.links || []).map((l, i) => <p key={i} className="text-[14.5px]">{renderInline(l)}</p>)}
        {data.ctaLabel && <div className="mt-3"><Button href="/fleet" variant="outline" size="lg">{data.ctaLabel}</Button></div>}
      </div>
    </Band>
  );
}

/* ════════════ Coverage + routes — split-flap departures board ════════════ */

const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Text that "flips" through random letters into place when `go` turns true. First render = final text (SSR-safe). */
function Flap({ text, go, delay = 0 }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    if (!go) return undefined;
    let frame = 0, iv = null;
    const total = 12;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        frame += 1;
        const settled = Math.floor((frame / total) * text.length);
        setShown(text.split("").map((c, i) => (i < settled || !/[A-Za-z0-9]/.test(c) ? c : FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)])).join(""));
        if (frame >= total) { clearInterval(iv); setShown(text); }
      }, 50);
    }, delay);
    return () => { clearTimeout(start); clearInterval(iv); };
  }, [go, text, delay]);
  return <span>{shown}</span>;
}

const KEY_CODES = [[/kempegowda|bengaluru|bangalore/i, "BLR"], [/hyderabad/i, "HYD"], [/pune/i, "PNQ"], [/mangal/i, "IXE"], [/chennai/i, "MAA"], [/mumbai/i, "BOM"]];
/** Airport code for a route row: the "(XXX)" in its text, else matched by name. */
const codeOf = (r) => {
  const t = `${r.from} ${r.to}`;
  return (/\(([A-Z]{3})\)/.exec(t) || [])[1] || (KEY_CODES.find(([re]) => re.test(t)) || [])[1] || "---";
};
/** Route row → booking. Airports the widget lists open Airport mode (with direction); others (e.g. PNQ) open a one-way trip. */
function routeJourney(r) {
  const fromAirport = /airport/i.test(r.from);
  if (AIRPORTS.some((a) => a.code === codeOf(r))) return { tripType: "airport", airport: codeOf(r), airportDirection: fromAirport ? "pickup" : "drop" };
  return fromAirport ? { tripType: "one-way", pickup: r.from } : { tripType: "one-way", drop: r.to.replace(/\s*\([A-Z]{3}\)/, "") };
}

export function DeparturesBoard({ data, routes = [], onBook }) {
  const ref = useRef(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const el = ref.current; if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <Band id="coverage" bg="bg-white">
      <Head id="coverage" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} />
      <div className="mt-6 max-w-[780px] mx-auto text-center space-y-3">
        {(data.body || []).map((p, i) => <p key={i} className="text-[15.5px] text-text-secondary leading-[1.75]">{renderInline(p)}</p>)}
      </div>

      {routes.length > 0 && (
        <div ref={ref} className="mt-12 rounded-[26px] bg-[#0B0C0E] p-4 sm:p-6 md:p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,.6)]">
          <div className="flex items-center justify-between px-2 pb-4 border-b border-white/10">
            <p className="flex items-center gap-2.5 text-[15px] md:text-[17px] font-black tracking-[.14em] text-primary"><PlaneTakeoff size={20} aria-hidden />AIRPORT TRANSFERS</p>
            <p className="hidden sm:block text-[12px] font-bold tracking-[.12em] text-white/40">ABHI CABS 24×7</p>
          </div>
          <div className="hidden md:grid grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_150px] gap-4 px-3 pt-4 pb-2 text-[11.5px] font-bold tracking-[.14em] text-white/40">
            <span>CODE</span><span>FROM</span><span>TO</span><span className="text-right">STATUS</span>
          </div>
          <ul className="space-y-2 mt-2 md:mt-0">
            {routes.map((r, i) => (
              <li key={`${r.from}-${r.to}`} className="grid grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_150px] items-center gap-x-4 gap-y-1.5 rounded-[12px] bg-white/[.04] px-3 py-3 font-mono uppercase">
                <span className="row-span-2 md:row-span-1 grid place-items-center h-11 rounded-[8px] bg-[#1A1C20] text-primary text-[18px] font-black tracking-[.08em]">
                  <Flap text={codeOf(r)} go={go} delay={i * 90} />
                </span>
                <span className="text-[14px] md:text-[16px] font-bold text-white tracking-[.04em] truncate"><span className="md:hidden text-white/40 text-[11px] mr-1.5">FROM</span><Flap text={r.from} go={go} delay={i * 90 + 60} /></span>
                <span className="text-[14px] md:text-[16px] font-bold text-white tracking-[.04em] truncate"><span className="md:hidden text-white/40 text-[11px] mr-1.5">TO</span><Flap text={r.to} go={go} delay={i * 90 + 120} /></span>
                <span className="col-span-2 md:col-span-1 md:text-right normal-case font-sans">
                  <button type="button" onClick={() => onBook(routeJourney(r))} aria-label={`Book ${r.from} to ${r.to}`}
                    className={`inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[13px] font-extrabold text-text hover:bg-white transition-colors ${focusRing.replace("outline-text", "outline-primary")}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse motion-reduce:animate-none" aria-hidden />Book now
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Band>
  );
}

/* ════════════ Tips — pre-flight checklist; a plane flies along the progress track ════════════ */

export function PreflightChecklist({ data, onBook }) {
  const items = data.items || [];
  // Ticks are remembered (per item title) so a visitor who leaves and comes back keeps their progress.
  const KEY = "ac:airport-checklist";
  const [done, setDone] = useState(() => new Set());
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      const idx = items.map((t, i) => (saved.includes(t.title) ? i : -1)).filter((i) => i >= 0);
      if (idx.length) setDone(new Set(idx));
    } catch { /* storage blocked */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const save = (set) => { try { localStorage.setItem(KEY, JSON.stringify([...set].map((i) => items[i]?.title).filter(Boolean))); } catch { /* storage blocked */ } };
  const toggle = (i) => setDone((d) => { const n = new Set(d); n.has(i) ? n.delete(i) : n.add(i); save(n); return n; });
  const reset = () => { setDone(new Set()); save(new Set()); };
  const pct = items.length ? (done.size / items.length) * 100 : 0;
  const all = items.length > 0 && done.size === items.length;
  return (
    <Band id="tips" bg="bg-bg">
      <Head id="tips" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro ? [data.intro] : []} />
      <div className="mt-12 max-w-[900px] mx-auto rounded-[28px] bg-white border border-border overflow-hidden">
        {/* flight path */}
        <div className="px-6 sm:px-10 pt-8 pb-7 bg-[#111] text-white">
          <div className="flex items-center justify-between text-[12px] font-black tracking-[.14em]">
            <span className="text-white/50">CHECK-IN</span>
            <span className="text-primary" aria-live="polite">{all ? "READY FOR PICKUP" : `${done.size} / ${items.length} CHECKED`}</span>
          </div>
          <div className="relative mt-5 h-8">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/25" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none" style={{ width: `${pct}%` }} />
            <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 grid place-items-center w-9 h-9 rounded-full bg-primary text-text transition-[left] duration-700 ease-out motion-reduce:transition-none" style={{ left: `calc(18px + (100% - 36px) * ${pct / 100})` }}>
              <Plane size={18} strokeWidth={2.2} aria-hidden className={`rotate-45 transition-transform duration-700 ease-out motion-reduce:transition-none ${all ? "-translate-y-2 translate-x-1 scale-110" : ""}`} />
            </span>
          </div>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2">
          {items.map((t, i) => {
            const on = done.has(i);
            return (
              <li key={t.title} className="border-b border-border md:[&:nth-child(odd)]:border-r">
                <button type="button" role="checkbox" aria-checked={on} onClick={() => toggle(i)}
                  className={`w-full h-full text-left flex items-start gap-4 px-6 sm:px-8 py-5 transition-colors ${on ? "bg-primary-tint" : "hover:bg-[#FFFDF5]"} ${focusRing} -outline-offset-2`}>
                  <span className={`mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-md border-2 transition-colors ${on ? "bg-primary border-primary" : "border-[#C9C9C9]"}`}>
                    <Check size={15} strokeWidth={3.2} aria-hidden className={`transition-transform duration-200 motion-reduce:transition-none ${on ? "scale-100" : "scale-0"}`} />
                  </span>
                  <span>
                    <span className="block text-[15.5px] font-extrabold">{t.title}</span>
                    <span className="block mt-0.5 text-[14px] text-text-secondary leading-relaxed">{t.desc}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[14.5px] font-bold">
            {all ? "All set. Book your airport cab." : "Tick each item as you check it."}
            {done.size > 0 && <button type="button" onClick={reset} className="ml-3 text-[13px] font-semibold text-text-secondary underline underline-offset-2 hover:text-text">Reset</button>}
          </p>
          <Button onClick={() => onBook({ tripType: "airport" })} variant={all ? "primary" : "outline"}>Book airport cab</Button>
        </div>
      </div>
    </Band>
  );
}
