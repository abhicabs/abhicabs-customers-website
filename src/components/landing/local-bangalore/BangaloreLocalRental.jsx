import React, { useState } from "react";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, FaqSearch } from "../local/LocalSections";
import { Hero, Packages, Vehicles, Services, Locations, Prices, MoreServices, FinalCta, plain } from "../standard/StandardSections";
import { BLR_LOCAL as C } from "../../../content/bangaloreLocalRental";

/**
 * /services/local/bangalore — "Car Rental in Bangalore with Driver".
 * Sections: ../standard/StandardSections (the same design every CMS-created service page uses).
 * Copy: src/content/bangaloreLocalRental.js
 */

/* ════════════ Page ════════════ */
export default function BangaloreLocalRental() {
  const [booking, setBooking] = useState({ key: "blr-local", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  const widget = <ServiceBooking widgetKey={booking.key} initialMode="local" presetJourney={booking.journey} />;
  return (
    <>
      <Hero data={C.hero} breadcrumb={C.breadcrumb} quickPicks={C.packages.items} booking={widget} onBook={book} />
      <Packages data={C.packages} onBook={book} />
      <Vehicles data={C.vehicles} onBook={book} imageAlt={(it) => `${it.name} — Abhi Cabs 24×7 Bangalore car rental`} />
      <Services data={C.services} onBook={book} />
      <Locations data={C.locations} onBook={book} areaSuffix=", Bengaluru" />
      <BenefitRows data={{ eyebrow: "Why Abhi Cabs", heading: C.why.heading, subheading: C.why.subheading, items: C.why.items }} ctaLabel={C.hero.cta} onCta={() => book(null)} />
      <Prices data={C.prices} onBook={book} />
      <MoreServices data={C.more} />
      <HowSection data={{ eyebrow: "How it works", ...C.how }} onBook={book} bg="bg-[#FAF7EE]" />
      <FaqSearch heading={C.faqHeading} items={C.faqs.map(([q, a]) => ({ q, a: plain(a) }))} placeholder="Search questions, e.g. full day, tolls, sightseeing" />
      <FinalCta data={C.cta} onBook={book} />
    </>
  );
}
