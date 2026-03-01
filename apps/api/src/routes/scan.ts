import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { db } from "../db";
import { scanQueue } from "../queue";
import type { ScanRequest } from "@reposentinel/shared";

type ScanStatus = "queued" | "running" | "done" | "failed";

export async function scanRoutes(app: FastifyInstance) {
  // Create scan (queued) + enqueue job
  app.post("/scan", async (req, reply) => {
    const body = req.body as ScanRequest;
    const scanId = randomUUID();

    // Transaction קצר: יצירת רשומה במצב queued
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      await client.query(
        "INSERT INTO scans (id, repo_id, status) VALUES ($1, $2, 'queued')",
        [scanId, body.repoId],
      );

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      client.release();
    }

    // הכנסת Job ל-Redis Queue
    await scanQueue.add(
      "scan",
      {
        scanId,
        repoId: body.repoId,
        dependencyGraph: body.dependencyGraph,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // מחזירים מיד 202
    return reply.code(202).send({
      scanId,
      status: "queued" as ScanStatus,
    });
  });

  // Get scan status/result
  app.get("/scan/:id", async (req, reply) => {
    const id = (req.params as any).id as string;

    const { rows } = await db.query(
      "SELECT id, repo_id, status, result, error, created_at, updated_at FROM scans WHERE id=$1",
      [id],
    );

    if (rows.length === 0) {
      return reply.code(404).send({ message: "Not found" });
    }

    return rows[0];
  });
}
