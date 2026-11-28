import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Users } from "lucide-react";
import Button from "../../ui/Button";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import SectionRenderer from "../../SectionRenderer";
import RelatedGuides from "../../RelatedGuides";
import useCmsContent from "../../../hooks/useCmsContent";
import { Band, Head, renderInline, splitLabel } from "../bangalore/shared";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, FaqSearch } from "../local/LocalSections";
import { ConsiderList } from "../corporate/CorporateSections";
import { Hero, Services, Locations, MoreServices, FinalCta, rich, plain } from "../standard/StandardSections";
import { SERVICE_LINKS } from "../../../data/siteLinks";
import placeImages from "../../../content/placeImages.json";

/**
 * /vehicles/tempo-traveller — Tempo Traveller & group vehicle rental, in the standard
 * service-page design (same look as /services/local/bangalore and the other service pages).
 * Every word comes from src/content/landingPages.js ("tempo-traveller"); sections follow its
 * `layout` (order + on/off), and its headings keep their H1/H2/H3 levels.
 */

const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const WRAP = "max-w-full max-sm:whitespace-normal max-sm:h-auto max-sm:min-h-14 max-sm:py-3.5 max-sm:leading-snug max-sm:text-center";

// Our own photos (no attribution needed). Matched on the card title.
const FLEET_PHOTOS = [[/\b12\b/, "/images/who-we-are-fleet.webp"], [/\b13\b/, "/images/hero-fleet-hills-900.webp"], [/\b16\b/, "/images/grouptravel.webp"], [/\b17\b/, "/images/group.webp"], [/bus|33/i, "/images/corporate.webp"]];
const USE_PHOTOS = [[/outstation/i, "/images/hero-hill-road-900.webp"], [/family/i, "/images/family.webp"], [/pilgrim/i, "/images/travelling.jpg"], [/corporate/i, "/images/corporate.webp"], [/sightseeing|local/i, "/images/weekend.webp"], [/wedding/i, "/images/group.webp"], [/airport/i, "/images/airport.webp"]];
const photo = (list, title, fallback = "/images/group.webp") => (list.find(([re]) => re.test(title)) || [null, fallback])[1];

const LINK_INFO = {
  "/airport-taxi": { kind: "airport", desc: "for airport pickup and drop-off." },
  "/one-way-cabs": { kind: "oneway", desc: "for intercity journeys without a planned return." },
  "/round-trip-cabs": { kind: "round", desc: "for weekend trips, family holidays and return journeys." },
  "/local-car-rental": { kind: "local", desc: "for hourly city travel with a driver." },
  "/services/corporate-car-rental": { kind: "corporate", desc: "for employee and business transportation." },
};

