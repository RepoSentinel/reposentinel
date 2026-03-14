import { FastifyInstance } from "fastify";
import { db } from "../db.js";
import type { ScanRequest } from "@reposentinel/shared";
import { createScanAndEnqueue } from "../services/scanService.js";

type ScanStatus = "queued" | "running" | "done" | "failed";

export async function scanRoutes(app: FastifyInstance) {
  app.post("/scan", async (req, reply) => {
    const body = req.body as ScanRequest;

    try {
      const { scanId } = await createScanAndEnqueue({
        repoId: body.repoId,
        dependencyGraph: body.dependencyGraph,
        lockfile: body.lockfile,
        source: "manual",
      });

      return reply.code(202).send({ scanId, status: "queued" as ScanStatus });
    } catch (e: any) {
      const code = Number(e?.statusCode ?? 500);
      if (code === 413) return reply.code(413).send({ message: "lockfile too large" });
      if (code === 429) return reply.code(429).send({ message: "scan quota exceeded" });
      throw e;
    }
  });

  app.get("/scan/:id", async (req, reply) => {
    const id = (req.params as any).id as string;

    const { rows } = await db.query(
      "SELECT id, repo_id, status, total_score, layer_security, layer_maintainability, layer_ecosystem, layer_upgrade_impact, methodology_version, result_generated_at, result, error, created_at, updated_at FROM scans WHERE id=$1",
      [id],
    );

    if (rows.length === 0) {
      return reply.code(404).send({ message: "Not found" });
    }

    return rows[0];
  });

  app.get("/scans", async (req, reply) => {
    const { repoId, limit } = req.query as any;
    if (!repoId || typeof repoId !== "string") {
      return reply.code(400).send({ message: "repoId is required" });
    }

    const n = Math.max(1, Math.min(200, Number(limit ?? 50)));

    const { rows } = await db.query(
      "SELECT id, repo_id, status, total_score, layer_security, layer_maintainability, layer_ecosystem, layer_upgrade_impact, methodology_version, result_generated_at, created_at, updated_at FROM scans WHERE repo_id=$1 ORDER BY created_at DESC LIMIT $2",
      [repoId, n],
    );

    return { repoId, scans: rows };
  });
}
