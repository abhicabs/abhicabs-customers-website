import React, { useState } from "react";
import PageHero from "../../ui/PageHero";
import Button from "../../ui/Button";
import CtaBand from "../../CtaBand";
import SectionRenderer from "../../SectionRenderer";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import useCmsContent from "../../../hooks/useCmsContent";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, CoverageTickets, FaqSearch, FleetShowcase } from "../local/LocalSections";
import { ServicePhotoGrid, RoundTripRoutes } from "./IntercitySections";

/**
 * /services/round-trip — the "Intercity Cabs" menu page. Content is whatever ServicePageView passes in
 * (CMS version if an editor created one, else serviceDefaults["round-trip"]); layout themed on the return loop.
 * Every action prefills the hero booking widget in Round Trip mode.
 */
export default function RoundTrip({ cfg }) {
  const primaryLabel = cfg.primaryLabel || "Book Your Round-Trip Cab";
  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: (cfg.faqs || []).map(([q, a]) => ({ q, a })),
    cta: { line1: cfg.cta.line1, line2: cfg.cta.line2, description: cfg.cta.description, primaryLabel: cfg.cta.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);

  const [booking, setBooking] = useState({ key: "round-trip-default", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  const on = (id) => !cfg.layout || cfg.layout.find((l) => l.id === id)?.enabled !== false;

  return (
    <>
      <PageHero
        center image={c.hero.image} imagePosition={c.hero.image === cfg.hero.image ? cfg.hero.imagePosition : undefined} imageAlt={cfg.hero.alt || ""}
        breadcrumb={cfg.breadcrumb || [["Home", "/"], ["Services", "/services"], [cfg.hero.eyebrow || "Round-Trip Cab Booking", null]]}
        title={c.hero.title} subtitle={cfg.hero.subheading} description={c.hero.description}
      >
        <ServiceBooking widgetKey={booking.key} initialMode={cfg.mode || "round-trip"} presetJourney={booking.journey} />
      </PageHero>

      {on("intro") && cfg.intro?.items?.length > 0 && <ServicePhotoGrid data={cfg.intro} onBook={book} />}
      {on("routes") && cfg.routes?.length > 0 && (
        <RoundTripRoutes heading={cfg.routesHeading || "Popular Round-Trip Routes"} subheading={cfg.routesSubheading} intro={cfg.routesIntro} note={cfg.routesNote} routes={cfg.routes} onBook={book} />
      )}
      {on("pricing") && cfg.pricing?.points?.length > 0 && <FleetShowcase data={cfg.pricing} />}
      {on("features") && cfg.features?.items?.length > 0 && <BenefitRows data={cfg.features} ctaLabel={primaryLabel} onCta={() => book(null)} />}
      {on("coverage") && cfg.coverage && <CoverageTickets data={cfg.coverage} onBook={book} tripType="round-trip" bookLabel="Book round trip" />}
      {on("how") && cfg.how?.steps?.length > 0 && <HowSection data={cfg.how} onBook={book} bg="bg-white" />}
      {on("faqs") && c.faqs?.length > 0 && <FaqSearch heading={cfg.faqHeading || "Frequently Asked Questions"} items={c.faqs} placeholder="Search questions, e.g. return date, driver stay, multi-day" />}

      {extraSections.length > 0 && <SectionRenderer sections={extraSections} />}

      <CtaBand
        image={c.hero.image}
        title={<>{c.cta.line1}{c.cta.line2 ? <> <span className="text-[#FFD54F]">{c.cta.line2}</span></> : null}</>}
        subheading={cfg.cta.subheading && c.cta.line1 === cfg.cta.line1 ? cfg.cta.subheading : undefined}
        description={c.cta.description}
        actions={<>
          <Button variant="inverse" size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => book(null)}>{c.cta.primaryLabel}</Button>
          <Button href="/contact-us" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
