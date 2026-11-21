import React from "react";
import { X, ArrowUpRight } from "lucide-react";
import BlogImage from "./BlogImage";
import ArticleMeta from "./ArticleMeta";
import BlogPagination from "./BlogPagination";
import { blogUrl, titleOf, categorySlug } from "../../lib/blog";

const pill = (on) => `shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full text-[13.5px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E6AC00] ${on ? "bg-[#111] text-white" : "bg-[#F3F2EE] hover:bg-[#E9E6DC]"}`;
const count = (n, on) => <span className={`text-[11.5px] rounded-full px-1.5 py-0.5 tabular-nums ${on ? "bg-primary text-[#111]" : "bg-white text-text-secondary"}`}>{n}</span>;

// Uniform grid: every card has the same image ratio, text rows and height.
function Tile({ b }) {
  return (
    <article className="group flex flex-col h-full">
      <a href={blogUrl(b)} aria-label={titleOf(b)} className="relative block overflow-hidden rounded-[20px] isolate">
        <BlogImage blog={b} width={600} className="w-full aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none" />
        <span aria-hidden className="absolute right-3 bottom-3 grid place-items-center w-10 h-10 rounded-full bg-white text-[#111] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"><ArrowUpRight size={18} /></span>
      </a>
      {b.category && (
        <a href={`/blogs?category=${categorySlug(b.category)}`} className="mt-4 self-start text-[11.5px] font-black uppercase tracking-[0.14em] text-[#7A5D00] hover:text-[#111]">{b.category}</a>
      )}
      <h3 className="mt-2 text-[19px] font-extrabold tracking-[-0.015em] leading-snug line-clamp-2 min-h-[2.6em]">
        <a href={blogUrl(b)} className="bg-[linear-gradient(#FFD54F,#FFD54F)] bg-no-repeat bg-[length:0%_35%] bg-[position:0_88%] group-hover:bg-[length:100%_35%] transition-[background-size] duration-500">{titleOf(b)}</a>
      </h3>
      {b.description && <p className="mt-2 text-[14px] text-text-secondary leading-relaxed line-clamp-2">{b.description}</p>}
      <ArticleMeta blog={b} className="mt-auto pt-3" />
    </article>
  );
}

/** Latest posts with the category filter as a bar that stays under the header while the grid scrolls. */
export default function LatestArticles({ result, filtering, query, category, categoryName, onClear, onPage, categories = [], total: totalAll = 0, onSelect }) {
  const { items, page, pages, total } = result;
  return (
    <section id="latest" aria-labelledby="latest-title" className="bg-white py-14 md:py-20 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.2em] text-text-secondary"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />Journal</p>
            <h2 id="latest-title" className="mt-3 text-[30px] md:text-[44px] font-black tracking-[-0.035em] leading-[1.05]">Latest from Our Travel Journal</h2>
          </div>
          <p className="max-w-[420px] text-[15px] text-text-secondary leading-relaxed">Explore our latest travel stories, destination guides, and helpful information for your next journey.</p>
        </div>

        {categories.length > 0 && (
          <div id="categories" className="sticky top-[61px] lg:top-[73px] z-30 -mx-5 px-5 sm:mx-0 sm:px-0 mt-8 py-3 bg-white border-b border-[#F0F0F0]">
            <h2 className="sr-only">Explore by Category</h2>
            <div role="group" aria-label="Filter articles by category" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
              <button type="button" aria-pressed={!category} onClick={() => onSelect("")} className={pill(!category)}>All Articles {count(totalAll, !category)}</button>
              {categories.map((c) => (
                <button key={c.slug} type="button" aria-pressed={category === c.slug} onClick={() => onSelect(c.slug)} className={pill(category === c.slug)}>{c.name} {count(c.count, category === c.slug)}</button>
              ))}
            </div>
          </div>
        )}

        {filtering && (
          <div className="mt-6 flex flex-wrap items-center gap-3" aria-live="polite">
            <p className="text-[14px] text-text-secondary">
              <strong className="text-text">{total}</strong> {total === 1 ? "article" : "articles"}
              {categoryName && <> in <strong className="text-text">{categoryName}</strong></>}
              {query && <> matching “<strong className="text-text">{query}</strong>”</>}
            </p>
            <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-border text-[13px] font-bold hover:border-[#111] transition-colors"><X size={14} aria-hidden /> Clear filters</button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="mt-10 rounded-[24px] bg-[#FFFBEA] border border-[#F2E6C9] p-10 text-center" role="status">
            <p className="text-[18px] font-extrabold">No articles found</p>
            <p className="mt-2 text-[14.5px] text-text-secondary">Try a different search or category.</p>
            <button type="button" onClick={onClear} className="mt-5 h-11 px-6 rounded-full bg-primary font-bold text-[14.5px] hover:bg-[#E6AC00] transition-colors">View all articles</button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-14 items-stretch">
            {items.map((b) => <Tile key={b.slug} b={b} />)}
          </div>
        )}

        <BlogPagination page={page} pages={pages} onPage={onPage} />
      </div>
    </section>
  );
}
