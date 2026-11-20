import React, { useEffect, useMemo, useState } from "react";
import { Users, Briefcase, Snowflake, Fuel, Settings2, Check, ArrowRight, ArrowUpRight, Minus, Plus, Car, CarFront, Crown, Caravan, BusFront, LayoutGrid, Images, Plane, Route, Repeat, Clock, MapPin } from "lucide-react";
import Button from "../../ui/Button";
import FuelToggle from "../../FuelToggle";
import { fmtINR } from "../../../data/mockData";
import { Band, Head } from "../bangalore/shared";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";
const CAT_ICON = { all: LayoutGrid, sedan: Car, suv: CarFront, luxury: Crown, tempo: Caravan, bus: BusFront };

/* ════════════ Vehicle showroom: category pills + seat finder → big stage + thumbnail rail ════════════ */

/**
 * Live catalogue (useVehicleCatalogue) rendered as a showroom. One vehicle is on the stage
 * with its gallery, specs, fuel toggle and rate card; every vehicle in the current filter
 * sits in the rail below. Booking uses the page's own `bookHref` (same link as before).
 */
export function VehicleShowroom({ fleet, loading, error, retry, tabs, categoryInfo, bookHref, heading }) {
  const [tab, setTab] = useState("all");
  const [riders, setRiders] = useState(1);
  const [selKey, setSelKey] = useState(null);
  const [variant, setVariant] = useState({}); // groupKey → picked variant key
  const [img, setImg] = useState(0);

  const maxSeats = useMemo(() => Math.max(1, ...fleet.map((v) => Number(v.seats) || 0)), [fleet]);
  const counts = useMemo(() => Object.fromEntries(tabs.map((t) => [t.id, t.id === "all" ? fleet.length : fleet.filter((v) => v.category === t.id).length])), [tabs, fleet]);
  const list = useMemo(() => fleet.filter((v) => (tab === "all" || v.category === tab) && (Number(v.seats) || 0) >= riders), [fleet, tab, riders]);

  const resolve = (v) => {
    const picked = v?.variants && variant[v.groupKey];
    const found = picked && v.variants.find((m) => m.key === picked);
    return found ? { ...found, variants: v.variants, groupKey: v.groupKey } : v;
  };
  const entry = list.find((v) => (v.groupKey || v.id) === selKey) || list[0] || null;
  const cur = entry ? resolve(entry) : null;
  const gallery = cur?.gallery?.length ? cur.gallery : cur ? [cur.img] : [];
  useEffect(() => { setImg(0); }, [cur?.key]);

  const choose = (v) => { setSelKey(v.groupKey || v.id); };
  const pickTab = (id) => { setTab(id); setSelKey(null); };
  const fallback = (e) => { if (cur?.imgFallback && e.currentTarget.src !== cur.imgFallback) e.currentTarget.src = cur.imgFallback; };

  return (
    <Band id="fleet" bg="bg-bg">
      <Head id="fleet" center title={heading} />
      <style>{"@keyframes ac-stage-in{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}.ac-stage-name{animation:ac-stage-in .7s cubic-bezier(.22,1,.36,1)}@media (prefers-reduced-motion:reduce){.ac-stage-name{animation:none}}"}</style>

      {/* ── controls: categories + traveller count ── */}
      <div className="mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div role="tablist" aria-label="Vehicle categories" className="snap-row flex gap-2 overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 pb-1">
          {tabs.map((t) => {
            const Icon = CAT_ICON[t.id] || Car;
            const on = tab === t.id;
            return (
              <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => pickTab(t.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full pl-4 pr-2 py-2 text-[14px] font-bold transition-colors ${focusRing} ${on ? "bg-text text-white" : "bg-white border border-border hover:border-text"}`}>
                <Icon size={16} aria-hidden />{t.label}
                <span className={`min-w-[26px] rounded-full px-2 py-0.5 text-[12px] tabular-nums ${on ? "bg-primary text-text" : "bg-[#F1F1EE] text-text-secondary"}`}>{counts[t.id] ?? 0}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 rounded-full bg-white border border-border pl-5 pr-2 py-2 self-start lg:self-auto">
          <span className="text-[14px] font-bold" id="riders-label">How many travellers?</span>
          <div className="flex items-center gap-1.5" role="group" aria-labelledby="riders-label">
            <button type="button" aria-label="Fewer travellers" onClick={() => setRiders((n) => Math.max(1, n - 1))} disabled={riders <= 1}
              className={`grid place-items-center w-9 h-9 rounded-full bg-[#F1F1EE] hover:bg-primary disabled:opacity-40 disabled:hover:bg-[#F1F1EE] ${focusRing}`}><Minus size={16} aria-hidden /></button>
            <output aria-live="polite" className="w-10 text-center text-[18px] font-black tabular-nums">{riders}</output>
            <button type="button" aria-label="More travellers" onClick={() => setRiders((n) => Math.min(maxSeats, n + 1))} disabled={riders >= maxSeats}
              className={`grid place-items-center w-9 h-9 rounded-full bg-[#F1F1EE] hover:bg-primary disabled:opacity-40 disabled:hover:bg-[#F1F1EE] ${focusRing}`}><Plus size={16} aria-hidden /></button>
          </div>
        </div>
      </div>

      {tab !== "all" && categoryInfo[tab] && (
        <div className="mt-8 max-w-[720px]">
          <h3 className="text-[20px] font-extrabold tracking-[-0.02em]">{categoryInfo[tab].title}</h3>
          <p className="mt-1.5 text-[15px] text-text-secondary leading-relaxed">{categoryInfo[tab].desc}</p>
        </div>
      )}

      {/* ── states ── */}
      {loading && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5" aria-busy="true" aria-label="Loading our fleet">
          <div className="aspect-[16/10] rounded-[28px] bg-[#ECEAE3] animate-pulse motion-reduce:animate-none" />
          <div className="rounded-[28px] bg-[#ECEAE3] animate-pulse motion-reduce:animate-none min-h-[320px]" />
        </div>
      )}
      {!loading && error && (
        <div className="mt-8 rounded-[24px] bg-white border border-border py-14 px-6 text-center">
          <p className="text-[15px] text-text-secondary">We couldn't load the fleet right now.</p>
          <div className="mt-4"><Button variant="outline" onClick={retry}>Try again</Button></div>
        </div>
      )}
      {!loading && !error && !cur && (
        <div className="mt-8 rounded-[24px] bg-white border border-border py-14 px-6 text-center">
          <p className="text-[15px] text-text-secondary">
            {fleet.length ? `No vehicle in this category seats ${riders} travellers.` : "No vehicles in this category right now."}
          </p>
          {riders > 1 && <div className="mt-4"><Button variant="outline" onClick={() => setRiders(1)}>Reset travellers</Button></div>}
        </div>
      )}

      {/* ── stage ── */}
      {!loading && !error && cur && (
        <>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-4">
            {/* dark studio stage: spotlight, the name as outline type behind the car, big seat count */}
            <div className="relative rounded-[28px] overflow-hidden bg-[#0F0F10] aspect-[16/11] lg:aspect-auto lg:min-h-[400px] isolate">
              <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(55% 50% at 50% 58%, rgba(255,213,79,.38), transparent 72%), radial-gradient(90% 60% at 50% 120%, rgba(255,255,255,.08), transparent 60%)" }} />
              <p aria-hidden key={cur.key} className="ac-stage-name absolute inset-x-4 top-[7%] text-center whitespace-nowrap font-black uppercase tracking-[-0.04em] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,.22)] -z-10 overflow-hidden"
                style={{ fontSize: (() => { const fs = Math.min(88, Math.floor(950 / Math.max(6, String(cur.name).length))); return `clamp(26px, ${(fs / 11).toFixed(1)}vw, ${fs}px)`; })() }}>{cur.name}</p>
              <div aria-hidden className="absolute left-1/2 -translate-x-1/2 bottom-[13%] w-[62%] h-[9%] rounded-[50%] bg-black/70 blur-xl -z-10" />
              {cur.hasPhoto ? gallery.map((src, i) => (
                <img key={src + i} src={src} alt={i === img ? cur.name : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" onError={fallback}
                  className={`absolute left-[7%] top-[24%] w-[86%] h-[58%] object-contain rounded-[16px] drop-shadow-[0_30px_30px_rgba(0,0,0,.55)] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${i === img ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`} />
              )) : (() => { const Glyph = CAT_ICON[cur.category] || Car; return (
                <div role="img" aria-label={cur.name} className="absolute inset-x-0 top-[24%] h-[58%] grid place-items-center">
                  <Glyph strokeWidth={0.9} className="w-[42%] h-[80%] text-white/80 drop-shadow-[0_20px_30px_rgba(0,0,0,.6)]" aria-hidden />
                </div>
              ); })()}
              <span className="absolute top-4 left-4 rounded-full bg-primary text-text px-3 py-1 text-[12.5px] font-bold">{tabs.find((t) => t.id === cur.category)?.label || cur.category}</span>
              {!cur.ac && <span className="absolute top-4 right-4 rounded-full bg-white text-text px-3 py-1 text-[12.5px] font-bold">Non A/C</span>}
              {cur.seats && (
                <p className="absolute left-5 bottom-4 text-white leading-none">
                  <span className="text-[38px] md:text-[44px] font-black tracking-[-0.04em] tabular-nums text-primary">{cur.seats}</span>
                  <span className="ml-1.5 text-[13px] font-bold text-white/70">seats</span>
                </p>
              )}
              {cur.hasPhoto && gallery.length > 1 && (
                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  {gallery.map((src, i) => (
                    <button key={src + i} type="button" onClick={() => setImg(i)} aria-label={`Photo ${i + 1} of ${gallery.length}`} aria-pressed={i === img}
                      className={`shrink-0 w-14 aspect-[4/3] rounded-[10px] overflow-hidden border-2 transition-all ${focusRing.replace("outline-text", "outline-white")} ${i === img ? "border-primary" : "border-white/20 opacity-60 hover:opacity-100"}`}>
                      <img src={src} alt="" loading="lazy" decoding="async" onError={fallback} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 text-white px-2.5 py-1 text-[12px] font-semibold"><Images size={14} aria-hidden />{img + 1}/{gallery.length}</span>
                </div>
              )}
            </div>

            <div className="rounded-[28px] bg-white border border-border p-5 sm:p-6 flex flex-col" aria-live="polite">
              <h3 className="text-[22px] sm:text-[25px] font-extrabold tracking-[-0.03em] leading-tight">{cur.name}</h3>
              {cur.variants && cur.variants.length > 1 && (
                <div className="mt-2.5"><FuelToggle variants={cur.variants} activeKey={cur.key} onChange={(m) => setVariant((p) => ({ ...p, [entry.groupKey]: m.key }))} size="md" /></div>
              )}
              {cur.tagline && <p className="mt-2 text-[14px] text-text-secondary leading-snug">{cur.tagline}</p>}

              <dl className="mt-4 grid grid-cols-2 gap-px rounded-[16px] overflow-hidden bg-border border border-border">
                {[[Users, "Seats", cur.seats ? `${cur.seats} passengers` : "—"], [Briefcase, "Luggage", cur.bags || "—"], [Snowflake, "A/C", cur.ac ? "Yes" : "No"], [cur.fuel ? Fuel : Settings2, cur.fuel ? "Fuel" : "Transmission", cur.fuel || cur.transmission || "—"]].map(([Icon, k, val]) => (
                  <div key={k} className="bg-white px-3.5 py-2.5">
                    <dt className="flex items-center gap-1.5 text-[12px] font-semibold text-text-secondary"><Icon size={14} aria-hidden />{k}</dt>
                    <dd className="mt-0.5 text-[14px] font-bold">{val}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3.5 rounded-[16px] bg-[#111] text-white px-4 py-3.5">
                <p className="text-[12.5px] font-semibold text-white/60">Local package</p>
                {cur.rate ? (
                  <>
                    <p className="mt-1 flex items-baseline justify-between gap-3">
                      <span className="text-[14px] text-white/80">{cur.rate.hours} hrs / {cur.rate.km} km</span>
                      <span className="text-[22px] font-black tracking-[-0.02em] text-primary tabular-nums">{fmtINR(cur.rate.packageFare)}</span>
                    </p>
                    <p className="mt-1 text-[12.5px] text-white/60">Extra km: {fmtINR(cur.rate.extraPerKm)}/km, extra hr: {fmtINR(cur.rate.extraPerHour)}/hr</p>
                  </>
                ) : <p className="mt-1 text-[14px] text-white/80">Fare on request for this vehicle.</p>}
                <p className="mt-2.5 pt-2.5 border-t border-white/12 text-[12px] text-white/60">Outstation and one-way trips are priced live for your exact route.</p>
              </div>

              {cur.features?.length > 0 && (
                <ul className="mt-3.5 flex flex-wrap gap-1.5">
                  {cur.features.slice(0, 6).map((f) => (
                    <li key={f} className="inline-flex items-center gap-1.5 rounded-full bg-[#F4F3EE] px-2.5 py-1 text-[12px] font-semibold"><Check size={13} strokeWidth={3} aria-hidden className="text-[#2E7D32]" />{f}</li>
                  ))}
                </ul>
              )}

              <div className="mt-auto pt-4"><Button href={bookHref(cur)} size="lg" block>Book This Vehicle <ArrowRight size={18} aria-hidden /></Button></div>
            </div>
          </div>

          {cur.detail && <p className="mt-5 max-w-[860px] text-[14.5px] text-text-secondary leading-relaxed">{cur.detail}</p>}

          {/* ── rail ── */}
          <div className="mt-8 flex items-baseline justify-between gap-4">
            <p className="text-[14px] font-bold">{list.length} {list.length === 1 ? "vehicle" : "vehicles"}{riders > 1 ? ` for ${riders}+ travellers` : ""}</p>
          </div>
          <ul className="snap-row mt-3 flex gap-3 overflow-x-auto snap-x -mx-5 px-5 sm:-mx-6 sm:px-6 scroll-px-5 sm:scroll-px-6 pt-1 pb-3">
            {list.map((v) => {
              const r = resolve(v); const on = (v.groupKey || v.id) === (entry.groupKey || entry.id);
              return (
                <li key={v.groupKey || v.id} className="shrink-0 snap-start w-[210px]">
                  <button type="button" onClick={() => choose(v)} aria-pressed={on}
                    className={`w-full text-left rounded-[18px] overflow-hidden border-2 bg-white transition-all ${focusRing} ${on ? "border-text shadow-[0_14px_30px_-18px_rgba(0,0,0,.5)]" : "border-transparent hover:border-[#D4D4D4]"}`}>
                    <span className="block relative aspect-[16/10] bg-[#F4F3EE]">
                      <img src={r.img} alt="" loading="lazy" decoding="async" onError={(e) => { if (r.imgFallback && e.currentTarget.src !== r.imgFallback) e.currentTarget.src = r.imgFallback; }} className="vehicle-photo w-full h-full object-cover" />
                      {on && <span className="absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full bg-primary"><Check size={14} strokeWidth={3} aria-hidden /></span>}
                    </span>
                    <span className="block px-3.5 py-3">
                      <span className="block text-[14px] font-extrabold leading-tight truncate">{r.name}</span>
                      <span className="mt-1 flex items-center justify-between text-[12.5px] text-text-secondary">
                        <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden />{r.seats}</span>
                        <span className="font-bold text-text tabular-nums">{r.rate ? fmtINR(r.rate.packageFare) : "On request"}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Band>
  );
}

/* ════════════ Rental options: icon tiles that fill black from the bottom on hover; each links to its service ════════════ */

const OPTION_ICONS = [[/airport/i, Plane], [/outstation/i, Route], [/round/i, Repeat], [/hourly/i, Clock], [/local/i, MapPin], [/group|tempo|bus/i, BusFront]];
const optionIcon = (label) => (OPTION_ICONS.find(([re]) => re.test(label)) || [null, Car])[1];

export function RentalOptionTiles({ heading, options }) {
  return (
    <Band id="rental-options" bg="bg-white">
      <Head id="rental-options" center title={heading} />
      <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {options.map((o, i) => {
          const Icon = optionIcon(o.label);
          return (
            <li key={o.label}>
              <a href={o.href} className={`group relative flex flex-col h-full min-h-[250px] rounded-[26px] bg-[#F6F4EE] p-7 overflow-hidden isolate ${focusRing}`}>
                <span aria-hidden className="absolute inset-0 -z-10 bg-text origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none" />
                <span className="flex items-start justify-between">
                  <span className="grid place-items-center w-14 h-14 rounded-2xl bg-white transition-colors duration-300 group-hover:bg-primary">
                    <Icon size={26} strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="text-[13px] font-black tabular-nums text-text/35 transition-colors duration-300 group-hover:text-white/40">{String(i + 1).padStart(2, "0")}</span>
                </span>
                <span className="mt-auto pt-10 block text-[22px] md:text-[24px] font-extrabold tracking-[-0.02em] leading-tight transition-colors duration-300 group-hover:text-white">{o.label}</span>
                <span className="mt-2 flex items-end justify-between gap-4">
                  <span className="text-[14.5px] leading-relaxed text-text-secondary transition-colors duration-300 group-hover:text-white/70">{o.desc}</span>
                  <span aria-hidden className="shrink-0 grid place-items-center w-10 h-10 rounded-full border-2 border-text/20 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:rotate-45 motion-reduce:transition-none">
                    <ArrowUpRight size={18} />
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
