import ServicePageView from "../../../src/components/ServicePageView";
import CorporateCarRental from "../../../src/components/landing/corporate/CorporateCarRental";

// "Corporate Car Rental" page (moved here from /services/corporate, which now 301-redirects).
// Content = CMS override for slug "corporate" if one exists, else src/content/serviceDefaults.js;
// layout = src/components/landing/corporate (same style as the other service pages).
export default function Page() { return <ServicePageView slug="corporate" Layout={CorporateCarRental} />; }
