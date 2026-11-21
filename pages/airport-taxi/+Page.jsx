import ServicePageView from "../../src/components/ServicePageView";
import AirportTaxi from "../../src/components/landing/airport/AirportTaxi";

// "Airport Cabs" menu page. Content = CMS override if one exists, else src/content/serviceDefaults.js;
// layout = src/components/landing/airport (airport-themed).
export default function Page() { return <ServicePageView slug="airport-taxi" Layout={AirportTaxi} />; }
