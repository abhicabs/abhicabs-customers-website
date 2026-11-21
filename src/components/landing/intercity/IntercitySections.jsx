import React from "react";
import { ArrowRight, ArrowUpRight, Repeat } from "lucide-react";
import Button from "../../ui/Button";
import { Band, Head, renderInline } from "../bangalore/shared";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

/* ════════════ Trip services — photo grid: photo, title, full description, action ════════════ */

/** Photo for each service, matched on its heading (images already in /public/images). */
const PHOTOS = [
  [/weekend/i, "/images/weekend.webp"], [/multi-day/i, "/images/hero-fleet-hills-900.webp"], [/family|vacation|holiday/i, "/images/family.webp"],
  [/pilgrim|temple/i, "/images/route-5.webp"], [/corporate|business/i, "/images/corporate.webp"], [/./, "/images/coastal-road-sedan.jpg"],
];
const photoFor = (h) => PHOTOS.find(([re]) => re.test(h))[1];

export function ServicePhotoGrid({ data, onBook }) {
  const items = data.items || [];
  return (
    <Band id="services" bg="bg-white">
      <Head id="services" center eyebrow={data.eyebrow} title={data.heading} intro={data.body} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it, i) => (
          <li key={it.heading} className="group flex flex-col rounded-[24px] bg-[#F6F4EE] overflow-hidden transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(0,0,0,.45)]">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img src={photoFor(it.heading)} alt="" loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none" />
              <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[12px] font-black tabular-nums text-text">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex-1 flex flex-col p-6">
              <h3 className="text-[19px] font-extrabold tracking-[-0.02em] leading-snug">{it.heading}</h3>
              <p className="mt-2 text-[14.5px] text-text-secondary leading-[1.7]">{renderInline(it.body)}</p>
              <button type="button" onClick={() => onBook({ tripType: "round-trip" })}
                className={`mt-auto pt-5 self-start inline-flex items-center gap-2 text-[14.5px] font-extrabold rounded-sm ${focusRing}`}>
                <span className="underline underline-offset-[5px] decoration-2 decoration-primary group-hover:decoration-text transition-colors">Plan this trip</span>
                <span aria-hidden className="grid place-items-center w-8 h-8 rounded-full bg-primary transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"><ArrowRight size={15} /></span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/* ════════════ Popular routes — destination cards with an outbound / return strip ════════════ */

/** Photo per destination (generic road scenes where the project has no photo of the place itself). */
const DEST_PHOTOS = {
  mysore: "/images/route-1.webp", coorg: "/images/route-2.webp", mangalore: "/images/coastal-road-sedan.jpg",
  chennai: "/images/hero-fleet-hills-900.webp", hyderabad: "/images/route-6.webp", goa: "/images/route-3.webp",
};
const destPhoto = (to) => DEST_PHOTOS[to.toLowerCase()] || "/images/weekend.webp";

function Lane({ dir, from, to }) {
  return (
    <div className="flex items-center gap-3 text-[12.5px] font-bold">
      <span className="w-[78px] shrink-0 whitespace-nowrap text-white/45 uppercase tracking-[.06em] text-[11px]">{dir}</span>
      <span className="truncate text-white/80">{from}</span>
      <span aria-hidden className="flex-1 min-w-6 border-t-2 border-dashed border-white/25" />
      <ArrowRight aria-hidden size={14} className="text-primary shrink-0" />
      <span className="truncate text-white/80">{to}</span>
    </div>
  );
}

export function RoundTripRoutes({ heading, subheading, intro, note, ctaLabel, routes, onBook }) {
  if (!routes.length) return null;
  return (
    <Band id="routes" bg="bg-[#111]" className="text-white">
      <Head id="routes" center light eyebrow="Popular Routes" title={heading} sub={subheading} intro={intro ? [intro] : []} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {routes.map((r) => (
          <li key={r.to} className="group flex flex-col rounded-[24px] bg-white/[.05] border border-white/10 overflow-hidden transition-colors duration-300 hover:border-primary/60">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={destPhoto(r.to)} alt="" loading="lazy" decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none" />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/30 to-transparent" />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[12px] font-extrabold text-text"><Repeat size={13} aria-hidden />Round trip</span>
              <h3 className="absolute left-5 right-5 bottom-3 flex items-baseline gap-2.5 leading-none">
                {r.label && <span className="sr-only">{r.label}</span>}
                <span aria-hidden={r.label ? true : undefined} className="text-[15px] font-bold text-white/70">{r.from}</span>
                <span aria-hidden className="text-primary text-[18px] font-black">⇄</span>
                <span aria-hidden={r.label ? true : undefined} className="text-[28px] font-extrabold tracking-[-0.03em] text-white">{r.to}</span>
              </h3>
            </div>
            <div className="flex-1 flex flex-col gap-2.5 px-5 pt-4 pb-5">
              {r.desc && <p className="text-[13.5px] text-white/70 leading-snug">{r.desc}</p>}
              <Lane dir="Outbound" from={r.from} to={r.to} />
              <Lane dir="Return" from={r.to} to={r.from} />
              <Button size="sm" variant="outlineInverse" className="mt-3 self-start group-hover:bg-primary! group-hover:text-text! group-hover:border-primary!"
                onClick={() => onBook({ tripType: "round-trip", pickup: r.from, drop: r.to })} aria-label={`Check round trip from ${r.from} to ${r.to}`}>
                Check round trip <ArrowUpRight size={15} aria-hidden />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {note && <p className="mt-10 max-w-[640px] mx-auto text-center text-[14px] text-white/60 leading-relaxed">{note}</p>}
      {ctaLabel && <div className="mt-6 text-center"><Button size="lg" onClick={() => onBook({ tripType: "round-trip" })}>{ctaLabel}</Button></div>}
    </Band>
  );
}
