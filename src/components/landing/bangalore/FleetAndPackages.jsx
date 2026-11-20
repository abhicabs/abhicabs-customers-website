import React, { useState } from "react";
import { Car, CarFront, Caravan, BusFront } from "lucide-react";
import Button from "../../ui/Button";
import { Band, Head, TextLink, renderInline, splitLabel } from "./shared";

const KIND_ICON = { sedan: Car, suv: CarFront, tempo: Caravan, bus: BusFront };

/* ── Vehicles: fleet photo + sticky intro on the left, hairline list on the right ── */
export function VehiclesSection({ data }) {
  return (
    <Band id="vehicles" bg="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-10 lg:gap-16">
        <div className="lg:sticky lg:top-28 self-start">
          <Head id="vehicles" eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />
          {data.image && (
            <img src={data.image} alt={data.imageAlt || ""} loading="lazy" decoding="async"
              className="mt-8 w-full aspect-[16/10] object-cover rounded-[20px]" />
          )}
          {data.note && <p className="mt-5 text-[13.5px] text-text-secondary leading-relaxed">{data.note}</p>}
          {(data.links || []).map((l, i) => <p key={i} className="mt-2 text-[14.5px] leading-relaxed">{renderInline(l)}</p>)}
          {data.cta?.label && <div className="mt-7"><Button href={data.cta.href} size="lg">{data.cta.label}</Button></div>}
        </div>

        <ul className="border-t-2 border-text">
          {data.cards.map((c) => {
            const Icon = KIND_ICON[c.kind] || Car;
            return (
              <li key={c.title} className="grid grid-cols-[44px_minmax(0,1fr)] gap-5 py-7 md:py-9 border-b border-border">
                <Icon size={32} strokeWidth={1.6} aria-hidden className="text-text mt-0.5" />
                <div>
                  <h3 className="text-[19px] md:text-[22px] font-extrabold tracking-[-0.02em] leading-snug">{c.title}</h3>
                  {[].concat(c.body || []).map((p, j) => <p key={j} className="mt-2.5 text-[15px] text-text-secondary leading-[1.75]">{renderInline(p)}</p>)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Band>
  );
}

/* ── Hourly packages: a 0–12 hour ruler. Each package ends on its hour mark; choosing one
      lights the ruler up to that mark and opens the booking widget on that Local package. ── */
export function HourlySection({ data, onBook }) {
  const pkgs = data.points.map((t, i) => {
    const [label, desc] = splitLabel(t);
    const pkg = data.packages?.[i] || "";
    const [hrs, km] = pkg.split(" / ");
    return { label, desc, pkg, hours: parseInt(hrs, 10) || (i + 1) * 4, km };
  });
  const max = Math.max(...pkgs.map((p) => p.hours), 12);
  const [active, setActive] = useState(pkgs.length - 1);
  const fill = `${(pkgs[active]?.hours / max) * 100}%`;

  return (
    <Band id="hourly" bg="bg-[#111]" className="text-white">
      <Head id="hourly" light eyebrow={data.eyebrow} title={data.heading} sub={data.subheading} intro={data.intro} />

      <div className="mt-12 md:mt-16 relative">
        {/* packages: equal thirds, so each column's right edge sits on its hour mark below */}
        <ul className="grid grid-cols-1 md:grid-cols-3">
          {pkgs.map((p, i) => {
            const on = i === active;
            return (
              <li key={p.pkg || i} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                className={`relative py-6 md:py-0 md:pr-8 md:pb-10 border-b md:border-b-0 border-white/10 md:text-right transition-opacity duration-300 motion-reduce:transition-none ${on ? "opacity-100" : "md:opacity-60"}`}>
                <p className="flex md:justify-end items-baseline gap-2">
                  <span className="text-[64px] md:text-[88px] font-black leading-none tracking-[-0.05em] tabular-nums text-primary">{p.hours}</span>
                  <span className="text-[18px] font-bold">hrs</span>
                </p>
                {p.km && <p className="mt-1 text-[14px] font-semibold text-white/70">{p.km} included</p>}
                <p className="mt-4 text-[15px] leading-relaxed text-white/85 md:ml-auto md:max-w-[300px]">
                  <strong className="font-bold text-white">{p.label}:</strong> {p.desc}
                </p>
                <div className="mt-5">
                  <Button variant={on ? "primary" : "outlineInverse"} size="md" onClick={() => onBook({ tripType: "local", package: p.pkg })}>
                    Book {p.hours} hours
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* ruler (desktop) */}
        <div aria-hidden className="hidden md:block relative h-14">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-white/15 rounded-full" />
          <div className="absolute left-0 top-0 h-[3px] bg-primary rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none" style={{ width: fill }} />
          {Array.from({ length: max + 1 }, (_, h) => {
            const major = pkgs.some((p) => p.hours === h) || h === 0;
            return (
              <span key={h} className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${(h / max) * 100}%` }}>
                <span className={`block w-px ${major ? "h-4 bg-white/60" : "h-2 bg-white/25"}`} />
                {major && <span className="mt-2 text-[12px] font-semibold text-white/55 tabular-nums">{h}h</span>}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-8 md:mt-4 max-w-[760px]">
        {data.note && <p className="text-[14px] text-white/65 leading-relaxed">{data.note}</p>}
        {(data.links || []).map((l, i) => <p key={i} className="mt-2 text-[14.5px] text-white/85 leading-relaxed [&_a]:text-primary [&_a:hover]:text-white">{renderInline(l)}</p>)}
        {data.cta?.label && <div className="mt-6"><TextLink light href={data.cta.href}>{data.cta.label}</TextLink></div>}
      </div>
    </Band>
  );
}
