/**
 * Every internal route and nav/footer link lives here — one place to edit.
 * Header, Footer, service pages and the Contact page all import from this file,
 * so a link can't be right in one place and dead in another.
 * (Header/Footer still accept CMS overrides from Site Settings.)
 */
export const ROUTES = {
  home: "/",
  booking: "/#booking",
  about: "/about",
  fleet: "/our-vehicles",
  services: "/services",
  blogs: "/blogs",
  contact: "/contact",
  contactForm: "/contact#contact-form",
  myBooking: "/my-booking",
  supportTickets: "/support-tickets",
  privacy: "/privacy",
  terms: "/terms",
  cancellation: "/cancellation",
};

/** Built-in service pages live at URLs that match their navbar names; CMS-created
 *  service pages stay at /services/<slug>. Use this whenever a URL is built from a slug. */
export const SERVICE_URLS = {
  local: "/local-car-rental",
  "one-way-outstation": "/one-way-cabs",
  "airport-taxi": "/airport-taxi",
  "round-trip": "/round-trip-cabs",
  corporate: "/services/corporate-car-rental",
};
export const serviceHref = (slug) => SERVICE_URLS[slug] || `/services/${slug}`;

export const contactFormHref = (subject) => `/contact?subject=${encodeURIComponent(subject)}#contact-form`;

export const SERVICE_LINKS = [
  { href: "/local-car-rental", label: "Local Taxi Services", short: "Local Car Rental", mode: "local" },
  { href: "/airport-taxi", label: "Airport Taxi", short: "Airport Taxi", mode: "airport" },
  { href: "/one-way-cabs", label: "One-Way Cabs", short: "One Way Cabs", mode: "one-way" },
  { href: "/round-trip-cabs", label: "Round Trip Services", short: "Round Trip Cabs", mode: "round-trip" },
  { href: "/services/corporate-car-rental", label: "Corporate Transportation", short: "Corporate Car Rental", mode: null },
];

export const NAV_LINKS = [
  { href: "/local-car-rental", label: "Local Car Rental" },
  { href: ROUTES.fleet, label: "Our Vehicles" },
  { href: "/one-way-cabs", label: "One Way Cabs" },
  { href: "/airport-taxi", label: "Airport Taxi" },
  { href: "/round-trip-cabs", label: "Round Trip Cabs" },
  { href: ROUTES.blogs, label: "Blogs" },
  { href: ROUTES.contact, label: "Contact" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Quick Links",
    links: [
      ["Home", ROUTES.home],
      ["About", ROUTES.about],
      ["Our Vehicles", ROUTES.fleet],
      ["Tempo Traveller", "/vehicles/tempo-traveller"],
      ["All Services", ROUTES.services],
      ["Blogs", ROUTES.blogs],
      ["Contact", ROUTES.contact],
    ],
  },
  {
    title: "Services",
    links: SERVICE_LINKS.map((s) => [s.short, s.href]),
  },
  {
    title: "Destinations",
    links: [
      ["Bangalore", "/bangalore/car-rental"],
      ["Hyderabad", "/cities/hyderabad"],
      ["Mumbai", "/cities/mumbai"],
      ["Mangaluru", "/cities/mangaluru"],
      ["Pune", "/cities/pune"],
      ["Tirupati", "/cities/tirupati"],
      ["Visakhapatnam", "/cities/visakhapatnam"],
    ],
  },
];

export const LEGAL_LINKS = [
  ["Privacy Policy", ROUTES.privacy],
  ["Terms", ROUTES.terms],
  ["Cancellation Policy", ROUTES.cancellation],
];

/** True when `href` is the page we're on (Home matches only "/"). */
export const isActivePath = (href, path = "/") => {
  const base = href.split("#")[0].split("?")[0] || "/";
  return base === "/" ? path === "/" : path === base || path.startsWith(base + "/");
};
