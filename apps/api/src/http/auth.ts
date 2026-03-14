import type { FastifyInstance } from "fastify";
import { sendProblem } from "../problem.js";

export function registerAuth(app: FastifyInstance) {
  const apiKey = (process.env.REPOSENTINEL_API_KEY ?? "").trim();
  if (!apiKey) return;

  app.addHook("onRequest", async (req, reply) => {
    const url = String(req.url ?? "");
    const method = String(req.method ?? "GET").toUpperCase();
    const path = url.startsWith("/v1/") ? url.slice("/v1".length) : url;
    const isPublic =
      (method === "GET" && (path === "/health" || path === "/openapi.json" || path === "/docs" || path === "/")) ||
      (method === "POST" && path === "/github/webhook");

    if (isPublic) return;

    const h = String(req.headers.authorization ?? "");
    const ok = h.startsWith("Bearer ") && h.slice("Bearer ".length).trim() === apiKey;
    if (!ok) {
      return sendProblem(reply, req, {
        status: 401,
        title: "Unauthorized",
        detail: "Missing or invalid API key",
      });
    }
  });
}

