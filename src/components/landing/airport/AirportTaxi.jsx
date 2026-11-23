import React, { useState } from "react";
import PageHero from "../../ui/PageHero";
import Button from "../../ui/Button";
import CtaBand from "../../CtaBand";
import SectionRenderer from "../../SectionRenderer";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import useCmsContent from "../../../hooks/useCmsContent";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, FaqSearch } from "../local/LocalSections";
import { TerminalSigns, BaggageTags, DeparturesBoard, PreflightChecklist } from "./AirportSections";
import { renderInline } from "../bangalore/shared";

/**
 * /airport-taxi — the "Airport Taxi" menu page. Content is whatever ServicePageView passes in
 * (CMS version if an editor created one, else serviceDefaults["airport-taxi"]); layout is airport-themed.
 * Every action prefills the hero booking widget (Airport mode with airport + direction where it can).
 */
export default function AirportTaxi({ cfg }) {
  const primaryLabel = cfg.primaryLabel || "Book Your Airport Taxi";
  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: (cfg.faqs || []).map(([q, a]) => ({ q, a: renderInline(a), text: a })), // links in answers render as links; search uses the plain text
    cta: { line1: cfg.cta.line1, line2: cfg.cta.line2, description: cfg.cta.description, primaryLabel: cfg.cta.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);

  const [booking, setBooking] = useState({ key: "airport-default", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  const on = (id) => !cfg.layout || cfg.layout.find((l) => l.id === id)?.enabled !== false;

  return (
    <>
      <PageHero
        center image={c.hero.image} imagePosition={c.hero.image === cfg.hero.image ? cfg.hero.imagePosition : undefined} imageAlt={cfg.hero.alt || ""}
        breadcrumb={cfg.breadcrumb || [["Home", "/"], ["Services", "/services"], [cfg.hero.eyebrow || "Airport Taxi Booking", null]]}
        title={c.hero.title} subtitle={cfg.hero.subheading} description={c.hero.description}
      >
        <ServiceBooking widgetKey={booking.key} initialMode={cfg.mode || "airport"} presetJourney={booking.journey} />
      </PageHero>

      {on("intro") && cfg.intro?.items?.length > 0 && <TerminalSigns data={cfg.intro} onBook={book} />}
      {on("pricing") && cfg.pricing?.points?.length > 0 && <BaggageTags data={cfg.pricing} />}
      {on("features") && cfg.features?.items?.length > 0 && <BenefitRows data={cfg.features} ctaLabel={primaryLabel} onCta={() => book(null)} />}
      {on("coverage") && cfg.coverage && <DeparturesBoard data={cfg.coverage} routes={cfg.routes || []} onBook={book} />}
      {on("how") && cfg.how?.steps?.length > 0 && <HowSection data={cfg.how} onBook={book} bg="bg-white" />}
      {on("tips") && cfg.tips?.items?.length > 0 && <PreflightChecklist data={cfg.tips} onBook={book} />}
      {on("faqs") && c.faqs?.length > 0 && <FaqSearch heading={cfg.faqHeading || "Frequently Asked Questions"} items={c.faqs} placeholder="Search questions, e.g. delayed flight, late-night, luggage" />}

      {extraSections.length > 0 && <SectionRenderer sections={extraSections} />}

      <CtaBand
        image={c.hero.image}
        title={<>{c.cta.line1}{c.cta.line2 ? <> <span className="text-[#FFD54F]">{c.cta.line2}</span></> : null}</>}
        subheading={cfg.cta.subheading && c.cta.line1 === cfg.cta.line1 ? cfg.cta.subheading : undefined}
        description={c.cta.description}
        actions={<>
          <Button variant="inverse" size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => book(null)}>{c.cta.primaryLabel}</Button>
          <Button href="/contact" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
