// Cloudflare Worker entry — runs before the static site is served.
//  1) www.abhicabs24x7.com/*  →  301  https://abhicabs24x7.com/*   (canonical host, per SEO docs)
//  2) everything else is served from the pre-built static files (dist/client),
//     with public/_redirects and public/_headers still applied by Cloudflare.
const CANONICAL_HOST = "abhicabs24x7.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${CANONICAL_HOST}`) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
