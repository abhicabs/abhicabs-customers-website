import ServiceLanding from "./ServiceLanding";
import ServiceTemplate from "./landing/template/ServiceTemplate";
import LocalCarRental from "./landing/local/LocalCarRental";
import AirportTaxi from "./landing/airport/AirportTaxi";
import OneWayOutstation from "./landing/outstation/OneWayOutstation";
import RoundTrip from "./landing/intercity/RoundTrip";
import CorporateCarRental from "./landing/corporate/CorporateCarRental";
import { SERVICE_DEFAULTS } from "../content/serviceDefaults";

/**
 * Which layout draws a service page — the same choice the live routes make
 * (pages/local-car-rental, /airport-taxi, /one-way-cabs, /round-trip-cabs,
 * /services/corporate-car-rental, and ServicePageView for CMS-created pages).
 * Used by the CMS live preview so it shows exactly what visitors will see.
 */
const BUILT_IN = {
  local: LocalCarRental,
  "airport-taxi": AirportTaxi,
  "one-way-outstation": OneWayOutstation,
  "round-trip": RoundTrip,
  corporate: CorporateCarRental,
};

export function layoutForSlug(slug) {
  return BUILT_IN[slug] || (SERVICE_DEFAULTS[slug] ? ServiceLanding : ServiceTemplate);
}
