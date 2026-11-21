import React, { useState } from "react";
import Button from "./ui/Button";
import PageHero from "./ui/PageHero";
import ServiceBooking, { scrollToBooking } from "./ServiceBooking";
import CtaBand from "./CtaBand";
import { AIRPORTS } from "../data/airports";
import placeImages from "../content/placeImages.json";
import { UsesSection } from "./landing/bangalore/TravelSections";
import { HowSection } from "./landing/bangalore/TrustSections";
import { AttractionsGrid, DayTripCarousel } from "./landing/city/PlaceCards";
import { FleetLineup, TirumalaBand, RoutesBoard, PickupMap, WhyBand, TipsSlip, FaqCentered } from "./landing/city/CitySections";

/**
 * /cities/<slug> — city destination pages. Content comes untouched from src/content/cityDefaults.js;
 * section layouts live in src/components/landing/city (stacked, no left/right splits).
 * Tourist places and one-day trips show Wikimedia Commons photos from src/content/placeImages.json
 * (generate with `npm run images:places`). Every action prefills the hero booking widget.
 */

/** Which booking each service row starts — derived from the service's existing title / link. */
function serviceJourney(item, city) {
  const t = item.title;
  if (/tirumala/i.test(t)) return { tripType: "one-way", pickup: city, drop: "Tirumala" };
  if (/airport/i.test(t)) {
    const ap = AIRPORTS.find((a) => a.city.toLowerCase() === city.toLowerCase());
    return ap ? { tripType: "airport", airport: ap.code } : { tripType: "airport" };
  }
  if (/corporate|group/i.test(t)) return null;
  if (/hourly|local|sightseeing/i.test(t)) return { tripType: "local" };
  if (/round-trip|one-way|outstation/i.test(t)) return { tripType: "one-way", pickup: city };
  return { tripType: "local" };
}

/** Turn an item's existing `links` into inline links inside its description (renderInline syntax).
 *  A label that isn't in the text is kept as its own link line. */
function linkify(desc, links = []) {
  let d = desc; const extra = [];
  for (const l of links) {
    const i = d.indexOf(l.label);
    if (i >= 0) d = `${d.slice(0, i)}[${l.label}](${l.href})${d.slice(i + l.label.length)}`;
    else extra.push(`[${l.label}](${l.href})`);
  }
  return [d, ...extra];
}

/** "Mangaluru to Udupi" → "Udupi" */
const destOf = (name) => (/ to (.+)$/.exec(name)?.[1] || name).trim();

export default function CityLanding({ cfg: c }) {
  const city = c.cityName;
  const [booking, setBooking] = useState({ key: "city-default", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };

  const imageFor = (name) => placeImages[name] || null;
  const services = {
    heading: c.services.heading,
    cards: c.services.items.map((s) => {
      const journey = serviceJourney(s, city);
      return { title: s.title, body: linkify(s.desc, s.links), book: journey || undefined, href: journey ? undefined : (s.link || "/contact"), link: journey ? s.link : undefined };
    }),
  };

  // Order matches the previous page; light sections alternate, coloured/dark bands are fixed.
  const blocks = [
    ["services", (bg) => <UsesSection data={services} onBook={book} bg={bg} center />],
    c.fleet && ["fleet", (bg) => <FleetLineup data={c.fleet} bg={bg} />],
    c.tirumala && ["tirumala", () => <TirumalaBand data={c.tirumala} city={city} onBook={book} />, "fixed"],
    ["attractions", (bg) => <AttractionsGrid data={c.attractions} imageFor={imageFor} onBook={book} bg={bg} />],
    ["daytrips", (bg) => <DayTripCarousel data={c.dayTrips} imageFor={imageFor} destOf={destOf} origin={city} onBook={book} bg={bg} />],
    ["routes", () => <RoutesBoard data={c.outstationRoutes} origin={city} onBook={book} />, "fixed"],
    ["pickup", (bg) => <PickupMap data={c.pickupLocations} region={city} onBook={book} bg={bg} />],
    ["why", () => <WhyBand data={c.whyChoose} />, "fixed"],
    ["how", (bg) => <HowSection data={c.howToBook} onBook={book} bg={bg} />],
    ["tips", (bg) => <TipsSlip data={c.tips} bg={bg} />],
    ["faq", (bg) => <FaqCentered heading={`Frequently Asked Questions About Cab Booking in ${city}`} items={c.faqs.map(([q, a]) => ({ q, a }))} bg={bg} />],
  ].filter(Boolean);
  let light = 0;

  return (
    <>
      <PageHero
        center
        image="/images/hero-hill-road.webp"
        imagePosition="50% center"
        imageAlt={`Cab services in ${city}`}
        breadcrumb={[["Home", "/"], [city, null]]}
        title={c.hero.heading}
        subtitle={c.hero.subheading}
        description={c.hero.description}
      >
        <ServiceBooking widgetKey={booking.key} initialMode="one-way" presetJourney={booking.journey} />
      </PageHero>

      {blocks.map(([key, render, fixed]) => {
        if (fixed) { light = 0; return <React.Fragment key={key}>{render()}</React.Fragment>; }
        const bg = light++ % 2 === 0 ? "bg-bg" : "bg-white";
        return <React.Fragment key={key}>{render(bg)}</React.Fragment>;
      })}

      <CtaBand
        image="/images/hero-hill-road.webp"
        title={c.cta.heading}
        subheading={c.cta.subheading}
        description={c.cta.description}
        actions={<>
          <Button variant="inverse" size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5 text-center" onClick={() => book(null)}>{c.cta.ctaLabel}</Button>
          <Button href="/contact" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
