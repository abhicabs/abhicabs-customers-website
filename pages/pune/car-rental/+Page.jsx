import CityLanding from "../../../src/components/CityLanding";
import { CITY_CONTENT } from "../../../src/content/cityDefaults";

// SEO landing page — /pune/car-rental replaces /cities/pune.
// Content lives in src/content/cityDefaults.js ("pune"),
// layout lives in src/components/CityLanding.
export default function Page() {
  const city = CITY_CONTENT.pune;
  if (!city) return <div className="py-20 text-center text-text-secondary">City not found.</div>;
  return <CityLanding cfg={city} />;
}
