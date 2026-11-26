/**
 * "Explore cabs by city and route" link directory (shown above the footer).
 *
 * Built from the real page content, so every link points at a page that exists:
 *  - a new city in src/content/cityDefaults.js automatically gets its car-rental,
 *    airport and outstation-route links here;
 *  - airport links are only added for cities whose page offers an airport service;
 *  - route links open the city page at its outstation-routes board (#routes).
 */
import { CITY_CONTENT } from "../content/cityDefaults";

const cities = Object.entries(CITY_CONTENT).map(([slug, c]) => ({ slug, name: c.cityName, c }));

const CITY_LINKS = [
  { name: "Bangalore", href: "/bangalore/car-rental" },
  ...cities.map(({ slug, name }) => ({ name, href: `/cities/${slug}` })),
];

export const LINK_GROUPS = [
  {
    id: "car-rental",
    title: "Car rental",
    icon: "car",
    kind: "cities",
    links: CITY_LINKS.map((x) => ({ label: `Car rental in ${x.name}`, href: x.href })),
  },
  {
    id: "taxi-services",
    title: "Taxi services",
    icon: "taxi",
    kind: "services",
    links: [
      { label: "Local car rental", desc: "Hourly and full-day city rides", href: "/local-car-rental", icon: "clock" },
      { label: "Airport taxi", desc: "Pickups and drops, day or night", href: "/airport-taxi", icon: "plane" },
      { label: "One-way cabs", desc: "Intercity trips without a return", href: "/one-way-cabs", icon: "route" },
      { label: "Round-trip cabs", desc: "City-to-city trips with a return", href: "/round-trip-cabs", icon: "repeat" },
      { label: "Corporate travel", desc: "Business and employee transport", href: "/services/corporate-car-rental", icon: "building" },
      { label: "Tempo Traveller hire", desc: "Family tours, pilgrimages and group trips", href: "/vehicles/tempo-traveller", icon: "bus" },
      { label: "All our vehicles", desc: "Sedans, SUVs and group vehicles", href: "/our-vehicles", icon: "car" },
    ],
  },
  {
    id: "airport-taxi",
    title: "Airport taxi",
    icon: "plane",
    kind: "cities",
    links: [
      { label: "Airport taxi booking", href: "/airport-taxi" },
      ...cities
        .filter(({ c }) => c.services?.items?.some((s) => /airport/i.test(s.title)))
        .map(({ slug, name }) => ({ label: `Airport taxi in ${name}`, href: `/cities/${slug}#uses` })),
    ],
  },
  {
    id: "outstation-routes",
    title: "Outstation routes",
    icon: "route",
    kind: "routes",
    sections: cities
      .filter(({ c }) => c.outstationRoutes?.routes?.length)
      .map(({ slug, name, c }) => ({
        title: name,
        links: c.outstationRoutes.routes.map((r) => {
          const dest = /^.+? to (.+?)(?:\s+Cabs?)?$/i.exec(r.label)?.[1] || r.label;
          return { label: `${name} to ${dest} cab`, href: `/cities/${slug}#routes` };
        }),
      })),
  },
];

/** Every link in a group, whether it has sub-sections or not. */
export const linksOf = (g) => g.links || g.sections.flatMap((s) => s.links);
