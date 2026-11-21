import React from "react";
import { MapPin, Info, Phone, MessageCircle, Car, CarFront, Caravan, BusFront } from "lucide-react";
import Button from "../../ui/Button";
import Accordion from "../../ui/Accordion";
import { PHONES, whatsappHref } from "../../../data/businessInfo";
import { Band, Head, renderInline, splitLabel } from "../bangalore/shared";

/* Every section here stacks: heading on top, content full width underneath. */

const vehicleIcon = (t = "") => (/tempo|traveller/i.test(t) ? Caravan : /bus|coach|urbania/i.test(t) ? BusFront : /suv|muv/i.test(t) ? CarFront : Car);

/* ── Fleet: the vehicle line-up in one row, divided by hairlines ── */
export function FleetLineup({ data, bg = "bg-white" }) {
  return (
    <Band id="fleet" bg={bg}>
      <Head id="fleet" center title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-8 lg:gap-x-0 lg:grid-cols-5 border-t lg:border-b border-border lg:divide-x divide-border">
        {data.vehicles.map((v) => {
          const Icon = vehicleIcon(v.label);
          return (
            <li key={v.label} className="py-7 lg:py-9 lg:px-6 lg:first:pl-0 lg:last:pr-0 border-b lg:border-b-0 border-border">
              <Icon size={40} strokeWidth={1.5} aria-hidden />
              <h3 className="mt-5 text-[17px] font-extrabold leading-snug">{v.label}</h3>
              <p className="mt-2 text-[14px] text-text-secondary leading-[1.7]">{v.desc}</p>
            </li>
          );
        })}
      </ul>
      {data.note && <p className="mt-6 text-center text-[13.5px] text-text-secondary">{data.note}</p>}
    </Band>
  );
}

/* ── Tirumala (Tirupati): pickups as a row, checks in a grid, disclaimer as a full-width strip ── */
export function TirumalaBand({ data, city, onBook }) {
  return (
    <Band id="tirumala" bg="bg-primary-tint">
      <Head id="tirumala" center title={data.heading} sub={data.subheading} intro={data.intro} />
      {data.pickups?.length > 0 && (
        <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
          {data.pickups.map((p) => (
            <li key={p} className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E8DDB0] px-4 py-2 text-[14px] font-semibold">
              <MapPin size={15} aria-hidden className="text-[#B88A00]" />{p}
            </li>
          ))}
        </ul>
      )}
      {data.important?.length > 0 && (
        <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {data.important.map((it) => (
            <li key={it.title} className="border-t-2 border-text pt-4">
              <h3 className="text-[16px] font-extrabold">{it.title}</h3>
              <p className="mt-1.5 text-[14.5px] text-text-secondary leading-[1.7]">{it.desc}</p>
            </li>
          ))}
        </ul>
      )}
      {data.disclaimer && (
        <p className="mt-10 flex items-start gap-3 rounded-[14px] bg-[#111] text-white px-5 sm:px-7 py-4 text-[14.5px] font-semibold leading-relaxed">
          <Info size={20} aria-hidden className="shrink-0 mt-0.5 text-primary" />{data.disclaimer}
        </p>
      )}
      <div className="mt-8 text-center">
        {data.note && <p className="max-w-[680px] mx-auto text-[14px] text-text-secondary leading-relaxed">{data.note}</p>}
        {data.ctaLabel && <div className="mt-6"><Button size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => onBook({ tripType: "one-way", pickup: city, drop: "Tirumala" })}>{data.ctaLabel}</Button></div>}
      </div>
    </Band>
  );
}

/* ── Outstation: dark band, centred heading, two-column route board ── */
export function RoutesBoard({ data, origin, onBook }) {
  return (
    <Band id="routes" bg="bg-[#111]" className="text-white">
      <Head id="routes" center light title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 border-t border-white/20">
        {data.routes.map((r) => {
          const m = /^(.+? to )(.+?)( Cabs)?$/.exec(r.label);
          const dest = m?.[2] || r.label;
          return (
            <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 py-5 border-b border-white/12">
              <div className="min-w-0">
                <p className="leading-tight">
                  {m ? <>
                    <span className="text-[13px] font-semibold text-white/55">{m[1]}</span>
                    <strong className="text-[22px] font-extrabold tracking-[-0.02em] text-white">{m[2]}</strong>
                    {m[3] && <span className="text-[13px] font-semibold text-white/55">{m[3]}</span>}
                  </> : <strong className="text-[18px] font-extrabold">{r.label}</strong>}
                </p>
                <p className="mt-1.5 text-[14px] text-white/65 leading-relaxed">{r.desc}</p>
              </div>
              <Button variant="outlineInverse" size="sm" onClick={() => onBook({ tripType: "one-way", pickup: origin, drop: dest })}>Get fare</Button>
            </li>
          );
        })}
      </ul>
      {data.ctaLabel && <div className="mt-10 text-center"><Button variant="inverse" size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => onBook({ tripType: "one-way", pickup: origin })}>{data.ctaLabel}</Button></div>}
    </Band>
  );
}

