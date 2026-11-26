import ServicePageView from "../../../src/components/ServicePageView";
import CorporateCarRental from "../../../src/components/landing/corporate/CorporateCarRental";

// Old URL — redirects to /services/corporate-car-rental; renders the same page if reached.
// Content = CMS override for slug "corporate" if one exists, else src/content/serviceDefaults.js;
// layout = src/components/landing/corporate (same style as the other service pages).
export default function Page() { return <ServicePageView slug="corporate" Layout={CorporateCarRental} />; }
