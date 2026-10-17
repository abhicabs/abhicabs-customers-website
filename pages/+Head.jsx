import React from "react";

/**
 * Global <head> — renders on every page.
 *
 * Per-page overrides (title, description, canonical) are handled via
 * Vike's +config.js per directory or the useConfig() hook.
 *
 * This file provides:
 *  • Viewport, theme-color, favicons, manifest (PWA)
 *  • Default Open Graph / Twitter Card meta (overridden per page)
 *  • Google Search Console verification
 *  • Structured data (JSON-LD) — LocalBusiness + WebSite SearchAction
 */

const SITE  = "https://www.abhicabs24x7.com";
const TITLE = "AbhiCabs — Outstation Cab Booking | Karnataka & Hyderabad";
const DESC  = "Book outstation cabs, airport transfers, local rentals and group transport across Karnataka & Hyderabad. Sedans, SUVs, Innovas, tempo travellers & 49-seater buses. Transparent pricing, professional drivers, 24×7 support.";
const IMAGE = `${SITE}/images/Herosection.jpg`;

// LocalBusiness + WebSite structured data for Google rich results
const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE}/#business`,
    name: "AbhiCabs",
    alternateName: "Abhi Cabs 24x7",
    url: SITE,
    logo: `${SITE}/images/abhi-cabs-logo-new.svg`,
    image: IMAGE,
    description: DESC,
    telephone: "+91-80-1234-5678",
    email: "support@abhicabs24x7.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 12.9716,
      longitude: 77.5946,
    },
    areaServed: [
      { "@type": "State", name: "Karnataka" },
      { "@type": "City", name: "Hyderabad" },
      { "@type": "City", name: "Bengaluru" },
    ],
    priceRange: "₹₹",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
      ],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: SITE,
    name: "AbhiCabs",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/booking-search?pickup={pickup}&drop={drop}`,
      "query-input": "required name=pickup required name=drop",
    },
  },
];

export default function HeadDefault() {
  return (
    <>
      {/* ── Viewport & PWA ── */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#FFD54F" />
      <link rel="manifest" href="/manifest.json" />

      {/* ── Favicons ── */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
      <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=3" />
      <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=3" />

      {/* ── SEO meta ── */}
      <meta name="description" content={DESC} />
      <meta name="keywords" content="outstation cabs, cab booking, Bangalore cab, Hyderabad cab, airport transfer, tempo traveller, bus rental, one way cab, round trip cab, Karnataka cab service, AbhiCabs" />
      <meta name="author" content="AbhiCabs" />
      <link rel="canonical" href={SITE} />

      {/* ── Open Graph (Facebook, LinkedIn, WhatsApp) ── */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="AbhiCabs" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESC} />
      <meta property="og:image" content={IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={SITE} />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESC} />
      <meta name="twitter:image" content={IMAGE} />

      {/* ── Google Search Console verification ──
          Replace the content value with your actual verification code
          from https://search.google.com/search-console → Settings → Ownership verification → HTML tag */}
      {/* <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" /> */}

      {/* ── Structured data (JSON-LD) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
    </>
  );
}
