import React, { useId, useMemo, useRef, useState } from "react";
import { Search, X, Car, CarTaxiFront, Plane, Route, ChevronRight } from "lucide-react";
import { LINK_GROUPS, linksOf } from "../data/linkDirectory";

/**
 * Site-wide link directory shown above the footer.
 * Every group's links are in the server-rendered HTML (inactive tabs use `hidden`),
 * so search engines can follow all of them; tabs and search only change what's visible.
 */

const ICONS = { car: Car, taxi: CarTaxiFront, plane: Plane, route: Route };

/* Every item is a text link in the brand's dark gold: an arrow mark and a light underline
   show it's clickable at rest; hover adds a soft yellow highlight and a thicker underline. */
const linkCls =
  "group/link -mx-2 inline-flex items-start gap-2.5 rounded-lg px-2 py-[5px] text-[15px] font-semibold leading-snug text-[#8A6100] underline decoration-[#E9C766] decoration-1 underline-offset-[5px] transition-colors visited:text-[#8A6100] hover:bg-primary-tint hover:text-[#5E4200] hover:decoration-primary hover:decoration-[3px] outline-none focus-visible:bg-primary-tint focus-visible:ring-2 focus-visible:ring-[#8A6100]";

const COLS = "grid grid-cols-1 min-[460px]:grid-cols-2 lg:grid-cols-4 gap-x-8";