/* ════════════ Fleet — dark band, photo cards; the bus card runs full width ════════════ */
function FleetBand({ data, onBook }) {
  const cards = data.cards || [];
  return (
    <Band id="fleet" bg="bg-[#0E0E0E]" className="[&_strong]:text-white">
      <Head id="fleet" center light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((cd) => {
          const seats = (cd.title.match(/(\d+)\s*-?\s*Seater/i) || [])[1];
          const wide = /bus/i.test(cd.title) && cards.length % 4 === 1;
          return (
            <li key={cd.title} className={`group flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] transition-colors hover:border-primary/60 ${wide ? "sm:col-span-2 lg:col-span-4 lg:flex-row" : ""}`}>
              <div className={`relative overflow-hidden bg-black ${wide ? "aspect-[16/9] lg:aspect-auto lg:w-[46%] lg:min-h-[300px]" : "aspect-[4/3]"}`}>
                <img src={photo(FLEET_PHOTOS, cd.title)} alt="" loading="lazy" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" />
                {seats && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[12.5px] font-black text-[#111]">
                    <Users size={14} aria-hidden /> {seats} seats
                  </span>
                )}
              </div>
              <div className={`flex-1 flex flex-col p-6 ${wide ? "lg:p-10 lg:justify-center" : ""}`}>
                <h3 className={`font-black tracking-[-0.02em] leading-snug text-white ${wide ? "text-[24px] md:text-[28px]" : "text-[18px]"}`}>{cd.title}</h3>
                {arr(cd.body).map((p, j) => <p key={j} className="mt-2 text-[14.5px] leading-relaxed text-white/70">{rich(p, "font-semibold text-primary underline")}</p>)}
                <div className="mt-auto pt-5">
                  <Button size="sm" onClick={() => onBook({ tripType: "round-trip" })}>Book this vehicle <ArrowRight size={15} aria-hidden /></Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        {data.note && <p className="max-w-[760px] text-[14px] text-white/60">{rich(data.note)}</p>}
        {arr(data.links).map((l, i) => <p key={i} className="text-[15px] text-white/75">{rich(l, "font-semibold text-primary underline underline-offset-2 hover:text-white")}</p>)}
        {data.cta?.label && <div className="mt-2"><Button variant="inverse" size="lg" className={WRAP} onClick={() => onBook({ tripType: "round-trip" })}>{data.cta.label}</Button></div>}
      </div>
    </Band>
  );
}

/* ════════════ Destinations — interactive route showcase ════════════
 * Desktop: route list + a large showcase panel that follows hover/selection and
 * auto-advances (pauses on hover, stops once a route is picked, off for reduced motion).
 * Phones: a swipeable row of photo cards. Every action prefills the booking widget. */
const ROUTE_PHOTOS = [
  [/coffee|estate/i, "/images/tea-garden-road.jpg"], [/hill station/i, "/images/hero-hill-road-900.webp"],
  [/hill scenery|plantation/i, "/images/hero-fleet-hills-900.webp"], [/temple|pilgrim/i, "/images/travelling.jpg"],
  [/heritage/i, "/images/weekend.webp"], [/weekend/i, "/images/coastal-road-sedan.jpg"],
];
const routePhoto = (r) => placeImages[r.to]?.src || (ROUTE_PHOTOS.find(([re]) => re.test(r.desc || "")) || [null, "/images/hero-hill-road-900.webp"])[1];
const ROTATE_MS = 5000;

function DestinationShowcase({ data, onBook }) {
  const routes = (data.points || []).map(splitLabel).map(([label, desc]) => {
    const m = (label || "").match(/^(.+?)\s+to\s+(.+?)(?:\s+Tempo Traveller)?$/i);
    return { label: label || desc, desc: label ? desc : "", from: m?.[1] || "", to: m?.[2] || "" };
  });
  const origins = [...new Set(routes.map((r) => r.from).filter(Boolean))];
  const [origin, setOrigin] = useState("All");
  const shown = origin === "All" ? routes : routes.filter((r) => r.from === origin);
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const idx = Math.min(active, shown.length - 1);
  const cur = shown[idx];

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setAuto(false);
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!auto || paused || !inView || shown.length < 2) return undefined;
    const t = setTimeout(() => setActive((i) => (i + 1) % shown.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [auto, paused, inView, idx, shown.length]);

  const pick = (i) => { setActive(i); setAuto(false); };
  const book = (r) => onBook({ tripType: "round-trip", pickup: r.from || undefined, drop: r.to || undefined });
  if (!cur) return null;

  return (
    <Band id="destinations" bg="bg-[#0E0E0E]" className="[&_strong]:text-white">
      <style>{`@keyframes dest-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        @keyframes dest-travel{0%{left:0}100%{left:100%}}
        @media (prefers-reduced-motion: reduce){.dest-anim{animation:none!important}}`}</style>
      <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-start">
        <div>
          <Head id="destinations" light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
          {origins.length > 1 && (
            <div role="group" aria-label="Filter routes by starting city" className="mt-7 flex flex-wrap gap-2">
              {["All", ...origins].map((o) => {
                const on = origin === o;
                const n = o === "All" ? routes.length : routes.filter((r) => r.from === o).length;
                return (
                  <button key={o} type="button" aria-pressed={on} onClick={() => { setOrigin(o); setActive(0); }}
                    className={`rounded-full px-4 py-2 text-[13.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${on ? "bg-primary text-[#111]" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12] border border-white/10"}`}>
                    {o === "All" ? "All routes" : `From ${o}`} <span className={on ? "text-[#111]/60" : "text-white/40"}>{n}</span>
                  </button>
                );
              })}
            </div>
          )}

          <ul className="mt-6 -mx-5 px-5 scroll-px-5 lg:mx-0 lg:px-0 flex lg:block gap-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory pb-3 lg:pb-0 lg:space-y-2 [scrollbar-width:thin]">
            {shown.map((r, i) => {
              const on = i === idx;
              return (
                <li key={r.label} className="snap-start shrink-0 w-[82%] sm:w-[60%] lg:w-auto">
                  <div className={`h-full flex flex-col overflow-hidden rounded-[20px] border transition-colors lg:rounded-[16px] ${on ? "border-primary/70 bg-white/[0.07]" : "border-white/10 bg-white/[0.03] lg:hover:bg-white/[0.06]"}`}>
                    <div className="relative aspect-[16/10] lg:hidden overflow-hidden bg-black">
                      <img src={routePhoto(r)} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-85" />
                    </div>
                    <button type="button" onClick={() => pick(i)} onMouseEnter={() => { setActive(i); }} aria-current={on ? "true" : undefined}
                      className="w-full text-left px-5 py-4 lg:py-3.5 flex items-start gap-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary">
                      <span aria-hidden className={`hidden lg:grid shrink-0 mt-0.5 w-7 h-7 place-items-center rounded-full text-[12px] font-black tabular-nums ${on ? "bg-primary text-[#111]" : "bg-white/10 text-white/60"}`}>{i + 1}</span>
                      <span className="min-w-0">
                        {r.from && <span className="flex items-center gap-1.5 text-[11.5px] font-black uppercase tracking-[0.12em] text-primary">{r.from} <ArrowRight size={12} aria-hidden /> {r.to}</span>}
                        <span className={`mt-1 block font-extrabold leading-snug ${on ? "text-white" : "text-white/85"} text-[16px]`}>{r.label}</span>
                        <span className="mt-1 block text-[13.5px] leading-relaxed text-white/60">{renderInline(r.desc)}</span>
                      </span>
                    </button>
                    <div className="lg:hidden px-5 pb-5 mt-auto">
                      <Button size="sm" onClick={() => book(r)}>Book this route <ArrowRight size={15} aria-hidden /></Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Showcase panel (desktop) */}
        <div className="hidden lg:block lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-[28px] bg-black aspect-[5/4] shadow-[0_40px_90px_-40px_rgba(0,0,0,.8)]">
            {shown.map((r, i) => (
              <img key={r.label} src={routePhoto(r)} alt="" loading="lazy" decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-[900ms] ease-out motion-reduce:transition-none ${i === idx ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"}`} />
            ))}
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
            {cur.from && (
              <div className="absolute top-6 left-6 right-6 flex items-center gap-3 text-white">
                <span className="rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[13px] font-bold">{cur.from}</span>
                <span aria-hidden className="relative flex-1 h-px border-t-2 border-dashed border-white/40">
                  <span key={cur.label} className="dest-anim absolute -top-[6px] -ml-[5px] w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_14px_#FFD54F]" style={{ animation: "dest-travel 2.4s ease-in-out infinite alternate" }} />
                </span>
                <span className="rounded-full bg-primary text-[#111] px-3.5 py-1.5 text-[13px] font-black">{cur.to}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p aria-hidden className="text-[12px] font-black uppercase tracking-[0.16em] text-primary">Route {String(idx + 1).padStart(2, "0")} / {String(shown.length).padStart(2, "0")}</p>
              <p aria-hidden key={cur.label} className="mt-2 text-[30px] font-black tracking-[-0.03em] leading-tight text-white">{cur.label}</p>
              <p aria-hidden className="mt-2 max-w-[520px] text-[15.5px] leading-relaxed text-white/75">{renderInline(cur.desc)}</p>
              <div className="mt-6"><Button size="lg" onClick={() => book(cur)}>Book this route <ArrowRight size={17} aria-hidden /></Button></div>
            </div>
            {auto && shown.length > 1 && (
              <div aria-hidden className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
                <div key={`${origin}-${idx}`} className="dest-anim h-full bg-primary origin-left"
                  style={{ animation: `dest-progress ${ROTATE_MS}ms linear forwards`, animationPlayState: paused || !inView ? "paused" : "running" }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 text-center">
        {data.note && <p className="max-w-[760px] text-[14px] text-white/60">{rich(data.note)}</p>}
        {data.cta?.label && <Button variant="inverse" size="lg" className={WRAP} onClick={() => onBook({ tripType: "round-trip" })}>{data.cta.label}</Button>}
      </div>
    </Band>
  );
}

export default function TempoTraveller({ cfg }) {
  const b = cfg.blocks || {};
  const primaryLabel = cfg.primaryLabel || "Book Your Ride";
  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: (cfg.faqs || []).map(([q, a]) => ({ q, a })),
    cta: { line1: cfg.cta?.line1, line2: cfg.cta?.line2, description: cfg.cta?.description, primaryLabel: cfg.cta?.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);
  const [booking, setBooking] = useState({ key: "tempo-hero", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  const widget = <ServiceBooking widgetKey={booking.key} initialMode={cfg.mode || "round-trip"} presetJourney={booking.journey} />;

  const S = {
    hero: () => (
      <Hero data={{ h1: c.hero.title, h2: cfg.hero.subheading, cta: primaryLabel, image: c.hero.image, imageAlt: cfg.hero.alt }}
        breadcrumb={cfg.breadcrumb || [["Home", "/"], ["Vehicles", "/our-vehicles"], [cfg.hero.eyebrow || "Tempo Traveller", null]]}
        booking={widget} onBook={book} />
    ),
    "block:fleet": () => b.fleet ? <FleetBand data={b.fleet} onBook={book} /> : null,
    "block:uses": () => b.uses ? (
      <Services onBook={book} data={{
        eyebrow: b.uses.eyebrow, heading: b.uses.heading, subheading: b.uses.subheading, intro: arr(b.uses.intro),
        items: (b.uses.cards || []).map((cd) => ({ title: cd.title, body: arr(cd.body), image: photo(USE_PHOTOS, cd.title), journey: { tripType: "round-trip" } })),
      }} />
    ) : null,
    features: () => cfg.features?.items?.length ? (
      <BenefitRows data={{ eyebrow: cfg.features.eyebrow, heading: cfg.features.heading, subheading: cfg.features.subheading, intro: cfg.features.intro, items: cfg.features.items }}
        ctaLabel={cfg.features.ctaLabel || primaryLabel} onCta={() => book({ tripType: "round-trip" })} />
    ) : null,
    coverage: () => cfg.coverage ? (
      <Locations onBook={book} data={{ eyebrow: cfg.coverage.eyebrow, heading: cfg.coverage.heading, subheading: cfg.coverage.subheading, body: arr(cfg.coverage.body), areas: cfg.coverage.areas || [] }} />
    ) : null,
    "block:destinations": () => b.destinations ? <DestinationShowcase data={b.destinations} onBook={book} /> : null,
    how: () => cfg.how?.steps?.length ? <HowSection data={{ eyebrow: cfg.how.eyebrow || "How it works", ...cfg.how, ctaLabel: cfg.how.ctaLabel || primaryLabel }} onBook={() => book({ tripType: "round-trip" })} bg="bg-[#FAF7EE]" /> : null,
    tips: () => cfg.tips?.items?.length ? (
      <ConsiderList data={{ eyebrow: cfg.tips.eyebrow, heading: cfg.tips.heading, subheading: cfg.tips.subheading, intro: arr(cfg.tips.intro), points: cfg.tips.items.map((t) => `${t.title}: ${t.desc}`), links: arr(cfg.tips.outro) }} />
    ) : null,
    faqs: () => c.faqs?.length ? (
      <FaqSearch heading={cfg.faqHeading || "Frequently Asked Questions"} items={c.faqs.map((f) => ({ q: f.q, a: rich(f.a), text: plain(f.a) }))} placeholder="Search questions, e.g. seating, AC, outstation" />
    ) : null,
    relatedGuides: () => <RelatedGuides mode={cfg.mode} />,
    exploreServices: () => (
      <MoreServices data={{
        eyebrow: "More services", heading: "Explore other services",
        links: SERVICE_LINKS.slice(0, 3).map((l) => ({ ...(LINK_INFO[l.href] || {}), label: l.short || l.label, href: l.href })),
      }} />
    ),
    cta: () => (
      <FinalCta onBook={() => book({ tripType: "round-trip" })} data={{
        heading: [c.cta.line1, c.cta.line2].filter(Boolean).join(" "),
        subheading: cfg.cta?.subheading && c.cta.line1 === cfg.cta.line1 ? cfg.cta.subheading : undefined,
        body: arr(c.cta.description), button: c.cta.primaryLabel,
      }} />
    ),
  };

  const layout = cfg.layout?.length ? cfg.layout : Object.keys(S).map((id) => ({ id, enabled: true }));
  return (
    <>
      {layout.map((item) => (item.enabled === false || !S[item.id] ? null : <React.Fragment key={item.id}>{S[item.id]()}</React.Fragment>))}
      {extraSections.length > 0 && <SectionRenderer sections={extraSections} />}
    </>
  );
}
