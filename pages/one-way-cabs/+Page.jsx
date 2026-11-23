import ServicePageView from "../../src/components/ServicePageView";
import OneWayOutstation from "../../src/components/landing/outstation/OneWayOutstation";

// "One Way Cabs" menu page — Outstation page design + One-Way content
// (src/content/serviceDefaults.js "one-way-outstation", or its CMS override).
export default function Page() { return <ServicePageView slug="one-way-outstation" Layout={OneWayOutstation} />; }
