import React from "react";
import {
  ArrowRight, BusFront, CalendarDays, Car, CarFront, Caravan, CheckCircle2, MapPin, Receipt, Repeat, Route, Users, Wallet,
} from "lucide-react";
import Button from "../../ui/Button";
import { Band, Head, renderInline, splitLabel } from "../bangalore/shared";

/**
 * Sections for /services/corporate-car-rental, in the same visual language as the other
 * service pages (Band/Head sections, numbered cards, alternating backgrounds).
 * Every word comes from the page content (serviceDefaults.corporate or the CMS copy);
 * headings keep the brief's H2/H3 levels.
 */

export const ENQUIRY_ANCHOR = "#corporate-enquiry";
const paras = (v) => [].concat(v || []);
// Long CTA labels wrap on phones instead of running off the screen.
const WRAP = "max-w-full max-sm:whitespace-normal max-sm:h-auto max-sm:min-h-14 max-sm:py-3.5 max-sm:leading-snug max-sm:text-center";

function EnquiryButton({ children, variant, className = "" }) {
  return children ? <Button href={ENQUIRY_ANCHOR} size="lg" variant={variant} className={`${WRAP} ${className}`.trim()}>{children}</Button> : null;
}

/* ════════════ Lead — the opening paragraphs under the hero's H2 ════════════ */

export function LeadIntro({ data }) {
  const [first, ...rest] = paras(data.body);
  return (
    <Band id="overview" bg="bg-white" className="!py-14 md:!py-20">
      <div className="max-w-[900px] mx-auto text-center">
        {first && <p className="text-[18px] md:text-[21px] leading-[1.7] text-text">{renderInline(first)}</p>}
        {rest.map((p, i) => <p key={i} className="mt-5 text-[15.5px] md:text-[16.5px] leading-[1.8] text-text-secondary">{renderInline(p)}</p>)}
        {data.ctaLabel && <div className="mt-8"><EnquiryButton>{data.ctaLabel}</EnquiryButton></div>}
      </div>
    </Band>
  );
}

/* ════════════ Services — photo cards (7th card runs full width) ════════════ */

const PHOTOS = [
  [/employee/i, "/images/corporate.webp"],
  [/executive/i, "/images/bussiness.webp"],
  [/airport/i, "/images/airport.webp"],
  [/monthly/i, "/images/hero-local-chauffeur-900.webp"],
  [/outstation/i, "/images/hero-hill-road-900.webp"],
  [/event|group/i, "/images/grouptravel.webp"],
  [/./, "/images/dashboard-pov.jpg"],
];
const photoFor = (h) => PHOTOS.find(([re]) => re.test(h))[1];

export function ServiceCards({ data }) {
  const items = data.items || [];
  return (
    <Band id="services" bg="bg-bg">
      <Head id="services" center eyebrow={data.eyebrow} title={data.heading} intro={data.body} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it, i) => {
          const wide = i === items.length - 1 && items.length % 3 === 1; // a lone last card spans the row
          return (
            <li key={it.heading}
              className={`group flex flex-col rounded-[24px] bg-white border border-border overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,.45)] ${wide ? "sm:col-span-2 lg:col-span-3 lg:flex-row" : ""}`}>
              <div className={`relative overflow-hidden ${wide ? "aspect-[16/10] lg:aspect-auto lg:w-[42%] lg:min-h-[280px]" : "aspect-[16/10]"}`}>
                <img src={photoFor(it.heading)} alt="" loading="lazy" decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[12px] font-black tabular-nums text-text">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className={`flex-1 flex flex-col p-6 ${wide ? "lg:p-9 lg:justify-center" : ""}`}>
                <h3 className="text-[19px] font-extrabold tracking-[-0.02em] leading-snug">{it.heading}</h3>
                {paras(it.body).map((p, j) => <p key={j} className="mt-2 text-[14.5px] text-text-secondary leading-[1.7]">{renderInline(p)}</p>)}
              </div>
            </li>
          );
        })}
      </ul>
      {data.ctaLabel && <div className="mt-10 text-center"><EnquiryButton>{data.ctaLabel}</EnquiryButton></div>}
    </Band>
  );
}

