import type { MetadataRoute } from "next";

import { getSiteOrigin } from "../lib/siteOrigin";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin()?.origin ?? "https://mergesignal-web.fly.dev";
  const now = new Date();

  const paths = [
    "",
    "/getting-started",
    "/privacy",
    "/terms",
    "/api-terms",
    "/contact",
  ];

  return paths.map((path) => ({
    url: `${origin}${path || "/"}`,
    lastModified: now,
    changeFrequency:
      path === "/getting-started" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path === "/getting-started" ? 0.95 : 0.5,
  }));
}
