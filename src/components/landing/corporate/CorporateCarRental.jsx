import React from "react";
import PageHero from "../../ui/PageHero";
import Button from "../../ui/Button";
import CtaBand from "../../CtaBand";
import SectionRenderer from "../../SectionRenderer";
import CorporateEnquiryForm from "../../CorporateEnquiryForm";
import useCmsContent from "../../../hooks/useCmsContent";
import { BenefitRows, FaqSearch } from "../local/LocalSections";
import { renderInline } from "../bangalore/shared";
import { LeadIntro, ServiceCards, MonthlyPlans, VehicleCards, CityCards, PricingSheet, ConsiderList } from "./CorporateSections";

const FORM_ID = "corporate-enquiry";
// Scroll to the enquiry form (without loading the booking widget code this page doesn't use).
const scrollToForm = () => document.getElementById(FORM_ID)?.scrollIntoView({ behavior: "smooth", block: "center" });

/**
 * /services/corporate-car-rental — the "Corporate Car Rental" page. Content is whatever
 * ServicePageView passes in (CMS version if an editor created one, else serviceDefaults.corporate);
 * layout matches the other service pages, with the corporate enquiry form where they have the
 * booking widget. Every call to action goes to that form.
 */
export default function CorporateCarRental({ cfg }) {
  const primaryLabel = cfg.primaryLabel || "Request a Corporate Car Rental Quote";
  const defaults = {
    hero: { title: cfg.hero.heading, accent: "", description: cfg.hero.description, image: cfg.hero.image },
    faqs: (cfg.faqs || []).map(([q, a]) => ({ q, a: renderInline(a), text: a })), // links/bold render; search uses the plain text
    cta: { line1: cfg.cta.line1, line2: cfg.cta.line2, description: cfg.cta.description, primaryLabel: cfg.cta.buttonLabel || primaryLabel },
  };
  const { content: c, extraSections } = useCmsContent(cfg.slug, defaults);
  const on = (id) => !cfg.layout || cfg.layout.find((l) => l.id === id)?.enabled !== false;
  const blocks = cfg.blocks || {};
  const toForm = scrollToForm;
  // bold phrases sit on the dark band, so they're white there
  const ctaText = (
    <span className="block [&_strong]:text-white">
      {Array.isArray(c.cta.description)
        ? c.cta.description.map((p, i) => <span key={i} className={i ? "block mt-3" : "block"}>{renderInline(p)}</span>)
        : renderInline(c.cta.description)}
    </span>
  );

  return (
    <>
      <PageHero
        center image={c.hero.image} imagePosition={c.hero.image === cfg.hero.image ? cfg.hero.imagePosition : undefined} imageAlt={cfg.hero.alt || ""}
        breadcrumb={cfg.breadcrumb || [["Home", "/"], ["Services", "/services"], [cfg.hero.eyebrow || "Corporate Car Rental", null]]}
        title={c.hero.title} subtitle={cfg.enquiry?.heading || cfg.hero.subheading} description={c.hero.description}
      >
        {on("enquiry") && cfg.enquiry && <CorporateEnquiryForm id={FORM_ID} form={cfg.enquiry.form} variant="hero" />}
      </PageHero>

      {on("enquiry") && cfg.enquiry && <LeadIntro data={cfg.enquiry} />}
      {on("intro") && cfg.intro?.items?.length > 0 && <ServiceCards data={cfg.intro} />}
      {on("block:monthly") && blocks.monthly && <MonthlyPlans data={blocks.monthly} />}
      {on("block:vehicles") && blocks.vehicles && <VehicleCards data={blocks.vehicles} />}
      {on("block:cities") && blocks.cities && <CityCards data={blocks.cities} />}
      {on("features") && cfg.features?.items?.length > 0 && <BenefitRows data={cfg.features} ctaLabel={cfg.features.ctaLabel} onCta={toForm} />}
      {on("block:pricing") && blocks.pricing && <PricingSheet data={blocks.pricing} />}
      {on("block:considerations") && blocks.considerations && <ConsiderList data={blocks.considerations} />}
      {on("faqs") && c.faqs?.length > 0 && <FaqSearch heading={cfg.faqHeading || "Frequently Asked Questions"} items={c.faqs} placeholder="Search questions, e.g. GST invoice, monthly rental, airport" />}

      {extraSections.length > 0 && <SectionRenderer sections={extraSections} />}

      <CtaBand
        image={c.hero.image}
        title={<>{c.cta.line1}{c.cta.line2 ? <> <span className="text-[#FFD54F]">{c.cta.line2}</span></> : null}</>}
        subheading={cfg.cta.subheading && c.cta.line1 === cfg.cta.line1 ? cfg.cta.subheading : undefined}
        description={ctaText}
        actions={<>
          <Button variant="inverse" size="lg" className="whitespace-normal! h-auto! min-h-14 py-3.5" onClick={toForm}>{c.cta.primaryLabel}</Button>
          <Button href="/contact" variant="outlineInverse" size="lg">Talk to Us</Button>
        </>}
      />
    </>
  );
}