/* ════════════ Monthly & contract plans — dark band with numbered cards ════════════ */

export function MonthlyPlans({ data }) {
  const points = (data.points || []).map(splitLabel);
  return (
    <Band id="monthly" bg="bg-[#0E0E0E]" className="[&_strong]:text-white">
      <Head id="monthly" center light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {points.map(([label, desc], i) => (
          <li key={label || desc} className="relative rounded-[22px] border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-primary/60 hover:bg-white/[0.07]">
            <span className="text-[13px] font-black tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
            {label && <p className="mt-2 text-[18px] font-extrabold text-white leading-snug">{label}</p>}
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/70">{renderInline(desc)}</p>
          </li>
        ))}
      </ul>
      {(data.links || []).map((l, i) => <p key={i} className="mt-9 max-w-[720px] mx-auto text-center text-[15.5px] leading-relaxed text-white/75">{renderInline(l)}</p>)}
      {data.cta?.label && <div className="mt-8 text-center"><EnquiryButton variant="inverse">{data.cta.label}</EnquiryButton></div>}
    </Band>
  );
}

/* ════════════ Vehicles — fleet photo + vehicle cards ════════════ */

const vehicleIcon = (t = "") => (/sedan/i.test(t) ? Car : /suv|muv/i.test(t) ? CarFront : /tempo/i.test(t) ? Caravan : BusFront);

export function VehicleCards({ data }) {
  const cards = data.cards || [];
  return (
    <Band id="vehicles" bg="bg-white">
      <Head id="vehicles" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
      <div className="mt-12 relative overflow-hidden rounded-[28px] aspect-[16/7] bg-[#1a1a1a]">
        <img src="/images/hero-fleet-hills-900.webp" alt="Abhi Cabs 24×7 sedan, SUV and group vehicles" loading="lazy" decoding="async"
          className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 70%" }} />
      </div>
      <ul className="-mt-10 md:-mt-14 relative z-[1] mx-2 sm:mx-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((cd, i) => {
          const Icon = vehicleIcon(cd.title);
          return (
            <li key={cd.title} className="group rounded-[22px] bg-white border border-border p-6 shadow-[0_24px_50px_-34px_rgba(0,0,0,.5)] transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none">
              <div className="flex items-center justify-between">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-[#111] text-[#FFD54F]"><Icon size={23} aria-hidden /></span>
                <span className="text-[12px] font-black tabular-nums text-[#C99A1A]">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-5 text-[17px] font-extrabold leading-snug">{cd.title}</h3>
              {paras(cd.body).map((p, j) => <p key={j} className="mt-2 text-[14px] text-text-secondary leading-relaxed">{renderInline(p)}</p>)}
            </li>
          );
        })}
      </ul>
      <div className="mt-9 flex flex-col items-center gap-3 text-center">
        {data.note && <p className="text-[13.5px] text-text-secondary max-w-[720px]">{renderInline(data.note)}</p>}
        {(data.links || []).map((l, i) => <p key={i} className="text-[14.5px]">{renderInline(l)}</p>)}
        {data.cta?.label && (
          <div className="mt-2">
            {data.cta.href
              ? <Button href={data.cta.href} variant="outline" size="lg" className={WRAP}>{data.cta.label}</Button>
              : <EnquiryButton variant="outline">{data.cta.label}</EnquiryButton>}
          </div>
        )}
      </div>
    </Band>
  );
}

/* ════════════ Cities — location cards; the "other locations" card spans the row ════════════ */

