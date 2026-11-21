import { BLOG_TOPICS } from "./EmptyBlog";
import React from "react";
import { ArrowDown } from "lucide-react";
import Breadcrumb from "../ui/Breadcrumb";
import Button from "../ui/Button";
import BlogSearch from "./BlogSearch";
import BlogImage from "./BlogImage";
import { blogUrl, titleOf } from "../../lib/blog";

const TILT = ["-rotate-[7deg] -translate-x-10 translate-y-6", "rotate-[3deg] translate-x-2", "rotate-[10deg] translate-x-14 translate-y-10"];
const FAN = ["group-hover/stack:-rotate-[12deg] group-hover/stack:-translate-x-24", "group-hover/stack:rotate-0 group-hover/stack:-translate-y-4", "group-hover/stack:rotate-[14deg] group-hover/stack:translate-x-28"];

/**
 * Editorial masthead: headline + search on the left, a stack of the latest stories as polaroids
 * on the right (fans out on hover). Story/category counts come from the real posts.
 */
export default function BlogHero({ query, onQuery, onClear, onExplore, blogs = [], categoryCount = 0 }) {
  const stack = blogs.slice(0, 3);
  return (
    <section className="relative overflow-hidden bg-[#FAF7EE] border-b border-[#EFE8D4]">
      <div aria-hidden className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: "radial-gradient(rgba(17,17,17,.07) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="relative max-w-[1264px] mx-auto px-5 sm:px-6 pt-10 pb-14 md:pt-14 md:pb-20 grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-12 items-center">
        <div>
          <Breadcrumb items={[["Home", "/"], ["Blog", null]]} />
          <p className="mt-2 flex items-center gap-2.5 text-[13px] font-black uppercase tracking-[0.18em] text-[#7A5D00]"><span aria-hidden className="w-7 h-[3px] rounded-full bg-primary" />The Abhi Cabs Travel Journal</p>
          <h1 className="mt-4 text-[44px] sm:text-[58px] lg:text-[72px] font-black tracking-[-0.045em] leading-[.95]">
            Explore Stories <span className="bg-[linear-gradient(transparent_60%,#FFD54F_60%,#FFD54F_90%,transparent_90%)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-1 -mx-1">Beyond the Journey</span>
          </h1>
          {blogs.length > 0 ? (
            <div className="mt-8 w-full max-w-[620px] flex flex-col sm:flex-row gap-3 items-stretch">
              <div className="flex-1"><BlogSearch value={query} onChange={onQuery} onClear={onClear} /></div>
              <Button size="lg" onClick={onExplore} className="h-14"><ArrowDown size={17} aria-hidden /> Explore Articles</Button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" href="#topics" className="h-14"><ArrowDown size={17} aria-hidden /> See What&rsquo;s Coming</Button>
              <span className="text-[14px] font-semibold text-text-secondary">First stories publishing soon</span>
            </div>
          )}
          {blogs.length > 0 && (
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-[14px] font-semibold text-text-secondary">
              <span><strong className="text-text text-[18px] font-black tabular-nums">{blogs.length}</strong> stories</span>
              {categoryCount > 0 && <span><strong className="text-text text-[18px] font-black tabular-nums">{categoryCount}</strong> categories</span>}
            </p>
          )}
        </div>

        {stack.length === 0 && (
          <div className="hidden lg:flex justify-center" aria-hidden>
            <div className="group/stack relative w-[300px] h-[360px]">
              {BLOG_TOPICS.slice(0, 3).map((t, i) => (
                <div key={t.key}
                  className={`absolute inset-0 bg-white p-3 pb-14 rounded-[6px] shadow-[0_24px_50px_-24px_rgba(0,0,0,.55)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none hover:!z-20 ${TILT[i]} ${FAN[i]}`}
                  style={{ zIndex: 3 - i }}>
                  <img src={t.img} alt="" loading={i === 0 ? "eager" : "lazy"} decoding="async" className="w-full h-full object-cover rounded-[3px]" />
                  <span className="absolute left-3 right-3 bottom-3 flex items-center justify-between gap-2 text-[13px] font-extrabold">
                    {t.label}<span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#7A5D00] bg-[#FFF3C9] rounded-full px-2 py-0.5">Soon</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stack.length > 0 && (
          <div className="hidden lg:flex justify-center">
            <div className="group/stack relative w-[300px] h-[360px]">
              {stack.map((b, i) => (
                <a key={b.slug} href={blogUrl(b)} aria-label={titleOf(b)}
                  className={`absolute inset-0 bg-white p-3 pb-14 rounded-[6px] shadow-[0_24px_50px_-24px_rgba(0,0,0,.55)] transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none hover:!z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text ${TILT[i]} ${FAN[i]}`}
                  style={{ zIndex: 3 - i }}>
                  <BlogImage blog={b} width={600} priority={i === 0} className="w-full h-full object-cover rounded-[3px]" />
                  <span className="absolute left-3 right-3 bottom-3 text-[13px] font-extrabold leading-snug line-clamp-2">{titleOf(b)}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
