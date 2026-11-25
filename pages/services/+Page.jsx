import React, { useMemo, useRef, useState } from "react";
import ServiceBooking from "../../src/components/ServiceBooking";
import {
  Plane, Navigation, Car, Repeat, Timer, MapPin, Users, UserCheck,
  ArrowRight, ArrowUpRight, Check, Search, ChevronDown,
} from "lucide-react";
import CTASection from "../../src/components/CTASection";

/* ── Service Cards ── */
const SERVICE_CARDS = [
  {
    Icon: Plane,
    title: "Airport Taxi Services – Convenient Airport Transfers",
    desc: "Book airport taxi services with Abhi Cabs 24×7 for airport pickups and drop-offs. Whether you're travelling for business or leisure, choose a suitable cab for your airport journey and enjoy comfortable transportation with professional drivers.",
    cta: "Book Airport Taxi",
  },
  {
    Icon: Navigation,
    title: "Outstation Cab Services – Comfortable Long-Distance Travel",
    desc: "Planning a family vacation, business trip, or weekend getaway? Abhi Cabs 24×7 outstation cab services offer convenient intercity and interstate taxi bookings from supported pickup locations to destinations across India.",
    cta: "Book Outstation Cab",
  },
  {
    Icon: MapPin,
    title: "One-Way Cab Services – Convenient Point-to-Point Travel",
    desc: "Need a cab to another city without a return journey? Choose one-way cab booking with Abhi Cabs 24×7 for business travel, family visits, and intercity trips. Book a comfortable taxi based on your route and travel requirements.",
    cta: "Book One-Way Cab",
  },
  {
    Icon: Repeat,
    title: "Round-Trip Cab Services – Flexible Return Journeys",
    desc: "Plan your return journey with Abhi Cabs 24×7 round-trip taxi services. Ideal for family holidays, sightseeing, pilgrimages, and business trips, our round-trip cab bookings help you travel according to your schedule.",
    cta: "Book Round-Trip Cab",
  },
  {
    Icon: Timer,
    title: "Hourly Cab Rentals – Travel on Your Schedule",
    desc: "Need a taxi for a few hours? Choose hourly cab rental services from Abhi Cabs 24×7 for shopping, meetings, sightseeing, and personal travel. Select an hourly rental package suited to your journey.",
    cta: "Book Hourly Rental",
  },
  {
    Icon: Car,
    title: "Local Taxi Services – Easy City Transportation",
    desc: "Book local taxi services with Abhi Cabs 24×7 for city sightseeing, business meetings, shopping, and everyday travel. Choose a convenient local cab for short journeys within supported cities.",
    cta: "Book Local Cab",
  },
  {
    Icon: Users,
    title: "Group Transportation – Travel Together Comfortably",
    desc: "Planning a wedding, corporate outing, family tour, or group vacation? Abhi Cabs 24×7 group transportation services offer Tempo Travellers, Force Urbania vehicles, and buses for group travel, based on passenger count and availability.",
    cta: "Book Group Vehicle",
  },
  {
    Icon: UserCheck,
    title: "Driver Services – Professional Driving Assistance",
    desc: "Need a driver for your journey? Abhi Cabs 24×7 driver services provide professional driving assistance for personal travel, business trips, and other transportation needs in supported locations.",
    cta: "Enquire About Driver Services",
  },
];

/* ── Travel Occasions ── */
const OCCASIONS = [
  { label: "Family Vacations", desc: "Outstation and round-trip cabs for holidays and sightseeing." },
  { label: "Business Travel", desc: "Airport transfers, local trips, and intercity taxi bookings." },
  { label: "Corporate Transportation", desc: "Group vehicles for meetings, events, and team outings." },
  { label: "Pilgrimage Tours", desc: "Convenient cab bookings for religious journeys." },
  { label: "Weddings & Events", desc: "Vehicle rentals for guests and group transportation." },
  { label: "City Sightseeing", desc: "Local taxis and hourly cab rentals for exploring destinations." },
];

/* ── Popular Routes ── */
const ROUTES = [
  { label: "Bangalore to Mysore Cabs", desc: "Convenient taxi booking for business, sightseeing, and family trips." },
  { label: "Bangalore to Hyderabad Cabs", desc: "Comfortable interstate cab services for long-distance travel." },
  { label: "Hyderabad to Vijayawada Cabs", desc: "Outstation taxi booking for personal and business journeys." },
  { label: "Pune to Mumbai Cabs", desc: "Convenient intercity travel and airport connections." },
  { label: "Hyderabad to Bangalore Cabs", desc: "Flexible one-way and round-trip taxi options." },
];

