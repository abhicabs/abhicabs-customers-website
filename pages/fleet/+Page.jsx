import React, { useState } from "react";
import { Car, Users, Armchair, Snowflake, PartyPopper, Clock, MousePointerClick } from "lucide-react";
import ServiceBooking, { scrollToBooking } from "../../src/components/ServiceBooking";
import usePageContent from "../../src/hooks/usePageContent";
import useVehicleCatalogue from "../../src/hooks/useVehicleCatalogue";
import PageHero from "../../src/components/ui/PageHero";
import Button from "../../src/components/ui/Button";
import CtaBand from "../../src/components/CtaBand";
import { VehicleShowroom, RentalOptionTiles } from "../../src/components/landing/fleet/FleetShowroom";
import { BenefitRows, CoverageTickets, FaqSearch } from "../../src/components/landing/local/LocalSections";

/* "Vehicle Rental" menu page. The fleet itself is live from the backend (useVehicleCatalogue);
   the copy below is the page's own content, unchanged. Layout: src/components/landing/fleet. */

const TABS = [
  { id: "all",    label: "All",           icon: "all" },
  { id: "sedan",  label: "Sedan",         icon: "sedan" },
  { id: "suv",    label: "SUV",           icon: "suv" },
  { id: "luxury", label: "Luxury",        icon: "luxury" },
  { id: "tempo",  label: "Tempo / Coach", icon: "tempo" },
  { id: "bus",    label: "Bus",           icon: "bus" },
];

/* ── Fleet Category Descriptions (from spec) ── */
const CATEGORY_INFO = {
  sedan:  { title: "Sedan Cabs – Comfortable & Budget-Friendly Travel",         desc: "Book a Swift Dzire or similar sedan with Abhi Cabs 24×7 for airport transfers, local travel, business meetings, and outstation trips. A convenient choice for individuals and small families." },
  suv:    { title: "SUV & MUV Cabs – Spacious Family Travel",                   desc: "Choose Ertiga, Innova, or Innova Hycross from Abhi Cabs 24×7 for family vacations, long-distance journeys, and round-trip cab bookings. Enjoy spacious seating and comfortable travel." },
  tempo:  { title: "Tempo Traveller Rentals – Ideal for Group Trips",           desc: "Planning a family tour, pilgrimage, or corporate outing? Abhi Cabs 24×7 Tempo Traveller rentals provide convenient group transportation for sightseeing, outstation trips, and special occasions." },
  luxury: { title: "Force Urbania Rentals – Premium Group Transportation",      desc: "Travel comfortably with Force Urbania rental services from Abhi Cabs 24×7. A suitable choice for corporate travel, family tours, and long-distance group journeys." },
  bus:    { title: "Bus & Coach Rentals – Travel Together",                     desc: "Choose BharatBenz buses and coaches from Abhi Cabs 24×7 for weddings, corporate events, school and college trips, and large group tours." },
};

/* ── Cab Rental Options ── */
const RENTAL_OPTIONS = [
  { label: "Airport Taxi Booking", desc: "Convenient airport pickup and drop-off services.", href: "/services/airport-taxi" },
  { label: "Outstation Cab Rentals", desc: "Comfortable intercity and interstate journeys.", href: "/outstation" },
  { label: "Round-Trip Cab Booking", desc: "Flexible return journeys for business and family trips.", href: "/services/round-trip" },
  { label: "Hourly Cab Rentals", desc: "Book cabs for meetings, shopping, sightseeing, and local travel.", href: "/services/local" },
  { label: "Local Taxi Services", desc: "Convenient vehicle options for everyday city travel.", href: "/services/local" },
  { label: "Group Vehicle Rentals", desc: "Tempo Travellers, Urbania, and buses for group transportation.", href: "/vehicles/tempo-traveller" },
];

/* ── Why Choose Fleet ── */
const WHY_CHOOSE = [
  { Icon: Car, title: "Wide Range of Vehicles", desc: "Choose from sedans, SUVs, Innova, Tempo Travellers, Urbania, and buses." },
  { Icon: Users, title: "Flexible Seating Options", desc: "Vehicles ranging from 4-seaters to 50-seaters for individuals, families, and groups." },
  { Icon: Armchair, title: "Comfortable Travel Options", desc: "Select spacious vehicles suited to short city rides or long-distance journeys." },
  { Icon: Snowflake, title: "AC & Non-AC Vehicles", desc: "Choose available vehicle options based on your travel preferences." },
  { Icon: PartyPopper, title: "Vehicles for Every Occasion", desc: "Suitable for airport transfers, family vacations, corporate outings, weddings, and group tours." },
  { Icon: Clock, title: "Flexible Rental Packages", desc: "Choose hourly cab rentals, local travel, outstation trips, or round-trip bookings." },
  { Icon: MousePointerClick, title: "Easy Vehicle Selection", desc: "Explore the Abhi Cabs 24×7 fleet and choose a vehicle that matches your group size and travel plans." },
];

