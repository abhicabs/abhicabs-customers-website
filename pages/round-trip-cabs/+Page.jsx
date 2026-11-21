import ServicePageView from "../../src/components/ServicePageView";
import RoundTrip from "../../src/components/landing/intercity/RoundTrip";

// "Intercity Cabs" menu page. Content = CMS override if one exists, else src/content/serviceDefaults.js;
// layout = src/components/landing/intercity (round-trip themed).
export default function Page() { return <ServicePageView slug="round-trip" Layout={RoundTrip} />; }
