import type { FastifyInstance } from "fastify";
import { timingSafeEqual, createHash } from "crypto";
import { db } from "../db.js";
import { sendProblem } from "../problem.js";

declare module "fastify" {
  interface FastifyRequest {
    authenticatedOwner?: string;
  }
}

export function registerAuth(app: FastifyInstance) {
  const legacyApiKey = (process.env.REPOSENTINEL_API_KEY ?? "").trim();

  app.addHook("onRequest", async (req, reply) => {
    const url = String(req.url ?? "");
    const method = String(req.method ?? "GET").toUpperCase();
    const path = url.startsWith("/v1/") ? url.slice("/v1".length) : url;
    const isPublic =
      (method === "GET" && (path === "/health" || path === "/openapi.json" || path === "/docs" || path === "/")) ||
      (method === "POST" && path === "/github/webhook");

    if (isPublic) return;

    const h = String(req.headers.authorization ?? "");
    if (!h.startsWith("Bearer ")) {
      return sendProblem(reply, req, {
        status: 401,
        title: "Unauthorized",
        detail: "Missing or invalid API key",
      });
    }

    const providedKey = h.slice("Bearer ".length).trim();
    if (!providedKey) {
      return sendProblem(reply, req, {
        status: 401,
        title: "Unauthorized",
        detail: "Missing or invalid API key",
      });
    }

    // Try org-scoped API keys first
    const keyHash = hashApiKey(providedKey);
    try {
      const { rows } = await db.query(
        "SELECT owner FROM api_keys WHERE key_hash=$1",
        [keyHash],
      );
      if (rows.length > 0) {
        req.authenticatedOwner = rows[0].owner;
        // Update last_used_at asynchronously
        db.query("UPDATE api_keys SET last_used_at=NOW() WHERE key_hash=$1", [keyHash]).catch(() => {});
        return;
      }
    } catch (err) {
      // Table may not exist yet during migration, fall through to legacy auth
    }

    // Fall back to legacy single API key
    if (legacyApiKey && constantTimeEqual(providedKey, legacyApiKey)) {
      // Legacy mode: no owner scoping (security risk, but maintains backward compatibility)
      req.authenticatedOwner = undefined;
      return;
    }

    return sendProblem(reply, req, {
      status: 401,
      title: "Unauthorized",
      detail: "Missing or invalid API key",
    });
  });
}

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Perform a dummy comparison to prevent timing attacks on length
    timingSafeEqual(Buffer.from(a.padEnd(64, "0")), Buffer.from(b.padEnd(64, "0")));
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

