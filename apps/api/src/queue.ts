import { Queue } from "bullmq";

const connection = {
  url: process.env.REDIS_URL!,
};

export type ScanJob = {
  scanId: string;
  repoId: string;
  dependencyGraph: unknown;
};

export const SCAN_QUEUE_NAME = "scan-queue";

export const scanQueue = new Queue<ScanJob>(SCAN_QUEUE_NAME, {
  connection,
});