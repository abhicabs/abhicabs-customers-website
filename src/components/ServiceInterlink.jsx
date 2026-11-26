import React from "react";
import Reveal from "./ui/Reveal";

/**
 * Compact service interlink strip — drops into any page to cross-link services.
 * Shows 3–6 service cards with icon, title, description and link.
 */
import { Car, Truck, Navigation, Plane, Repeat, Building2, BookOpen, ArrowRight } from "lucide-react";

const SERVICE_ICONS = { Car, Truck, Navigation, Plane, Repeat, Building2 };
const SERVICES = [
  { Icon: Car, label: "Local Car Rental", desc: "Hourly & full-day city rides", href: "/local-car-rental" },
  { Icon: Truck, label: "Our Vehicles", desc: "Browse all our vehicles", href: "/our-vehicles" },
  { Icon: Navigation, label: "One Way Cabs", desc: "Intercity one-way trips", href: "/one-way-cabs" },
  { Icon: Plane, label: "Airport Taxi", desc: "On-time airport transfers", href: "/airport-taxi" },
  { Icon: Repeat, label: "Round Trip Cabs", desc: "City-to-city round trips", href: "/round-trip-cabs" },
  { Icon: Building2, label: "Corporate", desc: "Business travel solutions", href: "/services/corporate-car-rental" },
];

export default function ServiceInterlink({ exclude, title = "Explore Our Services", max = 5, className = "" }) {
  const items = SERVICES.filter((s) => s.href !== exclude).slice(0, max);
  return (
    <section className={`py-10 ${className}`}>
      <div className="max-w-[1264px] mx-auto px-6">
        <Reveal>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold">{title}</h3>
            <a href="/services" className="text-[13px] font-bold text-[#E6AC00] hover:underline flex items-center gap-1">
              All Services <ArrowRight size={13} />
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {items.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="group flex items-center gap-3 p-4 rounded-[14px] border border-[#E5E7EB] bg-white hover:border-[#E6AC00] hover:shadow-md transition-all"
              >
                <span className="w-9 h-9 rounded-[10px] bg-[#FFF8E1] flex items-center justify-center shrink-0"><s.Icon size={18} className="text-[#E6AC00]" /></span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[#111] group-hover:text-[#E6AC00] truncate">{s.label}</div>
                  <div className="text-[11px] text-[#9CA3AF] truncate">{s.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Inline blog interlink — shows related blog posts on service/fleet/outstation pages.
 */
export function BlogInterlink({ blogs = [], title = "From Our Blog", max = 3, className = "" }) {
  if (!blogs.length) return null;
  const items = blogs.slice(0, max);
  return (
    <section className={`py-10 ${className}`}>
      <div className="max-w-[1264px] mx-auto px-6">
        <Reveal>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[16px] font-bold">{title}</h3>
            <a href="/blogs" className="text-[13px] font-bold text-[#E6AC00] hover:underline flex items-center gap-1">
              All Articles <ArrowRight size={13} />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((blog) => (
              <a
                key={blog.slug}
                href={`/blogs/${blog.slug}`}
                className="group rounded-[14px] border border-[#E5E7EB] bg-white overflow-hidden hover:shadow-md transition-all"
              >
                {blog.heroImage && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={blog.heroImage} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-4">
                  {blog.category && <div className="text-[11px] font-bold text-[#E6AC00] uppercase tracking-wider mb-1">{blog.category}</div>}
                  <h4 className="text-[14px] font-bold leading-snug line-clamp-2 group-hover:text-[#E6AC00]">{blog.title || blog.headline}</h4>
                  {blog.description && <p className="text-[12px] text-[#9CA3AF] mt-1.5 line-clamp-2">{blog.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Quick-book strip — a compact row of booking shortcuts for common trip types.
 */
export function QuickBookStrip({ className = "" }) {
  const trips = [
    { label: "Book Local Cab", href: "/local-car-rental" },
    { label: "Airport Taxi", href: "/airport-taxi" },
    { label: "One Way Cabs", href: "/one-way-cabs" },
    { label: "Round Trip", href: "/round-trip-cabs" },
    { label: "Our Vehicles", href: "/our-vehicles" },
  ];
  return (
    <div className={`py-6 ${className}`}>
      <div className="max-w-[1264px] mx-auto px-6">
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {trips.map((t) => (
            <a key={t.href} href={t.href}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-[#E5E7EB] bg-white hover:border-[#E6AC00] hover:bg-[#FFFBEB] transition-all whitespace-nowrap shrink-0">
                            <span className="text-[13px] font-bold">{t.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
