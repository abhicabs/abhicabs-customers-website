import React, { useEffect, useState } from "react";
import {
  Car, Plane, Navigation, ShieldCheck, Users, Headset, CalendarCheck,
  Sparkles, Route, Timer, UserCheck, Repeat, Truck, Star, ArrowUpRight,
} from "lucide-react";
import CTASection from "../../src/components/CTASection";

/* The booking form lives in the home-page hero (id="booking"); this page has none. */
const BOOKING_HREF = "/#booking";

/** Rotating phrase. Server/first render shows the first phrase; rotation starts after mount and never for reduced motion. */
function TextSwap({ texts, interval = 2800 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setIndex((p) => (p + 1) % texts.length), interval);
    return () => clearInterval(t);
  }, [texts.length, interval]);
  return (
    <span className="ab-swap" aria-live="off">
      {texts.map((t, i) => (
        <span key={t} aria-hidden={i !== index} className={`ab-swap-item ${i === index ? "ab-swap-on" : ""}`}>{t}</span>
      ))}
    </span>
  );
}

/** Yellow marker highlight for key phrases. */
const Mark = ({ children }) => (
  <span className="bg-[linear-gradient(transparent_58%,#FFD54F_58%,#FFD54F_92%,transparent_92%)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-0.5">{children}</span>
);

const SERVICES = [
  { Icon: Plane, label: "Airport Transfers", desc: "Convenient airport pickup and drop-off services." },
  { Icon: Navigation, label: "Outstation Cabs", desc: "Comfortable intercity and interstate cab bookings." },
  { Icon: Car, label: "Local Taxi Services", desc: "Convenient taxi services for city travel and sightseeing." },
  { Icon: Repeat, label: "Round-Trip Cabs", desc: "Flexible round-trip taxi bookings for business, leisure, and family travel." },
  { Icon: Timer, label: "Hourly Cab Rentals", desc: "Flexible hourly taxi rental services for meetings, shopping, sightseeing, and personal travel." },
  { Icon: UserCheck, label: "Driver Services", desc: "Professional driving assistance for your journeys." },
  { Icon: Users, label: "Group Travel", desc: "Spacious vehicle options for families and large groups." },
];

const WHY_CHOOSE = [
  { Icon: ShieldCheck, title: "Safe & Secure Journeys", desc: "Travel with confidence, comfort, and peace of mind." },
  { Icon: UserCheck, title: "Verified & Experienced Drivers", desc: "Skilled, verified drivers focused on passenger safety and comfort." },
  { Icon: Sparkles, title: "Hassle-Free Travel Experience", desc: "Enjoy convenient cab booking and smooth journeys." },
  { Icon: Headset, title: "24×7 Booking Assistance", desc: "Get support for your travel needs anytime." },
  { Icon: Timer, title: "Flexible Cab Rental Options", desc: "Choose from local cabs, hourly rentals, airport transfers, and outstation trips." },
  { Icon: Route, title: "Round-Trip & Interstate Travel", desc: "Convenient cab services for short and long-distance journeys." },
  { Icon: Truck, title: "Vehicles for Every Need", desc: "Choose from 4-seater to 50-seater vehicles for personal and group travel." },
  { Icon: CalendarCheck, title: "Easy Online Cab Booking", desc: "Book your preferred cab quickly and conveniently." },
];

const STATES = ["Karnataka", "Andhra Pradesh", "Maharashtra", "Telangana"];

