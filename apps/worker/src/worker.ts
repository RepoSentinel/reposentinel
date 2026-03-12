import "dotenv/config";
import { Worker } from "bullmq";
import { Pool } from "pg";
import type { ScanRequest } from "@reposentinel/shared";
import { analyze } from "@reposentinel/engine-stub";

const db = new Pool({ connectionString: process.env.DATABASE_URL });

type ScanStatus = "queued" | "running" | "done" | "failed";

type ScanJob = {
  scanId: string;
  repoId: string;
  dependencyGraph: unknown;
};

const connection = { url: process.env.REDIS_URL! };

const workerId = `pid:${process.pid}`;
const heartbeatEveryMs = Number(process.env.SCAN_HEARTBEAT_MS ?? 15000);
const staleAfterMs = Number(process.env.SCAN_STALE_AFTER_MS ?? 60000);
const reapEveryMs = Number(process.env.SCAN_REAP_INTERVAL_MS ?? 30000);

setInterval(() => {
  void requeueStaleRunningScans();
}, reapEveryMs);

new Worker<ScanJob>(
  "scan-queue",
  async (job) => {
    const { scanId, repoId, dependencyGraph } = job.data;

    const moved = await transitionToRunning(scanId);
    if (!moved) {
      return { skipped: true };
    }

    const heartbeat = setInterval(() => {
      void db.query(
        "UPDATE scans SET heartbeat_at=NOW() WHERE id=$1 AND status='running'",
        [scanId],
      );
    }, heartbeatEveryMs);

    try {
      const req: ScanRequest = { repoId, dependencyGraph };
      const delayMs = Number(process.env.SCAN_SIMULATE_DELAY_MS ?? 0);
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      const result = await analyze(req);

      const { rowCount } = await db.query(
        "UPDATE scans SET status='done', result=$2::jsonb, finished_at=NOW(), heartbeat_at=NULL, updated_at=NOW() WHERE id=$1 AND status='running'",
        [scanId, JSON.stringify(result)],
      );

      if (rowCount !== 1) {
        throw new Error("Scan is not running; refusing to overwrite result");
      }

      return { ok: true };
    } catch (e: any) {
      await db.query(
        "UPDATE scans SET status='failed', error=$2, finished_at=NOW(), heartbeat_at=NULL, updated_at=NOW() WHERE id=$1 AND status='running'",
        [scanId, String(e?.message ?? e)],
      );
      throw e;
    } finally {
      clearInterval(heartbeat);
    }
  },
  { connection },
);

async function transitionToRunning(scanId: string) {
  const { rowCount } = await db.query(
    "UPDATE scans SET status='running', attempt=attempt+1, worker_id=$2, started_at=COALESCE(started_at, NOW()), heartbeat_at=NOW(), updated_at=NOW() WHERE id=$1 AND status='queued'",
    [scanId, workerId],
  );
  return rowCount === 1;
}

async function requeueStaleRunningScans() {
  const { rowCount } = await db.query(
    "UPDATE scans SET status='queued', worker_id=NULL, updated_at=NOW() WHERE status='running' AND heartbeat_at IS NOT NULL AND heartbeat_at < NOW() - ($1::int * INTERVAL '1 millisecond')",
    [staleAfterMs],
  );
  return rowCount;
}
