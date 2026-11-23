import React, { useState } from "react";
import { Briefcase, Building2, Navigation, Route, Users } from "lucide-react";
import Button from "../../ui/Button";
import CtaBand from "../../CtaBand";
import ServiceBooking, { scrollToBooking } from "../../ServiceBooking";
import ServiceInterlink from "../../ServiceInterlink";
import { HowSection } from "../bangalore/TrustSections";
import { BenefitRows, FaqSearch, FleetShowcase, TipStack } from "../local/LocalSections";
import { Band, Head, renderInline } from "../bangalore/shared";
import { TripTypeSwitcher, RouteBoard } from "./OutstationSections";
import { ROUTES as HOME_ROUTES } from "../../../data/mockData";

/**
 * One Way Cabs page (/one-way-cabs) — the Outstation page's design, filled with the
 * One-Way content from src/content/serviceDefaults.js ("one-way-outstation", or its
 * CMS override). /one-way-cabs now 301-redirects here.
 */
const SERVICE_ICONS = [Navigation, Route, Building2, Briefcase, Users];
const SHORT_TABS = ["Intercity", "Drop Taxi", "Long-Distance", "Business", "Family & Personal"];

// photo / distance / drive time for each route — same data as the home page's popular routes
const routeExtras = (to) => {
  const r = (HOME_ROUTES || []).find((x) => x.to.toLowerCase() === String(to).toLowerCase());
  return r ? { img: r.img, km: r.km, hr: String(r.hrs || "").replace(/\s*hrs?$/i, "").replace(/\s*–\s*/, "–") } : { img: "/images/hero-hill-road.webp", km: "—", hr: "—" };
};

export default function OneWayOutstation({ cfg }) {
  const [booking, setBooking] = useState({ key: "one-way", journey: null });
  const book = (journey) => { setBooking({ key: `b-${Date.now()}`, journey }); scrollToBooking(); };

  const [h1Main, h1Accent] = String(cfg.hero?.heading || "").split(/\s+–\s+/);
  const types = (cfg.intro?.items || []).map((it, i) => ({
    title: it.heading, desc: it.body, short: SHORT_TABS[i], kind: "oneway",
    icon: React.createElement(SERVICE_ICONS[i % SERVICE_ICONS.length], { className: "w-5 h-5", "aria-hidden": true }),
    cta: cfg.primaryLabel,
  }));
  const routes = (cfg.routes || []).map((r) => ({ ...r, ...routeExtras(r.to) }));
  const cta = cfg.cta || {};

  return (
    <>
      {/* ── Hero (Outstation design) ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img fetchPriority="high" src="/images/hero-hill-road.webp" srcSet="/images/hero-hill-road-900.webp 900w, /images/hero-hill-road.webp 1672w" sizes="100vw" alt={cfg.hero?.alt || ""} className="w-full h-full object-cover ac-kenburns" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%" }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
          <div aria-hidden className="ac-hero-glow absolute -left-24 -bottom-24 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle,rgba(255,213,79,.22),transparent 65%)" }} />
          <div aria-hidden className="ac-hero-sweep absolute inset-0" />
        </div>
        <div className="relative max-w-[1264px] mx-auto px-6 py-20 md:py-32">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13.5px] mb-3.5 text-white/60">
            <a href="/" className="font-semibold hover:text-white">Home</a><span>/</span><span>One Way Cabs</span>
          </nav>
          <h1 className="ac-hero-fade-up text-[32px] md:text-[52px] font-bold tracking-tight text-white leading-tight max-w-[1200px]" style={{ textShadow: "0 4px 30px rgba(0,0,0,.45)" }}>
            {h1Main}{h1Accent && <> – <span className="ac-gold-shimmer">{h1Accent}</span></>}
          </h1>
          {cfg.hero?.subheading && <h2 className="ac-hero-fade-up ac-hero-fade-up-delay mt-3 text-[17px] md:text-[21px] font-semibold text-[#FFD54F]">{cfg.hero.subheading}</h2>}
          <div className="ac-hero-fade-up ac-hero-fade-up-delay2 mt-10">
            <ServiceBooking widgetKey={booking.key} initialMode="one-way" presetJourney={booking.journey} />
          </div>
        </div>
      </section>

      {/* ── Services → trip-type switcher ── */}
      {types.length > 0 && <TripTypeSwitcher eyebrow={cfg.intro.eyebrow} title={cfg.intro.heading} types={types} onBook={book} />}

      {/* ── Popular routes → route board ── */}
      {routes.length > 0 && (
        <RouteBoard eyebrow="Popular Routes" title={cfg.routesHeading} sub={cfg.routesSubheading} description={cfg.routesIntro}
          note={cfg.routesNote} ctaLabel={cfg.routesCtaLabel} routes={routes} onBook={book} />
      )}

      {/* ── Vehicles ── */}
      {cfg.pricing && <FleetShowcase data={cfg.pricing} />}

      {/* ── Why choose → benefit rows ── */}
      {cfg.features?.items?.length > 0 && <BenefitRows data={{ eyebrow: "Why Abhi Cabs", heading: cfg.features.heading, subheading: cfg.features.subheading, items: cfg.features.items }} />}

      {/* ── Four states ── */}
      {cfg.coverage && (
        <Band id="coverage" bg="bg-[#FFFBEA]">
          <Head id="coverage" center eyebrow={cfg.coverage.eyebrow} title={cfg.coverage.heading} sub={cfg.coverage.subheading} />
          <div className="mt-6 max-w-[760px] mx-auto text-center space-y-3">
            {(cfg.coverage.body || []).map((p, i) => <p key={i} className="text-[16px] leading-relaxed text-text-secondary">{renderInline(p)}</p>)}
          </div>
        </Band>
      )}

      {/* ── How to book ── */}
      {cfg.how && <HowSection data={{ ...cfg.how, ctaLabel: "Book Now" }} onBook={book} bg="bg-white" />}

      {/* ── Important things to know ── */}
      {cfg.tips && <TipStack data={cfg.tips} onBook={book} ctaLabel={cfg.primaryLabel} />}

      {/* ── FAQs ── */}
      {cfg.faqs?.length > 0 && (
        <FaqSearch heading={cfg.faqHeading || "Frequently Asked Questions"} items={cfg.faqs.map(([q, a]) => ({ q, a: renderInline(a), text: a }))}
          placeholder="Search questions, e.g. tolls, luggage, advance booking" />
      )}

      <ServiceInterlink exclude="/one-way-cabs" title="More Ways to Travel" className="bg-[#FAFAFA] border-y border-border" />

      {/* ── CTA ── */}
      <CtaBand
        image="/images/hero-hill-road.webp"
        title={<>{cta.line1} {cta.line2 && <span className="text-primary">{cta.line2}</span>}</>}
        subheading={cta.subheading}
        description={cta.description}
        actions={<>
          <Button variant="inverse" size="lg" onClick={() => book(null)}>{cta.buttonLabel || cfg.primaryLabel}</Button>
          <Button href="/contact" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