export function CityCards({ data }) {
  const cards = data.cards || [];
  return (
    <Band id="cities" bg="bg-bg">
      <Head id="cities" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((cd, i) => {
          const wide = i === cards.length - 1 && cards.length % 2 === 1;
          return (
            <li key={cd.title}
              className={`flex gap-4 rounded-[22px] p-6 md:p-7 ${wide ? "md:col-span-2 bg-[#111] text-white [&_strong]:text-white" : "bg-white border border-border"}`}>
              <span className={`shrink-0 grid place-items-center w-11 h-11 rounded-full ${wide ? "bg-primary text-text" : "bg-primary-tint text-[#B88A00]"}`}><MapPin size={20} aria-hidden /></span>
              <div className="min-w-0">
                <h3 className="text-[18px] font-extrabold leading-snug">{cd.title}</h3>
                {paras(cd.body).map((p, j) => <p key={j} className={`mt-2 text-[14.5px] leading-relaxed ${wide ? "text-white/75" : "text-text-secondary"}`}>{renderInline(p)}</p>)}
              </div>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}

/* ════════════ Pricing & billing — intro beside a "quote sheet" of cost factors ════════════ */

const FACTOR_ICONS = [[/vehicle/i, Car], [/frequency/i, Repeat], [/duration/i, CalendarDays], [/distance/i, Route], [/employee|passenger/i, Users], [/charge/i, Receipt], [/billing/i, Wallet]];
const factorIcon = (t = "") => (FACTOR_ICONS.find(([re]) => re.test(t)) || [null, CheckCircle2])[1];

export function PricingSheet({ data }) {
  const [lead, ...listIntro] = paras(data.intro);
  const points = (data.points || []).map(splitLabel);
  return (
    <Band id="pricing" bg="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-14 items-start">
        <div className="lg:sticky lg:top-28">
          <Head id="pricing" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={lead ? [lead] : []} />
        </div>
        <div className="rounded-[26px] bg-[#F6F4EE] p-6 sm:p-8">
          {listIntro.map((p, i) => <p key={i} className="text-[15px] font-bold text-text">{renderInline(p)}</p>)}
          <ul className="mt-4 divide-y divide-dashed divide-[#D9D3C2]">
            {points.map(([label, desc]) => {
              const Icon = factorIcon(label);
              return (
                <li key={label || desc} className="flex items-start gap-4 py-4">
                  <span className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-white text-[#B88A00] border border-border"><Icon size={19} aria-hidden /></span>
                  <p className="text-[14.5px] leading-relaxed">
                    {label && <strong className="font-bold text-text">{label}:</strong>} <span className="text-text-secondary">{renderInline(desc)}</span>
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="mt-10 max-w-[780px] mx-auto text-center">
        {(data.links || []).map((l, i) => <p key={i} className="mt-2 text-[15.5px] leading-relaxed text-text-secondary">{renderInline(l)}</p>)}
        {data.cta?.label && <div className="mt-7"><EnquiryButton>{data.cta.label}</EnquiryButton></div>}
      </div>
    </Band>
  );
}

/* ════════════ Considerations — numbered checklist ════════════ */

export function ConsiderList({ data }) {
  const points = (data.points || []).map(splitLabel);
  return (
    <Band id="considerations" bg="bg-bg">
      <Head id="considerations" center eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
      <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 max-w-[1040px] mx-auto">
        {points.map(([label, desc], i) => (
          <li key={label || desc} className="flex items-start gap-4 rounded-[20px] bg-white border border-border p-5">
            <span className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-primary text-text text-[13px] font-black tabular-nums">{i + 1}</span>
            <p className="text-[14.5px] leading-relaxed pt-1.5">
              {label && <strong className="font-bold text-text">{label}:</strong>} <span className="text-text-secondary">{renderInline(desc)}</span>
            </p>
          </li>
        ))}
      </ol>
      {(data.links || []).map((l, i) => (
        <p key={i} className="mt-9 max-w-[720px] mx-auto text-center text-[15.5px] leading-relaxed text-text-secondary flex items-start justify-center gap-2">
          <ArrowRight size={18} aria-hidden className="shrink-0 mt-1 text-[#B88A00]" /><span>{renderInline(l)}</span>
        </p>
      ))}
    </Band>
  );
}
