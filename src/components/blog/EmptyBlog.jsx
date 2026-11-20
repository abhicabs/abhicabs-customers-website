import React from "react";
import { ArrowRight, Car, Plane, Navigation, Repeat, Briefcase } from "lucide-react";
import { SERVICE_LINKS, ROUTES } from "../../data/siteLinks";

/**
 * Production state when no posts have been published yet. Honest — no placeholder
 * articles: it previews the TOPICS the journal will cover (marked "Coming soon")
 * and points visitors to real service pages in the meantime.
 */
export const BLOG_TOPICS = [
  { key: "guides", label: "Travel Guides",      blurb: "Destination ideas, what to see and how to plan the trip.",       img: "/images/hero-blog-travel.webp" },
  { key: "roads",  label: "Road Trips",         blurb: "Scenic routes, driving times and the best stops along the way.", img: "/images/hero-hill-road.webp" },
  { key: "tips",   label: "Travel Tips",        blurb: "Practical advice for booking, packing and travelling with family.", img: "/images/hero-fleet-hills.webp" },
  { key: "air",    label: "Airport Travel",     blurb: "Pickups, drops and timing your cab around your flight.",          img: "/images/hero-airport-coast.webp" },
];

const SERVICE_ICON = { local: Car, airport: Plane, "one-way": Navigation, "round-trip": Repeat };

export default function EmptyBlog() {
  return (
    <>
      {/* ── Coming soon + topics ── */}
      <section id="topics" className="bg-[#FFFBEA] border-b border-[#F2E6C9] py-14 md:py-20 scroll-mt-28">
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
          <div className="max-w-[680px] mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#111] text-[#FFD54F] text-[12px] font-black uppercase tracking-[0.16em] px-4 py-1.5">
              <span aria-hidden className="w-2 h-2 rounded-full bg-[#FFD54F] animate-pulse" /> Coming soon
            </span>
            <h2 className="mt-5 text-[30px] md:text-[40px] font-black tracking-tight leading-[1.08]">Our first travel stories are on the way</h2>
            <p className="mt-3 text-text-secondary text-[16px] leading-relaxed">We&rsquo;re putting together destination guides, route tips and travel advice. Here&rsquo;s what the journal will cover.</p>
          </div>

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BLOG_TOPICS.map((t) => (
              <li key={t.key} className="group relative overflow-hidden rounded-[20px] bg-[#111] min-h-[300px] flex flex-col justify-end shadow-[0_20px_40px_-24px_rgba(0,0,0,.5)]">
                <img src={t.img} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 text-[#111] text-[11px] font-black uppercase tracking-[0.14em] px-3 py-1">Coming soon</span>
                <div className="relative p-6">
                  <h3 className="text-white text-[21px] font-extrabold">{t.label}</h3>
                  <p className="mt-1.5 text-white/75 text-[14px] leading-relaxed">{t.blurb}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── While you wait: real service pages ── */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1264px] mx-auto px-5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="flex items-center gap-2.5 text-[12px] font-black uppercase tracking-[0.18em] text-[#7A5D00]"><span aria-hidden className="w-7 h-[3px] rounded-full bg-primary" />While you wait</p>
              <h2 className="mt-3 text-[28px] md:text-[34px] font-black tracking-tight">Plan your trip right now</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={ROUTES.booking} className="inline-flex items-center h-12 px-7 rounded-full bg-primary font-bold hover:bg-[#E6AC00] transition-colors">Book a Cab</a>
              <a href={ROUTES.services} className="inline-flex items-center h-12 px-7 rounded-full border-2 border-[#111] font-bold hover:bg-[#111] hover:text-white transition-colors">Our Services</a>
            </div>
          </div>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SERVICE_LINKS.map((s) => {
              const Icon = SERVICE_ICON[s.mode] || Briefcase;
              return (
                <li key={s.href}>
                  <a href={s.href} className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:border-[#E6AC00] hover:-translate-y-0.5 transition-all">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#111] text-[#FFD54F] shrink-0"><Icon size={19} aria-hidden /></span>
                    <span className="flex-1 font-bold text-[14.5px] leading-snug">{s.label}</span>
                    <ArrowRight size={16} aria-hidden className="text-[#B88A00] transition-transform group-hover:translate-x-1" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
