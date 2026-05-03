/**
 * Public web origin for canonical URLs, sitemap, and robots.
 * Set `NEXT_PUBLIC_SITE_URL` (no trailing slash), e.g. `https://mergesignal-web.fly.dev`.
 */
export function getSiteOrigin(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!raw) return undefined;
  try {
    return new URL(raw);
  } catch {
    return undefined;
  }
}