/** Card whose soft yellow glow follows the cursor. */
function SpotlightCard({ Icon, title, desc, n }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <li onMouseMove={move}
      className="group relative overflow-hidden rounded-[24px] bg-white border border-[#ECE6D3] p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-[#E6C766] hover:shadow-[0_28px_60px_-34px_rgba(0,0,0,.45)] motion-reduce:transition-none">
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(260px circle at var(--x, 50%) var(--y, 50%), rgba(255,213,79,.38), transparent 70%)" }} />
      <span className="relative flex items-start justify-between">
        <span className="grid place-items-center w-14 h-14 rounded-2xl bg-[#111] text-[#FFD54F] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transition-none"><Icon size={24} aria-hidden /></span>
        <span className="text-[12.5px] font-black tabular-nums text-black/25">{String(n).padStart(2, "0")}</span>
      </span>
      <h3 className="relative mt-8 text-[18px] font-extrabold tracking-[-0.02em] leading-snug">{title}</h3>
      <p className="relative mt-2 text-[14px] text-text-secondary leading-relaxed">{desc}</p>
    </li>
  );
}

export default function Page() {
  return (
    <>
      <style>{`
        @keyframes abUp { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
        @keyframes abCar { from { opacity: 0; transform: translateX(120px) scale(.94); } to { opacity: 1; transform: none; } }
        @keyframes abSpin { to { transform: rotate(360deg); } }
        @keyframes abMq { to { transform: translateX(-100%); } }
        .ab-in > * { animation: abUp .6s cubic-bezier(.22,1,.36,1) both; }
        .ab-in > *:nth-child(2) { animation-delay: .08s } .ab-in > *:nth-child(3) { animation-delay: .16s }
        .ab-in > *:nth-child(4) { animation-delay: .24s } .ab-in > *:nth-child(5) { animation-delay: .32s }
        .ab-car { animation: abCar 1.3s cubic-bezier(.16,1,.3,1) .15s both; }
        .ab-ring { animation: abSpin 40s linear infinite; }
        .ab-mq { animation: abMq 36s linear infinite; } .ab-mq-rev { animation-direction: reverse; }
        .ab-swap { display: inline-grid; vertical-align: bottom; }
        .ab-swap-item { grid-area: 1/1; transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .55s; transform: translateY(70%); opacity: 0; white-space: nowrap; }
        .ab-swap-on { transform: none; opacity: 1; }
        @supports (animation-timeline: view()) {
          @keyframes abGrow { from { transform: scale(.9); border-radius: 48px; } to { transform: scale(1); border-radius: 28px; } }
          .ab-grow { animation: abGrow linear both; animation-timeline: view(); animation-range: entry 0% cover 45%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ab-in > *, .ab-car, .ab-ring, .ab-mq, .ab-grow { animation: none !important; }
          .ab-swap-item { transition: none; }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-[#FAF7EE] border-b border-[#EFE8D4]">
        <div aria-hidden className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(rgba(17,17,17,.07) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
        <div className="relative max-w-[1264px] mx-auto px-5 sm:px-6 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 items-center">
          <div className="ab-in max-w-[620px]">
            <h1 className="text-[38px] sm:text-[50px] lg:text-[60px] font-black tracking-[-0.045em] leading-[1.02] text-[#111]">
              About Abhi Cabs 24×7 –{" "}
              <span className="block mt-1 text-[#111] bg-[linear-gradient(transparent_58%,#FFD54F_58%,#FFD54F_94%,transparent_94%)] w-fit pr-1">
                <TextSwap texts={["Reliable Cab Booking.", "Smarter Travel.", "Better Service."]} />
              </span>
            </h1>
            <p className="mt-5 text-[18px] md:text-[21px] font-extrabold text-[#334155]">Your Trusted Travel Partner for Every Journey</p>
            <p className="mt-4 text-[15.5px] md:text-[16.5px] text-[#3F3F46] leading-[1.75]">
              Welcome to <strong className="text-[#111] font-bold">Abhi Cabs 24×7</strong>, your trusted travel partner for comfortable, convenient, and hassle-free journeys. We provide{" "}
              <strong className="text-[#111] font-bold">online cab booking, airport taxi services, local cabs, outstation cab bookings, round-trip taxi services, hourly cab rentals, and driver services</strong>.
              With pickups from <strong className="text-[#111] font-bold">Karnataka, Andhra Pradesh, Maharashtra, and Telangana</strong>, we make travelling to destinations across India simple and convenient.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5">
              <a href={BOOKING_HREF} className="group inline-flex items-center gap-2.5 h-14 pl-7 pr-2 rounded-full bg-[#111] text-white font-bold text-[15.5px] hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00]">
                <CalendarCheck size={18} aria-hidden /> Book a Taxi
                <span className="ml-2 grid place-items-center w-10 h-10 rounded-full bg-[#FFD54F] text-[#111] transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={18} aria-hidden /></span>
              </a>
              <div className="flex items-center gap-2">
                <span className="flex gap-0.5" aria-hidden>{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="#E6AC00" color="#E6AC00" />)}</span>
                <span className="text-[13.5px] font-bold text-[#475569]">5-Star Rated Ride Experience</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[420px]">
            <div aria-hidden className="absolute w-[78%] aspect-square rounded-full bg-[#FFD54F]" />
            <svg aria-hidden viewBox="0 0 200 200" className="ab-ring absolute w-[94%] aspect-square text-[#111]/25"><circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 7" /></svg>
            <img src="/images/aboutus.webp" alt="Abhi Cabs premium sedan" fetchPriority="high" width="1536" height="1024"
              className="ab-car relative w-[112%] max-w-none sm:w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.35)]" />
          </div>
        </div>
      </section>

      {/* ═══ WHO WE ARE ═══ */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6 lg:gap-16 items-start">
            <div>
              <h2 className="text-[44px] md:text-[64px] font-black tracking-[-0.05em] leading-[.95]">Who We Are</h2>
              <h3 className="mt-4 text-[18px] md:text-[22px] font-extrabold text-[#7A5D00] leading-snug max-w-[360px]">Making Every Journey Comfortable &amp; Convenient</h3>
            </div>
            <p className="text-[20px] md:text-[26px] font-semibold text-[#27272A] leading-[1.5] tracking-[-0.01em]">
              At Abhi Cabs 24×7, we offer reliable <Mark>taxi booking services</Mark> for individuals, families, businesses, and groups. From short city rides and <Mark>hourly cab rentals</Mark> to long-distance outstation trips, our vehicle options ranging from <Mark>4-seaters to 50-seaters</Mark> help you find the right travel solution for every journey.
            </p>
          </div>
          <img src="/images/who-we-are-fleet.webp" alt="Abhi Cabs vehicles — 4 Seater, 7 Seater, 14 Seater and 50 Seater vehicles" loading="lazy" width="1536" height="1024"
            className="ab-grow mt-12 md:mt-16 w-full aspect-[16/9] md:aspect-[21/9] object-cover object-[50%_62%] rounded-[28px] shadow-[0_40px_80px_-50px_rgba(0,0,0,.6)]" />
        </div>
      </section>

      {/* ═══ OUR CAB SERVICES ═══ */}
      <section id="services" className="bg-[#111] text-white py-16 md:py-24">
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[34px] md:text-[52px] font-black tracking-[-0.04em] leading-[1]">Our Cab Services</h2>
            </div>
            <p className="text-[17px] md:text-[20px] font-bold text-white/65">Flexible Travel Solutions for Every Need</p>
          </div>
          <ul className="mt-12 border-t border-white/15">
            {SERVICES.map(({ Icon, label, desc }, i) => (
              <li key={label} className="group relative overflow-hidden border-b border-white/12 isolate">
                <span aria-hidden className="absolute inset-0 -z-10 bg-[#FFD54F] origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 motion-reduce:transition-none" />
                <div className="grid grid-cols-[40px_minmax(0,1fr)] md:grid-cols-[64px_56px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-4 md:gap-x-6 gap-y-1 py-6 md:py-7 px-1 md:px-4 transition-colors duration-300 group-hover:text-[#111]">
                  <span className="text-[13px] md:text-[14px] font-black tabular-nums text-white/35 group-hover:text-[#111]/45 transition-colors">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hidden md:grid place-items-center w-12 h-12 rounded-full border-2 border-white/20 group-hover:border-[#111] group-hover:bg-[#111] group-hover:text-[#FFD54F] transition-colors"><Icon size={21} aria-hidden /></span>
                  <h3 className="text-[22px] md:text-[32px] font-black tracking-[-0.03em] leading-tight transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transition-none">{label}</h3>
                  <p className="col-start-2 md:col-start-auto text-[14.5px] md:text-[15px] text-white/65 group-hover:text-[#111]/75 leading-relaxed transition-colors">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═══ WHY CHOOSE ═══ */}
      <section className="bg-[#FAF7EE] py-16 md:py-24">
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
          <div className="text-center max-w-[760px] mx-auto">
            <h2 className="text-[34px] md:text-[52px] font-black tracking-[-0.04em] leading-[1]">Why Choose Abhi Cabs 24×7?</h2>
            <p className="mt-4 text-[17px] md:text-[20px] font-bold text-text-secondary">Safe, Comfortable &amp; Hassle-Free Travel Across India</p>
          </div>
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_CHOOSE.map((w, i) => <SpotlightCard key={w.title} {...w} n={i + 1} />)}
          </ul>
        </div>
      </section>

      {/* ═══ 4 STATES ═══ */}
      <section className="ac-states bg-[#FFD54F] py-16 md:py-24 overflow-hidden">
        <div aria-hidden className="select-none -rotate-2 scale-[1.03]">
          {[false, true].map((rev) => (
            <div key={String(rev)} className="flex overflow-hidden whitespace-nowrap py-1">
              {[0, 1].map((k) => (
                <div key={k} className={`ab-mq ${rev ? "ab-mq-rev" : ""} flex shrink-0 text-[44px] md:text-[86px] font-black tracking-[-0.04em] leading-none`}>
                  {STATES.map((s) => (
                    <span key={s} className="flex items-center gap-8 md:gap-12 pr-8 md:pr-12">
                      <span className={rev ? "text-transparent [-webkit-text-stroke:2px_#111]" : "text-[#111]"}>{s}</span>
                      <span className="text-[#111]/30">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6 mt-12 md:mt-16">
          <div className="max-w-[860px] mx-auto text-center">
            <h2 className="text-[28px] md:text-[42px] font-black tracking-[-0.035em] leading-[1.08] [text-wrap:balance] text-[#111]">
              Cab Booking Services from Karnataka, Andhra Pradesh, Maharashtra &amp; Telangana
            </h2>
            <h3 className="mt-4 inline-block rounded-full bg-[#111] text-[#FFD54F] px-5 py-2 text-[15px] md:text-[17px] font-extrabold">Travel from Your City to Destinations Across India</h3>
            <p className="mt-6 text-[16px] md:text-[17px] text-[#111]/80 leading-[1.8]">
              Abhi Cabs 24×7 offers <strong className="text-[#111]">Pan-India taxi services</strong>, with pickups from <strong className="text-[#111]">Karnataka, Andhra Pradesh, Maharashtra, and Telangana</strong>. Whether you're planning an airport transfer, local journey, hourly cab rental, outstation trip, or round-trip booking, we provide convenient travel options to destinations across India.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <CTASection
        id="book-now"
        onBookMode={() => { if (typeof window !== "undefined") window.location.href = BOOKING_HREF; }}
        line1="Book Your Cab Online"
        line2="with Abhi Cabs 24×7"
        description="Your Journey, Our Priority. Planning your next trip? Choose Abhi Cabs 24×7 for reliable airport transfers, local taxi services, hourly cab rentals, outstation cabs, and round-trip bookings. Book your preferred vehicle and enjoy a convenient travel experience."
        primaryLabel="Book Your Ride Now"
        secondary={false}
      />
    </>
  );
}
