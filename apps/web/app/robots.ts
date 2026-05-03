import type { MetadataRoute } from "next";

import { getSiteOrigin } from "../lib/siteOrigin";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin()?.origin ?? "https://mergesignal-web.fly.dev";
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