/* ── Booking Info ── */
const BOOKING_INFO = [
  { label: "Pickup & Drop Location", desc: "Enter your travel starting point and destination." },
  { label: "Travel Date & Time", desc: "Select your preferred pickup schedule." },
  { label: "Trip Type", desc: "Choose one-way, round-trip, hourly rental, or another available service." },
  { label: "Passengers & Luggage", desc: "Select a vehicle suited to your group size and luggage." },
  { label: "Rental Duration", desc: "Check the applicable hours or trip duration." },
  { label: "Additional Charges", desc: "Confirm applicable tolls, parking fees, permits, and other charges before booking." },
];

/* ── How to Book Steps ── */
const STEPS = [
  { title: "Step 1 – Enter Your Travel Details", desc: "Select your pickup location, destination, travel date, and preferred cab service." },
  { title: "Step 2 – Choose Your Preferred Vehicle", desc: "Explore available cabs and select a vehicle based on your passenger count, luggage, and travel needs." },
  { title: "Step 3 – Submit Your Booking Request", desc: "Enter the required details and follow the booking instructions to arrange your journey." },
];

/* ── FAQs ── */
const FAQS = [
  { q: "1. What types of cab services does Abhi Cabs 24×7 provide?", a: "Abhi Cabs 24×7 offers airport taxi services, local cabs, outstation taxi bookings, one-way trips, round-trip cabs, hourly rentals, driver services, and group transportation." },
  { q: "2. Can I book an outstation cab to destinations across India?", a: "Yes. We provide outstation cab bookings with pickups from Karnataka, Andhra Pradesh, Maharashtra, and Telangana to destinations across India, subject to route availability." },
  { q: "3. Does Abhi Cabs 24×7 provide one-way taxi services?", a: "Yes. You can book one-way cabs for intercity travel, business trips, and point-to-point journeys without scheduling a return trip." },
  { q: "4. Are hourly cab rental services available?", a: "Yes. Abhi Cabs 24×7 offers hourly cab rentals for shopping, local sightseeing, business meetings, and personal travel." },
  { q: "5. Can I book a round-trip taxi for a family vacation?", a: "Yes. Our round-trip cab services are suitable for family holidays, sightseeing, pilgrimages, and long-distance travel." },
  { q: "6. Do you provide airport pickup and drop-off services?", a: "Yes. We provide airport taxi booking services from supported pickup and drop-off locations, with different vehicle options based on passenger and luggage requirements." },
  { q: "7. Can I book a Tempo Traveller or bus for group travel?", a: "Yes. Abhi Cabs 24×7 provides Tempo Travellers, Force Urbania vehicles, and buses for family tours, weddings, corporate outings, and group transportation." },
  { q: "8. Are professional drivers available with cab bookings?", a: "Yes. Our chauffeur-driven cab services include professional drivers for your travel requirements." },
  { q: "9. Can I book a cab in advance?", a: "Yes. You can request a cab booking for your preferred travel date and pickup time, subject to vehicle availability." },
  { q: "10. How can I book a cab online with Abhi Cabs 24×7?", a: "Visit abhicabs24x7.com, select your cab service, enter your pickup and destination details, choose an available vehicle, and follow the booking process." },
];

/* ── Presentation only (photos + which booking mode each service opens) ── */
const SERVICE_META = [
  { mode: "airport", img: "/images/airport.webp" },
  { mode: "one-way", img: "/images/hero-hill-road-900.webp" },
  { mode: "one-way", img: "/images/coastal-road-sedan.jpg" },
  { mode: "round-trip", img: "/images/weekend.webp" },
  { mode: "local", img: "/images/hero-local-chauffeur-900.webp" },
  { mode: "local", img: "/images/dashboard-pov.jpg" },
  { mode: "one-way", img: "/images/group.webp" },
  { mode: "one-way", img: "/images/freecancel.webp" },
];
const OCCASION_IMG = ["/images/family.webp", "/images/bussiness.webp", "/images/corporate.webp", "/images/route-5.webp", "/images/grouptravel.webp", "/images/route-6.webp"];
const BENTO = ["sm:col-span-2 lg:col-span-2 lg:row-span-2", "", "", "", "", "sm:col-span-2 lg:col-span-4"];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00]";
const hl = (t) => <span className="bg-[linear-gradient(transparent_58%,#FFD54F_58%,#FFD54F_92%,transparent_92%)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-0.5">{t}</span>;
const H2 = "text-[30px] md:text-[46px] font-black tracking-[-0.04em] leading-[1.04] [text-wrap:balance]";
const H3SUB = "mt-3 text-[17px] md:text-[21px] font-bold";

