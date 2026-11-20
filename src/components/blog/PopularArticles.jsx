import React, { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import BlogImage from "./BlogImage";
import { blogUrl, titleOf, readingMinutes } from "../../lib/blog";

/**
 * Numbered reading list on dark; the post's photo floats beside the cursor on hover (desktop).
 * `curated` = true when the posts are hand-picked via the `popular` tag. No view counts exist,
 * so none are shown and nothing claims "most read".
 */
export default function PopularArticles({ blogs, curated }) {
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const box = useRef(null);
  if (blogs.length === 0) return null;
  const move = (e) => { const r = box.current?.getBoundingClientRect(); if (r) setPos({ x: Math.min(e.clientX - r.left + 28, r.width - 290), y: e.clientY - r.top }); };

  return (
    <section id="popular" aria-labelledby="popular-title" className="bg-[#111] text-white py-16 md:py-24 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] text-primary"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />{curated ? "Reader favourites" : "Editor's picks"}</p>
        <h2 id="popular-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">{curated ? "Popular Reads" : "Worth Reading Next"}</h2>
        <p className="mt-3 text-[15.5px] text-white/60">{curated ? "Hand-picked stories our readers keep coming back to." : "More stories from our travel journal."}</p>

        <div ref={box} className="relative mt-10" onMouseMove={move} onMouseLeave={() => setHover(null)}>
          <div aria-hidden className={`pointer-events-none hidden lg:block absolute z-20 w-[260px] aspect-[4/3] rounded-[16px] overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] transition-[opacity,transform] duration-300 ${hover !== null ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
            style={{ left: pos.x, top: pos.y - 100, rotate: "-4deg" }}>
            {blogs.map((b, i) => <BlogImage key={b.slug} blog={b} width={520} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hover === i ? "opacity-100" : "opacity-0"}`} />)}
          </div>
          <ol className="border-t border-white/15">
            {blogs.map((b, i) => {
              const mins = readingMinutes(b);
              return (
                <li key={b.slug} onMouseEnter={() => setHover(i)}>
                  <a href={blogUrl(b)} className="group grid grid-cols-[52px_minmax(0,1fr)_auto] md:grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-x-4 md:gap-x-8 py-6 border-b border-white/12 focus-visible:outline-2 focus-visible:outline-primary">
                    <span aria-hidden className="text-[30px] md:text-[56px] font-black tabular-nums leading-none text-white/20 transition-colors duration-300 group-hover:text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block text-[18px] md:text-[28px] font-extrabold tracking-[-0.025em] leading-tight transition-transform duration-500 group-hover:translate-x-2 motion-reduce:transition-none">{titleOf(b)}</span>
                      <span className="block mt-1.5 text-[13px] text-white/50">{[b.category, mins && `${mins} min read`].filter(Boolean).join(" • ")}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <BlogImage blog={b} width={160} className="lg:hidden w-16 h-16 rounded-[12px] object-cover" />
                      <span aria-hidden className="hidden lg:grid place-items-center w-12 h-12 rounded-full border-2 border-white/20 transition-all duration-300 group-hover:bg-primary group-hover:border-primary group-hover:text-[#111] group-hover:rotate-45"><ArrowUpRight size={20} /></span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