function LinkList({ links, className = "" }) {
  return (
    <ul className={className}>
      {links.map((l) => (
        <li key={l.href + l.label}>
          <a href={l.href} className={linkCls}>
            <ChevronRight size={16} strokeWidth={2.75} aria-hidden
              className="mt-[2px] w-4 h-4 shrink-0 text-[#E6AC00] transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:text-[#8A6100] motion-reduce:transition-none" />
            <span>{l.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** One short line above the links saying what this tab holds. */
const summaryOf = (g) => {
  if (g.sections) return `${linksOf(g).length} routes from ${g.sections.length} cities`;
  return { "car-rental": "Cab and car rental pages for each city we serve", "taxi-services": "Every way to book a ride with us", "airport-taxi": "Airport pickups and drops by city" }[g.id] || "";
};

function GroupBody({ group }) {
  const summary = summaryOf(group);
  return (
    <>
      {summary && <p className="mb-4 pb-4 border-b border-dashed border-[#EADFB8] text-[14px] font-medium text-text-secondary">{summary}</p>}
      {group.links ? (
        <LinkList links={group.links} className={COLS} />
      ) : (
        <div className={`${COLS} gap-y-7`}>
          {group.sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-2 flex items-start gap-2.5 text-[16px] font-extrabold tracking-[-0.01em] leading-tight text-text">
                <span aria-hidden className="mt-[2px] grid place-items-center w-4 h-4 shrink-0 rounded-full bg-text">
                  <span className="w-[6px] h-[6px] rounded-full bg-primary" />
                </span>
                <span>
                  From {s.title}
                  <span className="mt-0.5 block text-[12.5px] font-semibold tracking-normal text-text-secondary">{s.links.length} routes</span>
                </span>
              </h3>
              <LinkList links={s.links} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function LinkDirectory() {
  const uid = useId();
  const [active, setActive] = useState(LINK_GROUPS[0].id);
  const [query, setQuery] = useState("");
  const tabRefs = useRef({});

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return LINK_GROUPS.map((g) => ({ ...g, matches: linksOf(g).filter((l) => l.label.toLowerCase().includes(q)) }))
      .filter((g) => g.matches.length);
  }, [q]);
  const total = results.reduce((n, g) => n + g.matches.length, 0);

  // Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e, i) => {
    const last = LINK_GROUPS.length - 1;
    const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const id = LINK_GROUPS[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <section aria-labelledby={`${uid}-title`} className="bg-primary-tint border-t border-[#F3E3A4]">
      <div className="max-w-[1264px] mx-auto px-5 sm:px-6 py-14 md:py-20">
        <div>
            <h2 id={`${uid}-title`} className="text-[28px] md:text-[38px] font-extrabold tracking-[-0.035em] leading-[1.1] text-text [text-wrap:balance]">
              Explore cabs by city and route
            </h2>
            <p className="mt-3 text-[15.5px] text-text-secondary leading-relaxed">Pick a city, a service or a route and go straight to its page.</p>
        </div>

        {/* One row: tabs on the left, search on the right (search first on phones).
            Both are 56px tall so their edges line up. */}
        <div className="mt-8 flex flex-col-reverse gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div hidden={!!q} className="min-w-0 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto snap-row">
          <div role="tablist" aria-label="Link groups" className="inline-flex gap-1 rounded-full bg-white p-1.5 shadow-[0_1px_0_rgba(17,17,17,0.06)]">
            {LINK_GROUPS.map((g, i) => {
              const on = g.id === active;
              const Icon = ICONS[g.icon] || Car;
              return (
                <button
                  key={g.id}
                  ref={(el) => { tabRefs.current[g.id] = el; }}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${g.id}`}
                  aria-selected={on}
                  aria-controls={`${uid}-panel-${g.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(g.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`inline-flex items-center gap-2 h-11 shrink-0 rounded-full pl-4 pr-2.5 text-[15px] font-bold whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 ${on ? "bg-text text-primary" : "text-text hover:bg-primary-tint"}`}
                >
                  <Icon size={18} strokeWidth={2.2} aria-hidden />
                  {g.title}
                  <span className={`grid place-items-center min-w-[26px] h-[22px] rounded-full px-1.5 text-[12px] font-extrabold ${on ? "bg-primary text-text" : "bg-primary-tint text-text-secondary"}`}>
                    {linksOf(g).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <label className="relative block w-full lg:w-[320px] shrink-0">
            <span className="sr-only">Search cities, services and routes</span>
            <Search size={18} aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-text pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city or route"
              className="w-full h-14 rounded-full border-2 border-transparent bg-white pl-11 pr-12 text-[15px] font-medium text-text shadow-[0_1px_0_rgba(17,17,17,0.06)] placeholder:font-normal placeholder:text-text-secondary/80 outline-none transition-colors focus:border-text [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full text-text hover:bg-primary-tint focus-visible:outline-2 focus-visible:outline-text">
                <X size={16} aria-hidden />
              </button>
            )}
          </label>
        </div>

        {LINK_GROUPS.map((g) => (
          <div key={g.id} role="tabpanel" id={`${uid}-panel-${g.id}`} aria-labelledby={`${uid}-tab-${g.id}`}
            hidden={!!q || g.id !== active} className="mt-6 ld-panel rounded-[22px] border border-[#F1E3B0] border-t-[4px] border-t-primary bg-white px-5 py-5 md:px-8 md:py-7 shadow-[0_10px_30px_-18px_rgba(138,97,0,0.35)]">
            <GroupBody group={g} />
          </div>
        ))}

        {/* Search results replace the tabs while a search is typed */}
        {q && (
          <div className="mt-6 rounded-[22px] border border-[#F1E3B0] border-t-[4px] border-t-primary bg-white px-5 py-5 md:px-8 md:py-7 shadow-[0_10px_30px_-18px_rgba(138,97,0,0.35)]" aria-live="polite">
            <p className="text-[14.5px] font-semibold text-text-secondary">
              {total ? `${total} ${total === 1 ? "match" : "matches"} for “${query.trim()}”` : `No page matches “${query.trim()}” yet.`}
            </p>
            {total ? (
              <div className="mt-5 grid gap-y-7">
                {results.map((g) => (
                  <div key={g.id}>
                    <h3 className="mb-1.5 text-[15px] font-extrabold text-text">{g.title}</h3>
                    <LinkList links={g.matches} className={COLS} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <p className="mb-3 text-[15px] text-text-secondary">You can still book any trip:</p>
                <LinkList links={[{ label: "One-way cabs", href: "/one-way-cabs" }, { label: "Round-trip cabs", href: "/round-trip-cabs" }]} className="flex gap-6" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
