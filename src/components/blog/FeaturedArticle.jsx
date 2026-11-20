import React from "react";
import { ArrowRight } from "lucide-react";
import BlogImage from "./BlogImage";
import ArticleMeta, { CategoryTag } from "./ArticleMeta";
import { blogUrl, titleOf } from "../../lib/blog";

/** Magazine cover: full-width photo, headline and summary set on it. */
export default function FeaturedArticle({ blog }) {
  if (!blog) return null;
  const url = blogUrl(blog);
  return (
    <section id="featured" aria-labelledby="featured-title" className="bg-white pt-12 md:pt-16 scroll-mt-28">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
        <h2 id="featured-title" className="flex items-center gap-2.5 mb-5 text-[12px] font-black uppercase tracking-[0.2em] text-text-secondary"><span aria-hidden className="h-[3px] w-8 bg-primary rounded-full" />Featured Story</h2>
        <article className="group relative overflow-hidden rounded-[28px] bg-[#111] isolate">
          <a href={url} aria-label={titleOf(blog)} tabIndex={-1} className="block">
            <BlogImage blog={blog} width={1600} priority className="w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/9] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none" />
          </a>
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14 text-white">
            <CategoryTag blog={blog} href={`/blogs?category=${encodeURIComponent((blog.category || "").toLowerCase().replace(/\s+/g, "-"))}`} />
            <h3 className="mt-4 max-w-[860px] text-[28px] sm:text-[40px] lg:text-[54px] font-black leading-[1.02] tracking-[-0.035em] [text-wrap:balance]">
              <a href={url} className="hover:text-primary transition-colors">{titleOf(blog)}</a>
            </h3>
            {blog.description && <p className="mt-4 max-w-[640px] text-[15px] md:text-[17px] text-white/80 leading-relaxed line-clamp-3">{blog.description}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {url && (
              <a href={url} className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-primary text-[#111] font-bold text-[15px] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Read Full Article <ArrowRight size={16} aria-hidden /></a>
              )}
              <ArticleMeta blog={blog} light />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
