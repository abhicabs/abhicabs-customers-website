import usePageContent from "../../src/hooks/usePageContent";
import React, { useState } from "react";
import CtaBand from "../../src/components/CtaBand";
import { IconPin, IconArrowRight } from "../../src/components/Icons";
import Button from "../../src/components/ui/Button";
import ServiceBooking, { scrollToBooking } from "../../src/components/ServiceBooking";
import ServiceInterlink from "../../src/components/ServiceInterlink";
import { BadgeIndianRupee, ShieldCheck, Navigation, Headset } from "lucide-react";
import { HowSection } from "../../src/components/landing/bangalore/TrustSections";
import { BenefitRows } from "../../src/components/landing/local/LocalSections";
import { TripTypeSwitcher, RouteBoard, FareReceipt } from "../../src/components/landing/outstation/OutstationSections";

/* ── Route data ─────────────────────────────────────────────────────────── */
const ROUTES = [
  { from: "Bangalore", to: "Mysore",     km: 150, hr: "3",   img: "/images/route-1.webp", tag: "Popular" },
  { from: "Bangalore", to: "Coorg",      km: 260, hr: "5",   img: "/images/route-2.webp", tag: "Weekend" },
  { from: "Bangalore", to: "Ooty",       km: 280, hr: "6",   img: "/images/tea-garden-road.jpg", tag: "Hill Station" },
  { from: "Bangalore", to: "Goa",        km: 560, hr: "9",   img: "/images/route-3.webp", tag: null },
  { from: "Bangalore", to: "Wayanad",    km: 280, hr: "5.5", img: "/images/route-4.webp", tag: "Nature" },
  { from: "Bangalore", to: "Hampi",      km: 340, hr: "6",   img: "/images/route-5.webp", tag: "Heritage" },
  { from: "Bangalore", to: "Tirupati",   km: 250, hr: "4.5", img: "/images/family.webp", tag: "Pilgrimage" },
  { from: "Bangalore", to: "Pondicherry",km: 310, hr: "6",   img: "/images/coastal-road-sedan.jpg", tag: "Beach" },
  { from: "Bangalore", to: "Hyderabad",  km: 570, hr: "8",   img: "/images/route-6.webp", tag: null },
];

const TRIP_TYPES = [
  {
    title: "One-Way Drop",
    desc: "Get dropped at your destination and the trip ends there — no need to book a return. Enter your route to see the fare before you confirm.",
    icon: <IconArrowRight className="w-5 h-5" />,
    highlight: "Single direction",
  },
  {
    title: "Round Trip",
    desc: "Outstation and back with the same driver. The car stays with you for the entire trip — explore freely, stop anywhere.",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" /></svg>,
    highlight: "Driver stays with you",
  },
  {
    title: "Multi-City",
    desc: "Cover multiple stops across cities — Bangalore → Mysore → Coorg → Bangalore. One booking, one fare, zero hassle.",
    icon: <IconPin className="w-5 h-5" />,
    highlight: "Multiple stops, one fare",
  },
];

const STEPS = [
  { n: "1", title: "Enter your route", desc: "Pick up, drop off, date and time — your fare shows instantly." },
  { n: "2", title: "Choose your cab", desc: "Sedan, SUV, or tempo traveller. See the exact fare before you pay." },
  { n: "3", title: "Confirm & ride", desc: "Your driver is assigned, GPS-tracked, and ready at your doorstep." },
];

const INCLUDED = [
  "Base fare and fuel charges",
  "Driver allowance (bata)",
  "GST where applicable (shown in fare breakup)",
  "AC vehicle",
];

const EXTRAS = [
  "Toll / State tax (as per actuals)",
  "Parking charges",
  "Extra km beyond package limit",
  "Night driving allowance (9:45 PM – 6 AM) — ₹300/night, paid to driver",
];

