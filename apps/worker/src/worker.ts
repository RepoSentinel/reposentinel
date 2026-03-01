import "dotenv/config";
import { Worker } from "bullmq";
import { Pool } from "pg";
import type { ScanRequest, ScanResult } from "@reposentinel/shared";
import { analyze } from "@reposentinel/engine-stub";

const db = new Pool({ connectionString: process.env.DATABASE_URL });

type ScanStatus = "queued" | "running" | "done" | "failed";

type ScanJob = {
  scanId: string;
  repoId: string;
  dependencyGraph: unknown;
};

const connection = { url: process.env.REDIS_URL! };

new Worker<ScanJob>(
  "scan-queue",
  async (job) => {
    const { scanId, repoId, dependencyGraph } = job.data;

    // 1) atomic transition queued -> running
    const moved = await transitionStatus(scanId, "queued", "running");
    if (!moved) {
      // מישהו כבר טיפל בזה / הסטטוס השתנה
      return { skipped: true };
    }

    // 2) analyze (outside transaction)
    try {
      const req: ScanRequest = { repoId, dependencyGraph };
      const result = await analyze(req);

      // 3) write done only if still running
      const { rowCount } = await db.query(
        "UPDATE scans SET status='done', result=$2::jsonb, updated_at=NOW() WHERE id=$1 AND status='running'",
        [scanId, JSON.stringify(result)],
      );

      if (rowCount !== 1) {
        throw new Error("Scan is not running; refusing to overwrite result");
      }

      return { ok: true };
    } catch (e: any) {
      await db.query(
        "UPDATE scans SET status='failed', error=$2, updated_at=NOW() WHERE id=$1 AND status='running'",
        [scanId, String(e?.message ?? e)],
      );
      throw e;
    }
  },
  { connection },
);

async function transitionStatus(
  scanId: string,
  from: ScanStatus,
  to: ScanStatus,
) {
  const { rowCount } = await db.query(
    "UPDATE scans SET status=$3, updated_at=NOW() WHERE id=$1 AND status=$2",
    [scanId, from, to],
  );
  return rowCount === 1;
}

function hashToScore(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++)
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return (h % 61) + 20; // 20..80
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}
