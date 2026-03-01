export type LayerScores = {
  security: number;          // 0-100
  maintainability: number;   // 0-100
  ecosystem: number;         // 0-100
  upgradeImpact: number;     // 0-100
};

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type Finding = {
  id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  packageName: string;
  recommendation?: string;
};

export type ScanRequest = {
  repoId: string;
  dependencyGraph: unknown; // נחליף בהמשך למבנה אמיתי
};

export type ScanResult = {
  totalScore: number;       // 0-100
  layerScores: LayerScores;
  findings: Finding[];
  generatedAt: string;
};