const WHY = [
  { Icon: BadgeIndianRupee, title: "Upfront fares", desc: "See the exact price before you book. The fare on checkout is the fare you pay — toll and parking are at actuals." },
  { Icon: ShieldCheck, title: "Verified drivers", desc: "Every driver is KYC-verified, background-checked, and rated by passengers. No random assignments." },
  { Icon: Navigation, title: "Live GPS tracking", desc: "Track your cab in real time. Share the trip link with family so they know you're safe." },
  { Icon: Headset, title: "24×7 support", desc: "A real person picks up the phone — not a chatbot. Call, WhatsApp, or email, any hour." },
];

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function Page() {

  const cms = usePageContent("outstation");
  const heroTitle = cms.get("hero", "title", "Outstation cabs,");
  const heroAccent = cms.get("hero", "accent", "priced before you ride");
  const heroDesc = cms.get("hero", "description", "Book an outstation cab with Abhi Cabs — one-way or round trip, with popular routes from Bangalore and the fare shown before you confirm.");
  const ctaText = cms.get("hero", "ctaText", "Get Instant Quote");
  const [booking, setBooking] = useState({ key: "outstation", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img fetchPriority="high" src="/images/hero-hill-road.webp" srcSet="/images/hero-hill-road-900.webp 900w, /images/hero-hill-road.webp 1672w" sizes="100vw" alt="Open highway through Western Ghats" className="w-full h-full object-cover ac-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div aria-hidden className="ac-hero-glow absolute -left-24 -bottom-24 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle,rgba(255,213,79,.22),transparent 65%)" }} />
          <div aria-hidden className="ac-hero-sweep absolute inset-0" />
        </div>
        <div className="relative max-w-[1264px] mx-auto px-6 py-20 md:py-32">
          <Breadcrumb items={[["Home", "/"], ["Outstation Cabs", null]]} light />
          <h1 className="ac-hero-fade-up text-[32px] md:text-[52px] font-bold tracking-tight text-white leading-tight max-w-[1200px]" style={{ textShadow: "0 4px 30px rgba(0,0,0,.45)" }}>
            {heroTitle} <span className="ac-gold-shimmer">{heroAccent}</span>
          </h1>
          <div className="ac-hero-fade-up ac-hero-fade-up-delay2 mt-10">
            <ServiceBooking widgetKey={booking.key} initialMode="one-way" presetJourney={booking.journey} />
          </div>
          <div className="ac-hero-fade-up ac-hero-fade-up-delay3 flex flex-wrap gap-3 mt-9">
            {[["Fare shown first","Before you confirm"],["Round trips","Driver stays with you"],["4 states","Karnataka, AP, Telangana & Maharashtra"]].map(([big,small])=>(
              <div key={big} className="ac-glass rounded-2xl px-4 py-2.5 text-white/90">
                <div className="text-[15px] font-bold">{big}</div>
                <div className="text-[12px] text-white/60">{small}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TripTypeSwitcher eyebrow="Trip Types" title="One booking format for every kind of outstation trip"
        description="Whether you need a quick one-way drop or a week-long road trip with multiple stops — the booking is the same."
        types={TRIP_TYPES} onBook={book} />

      <RouteBoard eyebrow="Popular Routes" title="Most booked outstation routes from Bangalore" routes={ROUTES} onBook={book} />

      <FareReceipt eyebrow="Transparent Pricing" title="Everything included in your fare" included={INCLUDED}
        extrasTitle="Charged separately (at actuals)" extras={EXTRAS}
        note="The exact fare — including any applicable night charge or surcharge — is confirmed on the checkout page before you pay. No surprises, ever." />

      <HowSection data={{ eyebrow: "How It Works", heading: "Book in under a minute", steps: STEPS, ctaLabel: "Book Now" }} onBook={book} bg="bg-white" />

      <BenefitRows data={{ eyebrow: "Why AbhiCabs", heading: "Built for outstation, not retrofitted", items: WHY }} ctaLabel={ctaText} onCta={() => book(null)} />

      {/* ── Service interlinks ─────────────────────────────────────── */}

      <ServiceInterlink exclude="/outstation" title="More Ways to Travel" className="bg-[#FAFAFA] border-y border-border" />

      {/* ── CTA: same dark band as the service & city pages ── */}
      <CtaBand
        image="/images/hero-hill-road.webp"
        title="Get your fare in 10 seconds"
        description="Enter your pickup and destination — the fare, vehicle options, and estimated time appear instantly. No login needed."
        actions={<>
          <Button variant="inverse" size="lg" onClick={() => book(null)}>{ctaText}</Button>
          <Button href="/contact-us" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}

/* ── Breadcrumb ─────────────────────────────────────────────────────────── */
function Breadcrumb({ items, light }) {
  return (
    <div className={`flex items-center gap-2 text-[13.5px] mb-3.5 ${light ? "text-white/60" : "text-text-secondary"}`}>
      {items.map(([label, href], i) => (
        <React.Fragment key={label}>
          {i > 0 && <span>/</span>}
          {href ? <a href={href} className={`font-semibold ${light ? "hover:text-white" : "hover:text-primary"}`}>{label}</a> : <span>{label}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
