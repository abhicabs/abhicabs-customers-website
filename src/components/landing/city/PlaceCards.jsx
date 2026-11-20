import React, { useEffect, useRef, useState } from "react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../ui/Button";
import { Band, Head } from "../bangalore/shared";

/**
 * Location photo with the attribution Creative Commons requires (author + licence, linked
 * to the file page). `img` comes from src/content/placeImages.json (scripts/fetch-place-images.mjs);
 * no photo yet → a quiet branded placeholder.
 */
export function PlacePhoto({ img, alt, className = "", creditPos = "bottom" }) {
  return (
    <div className={`relative overflow-hidden bg-[#EFEAD9] ${className}`.trim()}>
      {img?.src ? (
        <>
          <img src={img.src} width={img.width} height={img.height} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          <a href={img.source} target="_blank" rel="noopener noreferrer"
            className={`absolute ${creditPos === "top" ? "top-2" : "bottom-2"} right-2 z-[2] max-w-[85%] truncate rounded-md bg-black/60 px-2 py-0.5 text-[10.5px] font-medium text-white/90 hover:text-white focus-visible:outline-2 focus-visible:outline-primary`}>
            {img.author}, {img.license}
          </a>
        </>
      ) : (
        <div aria-hidden className="absolute inset-0 grid place-items-center" style={{ backgroundImage: "linear-gradient(#E3DCC4 1px, transparent 1px), linear-gradient(90deg, #E3DCC4 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
          <MapPin size={34} strokeWidth={1.6} className="text-[#B88A00]" />
        </div>
      )}
    </div>
  );
}

const GRID_COLS = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" };

/* ── Tourist places: photo-led grid (photo on top, name + description below) ── */
export function AttractionsGrid({ data, imageFor, onBook, bg = "bg-white" }) {
  const n = data.places.length;
  const cols = GRID_COLS[n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : n % 5 === 0 ? 5 : 4];
  return (
    <Band id="attractions" bg={bg}>
      <Head id="attractions" title={data.heading} sub={data.subheading} intro={data.intro} />
      <ul className={`mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 ${cols} gap-x-6 gap-y-10`}>
        {data.places.map((p) => (
          <li key={p.name}>
            <PlacePhoto img={imageFor(p.name)} alt={p.name} className="aspect-[4/3] rounded-[16px]" />
            <h3 className="mt-4 text-[17px] font-extrabold tracking-[-0.01em] leading-snug">{p.name}</h3>
            <p className="mt-1.5 text-[14.5px] text-text-secondary leading-[1.7]">{p.desc}</p>
          </li>
        ))}
      </ul>
      {data.ctaLabel && <div className="mt-12 text-center"><Button size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => onBook({ tripType: "local" })}>{data.ctaLabel}</Button></div>}
    </Band>
  );
}

/* ── One-day trips: swipeable row of tall photo cards; each card starts a round trip ── */
export function DayTripCarousel({ data, imageFor, destOf, origin, onBook, bg = "bg-bg" }) {
  const rail = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = () => {
    const el = rail.current; if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(() => { update(); window.addEventListener("resize", update); return () => window.removeEventListener("resize", update); }, []);
  const step = (dir) => {
    const el = rail.current; if (!el) return;
    const card = el.querySelector("li");
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * ((card?.offsetWidth || 320) + 20), behavior: reduce ? "auto" : "smooth" });
  };
  const arrow = "grid place-items-center w-12 h-12 rounded-full border-2 border-text bg-white text-text hover:bg-primary hover:border-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text";

  return (
    <Band id="daytrips" bg={bg}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <Head id="daytrips" title={data.heading} sub={data.subheading} intro={data.intro} />
        <div className="hidden md:flex gap-3 shrink-0">
          <button type="button" className={arrow} onClick={() => step(-1)} disabled={edge.start} aria-label="Previous destinations"><ChevronLeft size={22} aria-hidden /></button>
          <button type="button" className={arrow} onClick={() => step(1)} disabled={edge.end} aria-label="Next destinations"><ChevronRight size={22} aria-hidden /></button>
        </div>
      </div>

      <ul ref={rail} onScroll={update} className="snap-row mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 sm:-mx-6 sm:px-6 scroll-px-5 sm:scroll-px-6 pb-3">
        {data.places.map((p) => {
          const dest = destOf(p.name);
          const m = /^(.+? to )(.+)$/.exec(p.name);
          return (
            <li key={p.name} className="shrink-0 w-[80%] sm:w-[320px] lg:w-[300px] snap-start flex flex-col">
              <div className="relative rounded-[20px] overflow-hidden">
                <PlacePhoto img={imageFor(dest)} alt={dest} className="aspect-[4/5]" creditPos="top" />
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                <h3 className="absolute left-5 right-5 bottom-5 text-white leading-tight">
                  {m ? <>
                    <span className="block text-[13px] font-semibold text-white/75">{m[1]}</span>
                    <span className="block text-[23px] font-extrabold tracking-[-0.02em]">{m[2]}</span>
                  </> : <span className="text-[22px] font-extrabold">{p.name}</span>}
                </h3>
              </div>
              <p className="mt-4 text-[14.5px] text-text-secondary leading-[1.7]">{p.desc}</p>
              <div className="mt-auto pt-4">
                <Button variant="outline" size="sm" onClick={() => onBook({ tripType: "round-trip", pickup: origin, drop: dest })}>Book round trip</Button>
              </div>
            </li>
          );
        })}
      </ul>

      {data.ctaLabel && <div className="mt-10"><Button size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={() => onBook({ tripType: "round-trip", pickup: origin })}>{data.ctaLabel}</Button></div>}
    </Band>
  );
}