export default function Page() {
  // booking widget: re-keyed with a mode/route preset, then scrolled into view
  const [bk, setBk] = useState({ key: "services-hero", mode: "one-way", pickup: "", drop: "" });
  const book = (mode = "one-way", pickup = "", drop = "") => {
    setBk({ key: `b-${Date.now()}`, mode, pickup, drop });
    // Scroll after the widget has remounted with the new preset. Long smooth scrolls get cancelled when they
    // pass through content-visibility:auto sections (they change height as they render), so jump to just short
    // of the form, glide the last stretch, then correct any leftover offset.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = document.getElementById("booking"); if (!el) return;
      const target = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY - 110);
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const t = target(); const gap = window.scrollY - t;
      if (reduce) { window.scrollTo({ top: t, behavior: "instant" }); return; }
      if (Math.abs(gap) > 500) window.scrollTo({ top: t + Math.sign(gap) * 360, behavior: "instant" });
      requestAnimationFrame(() => window.scrollTo({ top: target(), behavior: "smooth" }));
      setTimeout(() => { if (Math.abs(window.scrollY - target()) > 40) window.scrollTo({ top: target(), behavior: "instant" }); }, 900);
    }));
  };


  return (
    <>
      <style>{`
        @keyframes svUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        @keyframes svZoom { from { transform: scale(1.08); } to { transform: scale(1); } }
        @keyframes svDash { to { stroke-dashoffset: 0; } }
        .sv-in > * { animation: svUp .7s cubic-bezier(.22,1,.36,1) both; } .sv-in > *:nth-child(2) { animation-delay: .12s; }
        .sv-zoom { animation: svZoom 14s ease-out both; }
        .sv-route .sv-line { stroke-dasharray: 6 8; }
        .sv-route .sv-car { transition: left .9s cubic-bezier(.22,1,.36,1); left: 0%; }
        .sv-route:hover .sv-car, .sv-route:focus-within .sv-car { left: calc(100% - 28px); }
        @keyframes svFlow { to { stroke-dashoffset: -32; } }
        @keyframes svFlowV { to { background-position: 0 32px; } }
        @keyframes svPing { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(1.45); opacity: 0; } }
        .sv-flow { animation: svFlow 1.1s linear infinite; }
        .sv-flow-v { background: repeating-linear-gradient(180deg,#111 0 8px,transparent 8px 16px); animation: svFlowV 1s linear infinite; }
        .sv-ping { animation: svPing 2.4s cubic-bezier(0,0,.2,1) infinite; }
        @media (prefers-reduced-motion: reduce) { .sv-in > *, .sv-zoom, .sv-flow, .sv-flow-v, .sv-ping { animation: none !important; } .sv-ping { display: none; } .sv-route .sv-car { transition: none; } }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative isolate overflow-hidden bg-[#111]">
        <img src="/images/hero-fleet-hills.webp" srcSet="/images/hero-fleet-hills-900.webp 900w, /images/hero-fleet-hills.webp 1672w" sizes="100vw" alt="Cab booking services across India" fetchPriority="high"
          className="sv-zoom absolute inset-0 -z-20 w-full h-full object-cover object-[60%_center]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(9,9,11,.94)_0%,rgba(9,9,11,.72)_50%,rgba(9,9,11,.35)_100%)]" />
        <div aria-hidden className="absolute -z-10 left-[-10%] top-[-30%] w-[60%] aspect-square rounded-full" style={{ background: "radial-gradient(circle, rgba(255,213,79,.18), transparent 65%)" }} />
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6 pt-14 pb-12 md:pt-24 md:pb-20">
          <div className="sv-in">
            <h1 className="max-w-[980px] text-[36px] sm:text-[52px] lg:text-[66px] font-black text-white tracking-[-0.045em] leading-[1.02] [text-wrap:balance]">
              Cab Booking Services – <span className="text-[#FFD54F]">Airport, Local &amp; Outstation Cabs</span> Across India
            </h1>
            <div className="mt-9 md:mt-12">
              <ServiceBooking widgetKey={bk.key} initialMode={bk.mode} presetPickup={bk.pickup} presetDrop={bk.drop} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TRAVEL YOUR WAY ═══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] gap-6 lg:gap-16 items-start">
          <h2 className="text-[40px] md:text-[60px] font-black tracking-[-0.05em] leading-[.98]">Travel Your Way with Abhi Cabs 24×7</h2>
          <p className="text-[19px] md:text-[24px] font-semibold text-[#27272A] leading-[1.55] tracking-[-0.01em]">
            Looking for reliable {hl("cab booking services across India")}? Abhi Cabs 24×7 offers airport transfers, local taxi services, outstation cab bookings, one-way cabs, round-trip taxis, hourly car rentals, driver services, and group transportation. With pickups from {hl("Karnataka, Andhra Pradesh, Maharashtra, and Telangana")} to destinations across India, we make every journey comfortable and convenient.
          </p>
        </div>
      </section>

      <ServiceExplorer onBook={book} />
      <Occasions />
      <RoutesBoard onBook={book} />

      <StatesBand />

      <BeforeBooking />
      <HowToBook onBook={book} />
      <Faqs />

      {/* ═══ CTA ═══ */}
      <CTASection
        id="services-cta"
        onBookMode={() => book("one-way")}
        line1="Ready to Book Your Next Ride"
        line2="with Abhi Cabs 24×7?"
        description="Choose Your Journey. Find Your Cab. Start Travelling. Whether you're planning an airport transfer, local journey, outstation trip, hourly rental, or group tour, Abhi Cabs 24×7 offers flexible cab booking options for your travel needs. Enter your travel details, explore available vehicles, and plan your next journey with ease."
        primaryLabel="Check Available Cabs"
        secondary={false}
      />
    </>
  );
}

/* ═══ EXPLORE OUR CAB BOOKING SERVICES — tabs + photo panel ═══ */
function ServiceExplorer({ onBook }) {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  const onKey = (e, i) => {
    const n = SERVICE_CARDS.length;
    const next = ["ArrowDown", "ArrowRight"].includes(e.key) ? (i + 1) % n : ["ArrowUp", "ArrowLeft"].includes(e.key) ? (i - 1 + n) % n : null;
    if (next === null) return; e.preventDefault(); setActive(next); tabs.current[next]?.focus();
  };
  return (
    <section className="bg-[#0E0F11] text-white py-16 md:py-24" id="services-list">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <h2 className={`${H2} text-center`}>Explore Our Cab Booking Services</h2>
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)] gap-5">
          <div role="tablist" aria-orientation="vertical" aria-label="Cab booking services" className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-5 px-5 lg:mx-0 lg:px-0 pb-2 lg:pb-0 [scrollbar-width:none]">
            {SERVICE_CARDS.map((s, i) => {
              const on = i === active; const name = s.title.split(" – ")[0];
              return (
                <button key={s.title} ref={(el) => (tabs.current[i] = el)} type="button" role="tab" id={`sv-t${i}`} aria-controls={`sv-p${i}`} aria-selected={on} tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)}
                  className={`shrink-0 group flex items-center gap-3.5 rounded-[18px] px-4 py-3.5 text-left transition-colors ${focusRing} ${on ? "bg-[#FFD54F] text-[#111]" : "bg-white/[.04] hover:bg-white/[.09] text-white"}`}>
                  <span className={`grid place-items-center w-10 h-10 shrink-0 rounded-xl ${on ? "bg-[#111] text-[#FFD54F]" : "bg-white/10 text-[#FFD54F]"}`}><s.Icon size={19} aria-hidden /></span>
                  <span className="text-[15px] font-extrabold whitespace-nowrap lg:whitespace-normal">{name}</span>
                  <span className={`ml-auto hidden lg:block text-[12px] font-black tabular-nums ${on ? "text-[#111]/50" : "text-white/30"}`}>{String(i + 1).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          <div className="relative grid">
            {SERVICE_CARDS.map((s, i) => {
              const on = i === active; const meta = SERVICE_META[i] || SERVICE_META[0];
              const [name, tagline] = s.title.split(" – ");
              return (
                <article key={s.title} id={`sv-p${i}`} role="tabpanel" aria-labelledby={`sv-t${i}`}
                  className={`[grid-area:1/1] relative isolate overflow-hidden rounded-[30px] min-h-[460px] lg:min-h-full flex flex-col justify-end transition-opacity duration-500 motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0 invisible"}`}>
                  <img src={meta.img} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async"
                    className={`absolute inset-0 -z-20 w-full h-full object-cover transition-transform duration-[1400ms] ease-out motion-reduce:transition-none ${on ? "scale-100" : "scale-105"}`} />
                  <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
                  <s.Icon aria-hidden strokeWidth={0.8} className="absolute -right-6 -top-6 w-48 h-48 text-white/10" />
                  <div className="p-7 md:p-10">
                    <p className="text-[12.5px] font-black tabular-nums text-[#FFD54F]">{String(i + 1).padStart(2, "0")} / {String(SERVICE_CARDS.length).padStart(2, "0")}</p>
                    <h3 className="mt-3">
                      <span className="block text-[30px] md:text-[42px] font-black tracking-[-0.04em] leading-[1.02]">{name}</span>
                      {tagline && <><span className="sr-only"> – </span><span className="block mt-1.5 text-[17px] md:text-[20px] font-bold text-[#FFD54F]">{tagline}</span></>}
                    </h3>
                    <p className="mt-4 max-w-[620px] text-[15.5px] md:text-[16.5px] text-white/80 leading-relaxed">{s.desc}</p>
                    <button type="button" tabIndex={on ? 0 : -1} onClick={() => onBook(meta.mode)}
                      className={`group/b mt-7 inline-flex items-center gap-2.5 h-13 min-h-[52px] pl-6 pr-2 rounded-full bg-[#FFD54F] text-[#111] font-extrabold text-[15px] hover:bg-white transition-colors ${focusRing}`}>
                      {s.cta}<span className="grid place-items-center w-9 h-9 rounded-full bg-[#111] text-[#FFD54F] transition-transform duration-300 group-hover/b:translate-x-1"><ArrowRight size={16} aria-hidden /></span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ OCCASIONS — photo bento ═══ */
function Occasions() {
  return (
    <section className="bg-[#FAF7EE] py-16 md:py-24">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[760px] mx-auto">
          <h2 className={H2}>Cab Services for Every Travel Occasion</h2>
          <h3 className={`${H3SUB} text-[#7A5D00]`}>Flexible Travel Solutions for Personal & Business Needs</h3>
          <p className="mt-3 text-[15.5px] text-text-secondary">At Abhi Cabs 24×7, we provide cab rental solutions for different travel requirements.</p>
        </div>
        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[240px] gap-4">
          {OCCASIONS.map((o, i) => (
            <li key={o.label} className={`group relative isolate overflow-hidden rounded-[26px] bg-[#111] text-white min-h-[240px] flex flex-col justify-end ${BENTO[i] || ""}`}>
              <img src={OCCASION_IMG[i]} alt="" loading="lazy" decoding="async" className="absolute inset-0 -z-20 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.07] motion-reduce:transition-none" />
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className={`p-6 ${i === 0 ? "md:p-8" : ""}`}>
                <h4 className={`font-black tracking-[-0.03em] leading-tight ${i === 0 ? "text-[28px] md:text-[36px]" : "text-[21px]"}`}>{o.label}</h4>
                <p className={`mt-1.5 text-white/80 leading-relaxed ${i === 0 ? "text-[16px] max-w-[420px]" : "text-[14px]"}`}>{o.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ═══ POPULAR ROUTES — dark board; Get fare fills From/To ═══ */
function RoutesBoard({ onBook }) {
  return (
    <section className="bg-[#111] text-white py-16 md:py-24">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="max-w-[780px]">
          <h2 className={H2}>Popular Outstation Cab Routes</h2>
          <h3 className={`${H3SUB} text-[#FFD54F]`}>Explore Intercity Taxi Services with Abhi Cabs 24×7</h3>
          <p className="mt-3 text-[15.5px] text-white/65">Planning an intercity journey? Explore popular <span className="text-white font-semibold">outstation cab routes</span> from our supported pickup states.</p>
        </div>
        <ul className="mt-12 border-t border-white/15">
          {ROUTES.map((r, i) => {
            const m = r.label.match(/^(.+?) to (.+?) Cabs$/); const [from, to] = m ? [m[1], m[2]] : [r.label, ""];
            return (
              <li key={r.label} className="sv-route group border-b border-white/12">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[40px_minmax(0,1.65fr)_minmax(0,.85fr)_auto] items-center gap-x-6 gap-y-3 py-6 md:py-7">
                  <span className="hidden lg:block text-[13px] font-black tabular-nums text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <h3 className="sr-only">{r.label}</h3>
                    <div aria-hidden className="flex items-center gap-3 md:gap-5">
                      <span className="text-[22px] md:text-[32px] font-black tracking-[-0.03em] leading-none">{from}</span>
                      <span className="relative shrink-0 w-[clamp(48px,8vw,110px)] h-7">
                        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 10"><line className="sv-line" x1="2" y1="5" x2="98" y2="5" stroke="#FFD54F" strokeWidth="1.2" vectorEffect="non-scaling-stroke" /></svg>
                        <span className="sv-car absolute top-0 grid place-items-center w-7 h-7 rounded-full bg-[#FFD54F] text-[#111]"><Car size={14} strokeWidth={2.4} /></span>
                      </span>
                      <span className="text-[22px] md:text-[32px] font-black tracking-[-0.03em] leading-none text-[#FFD54F]">{to}</span>
                    </div>
                  </div>
                  <p className="col-span-2 lg:col-span-1 order-3 lg:order-none text-[14.5px] text-white/65 leading-relaxed">{r.desc}</p>
                  <button type="button" onClick={() => onBook("one-way", from, to)} aria-label={`Get fare from ${from} to ${to}`}
                    className={`inline-flex items-center gap-2 h-11 px-5 rounded-full border-2 border-white/25 text-[14px] font-bold group-hover:bg-[#FFD54F] group-hover:border-[#FFD54F] group-hover:text-[#111] transition-colors ${focusRing}`}>
                    Get fare <ArrowUpRight size={15} aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-10 text-center text-[15px] font-semibold text-white/80">Explore available routes and book your preferred cab with Abhi Cabs 24×7.</p>
      </div>
    </section>
  );
}

/* ═══ CAB BOOKING FROM 4 STATES — pickup plates converging on one "across India" hub ═══
   Always visible (no entrance hiding). Animated dashes are decorative; reduced motion stops them. */
const PLATES = [
  { code: "KA", name: "Karnataka" }, { code: "AP", name: "Andhra Pradesh" },
  { code: "MH", name: "Maharashtra" }, { code: "TG", name: "Telangana" },
];
const LANE_Y = [12.5, 37.5, 62.5, 87.5]; // plate centres, % of the diagram height

function Plate({ p, on = false, dim = false, onEnter, onLeave, compact = false }) {
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave}
      className={`relative grid grid-cols-[22px_1fr] rounded-[12px] border-[2.5px] border-[#111] overflow-hidden bg-gradient-to-b from-[#FFE27A] to-[#F5C21B] shadow-[0_14px_24px_-14px_rgba(0,0,0,.6),inset_0_2px_0_rgba(255,255,255,.6)] transition-[transform,opacity] duration-300 ${on ? "-translate-y-0.5 lg:translate-x-1.5" : ""} ${dim ? "opacity-45" : "opacity-100"}`}>
      <div className="bg-[#1d4ed8] text-white flex flex-col items-center justify-end pb-1.5 gap-1">
        <span className="w-2.5 h-2.5 rounded-full border border-white/70 grid place-items-center text-[5px]">✦</span>
        <span className="text-[7px] font-black tracking-[0.1em] [writing-mode:vertical-rl] rotate-180">IND</span>
      </div>
      <div className={`relative flex ${compact ? "flex-col items-start gap-1 px-3 py-2.5" : "items-center gap-3 px-3 py-2.5"}`}>
        <span className={`${compact ? "text-[28px]" : "text-[30px] md:text-[34px]"} leading-none font-black tracking-[0.06em] text-[#111]`}>{p.code}</span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[8.5px] font-black tracking-[0.22em] text-[#6b4e00]">PICKUP</span>
          <span className={`block font-extrabold text-[#111] ${compact ? "text-[13px]" : "text-[13.5px] truncate"}`}>{p.name}</span>
        </span>
        <span className="ac-plate-shine absolute inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Hub() {
  return (
    <div className="relative grid place-items-center">
      <span aria-hidden className="sv-ping absolute inset-0 rounded-full border-2 border-[#111]/40" />
      <span aria-hidden className="sv-ping absolute inset-0 rounded-full border-2 border-[#111]/40 [animation-delay:1.2s]" />
      <div className="relative grid place-items-center text-center w-[168px] h-[168px] md:w-[188px] md:h-[188px] rounded-full bg-[#111] text-white shadow-[0_30px_50px_-24px_rgba(0,0,0,.7)]">
        <div className="px-4">
          <span className="block text-[10.5px] font-black tracking-[0.26em] text-[#FFD54F]">DROP</span>
          <span className="block mt-1.5 text-[17px] md:text-[19px] font-black leading-tight">Destinations across India</span>
          <span aria-hidden className="ac-drop-arrow inline-block mt-1.5 text-[#FFD54F] text-[20px] font-black">→</span>
        </div>
      </div>
    </div>
  );
}

function StatesBand() {
  const [hover, setHover] = useState(null);
  return (
    <section className="sv-states relative overflow-hidden isolate bg-[#FFD54F] py-16 md:py-24">
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[.07]" style={{ backgroundImage: "repeating-linear-gradient(135deg,#111 0 2px,transparent 2px 22px)" }} />
      <div aria-hidden className="absolute -z-10 -right-40 -bottom-40 w-[560px] h-[560px] rounded-full bg-white/25 blur-3xl" />
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] gap-12 lg:gap-14 items-center">
        <div>
          <span aria-hidden className="block h-[3px] w-14 mb-5 rounded-full bg-[#111]" />
          <h2 className={`${H2} text-[#111]`}>Cab Booking from Karnataka, Andhra Pradesh, Maharashtra & Telangana</h2>
          <h3 className={`${H3SUB} text-[#5C4300]`}>Travel from Supported Pickup Locations to Destinations Across India</h3>
          <p className="mt-5 text-[15.5px] md:text-[16.5px] text-[#111]/80 leading-[1.8] max-w-[600px]">
            Abhi Cabs 24×7 provides <strong className="font-extrabold text-[#111]">interstate cab booking services</strong> with pickups from <strong className="font-extrabold text-[#111]">Karnataka, Andhra Pradesh, Maharashtra, and Telangana</strong> to destinations across India. Whether you need an airport transfer, local taxi, hourly rental, or outstation cab, choose a travel service that matches your requirements.
          </p>
        </div>

        {/* desktop: plates → curved lanes → hub */}
        <div aria-hidden className="hidden lg:block relative h-[400px]">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 overflow-visible" style={{ width: "100%", height: "100%", maxWidth: "none" }}>
            {LANE_Y.map((y, i) => {
              const d = `M44,${y} C60,${y} 60,50 72,50`;
              const on = hover === i, dim = hover !== null && !on;
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="#111" strokeOpacity={dim ? 0.12 : 0.22} strokeWidth="6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                  <path d={d} fill="none" stroke="#111" strokeWidth={on ? 3.5 : 2} vectorEffect="non-scaling-stroke" strokeLinecap="round"
                    strokeDasharray={on ? "0" : "7 9"} className={on ? "" : "sv-flow"} opacity={dim ? 0.25 : 1} style={{ transition: "opacity .3s, stroke-width .3s" }} />
                </g>
              );
            })}
          </svg>
          <ul className="absolute left-0 top-0 bottom-0 w-[44%] grid grid-rows-4 gap-3 items-center">
            {PLATES.map((p, i) => (
              <li key={p.code}><Plate p={p} on={hover === i} dim={hover !== null && hover !== i} onEnter={() => setHover(i)} onLeave={() => setHover(null)} /></li>
            ))}
          </ul>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[28%] min-w-[188px] grid place-items-center"><Hub /></div>
        </div>

        {/* mobile / tablet: plates grid → arrow → hub */}
        <div aria-hidden className="lg:hidden">
          <ul className="grid grid-cols-2 gap-3">
            {PLATES.map((p) => <li key={p.code}><Plate p={p} compact /></li>)}
          </ul>
          <div className="flex justify-center py-3"><span className="sv-flow-v block w-[3px] h-14 rounded-full" /></div>
          <div className="flex justify-center"><Hub /></div>
        </div>
      </div>
    </section>
  );
}

/* ═══ BEFORE BOOKING — interactive checklist ═══ */
function BeforeBooking() {
  const [done, setDone] = useState(() => new Set());
  const toggle = (i) => setDone((d) => { const n = new Set(d); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const pct = (done.size / BOOKING_INFO.length) * 100; const all = done.size === BOOKING_INFO.length;
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[760px] mx-auto">
          <h2 className={H2}>Important Information Before Booking Your Cab</h2>
          <h3 className={`${H3SUB} text-[#7A5D00]`}>Plan Your Journey with Confidence</h3>
          <p className="mt-3 text-[15.5px] text-text-secondary">Before booking your ride with <span className="ac-hl">Abhi Cabs 24×7</span>, consider the following details:</p>
        </div>
        <div className="mt-10 max-w-[980px] mx-auto rounded-[28px] bg-[#FAF7EE] border border-[#EFE8D4] p-5 sm:p-7">
          <div className="flex items-center justify-between text-[13.5px] font-bold" aria-live="polite">
            <span className="tabular-nums">{done.size} of {BOOKING_INFO.length} checked</span>
            {all && <span className="text-[#15803D]">Ready to book</span>}
          </div>
          <div className="mt-2.5 h-2 rounded-full bg-[#EAE3CC] overflow-hidden"><div className={`h-full rounded-full transition-[width,background-color] duration-500 motion-reduce:transition-none ${all ? "bg-[#22C55E]" : "bg-[#FFD54F]"}`} style={{ width: `${pct}%` }} /></div>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {BOOKING_INFO.map((b, i) => {
              const on = done.has(i);
              return (
                <li key={b.label} onClick={() => toggle(i)}
                  className={`cursor-pointer flex gap-3.5 items-start rounded-[18px] p-4 border-2 transition-colors ${on ? "bg-[#111] border-[#111] text-white" : "bg-white border-[#EFE8D4] hover:border-[#111]"}`}>
                  <button type="button" role="checkbox" aria-checked={on} aria-labelledby={`bi-${i}`} onClick={(e) => { e.stopPropagation(); toggle(i); }}
                    className={`mt-0.5 grid place-items-center w-6 h-6 shrink-0 rounded-md border-2 ${focusRing} ${on ? "bg-[#FFD54F] border-[#FFD54F] text-[#111]" : "border-[#C9C2AA] bg-white"}`}>
                    {on && <Check size={14} strokeWidth={3.2} aria-hidden />}
                  </button>
                  <div>
                    <h4 id={`bi-${i}`} className="text-[15px] font-extrabold">{b.label}</h4>
                    <p className={`mt-1 text-[13.5px] leading-relaxed ${on ? "text-white/70" : "text-text-secondary"}`}>{b.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ═══ HOW TO BOOK — step track ═══ */
function HowToBook({ onBook }) {
  return (
    <section className="bg-[#FAF7EE] py-16 md:py-24">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="text-center max-w-[760px] mx-auto">
          <h2 className={H2}>How to Book a Cab with Abhi Cabs 24×7</h2>
          <h3 className={`${H3SUB} text-[#7A5D00]`}>Book Your Journey in Three Simple Steps</h3>
        </div>
        <ol className="relative mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          <span aria-hidden className="hidden md:block absolute left-[16%] right-[16%] top-[38px] border-t-2 border-dashed border-[#D9CDA6]" />
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative text-center flex flex-col items-center">
              <span className="relative grid place-items-center w-[76px] h-[76px] rounded-full bg-[#111] text-[#FFD54F] text-[30px] font-black ring-8 ring-[#FAF7EE]">{i + 1}</span>
              <h4 className="mt-6 text-[18px] font-extrabold tracking-[-0.02em] max-w-[300px]">{s.title}</h4>
              <p className="mt-2 text-[14.5px] text-text-secondary leading-relaxed max-w-[320px]">{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <button type="button" onClick={() => onBook("one-way")} className={`inline-flex items-center gap-2 h-14 px-8 rounded-full bg-[#111] text-white font-extrabold text-[15.5px] hover:bg-black transition-colors ${focusRing}`}>
            Check Available Cabs <ArrowRight size={17} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══ FAQ — searchable ═══ */
function Faqs() {
  const [q, setQ] = useState(""); const [open, setOpen] = useState(0);
  const list = useMemo(() => { const t = q.trim().toLowerCase(); return t ? FAQS.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(t)) : FAQS; }, [q]);
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-5 sm:px-6">
        <h2 className={`${H2} text-center`}>Frequently Asked Questions About Our Cab Services</h2>
        <label className="relative block mt-10">
          <span className="sr-only">Search the questions</span>
          <Search size={19} aria-hidden className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setOpen(0); }} placeholder="Search questions, e.g. one-way, airport, group"
            className="w-full h-14 rounded-full border-2 border-[#EAEAEA] bg-white pr-5 text-[15px] font-medium outline-none focus:border-[#FFD54F]" style={{ paddingLeft: 52 }} />
        </label>
        <p className="mt-3 text-center text-[13px] text-text-secondary" aria-live="polite">{q.trim() ? `${list.length} of ${FAQS.length} questions` : `${FAQS.length} questions`}</p>
        <div className="mt-5 space-y-3">
          {list.map((f, i) => {
            const on = open === i;
            return (
              <div key={f.q} className={`rounded-[18px] border transition-colors ${on ? "bg-[#FFFBEA] border-[#F2E6C9]" : "bg-[#FAFAFA] border-[#EFEFEF]"}`}>
                <h3>
                  <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className={`w-full flex items-center justify-between gap-4 text-left px-5 py-4 text-[15px] font-bold rounded-[18px] ${focusRing}`}>
                    {f.q}<ChevronDown size={20} aria-hidden className={`shrink-0 transition-transform duration-300 ${on ? "rotate-180 text-[#B88A00]" : ""}`} />
                  </button>
                </h3>
                <div className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-5 text-[14.5px] text-text-secondary leading-relaxed">{f.a}</p></div>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <p className="rounded-[18px] bg-[#FAFAFA] border border-[#EFEFEF] px-6 py-8 text-center text-[15px]">No questions match “{q}”.</p>}
        </div>
      </div>
    </section>
  );
}
