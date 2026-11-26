import ServicePageView from "../../../src/components/ServicePageView";

// "Corporate Car Rental" page (moved here from /services/corporate, which now 301-redirects).
// Content = CMS override for slug "corporate" if one exists, else src/content/serviceDefaults.js.
export default function Page() { return <ServicePageView slug="corporate" />; }
