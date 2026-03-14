import { Queue } from "bullmq";
import type { ScanLockfileInput } from "@reposentinel/shared";

const connection = {
  url: process.env.REDIS_URL!,
};

export type ScanJob = {
  scanId: string;
  repoId: string;
  dependencyGraph: unknown;
  lockfile?: ScanLockfileInput;
};

export const SCAN_QUEUE_NAME = "scan-queue";

export const scanQueue = new Queue<ScanJob>(SCAN_QUEUE_NAME, {
  connection,
});