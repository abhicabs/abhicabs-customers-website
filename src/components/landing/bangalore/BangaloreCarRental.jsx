import React, { useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import PageHero from "../../ui/PageHero";
import Button from "../../ui/Button";
import CtaBand from "../../CtaBand";
import RelatedGuides from "../../RelatedGuides";
import SectionRenderer from "../../SectionRenderer";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import useCmsContent from "../../../hooks/useCmsContent";
import { VehiclesSection, HourlySection } from "./FleetAndPackages";
import { UsesSection, PickupSection, PlacesSection, DayTripsSection, RoutesSection } from "./TravelSections";
import { ChauffeurSection, WhySection, PricesSection, HowSection, FaqSection, ExploreServices } from "./TrustSections";

/**
 * /bangalore/car-rental — dedicated layout (does NOT use the shared ServiceLanding engine,
 * so /services/* and /vehicles/* are unaffected). All copy still comes from
 * LANDING_PAGES["bangalore-car-rental"]; hero / FAQ / CTA stay CMS-overridable.
 *
 * Every "book" action on the page re-keys the hero BookingWidget with a preset journey
 * (trip type, package, pickup, drop) and scrolls to it — same booking flow as Home.
 */
export default function BangaloreCarRental({ cfg }) {
  const b = cfg.blocks;
  const primaryLabel = cfg.primaryLabel || "Book Your Ride";

  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: cfg.faqs.map(([q, a]) => ({ q, a })),
    cta: { line1: cfg.cta.line1, line2: cfg.cta.line2, description: cfg.cta.description, primaryLabel: cfg.cta.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);

  const search = usePageContext().urlParsed?.search || {};
  const [booking, setBooking] = useState(() => ({
    key: search.from ? "preset" : "default",
    journey: search.from ? { tripType: cfg.mode, pickup: search.from, drop: search.to || "" } : null,
  }));
  /** journey: { tripType, package?, pickup?, drop? } — null resets to the page default. */
  const book = (journey) => {
    setBooking({ key: `b-${Date.now()}`, journey });
    scrollToBooking();
  };

  return (
    <>
      <PageHero
        center image={c.hero.image} imagePosition={c.hero.image === cfg.hero.image ? cfg.hero.imagePosition : undefined} imageAlt={cfg.hero.alt || ""}
        breadcrumb={cfg.breadcrumb}
        title={c.hero.title} subtitle={cfg.hero.subheading} description={c.hero.description}
      >
        <ServiceBooking widgetKey={booking.key} initialMode={cfg.mode} presetJourney={booking.journey} />
      </PageHero>

      <VehiclesSection data={b.vehicles} />
      <HourlySection data={b.hourly} onBook={book} />
      <UsesSection data={b.uses} onBook={book} />
      <PickupSection data={b.pickup} onBook={book} />
      <PlacesSection data={b.places} onBook={book} />
      <DayTripsSection data={b.daytrips} onBook={book} />
      <RoutesSection data={b.routes} onBook={book} />
      <ChauffeurSection data={b.chauffeur} />
      <WhySection data={cfg.features} />
      <PricesSection data={b.prices} onBook={book} />
      <HowSection data={cfg.how} onBook={book} />
      <FaqSection heading={cfg.faqHeading} items={c.faqs} />

      {extraSections.length > 0 && <SectionRenderer sections={extraSections} />}
      <RelatedGuides mode={cfg.mode} />
      <ExploreServices exclude="/bangalore/car-rental" />

      <CtaBand
        image={c.hero.image}
        title={<>{c.cta.line1}{c.cta.line2 ? <> <span className="text-[#FFD54F]">{c.cta.line2}</span></> : null}</>}
        subheading={cfg.cta.subheading && c.cta.line1 === cfg.cta.line1 ? cfg.cta.subheading : undefined}
        description={c.cta.description}
        actions={<>
          <Button variant="inverse" size="lg" onClick={() => book(null)}>{c.cta.primaryLabel}</Button>
          <Button href="/contact" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
