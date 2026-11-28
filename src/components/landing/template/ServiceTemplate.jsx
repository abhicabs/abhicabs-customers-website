import React, { useState } from "react";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import SectionRenderer from "../../SectionRenderer";
import ServiceLanding from "../../ServiceLanding";
import ServiceDirectory from "../../ServiceDirectory";
import RelatedGuides from "../../RelatedGuides";
import useCmsContent from "../../../hooks/useCmsContent";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, FaqSearch } from "../local/LocalSections";
import { VehiclesSection, HourlySection } from "../bangalore/FleetAndPackages";
import { UsesSection, PickupSection, PlacesSection, DayTripsSection, RoutesSection } from "../bangalore/TravelSections";
import { ChauffeurSection, WhySection, PricesSection } from "../bangalore/TrustSections";
import {
  Hero, Packages, Vehicles, Services, Locations, Prices, MoreServices, FinalCta, Eyebrow, rich, plain, h2cls, h3sub,
} from "../standard/StandardSections";
import { SERVICE_LINKS, serviceHref } from "../../../data/siteLinks";
import { BLR_LOCAL } from "../../../content/bangaloreLocalRental";

/**
 * TEMPLATE for every service page created in the CMS (/services/<slug>) — the
 * /services/local/bangalore design (landing/standard/StandardSections).
 *
 * The CMS page's standard fields are mapped onto those sections, in the order and
 * on/off state of the CMS Layout Manager:
 *   hero → dark photo hero + booking widget      intro → photo cards ("ways to use it")
 *   features → numbered benefit rows             pricing → "before you book" receipt
 *   routes → route tiles that prefill the widget coverage → pickup areas
 *   how → step walkthrough   faqs → searchable FAQ   exploreServices → service tiles
 *   cta → yellow closing band   (+ fleet showcase, and hourly packages on local pages)
 * Anything else (custom "Add section" blocks, content blocks, legacy Bangalore blocks)
 * still renders with its existing component, so no CMS content is dropped.
 */

const has = (v) => (Array.isArray(v) ? v.length > 0 : !!v);
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const DEFAULT_LAYOUT = ["hero", "intro", "features", "pricing", "routes", "how", "faqs", "relatedGuides", "exploreServices", "serviceDirectory", "cta"]
  .map((id) => ({ id, enabled: true }));

// Fleet and hourly packages are the same company-wide; only the headings are generic here.
const STD_VEHICLES = { ...BLR_LOCAL.vehicles, heading: "Choose Your Vehicle" };
const STD_PACKAGES = {
  heading: "Hourly Rental Packages",
  items: [
    { hours: 4, pkg: "4 hrs / 40 km", title: "4-Hour Rental", desc: "Suitable for shopping, short meetings, appointments and personal visits around the city." },
    { hours: 8, pkg: "8 hrs / 80 km", title: "8-Hour Rental", desc: "Choose an 8-hour rental for sightseeing, multiple appointments, shopping and family outings." },
    { hours: 12, pkg: "12 hrs / 120 km", title: "12-Hour Rental", desc: "Explore a 12-hour rental for extended sightseeing, business schedules, family functions and full-day travel." },
  ],
  note: BLR_LOCAL.packages.note,
  cta: BLR_LOCAL.packages.cta,
};

// Photos for the "ways to use it" cards (CMS items have no image field).
const PHOTOS = [
  [/airport|flight/i, "/images/airport.webp"],
  [/corporate|business|office|executive/i, "/images/corporate.webp"],
  [/sightseeing|tour|weekend|holiday/i, "/images/weekend.webp"],
  [/family|shopping|personal/i, "/images/family.webp"],
  [/group|event|wedding|tempo|bus/i, "/images/grouptravel.webp"],
  [/outstation|one[- ]way|round|intercity|hill/i, "/images/hero-hill-road-900.webp"],
];
const FALLBACK_PHOTOS = ["/images/hero-local-chauffeur-900.webp", "/images/dashboard-pov.jpg", "/images/coastal-road-sedan.jpg", "/images/tea-garden-road.jpg"];
const photoFor = (title = "", i = 0) => (PHOTOS.find(([re]) => re.test(title)) || [null, FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length]])[1];

