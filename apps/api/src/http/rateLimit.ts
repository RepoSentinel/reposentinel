import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { Redis } from "ioredis";

export async function registerRateLimit(app: FastifyInstance) {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

  // Create Redis client for rate limiting
  const redis = new Redis(redisUrl, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 5000,
  });

  let redisAvailable = false;

  // Try to connect to Redis
  try {
    await redis.connect();
    await redis.ping();
    redisAvailable = true;
    app.log.info("Rate limiter connected to Redis");
  } catch (err) {
    app.log.warn(
      { err },
      "Rate limiter cannot connect to Redis, rate limiting will be disabled",
    );
    await redis.disconnect();
  }

  redis.on("error", (err) => {
    app.log.error({ err }, "Rate limiter Redis connection error");
  });

  // Base rate limiter configuration
  await app.register(rateLimit, {
    max: async (req) => {
      const url = String(req.url ?? "");
      const method = String(req.method ?? "GET").toUpperCase();
      const path = url.startsWith("/v1/") ? url.slice("/v1".length) : url;

      // Public endpoints have more restrictive limits
      const isPublic =
        (method === "GET" &&
          (path === "/health" ||
            path === "/openapi.json" ||
            path === "/docs" ||
            path === "/")) ||
        (method === "POST" && path === "/github/webhook");

      if (isPublic) {
        // Public endpoints: 60 requests per minute per IP
        return Number(process.env.RATE_LIMIT_PUBLIC ?? 60);
      }

      // Authenticated endpoints: 1000 requests per minute per API key
      return Number(process.env.RATE_LIMIT_AUTHENTICATED ?? 1000);
    },
    timeWindow: "1 minute",
    redis: redisAvailable ? redis : undefined,
    nameSpace: "mergesignal:ratelimit:",
    keyGenerator: (req) => {
      // Use API key for authenticated requests, IP for public endpoints
      const authHeader = String(req.headers.authorization ?? "");
      if (authHeader.startsWith("Bearer ")) {
        const apiKey = authHeader.slice("Bearer ".length).trim();
        if (apiKey) {
          // Use first 16 chars of API key as identifier (enough to be unique)
          return `key:${apiKey.substring(0, 16)}`;
        }
      }
      // Fallback to IP address
      return `ip:${req.ip}`;
    },
    errorResponseBuilder: (req, context) => {
      return {
        type: "about:blank",
        status: 429,
        title: "Too Many Requests",
        detail: `Rate limit exceeded. Retry after ${context.after}`,
        instance: req.url,
      };
    },
    skipOnError: true,
  });

  // Graceful shutdown
  app.addHook("onClose", async () => {
    if (redisAvailable) {
      await redis.quit();
    }
  });
}
