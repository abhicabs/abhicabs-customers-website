import React, { useState } from "react";
import PageHero from "../../ui/PageHero";
import Button from "../../ui/Button";
import CtaBand from "../../CtaBand";
import SectionRenderer from "../../SectionRenderer";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import useCmsContent from "../../../hooks/useCmsContent";
import { VehiclesSection, HourlySection } from "../bangalore/FleetAndPackages";
import { UsesSection, PickupSection, PlacesSection, DayTripsSection, RoutesSection } from "../bangalore/TravelSections";
import { ChauffeurSection, WhySection, PricesSection, HowSection, FaqSection, ExploreServices } from "../bangalore/TrustSections";
import { Band, Head, renderInline } from "../bangalore/shared";
import { serviceHref } from "../../../data/siteLinks";

/**
 * TEMPLATE for every service page created in the CMS (/services/<slug>) —
 * the "Car Rental in Bangalore" design (src/components/landing/bangalore/).
 *
 * Content comes from the CMS page. Bangalore-style `blocks` are used when the page
 * has them (vehicles, hourly, uses, pickup, places, daytrips, routes, chauffeur, prices);
 * otherwise the standard service fields are mapped onto the same sections.
 * A section only appears when there is content for it.
 */
const has = (v) => (Array.isArray(v) ? v.length > 0 : !!v);
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);

export default function ServiceTemplate({ cfg }) {
  const b = cfg.blocks || {};
  const primaryLabel = cfg.primaryLabel || "Book Your Ride";
  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: (cfg.faqs || []).map(([q, a]) => ({ q, a })),
    cta: { line1: cfg.cta?.line1, line2: cfg.cta?.line2, description: cfg.cta?.description, primaryLabel: cfg.cta?.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);
  const [booking, setBooking] = useState({ key: `${cfg.slug}-hero`, journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };

  // ── standard service fields → Bangalore sections (used when no block is given) ──
  const uses = b.uses || (has(cfg.intro?.items) && {
    eyebrow: cfg.intro.eyebrow, heading: cfg.intro.heading, intro: arr(cfg.intro.body),
    cards: cfg.intro.items.map((it) => ({ title: it.heading, body: it.body, book: cfg.mode || undefined })),
  });
  const routes = b.routes || (has(cfg.routes) && {
    eyebrow: "Popular Routes", heading: cfg.routesHeading || "Popular routes", subheading: cfg.routesSubheading,
    intro: arr(cfg.routesIntro), note: cfg.routesNote,
    points: cfg.routes.map((r) => `${r.label || `${r.from} to ${r.to}`}: ${r.desc || ""}`.replace(/:\s*$/, ":")),
  });
  const prices = b.prices || (has(cfg.pricing?.points) && {
    eyebrow: cfg.pricing.eyebrow || "Pricing", heading: cfg.pricing.heading, subheading: cfg.pricing.subheading,
    intro: arr(cfg.pricing.intro || cfg.pricing.description), points: cfg.pricing.points,
  });
  const why = has(cfg.features?.items) && cfg.features;
  const tips = has(cfg.tips?.items) && {
    eyebrow: cfg.tips.eyebrow, heading: cfg.tips.heading, subheading: cfg.tips.subheading, intro: cfg.tips.intro,
    items: cfg.tips.items.map((t) => ({ title: t.title, desc: t.desc, icon: t.icon || "check" })),
  };
  const breadcrumb = cfg.breadcrumb || [["Home", "/"], ["Services", "/services"], [cfg.hero.heading, null]];

  return (
    <>
      <PageHero
        center image={c.hero.image} imagePosition={c.hero.image === cfg.hero.image ? cfg.hero.imagePosition : undefined} imageAlt={cfg.hero.alt || ""}
        breadcrumb={breadcrumb}
        title={c.hero.title} subtitle={cfg.hero.subheading} description={c.hero.description}
      >
        <ServiceBooking widgetKey={booking.key} initialMode={cfg.mode || "one-way"} presetJourney={booking.journey} />
      </PageHero>

      {has(b.vehicles?.cards) && <VehiclesSection data={b.vehicles} />}
      {has(b.hourly?.points) && <HourlySection data={b.hourly} onBook={book} />}
      {uses && has(uses.cards) && <UsesSection data={uses} onBook={book} />}
      {has(b.pickup?.points) && <PickupSection data={b.pickup} onBook={book} />}
      {has(b.places?.points || b.places?.cards) && <PlacesSection data={b.places} onBook={book} />}
      {has(b.daytrips?.cards) && <DayTripsSection data={b.daytrips} onBook={book} />}
      {routes && has(routes.points) && <RoutesSection data={routes} onBook={book} />}
      {has(b.chauffeur?.points) && <ChauffeurSection data={b.chauffeur} />}
      {why && <WhySection data={why} />}
      {cfg.coverage && (has(cfg.coverage.body) || cfg.coverage.heading) && (
        <Band id="coverage" bg="bg-[#FFFBEA]">
          <Head id="coverage" center eyebrow={cfg.coverage.eyebrow} title={cfg.coverage.heading} sub={cfg.coverage.subheading} />
          <div className="mt-6 max-w-[760px] mx-auto text-center space-y-3">
            {arr(cfg.coverage.body).map((p, i) => <p key={i} className="text-[16px] leading-relaxed text-text-secondary">{renderInline(p)}</p>)}
          </div>
        </Band>
      )}
      {prices && <PricesSection data={prices} onBook={book} />}
      {tips && <WhySection data={tips} />}
      {has(cfg.how?.steps) && <HowSection data={cfg.how} onBook={book} />}
      {has(c.faqs) && <FaqSection heading={cfg.faqHeading} items={c.faqs} />}

      {extraSections.length > 0 && <SectionRenderer sections={extraSections} />}
      <ExploreServices exclude={serviceHref(cfg.slug)} />

      <CtaBand
        image={c.hero.image}
        title={<>{c.cta.line1}{c.cta.line2 ? <> <span className="text-[#FFD54F]">{c.cta.line2}</span></> : null}</>}
        subheading={cfg.cta?.subheading}
        description={c.cta.description}
        actions={<>
          <Button variant="inverse" size="lg" onClick={() => book(null)}>{c.cta.primaryLabel}</Button>
          <Button href="/contact" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