/* ── Pickup areas: centred heading, full-width map panel of area buttons ── */
export function PickupMap({ data, region, onBook, bg = "bg-white" }) {
  const areas = data.areas || [];
  return (
    <Band id="pickup" bg={bg}>
      <Head id="pickup" center title={data.heading} sub={data.subheading} intro={data.intro} />
      {areas.length > 0 && (
        <div className="relative mt-10 rounded-[24px] bg-[#F4F1E6] px-5 py-10 sm:p-12 overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-60 pointer-events-none" style={{
            backgroundImage: "linear-gradient(#E6DFC8 1.5px, transparent 1.5px), linear-gradient(90deg, #E6DFC8 1.5px, transparent 1.5px), linear-gradient(32deg, transparent 49%, #E0D7B9 49.5%, #E0D7B9 51%, transparent 51.5%), linear-gradient(-18deg, transparent 49%, #E0D7B9 49.5%, #E0D7B9 50.5%, transparent 51%)",
            backgroundSize: "56px 56px, 56px 56px, 100% 100%, 100% 100%",
          }} />
          <ul className="relative flex flex-wrap justify-center gap-3">
            {areas.map((area) => (
              <li key={area}>
                <button type="button" onClick={() => onBook({ tripType: "local", pickup: `${area.split(" and ")[0]}, ${region}` })}
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#D9D1B5] pl-3 pr-4 py-2.5 text-[14px] font-semibold hover:bg-primary hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text">
                  <MapPin size={16} aria-hidden className="text-[#B88A00]" />{area}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.note && <p className="mt-8 max-w-[760px] mx-auto text-center text-[14px] text-text-secondary leading-relaxed">{data.note}</p>}
    </Band>
  );
}

/* ── Why choose: brand-yellow band, heading on top, four-column grid ── */
export function WhyBand({ data }) {
  return (
    <Band id="why" bg="bg-primary">
      <Head id="why" title={data.heading} sub={data.subheading} />
      <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
        {data.items.map((w) => (
          <li key={w.title} className="border-t-2 border-text pt-4">
            <h3 className="text-[16px] font-extrabold leading-snug">{w.title}</h3>
            <p className="mt-1.5 text-[14.5px] text-[#3A3220] leading-[1.7]">{w.desc}</p>
          </li>
        ))}
      </ul>
    </Band>
  );
}

/* ── Tips: centred heading, trip-slip centred underneath ── */
export function TipsSlip({ data, bg = "bg-bg" }) {
  return (
    <Band id="tips" bg={bg}>
      <Head id="tips" center title={data.heading} sub={data.subheading} />
      <div className="relative mt-10 max-w-[860px] mx-auto bg-white rounded-t-[18px] border border-border border-b-0 shadow-[0_30px_60px_-40px_rgba(0,0,0,.35)]">
        <div aria-hidden className="h-2 rounded-t-[18px] bg-primary" />
        <ul className="px-6 sm:px-9 pb-8">
          {data.items.map((t) => (
            <li key={t.title} className="grid grid-cols-1 sm:grid-cols-[200px_minmax(0,1fr)] gap-x-6 gap-y-1 py-4 border-b border-dashed border-[#D4D4D4]">
              <h3 className="text-[14.5px] font-extrabold">{t.title}</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">{t.desc}</p>
            </li>
          ))}
        </ul>
        <div aria-hidden className="absolute left-0 right-0 -bottom-[10px] h-[10px]" style={{ background: "radial-gradient(circle at 10px 0, #fff 9.5px, transparent 10px) 0 0 / 20px 10px repeat-x" }} />
      </div>
    </Band>
  );
}

/* ── FAQ: centred heading, accordion centred, contact links underneath ── */
export function FaqCentered({ heading, items, bg = "bg-white" }) {
  const wa = whatsappHref();
  const link = "inline-flex items-center gap-2 text-[15px] font-semibold hover:text-[#B88A00] focus-visible:outline-2 focus-visible:outline-primary rounded-sm";
  return (
    <Band id="faq" bg={bg}>
      <Head id="faq" center title={heading} />
      <div className="mt-10 max-w-[880px] mx-auto">
        <Accordion items={items} tone="tint" />
        <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {PHONES.map((p) => <li key={p.href}><a href={p.href} className={link}><Phone size={17} aria-hidden /> {p.label}</a></li>)}
          {wa && <li><a href={wa} target="_blank" rel="noopener noreferrer" className={link}><MessageCircle size={17} aria-hidden /> Chat on WhatsApp</a></li>}
        </ul>
      </div>
    </Band>
  );
}

export { renderInline, splitLabel };