const LINK_INFO = {
  "/airport-taxi": { kind: "airport", desc: "for airport pickup and drop-off." },
  "/one-way-cabs": { kind: "oneway", desc: "for intercity journeys without a planned return." },
  "/round-trip-cabs": { kind: "round", desc: "for weekend trips, family holidays and return journeys." },
  "/local-car-rental": { kind: "local", desc: "for hourly city travel with a driver." },
  "/services/corporate-car-rental": { kind: "corporate", desc: "for employee and business transportation." },
};

/** One section drawn by the older template (for custom/content blocks the standard design has no equivalent for). */
function LegacySection({ cfg, id }) {
  return <ServiceLanding cfg={{ ...cfg, layout: [{ id, enabled: true }, { id: "extraSections", enabled: false }] }} />;
}

function IntroText({ data }) {
  return (
    <section id="intro" aria-labelledby="intro-title" className="bg-[#FAF7EE] py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[900px] mx-auto px-5 sm:px-6 text-center">
        {data.eyebrow && <Eyebrow center>{data.eyebrow}</Eyebrow>}
        {data.heading && <h2 id="intro-title" className={`mt-3 ${h2cls}`}>{data.heading}</h2>}
        <div className="mt-5 space-y-3 text-[15.5px] md:text-[16.5px] text-text-secondary leading-relaxed">
          {arr(data.body).map((p, i) => <p key={i}>{rich(p)}</p>)}
        </div>
        {has(data.bullets) && (
          <ul className="mt-7 flex flex-wrap justify-center gap-2.5">
            {data.bullets.map((b) => <li key={b} className="rounded-full bg-white border border-[#E3DBC2] px-4 py-2 text-[14px] font-bold">{plain(b)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

function RouteTiles({ cfg, onBook }) {
  const routes = cfg.routes || [];
  const trip = cfg.mode === "round-trip" ? "round-trip" : "one-way";
  return (
    <section id="routes" aria-labelledby="routes-title" className="bg-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[780px] mx-auto">
          <Eyebrow center>Popular routes</Eyebrow>
          <h2 id="routes-title" className={`mt-3 ${h2cls}`}>{cfg.routesHeading || "Frequently Booked Routes"}</h2>
          {cfg.routesSubheading && <h3 className={h3sub}>{cfg.routesSubheading}</h3>}
          {arr(cfg.routesIntro).map((p, i) => <p key={i} className="mt-3 text-[15.5px] text-text-secondary">{rich(p)}</p>)}
        </div>
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {routes.map((r) => (
            <li key={`${r.from}-${r.to}`}>
              <button type="button" onClick={() => onBook({ tripType: trip, pickup: r.from, drop: r.to })}
                className="group w-full h-full flex items-center justify-between gap-3 rounded-[18px] bg-[#FAF7EE] border border-[#EAE3CC] px-5 py-4 text-left hover:bg-[#111] hover:border-[#111] hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00]">
                <span className="min-w-0">
                  <span className="block text-[15px] font-extrabold">{r.label || `${r.from} → ${r.to}`}</span>
                  {r.desc && <span className="block mt-1 text-[13px] text-text-secondary group-hover:text-white/70 leading-snug">{r.desc}</span>}
                </span>
                <span aria-hidden className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-primary text-[#111]">→</span>
              </button>
            </li>
          ))}
        </ul>
        {cfg.routesNote && <p className="mt-8 text-center text-[14px] text-text-secondary">{rich(cfg.routesNote)}</p>}
      </div>
    </section>
  );
}

export default function ServiceTemplate({ cfg }) {
  const b = cfg.blocks || {};
  const mode = cfg.mode || null;
  const bookTrip = mode || "local";
  const primaryLabel = cfg.primaryLabel || "Book Your Ride";
  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: (cfg.faqs || []).map(([q, a]) => ({ q, a })),
    cta: { line1: cfg.cta?.line1, line2: cfg.cta?.line2, description: cfg.cta?.description, primaryLabel: cfg.cta?.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);
  const [booking, setBooking] = useState({ key: `${cfg.slug}-hero`, journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  const widget = <ServiceBooking widgetKey={booking.key} initialMode={mode || "one-way"} presetJourney={booking.journey} />;

  const layout = (cfg.layout && cfg.layout.length ? cfg.layout : DEFAULT_LAYOUT);
  const inLayout = (id) => layout.find((l) => l.id === id);
  const isLocal = mode === "local";
  const self = serviceHref(cfg.slug);

  const S = {
    hero: () => (
      <Hero
        data={{ h1: c.hero.title, h2: cfg.hero.subheading, cta: primaryLabel, image: c.hero.image, imageAlt: cfg.hero.alt }}
        breadcrumb={cfg.breadcrumb || [["Home", "/"], ["Services", "/services"], [cfg.hero.eyebrow || cfg.hero.heading, null]]}
        quickPicks={isLocal ? STD_PACKAGES.items : []}
        booking={widget} onBook={book}
      />
    ),
    // Fleet + hourly packages: legacy Bangalore blocks win; else the standard ones.
    packages: () => has(b.hourly?.points) ? <HourlySection data={b.hourly} onBook={book} />
      : isLocal ? <Packages data={{ ...STD_PACKAGES, ...(cfg.packages || {}) }} onBook={book} /> : null,
    vehicles: () => has(b.vehicles?.cards) ? <VehiclesSection data={b.vehicles} />
      : <Vehicles data={{ ...STD_VEHICLES, ...(cfg.vehicles || {}) }} onBook={book} bookTrip={bookTrip} />,
    intro: () => {
      if (b.uses && has(b.uses.cards)) return <UsesSection data={b.uses} onBook={book} />;
      const items = (cfg.intro?.items || []).filter((it) => it.heading);
      if (items.length) {
        return (
          <Services onBook={book} data={{
            eyebrow: cfg.intro.eyebrow || undefined, heading: cfg.intro.heading, intro: arr(cfg.intro.body),
            items: items.map((it, i) => ({ title: it.heading, body: arr(it.body), image: it.image || photoFor(it.heading, i), journey: { tripType: bookTrip } })),
          }} />
        );
      }
      return (cfg.intro?.heading || has(cfg.intro?.body)) ? <IntroText data={cfg.intro} /> : null;
    },
    features: () => has(cfg.features?.items) ? (
      <BenefitRows data={{ eyebrow: cfg.features.eyebrow || "Why Abhi Cabs", heading: cfg.features.heading, subheading: cfg.features.subheading, intro: cfg.features.intro, items: cfg.features.items }}
        ctaLabel={cfg.features.ctaLabel || primaryLabel} onCta={() => book(null)} />
    ) : null,
    pricing: () => {
      if (b.prices) return <PricesSection data={b.prices} onBook={book} />;
      const p = cfg.pricing || {};
      const body = [...arr(p.intro), ...arr(p.description), ...arr(p.note), ...arr(p.links)];
      if (!p.heading && !body.length && !has(p.points)) return null;
      return <Prices bookTrip={bookTrip} onBook={book} data={{ eyebrow: p.eyebrow, heading: p.heading, subheading: p.subheading, body, checklist: (p.points || []).map(plain), cta: p.ctaLabel || primaryLabel }} />;
    },
    routes: () => b.routes ? <RoutesSection data={b.routes} onBook={book} /> : has(cfg.routes) ? <RouteTiles cfg={cfg} onBook={book} /> : null,
    coverage: () => cfg.coverage && (cfg.coverage.heading || has(cfg.coverage.body)) ? (
      <Locations onBook={book} areaSuffix={cfg.coverage.areaSuffix || ""} data={{ eyebrow: cfg.coverage.eyebrow, heading: cfg.coverage.heading, subheading: cfg.coverage.subheading, body: arr(cfg.coverage.body), areas: cfg.coverage.areas || [] }} />
    ) : null,
    tips: () => has(cfg.tips?.items) ? (
      <WhySection data={{ eyebrow: cfg.tips.eyebrow, heading: cfg.tips.heading, subheading: cfg.tips.subheading, intro: cfg.tips.intro, items: cfg.tips.items.map((t) => ({ title: t.title, desc: t.desc, icon: t.icon || "check" })) }} />
    ) : null,
    how: () => has(cfg.how?.steps) ? <HowSection data={{ eyebrow: "How it works", ...cfg.how, ctaLabel: cfg.how.ctaLabel || primaryLabel }} onBook={book} bg="bg-[#FAF7EE]" /> : null,
    faqs: () => has(c.faqs) ? (
      <FaqSearch heading={cfg.faqHeading || "Frequently Asked Questions"} items={c.faqs.map((f) => ({ q: f.q, a: rich(f.a), text: plain(f.a) }))} placeholder="Search questions" />
    ) : null,
    relatedGuides: () => <RelatedGuides mode={mode} />,
    exploreServices: () => {
      const links = SERVICE_LINKS.filter((l) => l.href !== self).slice(0, 3)
        .map((l) => ({ ...(LINK_INFO[l.href] || {}), label: l.short || l.label, href: l.href }));
      return <MoreServices data={{ eyebrow: "More services", heading: "Explore More Travel Services", subheading: "", intro: "", links }} />;
    },
    serviceDirectory: () => <ServiceDirectory exclude={cfg.slug} tone="white" />,
    cta: () => (
      <FinalCta onBook={book} data={{
        heading: [c.cta.line1, c.cta.line2].filter(Boolean).join(" "),
        subheading: cfg.cta?.subheading && c.cta.line1 === cfg.cta.line1 ? cfg.cta.subheading : undefined,
        body: arr(c.cta.description), button: c.cta.primaryLabel,
      }} />
    ),
    extraSections: () => extraSections.length > 0 ? <SectionRenderer sections={extraSections} /> : null,
  };

  // Section order = the CMS layout. Packages + fleet follow the hero unless the layout places them.
  const order = [];
  layout.forEach((item) => {
    order.push(item);
    if (item.id === "hero") {
      if (!inLayout("packages")) order.push({ id: "packages", enabled: true });
      if (!inLayout("vehicles")) order.push({ id: "vehicles", enabled: true });
    }
  });
  if (!inLayout("hero")) order.unshift({ id: "hero", enabled: true });
  // Legacy Bangalore blocks with no standard slot go after the intro.
  const legacyAfterIntro = [
    has(b.pickup?.points) && <PickupSection key="pickup" data={b.pickup} onBook={book} />,
    has(b.places?.points || b.places?.cards) && <PlacesSection key="places" data={b.places} onBook={book} />,
    has(b.daytrips?.cards) && <DayTripsSection key="daytrips" data={b.daytrips} onBook={book} />,
    has(b.chauffeur?.points) && <ChauffeurSection key="chauffeur" data={b.chauffeur} />,
  ].filter(Boolean);

  return (
    <>
      {order.map((item) => {
        if (!item.enabled) return null;
        const render = S[item.id];
        const node = render ? render() : <LegacySection cfg={cfg} id={item.id} />; // custom-*, block:*, enquiry …
        return (
          <React.Fragment key={item.id}>
            {node}
            {item.id === "intro" && legacyAfterIntro}
          </React.Fragment>
        );
      })}
      {!layout.some((l) => l.id === "intro") && legacyAfterIntro}
      {extraSections.length > 0 && !layout.some((l) => l.id === "extraSections") && <SectionRenderer sections={extraSections} />}
    </>
  );
}
