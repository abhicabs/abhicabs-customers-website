import { makeCmsPageData } from "../../src/lib/serviceData";
// CMS content for the blog listing, fetched at build time so the pre-rendered HTML includes it.
// Vike also applies this file to /blogs/@slug; article pages don't use it, so they skip the fetch.
const listingData = makeCmsPageData("blogs");
export async function data(pageContext) {
  if (pageContext.routeParams?.slug) return { cmsPages: null };
  return listingData();
}
