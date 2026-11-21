import vikeReact from "vike-react/config";
import Layout from "../src/components/Layout";

export default {
  extends: [vikeReact],
  // SSR enabled for SEO — Google needs rendered HTML to index pages.
  // The Redux store hydrates client-side after the initial server render,
  // so transactional pages (checkout, payment, my-booking) still work as
  // SPAs while public pages get proper meta tags in the crawled HTML.
  ssr: true,
  // noExtraDir: write /about.html (not /about/index.html) so Netlify serves /about directly —
  // matching the canonical, the sitemap and internal links (no /about → /about/ redirect).
  prerender: { noExtraDir: true },
  // Defaults only — every page sets its own title/description (+config.js or useConfig); vike-react emits <title>, meta description,
  // og:title/og:description/og:image and the Twitter card from these, so the global <Head> must NOT repeat them.
  title: "Abhi Cabs | Outstation, Local & Airport Cab Booking",
  description: "Book outstation, one-way, round-trip, local and airport cabs online with Abhi Cabs. Pickups across Karnataka, Andhra Pradesh, Telangana and Maharashtra.",
  image: "https://abhicabs24x7.com/images/Herosection.jpg",
  Layout,
  // Permanent (301) redirects for URLs that moved. Keeps old links and search rankings pointing at the new page.
  // Menu pages now live at URLs that match their navbar names.
  redirects: {
    "/services/local": "/local-car-rental",
    "/fleet": "/our-vehicles",
    "/services/one-way-outstation": "/one-way-cabs",
    "/services/airport-taxi": "/airport-taxi",
    "/services/round-trip": "/round-trip-cabs",
    "/contact-us": "/contact",
    "/services/airport-transfer": "/airport-taxi",
    "/blog": "/blogs",
  },
  // Real brand favicon (the "A" road-and-pin mark). Uses the pre-rasterized
  // .ico rather than the raw .svg — the source logo is a highly detailed
  // illustrated mark (hundreds of small shading paths), and browsers
  // rendering that SVG live at actual favicon size (16-32px) were dropping
  // most of the detail, including the black "A" frame itself, leaving only
  // a thin yellow squiggle visible. Rasterizing at high resolution first
  // and downscaling with proper image resampling (done once, ahead of
  // time, in public/favicon.ico) avoids that entirely. See pages/+Head.jsx
  // for the additional apple-touch-icon and larger PNG sizes this basic
  // config option doesn't cover.
  favicon: "/favicon.ico?v=3",
  // Tailwind utility classes applied straight to <html>/<body> via Vike's
  // own config, instead of a hand-written `html { scroll-behavior: smooth }`
  // / `body { @apply ... }` rule in global.css.
  htmlAttributes: { lang: "en", class: "scroll-smooth" },
  bodyAttributes: { class: "font-sans bg-bg text-text antialiased" }
};
