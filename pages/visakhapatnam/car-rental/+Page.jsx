import CityLanding from "../../../src/components/CityLanding";
import { CITY_CONTENT } from "../../../src/content/cityDefaults";

export default function Page() {
  const city = CITY_CONTENT["visakhapatnam"];
  if (!city) return <div className="py-20 text-center text-text-secondary">City not found.</div>;
  return <CityLanding cfg={city} />;
}
