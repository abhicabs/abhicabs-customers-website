import BangaloreCarRental from "../../../src/components/landing/bangalore/BangaloreCarRental";
import { LANDING_PAGES } from "../../../src/content/landingPages";

// SEO landing page — content lives in src/content/landingPages.js ("bangalore-car-rental"),
// layout lives in src/components/landing/bangalore/.
export default function Page() { return <BangaloreCarRental cfg={LANDING_PAGES["bangalore-car-rental"]} />; }