/* ── FAQs ── */
const FLEET_FAQS = [
  { q: "1. What types of vehicles are available at Abhi Cabs 24×7?", a: "Abhi Cabs 24×7 offers Swift Dzire, Ertiga, Innova, Innova Hycross, Tempo Traveller, Force Urbania, and BharatBenz buses for local, airport, outstation, and group travel." },
  { q: "2. Can I book an outstation cab for travel across India?", a: "Yes. Abhi Cabs 24×7 provides outstation cab booking services with pickups from Karnataka, Andhra Pradesh, Maharashtra, and Telangana to destinations across India." },
  { q: "3. Does Abhi Cabs 24×7 provide hourly cab rentals?", a: "Yes, we offer hourly cab rental services for city sightseeing, shopping, business meetings, and personal travel." },
  { q: "4. Can I book a Tempo Traveller for family and group trips?", a: "Yes. You can book Tempo Traveller rentals with Abhi Cabs 24×7 for family vacations, pilgrimages, corporate outings, sightseeing, and group tours." },
  { q: "5. Which vehicles are suitable for small families?", a: "Swift Dzire, Ertiga, Innova, and Innova Hycross are suitable options depending on your passenger count, luggage, and travel requirements." },
  { q: "6. Can I book a cab for round-trip travel?", a: "Yes. Abhi Cabs 24×7 offers round-trip cab bookings for business travel, family vacations, sightseeing, and long-distance outstation journeys." },
  { q: "7. Which vehicle is best for large group transportation?", a: "For larger groups, Tempo Traveller, Force Urbania, and BharatBenz bus rentals are suitable options depending on the number of passengers and travel requirements." },
  { q: "8. Are airport pickup and drop-off services available?", a: "Yes. Abhi Cabs 24×7 offers airport taxi booking services from supported locations, with different vehicle options based on passenger and luggage requirements." },
  { q: "9. Can I book buses for weddings and corporate events?", a: "Yes. Abhi Cabs 24×7 provides bus and group vehicle rentals for weddings, corporate events, family tours, and school or college trips." },
  { q: "10. How can I book a vehicle with Abhi Cabs 24×7?", a: "Visit abhicabs24x7.com, explore our fleet, choose your preferred vehicle, enter your travel details, and submit your cab booking request." },
];

/** Book a vehicle from the fleet page — the SAME link the home page fleet uses:
 *  cab search with this vehicle pre-selected (type=fleet = full catalogue).
 *  The customer enters the trip there and goes straight to checkout with it. */
function bookHref(v) {
  const qs = new URLSearchParams({ type: "fleet" });
  if (v?.seats) qs.set("seater", String(v.seats));
  const id = v?.id || v?.key;
  if (id) qs.set("vehicle", id);
  return `/booking-search?${qs.toString()}`;
}

const HERO_DESCRIPTION = "Explore the wide range of vehicles at Abhi Cabs 24×7, your travel partner for comfortable and convenient journeys. From budget-friendly sedans and spacious SUVs to Tempo Travellers, Urbania, and luxury coaches, we offer cab rentals with professional drivers for airport transfers, local trips, hourly rentals, outstation journeys, round trips, and group travel.";

const STATES = {
  heading: "Book Your Preferred Vehicle for Travel Across India",
  subheading: "Cab Rentals from Karnataka, Andhra Pradesh, Maharashtra & Telangana",
  body: ["Abhi Cabs 24×7 provides cab and vehicle rental services with pickups from Karnataka, Andhra Pradesh, Maharashtra, and Telangana to destinations across India. Whether you need a sedan for airport travel, an SUV for a family vacation, or a Tempo Traveller for group transportation, find the right vehicle for your journey."],
};

const CTA = {
  line1: "Book Your Cab Online",
  line2: "with Abhi Cabs 24×7",
  description: "Your Journey, Your Choice of Vehicle. Looking for a suitable vehicle for your next trip? Abhi Cabs 24×7 offers sedans, SUVs, Tempo Travellers, Urbania, and buses for local travel, airport transfers, outstation journeys, hourly rentals, and round trips. Explore our fleet, select your preferred vehicle, and book your next journey with Abhi Cabs 24×7.",
  primaryLabel: "Explore Vehicles & Book Now",
};

export default function FleetPage() {
  usePageContent("fleet"); // keeps the CMS page cache warm, as before
  const { grouped: fleet, loading, error, retry } = useVehicleCatalogue();
  const tabs = TABS.filter((t) => t.id === "all" || fleet.some((v) => v.category === t.id));

  const [booking, setBooking] = useState({ key: "fleet-hero", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };

  return (
    <>
      <PageHero
        center
        image="/images/hero-fleet-hills.webp"
        imagePosition="60% center"
        imageAlt="Abhi Cabs fleet"
        breadcrumb={[["Home", "/"], ["Vehicle Rental", null]]}
        title={<>Our Fleet – <span className="ac-gold-shimmer">Cab Rental & Vehicle Booking Services</span> Across India</>}
        subtitle="Find Your Perfect Ride with Abhi Cabs 24×7"
        description={HERO_DESCRIPTION}
      >
        <ServiceBooking widgetKey={booking.key} initialMode="one-way" presetJourney={booking.journey} />
      </PageHero>

      <VehicleShowroom heading="Explore the Abhi Cabs 24×7 Fleet" fleet={fleet} loading={loading} error={error} retry={retry}
        tabs={tabs} categoryInfo={CATEGORY_INFO} bookHref={bookHref} />

      <RentalOptionTiles heading="Cab Rental Options for Every Travel Need" options={RENTAL_OPTIONS} />

      <BenefitRows data={{ heading: "Why Choose the Abhi Cabs 24×7 Fleet?", subheading: "The Right Vehicle for Every Travel Need", items: WHY_CHOOSE }} ctaLabel={CTA.primaryLabel} onCta={() => book(null)} />

      <CoverageTickets data={STATES} onBook={book} tripType="one-way" bookLabel="Book from here" />

      <FaqSearch heading="Frequently Asked Questions About the Abhi Cabs 24×7 Fleet" items={FLEET_FAQS} placeholder="Search questions, e.g. Tempo Traveller, bus, airport" />

      <CtaBand
        image="/images/hero-fleet-hills.webp"
        title={<>{CTA.line1} <span className="text-[#FFD54F]">{CTA.line2}</span></>}
        description={CTA.description}
        actions={<>
          <Button variant="inverse" size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => book(null)}>{CTA.primaryLabel}</Button>
          <Button href="/contact-us" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
