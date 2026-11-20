import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin, Clock, Plane, ArrowRight, Repeat, Building2, ArrowUp } from "lucide-react";
import Button from "../../ui/Button";
import { Band, Head, TextLink, renderInline, splitLabel } from "./shared";

/* ── Ways to travel: an index of trip types, each row opens the widget on that trip type ── */
const TRIP_META = {
  local: { Icon: Clock, label: "Book local" },
  airport: { Icon: Plane, label: "Book airport" },
  "one-way": { Icon: ArrowRight, label: "Book one way" },
  "round-trip": { Icon: Repeat, label: "Book round trip" },
};

export function UsesSection({ data, onBook, bg = "bg-bg", center = false }) {
  return (
    <Band id="uses" bg={bg}>
      <Head id="uses" center={center} eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className="mt-10 md:mt-14 border-t-2 border-text">
        {data.cards.map((c) => {
          const journey = typeof c.book === "string" ? { tripType: c.book } : c.book;
          const meta = TRIP_META[journey?.tripType] || { Icon: Building2, label: "Enquire" };
          const { Icon } = meta;
          return (
            <li key={c.title} className="grid grid-cols-1 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)_140px] gap-3 md:gap-10 py-7 border-b border-border items-start">
              <h3 className="flex items-start gap-3 text-[18px] md:text-[20px] font-extrabold tracking-[-0.02em] leading-snug">
                <Icon size={22} strokeWidth={1.8} aria-hidden className="shrink-0 mt-[3px]" />
                {c.title}
              </h3>
              <div>
                {[].concat(c.body || []).map((p, j) => <p key={j} className={`${j ? "mt-2" : ""} text-[15px] text-text-secondary leading-[1.75]`}>{renderInline(p)}</p>)}
                {c.link && <div className="mt-3"><TextLink href={c.link}>Learn more</TextLink></div>}
              </div>
              <div className="md:pt-0.5 md:justify-self-end">
                {journey
                  ? <Button variant="outline" size="sm" onClick={() => onBook(journey)}>{meta.label}</Button>
                  : <Button variant="outline" size="sm" href={c.href}>{meta.label}</Button>}
              </div>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

/* ── Pickup areas: map-like panel of area chips; a chip starts a Local booking from that area ── */
export function PickupSection({ data, onBook, bg = "bg-white", region = "Bengaluru", hint = "Choose an area to start a local booking from there." }) {
  const areas = data.points || [];
  return (
    <Band id="pickup" bg={bg}>
      <div className={`grid grid-cols-1 ${areas.length ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" : ""} gap-10 lg:gap-16 items-center`}>
        <div>
          <Head id="pickup" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
          {data.note && <p className="mt-5 max-w-[680px] text-[14px] text-text-secondary leading-relaxed">{renderInline(data.note)}</p>}
        </div>
        {areas.length > 0 && <div className="relative rounded-[24px] bg-[#F4F1E6] p-6 sm:p-9 overflow-hidden">
          {/* faint street grid */}
          <div aria-hidden className="absolute inset-0 opacity-60 pointer-events-none" style={{
            backgroundImage: "linear-gradient(#E6DFC8 1.5px, transparent 1.5px), linear-gradient(90deg, #E6DFC8 1.5px, transparent 1.5px), linear-gradient(32deg, transparent 49%, #E0D7B9 49.5%, #E0D7B9 51%, transparent 51.5%)",
            backgroundSize: "56px 56px, 56px 56px, 100% 100%",
          }} />
          <ul className="relative flex flex-wrap gap-2.5 sm:gap-3">
            {areas.map((area) => {
              const first = area.split(" and ")[0];
              return (
                <li key={area}>
                  <button type="button" onClick={() => onBook({ tripType: "local", pickup: `${first}, ${region}` })}
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-[#D9D1B5] pl-3 pr-4 py-2.5 text-[14px] font-semibold shadow-[0_1px_0_rgba(0,0,0,.04)] hover:bg-primary hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text">
                    <MapPin size={16} aria-hidden className="text-[#B88A00]" />
                    {area}
                  </button>
                </li>
              );
            })}
          </ul>
          {hint && <p className="relative mt-6 text-[13px] font-semibold text-[#6B5E36]">{hint}</p>}
        </div>}
      </div>
    </Band>
  );
}

/* ── Sightseeing: photo beside a two-column place list ── */
export function PlacesSection({ data, onBook, bg = "bg-bg", ctaJourney = { tripType: "local", package: "8 hrs / 80 km" } }) {
  const wide = !data.image;
  return (
    <Band id="places" bg={bg}>
      <div className={`grid grid-cols-1 ${wide ? "" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"} gap-10 lg:gap-16`}>
        {data.image && (
          <div className="lg:sticky lg:top-28 self-start order-2 lg:order-1">
            <img src={data.image} alt={data.imageAlt || ""} loading="lazy" decoding="async" className="w-full aspect-[4/3] lg:aspect-[4/5] object-cover rounded-[20px]" />
          </div>
        )}
        <div className="order-1 lg:order-2">
          <Head id="places" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
          <ul className={`mt-10 grid grid-cols-1 sm:grid-cols-2 ${wide ? "lg:grid-cols-3" : ""} gap-x-10 gap-y-8`}>
            {data.cards.map((c) => (
              <li key={c.title} className="border-t-2 border-text pt-4">
                <h3 className="text-[17px] font-extrabold tracking-[-0.01em] leading-snug">{c.title}</h3>
                {[].concat(c.body || []).map((p, j) => <p key={j} className="mt-2 text-[14.5px] text-text-secondary leading-[1.7]">{renderInline(p)}</p>)}
              </li>
            ))}
          </ul>
          {data.cta?.label && (
            <div className="mt-10"><Button size="lg" onClick={() => onBook(ctaJourney)}>{data.cta.label}</Button></div>
          )}
        </div>
      </div>
    </Band>
  );
}

/* ── One-day trips: a row of national-highway milestones (yellow cap, white stone).
      This is the page's one orchestrated motion: the stones rise in sequence once. ── */
const TRIP_COLS = { 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" };

export function DayTripsSection({ data, onBook, bg = "bg-white", origin = "Bengaluru" }) {
  const n = data.cards.length;
  const cols = TRIP_COLS[n <= 6 ? Math.max(n, 4) : n <= 8 ? 4 : 5];
  const reduce = useReducedMotion();
  const rise = (i) => reduce ? {} : {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] },
  };
  return (
    <Band id="daytrips" bg={bg}>
      <Head id="daytrips" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />

      <div className="relative mt-12 md:mt-16">
        <ul className={`snap-row flex lg:grid ${cols} gap-4 lg:gap-x-5 lg:gap-y-12 overflow-x-auto lg:overflow-visible snap-x snap-mandatory -mx-5 px-5 lg:mx-0 lg:px-0 pb-2`}>
          {data.cards.map((c, i) => (
            <motion.li key={c.title} {...rise(i)} className="relative shrink-0 w-[62%] sm:w-[38%] lg:w-auto snap-start">
              {/* road edge the stone stands on: one segment per stone, so it works on every row */}
              <span aria-hidden className="absolute -left-[10px] -right-[10px] top-[188px] h-[10px] bg-[#2A2A2A] hidden lg:block">
                <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px]" style={{ backgroundImage: "linear-gradient(90deg,#FFD54F 0 18px,transparent 18px 34px)", backgroundSize: "34px 2px" }} />
              </span>
              <button type="button" onClick={() => onBook({ tripType: "round-trip", pickup: origin, drop: c.place })}
                aria-label={`Start a round-trip booking to ${c.place}`}
                className="group relative block w-full max-w-[150px] mx-auto lg:mx-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text rounded-t-[80px]">
                <span className="block rounded-t-[80px] bg-primary h-[78px] px-3 pt-6 text-center text-[13px] font-extrabold leading-tight text-text border-2 border-b-0 border-[#D9B23A] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                  {c.place}
                </span>
                <span className="block bg-white border-2 border-t-0 border-[#D8D8D8] h-[100px] pt-4 text-center shadow-[inset_0_-10px_0_#F1F1F1] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                  {c.km ? <>
                    <span className="block text-[34px] font-black leading-none tracking-[-0.04em] tabular-nums">{c.km}</span>
                    <span className="block mt-1 text-[12px] font-bold text-text-secondary">km</span>
                  </> : <ArrowUp size={34} strokeWidth={2.4} aria-hidden className="mx-auto mt-3" />}
                </span>
                <span aria-hidden className="block h-[10px] mx-[-6px] bg-[#BDBDBD] rounded-[3px]" />
              </button>
              <h3 className="mt-5 text-[15px] font-extrabold leading-snug">{c.title}</h3>
              {[].concat(c.body || []).map((p, j) => <p key={j} className="mt-1.5 text-[13.5px] text-text-secondary leading-[1.65]">{renderInline(p)}</p>)}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="max-w-[640px]">
          {data.distanceNote && <p className="text-[13.5px] text-text-secondary leading-relaxed">{data.distanceNote}</p>}
          {data.note && <p className="mt-1 text-[13.5px] text-text-secondary leading-relaxed">{renderInline(data.note)}</p>}
        </div>
        {data.cta?.label && <Button size="lg" className="shrink-0" onClick={() => onBook({ tripType: "round-trip", pickup: origin })}>{data.cta.label}</Button>}
      </div>
    </Band>
  );
}

/* ── Outstation routes: a departures-style board; each row prefills a one-way fare search ── */
export function RoutesSection({ data, onBook, origin = "Bengaluru" }) {
  const hasKm = !!data.km;
  const rows = data.points.map((t) => {
    const [label, desc] = splitLabel(t);
    const m = /^(.+? to )(.+?)( Car Rental| Cabs)?$/.exec(label || "");
    return { label, desc, pre: m?.[1], to: m?.[2], post: m?.[3] };
  });
  return (
    <Band id="routes" bg="bg-[#111]" className="text-white">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-10 lg:gap-16">
        <div>
          <Head id="routes" light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
          {data.note && <p className="mt-5 text-[14px] text-white/70 leading-relaxed [&_a]:text-primary [&_a:hover]:text-white">{renderInline(data.note)}</p>}
          {data.cta?.label && <div className="mt-7"><Button variant="inverse" size="lg" href={data.cta.href} onClick={data.cta.href ? undefined : () => onBook({ tripType: "one-way", pickup: origin })}>{data.cta.label}</Button></div>}
        </div>
        <ul className="border-t border-white/20">
          {rows.map((r) => (
            <li key={r.label} className={`grid grid-cols-[minmax(0,1fr)_auto] ${hasKm ? "sm:grid-cols-[minmax(0,1fr)_72px_auto]" : ""} items-center gap-x-5 gap-y-1 py-5 border-b border-white/12`}>
              <div className="min-w-0">
                <p className="leading-tight">
                  {r.to ? <>
                    <span className="text-[13px] font-semibold text-white/55">{r.pre}</span>
                    <strong className="block sm:inline text-[22px] md:text-[26px] font-extrabold tracking-[-0.02em] text-white">{r.to}</strong>
                    <span className="text-[13px] font-semibold text-white/55">{r.post}</span>
                  </> : <strong className="text-[18px] font-extrabold">{r.label}</strong>}
                </p>
                <p className="mt-1.5 text-[14px] text-white/65 leading-relaxed">{r.desc}</p>
              </div>
              {hasKm && <p className="hidden sm:block text-right tabular-nums">
                {data.km?.[r.to] && <><span className="block text-[20px] font-black text-primary leading-none">{data.km[r.to]}</span><span className="text-[11.5px] font-semibold text-white/50">km</span></>}
              </p>}
              <Button variant="outlineInverse" size="sm" onClick={() => onBook({ tripType: "one-way", pickup: origin, drop: r.to || "" })}>Get fare</Button>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
