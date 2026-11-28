import TempoTraveller from "../../../src/components/landing/tempo/TempoTraveller";
import { LANDING_PAGES } from "../../../src/content/landingPages";

// Tempo Traveller & group vehicle rental — standard service-page design (src/components/landing/tempo).
// Content lives in src/content/landingPages.js ("tempo-traveller").
export default function Page() { return <TempoTraveller cfg={LANDING_PAGES["tempo-traveller"]} />; }
