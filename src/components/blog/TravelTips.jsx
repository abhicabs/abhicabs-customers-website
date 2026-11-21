import React, { useRef } from "react";
import { ShieldCheck, Luggage, Users, Plane, CloudRain, Route, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import BlogImage from "./BlogImage";
import { blogUrl, titleOf } from "../../lib/blog";

// "Read More" only when article pages exist (blogUrl returns a link).
const HAS_ARTICLE_PAGES = Boolean(blogUrl({ slug: "x" }));

const ICONS = [ShieldCheck, Plane, Users, CloudRain, Luggage, Route];
const COLORS = ["bg-primary text-[#111]", "bg-[#111] text-white", "bg-[#F4F0E2] text-[#111]"];

/** Swipeable row: the featured tip as a photo card, then colour cards for the rest. */
export default function TravelTips({ blogs, onAllTips }) {
  const rail = useRef(null);
  if (blogs.length === 0) return null;
  const [main, ...rest] = blogs;
  const step = (d) => {
    const el = rail.current; if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: d * 340, behavior: reduce ? "auto" : "smooth" });
  };
  const arrow = "grid place-items-center w-12 h-12 rounded-full border-2 border-[#111] hover:bg-primary hover:border-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]";
  return (
    <section id="tips" aria-labelledby="tips-title" className="bg-white py-16 md:py-24 scroll-mt-28 overflow-hidden">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] text-text-secondary"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />Tips</p>
            <h2 id="tips-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">Travel Smarter with Abhi Cabs</h2>
            <p className="mt-3 text-[15.5px] text-text-secondary">Practical advice for safer, smoother and more comfortable journeys.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className={`hidden md:grid ${arrow}`} onClick={() => step(-1)} aria-label="Previous tips"><ChevronLeft size={20} aria-hidden /></button>
            <button type="button" className={`hidden md:grid ${arrow}`} onClick={() => step(1)} aria-label="Next tips"><ChevronRight size={20} aria-hidden /></button>
            <button type="button" onClick={onAllTips} className="h-12 px-6 rounded-full bg-[#111] text-white font-bold text-[14px] hover:bg-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00]">Explore All Tips</button>
          </div>
        </div>

        <ul ref={rail} className="snap-row mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 sm:-mx-6 sm:px-6 scroll-px-5 sm:scroll-px-6 pb-3">
          <li className="shrink-0 w-[86%] sm:w-[520px] snap-start">
            <article className="group relative h-full min-h-[380px] rounded-[26px] overflow-hidden bg-[#111] isolate">
              <BlogImage blog={main} width={1000} className="absolute inset-0 w-full h-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:transition-none" />
              <div className="relative h-full min-h-[380px] flex flex-col justify-end p-7 bg-gradient-to-t from-black/90 via-black/35 to-transparent text-white">
                <span className="w-fit bg-primary text-[#111] text-[11px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-sm">Featured tip</span>
                <h3 className="mt-3 text-[24px] md:text-[30px] font-black leading-tight"><a href={blogUrl(main)} className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-primary">{titleOf(main)}</a></h3>
                {main.description && <p className="mt-2 text-white/75 text-[14.5px] line-clamp-2">{main.description}</p>}
                {HAS_ARTICLE_PAGES && <span className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-[14px]">Read More <ArrowRight size={15} aria-hidden /></span>}
              </div>
            </article>
          </li>
          {rest.slice(0, 5).map((b, i) => {
            const Icon = ICONS[i % ICONS.length];
            const c = COLORS[i % COLORS.length];
            const dark = c.includes("111] text-white");
            return (
              <li key={b.slug} className="shrink-0 w-[78%] sm:w-[300px] snap-start">
                <a href={blogUrl(b)} className={`group flex flex-col h-full min-h-[380px] rounded-[26px] p-7 transition-transform duration-500 hover:-translate-y-1.5 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${c}`}>
                  <span className="flex items-center justify-between">
                    <Icon size={34} strokeWidth={1.6} aria-hidden className={dark ? "text-primary" : ""} />
                    <span className={`text-[12.5px] font-black tabular-nums ${dark ? "text-white/40" : "text-black/35"}`}>{String(i + 2).padStart(2, "0")}</span>
                  </span>
                  <span className="mt-auto pt-10 block text-[21px] font-extrabold tracking-[-0.02em] leading-snug">{titleOf(b)}</span>
                  {b.description && <span className={`block mt-2 text-[14px] leading-relaxed line-clamp-3 ${dark ? "text-white/70" : "text-black/65"}`}>{b.description}</span>}
                  {HAS_ARTICLE_PAGES && <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-bold">Read More <ArrowRight size={15} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" /></span>}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
