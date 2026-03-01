import type { ScanRequest, ScanResult } from "@reposentinel/shared";

export async function analyze(req: ScanRequest): Promise<ScanResult> {
  const base = hashToScore(req.repoId);
  return {
    totalScore: clamp(base + 10),
    layerScores: {
      security: clamp(base + 15),
      maintainability: clamp(base + 5),
      ecosystem: clamp(base - 5),
      upgradeImpact: clamp(base + 20),
    },
    findings: [
      {
        id: "stub-finding",
        title: "Engine stub finding",
        description: "Placeholder result produced by engine-stub.",
        severity: "medium",
        packageName: "example-package",
        recommendation: "Replace this stub with real analysis logic.",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

function hashToScore(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return (h % 61) + 20; // 20..80
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}